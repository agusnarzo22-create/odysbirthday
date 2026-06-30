import React from 'react';

const Navigation = ({ activeSection, sections }) => {
  const handleClick = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="nav-dots">
      {sections.map((sec) => (
        <button
          key={sec.id}
          className={`nav-dot-btn ${activeSection === sec.id ? 'active' : ''}`}
          onClick={() => handleClick(sec.id)}
          aria-label={`Scroll to ${sec.label}`}
          title={sec.label}
        >
          <span className="dot-label">{sec.label}</span>
          <span className="dot-circle" />
        </button>
      ))}
    </div>
  );
};

export default Navigation;
