package com.urban.management.service;

import com.urban.management.entity.TrainingDataset;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface TrainingDatasetService {
    
    List<TrainingDataset> getAllDatasets();
    
    TrainingDataset getDatasetById(Long id);
    
    TrainingDataset createDataset(String name, String description, MultipartFile[] files, Long uploadedBy);
    
    TrainingDataset updateDataset(Long id, String name, String description);
    
    void deleteDataset(Long id);
    
    List<TrainingDataset> getDatasetsByUploadedBy(Long uploadedBy);
    
    List<TrainingDataset> getAvailableDatasets();
    
    TrainingDataset addFilesToDataset(Long id, MultipartFile[] files);
    
    TrainingDataset removeFilesFromDataset(Long id, String[] fileNames);
    
    List<String> getDatasetFiles(Long id);
}
