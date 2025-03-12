import './FocusView.css';

import { useRef, useState, useEffect } from 'react';

import { Popup as PopupComponent } from 'reactjs-popup';

import { artistCountryHistory, songCountryHistory, songTopCountries, artistTopCountries } from './Api';

import PopularityLineChart from './PopularityLineChart'
import { TrendingUp, X } from 'lucide-react';

interface FocusViewProps {
  focusOptions: any;
  setFocusOptions: any;
  viewPopularityHeatmap: any;
}

const FocusView = ({ focusOptions, setFocusOptions, viewPopularityHeatmap }: FocusViewProps) => {

  // slightly unsatisfactory fix for now - having view ready as true by default (though I don't think viewReady was working anyway)
  const [viewReady, setViewReady] = useState<boolean>(false);
  const [lineData, setLineData] = useState<any>([]);
  const [topCountries, setTopCountries] = useState<any>([]);

  const scrollableRef = useRef<HTMLDivElement>(null);

  let song = focusOptions.song;
  let artist = focusOptions.artist;
  let type = focusOptions.type;

  useEffect(() => {
    if (!focusOptions.isOpen) return; // Only run when popup is open
  
    
  
    if (type == 'song' && song?.song_name) {
      songCountryHistory(song.song_name).then((v) =>
        v.json().then((d) => {
          setLineData(d);
          setViewReady(true);
        })
      );
      songTopCountries(song.song_name).then((v) =>
        v.json().then((d) => {
          setTopCountries(d || []);
        })
      );
    } else if (type == 'artist') {

      artistCountryHistory(artist).then((v) =>
        v.json().then((d) => {
          setLineData(d);
          setViewReady(true);
        })
      );
      artistTopCountries(artist).then((v) =>
        v.json().then((d) => {
          setTopCountries(d || []);
        })
      );
    }
  }, [focusOptions]); // Track changes in focusOptions


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
          setViewReady(false); // Prevent showing old data
          setLineData([]); // Clear previous data
          setTopCountries([]); // Clear previous data

          // Reset scroll position to top when opening
          if (scrollableRef.current) {
            scrollableRef.current.scrollTop = 0;
          }
          if (type=='song') {
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
          } else if (type == 'artist') {
            artistCountryHistory(artist).then((v) => {
              v.json().then((d) => {
                setLineData(d);
                setViewReady(true);
              });
            })
            artistTopCountries(artist).then((v) => {
              v.json().then((d) => {
                setTopCountries(d || []);
              });
            });
          } else {
            alert("attempting to load focusview of unknown type")
          }
        }}
        onClose={() => {
          console.log("Closing");
          setFocusOptions({ song: undefined, artist: undefined, isOpen: false });
        }}
      >
        {close => {
          return (
            <>
              <div style = {{ color : "white", position : 'absolute', top: 10, left: 10}}>{focusOptions.type}</div>
              <button className="self-start cursor-pointer" style={{ color: "#333", position: 'absolute', top: 10, right: 10 }} onClick={() => close()}>
                <X size={30} />
              </button>
              { viewReady ?
                  
                  <div ref={scrollableRef} className="h-full overflow-y-auto pt-4 pl-10 pr-10">
                    <div
                      style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "15px", width: "100%" }}>
                      <div>
                        {/* Display a FocusView for either songs or artists */}

                        {/* Display a header for both songs and artists */}
                        <div className="flex justify-centre">
                          <div><strong className="viewHeading">{type=='song' ? song.song_name : artist}</strong></div>
                          
                        </div>
                        {/* Display a link to the artist for songs */}
                        { type == 'song' &&
                          <p className="viewSubheading">
                          <span className="viewLink" onClick={() => {
                            setFocusOptions({ isOpen: true, artist: song.artist, type: "artist" });
                          }}>
                            {song ? song.artist : ""}
                          </span>
                        </p>
                        }
                        
                      </div>
                    </div>

                    <div className="graph-container">
                      {type=='song' ? <PopularityLineChart lineData={lineData} song={song} artist_name={""} /> : <PopularityLineChart lineData={lineData} song={null} artist_name={artist} />}
                    </div>
                    
                    <button className="heatmapButton" onClick={viewPopularityHeatmap}>View heatmap</button>

                    <br></br>

                    <div className='flex'>
                      {topCountries.length ? (
                        <div>
                        {type == 'song' ? (
                          <div style={{ padding: "10px" }}>
                          <strong style={{ color: '#fff' }}>Global Positions</strong>
                          </div>
                        ) : (
                          <div style={{ padding: "10px" }}>
                          <strong style={{ color: '#fff' }}>Global Popularity Scores</strong>
                          </div>
                        )}
                        <div className="flex justify-centre" style={{ padding: "10px" }}>
                        <div>
                          <ul>
                            {topCountries.slice(0, 5).map((country: any) =>
                              <li style={{ fontSize: 14, display: "flex", whiteSpace: "nowrap", color: "#330033" }}>{country.country_name}: </li>
                            )}
                          </ul>
                        </div>
                        
                        <div>
                          {type=='song' ? (
                            <ul>
                            {topCountries.slice(0, 5).map((country: any) =>
                              <li style={{ fontSize: 14, display: "flex", whiteSpace: "nowrap", color: "#330033" }}>
                                &nbsp;&nbsp; <strong style={{ color: '#330033' }}>#{country.position}</strong>&nbsp;in charts
                                </li>
                            )}
                            </ul>
                          ) : (
                            <ul>
                            {topCountries.slice(0, 5).map((country: any) =>
                              <li style={{ fontSize: 14, display: "flex", whiteSpace: "nowrap", color: "#330033" }}>
                                &nbsp;&nbsp; <strong style={{ color: '#330033' }}>{country.popularity ? country.popularity.toFixed(2) : 0}</strong>&nbsp;popularity score
                                </li>
                            )}
                            </ul>
                          )}
                          
                        </div>
                      </div>
                      </div>
                      ) : ("")}

                      <div className='pl-10'>
                        {(type=="song" && song.genres && song.genres.length) ? (
                          <>
                          <div style={{ padding: "10px" }}>
                            <strong style={{ color: '#fff' }}>Genres</strong>
                          </div>
                          <ul style={{ padding: "10px" }}>
                            {song.genres.slice(0, 5).map((genre: any) =>
                              <li style={{ fontSize: 14, display: "flex", whiteSpace: "nowrap", color: "#330033" }}>{genre} </li>
                            )}
                          </ul>
                          </>
                        ) : ("")}
                        
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