package com.example.placementhub.dto;

import java.util.List;

public class JobMatchResponse {

    private int matchPercentage;

    private List<String> matchingPoints;

    private List<String> missingSkills;

    private List<String> suggestions;

    public JobMatchResponse() {
    }

    public JobMatchResponse(
            int matchPercentage,
            List<String> matchingPoints,
            List<String> missingSkills,
            List<String> suggestions
    ) {
        this.matchPercentage = matchPercentage;
        this.matchingPoints = matchingPoints;
        this.missingSkills = missingSkills;
        this.suggestions = suggestions;
    }

    public int getMatchPercentage() {
        return matchPercentage;
    }

    public void setMatchPercentage(int matchPercentage) {
        this.matchPercentage = matchPercentage;
    }

    public List<String> getMatchingPoints() {
        return matchingPoints;
    }

    public void setMatchingPoints(List<String> matchingPoints) {
        this.matchingPoints = matchingPoints;
    }

    public List<String> getMissingSkills() {
        return missingSkills;
    }

    public void setMissingSkills(List<String> missingSkills) {
        this.missingSkills = missingSkills;
    }

    public List<String> getSuggestions() {
        return suggestions;
    }

    public void setSuggestions(List<String> suggestions) {
        this.suggestions = suggestions;
    }
}