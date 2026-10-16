package com.example.placementhub.service;

import com.example.placementhub.dto.ApplicationStatsResponse;
import com.example.placementhub.dto.DashboardStatsResponse;
import com.example.placementhub.dto.JobApplicationStatsResponse;
import com.example.placementhub.dto.PlacementReadinessResponse;
import com.example.placementhub.dto.PlacementStatsResponse;
import com.example.placementhub.dto.PublicStatsResponse;
import com.example.placementhub.entity.ApplicationStatus;
import com.example.placementhub.entity.Job;
import com.example.placementhub.entity.JobStatus;
import com.example.placementhub.entity.Student;
import com.example.placementhub.repository.ApplicationRepository;
import com.example.placementhub.repository.CompanyRepository;
import com.example.placementhub.repository.JobRepository;
import com.example.placementhub.repository.ResumeRepository;
import com.example.placementhub.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class DashboardService {

    private final StudentRepository studentRepository;
    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final ResumeRepository resumeRepository;

    public DashboardService(
            StudentRepository studentRepository,
            CompanyRepository companyRepository,
            JobRepository jobRepository,
            ApplicationRepository applicationRepository,
            ResumeRepository resumeRepository) {

        this.studentRepository = studentRepository;
        this.companyRepository = companyRepository;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.resumeRepository = resumeRepository;
    }

    public DashboardStatsResponse getStats() {

        long totalStudents = studentRepository.count();
        long totalCompanies = companyRepository.count();
        long totalJobs = jobRepository.count();
        long totalApplications = applicationRepository.count();

        return new DashboardStatsResponse(
                totalStudents,
                totalCompanies,
                totalJobs,
                totalApplications
        );
    }

    public ApplicationStatsResponse getApplicationStats() {

        long totalApplications = applicationRepository.count();

        long applied = applicationRepository
                .countByStatus(ApplicationStatus.APPLIED);

        long shortlisted = applicationRepository
                .countByStatus(ApplicationStatus.SHORTLISTED);

        long rejected = applicationRepository
                .countByStatus(ApplicationStatus.REJECTED);

        long selected = applicationRepository
                .countByStatus(ApplicationStatus.SELECTED);

        return new ApplicationStatsResponse(
                totalApplications,
                applied,
                shortlisted,
                rejected,
                selected
        );
    }

    public List<JobApplicationStatsResponse> getJobApplicationStats() {

        List<Object[]> results =
                applicationRepository.countApplicationsByJob();

        List<JobApplicationStatsResponse> response =
                new ArrayList<>();

        for (Object[] result : results) {

            Long jobId = (Long) result[0];
            long applicationCount = (Long) result[1];

            Job job = jobRepository.findById(jobId)
                    .orElse(null);

            if (job != null) {

                response.add(
                        new JobApplicationStatsResponse(
                                job.getId(),
                                job.getTitle(),
                                job.getCompany(),
                                applicationCount
                        )
                );
            }
        }

        return response;
    }

    public PlacementStatsResponse getPlacementStats() {

        long totalApplications =
                applicationRepository.count();

        long selectedApplications =
                applicationRepository.countByStatus(
                        ApplicationStatus.SELECTED
                );

        long shortlistedApplications =
                applicationRepository.countByStatus(
                        ApplicationStatus.SHORTLISTED
                );

        double selectionRate = 0.0;

        if (totalApplications > 0) {
            selectionRate =
                    (selectedApplications * 100.0)
                            / totalApplications;
        }

        return new PlacementStatsResponse(
                totalApplications,
                selectedApplications,
                shortlistedApplications,
                selectionRate
        );
    }

    public PlacementStatsResponse getStudentPlacementStats(
            Long studentId) {

        long totalApplications =
                applicationRepository.countByStudentId(studentId);

        long selectedApplications =
                applicationRepository.countByStudentIdAndStatus(
                        studentId,
                        ApplicationStatus.SELECTED
                );

        long shortlistedApplications =
                applicationRepository.countByStudentIdAndStatus(
                        studentId,
                        ApplicationStatus.SHORTLISTED
                );

        double selectionRate = 0.0;

        if (totalApplications > 0) {
            selectionRate =
                    (selectedApplications * 100.0)
                            / totalApplications;
        }

        return new PlacementStatsResponse(
                totalApplications,
                selectedApplications,
                shortlistedApplications,
                selectionRate
        );
    }

    public PublicStatsResponse getPublicStats() {

        long totalCompanies =
                companyRepository.count();

        long activeJobs =
                jobRepository.findAll()
                        .stream()
                        .filter(job ->
                                job.getStatus() == null
                                        || job.getStatus()
                                        == JobStatus.ACTIVE
                        )
                        .count();

        long totalStudents =
                studentRepository.count();

        long totalApplications =
                applicationRepository.count();

        return new PublicStatsResponse(
                totalCompanies,
                activeJobs,
                totalStudents,
                totalApplications
        );
    }

    // =========================================================
    // PLACEMENT READINESS
    // =========================================================

    public PlacementReadinessResponse getStudentPlacementReadiness(
            Long studentId
    ) {

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() ->
                        new RuntimeException("Student not found")
                );

        boolean profileComplete =
                student.getName() != null
                        && !student.getName().isBlank()
                        && student.getEmail() != null
                        && !student.getEmail().isBlank()
                        && student.getPhone() != null
                        && !student.getPhone().isBlank()
                        && student.getBranch() != null
                        && !student.getBranch().isBlank()
                        && student.getCgpa() != null
                        && student.getGraduationYear() != null
                        && !student.getGraduationYear().isBlank();

        boolean resumeUploaded =
                resumeRepository.existsByStudentId(studentId);

        long totalApplications =
                applicationRepository.countByStudentId(studentId);

        long shortlistedApplications =
                applicationRepository.countByStudentIdAndStatus(
                        studentId,
                        ApplicationStatus.SHORTLISTED
                );

        boolean hasApplications =
                totalApplications > 0;

        boolean hasShortlistedApplication =
                shortlistedApplications > 0;

        int score = 0;

        if (profileComplete) {
            score += 25;
        }

        if (resumeUploaded) {
            score += 25;
        }

        if (hasApplications) {
            score += 25;
        }

        if (hasShortlistedApplication) {
            score += 25;
        }

        return new PlacementReadinessResponse(
                score,
                profileComplete,
                resumeUploaded,
                hasApplications,
                hasShortlistedApplication
        );
    }
}