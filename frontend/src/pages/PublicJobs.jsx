
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./PublicJobs.css";

function PublicJobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [branch, setBranch] = useState("ALL");
    const [status, setStatus] = useState("ALL");
    const [minPackage, setMinPackage] = useState("0");

    useEffect(() => {
        fetch("http://localhost:8080/jobs")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Unable to fetch jobs");
                }

                return response.json();
            })
            .then((data) => {
                setJobs(Array.isArray(data) ? data : []);
                setError("");
            })
            .catch(() => {
                setError(
                    "Unable to load jobs. Please make sure the backend is running."
                );
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const normalizedJobs = useMemo(() => {
        return jobs.map((job) => ({
            ...job,
            status: job.status || "ACTIVE",
        }));
    }, [jobs]);

    const branches = useMemo(() => {
        const uniqueBranches = normalizedJobs
            .map((job) => job.eligibleBranch)
            .filter(Boolean);

        return ["ALL", ...new Set(uniqueBranches)];
    }, [normalizedJobs]);

    const filteredJobs = useMemo(() => {
        const searchText = search.trim().toLowerCase();
        const selectedMinimumPackage = Number(minPackage);

        return normalizedJobs.filter((job) => {
            const searchableText = [
                job.title,
                job.company,
                job.location,
                job.description,
                job.eligibleBranch,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            const matchesSearch =
                searchText.length === 0 || searchableText.includes(searchText);

            const matchesBranch =
                branch === "ALL" || job.eligibleBranch === branch;

            const matchesStatus =
                status === "ALL" || job.status === status;

            const matchesPackage =
                Number(job.packageLPA || 0) >= selectedMinimumPackage;

            return (
                matchesSearch &&
                matchesBranch &&
                matchesStatus &&
                matchesPackage
            );
        });
    }, [normalizedJobs, search, branch, status, minPackage]);

    const clearFilters = () => {
        setSearch("");
        setBranch("ALL");
        setStatus("ALL");
        setMinPackage("0");
    };

    return (
        <div className="public-jobs-page">
            <header className="public-jobs-header">
                <div className="public-jobs-navbar">
                    <Link to="/" className="public-jobs-logo">
                        Placement<span>Hub</span>
                    </Link>

                    <div className="public-jobs-nav-actions">
                        <Link to="/" className="back-home-link">
                            Home
                        </Link>

                        <Link to="/login" className="public-login-btn">
                            Login
                        </Link>
                    </div>
                </div>

                <div className="public-jobs-hero">
                    <p className="public-jobs-eyebrow">
                        EXPLORE CAREER OPPORTUNITIES
                    </p>

                    <h1>Find your next opportunity</h1>

                    <p>
                        Explore placement opportunities from companies
                        hiring through PlacementHub.
                    </p>
                </div>
            </header>

            <main className="public-jobs-content">
                <section className="jobs-filter-panel">
                    <div className="filter-heading">
                        <div>
                            <p className="filter-eyebrow">JOB DISCOVERY</p>
                            <h2>Explore Jobs</h2>
                        </div>

                        <span className="job-count">
              {filteredJobs.length} jobs found
            </span>
                    </div>

                    <div className="jobs-filter-grid">
                        <div className="filter-field search-field">
                            <label htmlFor="job-search">
                                Search
                            </label>

                            <input
                                id="job-search"
                                type="text"
                                placeholder="Search title, company or location"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                            />
                        </div>

                        <div className="filter-field">
                            <label htmlFor="branch-filter">
                                Branch
                            </label>

                            <select
                                id="branch-filter"
                                value={branch}
                                onChange={(event) => setBranch(event.target.value)}
                            >
                                {branches.map((item) => (
                                    <option key={item} value={item}>
                                        {item === "ALL" ? "All branches" : item}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-field">
                            <label htmlFor="status-filter">
                                Status
                            </label>

                            <select
                                id="status-filter"
                                value={status}
                                onChange={(event) => setStatus(event.target.value)}
                            >
                                <option value="ALL">All statuses</option>
                                <option value="ACTIVE">Active</option>
                                <option value="CLOSED">Closed</option>
                            </select>
                        </div>

                        <div className="filter-field">
                            <label htmlFor="package-filter">
                                Minimum Package
                            </label>

                            <select
                                id="package-filter"
                                value={minPackage}
                                onChange={(event) => setMinPackage(event.target.value)}
                            >
                                <option value="0">Any package</option>
                                <option value="5">5+ LPA</option>
                                <option value="8">8+ LPA</option>
                                <option value="10">10+ LPA</option>
                                <option value="12">12+ LPA</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="clear-filters-btn"
                        onClick={clearFilters}
                    >
                        Clear Filters
                    </button>
                </section>

                {loading && (
                    <div className="jobs-message">
                        <div className="loading-spinner"></div>
                        <p>Loading available jobs...</p>
                    </div>
                )}

                {!loading && error && (
                    <div className="jobs-message error-message">
                        <h3>Something went wrong</h3>
                        <p>{error}</p>
                    </div>
                )}

                {!loading && !error && filteredJobs.length === 0 && (
                    <div className="jobs-message">
                        <h3>No jobs found</h3>
                        <p>
                            Try changing your search text or filters.
                        </p>

                        <button
                            type="button"
                            className="clear-filters-btn"
                            onClick={clearFilters}
                        >
                            Reset Search
                        </button>
                    </div>
                )}

                {!loading && !error && filteredJobs.length > 0 && (
                    <section className="public-job-grid">
                        {filteredJobs.map((job) => {
                            const isClosed = job.status === "CLOSED";

                            return (
                                <article className="public-job-card" key={job.id}>
                                    <div className="job-card-top">
                                        <div className="company-avatar">
                                            {(job.company || "C").charAt(0).toUpperCase()}
                                        </div>

                                        <span
                                            className={`job-status-badge ${
                                                isClosed ? "closed" : "active"
                                            }`}
                                        >
                      {isClosed ? "Closed" : "Active"}
                    </span>
                                    </div>

                                    <div className="public-job-card-body">
                                        <p className="public-company-name">
                                            {job.company || "Company not specified"}
                                        </p>

                                        <h3>{job.title}</h3>

                                        <div className="public-job-info">
                                            <span>📍 {job.location || "Not specified"}</span>
                                            <span>
                        💰 {job.packageLPA || 0} LPA
                      </span>
                                            <span>
                        🎓 {job.eligibleBranch || "All branches"}
                      </span>
                                            <span>
                        📊 Minimum CGPA: {job.minimumCgpa ?? "Not specified"}
                      </span>
                                        </div>

                                        <p className="public-job-description">
                                            {job.description ||
                                                "Explore this opportunity and learn more about the role."}
                                        </p>
                                    </div>

                                    <div className="public-job-card-footer">
                                        <Link
                                            to={`/job/${job.id}`}
                                            className="view-job-btn"
                                        >
                                            View Details
                                        </Link>

                                        {isClosed ? (
                                            <span className="closed-label">
                        Applications Closed
                      </span>
                                        ) : (
                                            <span className="open-label">
                        Applications Open
                      </span>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </section>
                )}
            </main>

            <footer className="public-jobs-footer">
                <p>
                    © 2026 PlacementHub. Built with Java, Spring Boot,
                    React and MySQL.
                </p>
            </footer>
        </div>
    );
}

export default PublicJobs;