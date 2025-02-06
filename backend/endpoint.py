# flask --app endpoint run

from flask import Flask, jsonify
from dbupdate import DBUpdate

app = Flask(__name__)

# example
@app.route("/top_arists")
def get_top_artists():
    return jsonify({'UK': ["Coldplay", "Pink Floyd"]})

update_thread = DBUpdate()
update_thread.start()