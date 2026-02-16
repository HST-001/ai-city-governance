package com.urban.management.service;

import com.urban.management.entity.Photo;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface PhotoService {
    
    /**
     * 保存照片及文件
     * @param photo 照片实体对象
     * @param file 上传的文件
     * @return 保存后的照片实体
     */
    Photo savePhoto(Photo photo, MultipartFile file);
    
    /**
     * 获取照片列表，支持分页和筛选
     * @param page 页码
     * @param size 每页大小
     * @param city 城市
     * @param district 区域
     * @param street 街道
     * @param type 照片类型
     * @param status 状态
     * @return 照片分页对象
     */
    Page<Photo> getPhotos(int page, int size, String city, String district, String street, String type, String status);
    
    /**
     * 根据ID获取照片详情
     * @param id 照片ID
     * @return 照片实体对象
     */
    Photo getPhotoById(Long id);
    
    /**
     * 更新照片信息
     * @param photo 照片实体对象
     * @return 更新后的照片实体
     */
    Photo updatePhoto(Photo photo);
    
    /**
     * 更新照片评分（包括综合评分和多维度评分）
     * @param photoId 照片ID
     * @param rating 综合评分
     * @param dimensionScores 多维度评分
     * @return 更新后的照片实体
     */
    Photo updatePhotoRating(Long photoId, Double rating, Object dimensionScores);
    
    /**
     * 删除照片
     * @param id 照片ID
     */
    void deletePhoto(Long id);
    
    /**
     * 批量删除照片
     * @param ids 照片ID列表
     */
    void batchDeletePhotos(List<Long> ids);
    
    /**
     * 获取热门城市列表
     * @return 城市名称列表
     */
    List<String> getHotCities();
    
    /**
     * 根据城市获取区域列表
     * @param city 城市名称
     * @return 区域名称列表
     */
    List<String> getDistrictsByCity(String city);
    
    /**
     * 根据城市和区域获取街道列表
     * @param city 城市名称
     * @param district 区域名称
     * @return 街道名称列表
     */
    List<String> getStreetsByCityAndDistrict(String city, String district);
    
    /**
     * 获取照片文件路径
     * @param fileName 文件名
     * @return 文件完整路径
     */
    String getFilePath(String fileName);
}
