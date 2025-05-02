import './App.css';
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
import SchoolLoginPage from './components/Home/ScholarShips/LoginPage/SchoolLoginPage';
import IndividualLogin from './components/Home/ScholarShips/LoginPage/IndividualLoginPage';



function App() {
  return (
    <div>
      <Routes>
        <Route>

          {/* Home page  */}
          <Route path="/" element={<HomePage />} />
          <Route path="/scholar/apply" element={<SignupPage/>} />
          <Route path= "/scholar/apply/self/login" element={<IndividualLogin />} />
          <Route path= "/scholar/apply/school/login" element={<SchoolLoginPage />} />
          <Route path="/individual/individualscholarship" element={<IndividualScholarshipForm />} />
          {/* Admin Routes */}
          <Route
            path='/admin/login'
            element={
              <AuthGuard userType="admin">
                <AdminLogin />
              </AuthGuard>
            } />
          <Route
            path="/admin/dashboard"
            element={
              <AuthGuard userType="admin">
                <AdminDashboard />
              </AuthGuard>
            }
          />
          <Route
            path='/admin/userlist'
            element={
              <AuthGuard userType="admin">
                <AdminUserList />
              </AuthGuard>
            }
          />
          <Route
            path='/admin/membershiprequest'
            element={
              <AuthGuard userType="admin">
                <MembershipRequest />
              </AuthGuard>
            }
          />
          <Route
            path='/admin/createemployee'
            element={
              <AuthGuard userType="admin">
                <CreateEmployee />
              </AuthGuard>
            }
          />


          {/* Employee Routes */}
          <Route path='/employee/login' element={
            <AuthGuard userType="employee">
          <Login />
          </AuthGuard>
          } />
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


          <Route path='/employee/loanapplication' element={<LoanApplication />} />
          <Route path='/employee/allapprovedloan' element={<EmployeeBankLoanTable />} />
          <Route path='/employee/pendingloan' element={<PendingLoanTable />} />
          <Route path='/employee/rejectedloan' element={<RejectedLoans />} />
          <Route path='/employee/paidloan' element={<PaidLoans />} />
          <Route path='/employee/runningloan' element={<RunningLoans />} />
          <Route path='/employee/allDPS' element={<AllDPSLoan />} />
          <Route path='/employee/MaturedDPS' element={<MaturedDPSLoan />} />
          <Route path='/employee/RunningDPS' element={<RunningDPSLoan />} />
          <Route path='/employee/allFDR' element={<AllFDRLoan />} />
          <Route path='/employee/RunningFDR' element={<RunningFDRLoan />} />
          <Route path='/employee/ClosedFDR' element={<ClosedFDRLoan />} />

        </Route>
      </Routes>
    </div>
  );
}

export default App;
