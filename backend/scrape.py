import urllib.request
from bs4 import BeautifulSoup
import sqlite3
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import json
from collections import defaultdict

client_id = 'b0d6aef0a4f846d3afe4dc5ab695bc3b'
client_secret = 'ed600a63a1be4d2f83fc69f2be3169fe'
spotify = spotipy.Spotify(client_credentials_manager=SpotifyClientCredentials(client_id=client_id, client_secret=client_secret))


def fetch_artist_id(name):
    results = spotify.search(q='artist:' + name, type='artist')
    items = results['artists']['items']
    if len(items) > 0:
        artist = items[0]
        #print(artist)
        #print(artist['name'], artist['id'])
        return artist['id']
    
def fetch_track_id(name):
    results = spotify.search(q='track:' + name, type='track')
    items = results['tracks']['items']
    if len(items) > 0:
        track = items[0]
        #print(artist)
        #print(artist['name'], artist['id'])
        return track['id']
    


#conn = sqlite3.connect("../zeitgeist.sqlite")

#cur = conn.cursor()


def fetch_historical():
    contents = urllib.request.urlopen(f"https://kworb.net/apple_songs/archive/").read()

    soup = BeautifulSoup(contents, features="html.parser")

    for row in soup.find_all('a')[1:2]: # first row is headings

        date = row.text
        contents_1 = urllib.request.urlopen(f"https://kworb.net/apple_songs/archive/{date}").read()
        soup_1 = BeautifulSoup(contents_1, features="html.parser")

        #insert_stmt = ("INSERT INTO daily_charts" 
        #    "(country,pos,pos_change,artist,title,artist_link,title_link,days,peak,peak_x,streams,streams_change,week,week_change,total)" 
        #    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")

        # clear previous entries
        #cur.execute("DELETE FROM daily_charts WHERE country = ?", (country,))
        
        rows = soup_1.find_all('tr')
        popularity = {}
        countries = ["US","UK","JP","DE","AU","CA","FR","IT","KR","MX","RU","TH","BE","BR","CH","CN","CO","ES","HK","ID","IE","IN","NL","NZ","TR","TW","ZA","AE","AR","AT","CL","CZ","DK","EC","EE","EG","FI","GR","HU","IL","KE","KZ","LB","LT","LU","MY","NG","NO","PE","PH","PL","PT","RO","SA","SE","SI","SG","SK","UA","VN"]
        for row in rows[1:]: # first row is headings
            elems = row.find_all('td')

            #global stats
            pos = elems[0].text
            pos_change = None if elems[1].text in ('NEW', 'RE') else 0 if elems[1].text == '=' else get_num(elems[1].text)
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
            track_id = fetch_track_id(track)
        

            #country specific stats
            for i in range(9, 69):
                country_pos = elems[i].text
                country = countries[i-9]
                if artist_id in popularity:
                    popularity[artist_id][country] += 1 / (1+(country_pos/20))
                else:
                    popularity[artist_id] = defaultdict(int)
                    popularity[artist_id][country] += 1 / (1+(country_pos/20))

            for artist in artists:
                artist_id = fetch_artist_id(artist)
                #insert

            #cur.execute(insert_stmt, 
            #    (country, pos, pos_change, artist, track, artist_link, track_link, days, peak, peak_x, streams, streams_change, week, week_change, total)
            #)

        #artist popularity by country
        for artist_key in popularity.keys():
            for country in popularity[artist_key].keys():
                #insert artist_key country popularity[artist_key][country]
                continue
        #conn.commit()



# removed gl = greenland
countries = ['ae', 'ar', 'at', 'au', 'be', 'bg', 'bo', 'br', 'by', 'ca', 'ch', 'cl', 'co', 'cr', 'cy', 'cz', 'de', 'dk', 'do', 'ec', 'ee', 'eg', 'es', 'fi', 'fr', 'gb', 'gr', 'gt', 'hk', 'hn', 'hu', 'id', 'ie', 'il', 'in', 'is', 'it', 'jp', 'kr', 'kz', 'lt', 'lu', 'lv', 'ma', 'mt', 'mx', 'my', 'ng', 'ni', 'nl', 'no', 'nz', 'pa', 'pe', 'ph', 'pk', 'pl', 'pt', 'py', 'ro', 'ru', 'sa', 'se', 'sg', 'sk', 'sv', 'th', 'tr', 'tw', 'ua', 'us', 'uy', 've', 'vn', 'za']
#for country in countries:
    #fetch_country(country)

#fetch_historical()

#cur.close()
#conn.close()
