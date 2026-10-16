import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApplicationTimeline from "../components/ApplicationTimeline";
import ResumeManager from "../components/ResumeManager";
import ResumeAnalyzer from "./ResumeAnalyzer";
import CareerAssistant from "./CareerAssistant";
import "./StudentDashboard.css";

function StudentDashboard() {
    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);
    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [applications, setApplications] = useState([]);

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);

    const [placementStats, setPlacementStats] = useState({
        totalApplications: 0,
        selectedApplications: 0,
        shortlistedApplications: 0,
        selectionRate: 0,
    });

    const [placementReadiness, setPlacementReadiness] = useState({
        score: 0,
        profileComplete: false,
        resumeUploaded: false,
        hasApplications: false,
        hasShortlistedApplication: false,
    });

    const [error, setError] = useState("");
    const [recommendationError, setRecommendationError] = useState("");
    const [loading, setLoading] = useState(true);

    const [expandedApplication, setExpandedApplication] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [branchFilter, setBranchFilter] = useState("ALL");
    const [packageFilter, setPackageFilter] = useState("ALL");
    const [sortOrder, setSortOrder] = useState("DEFAULT");

    const username = sessionStorage.getItem("username");
    const auth = sessionStorage.getItem("auth");
    const role = sessionStorage.getItem("role");

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            setRecommendationError("");

            const headers = {
                Authorization: `Basic ${auth}`,
            };

            const [
                jobsResponse,
                applicationsResponse,
                recommendedJobsResponse,
                notificationsResponse,
                unreadCountResponse,
                placementStatsResponse,
                placementReadinessResponse,
            ] = await Promise.all([
                fetch("http://localhost:8080/jobs", { headers }),
                fetch("http://localhost:8080/applications", { headers }),
                fetch("http://localhost:8080/jobs/recommended", { headers }),
                fetch("http://localhost:8080/notifications", { headers }),
                fetch(
                    "http://localhost:8080/notifications/unread-count",
                    {
                        headers,
                    }
                ),
                fetch(
                    "http://localhost:8080/dashboard/student-placement-stats",
                    {
                        headers,
                    }
                ),
                fetch(
                    "http://localhost:8080/dashboard/student-placement-readiness",
                    {
                        headers,
                    }
                ),
            ]);

            if (!jobsResponse.ok || !applicationsResponse.ok) {
                setError("Unable to load dashboard data.");
                return;
            }

            const jobsData = await jobsResponse.json();
            const applicationsData = await applicationsResponse.json();

            setJobs(Array.isArray(jobsData) ? jobsData : []);

            setApplications(
                Array.isArray(applicationsData)
                    ? applicationsData
                    : []
            );

            if (recommendedJobsResponse.ok) {
                const recommendedData =
                    await recommendedJobsResponse.json();

                setRecommendedJobs(
                    Array.isArray(recommendedData)
                        ? recommendedData
                        : []
                );
            } else {
                setRecommendationError(
                    "Unable to load recommended jobs."
                );
            }

            if (notificationsResponse.ok) {
                const notificationsData =
                    await notificationsResponse.json();

                setNotifications(
                    Array.isArray(notificationsData)
                        ? notificationsData
                        : []
                );
            }

            if (unreadCountResponse.ok) {
                const unreadData =
                    await unreadCountResponse.json();

                setUnreadCount(Number(unreadData) || 0);
            }

            if (placementStatsResponse.ok) {
                const placementStatsData =
                    await placementStatsResponse.json();

                setPlacementStats({
                    totalApplications:
                        Number(
                            placementStatsData.totalApplications
                        ) || 0,

                    selectedApplications:
                        Number(
                            placementStatsData.selectedApplications
                        ) || 0,

                    shortlistedApplications:
                        Number(
                            placementStatsData.shortlistedApplications
                        ) || 0,

                    selectionRate:
                        Number(
                            placementStatsData.selectionRate
                        ) || 0,
                });
            }

            if (placementReadinessResponse.ok) {
                const placementReadinessData =
                    await placementReadinessResponse.json();

                setPlacementReadiness({
                    score: Number(placementReadinessData.score) || 0,
                    profileComplete: Boolean(placementReadinessData.profileComplete),
                    resumeUploaded: Boolean(placementReadinessData.resumeUploaded),
                    hasApplications: Boolean(placementReadinessData.hasApplications),
                    hasShortlistedApplication: Boolean(placementReadinessData.hasShortlistedApplication),
                });
            }
        } catch (fetchError) {
            console.error(fetchError);
            setError("Cannot connect to backend.");
        } finally {
            setLoading(false);
        }
    }, [auth]);

    useEffect(() => {
        if (!auth || role !== "STUDENT") {
            navigate("/login");
            return;
        }

        const loadDashboard = async () => {
            await fetchData();
        };

        loadDashboard();
    }, [auth, role, navigate, fetchData]);

    const handleLogout = () => {
        sessionStorage.clear();
        navigate("/login");
    };

    const handleViewJob = (jobId) => {
        navigate(`/job/${jobId}`);
    };

    const toggleTimeline = (applicationId) => {
        setExpandedApplication((currentId) =>
            currentId === applicationId ? null : applicationId
        );
    };

    const markNotificationAsRead = async (notificationId) => {
        try {
            const response = await fetch(
                `http://localhost:8080/notifications/${notificationId}/read`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Basic ${auth}`,
                    },
                }
            );

            if (!response.ok) {
                return;
            }

            setNotifications((current) =>
                current.map((notification) =>
                    notification.id === notificationId
                        ? {
                            ...notification,
                            readStatus: true,
                        }
                        : notification
                )
            );

            setUnreadCount((current) => Math.max(0, current - 1));
        } catch (error) {
            console.error(
                "Unable to mark notification as read:",
                error
            );
        }
    };

    const markAllNotificationsAsRead = async () => {
        try {
            const response = await fetch(
                "http://localhost:8080/notifications/read-all",
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Basic ${auth}`,
                    },
                }
            );

            if (!response.ok) {
                return;
            }

            setNotifications((current) =>
                current.map((notification) => ({
                    ...notification,
                    readStatus: true,
                }))
            );

            setUnreadCount(0);
        } catch (error) {
            console.error(
                "Unable to mark all notifications as read:",
                error
            );
        }
    };

    const toggleNotifications = () => {
        setShowNotifications((current) => !current);
    };

    const formatNotificationDate = (createdAt) => {
        if (!createdAt) {
            return "";
        }

        const date = new Date(createdAt);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        return date.toLocaleString();
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "SELECTED":
                return "status-selected";
            case "SHORTLISTED":
                return "status-shortlisted";
            case "REJECTED":
                return "status-rejected";
            default:
                return "status-applied";
        }
    };

    const branches = useMemo(() => {
        const branchList = jobs
            .map((job) => job.eligibleBranch)
            .filter(
                (branch) =>
                    branch !== null &&
                    branch !== undefined &&
                    branch.trim() !== ""
            );

        return ["ALL", ...new Set(branchList)];
    }, [jobs]);

    const filteredJobs = useMemo(() => {
        let filtered = [...jobs];

        if (searchTerm.trim() !== "") {
            const search = searchTerm.toLowerCase().trim();

            filtered = filtered.filter((job) => {
                const title = (job.title || "").toLowerCase();
                const company = (job.company || "").toLowerCase();
                const location = (job.location || "").toLowerCase();

                return (
                    title.includes(search) ||
                    company.includes(search) ||
                    location.includes(search)
                );
            });
        }

        if (branchFilter !== "ALL") {
            filtered = filtered.filter(
                (job) => job.eligibleBranch === branchFilter
            );
        }

        if (packageFilter !== "ALL") {
            const minimumPackage = Number(packageFilter);

            filtered = filtered.filter(
                (job) =>
                    Number(job.packageLPA || 0) >= minimumPackage
            );
        }

        if (sortOrder === "LOW_TO_HIGH") {
            filtered.sort(
                (a, b) =>
                    Number(a.packageLPA || 0) -
                    Number(b.packageLPA || 0)
            );
        }

        if (sortOrder === "HIGH_TO_LOW") {
            filtered.sort(
                (a, b) =>
                    Number(b.packageLPA || 0) -
                    Number(a.packageLPA || 0)
            );
        }

        return filtered;
    }, [
        jobs,
        searchTerm,
        branchFilter,
        packageFilter,
        sortOrder,
    ]);

    const clearFilters = () => {
        setSearchTerm("");
        setBranchFilter("ALL");
        setPackageFilter("ALL");
        setSortOrder("DEFAULT");
    };

    const renderJobCard = (job) => {
        return (
            <div className="job-card" key={job.id}>
                <div className="job-card-top">
                    <span className="job-id">
                        Job #{job.id}
                    </span>

                    <span className="package-badge">
                        {job.packageLPA} LPA
                    </span>
                </div>

                <h3 className="job-title">
                    {job.title || "Job title unavailable"}
                </h3>

                <p className="job-company">
                    {job.company || "Company unavailable"}
                </p>

                <div className="job-information">
                    <p>
                        <span>📍</span>
                        {job.location || "Location not specified"}
                    </p>

                    <p>
                        <span>🎓</span>
                        {job.eligibleBranch || "All branches"}
                    </p>

                    <p>
                        <span>📊</span>
                        Minimum CGPA:{" "}
                        {job.minimumCgpa ?? "Not specified"}
                    </p>
                </div>

                <button
                    className="primary-button"
                    onClick={() => handleViewJob(job.id)}
                >
                    View Job
                </button>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading student dashboard...</p>
            </div>
        );
    }

    return (
        <div className="student-dashboard">

            {/* NAVBAR */}

            <nav className="student-navbar">
                <div className="brand-name">
                    Placement<span>Hub</span>
                </div>

                <div className="navbar-actions">
                    <span className="student-welcome">
                        Welcome, {username || "Student"}
                    </span>

                    {/* NOTIFICATIONS */}

                    <div className="notification-container">
                        <button
                            className="notification-button"
                            onClick={toggleNotifications}
                            title="Notifications"
                        >
                            🔔

                            {unreadCount > 0 && (
                                <span className="notification-count">
                                    {unreadCount > 99
                                        ? "99+"
                                        : unreadCount}
                                </span>
                            )}
                        </button>

                        {showNotifications && (
                            <div className="notification-dropdown">
                                <div className="notification-header">
                                    <div>
                                        <h3>Notifications</h3>

                                        <span>
                                            {unreadCount} unread
                                        </span>
                                    </div>

                                    {unreadCount > 0 && (
                                        <button
                                            className="mark-all-button"
                                            onClick={
                                                markAllNotificationsAsRead
                                            }
                                        >
                                            Mark all as read
                                        </button>
                                    )}
                                </div>

                                <div className="notification-list">
                                    {notifications.length === 0 ? (
                                        <div className="notification-empty">
                                            <div className="notification-empty-icon">
                                                🔔
                                            </div>

                                            <p>
                                                No notifications yet.
                                            </p>
                                        </div>
                                    ) : (
                                        notifications.map(
                                            (notification) => (
                                                <div
                                                    key={
                                                        notification.id
                                                    }
                                                    className={`notification-item ${
                                                        notification.readStatus
                                                            ? "notification-read"
                                                            : "notification-unread"
                                                    }`}
                                                    onClick={() => {
                                                        if (
                                                            !notification.readStatus
                                                        ) {
                                                            markNotificationAsRead(
                                                                notification.id
                                                            );
                                                        }
                                                    }}
                                                >
                                                    <div className="notification-icon">
                                                        {notification.title
                                                            ?.toLowerCase()
                                                            .includes(
                                                                "selected"
                                                            )
                                                            ? "🎉"
                                                            : notification.title
                                                                ?.toLowerCase()
                                                                .includes(
                                                                    "shortlisted"
                                                                )
                                                                ? "⭐"
                                                                : "📢"}
                                                    </div>

                                                    <div className="notification-content">
                                                        <div className="notification-title-row">
                                                            <h4>
                                                                {
                                                                    notification.title
                                                                }
                                                            </h4>

                                                            {!notification.readStatus && (
                                                                <span className="unread-dot"></span>
                                                            )}
                                                        </div>

                                                        <p>
                                                            {
                                                                notification.message
                                                            }
                                                        </p>

                                                        <span className="notification-time">
                                                            {formatNotificationDate(
                                                                notification.createdAt
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            )
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        className="profile-button"
                        onClick={() =>
                            navigate("/student-profile")
                        }
                    >
                        My Profile
                    </button>

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </nav>

            {/* MAIN */}

            <main className="student-main">

                {/* WELCOME */}

                <section className="welcome-section">
                    <div>
                        <p className="page-label">
                            STUDENT PORTAL
                        </p>

                        <h1>Student Dashboard</h1>

                        <p>
                            Explore placement opportunities and track
                            your applications.
                        </p>
                    </div>
                </section>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {/* SUMMARY CARDS */}

                <section className="summary-cards">
                    <div className="summary-card">
                        <div className="summary-card-icon">
                            💼
                        </div>

                        <div>
                            <p>Available Jobs</p>
                            <h2>{jobs.length}</h2>
                            <span>Current opportunities</span>
                        </div>
                    </div>

                    <div className="summary-card">
                        <div className="summary-card-icon">
                            ⭐
                        </div>

                        <div>
                            <p>Recommended Jobs</p>
                            <h2>{recommendedJobs.length}</h2>
                            <span>Based on your profile</span>
                        </div>
                    </div>

                    <div className="summary-card">
                        <div className="summary-card-icon">
                            📄
                        </div>

                        <div>
                            <p>My Applications</p>
                            <h2>
                                {placementStats.totalApplications}
                            </h2>
                            <span>Applications submitted</span>
                        </div>
                    </div>
                </section>

                {/* CAREER PROGRESS */}

                <section className="dashboard-section career-progress-section">
                    <div className="section-heading">
                        <div>
                            <p className="section-label">
                                PLACEMENT ANALYTICS
                            </p>

                            <h2>Career Progress</h2>
                        </div>
                    </div>

                    <p className="section-description">
                        Track your placement application progress.
                    </p>

                    <div className="career-progress-grid">

                        <div className="career-progress-card">
                            <div className="career-progress-icon">
                                📋
                            </div>

                            <div>
                                <p>Total Applications</p>

                                <h3>
                                    {placementStats.totalApplications}
                                </h3>

                                <span>
                                    Jobs you have applied for
                                </span>
                            </div>
                        </div>

                        <div className="career-progress-card">
                            <div className="career-progress-icon">
                                ⭐
                            </div>

                            <div>
                                <p>Shortlisted</p>

                                <h3>
                                    {placementStats.shortlistedApplications}
                                </h3>

                                <span>
                                    Applications shortlisted
                                </span>
                            </div>
                        </div>

                        <div className="career-progress-card">
                            <div className="career-progress-icon">
                                🎯
                            </div>

                            <div>
                                <p>Selected</p>

                                <h3>
                                    {placementStats.selectedApplications}
                                </h3>

                                <span>
                                    Successful applications
                                </span>
                            </div>
                        </div>

                        <div className="career-progress-card">
                            <div className="career-progress-icon">
                                📈
                            </div>

                            <div>
                                <p>Selection Rate</p>

                                <h3>
                                    {placementStats.selectionRate.toFixed(
                                        1
                                    )}
                                    %
                                </h3>

                                <span>
                                    Based on your applications
                                </span>
                            </div>
                        </div>

                    </div>
                </section>

                {/* PLACEMENT READINESS */}

                <section className="dashboard-section placement-readiness-section">
                    <div className="section-heading">
                        <div>
                            <p className="section-label">CAREER READINESS</p>
                            <h2>Placement Readiness</h2>
                        </div>
                    </div>

                    <p className="section-description">
                        Check how prepared your profile is for placement opportunities.
                    </p>

                    <div className="placement-readiness-container">
                        <div className="readiness-score-card">
                            <div className="readiness-score-circle">
                                <span>{placementReadiness.score}</span>
                                <small>/ 100</small>
                            </div>

                            <div className="readiness-score-content">
                                <p className="readiness-score-label">PLACEMENT READINESS SCORE</p>
                                <h3>
                                    {placementReadiness.score >= 75
                                        ? "Good progress"
                                        : placementReadiness.score >= 50
                                            ? "Keep improving"
                                            : "Getting started"}
                                </h3>
                                <p>Complete the checklist below to improve your placement readiness.</p>
                            </div>
                        </div>

                        <div className="readiness-checklist">
                            {[["profileComplete", "Profile Complete", "Keep your academic and contact information updated."], ["resumeUploaded", "Resume Uploaded", "Maintain an updated resume for job applications."], ["hasApplications", "Applied to Jobs", "Apply to suitable placement opportunities."], ["hasShortlistedApplication", "Shortlisted", "Track your progress after applying to jobs."]].map(([key, title, description]) => (
                                <div key={key} className={`readiness-check-item ${placementReadiness[key] ? "readiness-complete" : ""}`}>
                                    <span className="readiness-check-icon">{placementReadiness[key] ? "✓" : "○"}</span>
                                    <div>
                                        <h4>{title}</h4>
                                        <p>{description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* RESUME MANAGER */}

                <section className="dashboard-section">
                    <div className="section-heading">
                        <div>
                            <p className="section-label">
                                CAREER READINESS
                            </p>

                            <h2>Resume Manager</h2>
                        </div>
                    </div>

                    <p className="section-description">
                        Upload and manage your resume for placement
                        applications.
                    </p>

                    <ResumeManager />
                </section>

                {/* AI RESUME ANALYZER */}

                <ResumeAnalyzer />

                {/* AI CAREER ASSISTANT */}

                <CareerAssistant />

                {/* RECOMMENDED JOBS */}

                <section className="dashboard-section">
                    <div className="section-heading">
                        <div>
                            <p className="section-label">
                                PERSONALIZED FOR YOU
                            </p>

                            <h2>Recommended Jobs</h2>
                        </div>
                    </div>

                    <p className="section-description">
                        Jobs matching your CGPA and branch.
                    </p>

                    {recommendationError && (
                        <div className="warning-message">
                            {recommendationError}
                        </div>
                    )}

                    {recommendedJobs.length === 0 ? (
                        <div className="empty-state">
                            No recommended jobs available for your
                            profile.
                        </div>
                    ) : (
                        <div className="job-grid">
                            {recommendedJobs.map((job) =>
                                renderJobCard(job)
                            )}
                        </div>
                    )}
                </section>

                {/* AVAILABLE JOBS */}

                <section className="dashboard-section">
                    <div className="section-heading">
                        <div>
                            <p className="section-label">
                                EXPLORE OPPORTUNITIES
                            </p>

                            <h2>Available Jobs</h2>
                        </div>

                        <span className="result-count">
                            {filteredJobs.length} of {jobs.length} jobs
                        </span>
                    </div>

                    <div className="job-filters">
                        <div className="filter-group search-filter">
                            <label htmlFor="searchTerm">
                                Search
                            </label>

                            <input
                                id="searchTerm"
                                type="text"
                                placeholder="Company, job title, location..."
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(event.target.value)
                                }
                            />
                        </div>

                        <div className="filter-group">
                            <label htmlFor="branchFilter">
                                Branch
                            </label>

                            <select
                                id="branchFilter"
                                value={branchFilter}
                                onChange={(event) =>
                                    setBranchFilter(event.target.value)
                                }
                            >
                                {branches.map((branch) => (
                                    <option
                                        key={branch}
                                        value={branch}
                                    >
                                        {branch === "ALL"
                                            ? "All Branches"
                                            : branch}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label htmlFor="packageFilter">
                                Minimum Package
                            </label>

                            <select
                                id="packageFilter"
                                value={packageFilter}
                                onChange={(event) =>
                                    setPackageFilter(event.target.value)
                                }
                            >
                                <option value="ALL">
                                    Any Package
                                </option>

                                <option value="3">
                                    3+ LPA
                                </option>

                                <option value="5">
                                    5+ LPA
                                </option>

                                <option value="8">
                                    8+ LPA
                                </option>

                                <option value="10">
                                    10+ LPA
                                </option>

                                <option value="15">
                                    15+ LPA
                                </option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <label htmlFor="sortOrder">
                                Sort By
                            </label>

                            <select
                                id="sortOrder"
                                value={sortOrder}
                                onChange={(event) =>
                                    setSortOrder(event.target.value)
                                }
                            >
                                <option value="DEFAULT">
                                    Default
                                </option>

                                <option value="LOW_TO_HIGH">
                                    Package: Low to High
                                </option>

                                <option value="HIGH_TO_LOW">
                                    Package: High to Low
                                </option>
                            </select>
                        </div>

                        <button
                            className="clear-filter-button"
                            onClick={clearFilters}
                        >
                            Clear Filters
                        </button>
                    </div>

                    {filteredJobs.length === 0 ? (
                        <div className="empty-state">
                            No jobs match your selected filters.

                            <button
                                className="reset-link-button"
                                onClick={clearFilters}
                            >
                                Reset Filters
                            </button>
                        </div>
                    ) : (
                        <div className="job-grid">
                            {filteredJobs.map((job) =>
                                renderJobCard(job)
                            )}
                        </div>
                    )}
                </section>

                {/* APPLICATIONS */}

                <section className="dashboard-section">
                    <div className="section-heading">
                        <div>
                            <p className="section-label">
                                APPLICATION TRACKER
                            </p>

                            <h2>My Applications</h2>
                        </div>
                    </div>

                    {applications.length === 0 ? (
                        <div className="empty-state">
                            You have not applied to any jobs yet.
                        </div>
                    ) : (
                        <div className="applications-container">
                            {applications.map((application) => (
                                <div
                                    className="application-item"
                                    key={application.id}
                                >
                                    <div className="application-main">
                                        <div className="application-icon">
                                            📄
                                        </div>

                                        <div className="application-details">
                                            <h3>
                                                {application.jobTitle ||
                                                    `Application #${application.id}`}
                                            </h3>

                                            <p className="application-company">
                                                {application.company ||
                                                    "Company unavailable"}
                                            </p>

                                            <p className="application-job-id">
                                                Job ID:{" "}
                                                {application.jobId}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="application-right">
                                        <span
                                            className={`status-badge ${getStatusClass(
                                                application.status
                                            )}`}
                                        >
                                            {application.status}
                                        </span>

                                        <button
                                            className="timeline-button"
                                            onClick={() =>
                                                toggleTimeline(
                                                    application.id
                                                )
                                            }
                                        >
                                            {expandedApplication ===
                                            application.id
                                                ? "Hide Timeline"
                                                : "View Timeline"}
                                        </button>
                                    </div>

                                    {expandedApplication ===
                                        application.id && (
                                            <div className="timeline-wrapper">
                                                <ApplicationTimeline
                                                    applicationId={
                                                        application.id
                                                    }
                                                />
                                            </div>
                                        )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default StudentDashboard;
