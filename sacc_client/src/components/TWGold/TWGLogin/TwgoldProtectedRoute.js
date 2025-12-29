// components/auth/TwgoldProtectedRoute.js
import React, { useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useTwgoldAuth } from './TwgoldAuthContext';
import {
  PUBLIC_PATHS,
  resolveDashboardPath
} from '../../../config/routes';

export const TwgoldProtectedRoute = ({
  children,
  allowedRoles = []
}) => {
  const { user, loading, isInitialized } = useTwgoldAuth();
  const location = useLocation();

  /* ================= PUBLIC PATH CHECK ================= */
  const isPublicPath = useMemo(
    () => PUBLIC_PATHS.includes(location.pathname),
    [location.pathname]
  );

  /* ================= LOADING STATE ================= */
  if (loading || !isInitialized) {
    return (
      <div className="twgold_loading">
        <div className="twgold_loading_spinner" />
      </div>
    );
  }

  /* ================= PUBLIC ROUTES ================= */
  if (isPublicPath) {
    // Logged-in user hitting login page → redirect to dashboard
    if (location.pathname === '/twgl&articles/login' && user) {
      const dashboard = resolveDashboardPath(user.role);

      console.info(
        '[AUTH REDIRECT]',
        'User already logged in → redirecting to dashboard',
        {
          role: user.role,
          to: dashboard
        }
      );

      return <Navigate to={dashboard} replace />;
    }

    return children;
  }

  /* ================= AUTH GUARD ================= */
  if (!user) {
    console.warn(
      '[AUTH BLOCKED]',
      'Unauthenticated access attempt',
      {
        path: location.pathname
      }
    );

    return (
      <Navigate
        to="/twgl&articles/login"
        state={{ from: location }}
        replace
      />
    );
  }

  /* ================= ROLE GUARD ================= */
  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    const fallbackDashboard = resolveDashboardPath(user.role);

    console.warn(
      '[ROLE BLOCKED]',
      'User role not allowed on this route',
      {
        role: user.role,
        allowedRoles,
        attemptedPath: location.pathname,
        redirectedTo: fallbackDashboard
      }
    );

    return <Navigate to={fallbackDashboard} replace />;
  }

  /* ================= ACCESS GRANTED ================= */
  return children;
};
