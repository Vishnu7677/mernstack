import { useEffect, useRef, useState } from 'react';
import { getPendingLoans, decideLoan } from '../../TWGLogin/axiosConfig';
import NewLoan from '../pages/NewLoan';
import Toast from '../../../Toast';

const UNDO_TIMEOUT = 5000;

const NewLoanContainer = () => {
  const [loans, setLoans] = useState([]);
  const [processingIds, setProcessingIds] = useState([]);
  const undoStack = useRef([]);

  useEffect(() => {
    getPendingLoans().then(res => setLoans(res.data.data || []));
  }, []);

  /* ================= SINGLE APPROVE / REJECT ================= */
  const handleDecision = async (loan, decision) => {
    // Optimistic remove
    setLoans(prev => prev.filter(l => l._id !== loan._id));
    setProcessingIds(prev => [...prev, loan._id]);

    const undoItem = { loan, decision };
    undoStack.current.push(undoItem);

    Toast(
      'info',
      `${decision === 'approve' ? 'Approved' : 'Rejected'} ${loan.customerName}. Undo available for 5s`
    );

    setTimeout(async () => {
      try {
        await decideLoan(loan._id, { decision });
      } catch (e) {
        // rollback
        setLoans(prev => [...prev, loan]);
        Toast('error', 'Action failed, restored');
      } finally {
        setProcessingIds(prev => prev.filter(id => id !== loan._id));
        undoStack.current = undoStack.current.filter(i => i.loan._id !== loan._id);
      }
    }, UNDO_TIMEOUT);
  };

  /* ================= BULK APPROVE ================= */
  const handleBulkApprove = async (selectedLoans) => {
    selectedLoans.forEach(loan => handleDecision(loan, 'approve'));
  };

  /* ================= UNDO ================= */
  const undoLast = () => {
    const last = undoStack.current.pop();
    if (!last) return;

    setLoans(prev => [last.loan, ...prev]);
    Toast('success', 'Action undone');
  };

  return (
    <NewLoan
      loans={loans}
      processingIds={processingIds}
      onDecision={handleDecision}
      onBulkApprove={handleBulkApprove}
      onUndo={undoLast}
    />
  );
};

export default NewLoanContainer;
