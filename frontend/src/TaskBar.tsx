import './TaskBar.css';
import './HelpPage.tsx';
import HelpPage from './HelpPage';
import { SearchBar } from './components/SearchBar';
import { CountryCompareStatus } from './App';
import { useState } from 'react';

interface TaskBarProps {
  onCountryCompare: () => void;
  setFocusOptions: any;
  setHelpOptions: any;
  autocomplete: any;
  countryCompareStatus: CountryCompareStatus;
}

const TaskBar: React.FC<TaskBarProps> = ({ autocomplete, countryCompareStatus, onCountryCompare, setFocusOptions, setHelpOptions: setHelpOptionsProp }) => {
  const [helpOptions, setHelpOptions] = useState({ isOpen: false });


  return (
    <div id="global">
      <div id="taskbar" className="taskbar flex  box-border t-0 justify-between w-[100vw] p-[18px] bg-[#330033] bg-opacity-0.7 h-18 items-center text-white z-1">
        <div className="logo-help-group flex items-center">
          <button className="logo-button" onClick={() => alert('logo clicked')}>
            <img src="/zeitgeistlogo.png" alt="Zeitgeist Map" className="logo-image w-25" />
          </button>

          <button className="help-button" onClick={() => {setHelpOptions({isOpen: true})}}>
            <img src="/help-512.png" alt="Help Page" className="w-7 h-7" />
          </button>
        </div>

        <div className="search-container left-110">
          <SearchBar
            onSelect={(item) => console.log(item)}
            setFocusOptions={setFocusOptions}
            autocomplete={autocomplete} />
        </div>

        <button className="compare"
          onClick={onCountryCompare}>
          {(() => {
            switch (countryCompareStatus) {
              case CountryCompareStatus.Active:
                return "Close country compare"
              case CountryCompareStatus.Selecting:
                return <>Click a country to compare against<br />Click here again to cancel</>
              case CountryCompareStatus.Disabled:
                return "Activate country compare"
            }
          })()}
        </button>
      </div>
      {helpOptions.isOpen && <HelpPage helpOptions={helpOptions} setHelpOptions={setHelpOptions} />}

    </div>
  );
};

export default TaskBar;