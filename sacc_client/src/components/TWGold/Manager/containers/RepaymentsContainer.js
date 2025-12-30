import { useState } from 'react';
import {
  getCustomerByCustomerId,
  collectLoanEmi
} from '../../TWGLogin/axiosConfig';
import Repayments from '../pages/Repayments';

const RepaymentsContainer = () => {
  const [loanNo, setLoanNo] = useState('');
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchLoan = async () => {
    setLoading(true);
    try {
      const res = await getCustomerByCustomerId(loanNo);
      setLoan(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  const submitEmi = async (amount) => {
    await collectLoanEmi({ loanNo, amount });
  };

  return (
    <Repayments
      loanNo={loanNo}
      setLoanNo={setLoanNo}
      loan={loan}
      loading={loading}
      onFetch={fetchLoan}
      onSubmit={submitEmi}
    />
  );
};

export default RepaymentsContainer;
