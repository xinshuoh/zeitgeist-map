# flask --app endpoint run

from flask import Flask, jsonify
from flask_cors import CORS, cross_origin
from dbupdate import DBUpdate

app = Flask(__name__)
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