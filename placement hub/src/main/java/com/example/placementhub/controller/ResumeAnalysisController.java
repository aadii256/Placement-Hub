package com.example.placementhub.controller;

import com.example.placementhub.dto.ResumeAnalysisResponse;
import com.example.placementhub.service.ResumeAnalysisService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/ai")
public class ResumeAnalysisController {

    private final ResumeAnalysisService resumeAnalysisService;

    public ResumeAnalysisController(
            ResumeAnalysisService resumeAnalysisService
    ) {
        this.resumeAnalysisService = resumeAnalysisService;
    }

    @GetMapping("/resume-analysis")
    @PreAuthorize("hasRole('STUDENT')")
    public ResumeAnalysisResponse analyzeResume(
            Principal principal
    ) throws Exception {

        return resumeAnalysisService.analyzeResume(
                principal.getName()
        );
    }
}