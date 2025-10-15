// TournamentRegistration.jsx
import React, { useState } from 'react';
import TeamForm from './TeamForm';
import MemberPopup from './MemberPopup';
import PreviewSection from './PreviewSection';
import Header from './Header';
import Footer from './Footer';
import jsPDF from 'jspdf';
import './TournamentsApp.css';
import showToast from '../../Toast';
import { ToastContainer } from 'react-toastify';
import { createPaymentOrder, verifyPayment, getUploadPresigned } from '../../../Services/api';

const REGISTRATION_AMOUNT = 4499; // rupees fixed
const MAX_PLAYERS = 17;

const TournamentRegistration = () => {
  const [members, setMembers] = useState([]);
  const [showMemberPopup, setShowMemberPopup] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [teamData, setTeamData] = useState({
    teamName: '',
    teamEmail: '',
    captainName: '',
    captainPhone: '',
    teamCategory: 'Mixed',
  });

  // PDF Generation Function (unchanged)
  const generatePDF = (teamData, members) => {
    const doc = new jsPDF();
    const primaryColor = [30, 41, 59];
    const accentColor = [59, 130, 246];
    const lightGray = [240, 240, 240];

    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('SAC PREMIER LEAGUE 2025', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('TEAM REGISTRATION FORM', 105, 30, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Team Information', 14, 50);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Team Name: ${teamData.teamName || 'N/A'}`, 14, 60);
    doc.text(`Team Email: ${teamData.teamEmail || 'N/A'}`, 14, 66);
    doc.text(`Captain Name: ${teamData.captainName || 'N/A'}`, 14, 72);
    doc.text(`Captain Phone: ${teamData.captainPhone || 'N/A'}`, 14, 78);
    doc.text(`Category: ${teamData.teamCategory || 'Mixed'}`, 14, 84);

    let yPosition = 95;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Team Members (${members.length})`, 14, yPosition);
    yPosition += 10;

    if (members.length === 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('No team members added', 14, yPosition);
    } else {
      doc.setFillColor(...accentColor);
      doc.rect(14, yPosition, 182, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');

      const headers = ['#', 'Name', 'Father', 'Mother', 'DOB', 'Aadhaar', 'Phone', 'Village'];
      const columnWidths = [10, 30, 25, 25, 25, 30, 25, 32];
      let xPosition = 16;

      headers.forEach((header, index) => {
        doc.text(header, xPosition, yPosition + 6);
        xPosition += columnWidths[index];
      });

      yPosition += 8;

      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');

      members.forEach((member, index) => {
        if (index % 2 === 0) {
          doc.setFillColor(...lightGray);
          doc.rect(14, yPosition, 182, 8, 'F');
        }

        xPosition = 16;
        const rowData = [
          (index + 1).toString(),
          member.name || 'N/A',
          member.father || 'N/A',
          member.mother || 'N/A',
          member.dob || 'N/A',
          member.aadhar || 'N/A',
          member.phone || 'N/A',
          member.village || 'N/A'
        ];

        rowData.forEach((data, dataIndex) => {
          const maxLength = dataIndex === 1 ? 15 : 12;
          const displayText = data.length > maxLength ? data.substring(0, maxLength) + '...' : data;
          doc.text(displayText, xPosition, yPosition + 6);
          xPosition += columnWidths[dataIndex];
        });

        yPosition += 8;

        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
      });
    }

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Page ${i} of ${pageCount} • Generated on ${new Date().toLocaleDateString()} • SAC Premier League 2025`,
        105,
        285,
        { align: 'center' }
      );
    }

    const fileName = `Team_Registration_${teamData.teamName || 'Unknown'}_${new Date().getTime()}.pdf`;
    doc.save(fileName);
  };

  const addMember = (member) => {
    if (members.length >= MAX_PLAYERS) {
      showToast('error', `Maximum ${MAX_PLAYERS} members allowed`);
      return false;
    }

    if (member.aadhar && members.find(m => m.aadhar === member.aadhar)) {
      showToast('error', 'Duplicate Aadhaar not allowed');
      return false;
    }

    setMembers(prev => [...prev, member]);
    return true;
  };

  const removeMember = (index) => setMembers(prev => prev.filter((_, i) => i !== index));

  const updateTeamData = (field, value) => setTeamData(prev => ({ ...prev, [field]: value }));

  const handlePreview = () => {
    if (!teamData.teamName.trim()) return showToast('error', 'Team Name is required');
    if (!teamData.teamEmail.trim() || !/^\S+@\S+\.\S+$/.test(teamData.teamEmail)) return showToast('error', 'Valid Team Email is required');
    if (!teamData.captainName.trim()) return showToast('error', 'Captain Name is required');
    if (!teamData.captainPhone.trim() || teamData.captainPhone.length !== 10) return showToast('error', 'Valid Captain Phone number (10 digits) is required');
    if (members.length < 2) return showToast('error', 'At least 2 team members are required');
    setShowPreview(true);
  };

  // ---------- S3 upload helpers ----------
  const requestPresignedUrls = async (filesMeta) => {
    const resp = await getUploadPresigned(filesMeta);
    if (resp?.data?.success) return resp.data.uploads;
    throw new Error(resp?.data?.message || 'Failed to get presigned URLs');
  };

  const uploadFileToS3 = async (presignedUrl, file, contentType) => {
    const res = await fetch(presignedUrl, { method: 'PUT', headers: { 'Content-Type': contentType }, body: file });
    if (!res.ok) throw new Error('Failed to upload file to S3');
    return true;
  };

  const handleProceedPayment = async () => {
    try {
      if (!teamData.teamName || !teamData.teamEmail || !teamData.captainName || !teamData.captainPhone) {
        showToast('error', 'Please complete the team details before proceeding to payment.');
        return;
      }
      if (members.length < 2) {
        showToast('error', 'Add at least 2 members before proceeding.');
        return;
      }

      setIsProcessing(true);

      // 1) Upload photos
      const filesToUpload = members.map((m, idx) => m.photoFile instanceof File ? { name: m.photoFile.name, type: m.photoFile.type, memberIndex: idx } : null).filter(Boolean);

      if (filesToUpload.length > 0) {
        const presigns = await requestPresignedUrls(filesToUpload.map(f => ({ name: f.name, type: f.type })));
        await Promise.all(presigns.map(async (p, i) => {
          const fileInfo = filesToUpload[i];
          const file = members[fileInfo.memberIndex].photoFile;
          await uploadFileToS3(p.presignedUrl, file, file.type);
          members[fileInfo.memberIndex].photo = p.publicUrl;
          delete members[fileInfo.memberIndex].photoFile;
        }));
      }

      // 2) Create backend order
      const receipt = `SAC_TOURN_${Date.now()}`;
      const notes = { teamName: teamData.teamName, teamEmail: teamData.teamEmail, captainName: teamData.captainName, tournamentName: 'SAC Premier League 2025' };
      const orderResp = await createPaymentOrder({ amount: REGISTRATION_AMOUNT, currency: 'INR', receipt, notes });
      if (!orderResp?.success || !orderResp.order) throw new Error(orderResp?.error || 'Failed to create order');
      const order = orderResp.order;

      // 3) Load Razorpay
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.async = true;
          script.onload = resolve;
          script.onerror = () => reject(new Error('Razorpay SDK failed to load'));
          document.body.appendChild(script);
        });
      }

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'SAC Premier League',
        description: `Team Registration - ${teamData.teamName}`,
        order_id: order.id,
        handler: async (response) => {
          try {
            const payload = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              additionalData: { teamData: { ...teamData, tournamentName: 'SAC Premier League 2025' }, members, registrationReceipt: receipt }
            };
            const verifyResp = await verifyPayment(payload);
            if (verifyResp?.success && verifyResp.verified) {
              showToast('success', 'Payment successful! Registration saved.');
              const paymentId = verifyResp.payment?.razorpay_payment_id || verifyResp.payment?._id;
              window.location.href = `/tournament/success?paymentId=${encodeURIComponent(paymentId)}`;
            } else {
              showToast('error', verifyResp?.message || 'Payment verification failed. Contact support.');
            }
          } catch (err) {
            console.error(err);
            showToast('error', err?.message || 'Verification request failed.');
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: { name: teamData.captainName, email: teamData.teamEmail, contact: teamData.captainPhone },
        notes: { teamName: teamData.teamName, receipt },
        theme: { color: '#3b82f6' }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        console.error('Payment failed', response);
        showToast('error', 'Payment failed or was cancelled.');
        setIsProcessing(false);
      });

      rzp.open();
    } catch (err) {
      console.error(err);
      showToast('error', err?.message || 'Failed to start payment.');
      setIsProcessing(false);
    }
  };

  const handleGeneratePDF = () => {
    if (!teamData.teamName) return alert('Please enter team name first');
    if (members.length === 0) return alert('Please add at least one team member');
    generatePDF(teamData, members);
  };

  return (
    <div className="tournaments_registration">
      <ToastContainer autoClose />
      <Header />
      <div className="tournaments_container">
        <TeamForm
          teamData={teamData}
          updateTeamData={updateTeamData}
          members={members}
          onAddMember={() => setShowMemberPopup(true)}
          onRemoveMember={removeMember}
          onPreview={handlePreview}
        />

        {showMemberPopup && (
          <MemberPopup
            onClose={() => setShowMemberPopup(false)}
            onSave={(member) => {
              const ok = addMember(member);
              if (ok) setShowMemberPopup(false);
            }}
          />
        )}

        {showPreview && (
          <PreviewSection
            teamData={teamData}
            members={members}
            onClose={() => setShowPreview(false)}
            onGeneratePDF={handleGeneratePDF}
            onProceedPayment={handleProceedPayment}
            isProcessing={isProcessing} // optional: pass down to PreviewSection if needed
          />
        )}

        {/* Proceed Payment Button */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            type="button"
            className="tournaments_btn tournaments_btn--primary"
            onClick={handleProceedPayment}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Proceed to Payment'}
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TournamentRegistration;
