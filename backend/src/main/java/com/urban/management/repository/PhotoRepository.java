package com.urban.management.repository;

import com.urban.management.entity.Photo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 照片数据访问接口
 */
@Repository
public interface PhotoRepository extends JpaRepository<Photo, Long> {

    /**
     * 根据用户ID查找照片，分页返回
     *
     * @param userId 用户ID
     * @param pageable 分页参数
     * @return Page<Photo>
     */
    @Query("SELECT p FROM Photo p WHERE p.uploadedBy = :userId")
    Page<Photo> findByUploadedBy(@Param("userId") Long userId, Pageable pageable);

    /**
     * 根据照片类型查找照片，分页返回
     *
     * @param photoType 照片类型
     * @param pageable 分页参数
     * @return Page<Photo>
     */
    Page<Photo> findByPhotoType(String photoType, Pageable pageable);

    /**
     * 根据分析状态查找照片，分页返回
     *
     * @param analyzed 是否已分析
     * @param pageable 分页参数
     * @return Page<Photo>
     */
    Page<Photo> findByAnalyzed(Boolean analyzed, Pageable pageable);

    /**
     * 根据街道名称和区域查找照片
     *
     * @param streetName 街道名称
     * @param district 区域
     * @return List<Photo>
     */
    List<Photo> findByStreetNameAndDistrict(String streetName, String district);

    /**
     * 查找未分析的照片
     *
     * @param pageable 分页参数
     * @return Page<Photo>
     */
    Page<Photo> findByAnalyzedFalse(Pageable pageable);

    /**
     * 根据地理位置范围查找照片
     *
     * @param minLat 最小纬度
     * @param maxLat 最大纬度
     * @param minLng 最小经度
     * @param maxLng 最大经度
     * @param pageable 分页参数
     * @return Page<Photo>
     */
    @Query("SELECT p FROM Photo p WHERE p.latitude BETWEEN :minLat AND :maxLat AND p.longitude BETWEEN :minLng AND :maxLng")
    Page<Photo> findByLocationRange(
            @Param("minLat") Double minLat,
            @Param("maxLat") Double maxLat,
            @Param("minLng") Double minLng,
            @Param("maxLng") Double maxLng,
            Pageable pageable
    );

    /**
     * 根据文件名查找照片
     *
     * @param fileName 文件名
     * @return Optional<Photo>
     */
    Optional<Photo> findByFileName(String fileName);

    /**
     * 根据城市查找照片，分页返回
     *
     * @param city 城市
     * @param pageable 分页参数
     * @return Page<Photo>
     */
    Page<Photo> findByCity(String city, Pageable pageable);
}

