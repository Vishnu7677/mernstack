import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Cookies from "js-cookie";
import { useLocation } from "react-router-dom";
import AdminLogin from "../Admin/AdminLogin/AdminLogin";
import Login from "../Login/login";
import IndividualLogin from "../Home/ScholarShips/LoginPage/IndividualLoginPage";

// Updated AuthGuard component
const AuthGuard = ({ children, userType }) => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    const authConfig = {
        admin: {
            tokenKey: "admin_token",
            loginPath: "/admin/login",
            dashboardPath: "/admin/dashboard",
            loginComponent: <AdminLogin />
        },
        employee: {
            tokenKey: "employee_token",
            loginPath: "/employee/login",
            dashboardPath: "/employee/dashboard",
            loginComponent: <Login />
        },
        scholar: {
            tokenKey: "scholar_token",
            loginPath: "/scholar/apply/self/login",
            dashboardPath: "/scholar/apply/individualscholarship",
            loginComponent: <IndividualLogin />
        }
    };

    // Simplified token validation
    const validateToken = () => {
        const config = authConfig[userType];
        if (!config) return false;

        const token = Cookies.get(config.tokenKey);
        
        // Basic token existence check
        if (!token) {
            console.log(`No ${userType} token found`);
            return false;
        }

        // Simple path validation
        const validPaths = {
            scholar: location.pathname.startsWith("/scholar/apply/"),
            admin: location.pathname.startsWith("/admin/"),
            employee: location.pathname.startsWith("/employee/")
        };

        if (!validPaths[userType]) {
            console.log(`Invalid path for ${userType}: ${location.pathname}`);
            Cookies.remove(config.tokenKey);
            return false;
        }

        console.log(`Token validation successful for ${userType}`);
        return true;
    };

    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                const isValid = validateToken();
                const config = authConfig[userType];
                
                if (!config) {
                    navigate("/", { replace: true });
                    return;
                }

                if (isValid) {
                    setIsAuthenticated(true);
                    // Only redirect if on login page
                    if (location.pathname === config.loginPath) {
                        console.log(`Redirecting from login to dashboard: ${config.dashboardPath}`);
                        navigate(config.dashboardPath, { replace: true });
                    }
                } else {
                    setIsAuthenticated(false);
                    // Only redirect to login if not already there
                    if (location.pathname !== config.loginPath) {
                        console.log(`Redirecting to login: ${config.loginPath}`);
                        navigate(config.loginPath, { replace: true });
                    }
                }
            } catch (error) {
                console.error("Authentication error:", error);
                // Clear only the current user's token
                const config = authConfig[userType];
                if (config) {
                    Cookies.remove(config.tokenKey);
                }
                navigate(config?.loginPath || "/", { replace: true });
            } finally {
                setLoading(false);
            }
        };

        checkAuthentication();
    }, [navigate, location.pathname, userType]);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner">Loading...</div>
            </div>
        );
    }

    // If authenticated, show children
    if (isAuthenticated) {
        return <>{children}</>;
    }

    // If on login page, show login component
    if (location.pathname === authConfig[userType]?.loginPath) {
        return authConfig[userType]?.loginComponent;
    }

    // Otherwise, show nothing (will redirect)
    return null;
};

export default AuthGuard;