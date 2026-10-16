package com.example.placementhub.repository;

import com.example.placementhub.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    List<Notification> findByStudentIdOrderByCreatedAtDesc(
            Long studentId
    );

    long countByStudentIdAndReadStatus(
            Long studentId,
            boolean readStatus
    );
}