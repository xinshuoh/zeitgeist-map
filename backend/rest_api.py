import datetime as dt
from urllib.parse import quote, unquote

from flask import request, jsonify
from flask_cors import cross_origin
from sqlalchemy import or_
import heapq

from app import app
from app import db
from models import *

from param_check import *

import spotipy
from spotipy.oauth2 import SpotifyClientCredentials

@app.route("/ping")
#@cross_origin()
@args(p.all)
def ping():
    return "Hello from backend!"

@app.route("/heat_map_song_first_date")
# @args(p("song_id")|p("name"))
def heat_map_song_first_date():
    if 'song_id' in request.args:
        val = db.session.execute(db.select(Song).where(Song.id == request.args['song_id'])).scalar()
    if 'name' in request.args:
        val = db.session.execute(db.select(Song).where(Song.name == unquote(request.args['name']))).scalar()

    pop = db.session.execute(db.select(SongHasPopularity).where(SongHasPopularity.song == val).order_by(SongHasPopularity.date)).scalar()

    return str(pop.date)

@app.route("/heat_map_artist_first_date")
# @args(p("artist_name"))
def heat_map_artist_first_date():
    val = db.session.execute(db.select(Artist).where(Artist.name == unquote(request.args['artist_name']))).scalar()

    pop = db.session.execute(db.select(ArtistHasPopularity).where(ArtistHasPopularity.artist == val).order_by(ArtistHasPopularity.date)).scalar()

    return str(pop.date)


@app.route("/heat_map_song_popularity")
# @args(p("date")&(p("song_id")|p("name")))
def heat_map_song_popularity():
    #2017-06-29 date format
    
    if 'song_id' in request.args:
        val = db.session.execute(db.select(Song).where(Song.id == request.args['song_id'])).scalar()
    if 'name' in request.args:
        val = db.session.execute(db.select(Song).where(Song.name == unquote(request.args['name']))).scalar()
    
    pops = db.session.execute(db.select(SongHasPopularity).where(SongHasPopularity.song == val, SongHasPopularity.date == request.args['date'])).scalars()

    d = {}
    for pop in pops:
        d[pop.country.code] = pop.position

    return d

@app.route("/heat_map_artist_popularity")
# @args(p("date")&p("artist_name"))
def heat_map_artist_popularity():
    #2017-06-29 date format
    val = db.session.execute(db.select(Artist).where(Artist.name == unquote(request.args['artist_name']))).scalar()
    
    pops = db.session.execute(db.select(ArtistHasPopularity).where(ArtistHasPopularity.artist == val, ArtistHasPopularity.date == request.args['date'])).scalars()

    d = {}
    for pop in pops:
        d[pop.country.code] = pop.position

    return d

#not used
@app.route("/track_popularity")
# @args(p("song_id")|p("name"))
def track_popularity():
    if 'song_id' in request.args:
        vals = db.session.execute(db.select(Song).where(Song.id == request.args['song_id'])).scalars()
    if 'name' in request.args:
        vals = db.session.execute(db.select(Song).where(Song.name == unquote(request.args['name']))).scalars()
    res = []
    for v in vals:
        res.append({'artist': v.artists[0].name,
        'popularity': {p.country.code: p.position for p in v.popularities}})
    return res

@app.route("/song_top_countries")
# @args(p("song_id")|p("name"))
def song_top_countries():
    if 'song_id' in request.args:
        vals = list(db.session.execute(db.select(Song).where(Song.id == request.args['song_id'])).scalars())
    if 'name' in request.args:
        vals = list(db.session.execute(db.select(Song).where(Song.name == unquote(request.args['name']))).scalars())

    res = []
    if vals:
        v = vals[0]
        # gets the top 5 countries
        pops = sorted(v.today_popularities, key=lambda x : x.position)
        for p in pops[:5]:
            res.append({'country_name': p.country.name, 'position': p.position})

    return res

