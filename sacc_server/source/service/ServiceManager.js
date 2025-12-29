module.exports = {
    AadharVerification : require('./AadharCard/Aadhar'),
    Admin: require('./Admin/adminController'),
    Users: require('./UserDetails/UserController'),
    Employee: require('./Employee/employeeController'),
    SchoolScholar: require('./ScholarShips/SchoolScholar/SchoolController'),
    IndividualAadhar : require('./AadharCard/IndividualScholar'),
    IndividualScholar : require('./ScholarShips/IndividualScholar/IndividulaController'),
    CareerLogin: require('./Careers/CareerLogin/carrerController'),
    CareerJobs: require('./Careers/careerJob/careerJobController'),

    // payment links
    paymentController: require('./Razorpay/paymentsController'),
    uploadController: require('./Razorpay/uploadController'),
    

    // TwGold links
    TWgoldLogin: require('./Twgold/Twgoldlogin'),
    TWgoldBranches: require('./Twgold/TWGoldBranchController'),
    TWgoldActivities: require('./Twgold/TWGoldActivities'),
    TWgoldGoldRates: require('./Twgold/goldRateController'),
    TWgoldLoans : require('./Twgold/goldloanController'),
    TWgoldCustomers: require('./Twgold/TwgoldCustomerController')

}