import { createContext, useContext, useMemo, useState } from "react";
import { Axios } from "../api/Api";

const AuthContext = createContext(null);

const STORAGE_KEY = "alamal_auth_session";
const TOKEN_KEY = "auth";

function readStoredUser() {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function persistSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
}

// Restore synchronously on load: token + user must both be present and
// consistent, otherwise treat the session as invalid.
function bootstrapUser() {
    const token = localStorage.getItem(TOKEN_KEY);
    const storedUser = readStoredUser();

    if (token && storedUser) {
        return storedUser;
    }

    clearSession();
    return null;
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(bootstrapUser);
    const [loading, setLoading] = useState(false);

    const login = async (email, password) => {
        setLoading(true);

        try {
            const response = await Axios.post("/auth/login", {
                email: email.trim().toLowerCase(),
                password,
            });

            const { token, user } = response.data;

            persistSession(token, user);
            setUser(user);

            return user;
        } catch (error) {
            const message =
                error.response?.data?.message ||
                "Email ou mot de passe incorrect.";

            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        clearSession();
    };

    const value = useMemo(
        () => ({
            user,
            loading,
            isAuthenticated: Boolean(user),
            login,
            logout,
        }),
        [user, loading]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);

    if (!ctx) {
        throw new Error(
            "useAuth doit être utilisé à l'intérieur d'un <AuthProvider>"
        );
    }

    return ctx;
}