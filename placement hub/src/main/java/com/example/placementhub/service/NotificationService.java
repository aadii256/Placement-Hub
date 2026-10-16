package com.example.placementhub.service;

import com.example.placementhub.entity.Notification;
import com.example.placementhub.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(
            NotificationRepository notificationRepository) {

        this.notificationRepository = notificationRepository;
    }

    public Notification createNotification(
            Long studentId,
            String title,
            String message) {

        Notification notification =
                new Notification(studentId, title, message);

        return notificationRepository.save(notification);
    }

    public List<Notification> getStudentNotifications(
            Long studentId) {

        return notificationRepository
                .findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    public long getUnreadCount(Long studentId) {

        return notificationRepository
                .countByStudentIdAndReadStatus(studentId, false);
    }

    public Notification markAsRead(
            Long notificationId,
            Long studentId) {

        Notification notification =
                notificationRepository.findById(notificationId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Notification not found"));

        // Security check:
        // A student can only modify their own notification.
        if (!notification.getStudentId().equals(studentId)) {
            throw new RuntimeException(
                    "You are not allowed to access this notification");
        }

        notification.setReadStatus(true);

        return notificationRepository.save(notification);
    }

    public void markAllAsRead(Long studentId) {

        List<Notification> notifications =
                notificationRepository
                        .findByStudentIdOrderByCreatedAtDesc(studentId);

        for (Notification notification : notifications) {
            notification.setReadStatus(true);
        }

        notificationRepository.saveAll(notifications);
    }
}