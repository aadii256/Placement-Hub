package com.example.placementhub.service;

import com.example.placementhub.DuplicateApplicationException;
import com.example.placementhub.ResourceNotFoundException;
import com.example.placementhub.dto.ApplicationRequest;
import com.example.placementhub.dto.ApplicationResponse;
import com.example.placementhub.entity.Application;
import com.example.placementhub.entity.ApplicationStatus;
import com.example.placementhub.entity.ApplicationStatusHistory;
import com.example.placementhub.entity.Job;
import com.example.placementhub.entity.JobStatus;
import com.example.placementhub.entity.Student;
import com.example.placementhub.entity.User;
import com.example.placementhub.repository.ApplicationRepository;
import com.example.placementhub.repository.ApplicationStatusHistoryRepository;
import com.example.placementhub.repository.JobRepository;
import com.example.placementhub.repository.StudentRepository;
import com.example.placementhub.repository.UserRepository;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final StudentRepository studentRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final ApplicationStatusHistoryRepository applicationStatusHistoryRepository;
    private final NotificationService notificationService;

    public ApplicationService(
            ApplicationRepository applicationRepository,
            StudentRepository studentRepository,
            JobRepository jobRepository,
            UserRepository userRepository,
            ApplicationStatusHistoryRepository applicationStatusHistoryRepository,
            NotificationService notificationService
    ) {
        this.applicationRepository = applicationRepository;
        this.studentRepository = studentRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.applicationStatusHistoryRepository =
                applicationStatusHistoryRepository;
        this.notificationService = notificationService;
    }

    // =========================================================
    // GET APPLICATIONS FOR USER
    // =========================================================

    public List<ApplicationResponse> getApplicationsForUser(
            String username,
            boolean isAdmin
    ) {

        List<Application> applications;

        if (isAdmin) {

            applications = applicationRepository.findAll();

        } else {

            User user = userRepository.findByUsername(username)
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "User not found"
                            )
                    );

            if (user.getStudent() == null) {
                throw new ResourceNotFoundException(
                        "No student profile linked to this user"
                );
            }

            Long studentId = user.getStudent().getId();

            applications = applicationRepository
                    .findByStudentId(studentId);
        }

        return applications.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET APPLICATION HISTORY
    // =========================================================

    public List<ApplicationStatusHistory> getApplicationHistory(
            Long applicationId
    ) {

        applicationRepository.findById(applicationId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Application not found"
                        )
                );

        return applicationStatusHistoryRepository
                .findByApplicationIdOrderByChangedAtAsc(applicationId);
    }

    // =========================================================
    // GET APPLICATION BY ID
    // =========================================================

    public ApplicationResponse getApplicationById(
            Long id,
            String username,
            boolean isAdmin
    ) {

        Application application = applicationRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Application not found"
                        )
                );

        if (!isAdmin) {

            User user = userRepository.findByUsername(username)
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "User not found"
                            )
                    );

            if (user.getStudent() == null ||
                    !user.getStudent().getId()
                            .equals(application.getStudentId())) {

                throw new AccessDeniedException(
                        "You are not allowed to view this application"
                );
            }
        }

        return convertToResponse(application);
    }

    // =========================================================
    // SAVE APPLICATION
    // =========================================================

    @Transactional
    public Application saveApplication(
            ApplicationRequest request,
            String username
    ) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        )
                );

        if (user.getStudent() == null) {
            throw new ResourceNotFoundException(
                    "No student profile linked to this user"
            );
        }

        Student student = user.getStudent();

        Long studentId = student.getId();
        Long jobId = request.getJobId();

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Job not found"
                        )
                );

        // -----------------------------------------------------
        // CHECK JOB STATUS
        // -----------------------------------------------------

        if (JobStatus.CLOSED.equals(job.getStatus())) {

            throw new IllegalArgumentException(
                    "Applications are closed for this job"
            );
        }

        // -----------------------------------------------------
        // CHECK DUPLICATE APPLICATION
        // -----------------------------------------------------

        boolean alreadyApplied =
                applicationRepository.existsByStudentIdAndJobId(
                        studentId,
                        jobId
                );

        if (alreadyApplied) {

            throw new DuplicateApplicationException(
                    "You have already applied for this job"
            );
        }

        // -----------------------------------------------------
        // CHECK CGPA ELIGIBILITY
        // -----------------------------------------------------

        if (student.getCgpa() == null ||
                job.getMinimumCgpa() == null) {

            throw new IllegalArgumentException(
                    "CGPA information is missing"
            );
        }

        if (student.getCgpa() < job.getMinimumCgpa()) {

            throw new IllegalArgumentException(
                    "You are not eligible based on CGPA"
            );
        }

        // -----------------------------------------------------
        // CHECK BRANCH ELIGIBILITY
        // -----------------------------------------------------

        if (job.getEligibleBranch() != null &&
                !job.getEligibleBranch().equalsIgnoreCase(
                        student.getBranch()
                )) {

            throw new IllegalArgumentException(
                    "You are not eligible for this branch"
            );
        }

        // -----------------------------------------------------
        // CREATE APPLICATION
        // -----------------------------------------------------

        Application application = new Application();

        application.setStudentId(studentId);
        application.setJobId(jobId);
        application.setStatus(ApplicationStatus.APPLIED);

        Application savedApplication =
                applicationRepository.save(application);

        // -----------------------------------------------------
        // CREATE INITIAL STATUS HISTORY
        // -----------------------------------------------------

        createStatusHistory(
                savedApplication.getId(),
                ApplicationStatus.APPLIED,
                username
        );

        return savedApplication;
    }

    // =========================================================
    // UPDATE APPLICATION
    // =========================================================

    @Transactional
    public Application updateApplication(
            Long id,
            Application updatedApplication
    ) {

        return updateApplication(
                id,
                updatedApplication,
                "SYSTEM"
        );
    }

    // =========================================================
    // UPDATE APPLICATION WITH STATUS HISTORY
    // =========================================================

    @Transactional
    public Application updateApplication(
            Long id,
            Application updatedApplication,
            String changedBy
    ) {

        Application existingApplication =
                applicationRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Application not found"
                                )
                        );

        if (updatedApplication.getStudentId() == null ||
                updatedApplication.getJobId() == null) {

            throw new IllegalArgumentException(
                    "Student ID and Job ID are required"
            );
        }

        ApplicationStatus oldStatus =
                existingApplication.getStatus();

        ApplicationStatus newStatus =
                updatedApplication.getStatus();

        existingApplication.setStudentId(
                updatedApplication.getStudentId()
        );

        existingApplication.setJobId(
                updatedApplication.getJobId()
        );

        if (newStatus != null) {

            existingApplication.setStatus(newStatus);
        }

        Application savedApplication =
                applicationRepository.save(existingApplication);

        // -----------------------------------------------------
        // CREATE HISTORY + NOTIFICATION ONLY WHEN STATUS CHANGES
        // -----------------------------------------------------

        if (newStatus != null &&
                newStatus != oldStatus) {

            createStatusHistory(
                    savedApplication.getId(),
                    newStatus,
                    changedBy
            );

            createNotificationForStatusChange(
                    savedApplication,
                    newStatus
            );
        }

        return savedApplication;
    }

    // =========================================================
    // UPDATE APPLICATION STATUS
    // =========================================================

    @Transactional
    public Application updateApplicationStatus(
            Long id,
            ApplicationStatus status,
            String changedBy
    ) {

        Application application = applicationRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Application not found"
                        )
                );

        ApplicationStatus oldStatus =
                application.getStatus();

        application.setStatus(status);

        Application savedApplication =
                applicationRepository.save(application);

        // -----------------------------------------------------
        // CREATE HISTORY + NOTIFICATION ONLY WHEN STATUS CHANGES
        // -----------------------------------------------------

        if (status != oldStatus) {

            createStatusHistory(
                    savedApplication.getId(),
                    status,
                    changedBy
            );

            createNotificationForStatusChange(
                    savedApplication,
                    status
            );
        }

        return savedApplication;
    }

    // =========================================================
    // CREATE NOTIFICATION FOR STATUS CHANGE
    // =========================================================

    private void createNotificationForStatusChange(
            Application application,
            ApplicationStatus status
    ) {

        // No notification for APPLIED
        if (status == ApplicationStatus.APPLIED) {
            return;
        }

        Job job = jobRepository.findById(
                application.getJobId()
        ).orElse(null);

        if (job == null) {
            return;
        }

        String title;
        String message;

        if (status == ApplicationStatus.SHORTLISTED) {

            title = "Application Shortlisted";

            message =
                    "Your application for "
                            + job.getTitle()
                            + " at "
                            + job.getCompany()
                            + " has been shortlisted.";

        } else if (status == ApplicationStatus.SELECTED) {

            title = "Application Selected";

            message =
                    "Congratulations! You have been selected for "
                            + job.getTitle()
                            + " at "
                            + job.getCompany()
                            + ".";

        } else if (status == ApplicationStatus.REJECTED) {

            title = "Application Update";

            message =
                    "Your application for "
                            + job.getTitle()
                            + " at "
                            + job.getCompany()
                            + " has been rejected.";

        } else {

            return;
        }

        notificationService.createNotification(
                application.getStudentId(),
                title,
                message
        );
    }

    // =========================================================
    // DELETE APPLICATION
    // =========================================================

    @Transactional
    public void deleteApplication(Long id) {

        Application application =
                applicationRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Application not found"
                                )
                        );

        List<ApplicationStatusHistory> historyList =
                applicationStatusHistoryRepository
                        .findByApplicationIdOrderByChangedAtAsc(id);

        applicationStatusHistoryRepository.deleteAll(historyList);

        applicationRepository.delete(application);
    }

    // =========================================================
    // CREATE STATUS HISTORY
    // =========================================================

    private void createStatusHistory(
            Long applicationId,
            ApplicationStatus status,
            String changedBy
    ) {

        ApplicationStatusHistory history =
                new ApplicationStatusHistory();

        history.setApplicationId(applicationId);
        history.setStatus(status);
        history.setChangedBy(changedBy);
        history.setChangedAt(LocalDateTime.now());

        applicationStatusHistoryRepository.save(history);
    }

    // =========================================================
    // CONVERT APPLICATION TO RESPONSE DTO
    // =========================================================

    private ApplicationResponse convertToResponse(
            Application application
    ) {

        Student student = studentRepository
                .findById(application.getStudentId())
                .orElse(null);

        Job job = jobRepository
                .findById(application.getJobId())
                .orElse(null);

        String studentName = null;
        String studentEmail = null;
        Double studentCgpa = null;

        if (student != null) {

            studentName = student.getName();
            studentEmail = student.getEmail();
            studentCgpa = student.getCgpa();
        }

        String jobTitle = null;
        String company = null;

        if (job != null) {

            jobTitle = job.getTitle();
            company = job.getCompany();
        }

        return new ApplicationResponse(
                application.getId(),
                application.getStudentId(),
                studentName,
                studentEmail,
                studentCgpa,
                application.getJobId(),
                jobTitle,
                company,
                application.getStatus(),
                application.getAppliedAt(),
                application.getUpdatedAt()
        );
    }
}