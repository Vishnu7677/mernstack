// src/config/routes.js
// Centralized route / auth configuration used by AuthGuard and TwgoldProtectedRoute

// ================= DASHBOARD GROUPS =================
export const ROLE_DASHBOARD_GROUPS = {
  manager: ['manager', 'rm', 'zm'],
  employee: ['employee', 'cashier', 'accountant', 'sales_marketing'],
  grivirence: ['grivirence', 'go_auditor']
};

// ================= DASHBOARD PATHS =================
export const DASHBOARD_PATHS = {
  admin: '/twgl&articles/admin/dashboard',
  manager: '/twgl&articles/manager/dashboard',
  employee: '/twgl&articles/employee/dashboard',
  grivirence: '/twgl&articles/grivirence/dashboard',

  auditor: '/twgl&articles/auditor/dashboard',
  hr: '/twgl&articles/hr/dashboard',
  administration: '/twgl&articles/administration/dashboard',

  default: '/twgl&articles/home'
};

// ================= RESOLVER (AFTER CONSTANTS) =================
export const resolveDashboardPath = (role) => {
  if (!role) return DASHBOARD_PATHS.default;

  // Manager group
  if (ROLE_DASHBOARD_GROUPS.manager.includes(role)) {
    return DASHBOARD_PATHS.manager;
  }

  // Employee group
  if (ROLE_DASHBOARD_GROUPS.employee.includes(role)) {
    return DASHBOARD_PATHS.employee;
  }

  // Grievance group
  if (ROLE_DASHBOARD_GROUPS.grivirence.includes(role)) {
    return DASHBOARD_PATHS.grivirence;
  }

  // Fallback: role-specific dashboard
  return DASHBOARD_PATHS[role] || DASHBOARD_PATHS.default;
};

// ================= AUTH CONFIG (UNCHANGED) =================
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

// ================= PUBLIC PATHS =================
export const PUBLIC_PATHS = [
  '/',
  '/sacinfotech',
  '/tournamentsregistration',
  '/tournament/success',
  '/careers/home',
  '/scholar/apply',

  // TWGold public pages
  '/twgl&articles/home',
  '/twgl&articles/login'
];
