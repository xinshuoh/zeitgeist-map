import './FocusView.css';

import { useRef, useState } from 'react';

import { Popup as PopupComponent } from 'reactjs-popup';

import { artistCountryHistory, songCountryHistory, songTopCountries } from './Api';

import PopularityLineChart from './PopularityLineChart'
import { X } from 'lucide-react';

interface FocusViewProps {
  focusOptions: any;
  setFocusOptions: any;
  viewPopularityHeatmap: any;
}

const FocusView = ({ focusOptions, setFocusOptions, viewPopularityHeatmap }: FocusViewProps) => {

  const [viewReady, setViewReady] = useState<boolean>(false);
  const [lineData, setLineData] = useState<any>([]);
  const [topCountries, setTopCountries] = useState<any>([]);

  const scrollableRef = useRef<HTMLDivElement>(null);

  let song = focusOptions.song;
  let artist = focusOptions.artist;

  return (
    <div>
      <PopupComponent
        open={focusOptions.isOpen}
        position="top left"
        contentStyle={{
          maxWidth: '1000px',
          width: '100%',
          height: '75vh'
        }}
        modal
        className="overflow-auto"
        onOpen={() => {

          // Reset scroll position to top when opening
          if (scrollableRef.current) {
            scrollableRef.current.scrollTop = 0;
          }

          songCountryHistory(song.song_name).then((v) => {
            v.json().then((d) => {
              setLineData(d);
              setViewReady(true);
            });
          });
          songTopCountries(song.song_name).then((v) => {
            v.json().then((d) => {
              setTopCountries(d || []);
            });
          });
        }}
        onClose={() => {
          console.log("Closing");
          setFocusOptions({ song: undefined, artist: undefined, isOpen: false });
        }}
      >
        {close => {
          return (
            <>
              {
                viewReady ?
                  <div ref={scrollableRef} className="h-full overflow-y-auto pt-4 pl-10 pr-10">
                    <div
                      style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "15px", width: "100%" }}>
                      <div>
                        {/* Display a FocusView for either songs or artists */}

                        {/* Display a header for both songs and artists */}
                        <strong className="viewHeading">{song ? song.song_name : artist}</strong>

                        {/* Display a link to the artist for songs */}
                        <p className="viewSubheading">
                          <span className="viewLink" onClick={() => {
                            setFocusOptions({ isOpen: true, song: undefined, artist: song.artist });

                            artistCountryHistory(song.artist).then((v) => {
                              v.json().then((d) => {
                                setLineData(d);
                                setViewReady(true);
                              });
                            })
                          }}>
                            {song ? song.artist : ""}
                          </span>
                        </p>
                      </div>

                      <button className="self-start cursor-pointer" style={{ color: "#333" }} onClick={() => close()}>
                        <X size={30} />
                      </button>
                    </div>

                    <div className="graph-container">
                      {song ? <PopularityLineChart lineData={lineData} song={song} artist_name={""} /> : <PopularityLineChart lineData={lineData} song={undefined} artist_name={artist} />}
                    </div>

                    <button className="heatmapButton" onClick={viewPopularityHeatmap}>View heatmap</button>

                    <br></br>

                    {topCountries.length &&
                      <div style={{ padding: "10px" }}>
                        <strong style={{ color: '#fff' }}>Global Popularity</strong>
                      </div>
                    }

                    <div className="flex justify-centre" style={{ padding: "10px" }}>
                      <div>
                        <ul>
                          {topCountries.slice(0, 5).map((country: any) =>
                            <li style={{ fontSize: 14, display: "flex", whiteSpace: "nowrap" }}>{country.country_name}: </li>
                          )}
                        </ul>
                      </div>
                      <div>
                        <ul>
                          {topCountries.slice(0, 5).map((country: any) =>
                            <li style={{ fontSize: 14, display: "flex", whiteSpace: "nowrap" }}>&nbsp; #{country.position} in charts</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div> : <p>Loading data...</p>
              }
            </>
          )
        }}
      </PopupComponent>
    </div>
  )
}

export default FocusView;