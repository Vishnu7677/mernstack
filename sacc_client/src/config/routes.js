// src/config/routes.js
// Centralized route / auth configuration used by AuthGuard and TwgoldProtectedRoute

export const AUTH_CONFIG = {
  admin: {
    tokenKey: 'admin_token',
    loginPath: '/admin/login',
    dashboardPath: '/admin/dashboard',
  },
  employee: {
    tokenKey: 'employee_token',
    loginPath: '/employee/login',
    dashboardPath: '/employee/dashboard',
  },
  scholar: {
    tokenKey: 'scholar_token',
    loginPath: '/scholar/apply/self/login',
    dashboardPath: '/scholar/apply/individualscholarship',
  }
};

// Common public routes used across your app (add more as required)
export const PUBLIC_PATHS = [
  '/',                         // main home
  '/sacinfotech',
  '/tournamentsregistration',
  '/tournament/success',
  '/careers/home',
  '/scholar/apply',
  // TWGold public pages
  '/twgl&articles/home',
  '/twgl&articles/login'
];

// Dashboard redirects for TWGold-specific pages (role => dashboard)
export const DASHBOARD_PATHS = {
  admin: '/twgl&articles/admin/dashboard',
  manager: '/twgl&articles/manager/dashboard',
  employee: '/twgl&articles/employee/dashboard',
  grivirence: '/twgl&articles/grivirence/dashboard',
  default: '/twgl&articles/home'
};
