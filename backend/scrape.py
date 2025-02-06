import urllib.request
from bs4 import BeautifulSoup
import sqlite3

conn = sqlite3.connect("../zeitgeist.sqlite")

cur = conn.cursor()

def fetch_country(country):
    contents = urllib.request.urlopen(f"https://kworb.net/spotify/country/{country}_daily.html").read()

    soup = BeautifulSoup(contents, features="html.parser")

    insert_stmt = ("INSERT INTO daily_charts" 
        "(country,pos,pos_change,artist,title,artist_link,title_link,days,peak,peak_x,streams,streams_change,week,week_change,total)" 
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")

    # clear previous entries
    cur.execute("DELETE FROM daily_charts WHERE country = ?", (country,))

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

        cur.execute(insert_stmt, 
            (country, pos, pos_change, artist, track, artist_link, track_link, days, peak, peak_x, streams, streams_change, week, week_change, total)
        )

    print("Updated " + country)
    conn.commit()

# removed gl = greenland
countries = ['ae', 'ar', 'at', 'au', 'be', 'bg', 'bo', 'br', 'by', 'ca', 'ch', 'cl', 'co', 'cr', 'cy', 'cz', 'de', 'dk', 'do', 'ec', 'ee', 'eg', 'es', 'fi', 'fr', 'gb', 'gr', 'gt', 'hk', 'hn', 'hu', 'id', 'ie', 'il', 'in', 'is', 'it', 'jp', 'kr', 'kz', 'lt', 'lu', 'lv', 'ma', 'mt', 'mx', 'my', 'ng', 'ni', 'nl', 'no', 'nz', 'pa', 'pe', 'ph', 'pk', 'pl', 'pt', 'py', 'ro', 'ru', 'sa', 'se', 'sg', 'sk', 'sv', 'th', 'tr', 'tw', 'ua', 'us', 'uy', 've', 'vn', 'za']
for country in countries:
    fetch_country(country)

cur.close()
conn.close()