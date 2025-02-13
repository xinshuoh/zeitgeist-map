import datetime as dt
from urllib.parse import quote, unquote

from flask import request, jsonify
from flask_cors import cross_origin


from app import app
from app import db
from models import *

# example
@app.route("/ping")
@cross_origin()
def ping():
    return "Hello from backend!"

@app.route("/top_artists")
def get_top_artists():
    return jsonify({'UK': ["Coldplay", "Pink Floyd"]})

@app.route("/track_popularity")
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
def country_top_tracks():
    current_date = dt.datetime.now().date()
    c = db.session.execute(db.select(Country).where(Country.code == request.args['country_code'])).scalar()
    vals = db.session.execute(db.select(SongHasPopularity).where(SongHasPopularity.country == c, SongHasPopularity.date == current_date).order_by(SongHasPopularity.position)).scalars()
    res = []
    for v in vals:
        res.append({
            'song_name': v.song.name,
            'artist': v.song.artists[0].name,
            'popularity': v.position,
        })
    return res

@app.route("/song_country_history")
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


