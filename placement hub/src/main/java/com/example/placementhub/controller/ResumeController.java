
package com.example.placementhub.controller;

import com.example.placementhub.entity.Resume;
import com.example.placementhub.service.ResumeService;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/resumes")
public class ResumeController {

    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    @PostMapping("/upload")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> uploadResume(
            @RequestParam("file") MultipartFile file,
            Principal principal
    ) throws Exception {

        Resume resume = resumeService.uploadOrUpdateResume(
                principal.getName(),
                file
        );

        Map<String, Object> response = new HashMap<>();

        response.put("message", "Resume uploaded successfully");
        response.put("resumeId", resume.getId());
        response.put("fileName", resume.getOriginalFileName());
        response.put("fileSize", resume.getFileSize());
        response.put("uploadedAt", resume.getUploadedAt());
        response.put("updatedAt", resume.getUpdatedAt());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> getOwnResume(
            Principal principal
    ) {

        Resume resume = resumeService.getOwnResume(
                principal.getName()
        );

        Map<String, Object> response = new HashMap<>();

        response.put("resumeId", resume.getId());
        response.put("fileName", resume.getOriginalFileName());
        response.put("contentType", resume.getContentType());
        response.put("fileSize", resume.getFileSize());
        response.put("uploadedAt", resume.getUploadedAt());
        response.put("updatedAt", resume.getUpdatedAt());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/download")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Resource> downloadResume(
            Principal principal
    ) {

        byte[] fileData = resumeService.downloadOwnResume(
                principal.getName()
        );

        String fileName = resumeService.getOwnResumeFileName(
                principal.getName()
        );

        String contentType = resumeService.getOwnResumeContentType(
                principal.getName()
        );

        ByteArrayResource resource =
                new ByteArrayResource(fileData);

        ContentDisposition contentDisposition =
                ContentDisposition.attachment()
                        .filename(
                                fileName,
                                StandardCharsets.UTF_8
                        )
                        .build();

        return ResponseEntity.ok()
                .contentType(
                        MediaType.parseMediaType(contentType)
                )
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        contentDisposition.toString()
                )
                .contentLength(fileData.length)
                .body(resource);
    }

    @GetMapping("/view")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Resource> viewResume(
            Principal principal
    ) {

        byte[] fileData = resumeService.downloadOwnResume(
                principal.getName()
        );

        String fileName = resumeService.getOwnResumeFileName(
                principal.getName()
        );

        String contentType = resumeService.getOwnResumeContentType(
                principal.getName()
        );

        ByteArrayResource resource =
                new ByteArrayResource(fileData);

        ContentDisposition contentDisposition =
                ContentDisposition.inline()
                        .filename(
                                fileName,
                                StandardCharsets.UTF_8
                        )
                        .build();

        return ResponseEntity.ok()
                .contentType(
                        MediaType.parseMediaType(contentType)
                )
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        contentDisposition.toString()
                )
                .contentLength(fileData.length)
                .body(resource);
    }

    @DeleteMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, String>> deleteResume(
            Principal principal
    ) {

        resumeService.deleteOwnResume(
                principal.getName()
        );

        Map<String, String> response = new HashMap<>();

        response.put("message", "Resume deleted successfully");

        return ResponseEntity.ok(response);
    }
}