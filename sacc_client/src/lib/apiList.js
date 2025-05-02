export const server = "http://localhost:5000/api";

const apiList ={
    // Admin
    AdminLogin: `${server}/admin/adminlogin`,
    AdminMembershipUpdate: `${server}/admin/membershipupdate`,
    Adminuserslist: `${server}/admin/verifieduser`,
    AdminEmployeeCreation: `${server}/admin/createemployee`,
    GetAdminDetails:`${server}/admin/getadmindetails`,

    // Aadhar
    AdharOtp: `${server}/aadharOtp/aadharsendingotp`,
    AdharVerifyOtp: `${server}/aadharOtp/aadharverifyingotp`,


    // Employee
    EmployeeLogin:`${server}/employee/employeelogin`,
    getEmployee: `${server}/employee/employeeDetails`,
    getEmployeebyID: `${server}/employee/employees/:employeeId`,
    UpdateEmployee: `${server}/employee/employees/updateemployee`,
    DeleteEmployee: `${server}/employee/employees/deleteemployee/:employeeId`,
    SubmitEmployeeForm: `${server}/employee/employees/createemployee`,
    userSearch: `${server}/employee/usersearch`,
    getUserDeatilsbymembershipid:`${server}/employee/user/:membershipId`,

    // Membership
    getMembership: `${server}/membership/membership`,
    UpdateMembership: `${server}/membership/membership/updatemembership`,
    DeleteMembership: `${server}/membership/membership/deletemembership/:membershipId`,
    SubmitMembershipForm: `${server}/membership/membership/createmembership`,
    
    // Users
    getUsers: `${server}/user/getallusers`,
    getUserbyID: `${server}/user/getuserbyid/:userId`,
    SubmitForm: `${server}/user/createuser`,
    createAccount: `${server}/user/createaccount`,

    
}

export default apiList;