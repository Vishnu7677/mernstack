import React from 'react';
import './TournamentsApp.css';

const PreviewSection = ({ teamData, members, onClose, onGeneratePDF, onProceedPayment }) => {
  return (
    <div className="tournaments_preview">
      <div className="tournaments_preview__content">
        <div className="tournaments_preview__header">
          <h2>Registration Preview</h2>
          <button className="tournaments_preview__close" onClick={onClose}>×</button>
        </div>

        <div className="tournaments_preview__team-info">
          <h3>Team Information</h3>
          <div className="tournaments_preview__grid">
            <div className="tournaments_preview__field">
              <strong>Team Name:</strong> {teamData.teamName}
            </div>
            <div className="tournaments_preview__field">
              <strong>Team Email:</strong> {teamData.teamEmail}
            </div>
            <div className="tournaments_preview__field">
              <strong>Captain Name:</strong> {teamData.captainName}
            </div>
            <div className="tournaments_preview__field">
              <strong>Captain Phone:</strong> {teamData.captainPhone}
            </div>
          </div>
        </div>

        <div className="tournaments_preview__members">
          <h3>Team Members ({members.length})</h3>
          <div className="tournaments_table-container">
            <table className="tournaments_table">
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>#</th>
                  <th>Name</th>
                  <th>Father</th>
                  <th>Mother</th>
                  <th>DOB</th>
                  <th>Aadhaar</th>
                  <th>Phone</th>
                  <th>Institution</th>
                  <th>Village</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member, index) => (
                  <tr key={index}>
                    <td className="tournaments_photo-cell">
                      {member.photo && (
                        <img 
                          src={typeof member.photo === 'string' ? member.photo : URL.createObjectURL(member.photo)} 
                          alt={member.name}
                          className="tournaments_photo-thumb"
                        />
                      )}
                    </td>
                    <td>{index + 1}</td>
                    <td>{member.name}</td>
                    <td>{member.father}</td>
                    <td>{member.mother}</td>
                    <td>{member.dob}</td>
                    <td>{member.aadhar}</td>
                    <td>{member.phone}</td>
                    <td>{member.institution}</td>
                    <td>{member.village}</td>
                    <td>{member.mail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="tournaments_preview__actions">
          {/* <button className="tournaments_btn tournaments_btn--primary" onClick={onGeneratePDF}>
            Download PDF
          </button> */}
          <button className="tournaments_btn tournaments_btn--success" onClick={onProceedPayment}>
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewSection;