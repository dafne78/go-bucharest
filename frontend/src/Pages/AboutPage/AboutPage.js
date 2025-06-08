import React from 'react';
import './About.css';
import { teamMembers } from '../../assets/events';
import TeamMember from '../../Components/TeamMember/TeamMember';
import { FaLaptopCode, FaLightbulb, FaUserTie } from 'react-icons/fa';

const AboutPage = () => {
  return (
    <div className="about-container">
      {/* Hero Section */}
      <div className="about-hero">
        <h1>About Go Bucharest</h1>
        <p>Discover the story behind your perfect night out</p>
      </div>

      {/* Our Story Section */}
      <section className="about-section" id="our-story">
        <div className="section-header">
          <FaLightbulb className="section-icon" />
          <h2>Our Story</h2>
        </div>
        <div className="section-content">
          <p>
            Go Bucharest was born from the frustration of planning memorable nights out. 
            As students with limited budgets, we struggled to find reliable information 
            about venues, events, and prices in our vibrant city.
          </p>
          <p>
            What started as a simple spreadsheet of our favorite spots evolved into 
            this platform that now helps thousands discover Bucharest's nightlife. 
            We analyze venues, curate events, and provide transparent pricing so 
            you can focus on creating unforgettable memories.
          </p>
        </div>
      </section>

      {/* Team Section */}
      <section className="about-section" id="team">
        <div className="section-header">
          <FaUserTie className="section-icon" />
          <h2>Our Team</h2>
        </div>
        <div className="team-grid">
          {teamMembers.map(member => (
            <TeamMember 
              key={member.id}
              name={member.name}
              role={member.role}
              bio={member.bio}
              image={member.image}
              email={member.email}
            />
          ))}
        </div>
      </section>

      {/* Careers Section */}
      <section className="about-section" id="careers">
        <div className="section-header">
          <FaLaptopCode className="section-icon" />
          <h2>Careers</h2>
        </div>
        <div className="section-content careers-content">
          <p>🚀 We're not hiring right now, but great things are coming!</p>
          <p>
            👀 Stay tuned for future opportunities to join our mission of making 
            Bucharest's nightlife accessible to everyone.
          </p>
          <p>
            💡 In the meantime, follow us on social media for updates and nightlife tips!
          </p>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;