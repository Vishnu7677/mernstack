import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Cookies from "js-cookie";
import { useLocation } from "react-router-dom";
import AdminLogin from "../Admin/AdminLogin/AdminLogin";
import Login from "../Login/login";

const AuthGuard = ({ children, userType }) => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    const tokenKey = userType === "admin" ? "admin_token" : "employee_token";
    const loginPath = userType === "admin" ? "/admin/login" : "/employee/login";
    const dashboardPath = userType === "admin" ? "/admin/dashboard" : "/employee/dashboard";

    useEffect(() => {
        const validateTokens = () => {
            const adminToken = Cookies.get("admin_token");
            const employeeToken = Cookies.get("employee_token");

            // Remove conflicting tokens
            if (adminToken && employeeToken) {
                console.log("Conflicting tokens found. Clearing all tokens.");
                Cookies.remove("admin_token");
                Cookies.remove("employee_token");
                navigate(loginPath, { replace: true });
                return false;
            }

            // Ensure valid token for path
            if (userType === "admin" && employeeToken) {
                Cookies.remove("employee_token");
            }
            if (userType === "employee" && adminToken) {
                Cookies.remove("admin_token");
            }

            return true;
        };

        const checkToken = async () => {
            try {
                if (!validateTokens()) return;

                const token = Cookies.get(tokenKey);

                // Enforce path restrictions
                if (userType === "admin" && !location.pathname.startsWith("/admin/")) {
                    Cookies.remove(tokenKey);
                    navigate("/admin/login", { replace: true });
                    return;
                }
                if (userType === "employee" && (!location.pathname.startsWith("/employee/"))) {
                    Cookies.remove(tokenKey);
                    navigate("/employee/login", { replace: true });
                    return;
                }

                // Handle authentication and redirection
                if (token) {
                    setIsAuthenticated(true);
                    if (location.pathname === loginPath) {
                        navigate(dashboardPath, { replace: true });
                    }
                } else {
                    setIsAuthenticated(false);
                    if (location.pathname !== loginPath) {
                        navigate(loginPath, { replace: true });
                    }
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        checkToken();
    }, [navigate, location.pathname, userType, tokenKey, loginPath, dashboardPath]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated && location.pathname === loginPath) {
        return userType === "admin" ? <AdminLogin /> : <Login />;
    }

    return <div>{children}</div>;
};

export default AuthGuard;
