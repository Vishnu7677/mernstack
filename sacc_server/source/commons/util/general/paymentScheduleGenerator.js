function round(num) {
    return Math.round(num);
  }
  
  function addMonths(date, months) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
  }
  
  module.exports.generatePaymentSchedule = function (loan) {
    const {
      sanctionedAmount,
      interestRate,
      tenure,
      repaymentType,
      startDate
    } = loan;
  
    const schedule = [];
    const monthlyRate = interestRate / 12 / 100;
    const loanStart = startDate || new Date();
  
    // ================= EMI =================
    if (repaymentType === 'emi') {
      const emi =
        sanctionedAmount *
        monthlyRate *
        Math.pow(1 + monthlyRate, tenure) /
        (Math.pow(1 + monthlyRate, tenure) - 1);
  
      let outstanding = sanctionedAmount;
  
      for (let i = 1; i <= tenure; i++) {
        const interest = round(outstanding * monthlyRate);
        const principal = round(emi - interest);
        outstanding -= principal;
  
        schedule.push({
          dueDate: addMonths(loanStart, i),
          amount: round(emi),
          principal,
          interest,
          status: 'pending'
        });
      }
    }
  
    // ============ INTEREST ONLY ============
    if (repaymentType === 'interest_only') {
      const monthlyInterest = round(sanctionedAmount * monthlyRate);
  
      for (let i = 1; i <= tenure; i++) {
        schedule.push({
          dueDate: addMonths(loanStart, i),
          amount: monthlyInterest,
          principal: 0,
          interest: monthlyInterest,
          status: 'pending'
        });
      }
    }
  
    // =============== BULLET ===============
    if (repaymentType === 'bullet') {
      const totalInterest = round(sanctionedAmount * monthlyRate * tenure);
  
      // Interest-only months
      for (let i = 1; i < tenure; i++) {
        schedule.push({
          dueDate: addMonths(loanStart, i),
          amount: round(sanctionedAmount * monthlyRate),
          principal: 0,
          interest: round(sanctionedAmount * monthlyRate),
          status: 'pending'
        });
      }
  
      // Last month – principal + interest
      schedule.push({
        dueDate: addMonths(loanStart, tenure),
        amount: sanctionedAmount + totalInterest,
        principal: sanctionedAmount,
        interest: totalInterest,
        status: 'pending'
      });
    }
  
    return schedule;
  };
  