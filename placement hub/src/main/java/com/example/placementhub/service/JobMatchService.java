package com.example.placementhub.service;

import com.example.placementhub.dto.JobMatchResponse;
import com.example.placementhub.entity.Job;
import com.example.placementhub.entity.Student;
import com.example.placementhub.repository.JobRepository;
import com.example.placementhub.repository.StudentRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import org.springframework.stereotype.Service;

@Service
public class JobMatchService {

    private final Client geminiClient;
    private final StudentRepository studentRepository;
    private final JobRepository jobRepository;
    private final ObjectMapper objectMapper;

    public JobMatchService(
            Client geminiClient,
            StudentRepository studentRepository,
            JobRepository jobRepository,
            ObjectMapper objectMapper
    ) {
        this.geminiClient = geminiClient;
        this.studentRepository = studentRepository;
        this.jobRepository = jobRepository;
        this.objectMapper = objectMapper;
    }

    public JobMatchResponse analyzeMatch(Long studentId, Long jobId) {

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        String prompt = buildPrompt(student, job);

        GenerateContentResponse response =
                geminiClient.models.generateContent(
                        "gemini-3.8-flash",
                        prompt,
                        null
                );

        String aiResponse = response.text();

        try {
            return objectMapper.readValue(aiResponse, JobMatchResponse.class);
        } catch (Exception e) {
            throw new RuntimeException(
                    "Unable to process Gemini response: " + aiResponse,
                    e
            );
        }
    }

    private String buildPrompt(Student student, Job job) {

        return """
                You are an AI job matching assistant for a college placement platform.

                Analyze how well the following student matches the following job.

                STUDENT:
                Name: %s
                Branch: %s
                CGPA: %s
                Graduation Year: %s

                JOB:
                Title: %s
                Company: %s
                Location: %s
                Package: %s LPA
                Eligible Branch: %s
                Minimum CGPA: %s
                Description: %s

                IMPORTANT:
                1. Consider branch compatibility.
                2. Consider CGPA eligibility.
                3. Consider graduation year when relevant.
                4. Analyze the job title and description against the student's available profile information.
                5. Do not invent skills, projects, certifications, or experience that are not provided.
                6. Give a match percentage between 0 and 100.
                7. Give specific reasons for the match.
                8. Mention missing information or requirements where appropriate.
                9. Give practical suggestions for improving the student's suitability.
                10. Return ONLY valid JSON.
                11. Do not use markdown code blocks.
                12. Use exactly this JSON structure:

                {
                  "matchPercentage": 0,
                  "matchingPoints": [],
                  "missingSkills": [],
                  "suggestions": []
                }
                """.formatted(
                student.getName(),
                student.getBranch(),
                student.getCgpa(),
                student.getGraduationYear(),
                job.getTitle(),
                job.getCompany(),
                job.getLocation(),
                job.getPackageLPA(),
                job.getEligibleBranch(),
                job.getMinimumCgpa(),
                job.getDescription()
        );
    }
}