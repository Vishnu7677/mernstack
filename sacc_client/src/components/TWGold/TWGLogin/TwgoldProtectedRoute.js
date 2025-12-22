import React, { useMemo } from 'react'; 
import { Navigate, useLocation } from 'react-router-dom';
import { useTwgoldAuth } from './TwgoldAuthContext';
import { PUBLIC_PATHS, DASHBOARD_PATHS } from '../../../config/routes';


export const TwgoldProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, isInitialized } = useTwgoldAuth(); 
  const location = useLocation();

  const isPublicPath = useMemo(() => {
    return PUBLIC_PATHS.includes(location.pathname);
  }, [location.pathname]);

  if (loading || !isInitialized) {
    return (
      <div className="twgold_loading">
        <div className="twgold_loading_spinner" />
      </div>
    );
  }
  
  // 2. Handle Public Paths (like Login)
  if (isPublicPath) {
    if (location.pathname === '/twgl&articles/login' && user) {
      const redirectPath = DASHBOARD_PATHS[user.role] || DASHBOARD_PATHS.default;
      return <Navigate to={redirectPath} replace />;
    }
    return children;
  }

  // 3. AUTH CHECK (Now safe to check because isInitialized is true)
  if (!user) {
    // We use 'replace' so they can't go back to the protected page via browser back button
    return <Navigate to={'/twgl&articles/login'} state={{ from: location }} replace />;
  }

  // 4. ROLE GUARD
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const redirectPath = DASHBOARD_PATHS[user.role] || DASHBOARD_PATHS.default;
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

