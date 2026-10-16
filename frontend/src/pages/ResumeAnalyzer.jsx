import { useState } from "react";
import "./ResumeAnalyzer.css";

function ResumeAnalyzer() {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const analyzeResume = async () => {
        setLoading(true);
        setError("");
        setAnalysis(null);

        try {
            const auth = sessionStorage.getItem("auth");

            const response = await fetch(
                "http://localhost:8080/ai/resume-analysis",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Basic ${auth}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    data?.error ||
                    "Failed to analyze resume"
                );
            }

            setAnalysis(data);
        } catch (err) {
            setError(
                err.message ||
                "Something went wrong while analyzing the resume."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="resume-analyzer">

            <div className="resume-analyzer-header">

                <div>
                    <span className="resume-ai-badge">
                        AI POWERED
                    </span>

                    <h2>AI Resume Analyzer</h2>

                    <p>
                        Get an AI-powered review of your resume,
                        including ATS score, skills, strengths and
                        improvement suggestions.
                    </p>
                </div>

                <button
                    className="analyze-resume-button"
                    onClick={analyzeResume}
                    disabled={loading}
                >
                    {loading
                        ? "Analyzing..."
                        : "Analyze My Resume"}
                </button>

            </div>

            {error && (
                <div className="resume-analysis-error">
                    {error}
                </div>
            )}

            {loading && (
                <div className="resume-analysis-loading">

                    <div className="resume-spinner"></div>

                    <p>
                        Gemini is analyzing your resume...
                    </p>

                    <span>
                        This may take a few seconds.
                    </span>

                </div>
            )}

            {analysis && !loading && (
                <div className="resume-analysis-results">

                    {/* ATS SCORE */}

                    <div className="ats-score-card">

                        <div className="ats-score-circle">
                            <span>
                                {analysis.atsScore}
                            </span>

                            <small>/100</small>
                        </div>

                        <div className="ats-score-content">

                            <h3>ATS Score</h3>

                            <p>
                                {analysis.overallFeedback}
                            </p>

                        </div>

                    </div>

                    {/* DETECTED SKILLS */}

                    <div className="analysis-card">

                        <div className="analysis-card-header">

                            <h3>
                                Detected Skills
                            </h3>

                            <span className="analysis-icon">
                                ✓
                            </span>

                        </div>

                        {analysis.detectedSkills?.length > 0 ? (
                            <div className="analysis-tags">

                                {analysis.detectedSkills.map(
                                    (skill, index) => (
                                        <span
                                            className="skill-tag"
                                            key={index}
                                        >
                                            {skill}
                                        </span>
                                    )
                                )}

                            </div>
                        ) : (
                            <p className="empty-analysis">
                                No skills detected.
                            </p>
                        )}

                    </div>

                    {/* MISSING SKILLS */}

                    <div className="analysis-card">

                        <div className="analysis-card-header">

                            <h3>
                                Missing / Recommended Skills
                            </h3>

                            <span className="analysis-icon warning">
                                !
                            </span>

                        </div>

                        {analysis.missingSkills?.length > 0 ? (
                            <ul className="analysis-list">

                                {analysis.missingSkills.map(
                                    (skill, index) => (
                                        <li key={index}>
                                            {skill}
                                        </li>
                                    )
                                )}

                            </ul>
                        ) : (
                            <p className="empty-analysis">
                                No missing skills identified.
                            </p>
                        )}

                    </div>

                    {/* STRENGTHS */}

                    <div className="analysis-card">

                        <div className="analysis-card-header">

                            <h3>
                                Resume Strengths
                            </h3>

                            <span className="analysis-icon">
                                ★
                            </span>

                        </div>

                        {analysis.strengths?.length > 0 ? (
                            <ul className="analysis-list strengths-list">

                                {analysis.strengths.map(
                                    (strength, index) => (
                                        <li key={index}>
                                            {strength}
                                        </li>
                                    )
                                )}

                            </ul>
                        ) : (
                            <p className="empty-analysis">
                                No specific strengths identified.
                            </p>
                        )}

                    </div>

                    {/* IMPROVEMENTS */}

                    <div className="analysis-card">

                        <div className="analysis-card-header">

                            <h3>
                                Areas to Improve
                            </h3>

                            <span className="analysis-icon">
                                ↗
                            </span>

                        </div>

                        {analysis.improvements?.length > 0 ? (
                            <ul className="analysis-list">

                                {analysis.improvements.map(
                                    (improvement, index) => (
                                        <li key={index}>
                                            {improvement}
                                        </li>
                                    )
                                )}

                            </ul>
                        ) : (
                            <p className="empty-analysis">
                                No specific improvements identified.
                            </p>
                        )}

                    </div>

                    {/* SUGGESTIONS */}

                    <div className="analysis-card suggestions-card">

                        <div className="analysis-card-header">

                            <h3>
                                AI Suggestions
                            </h3>

                            <span className="analysis-icon">
                                ✦
                            </span>

                        </div>

                        {analysis.suggestions?.length > 0 ? (
                            <ul className="analysis-list suggestions-list">

                                {analysis.suggestions.map(
                                    (suggestion, index) => (
                                        <li key={index}>
                                            {suggestion}
                                        </li>
                                    )
                                )}

                            </ul>
                        ) : (
                            <p className="empty-analysis">
                                No suggestions available.
                            </p>
                        )}

                    </div>

                </div>
            )}

        </section>
    );
}

export default ResumeAnalyzer;