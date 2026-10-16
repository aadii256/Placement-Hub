package com.example.placementhub.controller;

import com.example.placementhub.dto.ApplicationStatsResponse;
import com.example.placementhub.dto.DashboardStatsResponse;
import com.example.placementhub.dto.JobApplicationStatsResponse;
import com.example.placementhub.dto.PlacementReadinessResponse;
import com.example.placementhub.dto.PlacementStatsResponse;
import com.example.placementhub.dto.PublicStatsResponse;
import com.example.placementhub.entity.User;
import com.example.placementhub.repository.UserRepository;
import com.example.placementhub.service.DashboardService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
public class DashboardController {

    private final DashboardService dashboardService;
    private final UserRepository userRepository;

    public DashboardController(
            DashboardService dashboardService,
            UserRepository userRepository) {

        this.dashboardService = dashboardService;
        this.userRepository = userRepository;
    }

    @GetMapping("/dashboard/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public DashboardStatsResponse getDashboardStats() {
        return dashboardService.getStats();
    }

    @GetMapping("/dashboard/application-stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ApplicationStatsResponse getApplicationStats() {
        return dashboardService.getApplicationStats();
    }

    @GetMapping("/dashboard/job-application-stats")
    @PreAuthorize("hasRole('ADMIN')")
    public List<JobApplicationStatsResponse> getJobApplicationStats() {
        return dashboardService.getJobApplicationStats();
    }

    @GetMapping("/dashboard/placement-stats")
    @PreAuthorize("hasRole('ADMIN')")
    public PlacementStatsResponse getPlacementStats() {
        return dashboardService.getPlacementStats();
    }

    @GetMapping("/dashboard/student-placement-stats")
    @PreAuthorize("hasRole('STUDENT')")
    public PlacementStatsResponse getStudentPlacementStats(
            Principal principal) {

        User user = userRepository
                .findByUsername(principal.getName())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (user.getStudent() == null) {
            throw new RuntimeException(
                    "Student profile is not linked to this account");
        }

        Long studentId = user.getStudent().getId();

        return dashboardService.getStudentPlacementStats(studentId);
    }

    @GetMapping("/dashboard/student-placement-readiness")
    @PreAuthorize("hasRole('STUDENT')")
    public PlacementReadinessResponse getStudentPlacementReadiness(
            Principal principal) {

        User user = userRepository
                .findByUsername(principal.getName())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (user.getStudent() == null) {
            throw new RuntimeException(
                    "Student profile is not linked to this account");
        }

        Long studentId = user.getStudent().getId();

        return dashboardService
                .getStudentPlacementReadiness(studentId);
    }

    @GetMapping("/public/stats")
    public PublicStatsResponse getPublicStats() {
        return dashboardService.getPublicStats();
    }
}