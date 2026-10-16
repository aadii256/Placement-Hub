package com.example.placementhub.controller;

import com.example.placementhub.dto.JobMatchResponse;
import com.example.placementhub.entity.User;
import com.example.placementhub.repository.UserRepository;
import com.example.placementhub.service.JobMatchService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/ai")
public class JobMatchController {

    private final JobMatchService jobMatchService;
    private final UserRepository userRepository;

    public JobMatchController(
            JobMatchService jobMatchService,
            UserRepository userRepository
    ) {
        this.jobMatchService = jobMatchService;
        this.userRepository = userRepository;
    }

    @GetMapping("/job-match/{jobId}")
    @PreAuthorize("hasRole('STUDENT')")
    public JobMatchResponse analyzeJobMatch(
            @PathVariable Long jobId,
            Principal principal
    ) {

        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getStudent() == null) {
            throw new RuntimeException(
                    "Student profile is not linked to this account"
            );
        }

        Long studentId = user.getStudent().getId();

        return jobMatchService.analyzeMatch(studentId, jobId);
    }
}