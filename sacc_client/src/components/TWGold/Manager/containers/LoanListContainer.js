import { useEffect, useState } from 'react';
import { getManagementData } from '../../TWGLogin/axiosConfig';
import LoanList from '../pages/LoanList';

const LoanListContainer = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getManagementData()
      .then(res => setLoans(res.data.data?.loans || []))
      .finally(() => setLoading(false));
  }, []);

  return <LoanList loans={loans} loading={loading} />;
};

export default LoanListContainer;
