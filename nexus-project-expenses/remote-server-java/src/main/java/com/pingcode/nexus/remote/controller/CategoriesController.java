package com.pingcode.nexus.remote.controller;

import com.pingcode.nexus.remote.Ledger;
import com.pingcode.nexus.remote.Nexus;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

// A：remote.request(remoteKey) → GET /categories。
// 浏览器直连 Remote，校验 NIT 并确认当前是项目经费页面；不使用 OAuth。
@RestController
public class CategoriesController {
    private final Nexus nexus;

    public CategoriesController(Nexus nexus) { this.nexus = nexus; }

    @GetMapping("/categories")
    Map<String, Object> categories(HttpServletRequest request) {
        var context = nexus.verifyNit(request.getHeader("Authorization"));
        request.setAttribute("nexus.invocationId", context.at("/invocation/id").asString());
        nexus.projectUser(context, null);
        return Map.of("categories", Ledger.CATEGORIES);
    }
}
