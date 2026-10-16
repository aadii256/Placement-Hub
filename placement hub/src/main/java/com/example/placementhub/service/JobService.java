
package com.example.placementhub.service;

import com.example.placementhub.ResourceNotFoundException;
import com.example.placementhub.entity.Job;
import com.example.placementhub.entity.JobStatus;
import com.example.placementhub.entity.Student;
import com.example.placementhub.entity.User;
import com.example.placementhub.repository.JobRepository;
import com.example.placementhub.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    public JobService(
            JobRepository jobRepository,
            UserRepository userRepository) {

        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
    }

    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    public Job saveJob(Job job) {

        if (job.getStatus() == null) {
            job.setStatus(JobStatus.ACTIVE);
        }

        return jobRepository.save(job);
    }

    public Job getJobById(Long id) {
        return jobRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Job not found"));
    }

    public void deleteJob(Long id) {

        if (!jobRepository.existsById(id)) {
            throw new ResourceNotFoundException(
                    "Job not found");
        }

        jobRepository.deleteById(id);
    }

    public Job updateJob(Long id, Job job) {

        Job existingJob = jobRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Job not found"));

        existingJob.setTitle(job.getTitle());
        existingJob.setDescription(job.getDescription());
        existingJob.setCompany(job.getCompany());
        existingJob.setLocation(job.getLocation());
        existingJob.setEligibleBranch(job.getEligibleBranch());
        existingJob.setPackageLPA(job.getPackageLPA());
        existingJob.setMinimumCgpa(job.getMinimumCgpa());

        /*
         * Update status only when a status is provided.
         * Otherwise, preserve the existing status.
         */
        if (job.getStatus() != null) {
            existingJob.setStatus(job.getStatus());
        }

        return jobRepository.save(existingJob);
    }

    public Job updateJobStatus(Long id, JobStatus status) {

        Job existingJob = jobRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Job not found"));

        if (status == null) {
            throw new IllegalArgumentException(
                    "Job status cannot be null");
        }

        existingJob.setStatus(status);

        return jobRepository.save(existingJob);
    }

    public List<Job> searchJobs(
            String location,
            String company,
            Double cgpa,
            Double minPackage) {

        return jobRepository.searchJobs(
                location,
                company,
                cgpa,
                minPackage
        );
    }

    public List<Job> searchByLocation(String location) {
        return jobRepository.findByLocationIgnoreCase(location);
    }

    public List<Job> searchByCompany(String company) {
        return jobRepository.findByCompanyIgnoreCase(company);
    }

    public List<Job> searchByCgpa(Double cgpa) {
        return jobRepository.findByMinimumCgpaLessThanEqual(cgpa);
    }

    public List<Job> searchByPackage(Double packageLPA) {
        return jobRepository.findJobsWithMinimumPackage(packageLPA);
    }

    public List<Job> getRecommendedJobs(String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"));

        Student student = user.getStudent();

        if (student == null) {
            throw new ResourceNotFoundException(
                    "Student profile not linked to this user");
        }

        return jobRepository.findRecommendedJobs(
                student.getCgpa(),
                student.getBranch()
        );
    }
}