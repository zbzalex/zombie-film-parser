const axios = require('axios');

// search
// https://api.zombie-film.live/v2/franchise/search/?search=%D0%97%D0%BE&page=1&per-page=42&ref=https:%2F%2Fzombie-film.live&_format=json
// details
// https://api.zombie-film.live/v2/franchise/view/?slug=goryachaya-zona&season=2&findBy=details&ref=https:%2F%2Fzombie-film.live&_format=json

function parseKinogramScript(source) {
  if (/var app = makePlayer\(/i.exec(source) !== null) {
    const result = eval(`(function() {
      function makePlayer(options) {
        return options;
      }

      ${source}
      ;

      return app;
    })
    `)();

    return result.playlist.seasons;
  }

  return null;
}

axios.get('https://api.kinogram.best/embed/movie/353').then((response) => {
  const body = response.data;
  const re = /<script>(.*?)<\/script>/gmsu;
  let matches;
  while ((matches = re.exec(body)) !== null) {
    const script = matches[1];

    const result = parseKinogramScript(script);
    if (result !== null) {
      // result.forEach((item) => {
      //   item.episodes.forEach(episode => {
      //     console.log(episode.hls)
      //   })
      // });

      break;
    }
  }
});
