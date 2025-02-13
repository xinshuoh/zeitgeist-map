from bs4 import BeautifulSoup
from collections import defaultdict
import pycountry
import requests
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import sqlite3
import urllib.request

import json


def fetch_track_spotify_info(track_spotify_id):
    track_uri = f'spotify:track:{track_spotify_id}'
    track_results = spotify.track(track_uri)
    print(json.dumps(track_results, indent=4))


def fetch_artist_spotify_info(artist_spotify_id):
    artist_uri = f'spotify:artist:{artist_spotify_id}'
    artist_results = spotify.artist(artist_uri)
    print(json.dumps(artist_results, indent=4))


def fetch_track_genre_info(artist_name, track_name):
    # Last.fm data doesn't look like it's up to date. 
    API_KEY = '0cd9002543dae02f694ba01ca8e3f7bd'
    url = 'https://ws.audioscrobbler.com/2.0/'

    params = {
        'method': 'track.gettoptags',
        'artist': f'{artist_name}',
        'track': f'{track_name}',
        'autocorrect': 1,
        'api_key': API_KEY,
        'format': 'json'
    }

    response = requests.get(url, params=params)
    if response.status_code == 200:
        print(json.dumps(response.json(), indent=4))
    else:
        print("Error:", response.status_code)


def fetch_genre_data():
    pass


def fetch_track_data(country):
    contents = urllib.request.urlopen(f'https://kworb.net/spotify/country/{country}_daily.html').read()
    soup = BeautifulSoup(contents, features="html.parser")

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

    ############################
    ### ADD DATA TO DATABASE ###
    ############################


def fetch_artist_data():
    popularity_measures = {}

    contents = requests.get(f'https://kworb.net/itunes/extended.html').text
    soup = BeautifulSoup(contents, features="html.parser")
    for row in soup.find_all('tr')[1:10]:
        elems = row.find_all('td')

        position = elems[0].text  # Worldwide position 
        artist_name = elems[1].text
        artist_kworb_page_link = elems[1].find('a').get('href')
        points = elems[2].text  # Worldwide popularity points

        artist_kworb_page_contents = requests.get(f'https://kworb.net/itunes/{artist_kworb_page_link}.html').text
        artist_kworb_page_soup = BeautifulSoup(artist_kworb_page_contents, features="html.parser").find(id='songs')

        artist_popularity_measure = defaultdict(int)

        services = ['spo', 'app', 'you', 'itu', 'sha', 'dee']

        for row in artist_kworb_page_soup.find_all('tr'):
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
        popularity_measures[artist_name] = artist_popularity_measure

    # # Normalising constant for a country is the popularity measure of the most popular artist in the particular country
    # normalising_constant = defaultdict(int)
    # for artist in popularity_measures:
    #     for country_code in popularity_measures[artist]:
    #         normalising_constant[country_code] = max(normalising_constant[country_code], popularity_measures[artist][country_code])

    # normalised_popularity_measures = defaultdict(dict)
    # for artist in popularity_measures:
    #     for country_code in popularity_measures[artist]:
    #         normalised_popularity_measures[country_code][artist] = popularity_measures[artist][country_code] / normalising_constant[country_code]

    ############################
    ### ADD DATA TO DATABASE ###
    ############################
    

if __name__ == "__main__":
    # SPOTIFY
    client_id = 'b0d6aef0a4f846d3afe4dc5ab695bc3b'
    client_secret = 'ed600a63a1be4d2f83fc69f2be3169fe'
    spotify = spotipy.Spotify(client_credentials_manager=SpotifyClientCredentials(client_id=client_id, client_secret=client_secret))
    # fetch_track_spotify_info('35ISBknsCeZQtq66xABI9g')
    # fetch_artist_spotify_info('67FB4n52MgexGQIG8s0yUH')

    # KWORB
    conn = sqlite3.connect("../zeitgeist-map.sqlite")
    cur = conn.cursor()
    countries = [country.alpha_2.lower() for country in pycountry.countries]
    get_num = lambda s : int(s.replace(',','')) if s else None
    # fetch_track_data('gb')
    # fetch_artist_data()

    # Testing
    fetch_track_genre_info("Taylor Swift", "Cruel Summer")
