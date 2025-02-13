# flask run
from flask import Flask, jsonify, request

SQLALCHEMY_DATABASE_URI = 'sqlite:///app.db'
from flask_cors import CORS, cross_origin
from flask_apscheduler import APScheduler

from urllib.parse import quote, unquote

from models import *

import dbupdate

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI
db.init_app(app)

scheduler = APScheduler()
scheduler.init_app(app)
scheduler.start()

dbupdate.setup(scheduler, db)

# --- CLI ---

@app.cli.command("delete-tables")
def delete_tables():
    db.drop_all()

@app.cli.command("rebuild")
def build_tables():
    db.drop_all()
    db.create_all()

    countries = ['ae', 'ar', 'at', 'au', 'be', 'bg', 'bo', 'br', 'by', 'ca', 'ch', 'cl', 'co', 'cr', 'cy', 'cz', 'de', 'dk', 'do', 'ec', 'ee', 'eg', 'es', 'fi', 'fr', 'gb', 'gr', 'gt', 'hk', 'hn', 'hu', 'id', 'ie', 'il', 'in', 'is', 'it', 'jp', 'kr', 'kz', 'lt', 'lu', 'lv', 'ma', 'mt', 'mx', 'my', 'ng', 'ni', 'nl', 'no', 'nz', 'pa', 'pe', 'ph', 'pk', 'pl', 'pt', 'py', 'ro', 'ru', 'sa', 'se', 'sg', 'sk', 'sv', 'th', 'tr', 'tw', 'ua', 'us', 'uy', 've', 'vn', 'za']
    for country in countries:
        c = Country(name = country)
        db.session.add(c)
    db.session.commit()

@app.cli.command("list-songs")
def list_songs():
    scalars = db.session.execute(db.select(Song)).scalars()
    for s in scalars:
        print(s.name, "-", s.artists[0].name)
        print(*map(lambda x : x.country.name + ": " + str(x.position), s.popularities))

@app.cli.command("list-countries")
def list_countries():
    scalars = db.session.execute(db.select(Country)).scalars()
    for s in scalars:
        print(s.name)

@app.cli.command("force-update")
def force_update():
    print(scheduler.get_job('kworb').func())

# --- REST API ---

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
        'popularity': {p.country.name: p.position for p in v.popularities}})
    return res