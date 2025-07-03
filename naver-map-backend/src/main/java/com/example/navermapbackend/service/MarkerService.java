package com.example.navermapbackend.service;

import com.example.navermapbackend.model.Marker;
import com.example.navermapbackend.repository.MarkerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class MarkerService {

    private final MarkerRepository markerRepository;

    @Autowired
    public MarkerService(MarkerRepository markerRepository) {
        this.markerRepository = markerRepository;
    }

    // 모든 마커 조회
    @Transactional(readOnly = true)
    public List<Marker> getAllMarkers() {
        List<Marker> markers = markerRepository.findAll();
        System.out.println("📍 모든 마커 조회 - 총 " + markers.size() + "개");
        return markers;
    }
}