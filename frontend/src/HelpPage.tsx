import { Popup as PopupComponent } from 'reactjs-popup';
import { useState } from 'react';
import './HelpPage.css';


interface HelpPageProps {
  helpOptions: any;
  setHelpOptions: any;
}

const HelpPage = ({ helpOptions, setHelpOptions }: HelpPageProps) => {
  return (
    <div className="w-[300px] bg-gray-200 rounded-lg shadow-md flex items-center justify-center">
      <PopupComponent
        open={helpOptions.isOpen}
        position="top left"
        contentStyle={{
          maxWidth: '600px',
          width: '90%',
          height: '80%',
        }}
        modal
        onClose={() => {
          console.log("Closing");
          setHelpOptions({ isOpen: false });
        }}
      >
        {(close: () => void) => {
          return (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  padding: "10px",
                }}
              >
                <div>
                  <strong className="viewHeading">Zeitgeist Map FAQs</strong>
                  <h3 className="viewSubheading">
                    What does Zeitgeist Map do?                  </h3>
                  <h4 className="viewSubheading">
                    Zeitgeist Map allows you to explore the popularity of songs and artists across the world. You can view historical data and see where a song or artist is popular today.
                  </h4>
                  <h3 className="viewSubheading">
                    How do the features work?                  </h3>
                    <li>
                        <strong>Country Compare</strong>
                        <p>Compare the popularity of songs and artists between different countries to see where they are most loved.</p>
                        <p>Click the "Compare Countries" button in the task bar, then select the country you wish to compare with the rest of the globe. It will return a heatmap of how similar each country's music listening preferences are to yours!</p>
                    </li>
                    <li>
                        <strong>Popularity Heatmaps</strong>
                        <p>Visualize the popularity of songs and artists on a heatmap to easily identify trends and hotspots.</p>
                        <p>Either search for a song, or select one shown to you a country's sidebar, then click View Heatmap. This displays a heatmap of how popular a song is in the world right now. Use the slider at the bottom of the page to view the historical popularity of this song or artist.</p>
                    </li>
                </div>
                <div
                  className="close"
                  style={{ color: "#333", cursor: "pointer" }}
                  onClick={() => {
                    setHelpOptions({ isOpen: false }); // Close popup via the button
                    close(); // Close the popup as well
                  }}
                >
                  &times;
                </div>
              </div>
            </div>
          );
        }}
      </PopupComponent>
    </div>
  );
};

export default HelpPage;
