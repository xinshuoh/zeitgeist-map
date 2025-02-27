# flask run
from flask import Flask, jsonify, request

SQLALCHEMY_DATABASE_URI = 'sqlite:///app.db'
from flask_cors import CORS, cross_origin
from flask_apscheduler import APScheduler

from urllib.parse import quote, unquote

import country_converter as coco
import pycountry

from models import *

import dbupdate

app = Flask(__name__)

import rest_api
import scrape

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

    #countries = [country.alpha_2.lower() for country in pycountry.countries]
    countries = ["us","uk","jp","de","au","ca","fr","it","kr","mx","ru","th","be","br","ch","cn","co","es","hk","id","ie","in","nl","nz","tr","tw","za","ae","ar","at","cl","cz","dk","ec","ee","eg","fi","gr","hu","il","ke","kz","lb","lt","lu","my","ng","no","pe","ph","pl","pt","ro","sa","se","si","sg","sk","ua","vn"]

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

@app.cli.command("list-artists")
def list_artists():
    scalars = db.session.execute(db.select(Artist)).scalars()
    for s in scalars:
        print(s.name)
        print(*map(lambda x : x.country.code + ": " + str(x.position) + ", " + str(x.popularity) + "\n", s.popularities))

@app.cli.command("list-genres")
def list_genres():
    scalars = db.session.execute(db.select(Genre)).scalars()
    for s in scalars:
        print(s.name)
        print(*map(lambda x : x.country.code + ": " + str(x.position) + ", " + str(x.popularity) + "\n", s.popularities))

@app.cli.command("list-countries")
def list_countries():
    scalars = db.session.execute(db.select(Country)).scalars()
    for s in scalars:
        print(s.name)

@app.cli.command("force-update")
def force_update():
    # print(scheduler.get_job('kworb').func())
    print(scheduler.get_job('daily_scrape').func())
