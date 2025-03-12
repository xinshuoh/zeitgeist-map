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


#####
#spotify-api, no longer in use
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
#####
    
@app.cli.command("fetch-historical")
def fetch_historical():
    contents = urllib.request.urlopen(f"https://kworb.net/apple_songs/archive/").read()

    soup = BeautifulSoup(contents, features="html.parser")

    countries = ["us","gb","jp","de","au","ca","fr","it","kr","mx","ru","th","be","br","ch","cn","co","es","hk","id","ie","in","nl","nz","tr","tw","za","ae","ar","at","cl","cz","dk","ec","ee","eg","fi","gr","hu","il","ke","kz","lb","lt","lu","my","ng","no","pe","ph","pl","pt","ro","sa","se","si","sg","sk","ua","vn"]

    for row in soup.find_all('a')[-1:-21:-1]: # first row is headings
        date_ = row.text
        print(date_)
        
        contents_1 = urllib.request.urlopen(f"https://kworb.net/apple_songs/archive/{date_}").read()
        soup_1 = BeautifulSoup(contents_1, features="html.parser")

        rows = soup_1.find_all('tr')
        popularity = {}
        
        for row_ in rows[1:]: # first row is headings
            elems = row_.find_all('td')
        
            ###global stats
            pos = elems[0].text
            #pos_change = None if elems[1].text in ('NEW', 'RE') else 0 if elems[1].text == '=' else elems[1].text
            temp = elems[2].text.split(" - ")
            artists = temp[0].replace(",", " &")
            artists = artists.split(" & ")

            track = temp[1]
            #days = elems[3].text
            #pk = elems[4].text
            #pk_change = elems[5].text
            #pts = elems[6].text
            #pts_plus = elems[7].text
            #tpts = elems[8].text
            
            date_time = datetime.strptime(date_[2:8], '%y%m%d')

            a_list = []
            for artist in artists:
                a = db.session.execute(db.select(Artist).where(Artist.name == artist)).scalar()
                if not a:
                    a = Artist(name = artist, songs = [])
                    db.session.add(a)

                a_list.append(a)

            s = db.session.execute(db.select(Song).where(Song.name == track)).scalar()
            if not s:
                s = Song(name = track, artists = a_list)
                db.session.add(s)

            ###global popularity
            c = db.session.execute(db.select(Country).where(Country.code == "glb")).scalar()
            # s_pop = db.session.execute(db.select(SongHasPopularity).where(SongHasPopularity.song_id == s.id, SongHasPopularity.country_id == c.id, SongHasPopularity.date == date_time)).scalar()
            # if not s_pop:
            s_pop = SongHasPopularity(song = s, country = c, position = pos, date = date_time)
            db.session.add(s_pop)

            #country specific stats
            for i in range(9, 69):
                country_pos = elems[i].text
                if country_pos:
                    country_pos = int(country_pos)
                    country = countries[i-9]
                    for artist in artists:
                        
                        if artist in popularity:
                            popularity[artist][country] += (1 / (country_pos + 47.45) ** 1.11)
                        else:
                            popularity[artist] = defaultdict(int)
                            popularity[artist][country] += (1 / (country_pos + 47.45) ** 1.11)

                    c = db.session.execute(db.select(Country).where(Country.code == country)).scalar()
                    # s_pop = db.session.execute(db.select(SongHasPopularity).where(SongHasPopularity.song_id == s.id, SongHasPopularity.country_id == c.id, SongHasPopularity.date == date_time)).scalar()
                    # if not s_pop:
                    s_pop = SongHasPopularity(song = s, country = c, position = country_pos, date = date_time)
                    db.session.add(s_pop)

        # Normalise 
        temp = {country: defaultdict(int) for country in countries}
        for artist in popularity:
            for country in popularity[artist]:
                temp[country][artist] = popularity[artist][country]

        normalising_constants = defaultdict(int)
        for country in temp:
            normalising_constants[country] = max(temp[country].values(), default=0)

        #artist popularity by country
        for artist_key in popularity.keys():
            for country in popularity[artist_key].keys():
                c = db.session.execute(db.select(Country).where(Country.code == country)).scalar()
                a = db.session.execute(db.select(Artist).where(Artist.name == artist_key)).scalar()

                # a_pop = db.session.execute(db.select(ArtistHasPopularity).where(ArtistHasPopularity.artist_id == a.id, ArtistHasPopularity.country_id == c.id, ArtistHasPopularity.date == date_time)).scalar()
                # if not a_pop:
                a_pop = ArtistHasPopularity(artist = a, country = c, popularity = popularity[artist_key][country] / normalising_constants[country], date = date_time) 
                db.session.add(a_pop)

        db.session.commit()
        print("Fetched", date_)
