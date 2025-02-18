import React from 'react';
import './TaskBar.css';

const TaskBar: React.FC = () => {
  return (
    <div className="taskbar">
        <button className="logo-button" onClick={() => alert('logo clicked')}>
            <img src="/zeitgeistlogo.png" alt="Zeitgeist Map" className="logo-image" />
        </button>
      <button className="search-button" onClick={() => alert('Button 2 clicked')}>Will be a search bar</button>
      <button className="compare-button" onClick={() => alert('Button 3 clicked')}>
      <img src="/countrycomparelogo.png" alt="Zeitgeist Map" className="logo-image" />
      </button>
    </div>
  );
};

export default TaskBar;