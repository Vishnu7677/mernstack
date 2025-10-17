import React from 'react';
import MembersTable from './MembersTable';

const TeamForm = ({ teamData, updateTeamData, members, onAddMember, onRemoveMember, onPreview }) => {
  const handleInputChange = (field) => (e) => {
    updateTeamData(field, e.target.value);
  };

  return (
    <form className="tournaments_form">
      <h2 className="tournaments_form__title">Team & Captain Details</h2>
      
      <div className="tournaments_form__grid">
        <div className="tournaments_form__group">
          <label className="tournaments_form__label">Team Name:</label>
          <input
            type="text"
            className="tournaments_form__input"
            value={teamData.teamName}
            onChange={handleInputChange('teamName')}
            required
          />
        </div>

        <div className="tournaments_form__group">
          <label className="tournaments_form__label">Team Email:</label>
          <input
            type="email"
            className="tournaments_form__input"
            value={teamData.teamEmail}
            onChange={handleInputChange('teamEmail')}
            required
          />
        </div>

        <div className="tournaments_form__group">
          <label className="tournaments_form__label">Captain Name:</label>
          <input
            type="text"
            className="tournaments_form__input"
            value={teamData.captainName}
            onChange={handleInputChange('captainName')}
            required
          />
        </div>

        <div className="tournaments_form__group">
          <label className="tournaments_form__label">Captain Phone:</label>
          <input
            type="tel"
            className="tournaments_form__input"
            value={teamData.captainPhone}
            maxLength="10"
            onChange={handleInputChange('captainPhone')}
            required
          />
        </div>

        {/* <div className="tournaments_form__group">
          <label className="tournaments_form__label">Team Category:</label>
          <select
            className="tournaments_form__input"
            value={teamData.teamCategory || 'Mixed'}
            onChange={handleInputChange('teamCategory')}
          >
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Mixed">Mixed</option>
          </select>
        </div> */}
      </div>

      <button
        type="button"
        className="tournaments_btn tournaments_btn--primary tournaments_btn--add"
        onClick={onAddMember}
      >
        <span className="tournaments_btn__icon">+</span>
        Add Team Member
      </button>

      <MembersTable members={members} onRemoveMember={onRemoveMember} />

      <button
        type="button"
        className="tournaments_btn tournaments_btn--preview"
        onClick={onPreview}
      >
        Preview
      </button>
    </form>
  );
};

export default TeamForm;
