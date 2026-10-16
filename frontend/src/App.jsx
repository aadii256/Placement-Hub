import { useEffect, useState } from "react";
import "./App.css";
import { Routes, Route, Link } from "react-router-dom";

import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import JobDetails from "./pages/JobDetails";
import PublicJobs from "./pages/PublicJobs";
import AdminJobs from "./pages/AdminJobs";
import StudentProfile from "./pages/StudentProfile";
import AdminStudents from "./pages/AdminStudents";
import AdminCompanies from "./pages/AdminCompanies";

import ProtectedRoute from "./components/ProtectedRoute";

function Home() {
  const [stats, setStats] = useState({
    totalCompanies: 0,
    activeJobs: 0,
    totalStudents: 0,
    totalApplications: 0,
  });

  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchPublicStats = async () => {
      try {
        const response = await fetch(
            "http://localhost:8080/public/stats"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch public statistics");
        }

        const data = await response.json();

        setStats({
          totalCompanies: data.totalCompanies ?? 0,
          activeJobs: data.activeJobs ?? 0,
          totalStudents: data.totalStudents ?? 0,
          totalApplications: data.totalApplications ?? 0,
        });
      } catch (error) {
        console.error(
            "Error fetching public statistics:",
            error
        );
      } finally {
        setLoadingStats(false);
      }
    };

    fetchPublicStats();
  }, []);

  return (
      <div className="app">
        <nav className="navbar">
          <div className="logo">
            Placement<span>Hub</span>
          </div>

          <div className="nav-links">
            <a href="#home">Home</a>

            <Link to="/jobs">
              Jobs
            </Link>

            <a href="#about">About</a>

            <Link to="/login">
              <button className="login-btn">
                Login
              </button>
            </Link>
          </div>
        </nav>

        <main>
          <section className="hero" id="home">
            <div className="hero-content">
              <p className="hero-tag">
                SMART CAMPUS PLACEMENT PLATFORM
              </p>

              <h1>
                Your Career.
                <br />
                <span>Your Opportunity.</span>
              </h1>

              <p className="hero-description">
                PlacementHub connects students with job
                opportunities, companies and placement
                activities through one platform.
              </p>

              <div className="hero-buttons">
                <Link to="/jobs">
                  <button className="primary-btn">
                    Explore Jobs
                  </button>
                </Link>

                <Link to="/login">
                  <button className="secondary-btn">
                    Student Login
                  </button>
                </Link>
              </div>
            </div>

            <div className="hero-card">
              <div className="card-header">
                <span>Placement Overview</span>
                <span className="status-dot">
                ● Live
              </span>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <h3>
                    {loadingStats
                        ? "..."
                        : stats.totalCompanies}
                  </h3>
                  <p>Companies</p>
                </div>

                <div className="stat-card">
                  <h3>
                    {loadingStats
                        ? "..."
                        : stats.activeJobs}
                  </h3>
                  <p>Active Jobs</p>
                </div>

                <div className="stat-card">
                  <h3>
                    {loadingStats
                        ? "..."
                        : stats.totalStudents}
                  </h3>
                  <p>Students</p>
                </div>

                <div className="stat-card">
                  <h3>
                    {loadingStats
                        ? "..."
                        : stats.totalApplications}
                  </h3>
                  <p>Applications</p>
                </div>
              </div>
            </div>
          </section>

          <section className="features" id="jobs">
            <div className="section-heading">
              <p>PLACEMENT MANAGEMENT</p>
              <h2>Everything in one place</h2>
            </div>

            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-icon">💼</div>

                <h3>Find Jobs</h3>

                <p>
                  Search and filter placement opportunities
                  according to your skills and eligibility.
                </p>

                <Link
                    to="/jobs"
                    className="feature-link"
                >
                  Explore opportunities →
                </Link>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🎯</div>

                <h3>Smart Recommendations</h3>

                <p>
                  Get job recommendations based on your
                  CGPA and academic branch.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">📊</div>

                <h3>Track Applications</h3>

                <p>
                  Monitor your application status from
                  applied to shortlisted and selected.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">📈</div>

                <h3>Placement Analytics</h3>

                <p>
                  Administrators can monitor applications,
                  jobs and placement statistics.
                </p>
              </div>
            </div>
          </section>

          <section className="about" id="about">
            <div>
              <p className="section-label">
                ABOUT PLACEMENTHUB
              </p>

              <h2>
                A centralized platform for
                modern campus placements.
              </h2>
            </div>

            <p>
              PlacementHub is designed to simplify the
              campus placement process by connecting
              students, companies and administrators
              through a secure backend-driven platform.
            </p>
          </section>
        </main>

        <footer>
          <p>
            © 2026 PlacementHub. Built with Java,
            Spring Boot, React and MySQL.
          </p>
        </footer>
      </div>
  );
}

function App() {
  return (
      <Routes>

        {/* Public Routes */}

        <Route
            path="/"
            element={<Home />}
        />

        <Route
            path="/login"
            element={<Login />}
        />

        <Route
            path="/jobs"
            element={<PublicJobs />}
        />

        <Route
            path="/job/:id"
            element={<JobDetails />}
        />


        {/* Admin Routes */}

        <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
        />

        <Route
            path="/admin-jobs"
            element={
              <ProtectedRoute allowedRole="ADMIN">
                <AdminJobs />
              </ProtectedRoute>
            }
        />

        <Route
            path="/admin-students"
            element={
              <ProtectedRoute allowedRole="ADMIN">
                <AdminStudents />
              </ProtectedRoute>
            }
        />

        <Route
            path="/admin-companies"
            element={
              <ProtectedRoute allowedRole="ADMIN">
                <AdminCompanies />
              </ProtectedRoute>
            }
        />


        {/* Student Routes */}

        <Route
            path="/student-dashboard"
            element={
              <ProtectedRoute allowedRole="STUDENT">
                <StudentDashboard />
              </ProtectedRoute>
            }
        />

        <Route
            path="/student-profile"
            element={
              <ProtectedRoute allowedRole="STUDENT">
                <StudentProfile />
              </ProtectedRoute>
            }
        />

      </Routes>
  );
}

export default App;