import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./HomeNavbar.css";
import banklogo from "../../../images/banklogo.jpg";

const HomeNavbar = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
      }
    };

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);
    handleResize();
    
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavLinkClick = (sectionId) => {
    // Close mobile menu if open
    if (isMobile) {
      setIsMenuOpen(false);
    }
    
    // Scroll to section
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className={`home_navbar ${scrolled ? "home_navbar_scrolled" : ""}`}>
      <div className="home_navbar_container">
        <div className="home_navbar_left_section">
          <div className="home_navbar_logo_container">
            <img className="home_navbar_bank_logo" src={banklogo} alt="Bank Logo" />
            <h3 className="home_navbar_logo_text">SACCFL</h3>
          </div>
        </div>
        
        <div className="home_navbar_right_section">
          <ul className={`home_navbar_links ${isMobile ? "home_navbar_mobile" : ""} ${isMenuOpen ? "home_navbar_active" : ""}`}>
            <li>
              <button 
                className="home_navbar_link" 
                onClick={() => handleNavLinkClick("home")}
              >
                Home
              </button>
            </li>
            <li>
              <button 
                className="home_navbar_link" 
                onClick={() => handleNavLinkClick("about")}
              >
                About
              </button>
            </li>
            <li>
              <button 
                className="home_navbar_link" 
                onClick={() => handleNavLinkClick("services")}
              >
                Services
              </button>
            </li>
            <li>
              <Link 
                to="/scholar/apply" 
                className="home_navbar_link"
                onClick={() => isMobile && setIsMenuOpen(false)}
              >
                Scholarships
              </Link>
            </li>
            <li>
              <button 
                className="home_navbar_link" 
                onClick={() => handleNavLinkClick("contact")}
              >
                Contact
              </button>
            </li>
            <li>
              <Link to="/employee/login" className="home_navbar_link home_navbar_login_btn" onClick={() => isMobile && toggleMenu()}>
                Login Now
                <span className="home_navbar_login_arrow">→</span>
              </Link>
            </li>
          </ul>
          
          <div className="home_navbar_mobile_menu_icon" onClick={toggleMenu}>
            <div className={`home_navbar_hamburger ${isMenuOpen ? "home_navbar_active" : ""}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default HomeNavbar;