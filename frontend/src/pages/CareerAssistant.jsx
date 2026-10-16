import { useState } from "react";
import "./CareerAssistant.css";

function CareerAssistant() {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const askAssistant = async () => {
        if (!question.trim()) {
            setError("Please enter a question.");
            return;
        }

        setLoading(true);
        setError("");
        setAnswer("");

        try {
            const auth = sessionStorage.getItem("auth");

            const response = await fetch(
                "http://localhost:8080/ai/career-assistant",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Basic ${auth}`,
                    },
                    body: JSON.stringify({
                        question: question.trim(),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to get AI response."
                );
            }

            setAnswer(data.answer || "No answer received.");
        } catch (err) {
            setError(
                err.message || "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            askAssistant();
        }
    };

    return (
        <section className="career-assistant">
            <div className="career-assistant-header">
                <div>
                    <span className="career-ai-badge">AI CAREER ASSISTANT</span>

                    <h2>Ask Your Career Assistant 🤖</h2>

                    <p>
                        Get personalized guidance for placements, DSA,
                        development, projects and technical skills.
                    </p>
                </div>
            </div>

            <div className="career-assistant-content">

                <div className="career-suggestions">
                    <p>Try asking:</p>

                    <button
                        onClick={() =>
                            setQuestion(
                                "What skills should I learn for backend development?"
                            )
                        }
                    >
                        Backend development skills
                    </button>

                    <button
                        onClick={() =>
                            setQuestion(
                                "How should I prepare for software engineering placements?"
                            )
                        }
                    >
                        Placement preparation
                    </button>

                    <button
                        onClick={() =>
                            setQuestion(
                                "Give me a roadmap for learning DSA in Java."
                            )
                        }
                    >
                        DSA roadmap
                    </button>
                </div>

                <div className="career-chat-box">

                    <textarea
                        value={question}
                        onChange={(event) =>
                            setQuestion(event.target.value)
                        }
                        onKeyDown={handleKeyDown}
                        placeholder="Ask something about your career..."
                        rows="4"
                        disabled={loading}
                    />

                    <div className="career-chat-footer">
                        <span>
                            Press Enter to ask
                        </span>

                        <button
                            onClick={askAssistant}
                            disabled={loading || !question.trim()}
                        >
                            {loading ? "Thinking..." : "Ask AI"}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="career-error">
                        {error}
                    </div>
                )}

                {answer && (
                    <div className="career-answer">
                        <div className="career-answer-title">
                            🤖 AI Career Assistant
                        </div>

                        <div className="career-answer-text">
                            {answer}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

export default CareerAssistant;