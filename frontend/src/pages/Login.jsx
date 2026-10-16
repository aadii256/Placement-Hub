
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const credentials = btoa(`${username}:${password}`);

            const response = await fetch("http://localhost:8080/students", {
                method: "GET",
                headers: {
                    Authorization: `Basic ${credentials}`,
                },
            });

            if (response.status === 401) {
                setError("Invalid username or password.");
                setLoading(false);
                return;
            }

            if (!response.ok) {
                setError("Login failed. Please try again.");
                setLoading(false);
                return;
            }

            sessionStorage.setItem("auth", credentials);
            sessionStorage.setItem("username", username);

            const dashboardResponse = await fetch(
                "http://localhost:8080/dashboard/stats",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Basic ${credentials}`,
                    },
                }
            );

            if (dashboardResponse.ok) {
                sessionStorage.setItem("role", "ADMIN");
                navigate("/admin-dashboard");
            } else if (dashboardResponse.status === 403) {
                sessionStorage.setItem("role", "STUDENT");
                navigate("/student-dashboard");
            } else {
                setError("Unable to determine user role.");
            }
        } catch (error) {
            console.error(error);

            setError(
                "Cannot connect to the backend. Make sure Spring Boot is running."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-visual">
                <div className="login-visual-content">
                    <div className="visual-logo">
                        Placement<span>Hub</span>
                    </div>

                    <h1>
                        Build Your
                        <br />
                        Career With Confidence.
                    </h1>

                    <p>
                        Connect with opportunities, manage applications,
                        and take the next step toward your dream career.
                    </p>

                    <div className="visual-points">
                        <div className="visual-point">
                            <span>✓</span>
                            Explore placement opportunities
                        </div>

                        <div className="visual-point">
                            <span>✓</span>
                            Track your application progress
                        </div>

                        <div className="visual-point">
                            <span>✓</span>
                            Manage your career profile
                        </div>
                    </div>
                </div>

                <div className="visual-decoration decoration-one"></div>
                <div className="visual-decoration decoration-two"></div>
            </div>

            <div className="login-form-section">
                <div className="login-card">
                    <div className="mobile-logo">
                        Placement<span>Hub</span>
                    </div>

                    <div className="login-header">
                        <span className="login-badge">WELCOME BACK</span>

                        <h2>Sign in to your account</h2>

                        <p>
                            Enter your credentials to access your dashboard.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="login-form">
                        <div className="form-group">
                            <label htmlFor="username">Username</label>

                            <div className="input-wrapper">
                                <span className="input-icon">◉</span>

                                <input
                                    id="username"
                                    type="text"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                    autoComplete="username"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>

                            <div className="input-wrapper">
                                <span className="input-icon">●</span>

                                <input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    autoComplete="current-password"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="login-error" role="alert">
                                <span>!</span>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="login-submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="loading-spinner"></span>
                                    Logging in...
                                </>
                            ) : (
                                <>
                                    Login
                                    <span className="button-arrow">→</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="login-info">
                        <span className="info-icon">ⓘ</span>
                        <p>
                            Student and Admin accounts are supported.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="back-home-button"
                        onClick={() => navigate("/")}
                    >
                        ← Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Login;