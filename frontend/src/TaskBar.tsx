import './TaskBar.css';
import { SearchBar } from './components/SearchBar';
import { CountryCompareStatus } from './App';

interface TaskBarProps {
  onCountryCompare: () => void;
  setFocusOptions: any;
  autocomplete: any;
  countryCompareStatus: CountryCompareStatus;
}

const TaskBar: React.FC<TaskBarProps> = ({ autocomplete, countryCompareStatus, onCountryCompare, setFocusOptions }) => {



  return (
    <div id="global">
      <div id="taskbar" className="taskbar flex  box-border t-0 justify-between w-[100vw] p-[18px] bg-[#330033] bg-opacity-0.7 h-18 items-center text-white z-1">
        <button className="logo-button" onClick={() => alert('logo clicked')}>
          <img src="/zeitgeistlogo.png" alt="Zeitgeist Map" className="logo-image w-25" />
        </button>

        <div className="search-container">
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
    </div>
  );
};

export default TaskBar;