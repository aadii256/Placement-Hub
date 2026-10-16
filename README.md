# 🎓 Placement Hub

### A Full Stack Placement Management System

Placement Hub is a web-based application designed to simplify and streamline the campus placement process.

The platform aims to connect students, recruiters, and placement administrators through a centralized system, making placement-related activities more organized, efficient, and accessible.

---

## 🚀 Tech Stack

### Backend
- Java
- Spring Boot
- Spring Data JPA
- Hibernate
- RESTful APIs
- Maven

### Frontend
- HTML
- CSS
- JavaScript

### Database
- MySQL

### Development Tools
- IntelliJ IDEA
- Git & GitHub

---

## ✨ Key Features

### 👨‍🎓 Student Module
- Student registration and login
- Student profile management
- View available placement opportunities
- Apply for eligible job openings
- Track application status

### 🏢 Company Module
- Manage company information
- Post placement opportunities
- Define job eligibility criteria
- View student applications

### 👨‍💼 Admin Module
- Manage student records
- Manage company details
- Monitor placement activities
- Manage recruitment information
- Maintain centralized placement records

---

## 🏗️ Project Architecture

The application follows a layered architecture.

Frontend
   |
   | HTTP Requests
   v
Spring Boot REST APIs
   |
   v
Controller Layer
   |
   v
Service Layer
   |
   v
Repository Layer
   |
   v
MySQL Database

### Architecture Components

**Frontend:** Provides the user interface for interacting with the application.

**Controller Layer:** Handles incoming HTTP requests and returns appropriate responses.

**Service Layer:** Implements business logic and application functionality.

**Repository Layer:** Manages database operations using Spring Data JPA.

**Database:** Stores application data such as student details, company information, and placement records.

---

## 📂 Project Structure

Placement-Hub/
│
├── frontend/
│   └── Frontend source code
│
├── placement hub/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   └── test/
│   └── pom.xml
│
├── .gitignore
└── README.md

---

## ⚙️ Installation and Setup

### Prerequisites

Make sure you have installed:

- Java JDK
- Maven
- MySQL
- Git
- IntelliJ IDEA or another compatible IDE

### 1. Clone the Repository

```bash
git clone https://github.com/aadii256/Placement-Hub.git
```

### 2. Navigate to the Project

```bash
cd Placement-Hub
```

### 3. Configure the Database

Create a MySQL database:

```sql
CREATE DATABASE placement_hub;
```

Configure the Spring Boot application using
environment variables for database credentials.

Example configuration:

```properties
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
```

### 4. Run the Backend

Navigate to the backend folder:

```bash
cd "placement hub"
```

Run the Spring Boot application:

```bash
mvn spring-boot:run
```

### 5. Run the Frontend

Open the frontend folder and start the application
using the appropriate development server.

---

## 🎯 Project Objectives

- Digitize campus placement activities.
- Reduce manual administrative work.
- Centralize student and recruitment information.
- Improve communication between students and recruiters.
- Make placement management more efficient.

---

## 🔮 Future Enhancements

- AI-based job recommendations
- Resume analysis and skill matching
- Automated placement notifications
- Advanced placement analytics
- Interview scheduling
- Email notifications

---

## 👨‍💻 Developed By

**Aditya Shrivastav**

GitHub: https://github.com/aadii256

---

## ⭐ Support

If you find this project useful, consider giving the repository a star!
