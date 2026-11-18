package com.pingcode.nexus.remote.controller;

import com.pingcode.nexus.remote.Nexus;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.JsonNode;
import static org.springframework.http.HttpStatus.*;

// C：event.triggers → project-events → POST /events/project。
// 平台投递事件，project-events.auth.appToken 提供应用令牌。
@RestController
public class ProjectEventsController {
    private static final Logger LOG = LoggerFactory.getLogger(ProjectEventsController.class);
    private final Nexus nexus;

    public ProjectEventsController(Nexus nexus) {
        this.nexus = nexus;
    }

    @PostMapping(value = "/events/project", consumes = "application/json")
    Map<String, Object> event(@RequestBody JsonNode body, HttpServletRequest request) {
        var context = nexus.verifyNit(request.getHeader("Authorization"));
        request.setAttribute("nexus.invocationId", context.at("/invocation/id").asString());
        if (!"project-updated".equals(context.at("/event/trigger/key").asString("")) ||
                !"system".equals(context.at("/event/trigger/type").asString(""))) {
            throw new ResponseStatusException(FORBIDDEN, "仅接收 Nexus 项目事件");
        }
        var id = body.at("/payload/data/id");
        if (!"pce:pjm:project:updated".equals(body.path("event_type").asString("")) ||
                !id.isString() || id.stringValue().isEmpty()) {
            throw new ResponseStatusException(UNPROCESSABLE_CONTENT, "无效的项目更新事件");
        }
        String appToken = request.getHeader("x-nexus-app-token");
        String apiBase = request.getHeader("x-nexus-api-base-url");
        var project = nexus.getProject(apiBase, appToken, id.stringValue());
        LOG.info("Nexus project event {} {} {}",
                context.at("/invocation/id").asString(), project.id(), project.name());
        return Map.of("received", true, "project", project);
    }
}
