
package com.example.placementhub.service;

import com.example.placementhub.entity.Resume;
import com.example.placementhub.entity.Student;
import com.example.placementhub.entity.User;
import com.example.placementhub.repository.ResumeRepository;
import com.example.placementhub.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

@Service
public class ResumeService {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;

    public ResumeService(
            ResumeRepository resumeRepository,
            UserRepository userRepository
    ) {
        this.resumeRepository = resumeRepository;
        this.userRepository = userRepository;
    }

    public Resume uploadOrUpdateResume(
            String username,
            MultipartFile file
    ) throws IOException {

        validateFile(file);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found"
                        )
                );

        Student student = user.getStudent();

        if (student == null) {
            throw new IllegalArgumentException(
                    "No student profile is linked to this account"
            );
        }

        Optional<Resume> existingResume =
                resumeRepository.findByStudentId(student.getId());

        Resume resume = existingResume.orElseGet(Resume::new);

        resume.setStudent(student);
        resume.setOriginalFileName(
                sanitizeFileName(file.getOriginalFilename())
        );
        resume.setContentType(file.getContentType());
        resume.setFileSize(file.getSize());
        resume.setFileData(file.getBytes());

        return resumeRepository.save(resume);
    }

    public Resume getOwnResume(String username) {

        Student student = getStudentFromUsername(username);

        return resumeRepository.findByStudentId(student.getId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Resume not found"
                        )
                );
    }

    public byte[] downloadOwnResume(String username) {

        Resume resume = getOwnResume(username);

        return resume.getFileData();
    }

    public String getOwnResumeFileName(String username) {

        Resume resume = getOwnResume(username);

        return resume.getOriginalFileName();
    }

    public String getOwnResumeContentType(String username) {

        Resume resume = getOwnResume(username);

        return resume.getContentType();
    }

    public void deleteOwnResume(String username) {

        Student student = getStudentFromUsername(username);

        Resume resume = resumeRepository
                .findByStudentId(student.getId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Resume not found"
                        )
                );

        resumeRepository.delete(resume);
    }

    private Student getStudentFromUsername(String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found"
                        )
                );

        Student student = user.getStudent();

        if (student == null) {
            throw new IllegalArgumentException(
                    "No student profile is linked to this account"
            );
        }

        return student;
    }

    private void validateFile(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "Please select a resume file"
            );
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                    "Resume file size must not exceed 5 MB"
            );
        }

        String contentType = file.getContentType();

        if (!"application/pdf".equalsIgnoreCase(contentType)) {
            throw new IllegalArgumentException(
                    "Only PDF resume files are allowed"
            );
        }

        String fileName = file.getOriginalFilename();

        if (fileName == null ||
                !fileName.toLowerCase().endsWith(".pdf")) {

            throw new IllegalArgumentException(
                    "Resume must have a PDF file extension"
            );
        }
    }

    private String sanitizeFileName(String fileName) {

        if (fileName == null || fileName.isBlank()) {
            return "resume.pdf";
        }

        String sanitizedName = fileName
                .replace("\\", "/")
                .substring(
                        fileName.replace("\\", "/").lastIndexOf("/") + 1
                );

        if (sanitizedName.isBlank()) {
            return "resume.pdf";
        }

        return sanitizedName;
    }
}