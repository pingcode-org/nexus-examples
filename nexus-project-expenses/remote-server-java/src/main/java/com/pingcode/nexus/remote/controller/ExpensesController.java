package com.pingcode.nexus.remote.controller;

import com.pingcode.nexus.remote.Ledger;
import com.pingcode.nexus.remote.Nexus;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.JsonNode;

// B：Bridge remote.invoke() → expenses-endpoint；D：函数 remote.invoke(remoteKey)。
// 两条链复用 GET 和同一段校验，用户 OAuth 分别由 Endpoint / Remote auth 配置。
@RestController
public class ExpensesController {
    private final Nexus nexus;
    private final Ledger ledger;
    record LedgerView(Nexus.Project project, List<Ledger.Expense> items, long total_minor) {}
    private record ProjectAccess(String userId, String tenant, Nexus.Project project) {}

    public ExpensesController(Nexus nexus, Ledger ledger) {
        this.nexus = nexus;
        this.ledger = ledger;
    }

    // B 的共用接入流程：验签 → 页面授权 → 用户 OAuth 回调。下面三个映射只处理费用业务。
    private ProjectAccess authorizeProject(HttpServletRequest request, String projectId) {
        var context = nexus.verifyNit(request.getHeader("Authorization"));
        request.setAttribute("nexus.invocationId", context.at("/invocation/id").asString());
        String userId = nexus.projectUser(context, projectId);
        String userToken = request.getHeader("x-nexus-user-token");
        String apiBase = request.getHeader("x-nexus-api-base-url");
        var project = nexus.getProject(apiBase, userToken, projectId);
        return new ProjectAccess(userId, nexus.tenant(context), project);
    }

    @GetMapping("/projects/{projectId}/expenses")
    LedgerView list(@PathVariable String projectId, HttpServletRequest request) {
        var access = authorizeProject(request, projectId);
        var result = ledger.list(access.tenant(), access.project().id());
        return new LedgerView(access.project(), result.items(), result.total_minor());
    }

    @PostMapping(value = "/projects/{projectId}/expenses", consumes = "application/json")
    Ledger.Expense create(
            @PathVariable String projectId,
            @RequestBody JsonNode body,
            HttpServletRequest request) {
        var access = authorizeProject(request, projectId);
        return ledger.create(access.tenant(), access.project().id(), access.userId(), Ledger.parse(body));
    }

    @DeleteMapping("/projects/{projectId}/expenses/{id}")
    Map<String, Boolean> delete(
            @PathVariable String projectId,
            @PathVariable String id,
            HttpServletRequest request) {
        var access = authorizeProject(request, projectId);
        return ledger.remove(access.tenant(), access.project().id(), access.userId(), id);
    }
}
