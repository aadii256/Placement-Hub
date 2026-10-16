
package com.example.placementhub.service;

import com.example.placementhub.ResourceNotFoundException;
import com.example.placementhub.entity.Student;
import com.example.placementhub.entity.User;
import com.example.placementhub.repository.StudentRepository;
import com.example.placementhub.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.Year;
import java.util.List;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;

    public StudentService(
            StudentRepository studentRepository,
            UserRepository userRepository
    ) {
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public Student getStudentById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Student not found"));
    }

    public Student saveStudent(Student student) {
        return studentRepository.save(student);
    }

    // Admin can update all student fields
    public Student updateStudent(Long id, Student student) {

        Student existingStudent = studentRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Student not found"));

        existingStudent.setName(student.getName());
        existingStudent.setEmail(student.getEmail());
        existingStudent.setPhone(student.getPhone());
        existingStudent.setBranch(student.getBranch());
        existingStudent.setCgpa(student.getCgpa());
        existingStudent.setGraduationYear(student.getGraduationYear());

        return studentRepository.save(existingStudent);
    }
    // Get the logged-in student's own profile
    public Student getOwnProfile(String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        Student student = user.getStudent();

        if (student == null) {
            throw new ResourceNotFoundException(
                    "No student profile linked to this account"
            );
        }

        return student;
    }
    // Student can update their own profile
    public Student updateOwnProfile(String username, Student student) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        Student existingStudent = user.getStudent();

        if (existingStudent == null) {
            throw new ResourceNotFoundException(
                    "No student profile linked to this account"
            );
        }

        // Students can update their name, email, and phone
        existingStudent.setName(student.getName());
        existingStudent.setEmail(student.getEmail());
        existingStudent.setPhone(student.getPhone());

        // Students cannot change their branch
        // Existing branch remains unchanged

        // Students cannot change their graduation year
        // Existing graduation year remains unchanged

        int currentYear = Year.now().getValue();
        int graduationYear = Integer.parseInt(
                existingStudent.getGraduationYear()
        );

        // CGPA can be updated until the graduation year is completed
        if (currentYear <= graduationYear) {

            if (student.getCgpa() != null) {
                existingStudent.setCgpa(student.getCgpa());
            }

        } else {

            // Do not allow CGPA changes after graduation year
            if (student.getCgpa() != null &&
                    !student.getCgpa().equals(existingStudent.getCgpa())) {

                throw new IllegalArgumentException(
                        "CGPA cannot be updated after graduation year"
                );
            }
        }

        return studentRepository.save(existingStudent);
    }

    public void deleteStudent(Long id) {

        if (!studentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Student not found");
        }

        studentRepository.deleteById(id);
    }
}