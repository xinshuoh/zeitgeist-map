import urllib.request
from bs4 import BeautifulSoup

from flask_apscheduler import APScheduler
from flask_sqlalchemy import SQLAlchemy

from sqlalchemy import insert

import datetime as dt

from models import *

def setup(scheduler: APScheduler, db: SQLAlchemy):

    @scheduler.task('interval', id='kworb', days=1)
    def kworb():
        print("Updating from kworb...")
        with scheduler.app.app_context():
            def fetch_country(country):
                contents = urllib.request.urlopen(f"https://kworb.net/spotify/country/{country}_daily.html").read()

                soup = BeautifulSoup(contents, features="html.parser")

                get_num = lambda s : int(s.replace(',','')) if s else None

                for row in soup.find_all('tr')[1:]: # first row is headings
                    elems = row.find_all('td')

                    pos = get_num(elems[0].text)
                    pos_change = None if elems[1].text in ('NEW', 'RE') else 0 if elems[1].text == '=' else get_num(elems[1].text)
                    links = elems[2].find_all('a')
                    artist = links[0].text
                    artist_link = links[0].get('href')[10:-5]
                    track = links[1].text
                    track_link = links[1].get('href')[9:-5]
                    # links[2:] has co-artists if they exists, ignoring rn
                    days = get_num(elems[3].text)
                    peak = get_num(elems[4].text)
                    peak_x = get_num(elems[5].text[2:-1])
                    streams = get_num(elems[6].text)
                    streams_change = get_num(elems[7].text)
                    week = get_num(elems[8].text)
                    week_change = get_num(elems[9].text)
                    total = get_num(elems[10].text)

                    # multiple artists with same name?
                    a = db.session.execute(db.select(Artist).where(Artist.spotify_id == artist_link)).scalar()
                    if not a:
                        a = Artist(name = artist, songs = [], genres = [], spotify_id = artist_link)
                        db.session.add(a)

                    # multiple songs with same name?
                    s = db.session.execute(db.select(Song).where(Song.spotify_id == track_link)).scalar()
                    if not s:
                        s = Song(name = track, artists = [a], spotify_id = track_link)
                        db.session.add(s)

                    c = db.session.execute(db.select(Country).where(Country.code == country)).scalar()

                    s_pop = SongHasPopularity(song = s, country = c, position = pos, date = dt.datetime.now())
                    db.session.add(s_pop)

                db.session.commit()
                print("Updated " + country)
                

            countries = ['ae', 'ar', 'at', 'au', 'be', 'bg', 'bo', 'br', 'by', 'ca', 'ch', 'cl', 'co', 'cr', 'cy', 'cz', 'de', 'dk', 'do', 'ec', 'ee', 'eg', 'es', 'fi', 'fr', 'gb', 'gr', 'gt', 'hk', 'hn', 'hu', 'id', 'ie', 'il', 'in', 'is', 'it', 'jp', 'kr', 'kz', 'lt', 'lu', 'lv', 'ma', 'mt', 'mx', 'my', 'ng', 'ni', 'nl', 'no', 'nz', 'pa', 'pe', 'ph', 'pk', 'pl', 'pt', 'py', 'ro', 'ru', 'sa', 'se', 'sg', 'sk', 'sv', 'th', 'tr', 'tw', 'ua', 'us', 'uy', 've', 'vn', 'za']
            for country in countries:
                fetch_country(country)