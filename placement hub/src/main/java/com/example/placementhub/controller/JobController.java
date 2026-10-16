
package com.example.placementhub.controller;

import com.example.placementhub.entity.Job;
import com.example.placementhub.entity.JobStatus;
import com.example.placementhub.service.JobService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @GetMapping("/jobs")
    public List<Job> getAllJobs() {
        return jobService.getAllJobs();
    }

    @PostMapping("/jobs")
    @PreAuthorize("hasRole('ADMIN')")
    public Job addJob(@Valid @RequestBody Job job) {
        return jobService.saveJob(job);
    }

    @GetMapping("/jobs/{id}")
    public Job getJobById(@PathVariable Long id) {
        return jobService.getJobById(id);
    }

    @DeleteMapping("/jobs/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id);
    }

    @PutMapping("/jobs/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Job updateJob(
            @PathVariable Long id,
            @RequestBody Job job) {

        return jobService.updateJob(id, job);
    }

    @PutMapping("/jobs/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public Job updateJobStatus(
            @PathVariable Long id,
            @RequestBody Map<String, JobStatus> request) {

        JobStatus status = request.get("status");

        return jobService.updateJobStatus(id, status);
    }

    @GetMapping("/jobs/search")
    public List<Job> searchJobs(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String company,
            @RequestParam(required = false) Double cgpa,
            @RequestParam(required = false) Double minPackage) {

        return jobService.searchJobs(
                location,
                company,
                cgpa,
                minPackage
        );
    }

    @GetMapping("/jobs/recommended")
    @PreAuthorize("hasRole('STUDENT')")
    public List<Job> getRecommendedJobs(
            Authentication authentication) {

        return jobService.getRecommendedJobs(
                authentication.getName()
        );
    }
}