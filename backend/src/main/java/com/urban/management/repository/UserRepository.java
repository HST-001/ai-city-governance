package com.urban.management.repository;

import com.urban.management.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 用户数据访问接口
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * 根据用户名查找用户
     *
     * @param username 用户名
     * @return Optional<User>
     */
    Optional<User> findByUsername(String username);

    /**
     * 根据邮箱查找用户
     *
     * @param email 邮箱
     * @return Optional<User>
     */
    Optional<User> findByEmail(String email);

    /**
     * 判断用户名是否已存在
     *
     * @param username 用户名
     * @return boolean
     */
    boolean existsByUsername(String username);

    /**
     * 判断邮箱是否已存在
     *
     * @param email 邮箱
     * @return boolean
     */
    boolean existsByEmail(String email);
}
