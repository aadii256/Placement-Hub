package com.example.placementhub.repository;

import com.example.placementhub.entity.Application;
import com.example.placementhub.entity.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ApplicationRepository
        extends JpaRepository<Application, Long> {

    boolean existsByStudentIdAndJobId(
            Long studentId,
            Long jobId
    );

    boolean existsByStudentIdAndJobIdAndIdNot(
            Long studentId,
            Long jobId,
            Long id
    );

    List<Application> findByStudentId(Long studentId);

    long countByStudentId(Long studentId);

    long countByStudentIdAndStatus(
            Long studentId,
            ApplicationStatus status
    );

    long countByStatus(ApplicationStatus status);

    @Query("""
            SELECT a.jobId, COUNT(a)
            FROM Application a
            GROUP BY a.jobId
            """)
    List<Object[]> countApplicationsByJob();
}