@app.route("/artist_top_countries")
# @args(p("artist_id")|p("name"))
def artist_top_countries():
    if 'artist_id' in request.args:
        vals = list(db.session.execute(db.select(Artist).where(Artist.id == request.args['artist_id'])).scalars())
    if 'name' in request.args:
        vals = list(db.session.execute(db.select(Artist).where(Artist.name == unquote(request.args['name']))).scalars())

    res = []
    if vals:
        v = vals[0]
        # gets the top 5 countries
        pops = sorted(v.today_popularities, key=lambda x : x.popularity, reverse=True)
        for p in pops:
            res.append({'country_name': p.country.name, 'popularity': p.popularity})

    return res


@app.route("/country_top_tracks")
# @args(p("country_code"))
def country_top_tracks():
    c = db.session.execute(db.select(Country).where(Country.code == request.args['country_code'])).scalar()
    return get_top5_tracks(c)


@app.route("/country_top_artists")
# @args(p("country_code"))
def country_top_artists():
    c = db.session.execute(db.select(Country).where(Country.code == request.args['country_code'])).scalar()
    return get_top_artists(c)


@app.route("/country_top_genres")
# @args(p("country_code"))
def country_top_genres():
    current_date = dt.datetime.now().date()
    c = db.session.execute(db.select(Country).where(Country.code == request.args['country_code'])).scalar()
    return get_top_genres(c, current_date)

    

def get_top_tracks(country):
    # gets todays popularities, don't need to check the date as it must be today
    vals = db.session.execute(db.select(SongHasPopularityToday).where(SongHasPopularityToday.country == country)).scalars()
    res = []
    for v in vals:
        res.append({
            'song_name': v.song.name,
            'spotify_id': v.song.spotify_id,
            'artist': v.song.artists[0].name,
            'position': v.position,
        })
    return res

def get_top5_tracks(country):
    # note, this relies on the fact that songs are entered into the database in order of popularity (would return bogus stuff otherwise)
    vals = db.session.execute(db.select(SongHasPopularityToday).where(SongHasPopularityToday.country == country).limit(5)).scalars()
    res = []
    for v in vals:
        res.append({
            'song_name': v.song.name,
            'spotify_id': v.song.spotify_id,
            'artist': v.song.artists[0].name,
            'position': v.position,
            "genres": list(map(lambda genre : genre.name, v.song.genres))[:5]
        })
    return res


def get_top_artists(country):
    vals = db.session.execute(db.select(ArtistHasPopularityToday).where(ArtistHasPopularityToday.country == country).limit(5)).scalars()
    res = []
    for v in vals:
        res.append({
            'artist_name': v.artist.name,
            'position': v.position,
            'popularity_measure': v.popularity
        })
    return res


def get_top_genres(country, date):
    vals = db.session.execute(db.select(GenreHasPopularity).where(GenreHasPopularity.country == country, GenreHasPopularity.date == date).limit(5)).scalars()
    res = []
    for v in vals:
        res.append({
            'genre_name': v.genre.name,
            'position': v.position,
            'popularity_measure': v.popularity
        })
    return res


@app.route("/song_country_history")
# @args(p("country_code")&(p("song_id")|p("song_name")))
def song_country_history():
    # returns a list of dict(date, popularity) items in date order to be used for trends
    c = db.session.execute(db.select(Country).where(Country.code == request.args['country_code'])).scalar()

    if 'song_id' in request.args:
        pops = db.session.execute(db.select(SongHasPopularity).where(
            SongHasPopularity.country == c, 
            SongHasPopularity.song_id==request.args['song_id']
        ).order_by(SongHasPopularity.date)).scalars()
    elif 'song_name' in request.args:
        s = db.session.execute(db.select(Song).where(Song.name == unquote(request.args['song_name']))).scalars().first() # pick the first song with matching name
        pops = db.session.execute(db.select(SongHasPopularity).where(
            SongHasPopularity.country == c, 
            SongHasPopularity.song_id == s.id
        ).order_by(SongHasPopularity.date)).scalars()

    res = []
    for p in pops:
        res.append({
            'date': p.date,
            'value': p.position
        })

    return res


