package com.example.placementhub.dto;

public class PlacementStatsResponse {

    private long totalApplications;
    private long selectedApplications;
    private long shortlistedApplications;
    private double selectionRate;

    public PlacementStatsResponse() {
    }

    public PlacementStatsResponse(
            long totalApplications,
            long selectedApplications,
            long shortlistedApplications,
            double selectionRate) {

        this.totalApplications = totalApplications;
        this.selectedApplications = selectedApplications;
        this.shortlistedApplications = shortlistedApplications;
        this.selectionRate = selectionRate;
    }

    public long getTotalApplications() {
        return totalApplications;
    }

    public void setTotalApplications(long totalApplications) {
        this.totalApplications = totalApplications;
    }

    public long getSelectedApplications() {
        return selectedApplications;
    }

    public void setSelectedApplications(long selectedApplications) {
        this.selectedApplications = selectedApplications;
    }

    public long getShortlistedApplications() {
        return shortlistedApplications;
    }

    public void setShortlistedApplications(long shortlistedApplications) {
        this.shortlistedApplications = shortlistedApplications;
    }

    public double getSelectionRate() {
        return selectionRate;
    }

    public void setSelectionRate(double selectionRate) {
        this.selectionRate = selectionRate;
    }
}