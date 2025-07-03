package com.example.navermapbackend.repository;

import com.example.navermapbackend.model.Marker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MarkerRepository extends JpaRepository<Marker, Long> {
    // JpaRepository의 기본 메서드만 사용
    // findAll(), save(), deleteById() 등의 기본 CRUD 메서드는 자동 제공
}