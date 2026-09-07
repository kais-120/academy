import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SchoolLoadingPage from "../components/common/SchoolLoadingPage";

export default function DirectorRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <SchoolLoadingPage />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== "مدير") {
        return <Navigate to="/students" replace />;
    }

    return children;
}