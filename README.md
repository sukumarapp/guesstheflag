# Guess the Flag

A dependency-free multiplayer browser game for up to 300 players.

## Run locally

```powershell
node server.js
```

Open `http://localhost:3001`.

## How To Play

1. Players enter a name and join.
2. The first player to join becomes the host.
3. The host chooses a continent, then a country from the 200-flag list, and starts the round.
4. Players choose from 5 answer options.
5. Each player can try up to 2 answers per round.
6. The first correct answer gets 10 points, second gets 5 points, and third gets 3 points.
7. The host starts the next round or resets the game.

## Host Online

Deploy it as a Node web service.

Start command:

```bash
node server.js
```

The app reads `process.env.PORT` and listens on `0.0.0.0`, so it is ready for Render.
