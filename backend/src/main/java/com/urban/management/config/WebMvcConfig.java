package com.urban.management.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

/**
 * Web MVC配置类
 * 用于配置静态资源映射
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 配置静态资源映射，允许访问上传的照片
        String uploadDir = System.getProperty("user.dir") + "/../uploads";
        System.out.println("Upload directory: " + uploadDir);
        
        // 确保上传目录存在
        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }
        
        // 映射 /uploads/** 路径到本地的 uploads 目录
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadDir + File.separator)
                .setCachePeriod(3600);
    }
}
