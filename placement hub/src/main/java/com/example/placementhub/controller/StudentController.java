
package com.example.placementhub.controller;

import com.example.placementhub.entity.Student;
import com.example.placementhub.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping("/students")
    public List<Student> getAllStudents() {
        return studentService.getAllStudents();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/students")
    public Student addStudent(@Valid @RequestBody Student student) {
        return studentService.saveStudent(student);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/students/{id}")
    public void deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
    }

    @GetMapping("/students/{id}")
    public Student getStudentById(@PathVariable Long id) {
        return studentService.getStudentById(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/students/{id}")
    public Student updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody Student student
    ) {
        return studentService.updateStudent(id, student);
    }

    // Student updates their own profile
    @PreAuthorize("hasRole('STUDENT')")
    @PutMapping("/students/me")
    public Student updateOwnProfile(
            @Valid @RequestBody Student student,
            Authentication authentication
    ) {
        String username = authentication.getName();

        return studentService.updateOwnProfile(username, student);
    }
    // Student views their own profile
    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/students/me")
    public Student getOwnProfile(Authentication authentication) {

        String username = authentication.getName();

        return studentService.getOwnProfile(username);
    }
}