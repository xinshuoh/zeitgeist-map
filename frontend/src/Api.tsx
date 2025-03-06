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

export function songCountryHistory(song_name: string) {
    console.log("api call")
    const res = fetch(serverUrl+`/song_country_history?country_code=${'gb'}&song_name=${song_name}`)
    return res;
}


export function searchComplete(prefix: string) {

}