package com.example.placementhub.dto;

public class DashboardStatsResponse {

    private long totalStudents;
    private long totalCompanies;
    private long totalJobs;
    private long totalApplications;

    public DashboardStatsResponse() {
    }

    public DashboardStatsResponse(
            long totalStudents,
            long totalCompanies,
            long totalJobs,
            long totalApplications) {

        this.totalStudents = totalStudents;
        this.totalCompanies = totalCompanies;
        this.totalJobs = totalJobs;
        this.totalApplications = totalApplications;
    }

    public long getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(long totalStudents) {
        this.totalStudents = totalStudents;
    }

    public long getTotalCompanies() {
        return totalCompanies;
    }

    public void setTotalCompanies(long totalCompanies) {
        this.totalCompanies = totalCompanies;
    }

    public long getTotalJobs() {
        return totalJobs;
    }

    public void setTotalJobs(long totalJobs) {
        this.totalJobs = totalJobs;
    }

    public long getTotalApplications() {
        return totalApplications;
    }

    public void setTotalApplications(long totalApplications) {
        this.totalApplications = totalApplications;
    }
}