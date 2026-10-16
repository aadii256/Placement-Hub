package com.example.placementhub.entity;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Company name is required")
    private String name;

    @NotBlank(message = "Location is required")
    private String location;

    @NotBlank(message = "Job role is required")
    private String jobRole;

    @DecimalMin(value = "0.0", message = "Package LPA cannot be less than 0")
    private Double packageLPA;

    @DecimalMin(value = "0.0", message = "Minimum CGPA cannot be less than 0")
    @DecimalMax(value = "10.0", message = "Minimum CGPA cannot be greater than 10")
    private Double minimumCgpa;
    public Company() {
    }

    // Getters and Setters

    public Double getMinimumCgpa() {
        return minimumCgpa;
    }

    public void setMinimumCgpa(Double minimumCgpa) {
        this.minimumCgpa = minimumCgpa;
    }

    public Double getPackageLPA() {
        return packageLPA;
    }

    public void setPackageLPA(Double packageLPA) {
        this.packageLPA = packageLPA;
    }

    public String getJobRole() {
        return jobRole;
    }

    public void setJobRole(String jobRole) {
        this.jobRole = jobRole;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}