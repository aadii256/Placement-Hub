package com.example.placementhub.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class ResumeTextExtractorService {

    public String extractText(byte[] pdfData) throws IOException {

        if (pdfData == null || pdfData.length == 0) {
            throw new IllegalArgumentException(
                    "Resume file data is empty"
            );
        }

        try (var document = Loader.loadPDF(pdfData)) {

            PDFTextStripper pdfTextStripper =
                    new PDFTextStripper();

            String extractedText =
                    pdfTextStripper.getText(document);

            if (extractedText == null ||
                    extractedText.isBlank()) {

                throw new IllegalArgumentException(
                        "Could not extract text from the resume PDF"
                );
            }

            return extractedText.trim();
        }
    }
}