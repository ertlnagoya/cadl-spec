# CADL Specification Site (cadl-spec)

This repository hosts the specification and teaching materials for **CADL (Contract Architecture Description Language)** and its **SoS-DSL extension**. The site is built with [Docusaurus](https://docusaurus.io/) and published at:

**https://ertlnagoya.github.io/cadl-spec/**

## Hands-on

A self-paced 90-minute workshop and a 5-session exercise course that walk through the complete CADL / SoS-DSL toolchain — modelling, contracts (lifecycle + monitors), visualisation, code generation, and live simulation — on a robot-delivery System of Systems.

| Material | English | 日本語 |
| --- | --- | --- |
| Hands-on index | [docs/handson](https://ertlnagoya.github.io/cadl-spec/docs/handson/) | [ja/docs/handson](https://ertlnagoya.github.io/cadl-spec/ja/docs/handson/) |
| Why SoS-DSL? (background for learners) | [academic-background](https://ertlnagoya.github.io/cadl-spec/docs/handson/academic-background) | [ja](https://ertlnagoya.github.io/cadl-spec/ja/docs/handson/academic-background) |
| Course A — Robot Delivery (main textbook) | [main-textbook](https://ertlnagoya.github.io/cadl-spec/docs/handson/main-textbook) | [ja](https://ertlnagoya.github.io/cadl-spec/ja/docs/handson/main-textbook) |
| Course A — Exercises | [exercises](https://ertlnagoya.github.io/cadl-spec/docs/handson/exercises) | [ja](https://ertlnagoya.github.io/cadl-spec/ja/docs/handson/exercises) |
| Course B — Urban Mobility (CADL × SUMO) | [mobility-sos-tutorial](https://ertlnagoya.github.io/cadl-spec/docs/handson/mobility-sos-tutorial) | [ja](https://ertlnagoya.github.io/cadl-spec/ja/docs/handson/mobility-sos-tutorial) |
| PBL Course Design (for instructors) | [pbl-course-design](https://ertlnagoya.github.io/cadl-spec/docs/handson/pbl-course-design) | [ja](https://ertlnagoya.github.io/cadl-spec/ja/docs/handson/pbl-course-design) |

Sources live under [`docs/handson/`](docs/handson/) (English) and [`i18n/ja/docusaurus-plugin-content-docs/current/handson/`](i18n/ja/docusaurus-plugin-content-docs/current/handson/) (Japanese).

The runnable toolchain referenced by the hands-on lives in the companion repositories: [`cadl`](https://github.com/ertlnagoya/cadl) (compiler / CLI), [`cadl-explorer`](https://github.com/ertlnagoya/cadl-explorer) (visualisation), and [`raspimouse-swarm-simulator`](https://github.com/ertlnagoya/raspimouse-swarm-simulator) (Unity scene + arbitrator + Python runtime).

## Development

### Installation

```bash
yarn
```

### Local Development

```bash
yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

To preview the Japanese pages locally:

```bash
yarn start --locale ja
```

### Build

```bash
yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Deployment

Using SSH:

```bash
USE_SSH=true yarn deploy
```

Not using SSH:

```bash
GIT_USER=<Your GitHub username> yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.
