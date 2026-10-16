package com.example.placementhub.dto;

public class PlacementReadinessResponse {

    private int score;

    private boolean profileComplete;
    private boolean resumeUploaded;
    private boolean hasApplications;
    private boolean hasShortlistedApplication;

    public PlacementReadinessResponse() {
    }

    public PlacementReadinessResponse(
            int score,
            boolean profileComplete,
            boolean resumeUploaded,
            boolean hasApplications,
            boolean hasShortlistedApplication
    ) {
        this.score = score;
        this.profileComplete = profileComplete;
        this.resumeUploaded = resumeUploaded;
        this.hasApplications = hasApplications;
        this.hasShortlistedApplication = hasShortlistedApplication;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public boolean isProfileComplete() {
        return profileComplete;
    }

    public void setProfileComplete(boolean profileComplete) {
        this.profileComplete = profileComplete;
    }

    public boolean isResumeUploaded() {
        return resumeUploaded;
    }

    public void setResumeUploaded(boolean resumeUploaded) {
        this.resumeUploaded = resumeUploaded;
    }

    public boolean isHasApplications() {
        return hasApplications;
    }

    public void setHasApplications(boolean hasApplications) {
        this.hasApplications = hasApplications;
    }

    public boolean isHasShortlistedApplication() {
        return hasShortlistedApplication;
    }

    public void setHasShortlistedApplication(
            boolean hasShortlistedApplication
    ) {
        this.hasShortlistedApplication = hasShortlistedApplication;
    }
}