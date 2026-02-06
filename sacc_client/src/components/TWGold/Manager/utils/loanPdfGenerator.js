import jsPDF from 'jspdf';
import TWGoldLoansLogo from '../../../../images/TWGoldLoansLogo.png';

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString('en-IN') : '-';

const money = (val) =>
  `₹ ${Number(val || 0).toLocaleString('en-IN')}`;

export const generateLoanPreviewPDF = (loan) => {
  const doc = new jsPDF();
  let y = 20;

  /* ========= LOGO ========= */
  doc.addImage(TWGoldLoansLogo, 'PNG', 14, 10, 30, 20);

  /* ========= HEADER ========= */
  doc.setFontSize(16);
  doc.text('GOLD LOAN PREVIEW', 105, y, { align: 'center' });
  y += 15;

  doc.setFontSize(10);
  doc.text(`Loan Account No: ${loan.loanAccountNumber}`, 14, y);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 160, y);
  y += 8;

  doc.line(14, y, 196, y);
  y += 8;

  /* ========= CUSTOMER ========= */
  doc.setFontSize(12);
  doc.text('Customer Details', 14, y);
  y += 6;

  doc.setFontSize(10);
  doc.text(`Name: ${loan.customer.name}`, 14, y); y += 5;
  doc.text(`Customer ID: ${loan.customer.customerId}`, 14, y); y += 5;
  doc.text(`Phone: ${loan.customer.phone}`, 14, y); y += 8;

  /* ========= LOAN SUMMARY ========= */
  doc.setFontSize(12);
  doc.text('Loan Summary', 14, y);
  y += 6;

  doc.setFontSize(10);
  doc.text(`Requested Amount: ${money(loan.requestedAmount)}`, 14, y); y += 5;
  doc.text(`Sanctioned Amount: ${money(loan.sanctionedAmount)}`, 14, y); y += 5;
  doc.text(`Interest Rate: ${loan.interestRate.toFixed(2)} %`, 14, y); y += 5;
  doc.text(`EMI Amount: ${money(loan.emiAmount)}`, 14, y); y += 5;
  doc.text(`Tenure: ${loan.tenure} months`, 14, y); y += 5;
  doc.text(`Next Due Date: ${formatDate(loan.nextDueDate)}`, 14, y); y += 8;

  /* ========= PAYMENT SCHEDULE ========= */
  doc.setFontSize(12);
  doc.text('Tentative Repayment Schedule', 14, y);
  y += 6;

  doc.setFontSize(9);
  doc.text('Due Date', 14, y);
  doc.text('Principal', 60, y);
  doc.text('Interest', 105, y);
  doc.text('Amount', 150, y);
  y += 4;

  doc.line(14, y, 196, y);
  y += 4;

  loan.paymentSchedule?.forEach(row => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    doc.text(formatDate(row.dueDate), 14, y);
    doc.text(money(row.principal), 60, y);
    doc.text(money(row.interest), 105, y);
    doc.text(money(row.amount), 150, y);
    y += 5;
  });

  /* ========= FOOTER ========= */
  doc.setFontSize(8);
  doc.text(
    'This is a system-generated loan preview. Subject to approval.',
    105,
    285,
    { align: 'center' }
  );

  doc.save(`Loan_Preview_${loan.loanAccountNumber}.pdf`);
};
