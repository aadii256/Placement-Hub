
package com.example.placementhub.dto;

public class PublicStatsResponse {

    private long totalCompanies;
    private long activeJobs;
    private long totalStudents;
    private long totalApplications;

    public PublicStatsResponse() {
    }

    public PublicStatsResponse(
            long totalCompanies,
            long activeJobs,
            long totalStudents,
            long totalApplications) {

        this.totalCompanies = totalCompanies;
        this.activeJobs = activeJobs;
        this.totalStudents = totalStudents;
        this.totalApplications = totalApplications;
    }

    public long getTotalCompanies() {
        return totalCompanies;
    }

    public void setTotalCompanies(long totalCompanies) {
        this.totalCompanies = totalCompanies;
    }

    public long getActiveJobs() {
        return activeJobs;
    }

    public void setActiveJobs(long activeJobs) {
        this.activeJobs = activeJobs;
    }

    public long getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(long totalStudents) {
        this.totalStudents = totalStudents;
    }

    public long getTotalApplications() {
        return totalApplications;
    }

    public void setTotalApplications(long totalApplications) {
        this.totalApplications = totalApplications;
    }
}