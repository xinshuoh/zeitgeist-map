import React from 'react';
import './TaskBar.css';

interface TaskbarProps {
  onCountryCompare: () => void
}

const TaskBar: React.FC<TaskbarProps> = ({ onCountryCompare }) => {
  return (
    <div id="taskbar" className="taskbar">
      <button className="logo-button" onClick={() => alert('logo clicked')}>
          <img src="/zeitgeistlogo.png" alt="Zeitgeist Map" className="logo-image" />
      </button>
      <input type="text" className="search-button" placeholder="Search through songs/artists/genres here..." 
        onKeyDown={(event) => { if (event.key === 'Enter') {
            alert(`Searching for: ${event.currentTarget.value}`); //add api integration
          }
        }} 
      />
      <button className="compare-button" onClick={onCountryCompare}>
      <img src="/countrycomparelogo2.png" alt="Zeitgeist Map" className="logo-image" />
      </button>
    </div>
  );
};

export default TaskBar;