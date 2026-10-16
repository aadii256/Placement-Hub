package com.example.placementhub.controller;

import com.example.placementhub.entity.Notification;
import com.example.placementhub.entity.User;
import com.example.placementhub.repository.UserRepository;
import com.example.placementhub.service.NotificationService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public NotificationController(
            NotificationService notificationService,
            UserRepository userRepository) {

        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    @GetMapping
    @PreAuthorize("hasRole('STUDENT')")
    public List<Notification> getNotifications(
            Principal principal) {

        Long studentId = getStudentId(principal);

        return notificationService
                .getStudentNotifications(studentId);
    }

    @GetMapping("/unread-count")
    @PreAuthorize("hasRole('STUDENT')")
    public long getUnreadCount(
            Principal principal) {

        Long studentId = getStudentId(principal);

        return notificationService
                .getUnreadCount(studentId);
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("hasRole('STUDENT')")
    public Notification markAsRead(
            @PathVariable Long id,
            Principal principal) {

        Long studentId = getStudentId(principal);

        return notificationService
                .markAsRead(id, studentId);
    }

    @PutMapping("/read-all")
    @PreAuthorize("hasRole('STUDENT')")
    public void markAllAsRead(
            Principal principal) {

        Long studentId = getStudentId(principal);

        notificationService
                .markAllAsRead(studentId);
    }

    private Long getStudentId(Principal principal) {

        User user = userRepository
                .findByUsername(principal.getName())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (user.getStudent() == null) {
            throw new RuntimeException(
                    "Student profile is not linked to this account");
        }

        return user.getStudent().getId();
    }
}