package com.example.placementhub.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.genai.Client;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GeminiConfig {

    @Bean
    public Client geminiClient() {
        return Client.builder()
                .apiKey(System.getenv("GOOGLE_API_KEY"))
                .build();
    }

    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }
}