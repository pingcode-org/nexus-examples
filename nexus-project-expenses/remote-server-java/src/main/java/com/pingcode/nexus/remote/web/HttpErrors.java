package com.pingcode.nexus.remote.web;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.ErrorResponse;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

// HTTP 边界统一转换错误和记录失败，不输出令牌、完整异常或平台响应。
@RestControllerAdvice
public class HttpErrors {
    private static final Logger LOG = LoggerFactory.getLogger(HttpErrors.class);

    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<?> known(ResponseStatusException error, HttpServletRequest request) {
        return failure(request, error.getStatusCode().value(), error.getReason(), error);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<?> malformed(HttpMessageNotReadableException error, HttpServletRequest request) {
        return failure(request, 400, "请求 JSON 无效", error);
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    ResponseEntity<?> unsupported(HttpMediaTypeNotSupportedException error, HttpServletRequest request) {
        return failure(request, 415, "请使用 application/json 请求体", error);
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<?> unknown(Exception error, HttpServletRequest request) {
        int status = error instanceof ErrorResponse response ? response.getStatusCode().value() : 500;
        return failure(request, status, "服务暂时不可用", error);
    }

    private ResponseEntity<?> failure(HttpServletRequest request, int status, String message, Exception error) {
        Object invocationId = request.getAttribute("nexus.invocationId");
        String cause = error.getCause() == null
                ? error.getClass().getSimpleName() : error.getCause().getClass().getSimpleName();
        LOG.warn("Nexus request failed method={} path={} invocationId={} status={} message={} cause={}",
                request.getMethod(), request.getRequestURI(), invocationId == null ? "unverified" : invocationId,
                status, message, cause);
        return ResponseEntity.status(status).body(Map.of("error", Map.of("message", message)));
    }
}
