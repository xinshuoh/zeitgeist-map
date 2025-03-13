import './TaskBar.css';
import './HelpPage.tsx';
import HelpPage from './HelpPage';
import { SearchBar } from './components/SearchBar';
import { CountryCompareStatus } from './App';
import { useState } from 'react';
import { SpiritualMusicalHome } from './SMH.tsx';
import { Popup as PopupComponent } from 'reactjs-popup';

interface TaskBarProps {
  onCountryCompare: () => void;
  setFocusOptions: any;
  setHelpOptions: any;
  autocomplete: any;
  countryCompareStatus: CountryCompareStatus;
  visualiseSMH: any;
}

const TaskBar: React.FC<TaskBarProps> = ({ autocomplete, countryCompareStatus, onCountryCompare, setFocusOptions, setHelpOptions: setHelpOptionsProp, visualiseSMH }) => {
  const [helpOptions, setHelpOptions] = useState({ isOpen: false });


  return (
    <div id="global">
      <div id="taskbar" className="taskbar flex justify-between w-[100vw] h-20 p-[18px] bg-[#330033]">
        <div className="logo-help-group flex items-center p-5">
          <img src="ZM.gif" alt="Zeitgeist Map" className="logo-image w-10 h-auto" />

          <button className="help-button" onClick={() => { setHelpOptions({ isOpen: true }) }}>
            <img src="help-512.png" alt="Help Page" className="min-w-3 w-7 h-auto" />
          </button>
        </div>

        <div className="search-container">
          <SearchBar
            onSelect={(item) => console.log(item)}
            setFocusOptions={setFocusOptions}
            autocomplete={autocomplete} />
        </div>

        <div className="flex justify-between gap-8 mr-5">
          <SpiritualMusicalHome visualiseSMH={visualiseSMH}/>

          <PopupComponent trigger={
            <button style= {{ backgroundColor: 'transparent' }}
              onClick={onCountryCompare}>
              <img src="compare.svg" alt="Country compare"
                onMouseOver={(e) => e.currentTarget.src = 'compare_hover.svg'}
                onMouseOut={(e) => e.currentTarget.src = 'compare.svg'}
                className="cursor-pointer min-w-3 w-7 h-auto]" />

            </button>
          }
            closeOnDocumentClick
            on="hover"
            keepTooltipInside
            contentStyle={{
              fontSize: '14px',
              backgroundColor: 'var(--color-gray-100)',
              color: 'black',
              borderRadius: '0.5rem',
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              width: "14rem",
              minWidth: "12rem",
              height: "auto",
              margin: "0px",
              padding: "0.5rem",
              boxShadow: "var(--shadow-lg)",
              borderWidth: "0px"
            }}
          >
            <span>
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
            </span>
          </PopupComponent>
        </div>
      </div>
      {helpOptions.isOpen && <HelpPage helpOptions={helpOptions} setHelpOptions={setHelpOptions} />}

    </div>
  );
};

export default TaskBar;