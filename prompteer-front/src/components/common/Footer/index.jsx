import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-left">
          <div className="footer-brand">
            <h2 className="footer-logo">Prompteer</h2>
            <p className="footer-copyright">©2025 Prompteer. All rights reserved.</p>
          </div>
          <div className="footer-links">
            <span className="footer-link">Terms of Service</span>
            <span className="footer-link">Privacy Policy</span>
          </div>
        </div>
        <div className="footer-right">
          <div className="footer-contact">
            <h3 className="contact-title">About us</h3>
            <p className="contact-info">email: contacts@prompteer.com</p>
            <p className="contact-info">phone: 02-123-4567</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;