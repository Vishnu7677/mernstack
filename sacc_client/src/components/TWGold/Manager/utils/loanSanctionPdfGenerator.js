import jsPDF from 'jspdf';
import TWGoldLoansLogo from '../../../../images/TWGoldLoansLogo.png';

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString('en-IN') : '-';

const money = (val) =>
  `₹ ${Number(val || 0).toLocaleString('en-IN')}`;

export const generateLoanSanctionPDF = (loan, approvedBy) => {
  const doc = new jsPDF();
  let y = 20;

  /* ========= LOGO ========= */
  doc.addImage(TWGoldLoansLogo, 'PNG', 14, 10, 30, 20);

  /* ========= WATERMARK ========= */
  doc.setTextColor(220);
  doc.setFontSize(50);
  doc.text('APPROVED', 105, 150, { align: 'center', angle: 45 });
  doc.setTextColor(0);

  /* ========= HEADER ========= */
  doc.setFontSize(16);
  doc.text('GOLD LOAN SANCTION LETTER', 105, y, { align: 'center' });
  y += 15;

  doc.setFontSize(10);
  doc.text(`Loan A/C No: ${loan.loanAccountNumber}`, 14, y);
  doc.text(`Sanction Date: ${new Date().toLocaleString()}`, 140, y);
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

  /* ========= LOAN TERMS ========= */
  doc.setFontSize(12);
  doc.text('Loan Terms', 14, y);
  y += 6;

  doc.setFontSize(10);
  doc.text(`Sanctioned Amount: ${money(loan.sanctionedAmount)}`, 14, y); y += 5;
  doc.text(`Interest Rate: ${loan.interestRate.toFixed(2)} %`, 14, y); y += 5;
  doc.text(`Tenure: ${loan.tenure} months`, 14, y); y += 5;
  doc.text(`EMI Amount: ${money(loan.emiAmount)}`, 14, y); y += 5;
  doc.text(`Next Due Date: ${formatDate(loan.nextDueDate)}`, 14, y); y += 8;

  /* ========= PAYMENT SCHEDULE ========= */
  doc.setFontSize(12);
  doc.text('Repayment Schedule', 14, y);
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

  y += 10;

  /* ========= SIGNATURE ========= */
  doc.line(14, y, 80, y);
  doc.line(120, y, 196, y);
  y += 5;

  doc.setFontSize(10);
  doc.text('Customer Signature', 14, y);
  doc.text('Authorized Signatory', 120, y);
  y += 5;

  doc.setFontSize(9);
  doc.text(`Approved By: ${approvedBy.name}`, 120, y);
  y += 4;
  doc.text(`Employee ID: ${approvedBy.employeeId}`, 120, y);

  /* ========= FOOTER ========= */
  doc.setFontSize(8);
  doc.text(
    'This document is system generated and does not require physical seal.',
    105,
    285,
    { align: 'center' }
  );

  doc.autoPrint();
  window.open(doc.output('bloburl'), '_blank');
};
