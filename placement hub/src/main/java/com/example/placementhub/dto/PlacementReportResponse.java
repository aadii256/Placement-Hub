package com.example.placementhub.dto;

public class PlacementReportResponse {

    private Long applicationId;
    private String studentName;
    private String studentEmail;
    private String branch;
    private String companyName;
    private String jobTitle;
    private String location;
    private String packageLPA;
    private String status;

    public PlacementReportResponse() {
    }

    public PlacementReportResponse(
            Long applicationId,
            String studentName,
            String studentEmail,
            String branch,
            String companyName,
            String jobTitle,
            String location,
            String packageLPA,
            String status
    ) {
        this.applicationId = applicationId;
        this.studentName = studentName;
        this.studentEmail = studentEmail;
        this.branch = branch;
        this.companyName = companyName;
        this.jobTitle = jobTitle;
        this.location = location;
        this.packageLPA = packageLPA;
        this.status = status;
    }

    public Long getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(Long applicationId) {
        this.applicationId = applicationId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
    }

    public String getBranch() {
        return branch;
    }

    public void setBranch(String branch) {
        this.branch = branch;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getPackageLPA() {
        return packageLPA;
    }

    public void setPackageLPA(String packageLPA) {
        this.packageLPA = packageLPA;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}