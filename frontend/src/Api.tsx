import { formatDate } from "./Util";

const serverUrl = "http://127.0.0.1:5000"

export function ping() {
    var xhr = new XMLHttpRequest()
    xhr.open('GET', serverUrl+'ping')
    var res = new Promise<boolean>((resolve, reject) => {
      xhr.addEventListener('load', () => {
        resolve(true);
      });
      xhr.addEventListener('timeout', () => {
        resolve(false);
      });
      xhr.addEventListener('error', () => {
        resolve(false);
      })
    });
    xhr.send()
    return res;
}

export function countryTopTracks(countryCode: string) {
    var xhr = new XMLHttpRequest()
    xhr.open('GET', serverUrl+`/country_top_tracks?country_code=${countryCode.toLowerCase()}`)
    var res = new Promise((resolve, reject) => {
      xhr.addEventListener('load', () => {
        var data = JSON.parse(xhr.responseText)
        resolve(data)
        //resolve(data.map((song:any) => Object({song: song, genre: "todo", streams: "todo"})))
      })
    });
    xhr.send()
    return res
    //return { country: countryName, topArtist: "Example Artist", genre: "Pop", streams: "10M+" };
};

export function countryCompare(countryCode: string) {
    var xhr = new XMLHttpRequest()
    xhr.open('GET', serverUrl+`/country_compare?country_code=${countryCode.toLowerCase()}`)
    var res = new Promise((resolve, reject) => {
      xhr.addEventListener('load', () => {
        var data = JSON.parse(xhr.responseText)
        resolve(data)
      })
    });
    xhr.send()
    return res
};

export function songTopCountries(songName: string) {
  const res = fetch(serverUrl+`/song_top_countries?name=${songName}`)
  return res
}

export function songCountryHistory(song_name: string) {
    console.log("API call (songCountryHistory)");
    const res = fetch(serverUrl + `/song_country_history?country_code=${'gb'}&song_name=${song_name}`);
    return res;
}

export function artistCountryHistory(artist_name: string) {
    console.log("API call (artistCountryHistory)");
    const res = fetch(serverUrl + `/artist_country_history?country_code=${'gb'}&artist_name=${artist_name}`);
    return res;
}

export const fetchSearchComplete = async (prefix: string) => {
  //if (!serverResponsive) return [];
  var xhr = new XMLHttpRequest();
  xhr.open('GET', `${serverUrl}/search_complete?prefix=${prefix}`)
  var res = new Promise((resolve, reject) => {
    xhr.addEventListener('load', () => {
      var data = JSON.parse(xhr.responseText);
      resolve(data);
    });
  });
  xhr.send();
  return await res;
}

export function heatMapPopularity(date: Date, name: string) {
  return fetch(serverUrl+`/heat_map_popularity?date=${formatDate(date)}&name=${name}`)
}

export const fetchMusicStats = async (countryCode: string, stat: string) => {
  //if (!serverResponsive) return [];
  var xhr = new XMLHttpRequest();
  xhr.open('GET', `${serverUrl}/${stat}?country_code=${countryCode.toLowerCase()}`)
  var res = new Promise((resolve, reject) => {
    xhr.addEventListener('load', () => {
      var data = JSON.parse(xhr.responseText);
      resolve(data);
    });
  });
  xhr.send();
  return await res;
};

export const fetchCountryCompareData = async (countryCode: string) => {
  //if (!serverResponsive) return [];
  var xhr = new XMLHttpRequest();
  xhr.open('GET', `${serverUrl}/country_compare?country_code=${countryCode.toLowerCase()}`);
  var res = new Promise((resolve, reject) => {
    xhr.addEventListener('load', () => {
      var data = JSON.parse(xhr.responseText);
      resolve(data);
    });
  });
  xhr.send();
  return await res as CountrySimilarityData[];
};