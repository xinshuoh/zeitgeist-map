import { ChevronFirst, ChevronLast } from "lucide-react";

import ChartBox from "./ChartBox";
import { useEffect, useRef } from 'react';

interface SidebarProps {
    isOpen: boolean;
    toggle: any;
    selectedCountry: any;
    setFocusOptions: any;
}

const Sidebar = ({ isOpen, toggle, selectedCountry, setFocusOptions }: SidebarProps) => {
    const controllerRef = useRef<any>(null);

    // happens on initialisation
    useEffect(() => {
        // setFocusOptions({song: null, artist: null, isOpen: false})
        (window as any).onSpotifyIframeApiReady = (IFrameAPI: any) => {

            const element = document.getElementById('embed-iframe');
            const options = {
                uri: 'spotify:track:11dFghVXANMlKmJXsNCbNl',  // Default song
            };

            const callback = (EmbedController: any) => {
                controllerRef.current = EmbedController;
                if (selectedCountry?.songList?.length) {
                    updateSong();
                }
            };

            IFrameAPI.createController(element, options, callback);
        };
    }, []);

    const updateSong = () => {
        if (!controllerRef.current) {
            return;
        } else if (!selectedCountry?.songList?.length) {
            return;
        }

        const songToPlay = selectedCountry.songList[0];
        if (songToPlay) {
            controllerRef.current.loadUri(`spotify:track:${songToPlay.spotify_id}`);
            controllerRef.current.play();
        }
    };

    // happens each time selectedCountry changes
    useEffect(() => {
        if (controllerRef.current && selectedCountry?.songList?.length) {
            updateSong();
        }
    }, [selectedCountry]);


    return (
        <div className="relative w-full h-screen flex">

            <div className={`h-full transition-all ${isOpen ? "w-100" : "w-0"} z-1`}>
                <div className={`h-full flex-col border-r border-gray-300 shadow-lg overflow-y-scroll`}
                    style={{ scrollbarWidth: "thin", backgroundColor: '#e0a7bb' }}>

                    <div className={`border-t flex ${isOpen ? "pt-3 pl-3 pr-3" : "p-0"}`}>
                        <div className={`
                    flex justify-center p-4 items-center overflow-hidden transition-all ${isOpen ? "w-100 ml-3" : "w-0"}`}>
                            <span className={`text-2xl font-semibold overflow-hidden transition-all ${isOpen ? "w-full" : "w-0"} `} style={{ color: '#330033' }}></span>
                        </div>
                    </div>

                    <div className="w-full flex justify-center p-4 ">
                        <div className="w-[300px] rounded-lg shadow-md flex items-center justify-center border-5 border-white bg-white opacity-70" style={{ backgroundColor: '#fff', opacity : selectedCountry?.songList.length ? '100%' : '70%' }}>
                            <script src="https://open.spotify.com/embed/iframe-api/v1" async></script>
                            <div id="embed-iframe"></div>
                        </div>
                    </div>

                    {/* {display only this if the country has not loaded at all} */}
                    {selectedCountry?.countryName == 'loading...' ? (
                         <div className="w-full flex justify-center p-4">
                         <div className="w-[300px] rounded-lg shadow-md flex items-center justify-center p-4" style={{ backgroundColor: '#fff' }}>
                             <h2 style={{ color: '#361836' }}>No country selected</h2>
                         </div>
                        </div>
                    ) : (
                        <>
                        {(!selectedCountry?.songList.length) ? (
                            <div className="w-full flex justify-center p-4">
                            <div className="w-[300px] rounded-lg shadow-md flex items-center justify-center p-4" style={{ backgroundColor: '#fff' }}>
                                <h2 style={{ color: '#361836' }}>Unfortunately we don't have song data for {selectedCountry?.countryName} right now</h2>
                            </div>
                            </div>
                        ) : (
                            <>
                            <div style={{ color: "white" }}>Top Songs</div>
                            
                            {selectedCountry?.songList.slice(0, 5).map((song: any) =>
                                <div className="w-full flex justify-center p-4 rounded-lg" onClick={() => { setFocusOptions({ isOpen: true, song: song, type: 'song'}) }}>
                                    <ChartBox isOpen={isOpen} song={song} artist={null}></ChartBox>
                                </div>
                            )}
                            
                            <br></br> 
                            </>
                        )}
                        {(selectedCountry?.artistList.length) && (
                            <>
                            <div style={{ color: "white" }}>Top Artists</div>

                            {selectedCountry?.artistList.slice(0, 5).map((artist: any) =>
                                <div className="w-full flex justify-center p-4 rounded-lg" onClick={() => { setFocusOptions({ isOpen: true, artist: artist.artist_name, type: 'artist' }) }}>
                                    <ChartBox isOpen={isOpen} song={null} artist={artist}></ChartBox>
                                </div>
                            )}
                            </>
                        )
                        }
                        </>
                    )}
                    {/* {empty div designed to ensure scrollbar works properly} */}
                   <div style = {{ minHeight: 80 }}></div>

                </div>
            </div>

            <div className="absolute top-1/2 -translate-y-[160%] bg-transparent h-[5%] rounded-lg flex">
                <div className={`bg-transparent h-full overflow-hidden transition-all ${isOpen ? "w-100" : "w-0"}`}></div>
                <button className={`position: relative rounded-r-lg h-15 text-bold text-gray-500 bg-white border-l-[#e3e3e3] cursor-pointer p-1 transition-all 
             shadow-[0_1px_2px_rgba(60,64,67,0.3),0_2px_6px_2px_rgba(60,64,67,0.15)] z-[-1]`}
                    onClick={toggle}>
                    {isOpen ? <ChevronFirst size={20} /> : <ChevronLast size={20} />}
                </button>
            </div>
        </div>

    );




    // if country has no data
    if (!selectedCountry?.songList.length) {
        return (
            <div className="relative w-full h-screen flex">

                <div className={`h-full transition-all ${isOpen ? "w-100" : "w-0"} z-1`}>
                    <div className={`h-full flex-col border-r border-gray-300 shadow-lg overflow-y-scroll`}
                        style={{ scrollbarWidth: "thin", backgroundColor: '#e0a7bb' }}>

                        <div className={`border-t flex ${isOpen ? "pt-3 pl-3 pr-3" : "p-0"}`}>
                            <div className={`
                        flex justify-center p-4 items-center overflow-hidden transition-all ${isOpen ? "w-100 ml-3" : "w-0"}`}>
                                <span className={`text-2xl font-semibold overflow-hidden transition-all ${isOpen ? "w-full" : "w-0"} `} style={{ color: '#330033' }}>{selectedCountry?.countryName}</span>
                            </div>
                        </div>

                        <div className="w-full flex justify-center p-4">
                            <div className="w-[300px] rounded-lg shadow-md flex items-center justify-center border-5 border-white opacity-25" style={{ backgroundColor: '#fff' }}>
                                <script src="https://open.spotify.com/embed/iframe-api/v1" async></script>
                                <div id="embed-iframe"></div>
                            </div>
                        </div>

                        <div className="w-full flex justify-center p-4">
                            <div className="w-[300px] rounded-lg shadow-md flex items-center justify-center p-4" style={{ backgroundColor: '#fff' }}>
                                <h2 style={{ color: '#361836' }}>Unfortunately we don't have data for {selectedCountry?.countryName} right now</h2>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="absolute top-1/2 -translate-y-[160%] bg-transparent h-[5%] rounded-lg flex">
                    <div className={`bg-transparent h-full overflow-hidden transition-all ${isOpen ? "w-100" : "w-0"}`}></div>
                    <button className={`position: relative rounded-r-lg h-15 text-bold text-gray-500 bg-white border-l-[#e3e3e3] cursor-pointer p-1 transition-all 
                 shadow-[0_1px_2px_rgba(60,64,67,0.3),0_2px_6px_2px_rgba(60,64,67,0.15)] z-[-1]`}
                        onClick={toggle}>
                        {isOpen ? <ChevronFirst size={20} /> : <ChevronLast size={20} />}
                    </button>
                </div>
            </div>

        );
    }

    // normal version
    return (
        <div className="relative w-full h-screen flex shadow-md">
            <div className={`h-full transition-all ${isOpen ? "w-100" : "w-0"} z-1`}>
                <div className={`h-full flex-col border-r border-gray-300 shadow-lg overflow-y-scroll min-h-[calc(100%+40px)]`}
                    style={{ scrollbarWidth: "thin", backgroundColor: '#e0a7bb' }}>

                    <div className={`border-t flex ${isOpen ? "pt-3 pl-3 pr-3" : "p-0"}`}>
                        <div className={`flex justify-center p-4 items-center overflow-hidden transition-all ${isOpen ? "w-100 ml-3" : "w-0"}`}>
                            <span className={`text-2xl font-semibold overflow-hidden transition-all ${isOpen ? "w-full" : "w-0"} `} style={{ color: '#330033' }}>{selectedCountry?.countryName}</span>
                        </div>
                    </div>

                    <div className="w-full flex justify-center p-4">
                        <div className="w-[300px] rounded-lg shadow-md flex items-center justify-center border-5 border-white" style={{ backgroundColor: '#fff' }}>
                            <script src="https://open.spotify.com/embed/iframe-api/v1" async></script>
                            <div id="embed-iframe"></div>
                        </div>
                    </div>

                    <div style={{ color: "white" }}>Top Songs</div>

                    {selectedCountry?.songList.slice(0, 5).map((song: any) =>
                        <div className="w-full flex justify-center p-4 rounded-lg" onClick={() => { setFocusOptions({ isOpen: true, song: song }) }}>
                            <ChartBox isOpen={isOpen} song={song} artist={null}></ChartBox>
                        </div>
                    )}

                    <br></br>
                    <div style={{ color: "white" }}>Top Artists</div>

                    {selectedCountry?.artistList.slice(0, 5).map((artist: any) =>
                        <div className="w-full flex justify-center p-4 rounded-lg" onClick={() => { setFocusOptions({ isOpen: true, artist: artist.artist_name }) }}>
                            <ChartBox isOpen={isOpen} song={null} artist={artist}></ChartBox>
                        </div>
                    )}

                </div>
            </div>

            <div className="absolute top-1/2 -translate-y-[160%] bg-transparent h-[5%] rounded-lg flex">
                <div className={`bg-transparent h-full overflow-hidden transition-all ${isOpen ? "w-100" : "w-0"}`}></div>
                <button className={`position: relative rounded-r-lg h-15 text-bold text-gray-500 bg-white border-l-[#e3e3e3] cursor-pointer p-1 transition-all 
             shadow-[0_1px_2px_rgba(60,64,67,0.3),0_2px_6px_2px_rgba(60,64,67,0.15)] z-[-1]`}
                    onClick={toggle}>
                    {isOpen ? <ChevronFirst size={20} /> : <ChevronLast size={20} />}
                </button>
            </div>
        </div>

    );
};

export default Sidebar;