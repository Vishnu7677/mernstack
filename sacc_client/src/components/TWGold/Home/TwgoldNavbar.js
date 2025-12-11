import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Twgoldnavbar.css';
import TWGoldLoansLogo from '../../../images/TWGoldLoansLogo.png';

const TwgoldNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  return (
    <header className="twgold_loan_home_header">
      <div className="twgold_loan_home_nav">
        <div className="twgold_loan_home_logo">
          <img
            src={TWGoldLoansLogo}
            alt="TW Gold Loans Logo"
            className="twgold_loan_home_logo_img"
          />
        </div>

        <button
          className={`twgold_loan_home_mobile_menu_btn ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span className="twgold_loan_home_hamburger"></span>
        </button>

        <nav className={`twgold_loan_home_nav_links ${isMobileMenuOpen ? 'twgold_loan_home_mobile_open' : ''}`}>
          <Link to="/twgold&articles/home#gold-loans" onClick={() => setIsMobileMenuOpen(false)}>Gold Loans</Link>
          <Link to="/twgold&articles/home#gold-buying" onClick={() => setIsMobileMenuOpen(false)}>Gold Buying</Link>
          <Link to="/twgold&articles/home#franchise" onClick={() => setIsMobileMenuOpen(false)}>Franchise</Link>
          <Link to="/twgold&articles/home#contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
        </nav>
      </div>
    </header>
  );
};

export default TwgoldNavbar;
