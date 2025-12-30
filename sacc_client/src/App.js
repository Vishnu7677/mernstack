// App.js
import './index.css';
import { Route, Routes } from 'react-router-dom';
import Login from './components/Login/login';
import LoanApplication from './components/Employee/LoanApplication/LoanApplication';
import EmployeeBankLoanTable from './components/Employee/Loans/AllLoans/EmployeeBankLoanTable';
import PendingLoanTable from './components/Employee/Loans/PendingLoans/PendingLoanTable';
import RejectedLoans from './components/Employee/Loans/RejecetedLoans/RejectedLoans';
import PaidLoans from './components/Employee/Loans/PaidLoans/PaidLoans';
import RunningLoans from './components/Employee/Loans/RunningLoans/RunningLoan';
import AllDPSLoan from './components/Employee/DPS/AllDPS/AllDps';
import MaturedDPSLoan from './components/Employee/DPS/MaturedDPS/MaturedDPS';
import RunningDPSLoan from './components/Employee/DPS/RunningDPS/RunningDPS';
import AllFDRLoan from './components/Employee/FDR/AllFDR/AllFdr';
import RunningFDRLoan from './components/Employee/FDR/RunningFDR/RunningFDR';
import ClosedFDRLoan from './components/Employee/FDR/ClosedFDR/ClosedFDR';
import EmployeeHome from './components/Employee/EmployeeHome/EmployeeHome';
import AdminDashboard from './components/Admin/AdminHome/AdminDashboard';
import AdminUserList from './components/Admin/AdminUserList/AdminUserlist';
import MembershipOpeningForm from './components/User/MembershipOpeningForm';
import MembershipRequest from './components/Admin/AdminRequests/MembershipRequests';
import AdminLogin from './components/Admin/AdminLogin/AdminLogin';
import AuthGuard from './components/Admin/AuthGuard';
import CreateEmployee from './components/Admin/CreateEmployee/CreateEmployee';
import AccountOpeningForm from './components/User/AccountOpeningForm';
import HomePage from './components/Home/Homepage/HomePage';
import IndividualScholarshipForm from './components/Home/ScholarShips/ForIndividual/IndividualScholarship';
import SignupPage from './components/Home/ScholarShips/Signup/SignupPage';
import LoginPage from './components/Home/ScholarShips/LoginPage/Loginpage'
import UniversalPage from './components/UniversalPage';
import CareersApplicationForm from './components/Home/Careers/CareersApplicationForm';
import Careers from './components/Home/Careers/Careers';
import JobDetail from './components/Home/Careers/JobDetail';
import CareerSignup from './components/Home/Careers/CareerSignup';
import CareerLogin from './components/Home/Careers/CareerLogin';
import SacTechApp from './components/Home/Tournaments/SacTechApp';
import TournamentRegistration from './components/Home/Tournaments/TournamentRegistration';
import TournamentSuccess from './components/Home/Tournaments/TournamentSuccess';
import { TwgoldAuthProvider } from './components/TWGold/TWGLogin/TwgoldAuthContext';
import TwgoldLogin from './components/TWGold/TWGLogin/TwgoldLogin';
import { TwgoldProtectedRoute } from './components/TWGold/TWGLogin/TwgoldProtectedRoute';
import TwgoldAdminDashboard from './components/TWGold/Admin/TwgoldAdminDashboard';
// import TwgoldManagerDashboard from './components/TWGold/Manager/TwgoldManagerDashboard';
import TwgoldEmployeeDashboard from './components/TWGold/Employee/EmployeeDashboard';
import TwgoldGrivirenceDashboard from './components/TWGold/Grivirence/TwgoldGrivirenceDashboard';
import GoldRates from './components/TWGold/Admin/GoldRates';
import CreatingEmployee from './components/TWGold/Admin/CreatingEmployee';
import TWgoldBranchCreate from './components/TWGold/Admin/TWgoldBranchCreate';
import TwgoldHome from './components/TWGold/Home/TwgoldHome';
import Twgoldemployeeloan from './components/TWGold/Employee/Twgoldemployeeloan';
import ManageBranches from './components/TWGold/Admin/ManageBranches';
import EditBranch from './components/TWGold/Admin/EditBranch';
import TWgoldAccountOpeningForm from './components/TWGold/Employee/TWgoldAccountOpeningForm';
import ManagerLayout from './components/TWGold/Manager/layout/ManagerLayout';
import DashboardContainer from './components/TWGold/Manager/containers/DashboardContainer';
import NewLoanContainer from './components/TWGold/Manager/containers/NewLoanContainer';
import LoanListContainer from './components/TWGold/Manager/containers/LoanListContainer';
import InventoryContainer from './components/TWGold/Manager/containers/InventoryContainer';
import CustomersContainer from './components/TWGold/Manager/containers/CustomersContainer';
import RepaymentsContainer from './components/TWGold/Manager/containers/RepaymentsContainer';
import ReportsContainer from './components/TWGold/Manager/containers/ReportsContainer';
import UsersContainer from './components/TWGold/Manager/containers/UsersContainer';




