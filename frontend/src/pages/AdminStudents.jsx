
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./AdminStudents.css";

function AdminStudents() {
    const navigate = useNavigate();

    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [selectedStudent, setSelectedStudent] = useState(null);
    const [editingStudent, setEditingStudent] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        branch: "",
        cgpa: "",
        graduationYear: "",
    });

    const auth = sessionStorage.getItem("auth");
    const role = sessionStorage.getItem("role");

    const fetchStudents = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                "http://localhost:8080/students",
                {
                    headers: {
                        Authorization: `Basic ${auth}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch students");
            }

            const data = await response.json();

            setStudents(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Fetch students error:", err);

            setError(
                err.message || "Unable to load students"
            );
        } finally {
            setLoading(false);
        }
    }, [auth]);

    useEffect(() => {
        if (!auth || role !== "ADMIN") {
            navigate("/login");
            return;
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect
        void fetchStudents();
    }, [auth, role, navigate, fetchStudents]);

    const filteredStudents = students.filter((student) => {
        const searchText = search.toLowerCase().trim();

        return (
            String(student.id ?? "")
                .toLowerCase()
                .includes(searchText) ||
            student.name?.toLowerCase().includes(searchText) ||
            student.email?.toLowerCase().includes(searchText) ||
            student.phone?.toLowerCase().includes(searchText) ||
            student.branch?.toLowerCase().includes(searchText)
        );
    });

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value,
        }));
    };

    const openEditForm = (student) => {
        setError("");
        setMessage("");
        setSelectedStudent(null);
        setEditingStudent(student);

        setFormData({
            name: student.name || "",
            email: student.email || "",
            phone: student.phone || "",
            branch: student.branch || "",
            cgpa: student.cgpa ?? "",
            graduationYear: student.graduationYear ?? "",
        });
    };

    const closeEditForm = () => {
        setEditingStudent(null);

        setFormData({
            name: "",
            email: "",
            phone: "",
            branch: "",
            cgpa: "",
            graduationYear: "",
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!editingStudent) {
            return;
        }

        try {
            setError("");
            setMessage("");

            const response = await fetch(
                `http://localhost:8080/students/${editingStudent.id}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Basic ${auth}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: formData.name.trim(),
                        email: formData.email.trim(),
                        phone: formData.phone.trim(),
                        branch: formData.branch.trim(),
                        cgpa: Number(formData.cgpa),
                        graduationYear: Number(
                            formData.graduationYear
                        ),
                    }),
                }
            );

            if (!response.ok) {
                let errorMessage = "Failed to update student";

                try {
                    const errorData = await response.json();

                    if (errorData.message) {
                        errorMessage = errorData.message;
                    }
                } catch {
                    // Use default error message
                }

                throw new Error(errorMessage);
            }

            setMessage("Student updated successfully.");

            closeEditForm();
            await fetchStudents();
        } catch (err) {
            console.error("Update student error:", err);

            setError(
                err.message || "Unable to update student"
            );
        }
    };

    const handleDelete = async (studentId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this student?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setMessage("");

            const response = await fetch(
                `http://localhost:8080/students/${studentId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Basic ${auth}`,
                    },
                }
            );

            if (!response.ok) {
                let errorMessage =
                    "Unable to delete student. Check related records.";

                try {
                    const errorData = await response.json();

                    if (errorData.message) {
                        errorMessage = errorData.message;
                    }
                } catch {
                    // Use default error message
                }

                throw new Error(errorMessage);
            }

            setMessage("Student deleted successfully.");

            if (selectedStudent?.id === studentId) {
                setSelectedStudent(null);
            }

            if (editingStudent?.id === studentId) {
                closeEditForm();
            }

            await fetchStudents();
        } catch (err) {
            console.error("Delete student error:", err);

            setError(
                err.message || "Unable to delete student"
            );
        }
    };

    const formatCgpa = (cgpa) => {
        if (cgpa === null || cgpa === undefined) {
            return "—";
        }

        return Number(cgpa).toFixed(2);
    };

    return (
        <div className="admin-students-page">
            <nav className="students-navbar">
                <div
                    className="students-logo"
                    onClick={() => navigate("/admin-dashboard")}
                >
                    <span className="students-logo-icon">P</span>
                    <span>PlacementHub</span>
                </div>

                <div className="students-nav-actions">
                    <button
                        className="students-dashboard-button"
                        onClick={() =>
                            navigate("/admin-dashboard")
                        }
                    >
                        Dashboard
                    </button>

                    <button
                        className="students-logout-button"
                        onClick={() => {
                            sessionStorage.clear();
                            navigate("/login");
                        }}
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <main className="admin-students-main">
                <section className="students-page-header">
                    <div>
                        <span className="students-eyebrow">
                            ADMIN PANEL
                        </span>

                        <h1>Manage Students</h1>

                        <p>
                            View, update and manage registered
                            student information.
                        </p>
                    </div>

                    <div className="students-count-card">
                        <span className="students-count-number">
                            {students.length}
                        </span>

                        <span className="students-count-label">
                            Total Students
                        </span>
                    </div>
                </section>

                <section className="students-toolbar">
                    <div className="students-search-wrapper">
                        <span className="students-search-icon">
                            ⌕
                        </span>

                        <input
                            className="students-search"
                            type="text"
                            placeholder="Search by name, email, branch or ID..."
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                        />
                    </div>

                    <span className="students-results-count">
                        {filteredStudents.length} results
                    </span>
                </section>

                {message && (
                    <div className="students-alert students-success-alert">
                        <span>✓</span>
                        {message}
                    </div>
                )}

                {error && (
                    <div className="students-alert students-error-alert">
                        <span>!</span>
                        {error}
                    </div>
                )}

                {loading && (
                    <div className="students-state-card">
                        <div className="students-loading-spinner"></div>
                        <p>Loading students...</p>
                    </div>
                )}

                {!loading && filteredStudents.length > 0 && (
                    <section className="students-table-card">
                        <div className="students-table-header">
                            <div>
                                <h2>Registered Students</h2>

                                <p>
                                    Student records and account
                                    information.
                                </p>
                            </div>
                        </div>

                        <div className="students-table-wrapper">
                            <table className="students-table">
                                <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Student</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Branch</th>
                                    <th>CGPA</th>
                                    <th>Graduation</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>

                                <tbody>
                                {filteredStudents.map((student) => (
                                    <tr key={student.id}>
                                        <td>
                                                <span className="student-id">
                                                    #{student.id}
                                                </span>
                                        </td>

                                        <td>
                                            <div className="student-name-cell">
                                                <div className="student-avatar">
                                                    {student.name
                                                        ?.charAt(0)
                                                        .toUpperCase()}
                                                </div>

                                                <strong>
                                                    {student.name ||
                                                        "Unnamed"}
                                                </strong>
                                            </div>
                                        </td>

                                        <td>
                                                <span className="student-email">
                                                    {student.email || "—"}
                                                </span>
                                        </td>

                                        <td>
                                            {student.phone || "—"}
                                        </td>

                                        <td>
                                                <span className="student-branch-badge">
                                                    {student.branch || "—"}
                                                </span>
                                        </td>

                                        <td>
                                                <span className="student-cgpa">
                                                    {formatCgpa(
                                                        student.cgpa
                                                    )}
                                                </span>
                                        </td>

                                        <td>
                                            {student.graduationYear ||
                                                "—"}
                                        </td>

                                        <td>
                                            <div className="student-actions">
                                                <button
                                                    className="student-view-button"
                                                    onClick={() =>
                                                        setSelectedStudent(
                                                            student
                                                        )
                                                    }
                                                >
                                                    View
                                                </button>

                                                <button
                                                    className="student-edit-button"
                                                    onClick={() =>
                                                        openEditForm(
                                                            student
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    className="student-delete-button"
                                                    onClick={() =>
                                                        handleDelete(
                                                            student.id
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {!loading && filteredStudents.length === 0 && (
                    <div className="students-state-card students-empty-state">
                        <div className="students-empty-icon">⌕</div>

                        <h2>No students found</h2>

                        <p>
                            Try another search term.
                        </p>

                        {search && (
                            <button
                                className="students-clear-button"
                                onClick={() => setSearch("")}
                            >
                                Clear Search
                            </button>
                        )}
                    </div>
                )}

                {editingStudent && (
                    <section className="student-edit-card">
                        <div className="student-form-header">
                            <div>
                                <span className="students-eyebrow">
                                    STUDENT DETAILS
                                </span>

                                <h2>Edit Student</h2>

                                <p>
                                    Update the student's information.
                                </p>
                            </div>

                            <button
                                className="student-close-button"
                                type="button"
                                onClick={closeEditForm}
                                aria-label="Close edit form"
                            >
                                ×
                            </button>
                        </div>

                        <form
                            className="student-form"
                            onSubmit={handleSubmit}
                        >
                            <label>
                                <span>Full Name</span>

                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </label>

                            <label>
                                <span>Email</span>

                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </label>

                            <label>
                                <span>Phone</span>

                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    required
                                />
                            </label>

                            <label>
                                <span>Branch</span>

                                <input
                                    type="text"
                                    name="branch"
                                    value={formData.branch}
                                    onChange={handleInputChange}
                                    required
                                />
                            </label>

                            <label>
                                <span>CGPA</span>

                                <input
                                    type="number"
                                    name="cgpa"
                                    min="0"
                                    max="10"
                                    step="0.01"
                                    value={formData.cgpa}
                                    onChange={handleInputChange}
                                    required
                                />
                            </label>

                            <label>
                                <span>Graduation Year</span>

                                <input
                                    type="number"
                                    name="graduationYear"
                                    min="2000"
                                    max="2100"
                                    value={formData.graduationYear}
                                    onChange={handleInputChange}
                                    required
                                />
                            </label>

                            <div className="student-form-actions">
                                <button
                                    className="student-save-button"
                                    type="submit"
                                >
                                    Update Student
                                </button>

                                <button
                                    className="student-cancel-button"
                                    type="button"
                                    onClick={closeEditForm}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </section>
                )}
            </main>

            {selectedStudent && (
                <div
                    className="student-modal-overlay"
                    onClick={() => setSelectedStudent(null)}
                >
                    <section
                        className="student-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <div className="student-modal-header">
                            <div>
                                <span className="students-eyebrow">
                                    STUDENT PROFILE
                                </span>

                                <h2>Student Details</h2>
                            </div>

                            <button
                                className="student-close-button"
                                onClick={() =>
                                    setSelectedStudent(null)
                                }
                                aria-label="Close student details"
                            >
                                ×
                            </button>
                        </div>

                        <div className="student-modal-profile">
                            <div className="student-modal-avatar">
                                {selectedStudent.name
                                    ?.charAt(0)
                                    .toUpperCase()}
                            </div>

                            <div>
                                <h3>
                                    {selectedStudent.name ||
                                        "Unnamed Student"}
                                </h3>

                                <p>
                                    Student ID: #
                                    {selectedStudent.id}
                                </p>
                            </div>
                        </div>

                        <div className="student-details-grid">
                            <div>
                                <span>Email</span>
                                <strong>
                                    {selectedStudent.email || "—"}
                                </strong>
                            </div>

                            <div>
                                <span>Phone</span>
                                <strong>
                                    {selectedStudent.phone || "—"}
                                </strong>
                            </div>

                            <div>
                                <span>Branch</span>
                                <strong>
                                    {selectedStudent.branch || "—"}
                                </strong>
                            </div>

                            <div>
                                <span>CGPA</span>
                                <strong>
                                    {formatCgpa(
                                        selectedStudent.cgpa
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>Graduation Year</span>
                                <strong>
                                    {selectedStudent.graduationYear ||
                                        "—"}
                                </strong>
                            </div>
                        </div>

                        <div className="student-modal-actions">
                            <button
                                className="student-edit-button"
                                onClick={() =>
                                    openEditForm(selectedStudent)
                                }
                            >
                                Edit Student
                            </button>

                            <button
                                className="student-cancel-button"
                                onClick={() =>
                                    setSelectedStudent(null)
                                }
                            >
                                Close
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}

export default AdminStudents;