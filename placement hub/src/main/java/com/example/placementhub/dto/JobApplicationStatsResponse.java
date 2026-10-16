package com.example.placementhub.dto;

public class JobApplicationStatsResponse {

    private Long jobId;
    private String jobTitle;
    private String company;
    private long applicationCount;

    public JobApplicationStatsResponse() {
    }

    public JobApplicationStatsResponse(
            Long jobId,
            String jobTitle,
            String company,
            long applicationCount) {

        this.jobId = jobId;
        this.jobTitle = jobTitle;
        this.company = company;
        this.applicationCount = applicationCount;
    }

    public Long getJobId() {
        return jobId;
    }

    public void setJobId(Long jobId) {
        this.jobId = jobId;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public long getApplicationCount() {
        return applicationCount;
    }

    public void setApplicationCount(long applicationCount) {
        this.applicationCount = applicationCount;
    }
}