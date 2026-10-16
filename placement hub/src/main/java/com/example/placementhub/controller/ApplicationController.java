
package com.example.placementhub.controller;

import com.example.placementhub.dto.ApplicationRequest;
import com.example.placementhub.dto.ApplicationResponse;
import com.example.placementhub.dto.ApplicationStatusRequest;
import com.example.placementhub.entity.Application;
import com.example.placementhub.entity.ApplicationStatusHistory;
import com.example.placementhub.service.ApplicationService;

import jakarta.validation.Valid;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(
            ApplicationService applicationService
    ) {
        this.applicationService = applicationService;
    }

    // =========================================================
    // GET APPLICATION HISTORY
    // =========================================================

    @GetMapping("/applications/{id}/history")
    public List<ApplicationStatusHistory> getApplicationHistory(
            @PathVariable Long id
    ) {

        return applicationService.getApplicationHistory(id);
    }

    // =========================================================
    // GET APPLICATIONS
    // =========================================================

    @GetMapping("/applications")
    public List<ApplicationResponse> getApplications(
            Authentication authentication
    ) {

        boolean isAdmin = authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        authority.getAuthority()
                                .equals("ROLE_ADMIN")
                );

        return applicationService.getApplicationsForUser(
                authentication.getName(),
                isAdmin
        );
    }

    // =========================================================
    // CREATE APPLICATION
    // =========================================================

    @PostMapping("/applications")
    @PreAuthorize("hasRole('STUDENT')")
    public Application addApplication(
            @Valid @RequestBody ApplicationRequest request,
            Authentication authentication
    ) {

        return applicationService.saveApplication(
                request,
                authentication.getName()
        );
    }

    // =========================================================
    // GET APPLICATION BY ID
    // =========================================================

    @GetMapping("/applications/{id}")
    public ApplicationResponse getApplicationById(
            @PathVariable Long id,
            Authentication authentication
    ) {

        boolean isAdmin = authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        authority.getAuthority()
                                .equals("ROLE_ADMIN")
                );

        return applicationService.getApplicationById(
                id,
                authentication.getName(),
                isAdmin
        );
    }

    // =========================================================
    // DELETE APPLICATION
    // =========================================================

    @DeleteMapping("/applications/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteApplication(
            @PathVariable Long id
    ) {

        applicationService.deleteApplication(id);
    }

    // =========================================================
    // UPDATE APPLICATION
    // =========================================================

    @PutMapping("/applications/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Application updateApplication(
            @PathVariable Long id,
            @RequestBody Application application,
            Authentication authentication
    ) {

        return applicationService.updateApplication(
                id,
                application,
                authentication.getName()
        );
    }

    // =========================================================
    // UPDATE APPLICATION STATUS
    // =========================================================

    @PutMapping("/applications/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public Application updateApplicationStatus(
            @PathVariable Long id,
            @Valid @RequestBody ApplicationStatusRequest request,
            Authentication authentication
    ) {

        return applicationService.updateApplicationStatus(
                id,
                request.getStatus(),
                authentication.getName()
        );
    }
}