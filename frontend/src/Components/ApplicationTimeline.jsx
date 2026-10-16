
import { useEffect, useState } from "react";

function ApplicationTimeline({ applicationId }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const auth = sessionStorage.getItem("auth");

                const response = await fetch(
                    `http://localhost:8080/applications/${applicationId}/history`,
                    {
                        headers: {
                            Authorization: `Basic ${auth}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        "Failed to fetch application history"
                    );
                }

                const data = await response.json();
                setHistory(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [applicationId]);

    const getStatusStyle = (status) => {
        switch (status) {
            case "SELECTED":
                return {
                    color: "#166534",
                    background: "#dcfce7",
                    border: "#22c55e",
                };

            case "REJECTED":
                return {
                    color: "#991b1b",
                    background: "#fee2e2",
                    border: "#ef4444",
                };

            case "SHORTLISTED":
                return {
                    color: "#1d4ed8",
                    background: "#dbeafe",
                    border: "#3b82f6",
                };

            case "APPLIED":
                return {
                    color: "#92400e",
                    background: "#fef3c7",
                    border: "#f59e0b",
                };

            default:
                return {
                    color: "#3730a3",
                    background: "#eef2ff",
                    border: "#6366f1",
                };
        }
    };

    if (loading) {
        return (
            <p style={{ color: "#687181" }}>
                Loading application timeline...
            </p>
        );
    }

    if (error) {
        return (
            <p style={{ color: "#dc2626" }}>
                {error}
            </p>
        );
    }

    if (history.length === 0) {
        return (
            <p style={{ color: "#687181" }}>
                No status history available.
            </p>
        );
    }

    return (
        <div
            style={{
                padding: "10px 5px",
            }}
        >
            <h3
                style={{
                    marginTop: 0,
                    marginBottom: "25px",
                    color: "#172033",
                    fontSize: "22px",
                }}
            >
                Status Timeline
            </h3>

            <div>
                {history.map((item, index) => {
                    const statusStyle = getStatusStyle(item.status);

                    return (
                        <div
                            key={item.id}
                            style={{
                                display: "flex",
                                position: "relative",
                                gap: "16px",
                                minHeight:
                                    index !== history.length - 1
                                        ? "125px"
                                        : "auto",
                            }}
                        >
                            {/* Timeline Indicator */}

                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    width: "25px",
                                    flexShrink: 0,
                                }}
                            >
                                <div
                                    style={{
                                        width: "20px",
                                        height: "20px",
                                        borderRadius: "50%",
                                        background:
                                        statusStyle.border,
                                        border:
                                            "4px solid white",
                                        boxShadow:
                                            "0 0 0 2px " +
                                            statusStyle.border,
                                        zIndex: 1,
                                    }}
                                ></div>

                                {index !== history.length - 1 && (
                                    <div
                                        style={{
                                            width: "3px",
                                            flex: 1,
                                            background:
                                                "#cbd5e1",
                                            marginTop: "4px",
                                            marginBottom: "-4px",
                                        }}
                                    ></div>
                                )}
                            </div>

                            {/* Timeline Content */}

                            <div
                                style={{
                                    flex: 1,
                                    paddingBottom:
                                        index !== history.length - 1
                                            ? "25px"
                                            : "0",
                                }}
                            >
                                <div
                                    style={{
                                        display: "inline-block",
                                        padding: "6px 14px",
                                        borderRadius: "20px",
                                        background:
                                        statusStyle.background,
                                        color: statusStyle.color,
                                        border:
                                            "1px solid " +
                                            statusStyle.border,
                                        fontSize: "13px",
                                        fontWeight: "700",
                                        letterSpacing: "0.3px",
                                    }}
                                >
                                    {item.status}
                                </div>

                                <p
                                    style={{
                                        margin: "10px 0 5px",
                                        color: "#374151",
                                        fontSize: "14px",
                                    }}
                                >
                                    Changed by:{" "}
                                    <strong>
                                        {item.changedBy}
                                    </strong>
                                </p>

                                <p
                                    style={{
                                        margin: 0,
                                        color: "#687181",
                                        fontSize: "13px",
                                    }}
                                >
                                    {new Date(
                                        item.changedAt
                                    ).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default ApplicationTimeline;