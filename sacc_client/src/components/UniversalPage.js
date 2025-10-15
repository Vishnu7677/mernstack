import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './UniversalPage.css';

const UniversalPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the previous path from location state or default to '/'
  const previousPath = location.state?.from || '/';
  
  const handleGoBack = () => {
    if (previousPath && previousPath !== location.pathname) {
      navigate(previousPath);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="universal_container">
      <div className="universal_content">
        <div className="universal_animation">
          <div className="universal_orbit universal_orbit_1"></div>
          <div className="universal_orbit universal_orbit_2"></div>
          <div className="universal_orbit universal_orbit_3"></div>
          <div className="universal_center"></div>
        </div>
        
        <h1 className="universal_title">Page Not Found</h1>
        <p className="universal_message">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        
        <button 
          className="universal_button" 
          onClick={handleGoBack}
        >
          {previousPath === '/' ? 'Go Home' : 'Return to Previous Page'}
        </button>
        
        <div className="universal_particles">
          {[...Array(50)].map((_, index) => (
            <div key={index} className="universal_particle"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UniversalPage;