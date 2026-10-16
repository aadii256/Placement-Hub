import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminJobs.css";

function AdminJobs() {
    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);
    const [companies, setCompanies] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [formError, setFormError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [editingJobId, setEditingJobId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        company: "",
        location: "",
        eligibleBranch: "",
        packageLPA: "",
        minimumCgpa: "",
    });

    useEffect(() => {
        const auth = sessionStorage.getItem("auth");
        const role = sessionStorage.getItem("role");

        if (!auth || role !== "ADMIN") {
            navigate("/login");
            return;
        }

        fetchJobs(auth);
        fetchCompanies(auth);
    }, [navigate]);

    const getHeaders = () => {
        const auth = sessionStorage.getItem("auth");

        return {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/json",
        };
    };

    const fetchJobs = async (auth) => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                "http://localhost:8080/jobs",
                {
                    headers: {
                        Authorization: `Basic ${auth}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Unable to load jobs.");
            }

            const data = await response.json();
            setJobs(data);
        } catch (error) {
            console.error(error);
            setError("Unable to load jobs from backend.");
        } finally {
            setLoading(false);
        }
    };

    const fetchCompanies = async (auth) => {
        try {
            const response = await fetch(
                "http://localhost:8080/companies",
                {
                    headers: {
                        Authorization: `Basic ${auth}`,
                    },
                }
            );

            if (!response.ok) {
                return;
            }

            const data = await response.json();
            setCompanies(data);
        } catch (error) {
            console.error("Unable to load companies:", error);
        }
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value,
        }));
    };

    const resetForm = () => {
        setFormData({
            title: "",
            description: "",
            company: "",
            location: "",
            eligibleBranch: "",
            packageLPA: "",
            minimumCgpa: "",
        });

        setEditingJobId(null);
        setFormError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setFormError("");
        setSuccessMessage("");
        setError("");

        if (
            !formData.title.trim() ||
            !formData.description.trim() ||
            !formData.company.trim() ||
            !formData.location.trim() ||
            !formData.eligibleBranch.trim()
        ) {
            setFormError("Please fill in all required fields.");
            return;
        }

        if (
            formData.minimumCgpa !== "" &&
            (Number(formData.minimumCgpa) < 0 ||
                Number(formData.minimumCgpa) > 10)
        ) {
            setFormError("Minimum CGPA must be between 0 and 10.");
            return;
        }

        if (
            formData.packageLPA !== "" &&
            Number(formData.packageLPA) < 0
        ) {
            setFormError("Package LPA cannot be negative.");
            return;
        }

        const jobData = {
            title: formData.title.trim(),
            description: formData.description.trim(),
            company: formData.company.trim(),
            location: formData.location.trim(),
            eligibleBranch: formData.eligibleBranch.trim(),
            packageLPA:
                formData.packageLPA === ""
                    ? null
                    : Number(formData.packageLPA),
            minimumCgpa:
                formData.minimumCgpa === ""
                    ? null
                    : Number(formData.minimumCgpa),
        };

        try {
            setSaving(true);

            const url = editingJobId
                ? `http://localhost:8080/jobs/${editingJobId}`
                : "http://localhost:8080/jobs";

            const method = editingJobId ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: getHeaders(),
                body: JSON.stringify(jobData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Backend error:", errorText);

                setFormError(
                    editingJobId
                        ? "Unable to update job. Check the entered details."
                        : "Unable to create job. Check the entered details."
                );

                return;
            }

            const savedJob = await response.json();

            if (editingJobId) {
                setJobs((previousJobs) =>
                    previousJobs.map((job) =>
                        job.id === editingJobId ? savedJob : job
                    )
                );

                setSuccessMessage("Job updated successfully.");
            } else {
                setJobs((previousJobs) => [
                    ...previousJobs,
                    savedJob,
                ]);

                setSuccessMessage("Job created successfully.");
            }

            resetForm();
        } catch (error) {
            console.error(error);
            setFormError("Cannot connect to backend.");
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (job) => {
        setEditingJobId(job.id);

        setFormData({
            title: job.title || "",
            description: job.description || "",
            company: job.company || "",
            location: job.location || "",
            eligibleBranch: job.eligibleBranch || "",
            packageLPA:
                job.packageLPA === null ||
                job.packageLPA === undefined
                    ? ""
                    : String(job.packageLPA),
            minimumCgpa:
                job.minimumCgpa === null ||
                job.minimumCgpa === undefined
                    ? ""
                    : String(job.minimumCgpa),
        });

        setFormError("");
        setSuccessMessage("");
        setError("");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const handleDelete = async (jobId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this job?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(jobId);
            setError("");
            setSuccessMessage("");

            const response = await fetch(
                `http://localhost:8080/jobs/${jobId}`,
                {
                    method: "DELETE",
                    headers: getHeaders(),
                }
            );

            if (!response.ok) {
                setError(
                    "Unable to delete this job. It may have existing applications."
                );
                return;
            }

            setJobs((previousJobs) =>
                previousJobs.filter((job) => job.id !== jobId)
            );

            if (editingJobId === jobId) {
                resetForm();
            }

            setSuccessMessage("Job deleted successfully.");
        } catch (error) {
            console.error(error);
            setError("Cannot connect to backend.");
        } finally {
            setDeletingId(null);
        }
    };

    const handleLogout = () => {
        sessionStorage.clear();
        navigate("/login");
    };

    return (
        <div className="admin-jobs-page">
            <nav className="admin-jobs-navbar">
                <div
                    className="admin-jobs-logo"
                    onClick={() => navigate("/admin-dashboard")}
                >
                    Placement<span>Hub</span>
                </div>

                <div className="admin-jobs-nav-actions">
                    <button
                        type="button"
                        className="jobs-dashboard-button"
                        onClick={() => navigate("/admin-dashboard")}
                    >
                        Dashboard
                    </button>

                    <button
                        type="button"
                        className="jobs-logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <main className="admin-jobs-main">
                <header className="admin-jobs-header">
                    <div>
                        <p className="jobs-page-label">
                            ADMINISTRATION
                        </p>

                        <h1>Job Management</h1>

                        <p>
                            Create, update and manage placement
                            opportunities.
                        </p>
                    </div>

                    <div className="jobs-count-badge">
                        <strong>{jobs.length}</strong>
                        <span>
                            {jobs.length === 1 ? "Job" : "Jobs"}
                        </span>
                    </div>
                </header>

                {error && (
                    <div className="jobs-alert jobs-error-alert">
                        <span className="alert-icon">⚠</span>
                        <span>{error}</span>
                    </div>
                )}

                {successMessage && (
                    <div className="jobs-alert jobs-success-alert">
                        <span className="alert-icon">✓</span>
                        <span>{successMessage}</span>
                    </div>
                )}

                <section className="job-form-card">
                    <div className="section-heading">
                        <div className="section-icon">
                            {editingJobId ? "✎" : "+"}
                        </div>

                        <div>
                            <p className="section-label">
                                {editingJobId
                                    ? "UPDATE OPPORTUNITY"
                                    : "NEW OPPORTUNITY"}
                            </p>

                            <h2>
                                {editingJobId
                                    ? "Edit Job"
                                    : "Add New Job"}
                            </h2>

                            <p>
                                Enter the details of the placement
                                opportunity.
                            </p>
                        </div>
                    </div>

                    {formError && (
                        <div className="jobs-alert jobs-form-error">
                            <span className="alert-icon">⚠</span>
                            <span>{formError}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="job-form-grid">
                            <label className="job-form-field">
                                <span>
                                    Job Title <b>*</b>
                                </span>

                                <input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Java Developer"
                                />
                            </label>

                            <label className="job-form-field">
                                <span>
                                    Company <b>*</b>
                                </span>

                                <input
                                    name="company"
                                    value={formData.company}
                                    onChange={handleInputChange}
                                    placeholder="e.g. TCS"
                                    list="company-options"
                                />

                                <datalist id="company-options">
                                    {companies.map((company) => (
                                        <option
                                            key={company.id}
                                            value={company.name}
                                        />
                                    ))}
                                </datalist>
                            </label>

                            <label className="job-form-field">
                                <span>
                                    Location <b>*</b>
                                </span>

                                <input
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Pune"
                                />
                            </label>

                            <label className="job-form-field">
                                <span>
                                    Eligible Branch <b>*</b>
                                </span>

                                <input
                                    name="eligibleBranch"
                                    value={formData.eligibleBranch}
                                    onChange={handleInputChange}
                                    placeholder="e.g. CSE"
                                />
                            </label>

                            <label className="job-form-field">
                                <span>Package (LPA)</span>

                                <input
                                    type="number"
                                    name="packageLPA"
                                    value={formData.packageLPA}
                                    onChange={handleInputChange}
                                    min="0"
                                    step="0.01"
                                    placeholder="e.g. 6.5"
                                />
                            </label>

                            <label className="job-form-field">
                                <span>Minimum CGPA</span>

                                <input
                                    type="number"
                                    name="minimumCgpa"
                                    value={formData.minimumCgpa}
                                    onChange={handleInputChange}
                                    min="0"
                                    max="10"
                                    step="0.01"
                                    placeholder="e.g. 7.5"
                                />
                            </label>
                        </div>

                        <label className="job-form-field job-description-field">
                            <span>
                                Job Description <b>*</b>
                            </span>

                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Enter job responsibilities and requirements"
                                rows="5"
                            />
                        </label>

                        <div className="job-form-actions">
                            <button
                                type="submit"
                                className="job-primary-button"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : editingJobId
                                        ? "Update Job"
                                        : "Create Job"}
                            </button>

                            {editingJobId && (
                                <button
                                    type="button"
                                    className="job-secondary-button"
                                    onClick={resetForm}
                                >
                                    Cancel Edit
                                </button>
                            )}
                        </div>
                    </form>
                </section>

                <section className="existing-jobs-section">
                    <div className="existing-jobs-heading">
                        <div>
                            <p className="section-label">
                                PLACEMENT OPPORTUNITIES
                            </p>

                            <h2>Existing Jobs</h2>

                            <p>
                                Manage all available placement
                                opportunities.
                            </p>
                        </div>

                        <span className="job-total-label">
                            Total: {jobs.length}
                        </span>
                    </div>

                    {loading ? (
                        <div className="jobs-empty-card">
                            <div className="jobs-loading-spinner"></div>
                            <p>Loading jobs...</p>
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="jobs-empty-card">
                            <div className="empty-jobs-icon">
                                📋
                            </div>

                            <h3>No Jobs Available</h3>

                            <p>
                                Create your first placement
                                opportunity using the form above.
                            </p>
                        </div>
                    ) : (
                        <div className="admin-jobs-grid">
                            {jobs.map((job) => {
                                const isClosed =
                                    job.status === "CLOSED";

                                return (
                                    <article
                                        className={`admin-job-card ${
                                            isClosed
                                                ? "job-card-closed"
                                                : ""
                                        }`}
                                        key={job.id}
                                    >
                                        <div className="job-card-top">
                                            <span className="job-id-badge">
                                                Job #{job.id}
                                            </span>

                                            <span
                                                className={`job-status-badge ${
                                                    isClosed
                                                        ? "closed"
                                                        : "active"
                                                }`}
                                            >
                                                <span className="status-dot"></span>
                                                {isClosed
                                                    ? "CLOSED"
                                                    : "ACTIVE"}
                                            </span>
                                        </div>

                                        <div className="job-card-title-area">
                                            <h3>{job.title}</h3>

                                            <p className="job-company-name">
                                                {job.company}
                                            </p>
                                        </div>

                                        <div className="job-card-details">
                                            <div>
                                                <span className="detail-icon">
                                                    📍
                                                </span>

                                                <span>
                                                    {job.location ||
                                                        "Location not specified"}
                                                </span>
                                            </div>

                                            <div>
                                                <span className="detail-icon">
                                                    🎓
                                                </span>

                                                <span>
                                                    {job.eligibleBranch ||
                                                        "All Branches"}
                                                </span>
                                            </div>

                                            <div>
                                                <span className="detail-icon">
                                                    💰
                                                </span>

                                                <span>
                                                    {job.packageLPA ??
                                                        "Not specified"}{" "}
                                                    LPA
                                                </span>
                                            </div>

                                            <div>
                                                <span className="detail-icon">
                                                    📊
                                                </span>

                                                <span>
                                                    Minimum CGPA:{" "}
                                                    {job.minimumCgpa ??
                                                        "Not specified"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="job-description">
                                            {job.description ||
                                                "No description provided."}
                                        </div>

                                        <div className="job-card-actions">
                                            <button
                                                type="button"
                                                className="job-edit-button"
                                                onClick={() =>
                                                    handleEdit(job)
                                                }
                                            >
                                                ✎ Edit
                                            </button>

                                            <button
                                                type="button"
                                                className="job-delete-button"
                                                onClick={() =>
                                                    handleDelete(job.id)
                                                }
                                                disabled={
                                                    deletingId === job.id
                                                }
                                            >
                                                {deletingId === job.id
                                                    ? "Deleting..."
                                                    : "🗑 Delete"}
                                            </button>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default AdminJobs;