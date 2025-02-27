import urllib.request
from bs4 import BeautifulSoup
import sqlite3
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import json
from collections import defaultdict
from models import *
from app import app
from datetime import datetime

client_id = 'b0d6aef0a4f846d3afe4dc5ab695bc3b'
client_secret = 'ed600a63a1be4d2f83fc69f2be3169fe'
spotify = spotipy.Spotify(client_credentials_manager=SpotifyClientCredentials(client_id=client_id, client_secret=client_secret))


def fetch_artist_id(name):
    results = spotify.search(q='artist:' + name, type='artist')
    items = results['artists']['items']
    if len(items) > 0:
        artist = items[0]
        return artist['id']
    
def fetch_track_id(name):
    results = spotify.search(q='track:' + name, type='track')
    items = results['tracks']['items']
    if len(items) > 0:
        track = items[0]
        return track['id']
    
@app.cli.command("fetch-historical")
def fetch_historical():
    contents = urllib.request.urlopen(f"https://kworb.net/apple_songs/archive/").read()

    soup = BeautifulSoup(contents, features="html.parser")

    for row in soup.find_all('a')[1:2]: # first row is headings

        date_ = row.text
        contents_1 = urllib.request.urlopen(f"https://kworb.net/apple_songs/archive/{date_}").read()
        soup_1 = BeautifulSoup(contents_1, features="html.parser")

        j = 0
        
        rows = soup_1.find_all('tr')
        popularity = {}
        countries = ["us","uk","jp","de","au","ca","fr","it","kr","mx","ru","th","be","br","ch","cn","co","es","hk","id","ie","in","nl","nz","tr","tw","za","ae","ar","at","cl","cz","dk","ec","ee","eg","fi","gr","hu","il","ke","kz","lb","lt","lu","my","ng","no","pe","ph","pl","pt","ro","sa","se","si","sg","sk","ua","vn"]
        for row in rows[1:11]: # first row is headings
            elems = row.find_all('td')

            j += 1

            #global stats
            pos = elems[0].text
            pos_change = None if elems[1].text in ('NEW', 'RE') else 0 if elems[1].text == '=' else elems[1].text
            temp = elems[2].text.split(" - ")
            artists = temp[0].replace(",", " &")
            artists = artists.split(" & ")

            track = temp[1]
            days = elems[3].text
            pk = elems[4].text
            pk_change = elems[5].text
            pts = elems[6].text
            pts_plus = elems[7].text
            tpts = elems[8].text
            track_link = fetch_track_id(track)
            print(date_, j)
            date_time = datetime.strptime(date_[2:8], '%y%m%d')

            
            #country specific stats

            a_list = []

            s = db.session.execute(db.select(Song).where(Song.spotify_id == track_link)).scalar()
            if not s:
                s = Song(name = track, artists = a_list, spotify_id = track_link)
                db.session.add(s)


            for i in range(9, 69):
                country_pos = elems[i].text
                if country_pos:
                    country_pos = int(country_pos)
                    country = countries[i-9]
                    for artist in artists:
                        #spotify artist id
                        artist_link = fetch_artist_id(artist)
                        
                        if artist_link in popularity:
                            popularity[artist_link][country] += (1 / (1+(country_pos/20)))
                        else:
                            popularity[artist_link] = defaultdict(int)
                            popularity[artist_link][country] += (1 / (1+(country_pos/20)))

                    c = db.session.execute(db.select(Country).where(Country.code == country)).scalar()
                    s_pop = SongHasPopularity(song = s, country = c, position = pos, date = date_time)
                    db.session.add(s_pop)

            for artist in artists:
                a = db.session.execute(db.select(Artist).where(Artist.spotify_id == artist_link)).scalar()
                if not a:
                    #print("Insert")
                    a = Artist(name = artist, songs = [], genres = [], spotify_id = artist_link)
                    db.session.add(a)
                a_list.append(a)


                
        #artist popularity by country
        print(date)
        for artist_key in popularity.keys():
            for country in popularity[artist_key].keys():

                c = db.session.execute(db.select(Country).where(Country.code == country)).scalar()
                a = db.session.execute(db.select(Artist).where(Artist.spotify_id == artist_key)).scalar()

                a_pop = ArtistHasPopularity(artist = a, country = c, position = popularity[artist_key][country], date = date_time) 
                db.session.add(a_pop)

            
        db.session.commit()


