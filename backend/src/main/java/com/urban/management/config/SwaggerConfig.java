package com.urban.management.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("街道更新维护治理系统 API文档")
                        .version("1.0.0")
                        .description("街道更新维护治理系统API接口文档，包含用户认证、照片管理、AI分析等功能接口")
                        .license(new License().name("Apache 2.0").url("http://springdoc.org")));
    }
}
