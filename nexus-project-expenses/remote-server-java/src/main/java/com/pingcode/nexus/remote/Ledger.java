package com.pingcode.nexus.remote;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.JsonNode;
import static org.springframework.http.HttpStatus.*;

@Component
public class Ledger {
    public record Category(String id, String name) {}
    public record Scope(String tenant, String projectId) {}
    public record Input(long amount_minor, String incurred_on, String category, String purpose) {}
    public record Expense(String id, long amount_minor, String incurred_on, String category,
                          String purpose, String created_by, long created_at) {}
    public record Result(List<Expense> items, long total_minor) {}

    public static final List<Category> CATEGORIES = List.of(
            new Category("purchase", "采购"), new Category("travel", "交通"),
            new Category("service", "服务"), new Category("other", "其他"));
    private final Map<Scope, Map<String, Expense>> ledgers = new HashMap<>();

    private Map<String, Expense> records(String tenant, String projectId) {
        return ledgers.computeIfAbsent(new Scope(tenant, projectId), ignored -> new LinkedHashMap<>());
    }

    public static Input parse(JsonNode body) {
        try {
            var input = new Input(
                    body.path("amount_minor").decimalValue().longValueExact(),
                    body.path("incurred_on").stringValue(),
                    body.path("category").stringValue(),
                    body.path("purpose").stringValue().strip());
            boolean validAmount = input.amount_minor() >= 1 && input.amount_minor() <= 1_000_000_000_000L;
            boolean validDate = input.incurred_on().matches("[0-9]{4}-[0-9]{2}-[0-9]{2}") &&
                    LocalDate.parse(input.incurred_on()).toString().equals(input.incurred_on());
            boolean validCategory = CATEGORIES.stream().anyMatch(category -> category.id().equals(input.category()));
            boolean validPurpose = !input.purpose().isEmpty() && input.purpose().length() <= 500;
            if (validAmount && validDate && validCategory && validPurpose) return input;
        } catch (RuntimeException error) { /* 数字、日期或字段类型无效，统一返回下面的 422。 */ }
        throw new ResponseStatusException(UNPROCESSABLE_CONTENT, "请填写有效的日期、金额、类别和用途（最多 500 字）");
    }

    public synchronized Result list(String tenant, String projectId) {
        var items = new ArrayList<>(records(tenant, projectId).values());
        Collections.reverse(items);
        long total = items.stream().mapToLong(Expense::amount_minor).sum();
        return new Result(List.copyOf(items), total);
    }

    // 示例账本：每次新增生成 ID，删除直接移除记录，数据仅保存在内存中。
    public synchronized Expense create(String tenant, String projectId, String userId, Input input) {
        var created = new Expense(
                UUID.randomUUID().toString(), input.amount_minor(), input.incurred_on(),
                input.category(), input.purpose(), userId, Instant.now().getEpochSecond());
        records(tenant, projectId).put(created.id(), created);
        return created;
    }

    public synchronized Map<String, Boolean> remove(String tenant, String projectId, String userId, String id) {
        var entries = records(tenant, projectId);
        var expense = entries.get(id);
        if (expense == null) throw new ResponseStatusException(NOT_FOUND, "费用记录不存在");
        if (!expense.created_by().equals(userId)) {
            throw new ResponseStatusException(FORBIDDEN, "只能删除本人创建的费用");
        }
        entries.remove(id);
        return Map.of("deleted", true);
    }
}