@app.route("/artist_country_history")
# @args(p("country_code")&p("artist_name"))
def artist_country_history():
    c = db.session.execute(db.select(Country).where(Country.code == request.args['country_code'])).scalar()
    a = db.session.execute(db.select(Artist).where(Artist.name == unquote(request.args['artist_name']))).scalars().first()
    pops = db.session.execute(db.select(ArtistHasPopularity).where(
        ArtistHasPopularity.country == c, 
        ArtistHasPopularity.artist_id == a.id
    ).order_by(ArtistHasPopularity.date)).scalars()

    res = []
    for p in pops:
        res.append({
            'date': p.date,
            'value': p.popularity
        })
    return res


def get_today_track_names(country):
    country_top_tracks = get_top_tracks(country)
    tracks = set()
    for entry in country_top_tracks:
        tracks.add(entry['song_name'])
    return tracks


def get_percentage_similarity(comparison_tracks, country_code=None):
    countries = db.session.execute(db.select(Country)).scalars()  # Get all countries
    
    res = []
    for country in countries:
        if not country_code or (country.code != country_code):
            tracks = get_today_track_names(country)
            similarity = len(set.intersection(tracks, comparison_tracks)) / len(set.union(tracks, comparison_tracks))
            res.append({
                'name': country.name,
                'country_code': country.code,
                'similarity': similarity
            })
    res = sorted(res, key=lambda x: x['similarity'], reverse=True)
    return res


@app.route('/country_compare')
def country_compare():
    # get the country
    country = db.session.execute(db.select(Country).where(Country.code == request.args['country_code'])).scalar()

    # get it's similarities
    similarities = list(db.session.execute(db.select(CountrySimilarity).where(or_(CountrySimilarity.country1==country, CountrySimilarity.country2==country))).scalars())
    
    res = []
    for sim in similarities:
        if sim.country1 == country:
            name = sim.country2.name
            code = sim.country2.code
        else:
            name = sim.country1.name
            code = sim.country1.code
        
        res.append({
                'name': name,
                'country_code': code,
                'similarity': sim.similarity
            })
    
    return res


# @app.route('/spiritual_musical_home')
# def spiritual_musical_home():
#     tracks = set()

#     # some way of getting list of tracks from a spotify playlist
#     country, similarity = get_percentage_similarity(tracks)

#     if not country:
#         return None
#     else:
#         return {
#             'name': country.name,
#             'country_code': country.code,
#             'similarity': similarity
#         }
        

@app.route('/search_complete')
@args(p('prefix'))
def search_complete():
    s = db.session.execute(db.select(Song).where(Song.name.startswith(request.args['prefix']))).scalars()
    a = db.session.execute(db.select(Artist).where(Artist.name.startswith(request.args['prefix']))).scalars()
    song_names = list(map(lambda song: {"type": "song", "name": song.name, "artist_name": song.artists[0].name, "genres": list(map(lambda genre : genre.name, song.genres))[:5]}, s))
    artist_names = list(map(lambda artist: {"type": "artist", "name": artist.name}, a))
    
    return song_names + artist_names
    
# @app.route('/get_specific_song')
# def get_specific_song():
#     songs = list(db.session.execute(db.select(Song).where(Song.name == request.args['song_name'])).scalars())
#     if not songs:
#         return
#     song = songs[0]
#     return {
#             'song_name': song.name,
#             'spotify_id': song.spotify_id,
#             'artist': song.artists[0].name,
#         }

client_id = 'b0d6aef0a4f846d3afe4dc5ab695bc3b'
client_secret = 'ed600a63a1be4d2f83fc69f2be3169fe'
spotify = spotipy.Spotify(client_credentials_manager=SpotifyClientCredentials(client_id=client_id, client_secret=client_secret))

@app.route('/spiritual_musical_home')
# @args(p("playlist_id"))
def spiritual_musical_home():
    results = spotify.playlist(request.args['playlist_id'])

    countries = {}
    for song in results['tracks']['items']:
        s_val = db.session.execute(db.select(Song).where(Song.name == song['track']['name'])).scalar()
        if s_val:
            pop_val = db.session.execute(db.select(SongHasPopularity).where(SongHasPopularity.song == s_val)).scalars()
            for entry in pop_val:
                countries[entry.country] = countries.get(entry.country, 0)+1
    
    return {k.code: v for k, v in countries.items()}

