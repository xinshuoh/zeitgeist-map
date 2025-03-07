from bs4 import BeautifulSoup
import matplotlib.pyplot as plt
import numpy as np
import requests
import scipy.optimize as opt

def fetch_track_data():
    get_num = lambda s : int(s.replace(',','')) if s else None

    positions_against_streams = {}

    for country_code in ['gb']:  # ['gb'] for now for testing purposes
        response = requests.get(f'https://kworb.net/spotify/country/{country_code}_daily.html')
        # Check the page exists
        if response.status_code == 200:
            contents = response.content
            soup = BeautifulSoup(contents, features="html.parser")

            for row in soup.find_all('tr')[1:]:
                elems = row.find_all('td')
                links = elems[2].find_all('a')

                # Variable names match column names in relational database schema 
                artists = []
                for i, link in enumerate(links):
                    if i == 1: 
                        track_name = link.text
                        track_spotify_id = link.get('href')[9:-5]
                    else:
                        artist_name = link.text
                        artist_spotify_id = link.get('href')[10:-5]
                        artists.append((artist_name, artist_spotify_id))

                position = get_num(elems[0].text)
                position_change = None if elems[1].text in ('NEW', 'RE') else 0 if elems[1].text == '=' else get_num(elems[1].text)
                days = get_num(elems[3].text)
                peak = get_num(elems[4].text)
                peak_x = get_num(elems[5].text[2:-1])
                streams = get_num(elems[6].text)
                streams_change = get_num(elems[7].text)
                week = get_num(elems[8].text)
                week_change = get_num(elems[9].text)
                total = get_num(elems[10].text)

                positions_against_streams[position] = streams

    return positions_against_streams


def normalise(vals):
    normalising_constant = sum(vals)
    vals = [val / normalising_constant for val in vals]
    return vals


def zipf(rank, a, b):
    return 1 / (rank + b) ** a


def fit_model(positions, streams):
    # Fit the curve
    params, _ = opt.curve_fit(zipf, positions, streams, p0=[1, 2.7])

    # Extract fitted parameters
    ahat, bhat = params
    print(f"Fitted a: {ahat}, Fitted b: {bhat}")
    return ahat, bhat


def plot():
    positions_against_streams = fetch_track_data()
    positions = np.array(list(positions_against_streams.keys()))
    streams = np.array(normalise(list(positions_against_streams.values())))

    # Create plot of data
    plt.plot(positions, streams, color='blue', linestyle='-', marker='o')

    # Create plot of fitted model
    ahat, bhat = fit_model(positions, streams)
    plt.plot(positions, 1 / (positions + bhat) ** ahat, color='red', linestyle='-', marker='o')
             
    # Labels and title
    plt.xlabel("Positions")
    plt.ylabel("Streams")
    plt.title("Positions Against Streams")

    # Show plot
    plt.show()


if __name__ == "__main__":
    plot()

    # Fitted a: 1.1111910532171363, Fitted b: 47.44693360529382
