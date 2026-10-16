package com.example.placementhub.dto;

public class ApplicationStatsResponse {

    private long totalApplications;
    private long applied;
    private long shortlisted;
    private long rejected;
    private long selected;

    public ApplicationStatsResponse() {
    }

    public ApplicationStatsResponse(
            long totalApplications,
            long applied,
            long shortlisted,
            long rejected,
            long selected) {

        this.totalApplications = totalApplications;
        this.applied = applied;
        this.shortlisted = shortlisted;
        this.rejected = rejected;
        this.selected = selected;
    }

    public long getTotalApplications() {
        return totalApplications;
    }

    public void setTotalApplications(long totalApplications) {
        this.totalApplications = totalApplications;
    }

    public long getApplied() {
        return applied;
    }

    public void setApplied(long applied) {
        this.applied = applied;
    }

    public long getShortlisted() {
        return shortlisted;
    }

    public void setShortlisted(long shortlisted) {
        this.shortlisted = shortlisted;
    }

    public long getRejected() {
        return rejected;
    }

    public void setRejected(long rejected) {
        this.rejected = rejected;
    }

    public long getSelected() {
        return selected;
    }

    public void setSelected(long selected) {
        this.selected = selected;
    }
}