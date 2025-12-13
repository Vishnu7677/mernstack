import React, { useMemo } from 'react'; 
import { Navigate, useLocation } from 'react-router-dom';
import { useTwgoldAuth } from './TwgoldAuthContext';
import { PUBLIC_PATHS, DASHBOARD_PATHS } from '../../../config/routes';


export const TwgoldProtectedRoute = ({ children, allowedRoles = [] }) => {

  const { user, loading, isInitialized } = useTwgoldAuth(); 
  const location = useLocation();

  // -------------------------------
  // Memoized public path checker
  // -------------------------------
  const isPublicPath = useMemo(() => {
    return PUBLIC_PATHS.includes(location.pathname);
  }, [location.pathname]);



  // -------------------------------
  // LOADING STATE
  // -------------------------------
  if (loading || !isInitialized) {
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
  // AUTH CONTEXT CHECK (Private Route)
  // -------------------------------
  // If we are here, it's a private path. Check for user.
  if (!user) {
    return <Navigate to={'/twgl&articles/login'} state={{ from: location }} replace />;
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