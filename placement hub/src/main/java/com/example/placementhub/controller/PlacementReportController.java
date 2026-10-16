package com.example.placementhub.controller;

import com.example.placementhub.dto.PlacementReportResponse;
import com.example.placementhub.service.PlacementReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
public class PlacementReportController {

    private final PlacementReportService placementReportService;

    public PlacementReportController(
            PlacementReportService placementReportService) {

        this.placementReportService = placementReportService;
    }

    @GetMapping("/admin/reports/placements")
    @PreAuthorize("hasRole('ADMIN')")
    public List<PlacementReportResponse> getPlacementReport() {

        return placementReportService.getPlacementReport();
    }

    @GetMapping("/admin/reports/placements/csv")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportPlacementReportCsv() {

        List<PlacementReportResponse> report =
                placementReportService.getPlacementReport();

        StringBuilder csv = new StringBuilder();

        csv.append("Application ID,")
                .append("Student Name,")
                .append("Student Email,")
                .append("Branch,")
                .append("Company,")
                .append("Job Title,")
                .append("Location,")
                .append("Package LPA,")
                .append("Status")
                .append("\n");

        for (PlacementReportResponse item : report) {

            csv.append(csvValue(item.getApplicationId()))
                    .append(",")
                    .append(csvValue(item.getStudentName()))
                    .append(",")
                    .append(csvValue(item.getStudentEmail()))
                    .append(",")
                    .append(csvValue(item.getBranch()))
                    .append(",")
                    .append(csvValue(item.getCompanyName()))
                    .append(",")
                    .append(csvValue(item.getJobTitle()))
                    .append(",")
                    .append(csvValue(item.getLocation()))
                    .append(",")
                    .append(csvValue(item.getPackageLPA()))
                    .append(",")
                    .append(csvValue(item.getStatus()))
                    .append("\n");
        }

        byte[] csvBytes =
                csv.toString().getBytes(StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=placement-report.csv"
                )
                .contentType(
                        MediaType.parseMediaType("text/csv")
                )
                .body(csvBytes);
    }

    private String csvValue(Object value) {

        if (value == null) {
            return "";
        }

        String text = String.valueOf(value);

        text = text.replace("\"", "\"\"");

        return "\"" + text + "\"";
    }
}