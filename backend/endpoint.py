# flask --app endpoint run
import os

from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy

SQLALCHEMY_DATABASE_URI = 'sqlite:///app.db'

app = Flask(__name__)
db = SQLAlchemy(app)


# example
@app.route("/top_arists")
def get_top_artists():
    return jsonify({'UK': ["Coldplay", "Pink Floyd"]})