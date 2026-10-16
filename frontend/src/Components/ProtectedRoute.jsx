import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRole }) {
    const auth = sessionStorage.getItem("auth");
    const role = sessionStorage.getItem("role");

    // User is not logged in
    if (!auth) {
        return <Navigate to="/login" replace />;
    }

    // User is logged in but doesn't have the required role
    if (allowedRole && role !== allowedRole) {
        if (role === "ADMIN") {
            return <Navigate to="/admin-dashboard" replace />;
        }

        if (role === "STUDENT") {
            return <Navigate to="/student-dashboard" replace />;
        }

        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;