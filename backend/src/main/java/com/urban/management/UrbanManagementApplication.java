package com.urban.management;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class UrbanManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(UrbanManagementApplication.class, args);
    }


}
