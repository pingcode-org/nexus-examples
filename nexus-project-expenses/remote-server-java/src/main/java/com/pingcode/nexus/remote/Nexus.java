package com.pingcode.nexus.remote;

import java.net.URI;
import java.net.http.HttpClient;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.JwtIssuerValidator;
import org.springframework.security.oauth2.jwt.JwtTimestampValidator;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import static org.springframework.http.HttpStatus.*;

@Component
// 本仓库实现的服务端辅助类；官方 Bridge API 的调用见 web/main/src/api.ts。
public class Nexus {
    public record Project(String id, String name) {}

    private final String environment;
    private final String apiBase;
    private final NimbusJwtDecoder decoder;
    private final RestClient pingcode;
    private final JsonMapper mapper;

    public Nexus(Environment env, JsonMapper mapper) {
        this.mapper = mapper;
        environment = env.getProperty("NEXUS_ENVIRONMENT", "development");
        apiBase = platformUrl(required(env, "PINGCODE_API_BASE_URL")).replaceAll("/+$", "");
        var http = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(2))
                .followRedirects(HttpClient.Redirect.NEVER)
                .build();
        var requests = new JdkClientHttpRequestFactory(http);
        requests.setReadTimeout(Duration.ofMillis(2500));
        pingcode = RestClient.builder().requestFactory(requests).build();
        decoder = NimbusJwtDecoder.withJwkSetUri(platformUrl(required(env, "NEXUS_JWKS_URL")))
                .jwsAlgorithm(SignatureAlgorithm.RS256)
                .restOperations(new RestTemplate(requests))
                .build();
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(
                new JwtTimestampValidator(Duration.ZERO),
                new JwtIssuerValidator("nexus/invocation-token")));
    }

    // 返回原始 NIT context。它的字段路径与 Nexus 文档一致。
    public JsonNode verifyNit(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new ResponseStatusException(UNAUTHORIZED, "缺少 Nexus 调用令牌");
        }
        try {
            var jwt = decoder.decode(authorization.substring(7));
            if (!jwt.getAudience().contains("nexus") || jwt.getExpiresAt() == null ||
                    !jwt.getExpiresAt().isAfter(Instant.now())) {
                throw new IllegalArgumentException();
            }
            JsonNode context = mapper.valueToTree(jwt.getClaim("context"));
            if (!environment.equals(context.at("/environment/type").asString(""))) {
                throw new ResponseStatusException(UNAUTHORIZED, "NIT 环境不匹配");
            }
            for (String path : List.of("/app/id", "/environment/id", "/team/id", "/installation/id", "/invocation/id")) {
                if (!context.at(path).isString() || context.at(path).stringValue().isEmpty()) {
                    throw new ResponseStatusException(UNAUTHORIZED, "NIT 缺少必要上下文");
                }
            }
            return context;
        } catch (ResponseStatusException error) {
            throw error;
        } catch (Exception error) {
            throw new ResponseStatusException(UNAUTHORIZED, "无法验证 Nexus 调用身份，请检查 JWKS 和令牌有效期", error);
        }
    }

    // 项目经费的业务授权示例：更换扩展点时，应调整 key、target 和 context 字段。
    public String projectUser(JsonNode context, String requestedProjectId) {
        String userId = context.at("/user/id").asString("");
        String projectId = context.at("/extension/data/project/id").asString("");
        String pageKey = context.at("/extension/key").asString("");
        boolean allowedPage = "expenses-remote".equals(pageKey) ||
                "expenses-function".equals(pageKey);
        boolean onProjectPage = allowedPage &&
                "pcm:pjm:project:page".equals(context.at("/extension/target").asString(""));
        boolean sameProject = requestedProjectId == null || requestedProjectId.equals(projectId);
        if (!onProjectPage || userId.isEmpty() || projectId.isEmpty() || !sameProject) {
            throw new ResponseStatusException(FORBIDDEN, "请求与当前项目页面不匹配");
        }
        return userId;
    }

    // 费用业务使用的隔离键；来源都是已验签的 NIT context。
    public String tenant(JsonNode context) {
        return mapper.writeValueAsString(List.of(
                context.at("/app/id"),
                context.at("/environment/id"),
                context.at("/team/id"),
                context.at("/installation/id")));
    }

    // token 是 Nexus 下发的用户/应用 OAuth 令牌，不是 Authorization 中的 NIT。
    public Project getProject(String apiBaseUrl, String token, String projectId) {
        if (apiBaseUrl == null || !apiBase.equals(apiBaseUrl.replaceAll("/+$", ""))) {
            throw new ResponseStatusException(FORBIDDEN, "平台 API 地址与配置不一致");
        }
        if (token == null || token.isEmpty()) {
            throw new ResponseStatusException(FORBIDDEN, "缺少 Nexus OAuth 令牌，请检查 Remote / Endpoint auth 和 scope");
        }

        ResponseEntity<String> response;
        try {
            response = pingcode.get()
                    .uri(apiBase + "/v2/pjm/projects/{id}", projectId)
                    .header("Authorization", "Bearer " + token)
                    .header("Accept", "application/json")
                    .retrieve()
                    .toEntity(String.class);
        } catch (RestClientResponseException error) {
            int status = error.getStatusCode().value();
            var responseStatus = BAD_GATEWAY;
            if (status == 401) responseStatus = UNAUTHORIZED;
            else if (status == 403 || status == 404) responseStatus = FORBIDDEN;
            throw new ResponseStatusException(responseStatus, "当前身份无法读取项目（PingCode " + status + "）", error);
        } catch (RestClientException error) {
            throw new ResponseStatusException(SERVICE_UNAVAILABLE, "暂时无法访问 PingCode", error);
        }
        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new ResponseStatusException(SERVICE_UNAVAILABLE, "暂时无法访问 PingCode");
        }

        JsonNode project;
        try {
            project = mapper.readTree(response.getBody());
            if (!projectId.equals(project.path("id").stringValue()) || !project.path("name").isString()) {
                throw new IllegalArgumentException();
            }
        } catch (Exception error) {
            throw new ResponseStatusException(BAD_GATEWAY, "项目接口返回了无效数据", error);
        }
        // 以平台读取结果判定访问权限，示例不额外限制项目业务状态。
        return new Project(projectId, project.path("name").stringValue());
    }

    private static String required(Environment env, String key) {
        String value = env.getProperty(key);
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("缺少配置 " + key);
        }
        return value.trim();
    }

    private static String platformUrl(String value) {
        URI uri = URI.create(value);
        boolean loopback = Set.of("localhost", "127.0.0.1").contains(uri.getHost());
        if (uri.getHost() == null ||
                (!"https".equals(uri.getScheme()) && !("http".equals(uri.getScheme()) && loopback)) ||
                uri.getUserInfo() != null || uri.getQuery() != null || uri.getFragment() != null) {
            throw new IllegalArgumentException("平台地址必须为 HTTPS 地址，本地测试仅允许 loopback HTTP");
        }
        return value;
    }
}
