
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./AdminCompanies.css";

function AdminCompanies() {
    const navigate = useNavigate();

    const [companies, setCompanies] = useState([]);
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingCompany, setEditingCompany] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        location: "",
        jobRole: "",
        packageLPA: "",
        minimumCgpa: "",
    });

    const auth = sessionStorage.getItem("auth");
    const role = sessionStorage.getItem("role");

    const fetchCompanies = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                "http://localhost:8080/companies",
                {
                    headers: {
                        Authorization: `Basic ${auth}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch companies");
            }

            const data = await response.json();

            setCompanies(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Fetch companies error:", err);

            setError(
                err.message || "Unable to load companies"
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
        void fetchCompanies();
    }, [auth, role, navigate, fetchCompanies]);

    const filteredCompanies = companies.filter((company) => {
        const searchText = search.toLowerCase().trim();

        return (
            company.name?.toLowerCase().includes(searchText) ||
            company.location?.toLowerCase().includes(searchText) ||
            company.jobRole?.toLowerCase().includes(searchText)
        );
    });

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value,
        }));
    };

    const resetForm = () => {
        setFormData({
            name: "",
            location: "",
            jobRole: "",
            packageLPA: "",
            minimumCgpa: "",
        });

        setEditingCompany(null);
        setShowForm(false);
    };

    const openAddForm = () => {
        setMessage("");
        setError("");
        setEditingCompany(null);

        setFormData({
            name: "",
            location: "",
            jobRole: "",
            packageLPA: "",
            minimumCgpa: "",
        });

        setShowForm(true);
    };

    const openEditForm = (company) => {
        setMessage("");
        setError("");
        setEditingCompany(company);

        setFormData({
            name: company.name || "",
            location: company.location || "",
            jobRole: company.jobRole || "",
            packageLPA: company.packageLPA ?? "",
            minimumCgpa: company.minimumCgpa ?? "",
        });

        setShowForm(true);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setError("");
            setMessage("");

            const isEditing = editingCompany !== null;

            const url = isEditing
                ? `http://localhost:8080/companies/${editingCompany.id}`
                : "http://localhost:8080/companies";

            const response = await fetch(url, {
                method: isEditing ? "PUT" : "POST",
                headers: {
                    Authorization: `Basic ${auth}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    location: formData.location.trim(),
                    jobRole: formData.jobRole.trim(),
                    packageLPA: Number(formData.packageLPA),
                    minimumCgpa: Number(formData.minimumCgpa),
                }),
            });

            if (!response.ok) {
                let errorMessage = isEditing
                    ? "Failed to update company"
                    : "Failed to create company";

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

            setMessage(
                isEditing
                    ? "Company updated successfully."
                    : "Company added successfully."
            );

            resetForm();
            await fetchCompanies();
        } catch (err) {
            console.error("Company save error:", err);

            setError(
                err.message || "Unable to save company"
            );
        }
    };

    const handleDelete = async (companyId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this company?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setMessage("");

            const response = await fetch(
                `http://localhost:8080/companies/${companyId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Basic ${auth}`,
                    },
                }
            );

            if (!response.ok) {
                let errorMessage =
                    "Unable to delete company. Check related jobs.";

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

            setMessage("Company deleted successfully.");

            await fetchCompanies();
        } catch (err) {
            console.error("Delete company error:", err);

            setError(
                err.message || "Unable to delete company"
            );
        }
    };

    return (
        <div className="admin-companies-page">
            <nav className="companies-navbar">
                <div
                    className="companies-logo"
                    onClick={() => navigate("/admin-dashboard")}
                >
                    <span className="logo-icon">P</span>
                    <span>PlacementHub</span>
                </div>

                <div className="companies-nav-actions">
                    <button
                        className="nav-dashboard-button"
                        onClick={() =>
                            navigate("/admin-dashboard")
                        }
                    >
                        Dashboard
                    </button>

                    <button
                        className="nav-logout-button"
                        onClick={() => {
                            sessionStorage.clear();
                            navigate("/login");
                        }}
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <main className="admin-companies-main">
                <section className="companies-page-header">
                    <div>
                        <span className="page-eyebrow">
                            ADMIN PANEL
                        </span>

                        <h1>Company Management</h1>

                        <p>
                            Add, update and manage companies
                            participating in campus placements.
                        </p>
                    </div>

                    <div className="company-count-card">
                        <span className="count-number">
                            {companies.length}
                        </span>

                        <span className="count-label">
                            Total Companies
                        </span>
                    </div>
                </section>

                <section className="companies-toolbar">
                    <div className="company-search-wrapper">
                        <span className="search-icon">⌕</span>

                        <input
                            className="company-search"
                            type="text"
                            placeholder="Search by name, location or job role..."
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                        />
                    </div>

                    <button
                        className="add-company-button"
                        onClick={openAddForm}
                    >
                        <span>+</span>
                        Add Company
                    </button>
                </section>

                {message && (
                    <div className="company-alert success-message">
                        <span>✓</span>
                        {message}
                    </div>
                )}

                {error && (
                    <div className="company-alert error-message">
                        <span>!</span>
                        {error}
                    </div>
                )}

                {loading && (
                    <div className="companies-state-card">
                        <div className="loading-spinner"></div>
                        <p>Loading companies...</p>
                    </div>
                )}

                {!loading && filteredCompanies.length > 0 && (
                    <section className="companies-table-card">
                        <div className="table-heading">
                            <div>
                                <h2>Registered Companies</h2>
                                <p>
                                    View and manage company
                                    information.
                                </p>
                            </div>

                            <span className="results-count">
                                {filteredCompanies.length} results
                            </span>
                        </div>

                        <div className="companies-table-wrapper">
                            <table className="companies-table">
                                <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Company</th>
                                    <th>Location</th>
                                    <th>Job Role</th>
                                    <th>Package</th>
                                    <th>Min. CGPA</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>

                                <tbody>
                                {filteredCompanies.map((company) => (
                                    <tr key={company.id}>
                                        <td>
                                                <span className="company-id">
                                                    #{company.id}
                                                </span>
                                        </td>

                                        <td>
                                            <div className="company-name-cell">
                                                <div className="company-avatar">
                                                    {company.name
                                                        ?.charAt(0)
                                                        .toUpperCase()}
                                                </div>

                                                <strong>
                                                    {company.name}
                                                </strong>
                                            </div>
                                        </td>

                                        <td>
                                                <span className="location-cell">
                                                    📍 {company.location}
                                                </span>
                                        </td>

                                        <td>
                                                <span className="job-role-badge">
                                                    {company.jobRole}
                                                </span>
                                        </td>

                                        <td>
                                            <strong className="package-value">
                                                ₹{company.packageLPA}
                                                <small> LPA</small>
                                            </strong>
                                        </td>

                                        <td>
                                                <span className="cgpa-value">
                                                    {company.minimumCgpa}
                                                </span>
                                        </td>

                                        <td>
                                            <div className="company-actions">
                                                <button
                                                    className="edit-button"
                                                    onClick={() =>
                                                        openEditForm(
                                                            company
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    className="delete-button"
                                                    onClick={() =>
                                                        handleDelete(
                                                            company.id
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

                {!loading && filteredCompanies.length === 0 && (
                    <div className="companies-state-card empty-state">
                        <div className="empty-icon">⌕</div>

                        <h2>No companies found</h2>

                        <p>
                            Try another search or add a new company.
                        </p>

                        {search && (
                            <button
                                className="clear-search-button"
                                onClick={() => setSearch("")}
                            >
                                Clear Search
                            </button>
                        )}
                    </div>
                )}

                {showForm && (
                    <section className="company-form-card">
                        <div className="form-card-header">
                            <div>
                                <span className="page-eyebrow">
                                    COMPANY DETAILS
                                </span>

                                <h2>
                                    {editingCompany
                                        ? "Edit Company"
                                        : "Add Company"}
                                </h2>

                                <p>
                                    Enter the company information
                                    below.
                                </p>
                            </div>

                            <button
                                className="close-form-button"
                                type="button"
                                onClick={resetForm}
                                aria-label="Close form"
                            >
                                ×
                            </button>
                        </div>

                        <form
                            className="company-form"
                            onSubmit={handleSubmit}
                        >
                            <label>
                                <span>Company Name</span>

                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Enter company name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </label>

                            <label>
                                <span>Location</span>

                                <input
                                    type="text"
                                    name="location"
                                    placeholder="Enter company location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    required
                                />
                            </label>

                            <label>
                                <span>Job Role</span>

                                <input
                                    type="text"
                                    name="jobRole"
                                    placeholder="e.g. Java Developer"
                                    value={formData.jobRole}
                                    onChange={handleInputChange}
                                    required
                                />
                            </label>

                            <label>
                                <span>Package LPA</span>

                                <input
                                    type="number"
                                    name="packageLPA"
                                    min="0"
                                    step="0.01"
                                    placeholder="e.g. 8.5"
                                    value={formData.packageLPA}
                                    onChange={handleInputChange}
                                    required
                                />
                            </label>

                            <label>
                                <span>Minimum CGPA</span>

                                <input
                                    type="number"
                                    name="minimumCgpa"
                                    min="0"
                                    max="10"
                                    step="0.01"
                                    placeholder="e.g. 7.5"
                                    value={formData.minimumCgpa}
                                    onChange={handleInputChange}
                                    required
                                />
                            </label>

                            <div className="form-actions">
                                <button
                                    className="save-button"
                                    type="submit"
                                >
                                    {editingCompany
                                        ? "Update Company"
                                        : "Save Company"}
                                </button>

                                <button
                                    className="cancel-button"
                                    type="button"
                                    onClick={resetForm}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </section>
                )}
            </main>
        </div>
    );
}

export default AdminCompanies;