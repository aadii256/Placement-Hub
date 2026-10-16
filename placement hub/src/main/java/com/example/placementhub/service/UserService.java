package com.example.placementhub.service;

import com.example.placementhub.DuplicateUsernameException;
import com.example.placementhub.entity.Role;
import com.example.placementhub.entity.Student;
import com.example.placementhub.entity.User;
import com.example.placementhub.repository.StudentRepository;
import com.example.placementhub.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            StudentRepository studentRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User getUserByUsername(String username) {

        return userRepository.findByUsername(username)
                .orElse(null);
    }

    public User registerUser(
            String username,
            String password,
            String name,
            String email,
            String phone,
            String branch,
            Double cgpa,
            String graduationYear
    ) {

        if (userRepository.findByUsername(username).isPresent()) {
            throw new DuplicateUsernameException(
                    "Username already exists"
            );
        }

        Student student = new Student();

        student.setName(name);
        student.setEmail(email);
        student.setPhone(phone);
        student.setBranch(branch);
        student.setCgpa(cgpa);
        student.setGraduationYear(graduationYear);

        Student savedStudent = studentRepository.save(student);

        User user = new User();

        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(Role.STUDENT);
        user.setStudent(savedStudent);

        return userRepository.save(user);
    }

    public boolean loginUser(String username, String password) {

        User user = userRepository.findByUsername(username)
                .orElse(null);

        if (user == null) {
            return false;
        }

        return passwordEncoder.matches(
                password,
                user.getPassword()
        );
    }

    public List<User> getAllUsers() {

        return userRepository.findAll();
    }

    public User getUserById(Long id) {

        return userRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found with id: " + id
                        )
                );
    }

    public void deleteUser(Long id) {

        User user = getUserById(id);

        /*
         * Unlink the student profile before deleting the user.
         * The student profile is intentionally not deleted.
         */
        user.setStudent(null);

        userRepository.save(user);

        userRepository.deleteById(id);
    }
}