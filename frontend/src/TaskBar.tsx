import './TaskBar.css';
import { SearchBar } from './components/SearchBar';

interface TaskBarProps {
  onCountryCompare: () => void;
  setFocusOptions: any;
  autocomplete: any;
}

const TaskBar: React.FC<TaskBarProps> = ({ autocomplete, onCountryCompare, setFocusOptions }) => {



  return (
    <div id="global">
      <div id="taskbar" className="taskbar h-22 items-center">
        <button className="logo-button" onClick={() => alert('logo clicked')}>
          <img src="/zeitgeistlogo.png" alt="Zeitgeist Map" className="logo-image w-25" />
        </button>


        <SearchBar
          onSelect={(item) => console.log(item)}
          setFocusOptions={setFocusOptions}
          autocomplete={autocomplete} />

        <button className="compare-button" onClick={onCountryCompare}>
          <img src="/countrycomparelogo2.png" alt="Zeitgeist Map" className="logo-image" />
        </button>
      </div>
    </div>
  );
};

export default TaskBar;