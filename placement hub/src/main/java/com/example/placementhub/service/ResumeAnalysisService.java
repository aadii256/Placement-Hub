package com.example.placementhub.service;

import com.example.placementhub.dto.ResumeAnalysisResponse;
import com.example.placementhub.entity.Resume;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

@Service
public class ResumeAnalysisService {

    private final ResumeService resumeService;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    public ResumeAnalysisService(
            ResumeService resumeService,
            GeminiService geminiService,
            ObjectMapper objectMapper
    ) {
        this.resumeService = resumeService;
        this.geminiService = geminiService;
        this.objectMapper = objectMapper;
    }

    public ResumeAnalysisResponse analyzeResume(String username)
            throws Exception {

        // 1. Get the logged-in student's resume
        Resume resume = resumeService.getOwnResume(username);

        // 2. Get the actual PDF bytes
        byte[] pdfData = resume.getFileData();

        if (pdfData == null || pdfData.length == 0) {
            throw new IllegalArgumentException(
                    "Resume file data is empty"
            );
        }

        // 3. Create AI prompt
        String prompt = buildPrompt();

        // 4. Send PDF directly to Gemini
        String aiResponse =
                geminiService.generatePdfResponse(
                        pdfData,
                        prompt
                );

        // 5. Parse Gemini JSON
        return parseResponse(aiResponse);
    }

    private String buildPrompt() {

        return """
                You are an AI resume analyzer for a college placement platform.

                Analyze the attached student's resume carefully.

                Evaluate the resume based ONLY on the information
                actually present in the uploaded document.

                First determine whether the uploaded document is
                actually a resume.

                If the document is NOT a resume:

                - Set atsScore to 0.
                - Explain that the uploaded document is not a resume.
                - Do not treat academic questions, exam questions,
                  or unrelated document content as resume skills.
                - Keep detectedSkills empty.
                - Keep strengths empty.
                - Provide useful suggestions telling the student
                  to upload a valid resume.

                If the document IS a resume, evaluate:

                1. ATS compatibility
                2. Technical skills
                3. Missing or weak technical skills
                4. Resume strengths
                5. Areas that need improvement
                6. Actionable suggestions

                Return ONLY valid JSON.

                Do not use markdown.
                Do not use ```json.
                Do not add explanations outside the JSON.

                Use exactly this JSON structure:

                {
                  "atsScore": 0,
                  "overallFeedback": "",
                  "detectedSkills": [],
                  "missingSkills": [],
                  "strengths": [],
                  "improvements": [],
                  "suggestions": []
                }

                Rules:

                - atsScore must be an integer from 0 to 100.
                - detectedSkills must contain skills actually present
                  in the resume.
                - missingSkills should contain relevant skills that
                  could improve the resume for software/technical
                  placement roles.
                - strengths should contain specific strengths found
                  in the resume.
                - improvements should contain specific weaknesses
                  or areas that need improvement.
                - suggestions should be practical and actionable.
                - Do not invent experience, projects, certifications,
                  education, achievements, or skills.
                - Keep each list concise and useful.
                """;
    }

    private ResumeAnalysisResponse parseResponse(
            String aiResponse
    ) throws Exception {

        if (aiResponse == null || aiResponse.isBlank()) {
            throw new IllegalArgumentException(
                    "Gemini returned an empty response"
            );
        }

        String json = cleanJsonResponse(aiResponse);

        return objectMapper.readValue(
                json,
                ResumeAnalysisResponse.class
        );
    }

    private String cleanJsonResponse(String aiResponse) {

        String cleaned = aiResponse.trim();

        // Remove markdown code fences if Gemini adds them
        if (cleaned.startsWith("```")) {

            cleaned = cleaned
                    .replaceFirst("^```json\\s*", "")
                    .replaceFirst("^```\\s*", "");

            cleaned = cleaned.replaceFirst("\\s*```$", "");
        }

        cleaned = cleaned.trim();

        /*
         * If Gemini adds text before/after the JSON,
         * extract only the JSON object.
         */
        int firstBrace = cleaned.indexOf("{");
        int lastBrace = cleaned.lastIndexOf("}");

        if (firstBrace >= 0 && lastBrace > firstBrace) {

            cleaned = cleaned.substring(
                    firstBrace,
                    lastBrace + 1
            );
        }

        return cleaned.trim();
    }
}