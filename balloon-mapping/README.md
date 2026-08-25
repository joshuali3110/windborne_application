# Frontend

React app (bootstrapped with Create React App) that displays WindBorne balloon constellation positions on a Leaflet map, with hourly pages showing wind direction arrows.

## Setup

```bash
cd balloon-mapping
npm install
```

## Running locally

```bash
npm start
```

Runs at [http://localhost:3000](http://localhost:3000). The page reloads on changes, and lint errors show in the console.

### Pointing at a backend

By default the app fetches data from the deployed backend, set in [src/App.js](src/App.js):

```js
const API_URL = process.env.REACT_APP_API_URL || "https://windborne-application-dg38.onrender.com";
```

To test against a locally running backend instead (see [../back-end/README.md](../back-end/README.md)), create a `.env.local` file in `balloon-mapping/` (gitignored, so it stays local to your machine):

```
REACT_APP_API_URL=http://127.0.0.1:8000
```

CRA only reads env files on startup, so restart `npm start` after adding or changing it. Without a `.env.local`, the app falls back to the deployed backend — this is what happens in production (Vercel), so no code change is needed to deploy.

## Other scripts

```bash
npm test        # run tests in interactive watch mode
npm run build    # production build into build/
```

## Learn More

Bootstrapped with [Create React App](https://github.com/facebook/create-react-app) — see the [CRA docs](https://facebook.github.io/create-react-app/docs/getting-started) for details on the underlying tooling (build config, deployment, etc).
