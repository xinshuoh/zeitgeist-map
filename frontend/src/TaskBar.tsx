import React from 'react';
import './TaskBar.css';

interface TaskBarProps {
  onCountryCompare: () => void
  autocomplete: any;
}

// const TaskBar: React.FC<TaskbarProps> = ({ onCountryCompare }) => {
// interface TaskBarProps {
//   autocomplete: any;
// }

const TaskBar: React.FC<TaskBarProps> = ({autocomplete, onCountryCompare}) => {
  const [autocompleteOptions, setAutocompleteOptions] = React.useState<any>([]);

  return (
    <div id="taskbar" className="taskbar">
      <button className="logo-button" onClick={() => alert('logo clicked')}>
          <img src="/zeitgeistlogo.png" alt="Zeitgeist Map" className="logo-image" />
      </button>

      <input type="text" list="search-autocomplete" className="search-button p-2 rounded-lg" placeholder="Search through songs/artists/genres here..." 
        onKeyDown={(event) => { 
          if (event.key === 'Enter') {
            alert(`Searching for: ${event.currentTarget.value}`); //add api integration
          }
        }} 

        onKeyUp={async (event) => {
          
          var res = await autocomplete(event.currentTarget.value);
          setAutocompleteOptions(res.map((x:any) => <option value={x}></option>));
          console.log(autocompleteOptions);

        }}
      />
      
      <datalist id="search-autocomplete">
        {autocompleteOptions}
      </datalist>
      <button className="compare-button" onClick={onCountryCompare}>
      <img src="/countrycomparelogo2.png" alt="Zeitgeist Map" className="logo-image" />
      </button>
    </div>
  );
};

export default TaskBar;