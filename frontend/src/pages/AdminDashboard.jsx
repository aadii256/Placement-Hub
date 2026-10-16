import {
    useCallback,
    useEffect,
    useState,
} from "react";

import { useNavigate } from "react-router-dom";

import "./AdminDashboard.css";

function AdminDashboard() {
    const navigate = useNavigate();

    const [stats, setStats] = useState({});
    const [applicationStats, setApplicationStats] = useState({});
    const [jobStats, setJobStats] = useState([]);
    const [placementStats, setPlacementStats] = useState({});
    const [applications, setApplications] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);

    const auth = sessionStorage.getItem("auth");

    const fetchDashboardData = useCallback(async () => {
        const headers = {
            Authorization: "Basic " + auth,
            "Content-Type": "application/json",
        };

        try {
            const responses = await Promise.all([
                fetch(
                    "http://localhost:8080/dashboard/stats",
                    { headers }
                ),

                fetch(
                    "http://localhost:8080/applications",
                    { headers }
                ),

                fetch(
                    "http://localhost:8080/dashboard/application-stats",
                    { headers }
                ),

                fetch(
                    "http://localhost:8080/dashboard/job-application-stats",
                    { headers }
                ),

                fetch(
                    "http://localhost:8080/dashboard/placement-stats",
                    { headers }
                ),
            ]);

            const [
                statsResponse,
                applicationsResponse,
                applicationStatsResponse,
                jobStatsResponse,
                placementStatsResponse,
            ] = responses;

            if (!statsResponse.ok) {
                throw new Error(
                    "Failed to fetch dashboard statistics"
                );
            }

            if (!applicationsResponse.ok) {
                throw new Error(
                    "Failed to fetch applications"
                );
            }

            if (!applicationStatsResponse.ok) {
                throw new Error(
                    "Failed to fetch application statistics"
                );
            }

            if (!jobStatsResponse.ok) {
                throw new Error(
                    "Failed to fetch job-wise statistics"
                );
            }

            if (!placementStatsResponse.ok) {
                throw new Error(
                    "Failed to fetch placement statistics"
                );
            }

            const statsData =
                await statsResponse.json();

            const applicationsData =
                await applicationsResponse.json();

            const applicationStatsData =
                await applicationStatsResponse.json();

            const jobStatsData =
                await jobStatsResponse.json();

            const placementStatsData =
                await placementStatsResponse.json();

            setStats(statsData || {});

            setApplications(
                Array.isArray(applicationsData)
                    ? applicationsData
                    : []
            );

            setApplicationStats(
                applicationStatsData || {}
            );

            setJobStats(
                Array.isArray(jobStatsData)
                    ? jobStatsData
                    : []
            );

            setPlacementStats(
                placementStatsData || {}
            );

            setError("");
        } catch (err) {
            console.error(
                "Dashboard error:",
                err
            );

            setError(
                err.message ||
                "Unable to load dashboard data"
            );
        } finally {
            setLoading(false);
        }
    }, [auth]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void fetchDashboardData();
    }, [fetchDashboardData]);

    const updateApplicationStatus = async (
        applicationId,
        newStatus
    ) => {
        setUpdatingId(applicationId);

        const headers = {
            Authorization: "Basic " + auth,
            "Content-Type": "application/json",
        };

        try {
            const response = await fetch(
                `http://localhost:8080/applications/${applicationId}/status`,
                {
                    method: "PUT",
                    headers: headers,
                    body: JSON.stringify({
                        status: newStatus,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to update application status"
                );
            }

            await fetchDashboardData();

            alert(
                "Application status updated successfully"
            );
        } catch (err) {
            console.error(
                "Status update error:",
                err
            );

            alert(
                err.message ||
                "Failed to update application status"
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const logout = () => {
        sessionStorage.removeItem("auth");
        sessionStorage.removeItem("username");
        sessionStorage.removeItem("role");

        navigate("/");
    };

    const getStatusClass = (status) => {
        if (!status) {
            return "";
        }

        return status.toLowerCase();
    };

    if (loading) {
        return (
            <div className="admin-dashboard loading-screen">
                <div className="loading-card">
                    <div className="loading-spinner"></div>
                    <h2>Loading Admin Dashboard...</h2>
                    <p>Please wait while we fetch the latest data.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">

            {/* Header */}
            <header className="dashboard-header">

                <div className="dashboard-heading">
                    <span className="dashboard-label">
                        ADMIN PANEL
                    </span>

                    <h1>Admin Dashboard</h1>

                    <p>
                        Manage PlacementHub activities,
                        students, companies and applications.
                    </p>
                </div>

                <div className="header-actions">

                    <button
                        className="header-button"
                        onClick={() =>
                            navigate("/admin-jobs")
                        }
                    >
                        Manage Jobs
                    </button>

                    <button
                        className="header-button"
                        onClick={() =>
                            navigate("/admin-students")
                        }
                    >
                        Manage Students
                    </button>

                    <button
                        className="header-button"
                        onClick={() =>
                            navigate("/admin-companies")
                        }
                    >
                        Manage Companies
                    </button>

                    <button
                        className="logout-button"
                        onClick={logout}
                    >
                        Logout
                    </button>

                </div>

            </header>

            {/* Error */}
            {error && (
                <div className="error-message">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* General Statistics */}
            <section className="dashboard-section">

                <div className="section-heading">
                    <div>
                        <span className="section-label">
                            OVERVIEW
                        </span>

                        <h2>General Statistics</h2>
                    </div>
                </div>

                <div className="stats-grid">

                    <div className="stat-card blue-card">
                        <div className="stat-card-top">
                            <span className="stat-icon">👨‍🎓</span>
                            <span className="stat-tag">
                                Students
                            </span>
                        </div>

                        <h3>Total Students</h3>

                        <p>
                            {stats.totalStudents ?? 0}
                        </p>
                    </div>

                    <div className="stat-card purple-card">
                        <div className="stat-card-top">
                            <span className="stat-icon">🏢</span>
                            <span className="stat-tag">
                                Companies
                            </span>
                        </div>

                        <h3>Total Companies</h3>

                        <p>
                            {stats.totalCompanies ?? 0}
                        </p>
                    </div>

                    <div className="stat-card cyan-card">
                        <div className="stat-card-top">
                            <span className="stat-icon">💼</span>
                            <span className="stat-tag">
                                Opportunities
                            </span>
                        </div>

                        <h3>Total Jobs</h3>

                        <p>
                            {stats.totalJobs ?? 0}
                        </p>
                    </div>

                    <div className="stat-card green-card">
                        <div className="stat-card-top">
                            <span className="stat-icon">📄</span>
                            <span className="stat-tag">
                                Applications
                            </span>
                        </div>

                        <h3>Total Applications</h3>

                        <p>
                            {
                                stats.totalApplications ??
                                placementStats.totalApplications ??
                                0
                            }
                        </p>
                    </div>

                </div>

            </section>

            {/* Placement Analytics */}
            <section className="dashboard-section">

                <div className="section-heading">
                    <div>
                        <span className="section-label">
                            PERFORMANCE
                        </span>

                        <h2>Placement Analytics</h2>
                    </div>
                </div>

                <div className="stats-grid">

                    <div className="stat-card analytics-card">
                        <h3>Total Applications</h3>

                        <p>
                            {
                                placementStats.totalApplications ??
                                0
                            }
                        </p>

                        <span className="card-description">
                            Total applications received
                        </span>
                    </div>

                    <div className="stat-card analytics-card">
                        <h3>Selected Applications</h3>

                        <p className="success-number">
                            {
                                placementStats.selectedApplications ??
                                0
                            }
                        </p>

                        <span className="card-description">
                            Successfully selected
                        </span>
                    </div>

                    <div className="stat-card analytics-card">
                        <h3>Shortlisted Applications</h3>

                        <p className="warning-number">
                            {
                                placementStats.shortlistedApplications ??
                                0
                            }
                        </p>

                        <span className="card-description">
                            Currently shortlisted
                        </span>
                    </div>

                    <div className="stat-card analytics-card">
                        <h3>Selection Rate</h3>

                        <p className="primary-number">
                            {
                                placementStats.selectionRate ??
                                0
                            }%
                        </p>

                        <span className="card-description">
                            Overall selection percentage
                        </span>
                    </div>

                </div>

            </section>

            {/* Application Statistics */}
            <section className="dashboard-section">

                <div className="section-heading">
                    <div>
                        <span className="section-label">
                            APPLICATION STATUS
                        </span>

                        <h2>Application Statistics</h2>
                    </div>
                </div>

                <div className="stats-grid application-stats-grid">

                    <div className="stat-card analytics-card">
                        <h3>Total Applications</h3>

                        <p>
                            {
                                applicationStats.totalApplications ??
                                0
                            }
                        </p>
                    </div>

                    <div className="stat-card analytics-card">
                        <h3>Applied</h3>

                        <p className="primary-number">
                            {
                                applicationStats.applied ??
                                0
                            }
                        </p>
                    </div>

                    <div className="stat-card analytics-card">
                        <h3>Shortlisted</h3>

                        <p className="warning-number">
                            {
                                applicationStats.shortlisted ??
                                0
                            }
                        </p>
                    </div>

                    <div className="stat-card analytics-card">
                        <h3>Rejected</h3>

                        <p className="danger-number">
                            {
                                applicationStats.rejected ??
                                0
                            }
                        </p>
                    </div>

                    <div className="stat-card analytics-card">
                        <h3>Selected</h3>

                        <p className="success-number">
                            {
                                applicationStats.selected ??
                                0
                            }
                        </p>
                    </div>

                </div>

            </section>

            {/* Job-Wise Application Statistics */}
            <section className="dashboard-section">

                <div className="section-heading">
                    <div>
                        <span className="section-label">
                            JOB PERFORMANCE
                        </span>

                        <h2>
                            Job-Wise Application Statistics
                        </h2>
                    </div>
                </div>

                {jobStats.length > 0 ? (
                    <div className="table-container">

                        <table className="dashboard-table">

                            <thead>
                            <tr>
                                <th>Job ID</th>
                                <th>Job Title</th>
                                <th>Company</th>
                                <th>Applications</th>
                            </tr>
                            </thead>

                            <tbody>
                            {jobStats.map(
                                (job, index) => (
                                    <tr
                                        key={
                                            job.jobId ??
                                            index
                                        }
                                    >
                                        <td>
                                                <span className="id-badge">
                                                    {
                                                        job.jobId ??
                                                        "N/A"
                                                    }
                                                </span>
                                        </td>

                                        <td className="strong-cell">
                                            {
                                                job.jobTitle ??
                                                "N/A"
                                            }
                                        </td>

                                        <td>
                                            {
                                                job.company ??
                                                job.companyName ??
                                                "N/A"
                                            }
                                        </td>

                                        <td>
                                                <span className="count-badge">
                                                    {
                                                        job.applicationCount ??
                                                        job.count ??
                                                        0
                                                    }
                                                </span>
                                        </td>
                                    </tr>
                                )
                            )}
                            </tbody>

                        </table>

                    </div>
                ) : (
                    <div className="empty-state">
                        No job-wise statistics available.
                    </div>
                )}

            </section>

            {/* Application Management */}
            <section className="dashboard-section">

                <div className="section-heading">
                    <div>
                        <span className="section-label">
                            MANAGEMENT
                        </span>

                        <h2>Application Management</h2>
                    </div>

                    <span className="record-count">
                        {applications.length} Records
                    </span>
                </div>

                {applications.length > 0 ? (
                    <div className="table-container">

                        <table className="dashboard-table">

                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Student ID</th>
                                <th>Job ID</th>
                                <th>Status</th>
                                <th>Update Status</th>
                            </tr>
                            </thead>

                            <tbody>
                            {applications.map(
                                (application) => (
                                    <tr
                                        key={
                                            application.id
                                        }
                                    >
                                        <td>
                                                <span className="id-badge">
                                                    {
                                                        application.id
                                                    }
                                                </span>
                                        </td>

                                        <td>
                                            {
                                                application.studentId
                                            }
                                        </td>

                                        <td>
                                            {
                                                application.jobId
                                            }
                                        </td>

                                        <td>
                                                <span
                                                    className={`status-badge ${getStatusClass(
                                                        application.status
                                                    )}`}
                                                >
                                                    {
                                                        application.status
                                                    }
                                                </span>
                                        </td>

                                        <td>
                                            <select
                                                className="status-select"
                                                value={
                                                    application.status ??
                                                    "APPLIED"
                                                }
                                                disabled={
                                                    updatingId ===
                                                    application.id
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    updateApplicationStatus(
                                                        application.id,
                                                        event.target.value
                                                    )
                                                }
                                            >
                                                <option value="APPLIED">
                                                    APPLIED
                                                </option>

                                                <option value="SHORTLISTED">
                                                    SHORTLISTED
                                                </option>

                                                <option value="REJECTED">
                                                    REJECTED
                                                </option>

                                                <option value="SELECTED">
                                                    SELECTED
                                                </option>
                                            </select>
                                        </td>
                                    </tr>
                                )
                            )}
                            </tbody>

                        </table>

                    </div>
                ) : (
                    <div className="empty-state">
                        No applications available.
                    </div>
                )}

            </section>

            {/* Refresh */}
            <div className="refresh-container">

                <button
                    className="refresh-button"
                    onClick={fetchDashboardData}
                >
                    ↻ Refresh Dashboard
                </button>

            </div>

        </div>
    );
}

export default AdminDashboard;