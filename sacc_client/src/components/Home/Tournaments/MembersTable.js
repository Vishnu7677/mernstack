import React from 'react';
import './TournamentsApp.css';

const MembersTable = ({ members, onRemoveMember }) => {
  if (members.length === 0) {
    return (
      <div className="tournaments_empty-state">
        <p>No team members added yet. Click "Add Team Member" to get started.</p>
      </div>
    );
  }

  return (
    <div className="tournaments_table-container">
      <table className="tournaments_table">
        <thead className="tournaments_table__head">
          <tr>
            <th>Photo</th>
            <th>No.</th>
            <th>Name</th>
            <th>Father</th>
            <th>Mother</th>
            <th>DOB</th>
            <th>Aadhaar</th>
            <th>Phone</th>
            <th>Institution</th>
            <th>Village</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody className="tournaments_table__body">
          {members.map((member, index) => (
            <tr key={index} className="tournaments_table__row">
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
              <td>
                <button
                  className="tournaments_btn tournaments_btn--danger tournaments_btn--small"
                  onClick={() => onRemoveMember(index)}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MembersTable;