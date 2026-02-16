package com.urban.management.utils;

import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * 文件上传工具类
 */
public class FileUploadUtils {

    // 允许的图片格式
    public static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
            ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"
    );

    /**
     * 保存上传的文件
     *
     * @param file        上传的文件
     * @param uploadDir   上传目录
     * @param subDir      子目录（按日期组织）
     * @return 文件保存后的相对路径
     * @throws IOException IO异常
     */
    public static String saveFile(MultipartFile file, String uploadDir, boolean subDir) throws IOException {
        // 验证文件类型
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new IOException("文件名为空");
        }

        String suffix = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
        if (!ALLOWED_IMAGE_TYPES.contains(suffix)) {
            throw new IOException("不支持的文件格式，请上传图片文件");
        }

        // 创建保存路径
        String saveDir = uploadDir;
        if (subDir) {
            // 按日期组织目录
            String dateDir = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            saveDir = uploadDir + File.separator + dateDir;
        }

        // 创建目录
        File dir = new File(saveDir);
        if (!dir.exists()) {
            boolean mkdirsResult = dir.mkdirs();
            if (!mkdirsResult) {
                throw new IOException("创建目录失败: " + dir.getAbsolutePath());
            }
        }

        // 生成唯一文件名
        String newFilename = UUID.randomUUID().toString() + suffix;
        String filePath = saveDir + File.separator + newFilename;

        // 保存文件
        file.transferTo(new File(filePath));

        // 返回相对路径（相对于uploadDir）
        String relativePath = newFilename;
        if (subDir) {
            String dateDir = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            relativePath = dateDir + File.separator + newFilename;
        }
        return relativePath;
    }

    /**
     * 获取文件大小的友好显示
     */
    public static String getReadableFileSize(long size) {
        if (size <= 0) return "0 B";

        final String[] units = new String[]{"B", "KB", "MB", "GB", "TB"};
        int digitGroups = (int) (Math.log10(size) / Math.log10(1024));

        return String.format("%.1f %s", size / Math.pow(1024, digitGroups), units[digitGroups]);
    }
}
