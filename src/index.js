const axios = require("axios");
const acorn = require("acorn");

// search
// https://api.zombie-film.live/v2/franchise/search/?search=%D0%97%D0%BE&page=1&per-page=42&ref=https:%2F%2Fzombie-film.live&_format=json
// details
// https://api.zombie-film.live/v2/franchise/view/?slug=goryachaya-zona&season=2&findBy=details&ref=https:%2F%2Fzombie-film.live&_format=json

export function parseKinogramScript(script) {
  const program = acorn.parse(script);

  if (program) {
    const declaration = program.body.find((node) => {
      return (
        node.type === "VariableDeclaration" &&
        node.declarations.find(
          (_node) =>
            _node.type === "VariableDeclarator" &&
            _node.id.type === "Identifier" &&
            _node.id.name === "app"
        )
      );
    });

    if (declaration) {
      const declarator = declaration.declarations.find(
        (node) => node.type === "VariableDeclarator"
      );
      const args = declarator.init.arguments;
      const objectExpression = args.find(
        (node) => node.type === "ObjectExpression"
      );

      return objectExpression.properties
        .find((arg) => arg.key.name === "playlist")
        .value.properties.find((node) => node.key.name === "seasons")
        .value.elements.map((node) => {
          const season = node.properties.find(
            ({ key }) => key.value === "season"
          ).value.value;

          const episodes = node.properties
            .find(({ key }) => key.value === "episodes")
            .value.elements.map((el) => {
              const episode = el.properties.find(
                (p) => p.key.value === "episode"
              ).value.value;
              const hls = el.properties.find((p) => p.key.value === "hls").value
                .value;
              const duration = el.properties.find(
                (p) => p.key.value === "duration"
              ).value.value;
              const title = el.properties.find((p) => p.key.value === "title")
                .value.value;

              return {
                episode,
                hls,
                duration,
                title,
              };
            });

          return {
            season,
            episodes,
          };
        });
    }
  }

  return null;
}

axios.get("https://api.kinogram.best/embed/movie/353").then((response) => {
  const body = response.data;
  const re = /<script>(.*?)<\/script>/gmsu;
  let matches;
  while ((matches = re.exec(body)) !== null) {
    const script = matches[1];

    const result = parseKinogramScript(script);
    if (result !== null) {
      console.log(`passed`);

      console.log(result);

      break;
    }
  }
});
