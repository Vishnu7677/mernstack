import React from 'react';
import banklogo from "../../../images/banklogo.jpg";
import './TournamentsApp.css'

const Header = () => {
  return (
    <header className="tournaments_header">
      <div className="tournaments_header__content">
        <img 
          src={banklogo} 
          alt="SAC Premier League Logo" 
          className="tournaments_header__logo"
        />
        <h1 className="tournaments_header__title">
          SAC PREMIER LEAGUE 2024 – TEAM REGISTRATION
        </h1>
      </div>
    </header>
  );
};

export default Header;