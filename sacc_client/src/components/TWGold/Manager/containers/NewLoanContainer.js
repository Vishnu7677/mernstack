import { useEffect, useState } from 'react';
import { getPendingLoans, decideLoan } from '../../TWGLogin/axiosConfig';
import NewLoan from '../pages/NewLoan';
import Toast from '../../../Toast';
import LoanPreviewModal from './LoanPreviewModal'


const NewLoanContainer = () => {
  const [loans, setLoans] = useState([]);
  const [processingIds, setProcessingIds] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);

  useEffect(() => {
    getPendingLoans().then(res => setLoans(res.data.data || []));
  }, []);

  const handleDecision = async (loan, decision) => {
    setProcessingIds(prev => [...prev, loan._id]);

    try {
      await decideLoan(loan._id, { decision });
      setLoans(prev => prev.filter(l => l._id !== loan._id));
      setSelectedLoan(null);
      Toast('success', `Loan ${decision}d successfully`);
    } catch (e) {
      Toast('error', 'Action failed');
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== loan._id));
    }
  };

  return (
    <>
      <NewLoan
        loans={loans}
        processingIds={processingIds}
        onView={setSelectedLoan}
      />

      {selectedLoan && (
        <LoanPreviewModal
          loan={selectedLoan}
          processing={processingIds.includes(selectedLoan._id)}
          onApprove={() => handleDecision(selectedLoan, 'approve')}
          onReject={() => handleDecision(selectedLoan, 'reject')}
          onClose={() => setSelectedLoan(null)}
        />
      )}
    </>
  );
};


export default NewLoanContainer;
