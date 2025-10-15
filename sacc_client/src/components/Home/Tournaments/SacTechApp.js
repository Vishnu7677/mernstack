import React, { useState } from 'react';
import './sac_tech_styles.css';

const SacTechApp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Message sent successfully!');
        setFormData({ name: '', email: '', message: '' });
      } else {
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message. Please try again.');
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="sac_tech_container">
      {/* Header */}
      <header className="sac_tech_header">
        <div className="sac_tech_header_content">
          <div className="sac_tech_logo">
            <h1>SAC INFO TECH</h1>
            <span>SOLUTIONS</span>
          </div>
          
          <nav className={`sac_tech_nav ${isMenuOpen ? 'sac_tech_nav_open' : ''}`}>
            <ul className="sac_tech_nav_list">
              <li><a href="#services" onClick={() => setIsMenuOpen(false)}>Services</a></li>
              <li><a href="#vision" onClick={() => setIsMenuOpen(false)}>Vision</a></li>
              <li><a href="#advantages" onClick={() => setIsMenuOpen(false)}>Advantages</a></li>
              <li><a href="#internships" onClick={() => setIsMenuOpen(false)}>Internships</a></li>
              <li><a href="#contact" onClick={() => setIsMenuOpen(false)}>Contact</a></li>
            </ul>
          </nav>

          <button 
            className={`sac_tech_menu_toggle ${isMenuOpen ? 'sac_tech_menu_toggle_open' : ''}`}
            onClick={toggleMenu}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="sac_tech_hero">
        <div className="sac_tech_hero_background">
          <div className="sac_tech_hero_overlay"></div>
        </div>
        <div className="sac_tech_hero_content">
          <div className="sac_tech_hero_badge">
            <span>Eco-Friendly & Affordable</span>
          </div>
          <h1 className="sac_tech_hero_title">
            Advanced Digital Solutions
            <span className="sac_tech_hero_highlight">For Modern Business</span>
          </h1>
          <p className="sac_tech_hero_description">
            We deliver cutting-edge digital, financial, and educational platforms with eco-friendly practices 
            and competitive pricing. Your partner in sustainable digital transformation.
          </p>
          <div className="sac_tech_hero_actions">
            <a href="#contact" className="sac_tech_btn sac_tech_btn_primary">Get Started</a>
            <a href="#services" className="sac_tech_btn sac_tech_btn_secondary">Our Services</a>
          </div>
        </div>
        <div className="sac_tech_hero_scroll">
          <div className="sac_tech_scroll_indicator"></div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="sac_tech_section">
        <div className="sac_tech_section_header">
          <h2 className="sac_tech_section_title">Our Comprehensive Services</h2>
          <p className="sac_tech_section_subtitle">Innovative solutions tailored to your business needs</p>
        </div>
        
        <div className="sac_tech_services_grid">
          <div className="sac_tech_service_card">
            <div className="sac_tech_service_icon">🛒</div>
            <h3>E-Commerce Platforms</h3>
            <p>Build scalable, eco-friendly online stores with smart inventory management and best price strategies.</p>
            <div className="sac_tech_service_features">
              <span>Eco-friendly</span>
              <span>Scalable</span>
              <span>Secure</span>
            </div>
          </div>

          <div className="sac_tech_service_card">
            <div className="sac_tech_service_icon">🧾</div>
            <h3>GST Invoicing Solutions</h3>
            <p>Automate GST-compliant invoicing and filing with software focused on low-resource usage.</p>
            <div className="sac_tech_service_features">
              <span>Automated</span>
              <span>Compliant</span>
              <span>Efficient</span>
            </div>
          </div>

          <div className="sac_tech_service_card">
            <div className="sac_tech_service_icon">🏦</div>
            <h3>Banking & Finance Systems</h3>
            <p>Secure banking and microfinance software designed for green operations and optimized processes.</p>
            <div className="sac_tech_service_features">
              <span>Secure</span>
              <span>Optimized</span>
              <span>Reliable</span>
            </div>
          </div>

          <div className="sac_tech_service_card">
            <div className="sac_tech_service_icon">🏘️</div>
            <h3>Society Management</h3>
            <p>Eco-friendly web portals for communities enabling seamless communication and management.</p>
            <div className="sac_tech_service_features">
              <span>Community</span>
              <span>Eco-friendly</span>
              <span>User-friendly</span>
            </div>
          </div>

          <div className="sac_tech_service_card">
            <div className="sac_tech_service_icon">💰</div>
            <h3>Gold Loan Management</h3>
            <p>End-to-end digital solutions for gold loan tracking and customer management.</p>
            <div className="sac_tech_service_features">
              <span>Digital</span>
              <span>Efficient</span>
              <span>Secure</span>
            </div>
          </div>

          <div className="sac_tech_service_card">
            <div className="sac_tech_service_icon">🎓</div>
            <h3>Education Management</h3>
            <p>Digital ERP platforms for educational institutions with comprehensive management features.</p>
            <div className="sac_tech_service_features">
              <span>Comprehensive</span>
              <span>Digital</span>
              <span>Efficient</span>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section id="vision" className="sac_tech_section sac_tech_section_alt">
        <div className="sac_tech_vision_content">
          <div className="sac_tech_vision_text">
            <h2 className="sac_tech_section_title">Our Vision & Mission</h2>
            <div className="sac_tech_vision_items">
              <div className="sac_tech_vision_item">
                <h3>🌱 Our Vision</h3>
                <p>To provide the most eco-friendly and affordable IT solutions, enabling sustainable digital transformation for clients globally.</p>
              </div>
              <div className="sac_tech_vision_item">
                <h3>🎯 Our Mission</h3>
                <p>Focus on innovation, low carbon footprint, and cost efficiency across all products and services, from large-scale platforms to internship training.</p>
              </div>
            </div>
          </div>
          <div className="sac_tech_vision_stats">
            <div className="sac_tech_stat">
              <span className="sac_tech_stat_number">100+</span>
              <span className="sac_tech_stat_label">Projects Delivered</span>
            </div>
            <div className="sac_tech_stat">
              <span className="sac_tech_stat_number">50+</span>
              <span className="sac_tech_stat_label">Happy Clients</span>
            </div>
            <div className="sac_tech_stat">
              <span className="sac_tech_stat_number">24/7</span>
              <span className="sac_tech_stat_label">Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section id="advantages" className="sac_tech_section">
        <div className="sac_tech_section_header">
          <h2 className="sac_tech_section_title">Why Choose Us?</h2>
          <p className="sac_tech_section_subtitle">Experience the difference with our unique approach</p>
        </div>
        
        <div className="sac_tech_advantages_grid">
          <div className="sac_tech_advantage_card">
            <div className="sac_tech_advantage_icon">🌍</div>
            <h3>Eco-Conscious Design</h3>
            <p>Environmentally responsible practices in all our projects and operations.</p>
          </div>
          
          <div className="sac_tech_advantage_card">
            <div className="sac_tech_advantage_icon">💸</div>
            <h3>Best Price Guarantee</h3>
            <p>Competitive pricing without compromising on quality and features.</p>
          </div>
          
          <div className="sac_tech_advantage_card">
            <div className="sac_tech_advantage_icon">🤝</div>
            <h3>Long-term Partnership</h3>
            <p>Transparent processes and dedicated support for lasting relationships.</p>
          </div>
          
          <div className="sac_tech_advantage_card">
            <div className="sac_tech_advantage_icon">👨‍💻</div>
            <h3>Expert Team</h3>
            <p>Professional team blending technology expertise and innovation.</p>
          </div>
          
          <div className="sac_tech_advantage_card">
            <div className="sac_tech_advantage_icon">🔧</div>
            <h3>Custom Solutions</h3>
            <p>Tailored digital products adapted for your exact business needs.</p>
          </div>
          
          <div className="sac_tech_advantage_card">
            <div className="sac_tech_advantage_icon">🎓</div>
            <h3>Training Programs</h3>
            <p>Comprehensive internships focused on green IT and efficiency.</p>
          </div>
        </div>
      </section>

      {/* Internships Section */}
      <section id="internships" className="sac_tech_section sac_tech_section_alt">
        <div className="sac_tech_internships_content">
          <div className="sac_tech_internships_text">
            <h2 className="sac_tech_section_title">Internships & Training</h2>
            <p className="sac_tech_internships_lead">
              Our certified internship programs empower graduates with practical experience in eco-friendly development.
            </p>
            
            <div className="sac_tech_benefits_list">
              <div className="sac_tech_benefit_item">
                <span className="sac_tech_benefit_icon">✅</span>
                <span>Real-time project involvement</span>
              </div>
              <div className="sac_tech_benefit_item">
                <span className="sac_tech_benefit_icon">✅</span>
                <span>Expert guidance in green technology</span>
              </div>
              <div className="sac_tech_benefit_item">
                <span className="sac_tech_benefit_icon">✅</span>
                <span>Industry-recognized certification</span>
              </div>
              <div className="sac_tech_benefit_item">
                <span className="sac_tech_benefit_icon">✅</span>
                <span>Workshops on modern technologies</span>
              </div>
              <div className="sac_tech_benefit_item">
                <span className="sac_tech_benefit_icon">✅</span>
                <span>Placement assistance</span>
              </div>
            </div>
            
            <a href="#contact" className="sac_tech_btn sac_tech_btn_primary">Apply Now</a>
          </div>
          
          <div className="sac_tech_internships_visual">
            <div className="sac_tech_visual_card">Hands-on Experience</div>
            <div className="sac_tech_visual_card">Mentorship</div>
            <div className="sac_tech_visual_card">Certification</div>
            <div className="sac_tech_visual_card">Career Growth</div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="sac_tech_section">
        <div className="sac_tech_contact_content">
          <div className="sac_tech_contact_info">
            <h2 className="sac_tech_section_title">Get In Touch</h2>
            <p className="sac_tech_contact_description">
              Ready to transform your business with eco-friendly technology solutions? Contact us today!
            </p>
            
            <div className="sac_tech_contact_details">
              <div className="sac_tech_contact_item">
                <div className="sac_tech_contact_icon">📧</div>
                <div>
                  <h4>Email</h4>
                  <a href="mailto:contact@sacb.co.in">contact@sacb.co.in</a>
                </div>
              </div>
              
              <div className="sac_tech_contact_item">
                <div className="sac_tech_contact_icon">📞</div>
                <div>
                  <h4>Phone</h4>
                  <a href="tel:+919491028724">+91 94910 28724</a>
                </div>
              </div>
              
              <div className="sac_tech_contact_item">
                <div className="sac_tech_contact_icon">📍</div>
                <div>
                  <h4>Address</h4>
                  <p>6-41 Main Road, Dubacherla, Nallajerla Mandal,<br />East Godavari, Andhra Pradesh, 534112</p>
                </div>
              </div>
            </div>
          </div>
          
          <form className="sac_tech_contact_form" onSubmit={handleSubmit}>
            <div className="sac_tech_form_group">
              <input 
                type="text" 
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleInputChange}
                required 
              />
            </div>
            
            <div className="sac_tech_form_group">
              <input 
                type="email" 
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleInputChange}
                required 
              />
            </div>
            
            <div className="sac_tech_form_group">
              <textarea 
                placeholder="Your Message"
                name="message"
                rows="6"
                value={formData.message}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>
            
            <button type="submit" className="sac_tech_btn sac_tech_btn_primary sac_tech_btn_full">
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="sac_tech_footer">
        <div className="sac_tech_footer_content">
          <div className="sac_tech_footer_main">
            <div className="sac_tech_footer_logo">
              <h3>SAC INFO TECH SOLUTIONS</h3>
              <p>Eco-friendly & Affordable Technology Solutions</p>
            </div>
            
            <div className="sac_tech_footer_links">
              <div className="sac_tech_footer_column">
                <h4>Services</h4>
                <a href="#services">E-Commerce</a>
                <a href="#services">Banking Systems</a>
                <a href="#services">Education ERP</a>
              </div>
              
              <div className="sac_tech_footer_column">
                <h4>Company</h4>
                <a href="#vision">Vision</a>
                <a href="#advantages">Advantages</a>
                <a href="#internships">Internships</a>
              </div>
              
              <div className="sac_tech_footer_column">
                <h4>Contact</h4>
                <a href="#contact">Get Quote</a>
                <a href="#contact">Support</a>
                <a href="#contact">Careers</a>
              </div>
            </div>
          </div>
          
          <div className="sac_tech_footer_bottom">
            <p>&copy; 2025 SAC INFO TECH SOLUTIONS | Powered by L&NS Aryavarth Sindu Samraj Pvt Ltd. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SacTechApp;