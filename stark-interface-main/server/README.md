This small server provides two endpoints to proxy local Ruflo and Hermes tools for the frontend.

- Start server:

```bash
cd server
npm install
npm start
```

- Endpoints:
  - `POST /api/ruflo` body `{ "args": ["...args"] }` runs Ruflo CLI
  - `POST /api/hermes` body `{ "args": ["...args"] }` runs Hermes Python script

Notes:
- The bridge spawns local processes. Ensure you have `node` and `python` available and the subprojects installed.
