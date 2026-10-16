package com.example.placementhub.service;

import com.example.placementhub.dto.PlacementReportResponse;
import com.example.placementhub.entity.Application;
import com.example.placementhub.entity.Job;
import com.example.placementhub.entity.Student;
import com.example.placementhub.repository.ApplicationRepository;
import com.example.placementhub.repository.JobRepository;
import com.example.placementhub.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class PlacementReportService {

    private final ApplicationRepository applicationRepository;
    private final StudentRepository studentRepository;
    private final JobRepository jobRepository;

    public PlacementReportService(
            ApplicationRepository applicationRepository,
            StudentRepository studentRepository,
            JobRepository jobRepository) {

        this.applicationRepository = applicationRepository;
        this.studentRepository = studentRepository;
        this.jobRepository = jobRepository;
    }

    public List<PlacementReportResponse> getPlacementReport() {

        List<Application> applications =
                applicationRepository.findAll();

        List<PlacementReportResponse> report =
                new ArrayList<>();

        for (Application application : applications) {

            Student student =
                    studentRepository.findById(
                            application.getStudentId()
                    ).orElse(null);

            Job job =
                    jobRepository.findById(
                            application.getJobId()
                    ).orElse(null);

            if (student == null || job == null) {
                continue;
            }

            String packageLPA = "";

            if (job.getPackageLPA() != null) {
                packageLPA =
                        String.valueOf(job.getPackageLPA());
            }

            String status = "";

            if (application.getStatus() != null) {
                status =
                        application.getStatus().name();
            }

            PlacementReportResponse response =
                    new PlacementReportResponse(
                            application.getId(),
                            student.getName(),
                            student.getEmail(),
                            student.getBranch(),
                            job.getCompany(),
                            job.getTitle(),
                            job.getLocation(),
                            packageLPA,
                            status
                    );

            report.add(response);
        }

        return report;
    }
}