function App() {
  return (
    <TwgoldAuthProvider>
      <div>
        <Routes>
          {/* Home page and public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/sacinfotech" element={<SacTechApp />} />
          <Route path="/tournamentsregistration" element={<TournamentRegistration />} />
          <Route path="/tournament/success" element={<TournamentSuccess />} />

          <Route path="/careers/home" element={<Careers />} />
          <Route path="/careers/:id" element={<JobDetail />} />
          <Route path="/careers/apply" element={<CareersApplicationForm />} />
          <Route path="/career/careerlogin" element={<CareerLogin />} />
          <Route path="/career/careersignup" element={<CareerSignup />} />

          <Route path="/scholar/apply" element={<SignupPage/>} />
          <Route path="/scholar/apply/self/login" element={<LoginPage />} />
          
          {/* Scholar Protected Route */}
          <Route path="/scholar/apply/individualscholarship" element={
            <AuthGuard userType="scholar">
              <IndividualScholarshipForm />
            </AuthGuard>
          } />

          {/* Admin Routes */}
          <Route path='/admin/login' element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={
            <AuthGuard userType="admin">
              <AdminDashboard />
            </AuthGuard>
          } />
          <Route path='/admin/userlist' element={
            <AuthGuard userType="admin">
              <AdminUserList />
            </AuthGuard>
          } />
          <Route path='/admin/membershiprequest' element={
            <AuthGuard userType="admin">
              <MembershipRequest />
            </AuthGuard>
          } />
          <Route path='/admin/createemployee' element={
            <AuthGuard userType="admin">
              <CreateEmployee />
            </AuthGuard>
          } />

          {/* Employee Routes */}
          <Route path='/employee/login' element={<Login />} />
          <Route path='/employee/dashboard' element={
            <AuthGuard userType="employee">
              <EmployeeHome />  
            </AuthGuard>
          } />
          <Route path='/employee/membershipopening' element={
            <AuthGuard userType="employee">
              <MembershipOpeningForm />
            </AuthGuard>
          } />
          <Route path='/employee/accountopening' element={
            <AuthGuard userType="employee">
              <AccountOpeningForm />
            </AuthGuard>
          } />

          {/* Employee Loan Routes */}
          <Route path='/employee/loanapplication' element={
            <AuthGuard userType="employee">
              <LoanApplication />
            </AuthGuard>
          } />
          <Route path='/employee/allapprovedloan' element={
            <AuthGuard userType="employee">
              <EmployeeBankLoanTable />
            </AuthGuard>
          } />
          <Route path='/employee/pendingloan' element={
            <AuthGuard userType="employee">
              <PendingLoanTable />
            </AuthGuard>
          } />
          <Route path='/employee/rejectedloan' element={
            <AuthGuard userType="employee">
              <RejectedLoans />
            </AuthGuard>
          } />
          <Route path='/employee/paidloan' element={
            <AuthGuard userType="employee">
              <PaidLoans />
            </AuthGuard>
          } />
          <Route path='/employee/runningloan' element={
            <AuthGuard userType="employee">
              <RunningLoans />
            </AuthGuard>
          } />
          <Route path='/employee/allDPS' element={
            <AuthGuard userType="employee">
              <AllDPSLoan />
            </AuthGuard>
          } />
          <Route path='/employee/MaturedDPS' element={
            <AuthGuard userType="employee">
              <MaturedDPSLoan />
            </AuthGuard>
          } />
          <Route path='/employee/RunningDPS' element={
            <AuthGuard userType="employee">
              <RunningDPSLoan />
            </AuthGuard>
          } />
          <Route path='/employee/allFDR' element={
            <AuthGuard userType="employee">
              <AllFDRLoan />
            </AuthGuard>
          } />
          <Route path='/employee/RunningFDR' element={
            <AuthGuard userType="employee">
              <RunningFDRLoan />
            </AuthGuard>
          } />
          <Route path='/employee/ClosedFDR' element={
            <AuthGuard userType="employee">
              <ClosedFDRLoan />
            </AuthGuard>
          } />

          {/* TWGold Public Routes - No protection needed */}
          <Route path="/twgl&articles/home" element={<TwgoldHome />} />
          <Route path="/twgl&articles/login" element={<TwgoldLogin />} />
          
          {/* TWGold Protected Routes - Only for authenticated users */}
          <Route path="/twgl&articles/admin/dashboard" element={
            <TwgoldProtectedRoute allowedRoles={['admin']}>
              <TwgoldAdminDashboard />
            </TwgoldProtectedRoute>
          } />
            <Route path="/twgl&articles/admin/branches" element={
            <TwgoldProtectedRoute allowedRoles={['admin']}>
              <ManageBranches />
            </TwgoldProtectedRoute>
          } />
          <Route path="/twgl&articles/admin/branches/edit/:branchId" element={
            <TwgoldProtectedRoute allowedRoles={['admin']}>
              <EditBranch />
            </TwgoldProtectedRoute>
          } />
          <Route path="/twgl&articles/admin/branches/create" element={
            <TwgoldProtectedRoute allowedRoles={['admin']}>
              <TWgoldBranchCreate />
            </TwgoldProtectedRoute>
          } />
          
          <Route path="/twgl&articles/admin/employees" element={
            <TwgoldProtectedRoute allowedRoles={['admin']}>
              <CreatingEmployee />
            </TwgoldProtectedRoute>
          } />
          
          <Route path="/twgl&articles/admin/gold-rates" element={
            <TwgoldProtectedRoute allowedRoles={['admin']}>
              <GoldRates />
            </TwgoldProtectedRoute>
          } />
          
          <Route path="/twgl&articles/admin/loans" element={
            <TwgoldProtectedRoute allowedRoles={['admin']}>
              <TwgoldAdminDashboard />
            </TwgoldProtectedRoute>
          } />
          
          <Route path="/twgl&articles/admin/settings" element={
            <TwgoldProtectedRoute allowedRoles={['admin']}>
              <TwgoldAdminDashboard />
            </TwgoldProtectedRoute>
          } />
          
          <Route path="/twgl&articles/admin/audit" element={
            <TwgoldProtectedRoute allowedRoles={['admin']}>
              <TwgoldAdminDashboard />
            </TwgoldProtectedRoute>
          } />
          
          <Route path="/twgl&articles/admin/compliance" element={
            <TwgoldProtectedRoute allowedRoles={['admin']}>
              <TwgoldAdminDashboard />
            </TwgoldProtectedRoute>
          } />
          
          <Route
  path="/twgl&articles/manager"
  element={
    <TwgoldProtectedRoute allowedRoles={['manager', 'rm', 'zm']}>
      <ManagerLayout />
    </TwgoldProtectedRoute>
  }
>
  {/* Default */}
  <Route index element={<DashboardContainer />} />

  {/* Pages */}
  <Route path="dashboard" element={<DashboardContainer />} />
  <Route path="new-loan" element={<NewLoanContainer />} />
  <Route path="loans" element={<LoanListContainer />} />
  <Route path="inventory" element={<InventoryContainer />} />
  <Route path="repayments" element={<RepaymentsContainer />} />
  <Route path="customers" element={<CustomersContainer />} />
  <Route path="reports" element={<ReportsContainer />} />
  <Route path="users" element={<UsersContainer />} />
</Route>
          
<Route
  path="/twgl&articles/employee/dashboard"
  element={
    <TwgoldProtectedRoute
      allowedRoles={['employee', 'cashier', 'accountant', 'sales_marketing']}
    >
      <TwgoldEmployeeDashboard />
    </TwgoldProtectedRoute>
  }
/>

          <Route path="/twgl&articles/employee/customer/create" element={
            <TwgoldProtectedRoute allowedRoles={['employee', 'cashier', 'accountant', 'sales_marketing']}>
              <TWgoldAccountOpeningForm />
            </TwgoldProtectedRoute>
          } />
          <Route path="/twgl&articles/employee/goldloan" element={
            <TwgoldProtectedRoute allowedRoles={['employee', 'cashier', 'accountant', 'sales_marketing']}>
              <Twgoldemployeeloan />
            </TwgoldProtectedRoute>
          } />
          
          <Route path="/twgl&articles/grivirence/dashboard" element={
            <TwgoldProtectedRoute allowedRoles={['grivirence']}>
              <TwgoldGrivirenceDashboard />
            </TwgoldProtectedRoute>
          } />

          {/* Catch-all Route */}
          <Route path="*" element={<UniversalPage />} />
        </Routes>
      </div>
    </TwgoldAuthProvider>
  );
}

export default App;
