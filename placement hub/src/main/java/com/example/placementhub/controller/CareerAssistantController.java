package com.example.placementhub.controller;

import com.example.placementhub.service.CareerAssistantService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/ai")
public class CareerAssistantController {

    private final CareerAssistantService careerAssistantService;

    public CareerAssistantController(
            CareerAssistantService careerAssistantService
    ) {
        this.careerAssistantService = careerAssistantService;
    }

    @PostMapping("/career-assistant")
    @PreAuthorize("hasRole('STUDENT')")
    public Map<String, String> askCareerAssistant(
            @RequestBody Map<String, String> request,
            Principal principal
    ) {

        String question = request.get("question");

        if (question == null || question.isBlank()) {
            throw new IllegalArgumentException("Question is required");
        }

        String answer = careerAssistantService.ask(
                principal.getName(),
                question
        );

        return Map.of(
                "question", question,
                "answer", answer
        );
    }
}