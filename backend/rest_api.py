import datetime as dt
from urllib.parse import quote, unquote

from flask import request, jsonify
from flask_cors import cross_origin

from app import app
from app import db
from models import *

from param_check import *

@app.route("/ping")
#@cross_origin()
@args(p.all)
def ping():
    return "Hello from backend!"


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


@app.route("/country_top_tracks")
# @args(p("country_code"))
def country_top_tracks():
    current_date = dt.datetime.now().date()
    c = db.session.execute(db.select(Country).where(Country.code == request.args['country_code'])).scalar()
    return get_top_tracks(c, current_date)


def get_top_tracks(country, date):
    vals = db.session.execute(db.select(SongHasPopularity).where(SongHasPopularity.country == country, SongHasPopularity.date == date).order_by(SongHasPopularity.position)).scalars()
    res = []
    for v in vals:
        res.append({
            'song_name': v.song.name,
            'spotify_id': v.song.spotify_id,
            'artist': v.song.artists[0].name,
            'position': v.position,
        })
    return res

def get_top_artists(country, date):
    vals = db.session.execute(db.select(ArtistHasPopularity).where(ArtistHasPopularity.country == country, ArtistHasPopularity.date == date).order_by(ArtistHasPopularity.position)).scalars()
    res = []
    for v in vals:
        res.append({
            'artist_name': v.artist.name,
            'position': v.position,
            'popularity_measure': v.popularity
        })
    return res

def get_top_genres(country, date):
    vals = db.session.execute(db.select(GenreHasPopularity).where(GenreHasPopularity.country == country, GenreHasPopularity.date == date).order_by(GenreHasPopularity.position)).scalars()
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
    # this might be really clunky

    # returns a list of dict(date, popularity) items in date order to be used for trends
    c = db.session.execute(db.select(Country).where(Country.code == request.args['country_code'])).scalar()
    if 'song_id' in request.args:
        pops = db.session.execute(db.select(SongHasPopularity).where(
            SongHasPopularity.country == c, 
            SongHasPopularity.song_id==request.args['song_id']
        ).order_by(SongHasPopularity.date)).scalars()
    elif 'song_name' in request.args:
        s = db.session.execute(db.select(Song).where(Song.name == unquote(request.args['song_name']))).scalars().first() # pick the first song with matching name
        print(s)
        pops = db.session.execute(db.select(SongHasPopularity).where(
            SongHasPopularity.country == c, 
            SongHasPopularity.song_id == s.id
        ).order_by(SongHasPopularity.date)).scalars()
    res = []
    for p in pops:
        res.append({
            'date': p.date,
            'popularity': p.position
        })
    return res


def get_today_track_names(country):
    current_date = dt.datetime.now().date()
    country_top_tracks = get_top_tracks(country, current_date)
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
    c = db.session.execute(db.select(Country).where(Country.code == request.args['country_code'])).scalar()
    tracks = get_today_track_names(c)
    # TODO : deal better with when there is no match 
    return get_percentage_similarity(tracks, c.code)
    

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
    c = db.session.execute(db.select(Song).where(Song.name.startswith(request.args['prefix']))).scalars()
    return list(map(lambda song : song.name, c))