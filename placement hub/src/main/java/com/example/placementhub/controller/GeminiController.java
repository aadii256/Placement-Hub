package com.example.placementhub.controller;

import com.example.placementhub.service.GeminiService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/ai")
public class GeminiController {

    private final GeminiService geminiService;

    public GeminiController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping("/test")
    @PreAuthorize("hasRole('STUDENT')")
    public Map<String, String> testGemini(@RequestBody Map<String, String> request) {

        String prompt = request.get("prompt");

        if (prompt == null || prompt.trim().isEmpty()) {
            throw new RuntimeException("Prompt is required");
        }

        String response = geminiService.generateResponse(prompt);

        return Map.of(
                "response", response
        );
    }
}