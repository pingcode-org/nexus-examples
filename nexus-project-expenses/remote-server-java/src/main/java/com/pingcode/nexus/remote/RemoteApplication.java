package com.pingcode.nexus.remote;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// 启动入口。Nexus Remote 的 A/B/C 示例位于 controller 目录。
@SpringBootApplication
public class RemoteApplication {
    public static void main(String[] args) {
        SpringApplication.run(RemoteApplication.class, args);
    }
}
