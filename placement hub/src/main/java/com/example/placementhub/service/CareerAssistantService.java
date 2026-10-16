package com.example.placementhub.service;

import com.example.placementhub.entity.Student;
import com.example.placementhub.entity.User;
import com.example.placementhub.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class CareerAssistantService {

    private final GeminiService geminiService;
    private final UserRepository userRepository;

    public CareerAssistantService(
            GeminiService geminiService,
            UserRepository userRepository
    ) {
        this.geminiService = geminiService;
        this.userRepository = userRepository;
    }

    public String ask(String username, String question) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found")
                );

        Student student = user.getStudent();

        if (student == null) {
            throw new IllegalArgumentException(
                    "Student profile is not linked to this account"
            );
        }

        String prompt = buildPrompt(student, question);

        return geminiService.generateResponse(prompt);
    }

    private String buildPrompt(
            Student student,
            String question
    ) {

        return """
                You are an AI Career Assistant inside a college
                placement management platform called PlacementHub.

                Give practical, honest and student-friendly career
                guidance.

                Student profile:

                Name: %s
                Branch: %s
                CGPA: %s
                Graduation Year: %s

                Student's question:

                %s

                Instructions:

                1. Answer the student's question directly.
                2. Give practical guidance suitable for a college
                   student preparing for software or technical
                   placements.
                3. If the question is about learning skills,
                   suggest a realistic learning path.
                4. If the question is about DSA, programming,
                   backend development, databases, CS fundamentals,
                   projects or placements, give structured guidance.
                5. Do not invent information about the student's
                   experience or skills.
                6. Use the student's profile only when relevant.
                7. Keep the answer clear and reasonably concise.
                8. Use bullet points or numbered steps when useful.
                """.formatted(
                student.getName(),
                student.getBranch(),
                student.getCgpa(),
                student.getGraduationYear(),
                question
        );
    }
}