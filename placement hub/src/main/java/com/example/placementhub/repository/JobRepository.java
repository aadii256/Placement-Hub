package com.example.placementhub.repository;

import com.example.placementhub.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {

    List<Job> findByLocationIgnoreCase(String location);

    List<Job> findByCompanyIgnoreCase(String company);

    List<Job> findByMinimumCgpaLessThanEqual(Double cgpa);

    @Query("SELECT j FROM Job j WHERE j.packageLPA >= :minPackage")
    List<Job> findJobsWithMinimumPackage(
            @Param("minPackage") Double minPackage
    );

    @Query("""
            SELECT j FROM Job j
            WHERE (:location IS NULL OR LOWER(j.location) = LOWER(:location))
            AND (:company IS NULL OR LOWER(j.company) = LOWER(:company))
            AND (:cgpa IS NULL OR j.minimumCgpa <= :cgpa)
            AND (:minPackage IS NULL OR j.packageLPA >= :minPackage)
            """)
    List<Job> searchJobs(
            @Param("location") String location,
            @Param("company") String company,
            @Param("cgpa") Double cgpa,
            @Param("minPackage") Double minPackage
    );

    @Query("""
            SELECT j FROM Job j
            WHERE j.minimumCgpa <= :cgpa
            AND LOWER(j.eligibleBranch) = LOWER(:branch)
            """)
    List<Job> findRecommendedJobs(
            @Param("cgpa") Double cgpa,
            @Param("branch") String branch
    );
}