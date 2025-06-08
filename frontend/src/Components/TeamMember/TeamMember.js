import React from 'react';
import './TeamMember.css';
import { FaEnvelope } from 'react-icons/fa';

const TeamMember = ({ name, role, bio, image, email }) => {
  return (
    <div className="team-member">
      <div className="member-avatar">
        <img src={image} alt={name} className="member-image" />
      </div>
      <h3>{name}</h3>
      <p className="member-role">{role}</p>
      <p className="member-bio">{bio}</p>
      <div className="member-email">
        <FaEnvelope className="email-icon" />
        <a href={`mailto:${email}`}>{email}</a>
      </div>
    </div>
  );
};

export default TeamMember;