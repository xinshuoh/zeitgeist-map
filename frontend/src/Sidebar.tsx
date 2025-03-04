import { ChevronFirst, ChevronLast } from "lucide-react";

import ChartBox from "./ChartBox";
import { useEffect, useRef } from 'react';


const data = [{popularity: 100}, {popularity: 150}, {popularity: 125}, {popularity: 110}];

interface SidebarProps {
    isOpen: boolean;
    toggle: any;
    selectedCountry: any;
    setFocusOptions: any;
}


const Sidebar = ({ isOpen, toggle, selectedCountry, setFocusOptions }: SidebarProps) => {
    const controllerRef = useRef<any>(null);

    useEffect(() => {
        (window as any).onSpotifyIframeApiReady = (IFrameAPI: any) => {

            const element = document.getElementById('embed-iframe');
            // const options = {
            //     uri: 'spotify:track:11dFghVXANMlKmJXsNCbNl' // Default song
            // };

            const callback = (EmbedController: any) => {
                controllerRef.current = EmbedController;
                if (selectedCountry?.songlist?.length) {
                    updateSong();
                }
            };

            IFrameAPI.createController(element, {}, callback);
        };
    }, []);
    
    const updateSong = () => {
        if (!controllerRef.current)  {
            return;
        } else if (!selectedCountry?.songlist?.length) {
            return;
        }

        const songToPlay = selectedCountry.songlist[0];
        if (songToPlay) {
            controllerRef.current.loadUri(`spotify:track:${songToPlay.spotify_id}`);
            controllerRef.current.play();
        }
    };

    useEffect(() => {
        if (controllerRef.current && selectedCountry?.songlist?.length) {
            updateSong();
        }
    }, [selectedCountry]);

    if (selectedCountry == null) return (        
    <div className="relative w-full h-screen flex">
        <div className={`h-full transition-all ${isOpen ? "w-100" : "w-0"} z-1`}>
            <div className={`h-full flex-col bg-white border-r border-gray-300 shadow-lg overflow-y-scroll`}
                style={{ scrollbarWidth: "thin" }}>

                <div className={`border-t flex ${isOpen ? "pt-3 pl-3 pr-3" : "p-0"}`}>
                    <div className={`
                flex justify-center p-4 items-center overflow-hidden transition-all ${isOpen ? "w-100 ml-3" : "w-0"}`}>
                        <span className={`text-2xl text-black font-semibold overflow-hidden transition-all ${isOpen ? "w-full" : "w-0"} `}>Select a country</span>
                    </div>
                </div>

                <div className={`h-70 flex justify-center items-center overflow-hidden ${isOpen ? "w-full pt-4 pb-4 pl-8 pr-8" : "w-0 p-0"}`}>
                    <div className={`bg-gray-400 rounded-md h-full overflow-hidden ${isOpen ? "w-full p-6" : "w-0 p-0"}`}>Chart 1</div>
                </div>

                <div className={`h-70 flex justify-center items-center overflow-hidden ${isOpen ? "w-full pt-4 pb-4 pl-8 pr-8" : "w-0 p-0"}`}>
                    <div className={`bg-gray-400 rounded-md h-full overflow-hidden ${isOpen ? "w-full p-6" : "w-0 p-0"}`}>Chart 2</div>
                </div>

                <div className={`h-70 flex justify-center items-center overflow-hidden ${isOpen ? "w-full pt-4 pb-4 pl-8 pr-8" : "w-0 p-0"}`}>
                    <div className={`bg-gray-400 rounded-md h-full overflow-hidden ${isOpen ? "w-full p-6" : "w-0 p-0"}`}>Chart 3</div>
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
    </div>)

    if (!selectedCountry.songlist.length) {
        return (
            
            <div className="relative w-full h-screen flex">
                
                <div className={`h-full transition-all ${isOpen ? "w-100" : "w-0"} z-1`}>
                    <div className={`h-full flex-col bg-white border-r border-gray-300 shadow-lg overflow-y-scroll`}
                        style={{ scrollbarWidth: "thin" }}>
    
                        <div className={`border-t flex ${isOpen ? "pt-3 pl-3 pr-3" : "p-0"}`}>
                            <div className={`
                        flex justify-center p-4 items-center overflow-hidden transition-all ${isOpen ? "w-100 ml-3" : "w-0"}`}>
                                <span className={`text-2xl text-black font-semibold overflow-hidden transition-all ${isOpen ? "w-full" : "w-0"} `}>{selectedCountry.countryName}</span>
                            </div>
                        </div>

                        <div className="w-full flex justify-center p-4">
                            <div className="w-[300px] bg-gray-200 rounded-lg shadow-md flex items-center justify-center">
                                <script src="https://open.spotify.com/embed/iframe-api/v1" async></script>
                                <div id="embed-iframe"></div>
                            </div>
                        </div>
                        
                        <div className="w-full flex justify-center p-4">
                            <div className="w-[300px] bg-gray-200 rounded-lg shadow-md flex items-center justify-center">
                                <h2>Unfortunately we don't have data for {selectedCountry.countryName} right now</h2>
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

    return (
        <div className="relative w-full h-screen flex">
            <div className={`h-full transition-all ${isOpen ? "w-100" : "w-0"} z-1`}>
                <div className={`h-full flex-col bg-white border-r border-gray-300 shadow-lg overflow-y-scroll min-h-[calc(100%+40px)]`}
                    style={{ scrollbarWidth: "thin" }}>

                    <div className={`border-t flex ${isOpen ? "pt-3 pl-3 pr-3" : "p-0"}`}>
                        <div className={`
                    flex justify-center p-4 items-center overflow-hidden transition-all ${isOpen ? "w-100 ml-3" : "w-0"}`}>
                            <span className={`text-2xl text-black font-semibold overflow-hidden transition-all ${isOpen ? "w-full" : "w-0"} `}>{selectedCountry.countryName}</span>
                        </div>
                    </div>

                    <div className="w-full flex justify-center p-4">
                        <div className="w-[300px] bg-gray-200 rounded-lg shadow-md flex items-center justify-center">
                            <script src="https://open.spotify.com/embed/iframe-api/v1" async></script>
                            <div id="embed-iframe"></div>
                        </div>
                    </div>
                    
                    
                  {selectedCountry.songlist.slice(0, 5).map((song: any) => 
                    <div className="w-full flex justify-center p-4 rounded-lg" onClick={() => {setFocusOptions({isOpen: true, song: song})}}>
                        
                        <ChartBox isOpen={isOpen} song={song}></ChartBox>
                        
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