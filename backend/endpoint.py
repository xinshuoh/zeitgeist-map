# flask --app endpoint run

from flask import Flask, jsonify

app = Flask(__name__)

# example
@app.route("/top_arists")
def get_top_artists():
    return jsonify({'UK': ["Coldplay", "Pink Floyd"]})