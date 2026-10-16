package com.example.placementhub.service;

import com.example.placementhub.ResourceNotFoundException;
import com.example.placementhub.dto.StudentDashboardResponse;
import com.example.placementhub.entity.Student;
import com.example.placementhub.entity.User;
import com.example.placementhub.repository.ApplicationRepository;
import com.example.placementhub.repository.JobRepository;
import com.example.placementhub.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class StudentDashboardService {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;

    public StudentDashboardService(
            UserRepository userRepository,
            JobRepository jobRepository,
            ApplicationRepository applicationRepository) {

        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
    }

    public StudentDashboardResponse getStudentDashboard(
            String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"));

        Student student = user.getStudent();

        if (student == null) {
            throw new ResourceNotFoundException(
                    "Student profile not linked to this user");
        }

        long availableJobs = jobRepository.count();

        long myApplications =
                applicationRepository
                        .findByStudentId(student.getId())
                        .size();

        return new StudentDashboardResponse(
                student.getId(),
                student.getName(),
                student.getEmail(),
                student.getBranch(),
                student.getCgpa(),
                student.getGraduationYear(),
                availableJobs,
                myApplications
        );
    }
}