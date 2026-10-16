package com.example.placementhub.dto;

public class StudentDashboardResponse {

    private Long studentId;
    private String name;
    private String email;
    private String branch;
    private Double cgpa;
    private String graduationYear;

    private long availableJobs;
    private long myApplications;

    public StudentDashboardResponse() {
    }

    public StudentDashboardResponse(
            Long studentId,
            String name,
            String email,
            String branch,
            Double cgpa,
            String graduationYear,
            long availableJobs,
            long myApplications) {

        this.studentId = studentId;
        this.name = name;
        this.email = email;
        this.branch = branch;
        this.cgpa = cgpa;
        this.graduationYear = graduationYear;
        this.availableJobs = availableJobs;
        this.myApplications = myApplications;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getBranch() {
        return branch;
    }

    public void setBranch(String branch) {
        this.branch = branch;
    }

    public Double getCgpa() {
        return cgpa;
    }

    public void setCgpa(Double cgpa) {
        this.cgpa = cgpa;
    }

    public String getGraduationYear() {
        return graduationYear;
    }

    public void setGraduationYear(String graduationYear) {
        this.graduationYear = graduationYear;
    }

    public long getAvailableJobs() {
        return availableJobs;
    }

    public void setAvailableJobs(long availableJobs) {
        this.availableJobs = availableJobs;
    }

    public long getMyApplications() {
        return myApplications;
    }

    public void setMyApplications(long myApplications) {
        this.myApplications = myApplications;
    }
}