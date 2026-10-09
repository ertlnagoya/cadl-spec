# CADL Specification Site (cadl-spec)

This repository hosts the specification and teaching materials for **CADL (Contract Architecture Description Language)** and its **SoS-DSL extension**. The site is built with [Docusaurus](https://docusaurus.io/) and published at:

**https://www.ertl.jp/cadl-spec/**

## Hands-on

A self-paced workshop of about 95 minutes and a 5-session exercise course that walk through the complete CADL / SoS-DSL toolchain — modelling, contracts (lifecycle + monitors), visualisation, code generation, and live simulation — on a robot-delivery System of Systems.

| Material | English | 日本語 |
| --- | --- | --- |
| Hands-on index | [docs/handson](https://www.ertl.jp/cadl-spec/docs/handson/) | [ja/docs/handson](https://www.ertl.jp/cadl-spec/ja/docs/handson/) |
| Why SoS-DSL? (background for learners) | [academic-background](https://www.ertl.jp/cadl-spec/docs/handson/academic-background) | [ja](https://www.ertl.jp/cadl-spec/ja/docs/handson/academic-background) |
| Course A — Robot Delivery (main textbook) | [main-textbook](https://www.ertl.jp/cadl-spec/docs/handson/main-textbook) | [ja](https://www.ertl.jp/cadl-spec/ja/docs/handson/main-textbook) |
| Course A — Exercises | [exercises](https://www.ertl.jp/cadl-spec/docs/handson/exercises) | [ja](https://www.ertl.jp/cadl-spec/ja/docs/handson/exercises) |
| Course B — Urban Mobility (CADL × SUMO) | [mobility-sos-tutorial](https://www.ertl.jp/cadl-spec/docs/handson/mobility-sos-tutorial) | [ja](https://www.ertl.jp/cadl-spec/ja/docs/handson/mobility-sos-tutorial) |

Sources live under [`docs/handson/`](docs/handson/) (English) and [`i18n/ja/docusaurus-plugin-content-docs/current/handson/`](i18n/ja/docusaurus-plugin-content-docs/current/handson/) (Japanese).

The runnable toolchain referenced by the hands-on lives in the companion repositories: [`cadl`](https://github.com/ertlnagoya/cadl) (compiler / CLI) and [`cadl-explorer`](https://github.com/ertlnagoya/cadl-explorer) (visualisation). The simulator used in Course A Steps 5–6 is [`cadl-raspimouse-simulator`](https://github.com/ertlnagoya/cadl-raspimouse-simulator) (Unity scene + arbitrator + Python runtime).

## Development

### Installation

```bash
npm install
```

### Local Development

```bash
npm run start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

To preview the Japanese pages locally:

```bash
npm run start -- --locale ja
```

### Build

```bash
npm run build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Deployment

Using SSH:

```bash
USE_SSH=true npm run deploy
```

Not using SSH:

```bash
GIT_USER=<Your GitHub username> npm run deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.

## License

- **Documentation** (the text and figures under `docs/` and `i18n/`): [Creative Commons Attribution 4.0 International (CC BY 4.0)](LICENSE-docs).
- **Code** (the CADL and other code examples embedded in the documentation, and the site source under `src/` and the configuration files): [Apache License 2.0](LICENSE).

Copyright © 2026 ERTL, Graduate School of Informatics, Nagoya University.
