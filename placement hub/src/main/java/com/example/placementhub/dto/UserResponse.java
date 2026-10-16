package com.example.placementhub.dto;

import com.example.placementhub.entity.Role;

public class UserResponse {

    private Long id;
    private String username;
    private Role role;
    private Long studentId;
    private String studentName;
    private String studentEmail;

    public UserResponse() {
    }

    public UserResponse(
            Long id,
            String username,
            Role role,
            Long studentId,
            String studentName,
            String studentEmail
    ) {
        this.id = id;
        this.username = username;
        this.role = role;
        this.studentId = studentId;
        this.studentName = studentName;
        this.studentEmail = studentEmail;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
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
}