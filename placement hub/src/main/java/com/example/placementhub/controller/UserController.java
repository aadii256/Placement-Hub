package com.example.placementhub.controller;

import com.example.placementhub.dto.UserResponse;
import com.example.placementhub.entity.Student;
import com.example.placementhub.entity.User;
import com.example.placementhub.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {

        List<UserResponse> users = userService.getAllUsers()
                .stream()
                .map(this::convertToResponse)
                .toList();

        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> getUserById(
            @PathVariable Long id
    ) {

        User user = userService.getUserById(id);

        return ResponseEntity.ok(
                convertToResponse(user)
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteUser(
            @PathVariable Long id
    ) {

        userService.deleteUser(id);

        return ResponseEntity.ok(
                "User deleted successfully"
        );
    }

    private UserResponse convertToResponse(User user) {

        Student student = user.getStudent();

        Long studentId = null;
        String studentName = null;
        String studentEmail = null;

        if (student != null) {

            studentId = student.getId();
            studentName = student.getName();
            studentEmail = student.getEmail();
        }

        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getRole(),
                studentId,
                studentName,
                studentEmail
        );
    }
}