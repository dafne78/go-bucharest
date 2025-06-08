import { useState } from 'react';
import './ContactPage.css';
import { teamMembers } from '../../assets/events';
import TeamMember from '../../Components/TeamMember/TeamMember';

const ContactPage = () => {
  const member = teamMembers[0];
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="contact-container">
      <div className="contact-hero">
        <h1>Get In Touch</h1>
        <p>We'd love to hear from you! Send us a message and we'll respond as soon as possible.</p>
      </div>

      <div className="contact-content-wrapper">
        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-group">
            <label htmlFor="name">Your Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Your Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              className="form-textarea"
            ></textarea>
          </div>

          <button type="submit" className="contact-button">
            Send Message
          </button>
        </form>

        <div className="contact-info">
          <TeamMember 
            key={member.id}
            name={member.name}
            role={member.role}
            bio={member.bio}
            image={member.image}
            email={member.email}
          />
          
          <div className="contact-divider"></div>
          
          <address className="contact-address">
            <strong>Our Office</strong>
            Str. Example 123<br />
            Bucharest, Romania<br />
            +40 123 456 789
          </address>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;