package com.example.placementhub.service;

import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;
import org.springframework.stereotype.Service;

@Service
public class GeminiService {

    private final Client geminiClient;

    public GeminiService(Client geminiClient) {
        this.geminiClient = geminiClient;
    }

    /*
     * Existing method.
     *
     * Used by the AI Job Match feature.
     * Do not remove or change this method.
     */
    public String generateResponse(String prompt) {

        GenerateContentResponse response =
                geminiClient.models.generateContent(
                        "gemini-3.8-flash",
                        prompt,
                        null
                );

        return response.text();
    }

    /*
     * New method for Resume Analyzer.
     *
     * Sends the actual PDF file to Gemini instead of
     * relying on PDFBox text extraction.
     */
    public String generatePdfResponse(
            byte[] pdfData,
            String prompt
    ) {

        Part pdfPart = Part.fromBytes(
                pdfData,
                "application/pdf"
        );

        Content content = Content.fromParts(
                Part.fromText(prompt),
                pdfPart
        );

        GenerateContentResponse response =
                geminiClient.models.generateContent(
                        "gemini-3.8-flash",
                        content,
                        null
                );

        return response.text();
    }
}