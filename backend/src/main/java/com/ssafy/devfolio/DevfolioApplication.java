package com.ssafy.devfolio;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class DevfolioApplication {

    public static void main(String[] args) {
        SpringApplication.run(DevfolioApplication.class, args);
    }

}
