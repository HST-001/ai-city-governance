package com.urban.management.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web配置类，用于配置静态资源服务
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 映射/uploads/**路径到实际存储位置
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:../uploads/");
    }
}
