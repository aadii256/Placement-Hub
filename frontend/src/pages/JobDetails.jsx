import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./JobDetails.css";

function JobDetails() {
    const { id: jobId } = useParams();
    const navigate = useNavigate();

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const [aiMatch, setAiMatch] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState("");

    const auth = sessionStorage.getItem("auth");
    const username = sessionStorage.getItem("username");
    const role = sessionStorage.getItem("role");

    const fetchJobDetails = useCallback(async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const response = await fetch(
                `http://localhost:8080/jobs/${jobId}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Basic ${auth}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const responseText = await response.text();

            let responseData = null;

            try {
                responseData = responseText
                    ? JSON.parse(responseText)
                    : null;
            } catch {
                responseData = null;
            }

            if (!response.ok) {
                console.error("Job API Error:", {
                    status: response.status,
                    statusText: response.statusText,
                    response: responseText,
                    jobId,
                });

                throw new Error(
                    responseData?.message ||
                    responseData?.error ||
                    `Unable to fetch job details. Status: ${response.status}`
                );
            }

            setJob(responseData);
        } catch (error) {
            console.error("Fetch Job Error:", error);
            setErrorMessage(error.message);
        } finally {
            setLoading(false);
        }
    }, [auth, jobId]);

    useEffect(() => {
        if (!auth || role !== "STUDENT") {
            navigate("/login");
            return;
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect
        void fetchJobDetails();
    }, [auth, role, navigate, fetchJobDetails]);

    const handleAiMatch = async () => {
        try {
            setAiLoading(true);
            setAiError("");
            setAiMatch(null);

            const response = await fetch(
                `http://localhost:8080/ai/job-match/${jobId}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Basic ${auth}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const responseText = await response.text();

            let responseData = null;

            try {
                responseData = responseText
                    ? JSON.parse(responseText)
                    : null;
            } catch {
                responseData = null;
            }

            if (!response.ok) {
                throw new Error(
                    responseData?.message ||
                    responseData?.error ||
                    responseText ||
                    `Unable to analyze job match. Status: ${response.status}`
                );
            }

            setAiMatch(responseData);
        } catch (error) {
            console.error("AI Match Error:", error);
            setAiError(error.message);
        } finally {
            setAiLoading(false);
        }
    };

    const handleApply = async () => {
        if (!job) {
            return;
        }

        if (job.status === "CLOSED") {
            setErrorMessage("Applications are closed for this job.");
            return;
        }

        try {
            setApplying(true);
            setSuccessMessage("");
            setErrorMessage("");

            const response = await fetch(
                "http://localhost:8080/applications",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Basic ${auth}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        jobId: Number(job.id),
                    }),
                }
            );

            const responseText = await response.text();

            let responseData = null;

            try {
                responseData = responseText
                    ? JSON.parse(responseText)
                    : null;
            } catch {
                responseData = null;
            }

            if (!response.ok) {
                const backendMessage =
                    responseData?.message ||
                    responseData?.error ||
                    responseText ||
                    "Unable to submit application.";

                throw new Error(backendMessage);
            }

            setSuccessMessage(
                "Application submitted successfully!"
            );
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setApplying(false);
        }
    };

    const handleLogout = () => {
        sessionStorage.clear();
        navigate("/login");
    };

    if (loading) {
        return (
            <div className="job-details-page">
                <nav className="job-details-navbar">
                    <Link
                        to="/student-dashboard"
                        className="navbar-logo"
                    >
                        PlacementHub
                    </Link>
                </nav>

                <main className="job-details-container">
                    <div className="job-loading-card">
                        <div className="job-loading-spinner"></div>
                        <h2>Loading job details...</h2>
                        <p>Please wait while we fetch the opportunity.</p>
                    </div>
                </main>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="job-details-page">
                <nav className="job-details-navbar">
                    <Link
                        to="/student-dashboard"
                        className="navbar-logo"
                    >
                        PlacementHub
                    </Link>
                </nav>

                <main className="job-details-container">
                    <div className="job-error-card">
                        <div className="job-error-icon">⚠️</div>

                        <h2>Job not found</h2>

                        <p>
                            {errorMessage ||
                                "The requested job could not be found."}
                        </p>

                        <Link
                            to="/student-dashboard"
                            className="back-dashboard-button"
                        >
                            ← Back to Dashboard
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    const isClosed = job.status === "CLOSED";

    return (
        <div className="job-details-page">

            {/* ================= NAVBAR ================= */}

            <nav className="job-details-navbar">

                <Link
                    to="/student-dashboard"
                    className="navbar-logo"
                >
                    Placement<span>Hub</span>
                </Link>

                <div className="navbar-right">

                    <span className="navbar-user">
                        Welcome, {username}
                    </span>

                    <Link
                        to="/student-profile"
                        className="navbar-link"
                    >
                        My Profile
                    </Link>

                    <button
                        type="button"
                        className="navbar-logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </nav>

            {/* ================= MAIN ================= */}

            <main className="job-details-container">

                <Link
                    to="/student-dashboard"
                    className="back-dashboard-link"
                >
                    ← Back to Dashboard
                </Link>

                {/* ================= MESSAGES ================= */}

                {successMessage && (
                    <div className="job-success-message">
                        <span className="message-icon">✓</span>
                        <span>{successMessage}</span>
                    </div>
                )}

                {errorMessage && (
                    <div className="job-error-message">
                        <span className="message-icon">!</span>
                        <span>{errorMessage}</span>
                    </div>
                )}

                {/* ================= JOB CARD ================= */}

                <section className="job-details-card">

                    {/* JOB HEADER */}

                    <div className="job-details-header">

                        <div className="job-header-content">

                            <div className="job-company-row">
                                <span className="job-company-logo">
                                    🏢
                                </span>

                                <p className="job-company-name">
                                    {job.company}
                                </p>
                            </div>

                            <h1 className="job-details-title">
                                {job.title}
                            </h1>

                            <p className="job-location">
                                📍 {job.location || "Location not specified"}
                            </p>

                        </div>

                        <div className="job-header-badges">

                            <span className="job-id-badge">
                                Job #{job.id}
                            </span>

                            <span
                                className={
                                    isClosed
                                        ? "job-status-badge closed"
                                        : "job-status-badge active"
                                }
                            >
                                <span className="status-dot"></span>
                                {isClosed ? "CLOSED" : "ACTIVE"}
                            </span>

                        </div>

                    </div>

                    {/* JOB OVERVIEW */}

                    <div className="job-overview-grid">

                        <div className="job-overview-item">
                            <span className="overview-icon">
                                💰
                            </span>

                            <div>
                                <span className="overview-label">
                                    Package
                                </span>

                                <strong className="overview-value">
                                    {job.packageLPA} LPA
                                </strong>
                            </div>
                        </div>

                        <div className="job-overview-item">
                            <span className="overview-icon">
                                🎓
                            </span>

                            <div>
                                <span className="overview-label">
                                    Eligible Branch
                                </span>

                                <strong className="overview-value">
                                    {job.eligibleBranch || "All Branches"}
                                </strong>
                            </div>
                        </div>

                        <div className="job-overview-item">
                            <span className="overview-icon">
                                📊
                            </span>

                            <div>
                                <span className="overview-label">
                                    Minimum CGPA
                                </span>

                                <strong className="overview-value">
                                    {job.minimumCgpa}
                                </strong>
                            </div>
                        </div>

                        <div className="job-overview-item">
                            <span className="overview-icon">
                                {isClosed ? "🔒" : "✓"}
                            </span>

                            <div>
                                <span className="overview-label">
                                    Job Status
                                </span>

                                <strong
                                    className={
                                        isClosed
                                            ? "overview-value status-closed"
                                            : "overview-value status-active"
                                    }
                                >
                                    {isClosed ? "Closed" : "Active"}
                                </strong>
                            </div>
                        </div>

                    </div>

                    {/* ================= DESCRIPTION ================= */}

                    <div className="job-content-grid">

                        <div className="job-description-section">

                            <div className="content-section-heading">
                                <span className="content-section-icon">
                                    📋
                                </span>

                                <h2>Job Description</h2>
                            </div>

                            <p>
                                {job.description ||
                                    "No job description has been provided."}
                            </p>

                        </div>

                        {/* ================= ELIGIBILITY ================= */}

                        <div className="job-eligibility-section">

                            <div className="content-section-heading">
                                <span className="content-section-icon">
                                    ✓
                                </span>

                                <h2>Eligibility Criteria</h2>
                            </div>

                            <ul>

                                <li>
                                    <span>Eligible Branch</span>
                                    <strong>
                                        {job.eligibleBranch ||
                                            "All Branches"}
                                    </strong>
                                </li>

                                <li>
                                    <span>Minimum CGPA</span>
                                    <strong>
                                        {job.minimumCgpa}
                                    </strong>
                                </li>

                                <li>
                                    <span>Package</span>
                                    <strong>
                                        {job.packageLPA} LPA
                                    </strong>
                                </li>

                            </ul>

                        </div>

                    </div>

                    {/* ================= AI MATCH ================= */}

                    <div className="ai-match-section">

                        <div className="ai-match-header">

                            <div className="ai-match-intro">

                                <span className="ai-match-label">
                                    AI POWERED
                                </span>

                                <h2>
                                    🤖 AI Job Match
                                </h2>

                                <p>
                                    Let Gemini analyze your profile against
                                    this job and identify your compatibility,
                                    missing skills, and improvement areas.
                                </p>

                            </div>

                            <button
                                type="button"
                                className="ai-match-button"
                                onClick={handleAiMatch}
                                disabled={aiLoading}
                            >
                                {aiLoading
                                    ? "🤖 Analyzing..."
                                    : aiMatch
                                        ? "🔄 Analyze Again"
                                        : "🤖 Check AI Match"}
                            </button>

                        </div>

                        {aiError && (
                            <div className="ai-match-error">
                                <span>!</span>
                                {aiError}
                            </div>
                        )}

                        {aiMatch && (
                            <div className="ai-match-result">

                                <div className="ai-match-score-card">

                                    <span className="ai-score-label">
                                        YOUR AI MATCH
                                    </span>

                                    <strong className="ai-score">
                                        {aiMatch.matchPercentage}%
                                    </strong>

                                    <span className="ai-score-caption">
                                        compatibility
                                    </span>

                                </div>

                                <div className="ai-match-details">

                                    {aiMatch.matchingPoints?.length > 0 && (
                                        <div className="ai-result-block matching-block">

                                            <h3>
                                                <span>✓</span>
                                                Why you match
                                            </h3>

                                            <ul>
                                                {aiMatch.matchingPoints.map(
                                                    (point, index) => (
                                                        <li key={index}>
                                                            {point}
                                                        </li>
                                                    )
                                                )}
                                            </ul>

                                        </div>
                                    )}

                                    {aiMatch.missingSkills?.length > 0 && (
                                        <div className="ai-result-block missing-block">

                                            <h3>
                                                <span>!</span>
                                                Missing / Unverified Skills
                                            </h3>

                                            <ul>
                                                {aiMatch.missingSkills.map(
                                                    (skill, index) => (
                                                        <li key={index}>
                                                            {skill}
                                                        </li>
                                                    )
                                                )}
                                            </ul>

                                        </div>
                                    )}

                                    {aiMatch.suggestions?.length > 0 && (
                                        <div className="ai-result-block suggestion-block">

                                            <h3>
                                                <span>💡</span>
                                                AI Suggestions
                                            </h3>

                                            <ul>
                                                {aiMatch.suggestions.map(
                                                    (suggestion, index) => (
                                                        <li key={index}>
                                                            {suggestion}
                                                        </li>
                                                    )
                                                )}
                                            </ul>

                                        </div>
                                    )}

                                </div>

                            </div>
                        )}

                    </div>

                    {/* ================= APPLY ================= */}

                    <div
                        className={
                            isClosed
                                ? "job-apply-section job-apply-closed"
                                : "job-apply-section"
                        }
                    >

                        <div className="apply-section-content">

                            <span className="apply-section-label">
                                {isClosed
                                    ? "APPLICATION STATUS"
                                    : "READY TO APPLY?"}
                            </span>

                            <h2>
                                {isClosed
                                    ? "Applications Closed"
                                    : "Interested in this job?"}
                            </h2>

                            <p>
                                {isClosed
                                    ? "This company is no longer accepting applications for this job."
                                    : "Submit your application to apply for this opportunity."}
                            </p>

                        </div>

                        <button
                            type="button"
                            className={
                                isClosed
                                    ? "apply-job-button closed-apply-button"
                                    : "apply-job-button"
                            }
                            onClick={handleApply}
                            disabled={applying || isClosed}
                        >
                            {isClosed
                                ? "Applications Closed"
                                : applying
                                    ? "Submitting..."
                                    : successMessage
                                        ? "✓ Application Submitted"
                                        : "Apply for this Job"}
                        </button>

                    </div>

                </section>

            </main>
        </div>
    );
}

export default JobDetails;