// TournamentSuccess.jsx
import React, { useEffect, useState } from 'react';
import api from '../../../Services/api';

const TournamentSuccess = () => {
  const [data, setData] = useState(null);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const pid = q.get('paymentId');
    if (!pid) return;
    api.get(`/payment/${encodeURIComponent(pid)}`)
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <div className="success_page">
      <h2>Payment Successful</h2>
      <p>Payment ID: {data.razorpay?.id || data.db?.razorpay_payment_id}</p>
      <h3>Team</h3>
      <pre>{JSON.stringify(data.db?.raw_payment?.additionalData || data.db?.notes || {}, null, 2)}</pre>
      <p>Check your email for confirmation.</p>
    </div>
  );
};

export default TournamentSuccess;
