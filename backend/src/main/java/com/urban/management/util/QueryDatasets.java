package com.urban.management.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class QueryDatasets {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/urban_management";
        String username = "postgres";
        String password = "hst135178";

        try {
            // 加载驱动
            Class.forName("org.postgresql.Driver");
            
            // 建立连接
            Connection conn = DriverManager.getConnection(url, username, password);
            
            // 创建查询语句
            Statement stmt = conn.createStatement();
            String sql = "SELECT id, name, storage_path FROM training_dataset";
            ResultSet rs = stmt.executeQuery(sql);
            
            // 处理结果
            System.out.println("可用的训练数据集：");
            System.out.println("ID | 名称 | 存储路径");
            System.out.println("--------------------------------------");
            
            boolean hasData = false;
            while (rs.next()) {
                hasData = true;
                int id = rs.getInt("id");
                String name = rs.getString("name");
                String storagePath = rs.getString("storage_path");
                
                System.out.printf("%d | %s | %s\n", id, name, storagePath);
            }
            
            if (!hasData) {
                System.out.println("数据库中没有可用的训练数据集");
            }
            
            // 关闭资源
            rs.close();
            stmt.close();
            conn.close();
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}