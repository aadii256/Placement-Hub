
import { useCallback, useEffect, useRef, useState } from "react";
import "./ResumeManager.css";

function ResumeManager() {
    const [resume, setResume] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const fileInputRef = useRef(null);

    const auth = sessionStorage.getItem("auth");

    const fetchResume = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                "http://localhost:8080/resumes/me",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Basic ${auth}`,
                    },
                }
            );

            if (response.status === 404) {
                setResume(null);
                return;
            }

            if (!response.ok) {
                throw new Error("Unable to fetch resume details.");
            }

            const data = await response.json();
            setResume(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [auth]);

    useEffect(() => {
        void fetchResume();
    }, [fetchResume]);

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];

        setMessage("");
        setError("");

        if (!file) {
            setSelectedFile(null);
            return;
        }

        if (file.type !== "application/pdf") {
            setSelectedFile(null);
            setError("Only PDF files are allowed.");
            event.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setSelectedFile(null);
            setError("File size must not exceed 5 MB.");
            event.target.value = "";
            return;
        }

        setSelectedFile(file);
    };

    const handleUpload = async (event) => {
        event.preventDefault();

        if (!selectedFile) {
            setError("Please select a PDF resume first.");
            return;
        }

        try {
            setUploading(true);
            setMessage("");
            setError("");

            const formData = new FormData();
            formData.append("file", selectedFile);

            const response = await fetch(
                "http://localhost:8080/resumes/upload",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Basic ${auth}`,
                    },
                    body: formData,
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
                    "Unable to upload resume."
                );
            }

            setMessage(
                resume
                    ? "Resume replaced successfully!"
                    : "Resume uploaded successfully!"
            );

            setSelectedFile(null);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            await fetchResume();
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to delete your resume?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeleting(true);
            setMessage("");
            setError("");

            const response = await fetch(
                "http://localhost:8080/resumes/me",
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Basic ${auth}`,
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
                    "Unable to delete resume."
                );
            }

            setResume(null);
            setMessage("Resume deleted successfully.");
        } catch (err) {
            setError(err.message);
        } finally {
            setDeleting(false);
        }
    };

    const openResume = () => {
        window.open(
            "http://localhost:8080/resumes/view",
            "_blank",
            "noopener,noreferrer"
        );
    };

    const downloadResume = async () => {
        try {
            setError("");

            const response = await fetch(
                "http://localhost:8080/resumes/download",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Basic ${auth}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Unable to download resume.");
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = resume?.fileName || "resume.pdf";

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(downloadUrl);
        } catch (err) {
            setError(err.message);
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) {
            return "0 KB";
        }

        return `${(bytes / 1024).toFixed(2)} KB`;
    };

    if (loading) {
        return (
            <section className="resume-manager-card">
                <div className="resume-loading">
                    Loading resume details...
                </div>
            </section>
        );
    }

    return (
        <section className="resume-manager-card">
            <div className="resume-manager-header">
                <div>
                    <span className="resume-section-label">
                        DOCUMENT MANAGEMENT
                    </span>

                    <h2>My Resume</h2>

                    <p>
                        Upload a professional PDF resume for your placement
                        applications.
                    </p>
                </div>

                <div className="resume-header-icon">📄</div>
            </div>

            {message && (
                <div className="resume-success-message">
                    {message}
                </div>
            )}

            {error && (
                <div className="resume-error-message">
                    {error}
                </div>
            )}

            {resume && (
                <div className="resume-existing-card">
                    <div className="resume-file-icon">PDF</div>

                    <div className="resume-file-details">
                        <h3>{resume.fileName}</h3>

                        <p>
                            {formatFileSize(resume.fileSize)}
                        </p>

                        <span className="resume-upload-status">
                            Resume uploaded
                        </span>
                    </div>
                </div>
            )}

            <form
                className="resume-upload-form"
                onSubmit={handleUpload}
            >
                <label htmlFor="resume-file">
                    {resume
                        ? "Choose a new PDF to replace your resume"
                        : "Choose your resume PDF"}
                </label>

                <input
                    ref={fileInputRef}
                    id="resume-file"
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={handleFileChange}
                />

                {selectedFile && (
                    <p className="selected-file-name">
                        Selected: {selectedFile.name}
                    </p>
                )}

                <button
                    type="submit"
                    className="resume-upload-button"
                    disabled={uploading || !selectedFile}
                >
                    {uploading
                        ? "Uploading..."
                        : resume
                            ? "Replace Resume"
                            : "Upload Resume"}
                </button>
            </form>

            {resume && (
                <div className="resume-actions">
                    <button
                        type="button"
                        className="resume-view-button"
                        onClick={openResume}
                    >
                        View Resume
                    </button>

                    <button
                        type="button"
                        className="resume-download-button"
                        onClick={downloadResume}
                    >
                        Download
                    </button>

                    <button
                        type="button"
                        className="resume-delete-button"
                        onClick={handleDelete}
                        disabled={deleting}
                    >
                        {deleting ? "Deleting..." : "Delete"}
                    </button>
                </div>
            )}

            <p className="resume-help-text">
                Accepted format: PDF only · Maximum size: 5 MB
            </p>
        </section>
    );
}

export default ResumeManager;