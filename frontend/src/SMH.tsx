// spiritual musical home

import { Popup as PopupComponent } from 'reactjs-popup';

import { SpotifyAuth, Scopes } from 'react-spotify-auth'
//import 'react-spotify-auth/dist/index.css'
import React from 'react'
//import { SpotifyApiContext } from 'react-spotify-api'
import Cookies from 'js-cookie'

import './SMH.css';

export const SpiritualMusicalHome = () => {
    const [token, setToken] = React.useState(Cookies.get("spotifyAuthToken"))
  return (
    <div className='app'>
        <PopupComponent className="smhbox" trigger={        
            <button className="compare">
                Spiritual Musical Home
            </button>}>
            {token ? (async () => {
                const res = await fetch("https://api.spotify.com/v1/me/playlists", {
                    headers: {
                        'Authorization':  `Bearer ${token}`
                    }
                });
                const data = await res.json();

                const playlists = data.items.filter((item:any) => item.public);
                return playlists.map((item:any) => <button className="songbutton" onClick={() => {alert(item.id)}}>{item.name}</button>);

            })() : 
                <SpotifyAuth
                    redirectUri='http://localhost:5173/callback'
                    clientID='a33619059e2f4f34b1fb6b4439c75290'
                    scopes={[Scopes.userReadPrivate, Scopes.playlistReadPrivate]} // either style will work
                    onAccessToken={(token:any) => {
                        console.log("Authenticated with Spotify");
                    }}
                    btnClassName='authbutton'
                />
            }
            
            </PopupComponent>
        
    </div>
  )
}