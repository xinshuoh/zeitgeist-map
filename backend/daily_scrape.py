from bs4 import BeautifulSoup
from collections import defaultdict
import pycountry
import requests
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import sqlite3
from time import sleep
import urllib.request

import json


class DailyScraper:
    def __init__(self):
        # A list of all countries
        self.countries = ['ae', 'ar', 'at', 'au', 'be', 'bg', 'bo', 'br', 'by', 'ca', 'ch', 'cl', 'co', 'cr', 'cy', 'cz', 'de', 'dk', 'do', 'ec', 'ee', 'eg', 'es', 'fi', 'fr', 'gb', 'gr', 'gt', 'hk', 'hn', 'hu', 'id', 'ie', 'il', 'in', 'is', 'it', 'jp', 'kr', 'kz', 'lt', 'lu', 'lv', 'ma', 'mt', 'mx', 'my', 'ng', 'ni', 'nl', 'no', 'nz', 'pa', 'pe', 'ph', 'pk', 'pl', 'pt', 'py', 'ro', 'ru', 'sa', 'se', 'sg', 'sk', 'sv', 'th', 'tr', 'tw', 'ua', 'us', 'uy', 've', 'vn', 'za']

        # A list of all recognised genres
        with open('genres.txt', mode='r', encoding="utf-8") as f:
            self.genres = {line.rstrip() for line in f}

        spotify_client_id = 'b0d6aef0a4f846d3afe4dc5ab695bc3b'
        sptofiy_client_secret = 'ed600a63a1be4d2f83fc69f2be3169fe'
        self.spotify = spotipy.Spotify(client_credentials_manager=SpotifyClientCredentials(client_id=spotify_client_id, client_secret=sptofiy_client_secret))

        self.lastfm_API_KEY = '0cd9002543dae02f694ba01ca8e3f7bd'

    def fetch_track_spotify_info(self, track_spotify_id):
        track_uri = f'spotify:track:{track_spotify_id}'
        track_results = self.spotify.track(track_uri)
        print(json.dumps(track_results, indent=4))

    def fetch_artist_spotify_info(self, artist_spotify_id):
        artist_uri = f'spotify:artist:{artist_spotify_id}'
        artist_results = self.spotify.artist(artist_uri)
        print(json.dumps(artist_results, indent=4))

    def fetch_track_tag_info(self, artist_name, track_name):
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

    def calculate_genre_data(self, country, track_information):
        for main_artist_name, track_name, position in track_information:
            tag_info = self.fetch_track_tag_info(main_artist_name, track_name)
            print(main_artist_name, track_name)
            if tag_info is not None and 'toptags' in tag_info:
                tags = tag_info['toptags']['tag']
                for tag in tags:
                    genre = tag['name'].lower()
                    if genre in self.genres:
                        self.genre_popularity_measures[country][genre] += (tag['count'] / 100) / position

    def fetch_track_data(self):
        get_num = lambda s : int(s.replace(',','')) if s else None

        for country in ['gb']:  ## ['gb'] for now for testing purposes
            response = requests.get(f'https://kworb.net/spotify/country/{country}_daily.html')
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

                self.calculate_genre_data(country, track_information)

    def fetch_artist_data(self):
        contents = requests.get(f'https://kworb.net/itunes/extended.html').text
        soup = BeautifulSoup(contents, features="html.parser")
        for row in soup.find_all('tr')[1:]:
            elems = row.find_all('td')

            position = elems[0].text  # Worldwide position 
            artist_name = elems[1].text
            artist_page_link = elems[1].find('a').get('href')
            points = elems[2].text    # Worldwide popularity points

            artist_page_contents = requests.get(f'https://kworb.net/itunes/{artist_page_link}.html').text
            artist_page_soup = BeautifulSoup(artist_page_contents, features="html.parser").find(id='songs')

            artist_popularity_measure = defaultdict(int)

            services = ['spo', 'app', 'you', 'itu', 'sha', 'dee']

            for row in artist_page_soup.find_all('tr'):
                for col in row.find_all('td'):
                    for service in services:
                        service_data = col.find(class_=service)
                        if service_data is not None:
                            # Calculating artist popularity measure in each country
                            positions_in_countries = [country_position.text for country_position in service_data.find_all('a')]
                            for position_in_country in positions_in_countries:
                                position, country = position_in_country.split(' ', 1)  # Split on first whitespace
                                try:
                                    country_code = pycountry.countries.lookup(country).alpha_2.lower()
                                    artist_popularity_measure[country_code] += 1 / int(position[1:])
                                except LookupError:
                                    print(f"Unknown country: {country}.")

            # Use data to calculate the top artists in each country
            self.artist_popularity_measures[artist_name] = artist_popularity_measure

    def normalise_artist_popularity_measures(self):
        # Normalising constant for a country is the popularity measure of the most popular artist in the particular country
        normalising_constant = defaultdict(int)
        for artist in self.artist_popularity_measures:
            for country_code in self.artist_popularity_measures[artist]:
                normalising_constant[country_code] = max(normalising_constant[country_code], self.artist_popularity_measures[artist][country_code])

        normalised_artist_popularity_measures = defaultdict(dict)
        for artist in self.artist_popularity_measures:
            for country_code in self.artist_popularity_measures[artist]:
                normalised_artist_popularity_measures[country_code][artist] = self.artist_popularity_measures[artist][country_code] / normalising_constant[country_code]

        return normalised_artist_popularity_measures
    
    def populate_database(self):
        pass

    def run(self):
        self.genre_popularity_measures = {country: defaultdict(int) for country in self.countries}
        self.artist_popularity_measures = {}
        self.lastfmAPI_call_count = 0

        # fetch_track_spotify_info('35ISBknsCeZQtq66xABI9g')
        # fetch_artist_spotify_info('67FB4n52MgexGQIG8s0yUH')

        self.fetch_track_data()
        print(self.genre_popularity_measures)
        # self.fetch_artist_data()

        # Testing
        # print(self.fetch_track_tag_info("Taylor Swift", "Cruel Summer"))


if __name__ == "__main__":
    daily_scraper = DailyScraper()
    daily_scraper.run()
