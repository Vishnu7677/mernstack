import React from "react";
import "./HomePage.css";
import HomeNavbar from "../Navbar/HomeNavbar";
import { FaHandHoldingUsd, FaPiggyBank, FaHome, FaCar, FaGraduationCap, FaChartLine, FaShieldAlt, FaUsers, FaLightbulb, FaMobileAlt } from "react-icons/fa";
import Footer from "../Tournaments/Footer";
import { Helmet } from "react-helmet";

const HomePage = () => {
  return (
    <>
    <Helmet>
        <title>SACCFBL - Financial Services in AP</title>
        <meta name="description" content="Sandhya Aryavartha Credit Capital Finance Banking Limited offers personal loans, home loans, car loans, business loans, fixed deposits and savings accounts in Andhra Pradesh." />
    <meta name="keywords" content="finance, banking, loans, fixed deposits, savings, credit, Andhra Pradesh, personal loans, home loans, business loans" />
    
    <meta property="og:title" content="Sandhya Aryavartha Credit Capital - Finance Banking Limited" />
    <meta property="og:description" content="Empowering your financial journey with trusted, innovative solutions tailored for your growth and prosperity." />
    <meta property="og:url" content="https://sacb.co.in/" />
    <meta property="og:type" content="website" />
    
    <link rel="canonical" href="https://sacb.co.in/" />
      </Helmet>
      <HomeNavbar />
      <div className="homepage_container mt-5">
        {/* Hero Section with animated gradient */}
        <section id="home" className="homepage_hero">
          <div className="homepage_hero-overlay"></div>
          <div className="homepage_hero-content">
            <h1>
              <span className="homepage_hero-title-main">Sandhya Aryavartha Credit Capital</span>
              <span className="homepage_hero-title-sub">Finance Banking Limted.</span>
            </h1>
            <p className="homepage_tagline">"Best Choice for Us"</p>
            <p className="homepage_intro-text">
              Empowering your financial journey with trusted, innovative solutions
              tailored for your growth and prosperity.
            </p>
            <button className="homepage_cta-button">Join Our Community</button>
          </div>
          <div className="homepage_hero-scroll-indicator">
            <span>Scroll Down</span>
            <div className="homepage_scroll-arrow"></div>
          </div>
        </section>

        {/* Stats Section */}
        <section id="about" className="homepage_stats-section">
          <div className="homepage_stat-item">
            <div className="homepage_stat-number">5000+</div>
            <div className="homepage_stat-label">Happy Members</div>
          </div>
          <div className="homepage_stat-item">
            <div className="homepage_stat-number">₹30Cr+</div>
            <div className="homepage_stat-label">Assets Managed</div>
          </div>
          <div className="homepage_stat-item">
            <div className="homepage_stat-number">2+</div>
            <div className="homepage_stat-label">Years of Service</div>
          </div>
        </section>

        {/* Membership Options */}
        <section className="homepage_membership">
          <div className="homepage_section-header">
            <h2>Membership <span>Options</span></h2>
            <p className="homepage_section-subtitle">Tailored financial solutions for every need</p>
          </div>
          <div className="homepage_membership-grid">
            <div className="homepage_membership-card">
              <div className="homepage_card-icon"><FaPiggyBank /></div>
              <h3>Savings Account</h3>
              <p>Secure your money with attractive interest rates and easy access.</p>
            </div>
            <div className="homepage_membership-card">
              <div className="homepage_card-icon"><FaHandHoldingUsd /></div>
              <h3>Personal Loans</h3>
              <p>Flexible options to meet your personal financial requirements.</p>
            </div>
            <div className="homepage_membership-card">
              <div className="homepage_card-icon"><FaHome /></div>
              <h3>Home Loans</h3>
              <p>Competitive rates to help you build your dream home.</p>
            </div>
            <div className="homepage_membership-card">
              <div className="homepage_card-icon"><FaCar /></div>
              <h3>Car Loans</h3>
              <p>Affordable EMI plans for your dream vehicle.</p>
            </div>
            <div className="homepage_membership-card">
              <div className="homepage_card-icon"><FaChartLine /></div>
              <h3>Business Loans</h3>
              <p>Fuel your business growth with customized financing.</p>
            </div>
            <div className="homepage_membership-card">
              <div className="homepage_card-icon"><FaShieldAlt /></div>
              <h3>Fixed Deposits</h3>
              <p>Secure investments with guaranteed returns.</p>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="homepage_services">
          <div className="homepage_section-header">
            <h2>Our <span>Services</span></h2>
            <p className="homepage_section-subtitle">Comprehensive financial solutions</p>
          </div>
          <div className="homepage_services-container">
            <div className="homepage_service-item">
              <div className="homepage_service-icon"><FaMobileAlt /></div>
              <h3>Digital Banking</h3>
              <p>24/7 access to your accounts through our secure mobile platform.</p>
            </div>
            <div className="homepage_service-item">
              <div className="homepage_service-icon"><FaUsers /></div>
              <h3>Dedicated Support</h3>
              <p>Personalized assistance from our expert financial advisors.</p>
            </div>
            <div className="homepage_service-item">
              <div className="homepage_service-icon"><FaLightbulb /></div>
              <h3>Investment Planning</h3>
              <p>Strategic advice to maximize your wealth and secure your future.</p>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="homepage_why-choose-us">
          <div className="homepage_section-header">
            <h2>Why <span>Choose Us?</span></h2>
            <p className="homepage_section-subtitle">The advantages of being part of our community</p>
          </div>
          <div className="homepage_features-grid">
            <div className="homepage_feature-item">
              <div className="homepage_feature-number">01</div>
              <h3>Member-Centric</h3>
              <p>We prioritize your needs with personalized financial solutions.</p>
            </div>
            <div className="homepage_feature-item">
              <div className="homepage_feature-number">02</div>
              <h3>Competitive Rates</h3>
              <p>Enjoy better returns on deposits and lower interest on loans.</p>
            </div>
            <div className="homepage_feature-item">
              <div className="homepage_feature-number">03</div>
              <h3>Transparent</h3>
              <p>Clear terms with no hidden charges or complicated fine print.</p>
            </div>
            <div className="homepage_feature-item">
              <div className="homepage_feature-number">04</div>
              <h3>Community Focus</h3>
              <p>We reinvest in local development and member welfare.</p>
            </div>
          </div>
        </section>

        {/* Scholarships Section */}
        <section className="homepage_scholarships">
          <div className="homepage_scholarship-content">
            <div className="homepage_section-header">
              <h2>Educational <span>Scholarships</span></h2>
              <p className="homepage_section-subtitle">Investing in our community's future</p>
            </div>
            <div className="homepage_scholarship-details">
              <div className="homepage_scholarship-icon"><FaGraduationCap /></div>
              <p>
                We believe education is the foundation of progress. Our scholarship program supports
                students from 6th to Ph.D, helping to build a brighter future for our community.
              </p>
              <button className="homepage_outline-button">Learn More</button>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="homepage_contact">
          <div className="homepage_contact-container">
            <div className="homepage_contact-info">
              <h2>Get in <span>Touch</span></h2>
              <div className="homepage_contact-item">
                <h3>Address</h3>
                <p>4-64, Main Road, Dubacherla, Nallajerla Mandal, East Godavari, Andhra Pradesh, Bharat - 534112</p>
              </div>
              <div className="homepage_contact-item">
                <h3>Contact</h3>
                <p>Phone: 9491028724</p>
                <p>Telephone: 08818-294406</p>
                <p>Email: contact@sacb.co.in</p>
              </div>
            </div>
            <div className="homepage_contact-form">
              <h3>Send us a Message</h3>
              <form>
                <div className="homepage_form-group">
                  <input type="text" placeholder="Your Name" />
                </div>
                <div className="homepage_form-group">
                  <input type="email" placeholder="Your Email" />
                </div>
                <div className="homepage_form-group">
                  <input type="text" placeholder="Subject" />
                </div>
                <div className="homepage_form-group">
                  <textarea placeholder="Your Message"></textarea>
                </div>
                <button type="submit" className="homepage_cta-button">Send Message</button>
              </form>
            </div>
          </div>
        </section>
        <Footer/>
      </div>
    </>
  );
};

export default HomePage;