from flask import request, jsonify
from urllib.parse import quote, unquote
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
    c = db.session.execute(db.select(Country).where(Country.code == request.args['country_code'])).scalar()
    vals = db.session.execute(db.select(SongHasPopularity).where(SongHasPopularity.country == c).order_by(SongHasPopularity.position)).scalars()
    res = []
    for v in vals:
        res.append({
            'song_name': v.song.name,
            'artist': v.song.artists[0].name,
            'popularity': v.position,
            'date': v.date
        })
    return res


