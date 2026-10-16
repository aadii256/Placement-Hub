package com.example.placementhub.service;

import com.example.placementhub.ResourceNotFoundException;
import com.example.placementhub.entity.Company;
import com.example.placementhub.repository.CompanyRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CompanyService {

    private final CompanyRepository companyRepository;

    public CompanyService(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    public List<Company> getAllCompanies() {
        return companyRepository.findAll();
    }

    public Company getCompanyById(Long id) {
        return companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
    }

    public Company saveCompany(Company company) {
        return companyRepository.save(company);
    }

    public Company updateCompany(Long id, Company company) {
        Company existingCompany = companyRepository.findById(id).orElse(null);

        if (existingCompany == null) {
            return null;
        }

        existingCompany.setName(company.getName());
        existingCompany.setLocation(company.getLocation());
        existingCompany.setJobRole(company.getJobRole());
        existingCompany.setPackageLPA(company.getPackageLPA());
        existingCompany.setMinimumCgpa(company.getMinimumCgpa());

        return companyRepository.save(existingCompany);
    }

    public void deleteCompany(Long id) {
        if (!companyRepository.existsById(id)) {
            throw new ResourceNotFoundException("Company not found");
        }

        companyRepository.deleteById(id);
    }
}