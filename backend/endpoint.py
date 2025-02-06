# flask --app endpoint run
import os

from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy

SQLALCHEMY_DATABASE_URI = 'sqlite:///app.db'
from flask_cors import CORS, cross_origin
from dbupdate import DBUpdate

app = Flask(__name__)
db = SQLAlchemy(app)

cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

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