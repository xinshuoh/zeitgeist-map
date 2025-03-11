from bs4 import BeautifulSoup
from collections import defaultdict
import datetime as dt
import json
from pprint import pprint
import pycountry
import requests
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from time import sleep

from models import *
from rest_api import get_top_tracks

class DailyScraper:
    def __init__(self, db):
        # A list of all countries 
        self.countries = [country.alpha_2.lower() for country in pycountry.countries]
        
        # A list of all recognised genres
        with open('genres.txt', mode='r', encoding="utf-8") as f:
            self.genres = {line.rstrip() for line in f}

        # The current date 
        self.current_date = dt.datetime.now()

        spotify_client_id = 'b0d6aef0a4f846d3afe4dc5ab695bc3b'
        spotify_client_secret = 'ed600a63a1be4d2f83fc69f2be3169fe'
        self.spotify = spotipy.Spotify(client_credentials_manager=SpotifyClientCredentials(client_id=spotify_client_id, client_secret=spotify_client_secret))

        self.lastfm_API_KEY = '0cd9002543dae02f694ba01ca8e3f7bd'

        self.db = db
        self.get_popularity_measure = lambda position: 1 / (position + 47.45) ** 1.11

    def reset(self):
        self.genre_popularity_measures = {country: defaultdict(int) for country in self.countries}
        self.artist_popularity_measures = {country: defaultdict(int) for country in self.countries}

        self.lastfmAPI_call_count = 0
        
        # clear the today similarity table
        db.session.execute(db.delete(SongHasPopularityToday))
        db.session.execute(db.delete(ArtistHasPopularityToday))
        db.session.commit()

    def fetch_track_spotify_info(self, track_spotify_id):
        track_uri = f'spotify:track:{track_spotify_id}'
        track_results = self.spotify.track(track_uri)
        print(json.dumps(track_results, indent=4))

    def fetch_artist_spotify_info(self, artist_spotify_id):
        artist_uri = f'spotify:artist:{artist_spotify_id}'
        artist_results = self.spotify.artist(artist_uri)
        print(json.dumps(artist_results, indent=4))

    def fetch_track_tag_info(self, artist_name, track_name):
        # Make Last.fm API calls
        self.lastfmAPI_call_count += 1
        if self.lastfmAPI_call_count % 20 == 0:
            sleep(5)

        params = {
            'method': 'track.gettoptags',
            'artist': f'{artist_name}',
            'track': f'{track_name}',
            'autocorrect': 1,
            'api_key': self.lastfm_API_KEY,
            'format': 'json'
        }

        response = requests.get('https://ws.audioscrobbler.com/2.0/', params=params)
        if response.status_code == 200:
            return response.json()
        else:
            print("Error:", response.status_code)
            return None
        
    def calculate_genre_data(self, country_code, track_information):
        # Make Last.fm API calls to get genre data
        for main_artist_name, track_name, position in track_information:
            s = self.db.session.execute(self.db.select(Song).where(Song.name == track_name)).scalar()
            print(f"Fetching data: {country_code}, {main_artist_name}, {track_name}...")
            if not s.genres:
                genres_list = []
                tag_info = self.fetch_track_tag_info(main_artist_name, track_name)
                if tag_info is not None and 'toptags' in tag_info:
                    tags = tag_info['toptags']['tag']
                    for tag in tags:
                        genre_name = tag['name'].lower()
                        if genre_name in self.genres:
                            # Add the genre to the table if not already present
                            g = self.db.session.execute(self.db.select(Genre).where(Genre.name == genre_name)).scalar()
                            if not g:
                                g = Genre(name = genre_name)
                                self.db.session.add(g)

                            genres_list.append(g)
                            self.genre_popularity_measures[country_code][genre_name] += self.get_popularity_measure(position)

                s.genres = genres_list
            else:
                for g in s.genres:
                    self.genre_popularity_measures[country_code][g.name] += self.get_popularity_measure(position)

    def fetch_track_data(self):
        get_num = lambda s : int(s.replace(',','')) if s else None

        kworb_countries = ['ae', 'ar', 'at', 'au', 'be', 'bg', 'bo', 'br', 'by', 'ca', 'ch', 'cl', 'co', 'cr', 'cy', 'cz', 'de', 'dk', 'do', 'ec', 'ee', 'eg', 'es', 'fi', 'fr', 'gb', 'gr', 'gt', 'hk', 'hn', 'hu', 'id', 'ie', 'il', 'in', 'is', 'it', 'jp', 'kr', 'kz', 'lt', 'lu', 'lv', 'ma', 'mt', 'mx', 'my', 'ng', 'ni', 'nl', 'no', 'nz', 'pa', 'pe', 'ph', 'pk', 'pl', 'pt', 'py', 'ro', 'ru', 'sa', 'se', 'sg', 'sk', 'sv', 'th', 'tr', 'tw', 'ua', 'us', 'uy', 've', 'vn', 'za']

        for country_code in ['gb']:  # ['gb', 'fr', 'de', 'es', 'us', 'au'] for now for testing purposes
            response = requests.get(f'https://kworb.net/spotify/country/{country_code}_daily.html')
            # Check the page exists
            if response.status_code == 200:
                contents = response.content
                soup = BeautifulSoup(contents, features="html.parser")

                # Store information to calculate genre data
                track_information = []

                for row in soup.find_all('tr')[1:]:
                    elems = row.find_all('td')
                    links = elems[2].find_all('a')

                    # Variable names match column names in relational database schema 
                    artists = []
                    for i, link in enumerate(links):
                        if i == 1: 
                            track_name = link.text
                            track_spotify_id = link.get('href')[9:-5]
                        else:
                            artist_name = link.text
                            artist_spotify_id = link.get('href')[10:-5]
                            artists.append((artist_name, artist_spotify_id))

                    position = get_num(elems[0].text)
                    position_change = None if elems[1].text in ('NEW', 'RE') else 0 if elems[1].text == '=' else get_num(elems[1].text)
                    days = get_num(elems[3].text)
                    peak = get_num(elems[4].text)
                    peak_x = get_num(elems[5].text[2:-1])
                    streams = get_num(elems[6].text)
                    streams_change = get_num(elems[7].text)
                    week = get_num(elems[8].text)
                    week_change = get_num(elems[9].text)
                    total = get_num(elems[10].text)

                    track_information.append((artists[0][0], track_name, position))

                    # Add the artists to the database if not present
                    artist_instances = []  # To populate the database with the relationship between songs and artists
                    for artist in artists:
                        a = self.db.session.execute(self.db.select(Artist).where(Artist.spotify_id == artist[1])).scalar()
                        if not a:
                            a = Artist(name = artist[0], songs = [], spotify_id = artist[1])
                            self.db.session.add(a)

                        artist_instances.append(a)

                    # Add the song to the database if not present
                    s = self.db.session.execute(self.db.select(Song).where(Song.spotify_id == track_spotify_id)).scalar()
                    if not s:
                        s = Song(name = track_name, artists = artist_instances, genres = [], spotify_id = track_spotify_id)  # genres = [] for now
                        self.db.session.add(s)

                    # Add a relationship indicating the popularity of the song in a particular country to the database if not present
                    c = self.db.session.execute(self.db.select(Country).where(Country.code == country_code)).scalar()
                    s_pop = self.db.session.execute(self.db.select(SongHasPopularityToday).where(SongHasPopularityToday.song == s, SongHasPopularityToday.country == c)).scalar()
                    if not s_pop:
                        s_pop = SongHasPopularity(song = s, country = c, position = position, date = self.current_date)
                        self.db.session.add(s_pop)

                        # add the exact same entry for todays denormalised version, so the queries will work the same
                        s_pop_today = SongHasPopularityToday(song = s, country = c, position = position, date = dt.datetime.now())
                        self.db.session.add(s_pop_today)

                self.calculate_genre_data(country_code, track_information)

    def fetch_artist_data(self):
        contents = requests.get(f'https://kworb.net/itunes/extended.html').text
        soup = BeautifulSoup(contents, features="html.parser")
        for row in soup.find_all('tr')[1:41]:
            elems = row.find_all('td')

            artist_name = elems[1].text
            artist_page_link = elems[1].find('a').get('href')

            a = self.db.session.execute(self.db.select(Artist).where(Artist.name == artist_name)).scalar()  # The artist should always already be present in the database 
            if not a:
                a = Artist(name = artist_name, songs = [], spotify_id = None)
                self.db.session.add(a)

            artist_page_contents = requests.get(f'https://kworb.net/itunes/{artist_page_link}').text
            artist_page_soup = BeautifulSoup(artist_page_contents, features="html.parser").find(id='songs')

            services = ['spo', 'app', 'you', 'itu', 'sha', 'dee']

            for row in artist_page_soup.find_all('tr'):
                for col in row.find_all('td'):
                    for service in services:
                        service_data = col.find(class_=service)
                        if service_data is not None:
                            # Calculating artist popularity measure in each country
                            position_in_countries = [country_position.text for country_position in service_data.find_all('a')]
                            for position_in_country in position_in_countries:
                                position, country = position_in_country.split(' ', 1)  # Split on first whitespace
                                try:
                                    country_code = pycountry.countries.lookup(country).alpha_2.lower()
                                    self.artist_popularity_measures[country_code][artist_name] += self.get_popularity_measure(int(position[1:]))
                                except LookupError:  # The country is not recognised; skip
                                    print(f"Unknown country: {country}.")

    def populate_database(self, popularity_measures, table):
        # Normalise the popularity measures
        normalising_constants = defaultdict(int)
        for country_code in popularity_measures:
            normalising_constants[country_code] = max(popularity_measures[country_code].values(), default=0)

        normalised_popularity_measures = defaultdict(dict)
        for country_code in popularity_measures:
            for name in popularity_measures[country_code]:
                normalised_popularity_measures[country_code][name] = popularity_measures[country_code][name] / normalising_constants[country_code]

        popularity_measures = normalised_popularity_measures

        for country_code in popularity_measures:
            c = self.db.session.execute(self.db.select(Country).where(Country.code == country_code)).scalar()

            by_country_popularity_measures_sorted = sorted(popularity_measures[country_code].items(), key=lambda item: item[1], reverse=True)
            by_country_popularity_measures_ranked = [(name, popularity_measure, position + 1) for position, (name, popularity_measure) in enumerate(by_country_popularity_measures_sorted)]

            for name, popularity_measure, position in by_country_popularity_measures_ranked:
                if table == Artist:
                    a = self.db.session.execute(self.db.select(Artist).where(Artist.name == name)).scalar()  # The artist should always already be present in the database 

                    # Add a relationship indicating the popularity of the artist in a particular country to the database if not present

                    # only need to check if exists in todays data
                    a_pop = self.db.session.execute(self.db.select(ArtistHasPopularityToday).where(ArtistHasPopularityToday.artist == a, ArtistHasPopularityToday.country == c)).scalar()
                    if not a_pop:
                        # add to both the main table and the
                        a_pop = ArtistHasPopularity(artist = a, country = c, position = position, popularity = popularity_measure, date = self.current_date)
                        self.db.session.add(a_pop)
                        a_pop_today = ArtistHasPopularityToday(artist = a, country = c, position = position, popularity = popularity_measure, date = self.current_date)
                        self.db.session.add(a_pop_today)

                elif table == Genre:
                    g = self.db.session.execute(self.db.select(Genre).where(Genre.name == name)).scalar()  # The genre should always already be present in the database

                    # Add a relationship indicating the popularity of the genre in a particular country to the database if not present
                    g_pop = self.db.session.execute(self.db.select(GenreHasPopularity).where(GenreHasPopularity.genre_id == g.id, GenreHasPopularity.country_id == c.id, GenreHasPopularity.date == self.current_date)).scalar()
                    if not g_pop:
                        g_pop = GenreHasPopularity(genre = g, country = c, position = position, popularity = popularity_measure, date = self.current_date)
                        self.db.session.add(g_pop)

    def get_today_track_names(self, country):
        country_top_tracks = get_top_tracks(country)
        tracks = set()
        for entry in country_top_tracks:
            tracks.add(entry['song_name'])
        return tracks

    def precompute_country_compare(self):
        # delete the previous country compare data
        db.session.execute(db.delete(CountrySimilarity))
        db.session.commit()

        countries = list(db.session.execute(db.select(Country)).scalars())  # Get all countries

        # this loop should do every comparison once (not including comparing to itself)
        for i in range(len(countries) - 1):
            tracks1 = self.get_today_track_names(countries[i])
            if not tracks1:
                continue
            for j in range(i+1, len(countries)):
                tracks2 = self.get_today_track_names(countries[j])
                if not tracks2:
                    continue
                similarity = len(set.intersection(tracks1, tracks2)) / len(set.union(tracks1, tracks2))
                comp = CountrySimilarity(country1_id=countries[i].id, country2_id = countries[j].id, similarity=similarity)
                db.session.add(comp)
        
        db.session.commit()    

    def scrape(self):
        self.reset()
        
        self.fetch_track_data()
        self.fetch_artist_data()

        self.db.session.commit()

        self.populate_database(self.artist_popularity_measures, Artist)
        self.populate_database(self.genre_popularity_measures, Genre)

        self.db.session.commit()

        self.precompute_country_compare()


if __name__ == "__main__":
    daily_scraper = DailyScraper(db)
    daily_scraper.scrape()
