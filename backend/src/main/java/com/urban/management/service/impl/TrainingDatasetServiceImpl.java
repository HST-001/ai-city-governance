package com.urban.management.service.impl;

import com.urban.management.entity.TrainingDataset;
import com.urban.management.repository.TrainingDatasetRepository;
import com.urban.management.service.TrainingDatasetService;
import org.apache.commons.compress.archivers.ArchiveEntry;
import org.apache.commons.compress.archivers.ArchiveInputStream;
import org.apache.commons.compress.archivers.zip.ZipArchiveInputStream;
import org.apache.commons.compress.archivers.tar.TarArchiveInputStream;
import org.apache.commons.compress.compressors.gzip.GzipCompressorInputStream;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class TrainingDatasetServiceImpl implements TrainingDatasetService {

    @Autowired
    private TrainingDatasetRepository trainingDatasetRepository;

    private static final String UPLOAD_DIR = "uploads/training-datasets/";

    @Override
    public List<TrainingDataset> getAllDatasets() {
        return trainingDatasetRepository.findAll();
    }

    @Override
    public TrainingDataset getDatasetById(Long id) {
        return trainingDatasetRepository.findById(id).orElse(null);
    }

    @Override
    public TrainingDataset createDataset(String name, String description, MultipartFile[] files, Long uploadedBy) {
        try {
            System.out.println("===== 开始创建数据集 =====");
            System.out.println("数据集名称: " + name);
            System.out.println("描述: " + description);
            System.out.println("上传者ID: " + uploadedBy);
            System.out.println("文件数量: " + (files != null ? files.length : 0));
            
            if (files != null && files.length > 0) {
                for (int i = 0; i < files.length; i++) {
                    System.out.println("文件 " + i + ": " + files[i].getOriginalFilename() + ", 大小: " + files[i].getSize());
                }
            }
            
            TrainingDataset dataset = new TrainingDataset();
            dataset.setName(name);
            dataset.setDescription(description);
            dataset.setUploadedBy(uploadedBy);
            dataset.setStatus("processing");
            dataset.setFileCount(files != null ? files.length : 0);
            dataset.setFileSize(calculateTotalFileSize(files));
            dataset.setStoragePath(generateStoragePath(name));

            System.out.println("保存数据集到数据库...");
            TrainingDataset savedDataset = trainingDatasetRepository.save(dataset);
            System.out.println("数据集已保存，ID: " + savedDataset.getId());

            if (files != null && files.length > 0) {
                System.out.println("开始保存文件到存储...");
                saveFilesToStorage(dataset, files);
                savedDataset.setStatus("available");
                trainingDatasetRepository.save(savedDataset);
                System.out.println("数据集状态已更新为available");
            }

            System.out.println("===== 数据集创建完成 =====");
            return savedDataset;
        } catch (Exception e) {
            System.err.println("创建数据集失败: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("创建数据集失败: " + e.getMessage(), e);
        }
    }

    @Override
    public TrainingDataset updateDataset(Long id, String name, String description) {
        TrainingDataset dataset = trainingDatasetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("数据集不存在: " + id));

        if (name != null && !name.isEmpty()) {
            dataset.setName(name);
        }
        if (description != null) {
            dataset.setDescription(description);
        }

        return trainingDatasetRepository.save(dataset);
    }

    @Override
    public void deleteDataset(Long id) {
        TrainingDataset dataset = trainingDatasetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("数据集不存在: " + id));

        try {
            if (dataset.getStoragePath() != null) {
                deleteFilesFromStorage(dataset.getStoragePath());
            }
        } catch (Exception e) {
            System.err.println("删除存储文件失败: " + e.getMessage());
        }

        trainingDatasetRepository.deleteById(id);
    }

    @Override
    public List<TrainingDataset> getDatasetsByUploadedBy(Long uploadedBy) {
        return trainingDatasetRepository.findByUploadedBy(uploadedBy);
    }

    @Override
    public List<TrainingDataset> getAvailableDatasets() {
        return trainingDatasetRepository.findByStatus("available");
    }

    @Override
    public TrainingDataset addFilesToDataset(Long id, MultipartFile[] files) {
        try {
            System.out.println("===== 开始向数据集添加文件 =====");
            System.out.println("数据集ID: " + id);
            System.out.println("文件数量: " + (files != null ? files.length : 0));

            TrainingDataset dataset = trainingDatasetRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("数据集不存在: " + id));

            System.out.println("找到数据集: " + dataset.getName());
            System.out.println("存储路径: " + dataset.getStoragePath());

            if (files != null && files.length > 0) {
                System.out.println("开始保存文件到存储...");
                saveFilesToStorage(dataset, files);

                // 重新计算文件数量和大小
                Path storagePath = Paths.get(dataset.getStoragePath());
                long totalBytes = 0;
                int fileCount = 0;
                
                if (Files.exists(storagePath)) {
                    try (var stream = Files.walk(storagePath)) {
                        totalBytes = stream
                            .filter(Files::isRegularFile)
                            .mapToLong(path -> {
                                try {
                                    return Files.size(path);
                                } catch (IOException e) {
                                    return 0;
                                }
                            })
                            .sum();
                        
                        fileCount = (int) Files.walk(storagePath)
                            .filter(Files::isRegularFile)
                            .count();
                    }
                }

                dataset.setFileCount(fileCount);
                dataset.setFileSize(formatFileSize(totalBytes));

                TrainingDataset updatedDataset = trainingDatasetRepository.save(dataset);
                System.out.println("数据集更新成功，新文件数量: " + updatedDataset.getFileCount());
                System.out.println("===== 文件添加完成 =====");
                return updatedDataset;
            }

            return dataset;
        } catch (Exception e) {
            System.err.println("向数据集添加文件失败: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("向数据集添加文件失败: " + e.getMessage(), e);
        }
    }

    @Override
    public TrainingDataset removeFilesFromDataset(Long id, String[] fileNames) {
        try {
            System.out.println("===== 开始从数据集删除文件 =====");
            System.out.println("数据集ID: " + id);
            System.out.println("要删除的文件数量: " + (fileNames != null ? fileNames.length : 0));

            TrainingDataset dataset = trainingDatasetRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("数据集不存在: " + id));

            System.out.println("找到数据集: " + dataset.getName());
            System.out.println("存储路径: " + dataset.getStoragePath());

            if (fileNames != null && fileNames.length > 0) {
                Path storagePath = Paths.get(dataset.getStoragePath());
                long totalDeletedBytes = 0;
                int deletedCount = 0;

                for (String fileName : fileNames) {
                    try {
                        Path filePath = storagePath.resolve(fileName);
                        if (Files.exists(filePath)) {
                            long fileSize = Files.size(filePath);
                            Files.delete(filePath);
                            totalDeletedBytes += fileSize;
                            deletedCount++;
                            System.out.println("删除文件成功: " + fileName + ", 大小: " + fileSize + " bytes");
                        } else {
                            System.out.println("文件不存在: " + fileName);
                        }
                    } catch (Exception e) {
                        System.err.println("删除文件失败: " + fileName + ", 错误: " + e.getMessage());
                    }
                }

                int currentFileCount = dataset.getFileCount() != null ? dataset.getFileCount() : 0;
                dataset.setFileCount(Math.max(0, currentFileCount - deletedCount));

                String currentFileSize = dataset.getFileSize() != null ? dataset.getFileSize() : "0 B";
                long existingBytes = parseFileSizeToBytes(currentFileSize);
                String newFileSize = formatFileSize(Math.max(0, existingBytes - totalDeletedBytes));
                dataset.setFileSize(newFileSize);

                TrainingDataset updatedDataset = trainingDatasetRepository.save(dataset);
                System.out.println("数据集更新成功，新文件数量: " + updatedDataset.getFileCount());
                System.out.println("===== 文件删除完成 =====");
                return updatedDataset;
            }

            return dataset;
        } catch (Exception e) {
            System.err.println("从数据集删除文件失败: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("从数据集删除文件失败: " + e.getMessage(), e);
        }
    }

    private String calculateTotalFileSizeWithExisting(String existingFileSize, MultipartFile[] newFiles) {
        long existingBytes = parseFileSizeToBytes(existingFileSize);
        long newBytes = 0;
        for (MultipartFile file : newFiles) {
            newBytes += file.getSize();
        }
        return formatFileSize(existingBytes + newBytes);
    }

    private long parseFileSizeToBytes(String fileSize) {
        try {
            if (fileSize == null || fileSize.isEmpty()) {
                return 0;
            }
            String[] parts = fileSize.split(" ");
            if (parts.length < 2) {
                return 0;
            }
            double value = Double.parseDouble(parts[0]);
            String unit = parts[1];
            
            switch (unit) {
                case "B":
                    return (long) value;
                case "KB":
                    return (long) (value * 1024);
                case "MB":
                    return (long) (value * 1024 * 1024);
                case "GB":
                    return (long) (value * 1024 * 1024 * 1024);
                default:
                    return 0;
            }
        } catch (Exception e) {
            System.err.println("解析文件大小失败: " + fileSize + ", 错误: " + e.getMessage());
            return 0;
        }
    }

    private String calculateTotalFileSize(MultipartFile[] files) {
        if (files == null || files.length == 0) {
            return "0 B";
        }

        long totalBytes = 0;
        for (MultipartFile file : files) {
            totalBytes += file.getSize();
        }

        return formatFileSize(totalBytes);
    }

    private String formatFileSize(long bytes) {
        if (bytes < 1024) {
            return bytes + " B";
        } else if (bytes < 1024 * 1024) {
            return String.format("%.2f KB", bytes / 1024.0);
        } else if (bytes < 1024 * 1024 * 1024) {
            return String.format("%.2f MB", bytes / (1024.0 * 1024));
        } else {
            return String.format("%.2f GB", bytes / (1024.0 * 1024 * 1024));
        }
    }

    private String generateStoragePath(String datasetName) {
        String uniqueId = UUID.randomUUID().toString().substring(0, 8);
        String sanitizedName = datasetName.replaceAll("[^a-zA-Z0-9\\u4e00-\\u9fa5_-]", "_");
        String projectRoot = System.getProperty("user.dir");
        return projectRoot + File.separator + UPLOAD_DIR + sanitizedName + "_" + uniqueId + File.separator;
    }

    @Override
    public List<String> getDatasetFiles(Long id) {
        try {
            System.out.println("===== 获取数据集文件列表 =====");
            System.out.println("数据集ID: " + id);

            TrainingDataset dataset = trainingDatasetRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("数据集不存在: " + id));

            System.out.println("找到数据集: " + dataset.getName());
            System.out.println("存储路径: " + dataset.getStoragePath());

            Path storagePath = Paths.get(dataset.getStoragePath());
            if (!Files.exists(storagePath)) {
                System.out.println("存储目录不存在");
                return new ArrayList<>();
            }

            List<String> fileNames = new ArrayList<>();
            try (var stream = Files.list(storagePath)) {
                stream.forEach(path -> {
                    if (Files.isRegularFile(path)) {
                        fileNames.add(path.getFileName().toString());
                    }
                });
            }

            System.out.println("找到 " + fileNames.size() + " 个文件");
            System.out.println("===== 获取文件列表完成 =====");
            return fileNames;
        } catch (Exception e) {
            System.err.println("获取数据集文件列表失败: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("获取数据集文件列表失败: " + e.getMessage(), e);
        }
    }

    private void saveFilesToStorage(TrainingDataset dataset, MultipartFile[] files) throws IOException {
        Path storagePath = Paths.get(dataset.getStoragePath());
        if (!Files.exists(storagePath)) {
            Files.createDirectories(storagePath);
            System.out.println("创建存储目录: " + storagePath.toAbsolutePath());
        }

        for (MultipartFile file : files) {
            String fileName = file.getOriginalFilename();
            if (fileName != null) {
                String lowerFileName = fileName.toLowerCase();
                
                // 检查是否是压缩文件
                if (lowerFileName.endsWith(".zip") || lowerFileName.endsWith(".rar") || 
                    lowerFileName.endsWith(".7z") || lowerFileName.endsWith(".tar") || 
                    lowerFileName.endsWith(".gz")) {
                    System.out.println("检测到压缩文件: " + fileName + "，开始解压...");
                    extractArchive(file, storagePath);
                    System.out.println("压缩文件解压完成: " + fileName);
                } else {
                    // 普通文件，直接保存
                    Path filePath = storagePath.resolve(fileName);
                    System.out.println("保存文件: " + filePath.toAbsolutePath() + ", 大小: " + file.getSize() + " bytes");
                    file.transferTo(filePath.toFile());
                    System.out.println("文件保存成功: " + filePath.toAbsolutePath());
                }
            }
        }
        
        // 解压完成后，自动组织和合并文件
        System.out.println("开始自动组织和合并训练文件...");
        organizeTrainingFiles(storagePath);
        System.out.println("文件组织和合并完成");
    }
    
    private void extractArchive(MultipartFile archiveFile, Path targetDir) throws IOException {
        String fileName = archiveFile.getOriginalFilename();
        if (fileName == null) {
            return;
        }
        
        String lowerFileName = fileName.toLowerCase();
        
        try (InputStream inputStream = archiveFile.getInputStream()) {
            if (lowerFileName.endsWith(".zip")) {
                extractZip(inputStream, targetDir);
            } else if (lowerFileName.endsWith(".tar") || lowerFileName.endsWith(".tar.gz") || lowerFileName.endsWith(".tgz")) {
                extractTar(inputStream, targetDir);
            } else if (lowerFileName.endsWith(".gz") && !lowerFileName.endsWith(".tar.gz")) {
                extractGzip(inputStream, targetDir, fileName);
            } else {
                System.out.println("不支持的压缩格式: " + fileName + "，直接保存");
                Path filePath = targetDir.resolve(fileName);
                archiveFile.transferTo(filePath.toFile());
            }
        }
    }
    
    private void extractZip(InputStream inputStream, Path targetDir) throws IOException {
        try (ZipArchiveInputStream zipInputStream = new ZipArchiveInputStream(inputStream)) {
            ArchiveEntry entry;
            while ((entry = zipInputStream.getNextEntry()) != null) {
                if (!entry.isDirectory()) {
                    Path outputPath = targetDir.resolve(entry.getName());
                    Files.createDirectories(outputPath.getParent());
                    
                    try (OutputStream outputStream = Files.newOutputStream(outputPath)) {
                        byte[] buffer = new byte[8192];
                        int len;
                        while ((len = zipInputStream.read(buffer)) > 0) {
                            outputStream.write(buffer, 0, len);
                        }
                    }
                    System.out.println("解压文件: " + entry.getName());
                }
            }
        }
    }
    
    private void extractTar(InputStream inputStream, Path targetDir) throws IOException {
        try (TarArchiveInputStream tarInputStream = new TarArchiveInputStream(inputStream)) {
            ArchiveEntry entry;
            while ((entry = tarInputStream.getNextEntry()) != null) {
                if (!entry.isDirectory()) {
                    Path outputPath = targetDir.resolve(entry.getName());
                    Files.createDirectories(outputPath.getParent());
                    
                    try (OutputStream outputStream = Files.newOutputStream(outputPath)) {
                        byte[] buffer = new byte[8192];
                        int len;
                        while ((len = tarInputStream.read(buffer)) > 0) {
                            outputStream.write(buffer, 0, len);
                        }
                    }
                    System.out.println("解压文件: " + entry.getName());
                }
            }
        }
    }
    
    private void extractGzip(InputStream inputStream, Path targetDir, String originalFileName) throws IOException {
        String baseName = originalFileName.substring(0, originalFileName.lastIndexOf('.'));
        Path outputPath = targetDir.resolve(baseName);
        
        try (GzipCompressorInputStream gzipInputStream = new GzipCompressorInputStream(inputStream);
             OutputStream outputStream = Files.newOutputStream(outputPath)) {
            byte[] buffer = new byte[8192];
            int len;
            while ((len = gzipInputStream.read(buffer)) > 0) {
                outputStream.write(buffer, 0, len);
            }
            System.out.println("解压文件: " + baseName);
        }
    }
    
    private void organizeTrainingFiles(Path storagePath) throws IOException {
        try {
            // 创建标准YOLO目录结构
            Path imagesDir = storagePath.resolve("images");
            Path labelsDir = storagePath.resolve("labels");
            
            if (!Files.exists(imagesDir)) {
                Files.createDirectories(imagesDir);
                System.out.println("创建images目录: " + imagesDir);
            }
            
            if (!Files.exists(labelsDir)) {
                Files.createDirectories(labelsDir);
                System.out.println("创建labels目录: " + labelsDir);
            }
            
            // 遍历存储路径中的所有文件
            try (var stream = Files.walk(storagePath)) {
                stream.filter(Files::isRegularFile)
                     .filter(path -> !path.getParent().equals(imagesDir) && !path.getParent().equals(labelsDir))
                     .forEach(path -> {
                         try {
                             String fileName = path.getFileName().toString();
                             String lowerFileName = fileName.toLowerCase();
                             
                             // 判断文件类型并移动到对应目录
                             if (isImageFile(lowerFileName)) {
                                 Path targetPath = imagesDir.resolve(fileName);
                                 Files.move(path, targetPath);
                                 System.out.println("移动图片到images目录: " + fileName);
                             } else if (isAnnotationFile(lowerFileName)) {
                                 Path targetPath = labelsDir.resolve(fileName);
                                 Files.move(path, targetPath);
                                 System.out.println("移动标注文件到labels目录: " + fileName);
                             }
                         } catch (IOException e) {
                             System.err.println("移动文件失败: " + path + ", 错误: " + e.getMessage());
                         }
                     });
            }
            
            // 检查是否需要合并JSON和TXT标注
            mergeAnnotationFormats(labelsDir);
            
        } catch (IOException e) {
            System.err.println("组织训练文件失败: " + e.getMessage());
            throw e;
        }
    }
    
    private boolean isImageFile(String fileName) {
        return fileName.endsWith(".jpg") || fileName.endsWith(".jpeg") || 
               fileName.endsWith(".png") || fileName.endsWith(".bmp") || 
               fileName.endsWith(".gif") || fileName.endsWith(".webp");
    }
    
    private boolean isAnnotationFile(String fileName) {
        return fileName.endsWith(".txt") || fileName.endsWith(".json");
    }
    
    private void mergeAnnotationFormats(Path labelsDir) throws IOException {
        // 检查是否存在JSON和TXT两种格式的标注文件
        boolean hasJson = false;
        boolean hasTxt = false;
        
        try (var stream = Files.list(labelsDir)) {
            hasJson = stream.anyMatch(path -> path.getFileName().toString().toLowerCase().endsWith(".json"));
        }
        
        try (var stream = Files.list(labelsDir)) {
            hasTxt = stream.anyMatch(path -> path.getFileName().toString().toLowerCase().endsWith(".txt"));
        }
        
        if (hasJson && hasTxt) {
            System.out.println("检测到JSON和TXT两种标注格式，保留两种格式供选择");
            // 这里可以添加将JSON转换为YOLO格式的逻辑
            // convertJsonToYolo(labelsDir);
        } else if (hasJson) {
            System.out.println("仅检测到JSON格式标注文件");
            // 可以添加将JSON转换为YOLO格式的逻辑
            // convertJsonToYolo(labelsDir);
        } else if (hasTxt) {
            System.out.println("仅检测到YOLO格式标注文件（TXT）");
        }
    }

    private void deleteFilesFromStorage(String storagePath) throws IOException {
        Path path = Paths.get(storagePath);
        if (Files.exists(path)) {
            Files.walk(path)
                    .sorted((a, b) -> b.compareTo(a))
                    .forEach(file -> {
                        try {
                            Files.delete(file);
                        } catch (IOException e) {
                            System.err.println("删除文件失败: " + file + ", 错误: " + e.getMessage());
                        }
                    });
        }
    }
}
