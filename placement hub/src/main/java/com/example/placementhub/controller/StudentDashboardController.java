package com.example.placementhub.controller;

import com.example.placementhub.dto.StudentDashboardResponse;
import com.example.placementhub.service.StudentDashboardService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class StudentDashboardController {

    private final StudentDashboardService studentDashboardService;

    public StudentDashboardController(
            StudentDashboardService studentDashboardService) {

        this.studentDashboardService = studentDashboardService;
    }

    @GetMapping("/dashboard/student")
    @PreAuthorize("hasRole('STUDENT')")
    public StudentDashboardResponse getStudentDashboard(
            Authentication authentication) {

        return studentDashboardService.getStudentDashboard(
                authentication.getName()
        );
    }
}