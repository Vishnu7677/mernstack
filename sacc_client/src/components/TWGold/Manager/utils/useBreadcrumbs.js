import { useLocation } from 'react-router-dom';

const breadcrumbMap = {
  manager: 'Manager',
  dashboard: 'Dashboard',
  'new-loan': 'New Loan',
  loans: 'Loan List',
  inventory: 'Inventory',
  repayments: 'Repayments',
  customers: 'Customers',
  reports: 'Reports',
  users: 'Users'
};

const useBreadcrumbs = () => {
  const { pathname } = useLocation();

  return pathname
    .split('/')
    .filter(Boolean)
    .map(segment => breadcrumbMap[segment] || segment);
};

export default useBreadcrumbs;
