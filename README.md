# RPG Game 

Simple browser RPG with a Spring Boot backend and React frontend, bundled together into a single app build.

You can also try the container image on Docker Hub:
[https://hub.docker.com/r/aimelih/rpg-game](https://hub.docker.com/r/aimelih/rpg-game)

## Local Development

Backend:

```bash
.\mvnw.cmd spring-boot:run
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server runs on `http://localhost:5173` and talks to the Spring backend on `http://localhost:8080`.

## Persistence

Game progress is stored in a file-backed H2 database.

- Local default path: `./data/rpggame`
- Config key: `SPRING_DATASOURCE_URL`

## Docker

Build the image:

```bash
docker build -t rpg-game-back .
```

Run it directly with a persistent volume:

```bash
docker run -p 8080:8080 -v rpg-game-data:/app/data rpg-game-back
```

The container stores save data in `/app/data`.

## Docker Compose

Start the app with the included Compose file:

```bash
docker compose up --build
```

This will:

- build the app image
- expose the game on `http://localhost:8080`
- persist H2 save data in the named volume `rpg-game-data`

Stop the app:

```bash
docker compose down
```

Stop the app and remove the save volume too:

```bash
docker compose down -v
```
