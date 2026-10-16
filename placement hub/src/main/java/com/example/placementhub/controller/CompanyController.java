package com.example.placementhub.controller;
import jakarta.validation.Valid;
import com.example.placementhub.entity.Company;
import com.example.placementhub.service.CompanyService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @GetMapping("/companies")
    public List<Company> getAllCompanies() {
        return companyService.getAllCompanies();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/companies")
    public Company addCompany(@Valid @RequestBody Company company) {
        return companyService.saveCompany(company);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/companies/{id}")
    public Company updateCompany(@PathVariable Long id, @RequestBody Company company) {
        return companyService.updateCompany(id, company);
    }


    @GetMapping("/companies/{id}")
    public Company getCompanyById(@PathVariable Long id) {
        return companyService.getCompanyById(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/companies/{id}")
    public void deleteCompany(@PathVariable Long id) {
        companyService.deleteCompany(id);
    }
}