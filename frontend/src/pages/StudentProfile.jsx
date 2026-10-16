
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function StudentProfile() {
    const navigate = useNavigate();

    const [profile, setProfile] = useState({
        name: "",
        email: "",
        phone: "",
        branch: "",
        cgpa: "",
        graduationYear: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const auth = sessionStorage.getItem("auth");
        const role = sessionStorage.getItem("role");

        if (!auth || role !== "STUDENT") {
            navigate("/login");
            return;
        }

        const fetchProfile = async () => {
            try {
                const response = await fetch(
                    "http://localhost:8080/students/me",
                    {
                        headers: {
                            Authorization: `Basic ${auth}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        "Unable to load student profile."
                    );
                }

                const data = await response.json();

                setProfile({
                    name: data.name || "",
                    email: data.email || "",
                    phone: data.phone || "",
                    branch: data.branch || "",
                    cgpa: data.cgpa ?? "",
                    graduationYear: data.graduationYear || "",
                });
            } catch (error) {
                console.error(error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setProfile((previousProfile) => ({
            ...previousProfile,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");
        setSaving(true);

        const auth = sessionStorage.getItem("auth");

        try {
            const response = await fetch(
                "http://localhost:8080/students/me",
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Basic ${auth}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: profile.name,
                        email: profile.email,
                        phone: profile.phone,
                        branch: profile.branch,
                        cgpa:
                            profile.cgpa === ""
                                ? null
                                : Number(profile.cgpa),
                        graduationYear: profile.graduationYear,
                    }),
                }
            );

            const responseText = await response.text();

            if (!response.ok) {
                throw new Error(
                    responseText || "Unable to update profile."
                );
            }

            const updatedProfile = JSON.parse(responseText);

            setProfile({
                name: updatedProfile.name || "",
                email: updatedProfile.email || "",
                phone: updatedProfile.phone || "",
                branch: updatedProfile.branch || "",
                cgpa: updatedProfile.cgpa ?? "",
                graduationYear:
                    updatedProfile.graduationYear || "",
            });

            setSuccess("Profile updated successfully.");
        } catch (error) {
            console.error(error);
            setError(error.message);
        } finally {
            setSaving(false);
        }
    };

    const graduationYear = Number(profile.graduationYear);
    const currentYear = new Date().getFullYear();

    const canUpdateCgpa =
        profile.graduationYear === "" ||
        currentYear <= graduationYear;

    if (loading) {
        return (
            <div style={styles.centerMessage}>
                Loading profile...
            </div>
        );
    }

    return (
        <div style={styles.page}>
            <nav style={styles.navbar}>
                <div style={styles.logo}>
                    Placement<span style={styles.logoSpan}>Hub</span>
                </div>

                <button
                    onClick={() => navigate("/student-dashboard")}
                    style={styles.backButton}
                >
                    Back to Dashboard
                </button>
            </nav>

            <main style={styles.main}>
                <div style={styles.header}>
                    <h1 style={styles.heading}>My Profile</h1>

                    <p style={styles.subtitle}>
                        View and update your personal information.
                    </p>
                </div>

                {error && (
                    <div style={styles.errorMessage}>
                        {error}
                    </div>
                )}

                {success && (
                    <div style={styles.successMessage}>
                        {success}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    style={styles.form}
                >
                    <div style={styles.formGroup}>
                        <label style={styles.label}>
                            Full Name
                        </label>

                        <input
                            type="text"
                            name="name"
                            value={profile.name}
                            onChange={handleChange}
                            required
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>
                            Email
                        </label>

                        <input
                            type="email"
                            name="email"
                            value={profile.email}
                            onChange={handleChange}
                            required
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>
                            Phone
                        </label>

                        <input
                            type="text"
                            name="phone"
                            value={profile.phone}
                            onChange={handleChange}
                            pattern="[0-9]{10}"
                            maxLength="10"
                            required
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>
                            Branch
                        </label>

                        <input
                            type="text"
                            name="branch"
                            value={profile.branch}
                            readOnly
                            style={styles.readOnlyInput}
                        />

                        <small style={styles.helpText}>
                            Branch can only be changed by the admin.
                        </small>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>
                            CGPA
                        </label>

                        <input
                            type="number"
                            name="cgpa"
                            value={profile.cgpa}
                            onChange={handleChange}
                            min="0"
                            max="10"
                            step="0.01"
                            disabled={!canUpdateCgpa}
                            style={
                                canUpdateCgpa
                                    ? styles.input
                                    : styles.readOnlyInput
                            }
                        />

                        <small style={styles.helpText}>
                            {canUpdateCgpa
                                ? "You can update your CGPA until your graduation year is completed."
                                : "CGPA updates are locked after graduation year."}
                        </small>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>
                            Graduation Year
                        </label>

                        <input
                            type="text"
                            name="graduationYear"
                            value={profile.graduationYear}
                            readOnly
                            style={styles.readOnlyInput}
                        />

                        <small style={styles.helpText}>
                            Graduation year can only be changed by the admin.
                        </small>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        style={styles.saveButton}
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </form>
            </main>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        background: "#f5f7fb",
        fontFamily: "Arial, sans-serif",
    },

    navbar: {
        height: "70px",
        background: "#172033",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 40px",
    },

    logo: {
        fontSize: "24px",
        fontWeight: "800",
    },

    logoSpan: {
        color: "#6366f1",
    },

    backButton: {
        background: "#6366f1",
        color: "white",
        border: "none",
        padding: "10px 16px",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "600",
    },

    main: {
        maxWidth: "700px",
        margin: "0 auto",
        padding: "40px 20px",
    },

    header: {
        textAlign: "center",
        marginBottom: "30px",
    },

    heading: {
        margin: "0 0 10px",
        color: "#172033",
        fontSize: "36px",
    },

    subtitle: {
        color: "#687181",
        fontSize: "16px",
    },

    form: {
        background: "white",
        padding: "35px",
        borderRadius: "12px",
        boxShadow: "0 5px 20px rgba(0,0,0,0.06)",
    },

    formGroup: {
        marginBottom: "22px",
    },

    label: {
        display: "block",
        marginBottom: "8px",
        color: "#172033",
        fontWeight: "600",
    },

    input: {
        width: "100%",
        boxSizing: "border-box",
        padding: "12px",
        border: "1px solid #d1d5db",
        borderRadius: "7px",
        fontSize: "15px",
        outline: "none",
    },

    readOnlyInput: {
        width: "100%",
        boxSizing: "border-box",
        padding: "12px",
        border: "1px solid #d1d5db",
        borderRadius: "7px",
        fontSize: "15px",
        background: "#f3f4f6",
        color: "#6b7280",
    },

    helpText: {
        display: "block",
        marginTop: "6px",
        color: "#687181",
        fontSize: "12px",
    },

    saveButton: {
        width: "100%",
        padding: "13px",
        border: "none",
        borderRadius: "7px",
        background: "#4f46e5",
        color: "white",
        cursor: "pointer",
        fontSize: "16px",
        fontWeight: "600",
    },

    errorMessage: {
        background: "#fee2e2",
        color: "#991b1b",
        padding: "14px",
        borderRadius: "8px",
        marginBottom: "20px",
    },

    successMessage: {
        background: "#dcfce7",
        color: "#166534",
        padding: "14px",
        borderRadius: "8px",
        marginBottom: "20px",
    },

    centerMessage: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial, sans-serif",
        color: "#172033",
    },
};

export default StudentProfile;