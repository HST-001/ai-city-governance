package com.urban.management.repository;

import com.urban.management.entity.StreetScore;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 街道评分数据访问接口
 */
@Repository
public interface StreetScoreRepository extends JpaRepository<StreetScore, Long> {

    /**
     * 根据街道名称查找最新评分
     *
     * @param streetName 街道名称
     * @param district 区域
     * @return Optional<StreetScore>
     */
    Optional<StreetScore> findFirstByStreetNameAndDistrictOrderByEvaluationDateDesc(String streetName, String district);

    /**
     * 根据区域查找街道评分，分页返回
     *
     * @param district 区域
     * @param pageable 分页参数
     * @return Page<StreetScore>
     */
    Page<StreetScore> findByDistrict(String district, Pageable pageable);

    /**
     * 根据城市查找街道评分，分页返回
     *
     * @param city 城市
     * @param pageable 分页参数
     * @return Page<StreetScore>
     */
    Page<StreetScore> findByCity(String city, Pageable pageable);

    /**
     * 根据评分范围查找街道评分
     *
     * @param minScore 最低评分
     * @param maxScore 最高评分
     * @param pageable 分页参数
     * @return Page<StreetScore>
     */
    Page<StreetScore> findByScoreBetween(Double minScore, Double maxScore, Pageable pageable);

    /**
     * 获取指定区域的所有街道名称
     *
     * @param district 区域
     * @return List<String>
     */
    List<String> findDistinctStreetNameByDistrict(String district);

    /**
     * 获取指定城市的所有区域名称
     *
     * @param city 城市
     * @return List<String>
     */
    List<String> findDistinctDistrictByCity(String city);
}
