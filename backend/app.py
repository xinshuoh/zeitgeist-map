# flask run
from flask import Flask, jsonify, request

SQLALCHEMY_DATABASE_URI = 'sqlite:///app.db'
from flask_cors import CORS, cross_origin
from flask_apscheduler import APScheduler

from urllib.parse import quote, unquote

import country_converter as coco

from models import *

import dbupdate

app = Flask(__name__)

import rest_api

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
    names = coco.convert(names=countries, to='name_short')
    for country, name in zip(countries, names):
        
        c = Country(code = country, name = name)
        db.session.add(c)
    db.session.commit()

@app.cli.command("list-songs")
def list_songs():
    scalars = db.session.execute(db.select(Song)).scalars()
    for s in scalars:
        print(s.name, "-", s.artists[0].name)
        print(*map(lambda x : x.country.code + ": " + str(x.position), s.popularities))

@app.cli.command("list-countries")
def list_countries():
    scalars = db.session.execute(db.select(Country)).scalars()
    for s in scalars:
        print(s.name)

@app.cli.command("force-update")
def force_update():
    print(scheduler.get_job('kworb').func())
