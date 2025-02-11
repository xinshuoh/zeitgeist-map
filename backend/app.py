# flask --app endpoint run
import os

from flask import Flask, jsonify

SQLALCHEMY_DATABASE_URI = 'sqlite:///app.db'
from flask_cors import CORS, cross_origin
from dbupdate import DBUpdate

from models import *

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI
db.init_app(app)

# example
@app.route("/ping")
@cross_origin()
def test():
    return "Hello from backend!"

@app.route("/top_artists")
def get_top_artists():
    return jsonify({'UK': ["Coldplay", "Pink Floyd"]})

#update_thread = DBUpdate()
#update_thread.start()

@app.cli.command("delete-tables")
def delete_tables():
    db.drop_all()

@app.cli.command("build-tables")
def build_tables():
    db.create_all()

@app.cli.command("all-songs")
def test_db():
    print(db.session.execute(db.select(Song)).all())