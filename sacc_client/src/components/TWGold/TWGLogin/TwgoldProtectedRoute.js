// src/components/TWGold/TWGLogin/TwgoldProtectedRoute.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useTwgoldAuth } from './TwgoldAuthContext';
import { AUTH_CONFIG, PUBLIC_PATHS, DASHBOARD_PATHS } from '../../../config/routes';

export const TwgoldProtectedRoute = ({ children, allowedRoles = [], userType }) => {
  const { user, loading, checkAuthStatus } = useTwgoldAuth();
  const location = useLocation();

  const [authChecked, setAuthChecked] = useState(false);
  const [localLoading, setLocalLoading] = useState(true);

  // -------------------------------
  // ✅ Memoized public path checker
  // -------------------------------
  const isPublicPath = useMemo(() => {
    return PUBLIC_PATHS.includes(location.pathname);
  }, [location.pathname]);

  // -------------------------------
  // ✅ Memoized token validator
  // -------------------------------
  const validateTokenForUserType = useCallback(
    (type) => {
      const cfg = AUTH_CONFIG[type];
      if (!cfg) return true;

      const token = Cookies.get(cfg.tokenKey);
      if (!token) return false;

      const pathValidations = {
        scholar: location.pathname.startsWith('/scholar/apply/'),
        admin: location.pathname.startsWith('/admin/'),
        employee: location.pathname.startsWith('/employee/')
      };

      if (pathValidations[type] === false && !isPublicPath) {
        return false;
      }

      return true;
    },
    [location.pathname, isPublicPath] // dependencies
  );

  // -------------------------------
  // ✅ Updated useEffect (warning-free)
  // -------------------------------
  useEffect(() => {
    const verify = async () => {
      try {
        // Public Page → No auth required
        if (isPublicPath) {
          setAuthChecked(true);
          setLocalLoading(false);
          return;
        }

        // Validate cookie-based token for userType
        if (userType && !validateTokenForUserType(userType)) {
          setAuthChecked(true);
          setLocalLoading(false);
          return;
        }

        // TWGold JWT auth check
        await checkAuthStatus?.();
      } catch (err) {
        console.error('TwgoldProtectedRoute auth verification failed:', err);
      } finally {
        setAuthChecked(true);
        setLocalLoading(false);
      }
    };

    if (!loading) {
      verify();
    }
  }, [
    loading,
    location.pathname,
    userType,
    validateTokenForUserType,
    isPublicPath,
    checkAuthStatus,
  ]);

  // -------------------------------
  // LOADING STATE
  // -------------------------------
  if (loading || localLoading || !authChecked) {
    return (
      <div className="twgold_loading">
        <div className="twgold_loading_spinner" />
      </div>
    );
  }

  // -------------------------------
  // PUBLIC PATH HANDLING
  // -------------------------------
  if (isPublicPath) {
    if (location.pathname === '/twgl&articles/login' && user) {
      const redirectPath = DASHBOARD_PATHS[user.role] || DASHBOARD_PATHS.default;
      return <Navigate to={redirectPath} replace />;
    }
    return children;
  }

  // -------------------------------
  // COOKIE TOKEN CHECK FOR userType
  // -------------------------------
  if (userType) {
    const cfg = AUTH_CONFIG[userType];
    if (cfg && !Cookies.get(cfg.tokenKey)) {
      return <Navigate to={cfg.loginPath} replace />;
    }
  }

  // -------------------------------
  // AUTH CONTEXT CHECK
  // -------------------------------
  if (!user) {
    const cfg = AUTH_CONFIG[userType];
    const loginRedirect = cfg?.loginPath || '/twgl&articles/login';
    return <Navigate to={loginRedirect} replace />;
  }

  // -------------------------------
  // ROLE GUARD
  // -------------------------------
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const redirectPath = DASHBOARD_PATHS[user.role] || DASHBOARD_PATHS.default;
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default TwgoldProtectedRoute;
