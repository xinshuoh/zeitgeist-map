// spiritual musical home

import { Popup as PopupComponent } from 'reactjs-popup';

import { SpotifyAuth, Scopes } from 'react-spotify-auth';
//import 'react-spotify-auth/dist/index.css'
import { useState } from 'react';
//import { SpotifyApiContext } from 'react-spotify-api'
import Cookies from 'js-cookie';

import './SMH.css';

interface SpiritualMusicalHomeProps {
    visualiseSMH: any;
}

export const SpiritualMusicalHome = ({visualiseSMH}: SpiritualMusicalHomeProps) => {
    const [token, setToken] = useState(Cookies.get("spotifyAuthToken"))
    const [isHovered, setIsHovered] = useState(false);
    const [playlistData, setPlaylistData] = useState([]);
  return (
    <div className='relative flex items-center'>
        <PopupComponent className="smhbox" trigger={        
            <button style= {{ backgroundColor: 'transparent' }}
            onMouseOver={() => setIsHovered(true)}
            onMouseOut={() => setIsHovered(false)}>
            <img src="smh_logo.svg" alt="Find your spiritual musical home"
                onMouseOver={(e) => e.currentTarget.src = 'smh_logo_hover.svg'}
                onMouseOut={(e) => e.currentTarget.src = 'smh_logo.svg'}
                className="cursor-pointer min-w-3 w-7 h-auto" />
        </button>}
            onOpen={() => {
                fetch("https://api.spotify.com/v1/me/playlists", {
                    headers: {
                        'Authorization':  `Bearer ${token}`
                    }
                }).then(res => {
                    res.json().then(data => {
                        const playlists = data.items.filter((item:any) => item.public);
                        setPlaylistData(playlists);
                    });
                });
                
            }}>
            {token ? (() => {
                
                return playlistData.map((item:any) => <button className="songbutton" onClick={() => {
                    visualiseSMH(item.id);
                }}>{item.name}</button>);

                })() :
                    <SpotifyAuth
                        redirectUri='http://localhost:5173/callback'
                        clientID='a33619059e2f4f34b1fb6b4439c75290'
                        scopes={[Scopes.userReadPrivate, Scopes.playlistReadPrivate]} // either style will work
                        onAccessToken={(token: any) => {
                            console.log("Authenticated with Spotify");
                        }}
                        btnClassName='authbutton'
                    />
                }

            </PopupComponent>

            {/* Tooltip - Only visible when hovered */}
            {isHovered && (
                <div className="absolute top-13 transform -translate-x-2/3 bg-gray-100 text-black text-sm px-2 py-1 rounded min-w-50 text-left rounded-lg shadow-lg">
                    Find your spiritual musical home
                </div>
            )}
        </div>
    )
}