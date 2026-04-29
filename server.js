const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = Number(process.env.PORT || 3001);
const HOST = process.env.HOST || "0.0.0.0";
const PUBLIC_DIR = path.join(__dirname, "public");
const MAX_PLAYERS = 300;

const challenges = [
  { continent: "Africa", name: "Algeria", code: "dz" },
  { continent: "Africa", name: "Angola", code: "ao" },
  { continent: "Africa", name: "Benin", code: "bj" },
  { continent: "Africa", name: "Botswana", code: "bw" },
  { continent: "Africa", name: "Burkina Faso", code: "bf" },
  { continent: "Africa", name: "Burundi", code: "bi" },
  { continent: "Africa", name: "Cape Verde", code: "cv" },
  { continent: "Africa", name: "Cameroon", code: "cm" },
  { continent: "Africa", name: "Central African Republic", code: "cf" },
  { continent: "Africa", name: "Chad", code: "td" },
  { continent: "Africa", name: "Comoros", code: "km" },
  { continent: "Africa", name: "Republic of the Congo", code: "cg" },
  { continent: "Africa", name: "Democratic Republic of the Congo", code: "cd" },
  { continent: "Africa", name: "Cote d'Ivoire", code: "ci" },
  { continent: "Africa", name: "Djibouti", code: "dj" },
  { continent: "Africa", name: "Egypt", code: "eg" },
  { continent: "Africa", name: "Equatorial Guinea", code: "gq" },
  { continent: "Africa", name: "Eritrea", code: "er" },
  { continent: "Africa", name: "Eswatini", code: "sz" },
  { continent: "Africa", name: "Ethiopia", code: "et" },
  { continent: "Africa", name: "Gabon", code: "ga" },
  { continent: "Africa", name: "Gambia", code: "gm" },
  { continent: "Africa", name: "Ghana", code: "gh" },
  { continent: "Africa", name: "Guinea", code: "gn" },
  { continent: "Africa", name: "Guinea-Bissau", code: "gw" },
  { continent: "Africa", name: "Kenya", code: "ke" },
  { continent: "Africa", name: "Lesotho", code: "ls" },
  { continent: "Africa", name: "Liberia", code: "lr" },
  { continent: "Africa", name: "Libya", code: "ly" },
  { continent: "Africa", name: "Madagascar", code: "mg" },
  { continent: "Africa", name: "Malawi", code: "mw" },
  { continent: "Africa", name: "Mali", code: "ml" },
  { continent: "Africa", name: "Mauritania", code: "mr" },
  { continent: "Africa", name: "Mauritius", code: "mu" },
  { continent: "Africa", name: "Morocco", code: "ma" },
  { continent: "Africa", name: "Mozambique", code: "mz" },
  { continent: "Africa", name: "Namibia", code: "na" },
  { continent: "Africa", name: "Niger", code: "ne" },
  { continent: "Africa", name: "Nigeria", code: "ng" },
  { continent: "Africa", name: "Rwanda", code: "rw" },
  { continent: "Africa", name: "Sao Tome and Principe", code: "st" },
  { continent: "Africa", name: "Senegal", code: "sn" },
  { continent: "Africa", name: "Seychelles", code: "sc" },
  { continent: "Africa", name: "Sierra Leone", code: "sl" },
  { continent: "Africa", name: "Somalia", code: "so" },
  { continent: "Africa", name: "South Africa", code: "za" },
  { continent: "Africa", name: "South Sudan", code: "ss" },
  { continent: "Africa", name: "Sudan", code: "sd" },
  { continent: "Africa", name: "Tanzania", code: "tz" },
  { continent: "Africa", name: "Togo", code: "tg" },
  { continent: "Africa", name: "Tunisia", code: "tn" },
  { continent: "Africa", name: "Uganda", code: "ug" },
  { continent: "Africa", name: "Zambia", code: "zm" },
  { continent: "Africa", name: "Zimbabwe", code: "zw" },
  { continent: "Asia", name: "Afghanistan", code: "af" },
  { continent: "Asia", name: "Armenia", code: "am" },
  { continent: "Asia", name: "Azerbaijan", code: "az" },
  { continent: "Asia", name: "Bahrain", code: "bh" },
  { continent: "Asia", name: "Bangladesh", code: "bd" },
  { continent: "Asia", name: "Bhutan", code: "bt" },
  { continent: "Asia", name: "Brunei", code: "bn" },
  { continent: "Asia", name: "Cambodia", code: "kh" },
  { continent: "Asia", name: "China", code: "cn" },
  { continent: "Asia", name: "Cyprus", code: "cy" },
  { continent: "Asia", name: "Georgia", code: "ge" },
  { continent: "Asia", name: "India", code: "in" },
  { continent: "Asia", name: "Indonesia", code: "id" },
  { continent: "Asia", name: "Iran", code: "ir" },
  { continent: "Asia", name: "Iraq", code: "iq" },
  { continent: "Asia", name: "Israel", code: "il" },
  { continent: "Asia", name: "Japan", code: "jp" },
  { continent: "Asia", name: "Jordan", code: "jo" },
  { continent: "Asia", name: "Kazakhstan", code: "kz" },
  { continent: "Asia", name: "Kuwait", code: "kw" },
  { continent: "Asia", name: "Kyrgyzstan", code: "kg" },
  { continent: "Asia", name: "Laos", code: "la" },
  { continent: "Asia", name: "Lebanon", code: "lb" },
  { continent: "Asia", name: "Malaysia", code: "my" },
  { continent: "Asia", name: "Maldives", code: "mv" },
  { continent: "Asia", name: "Mongolia", code: "mn" },
  { continent: "Asia", name: "Myanmar", code: "mm" },
  { continent: "Asia", name: "Nepal", code: "np" },
  { continent: "Asia", name: "North Korea", code: "kp" },
  { continent: "Asia", name: "Oman", code: "om" },
  { continent: "Asia", name: "Pakistan", code: "pk" },
  { continent: "Asia", name: "Palestine", code: "ps" },
  { continent: "Asia", name: "Philippines", code: "ph" },
  { continent: "Asia", name: "Qatar", code: "qa" },
  { continent: "Asia", name: "Saudi Arabia", code: "sa" },
  { continent: "Asia", name: "Singapore", code: "sg" },
  { continent: "Asia", name: "South Korea", code: "kr" },
  { continent: "Asia", name: "Sri Lanka", code: "lk" },
  { continent: "Asia", name: "Syria", code: "sy" },
  { continent: "Asia", name: "Taiwan", code: "tw" },
  { continent: "Asia", name: "Tajikistan", code: "tj" },
  { continent: "Asia", name: "Thailand", code: "th" },
  { continent: "Asia", name: "Timor-Leste", code: "tl" },
  { continent: "Asia", name: "Turkey", code: "tr", aliases: ["turkiye"] },
  { continent: "Asia", name: "Turkmenistan", code: "tm" },
  { continent: "Asia", name: "United Arab Emirates", code: "ae", aliases: ["uae"] },
  { continent: "Asia", name: "Uzbekistan", code: "uz" },
  { continent: "Asia", name: "Vietnam", code: "vn" },
  { continent: "Asia", name: "Yemen", code: "ye" },
  { continent: "Europe", name: "Albania", code: "al" },
  { continent: "Europe", name: "Andorra", code: "ad" },
  { continent: "Europe", name: "Austria", code: "at" },
  { continent: "Europe", name: "Belarus", code: "by" },
  { continent: "Europe", name: "Belgium", code: "be" },
  { continent: "Europe", name: "Bosnia and Herzegovina", code: "ba" },
  { continent: "Europe", name: "Bulgaria", code: "bg" },
  { continent: "Europe", name: "Croatia", code: "hr" },
  { continent: "Europe", name: "Czechia", code: "cz" },
  { continent: "Europe", name: "Denmark", code: "dk" },
  { continent: "Europe", name: "Estonia", code: "ee" },
  { continent: "Europe", name: "Finland", code: "fi" },
  { continent: "Europe", name: "France", code: "fr" },
  { continent: "Europe", name: "Germany", code: "de" },
  { continent: "Europe", name: "Greece", code: "gr" },
  { continent: "Europe", name: "Hungary", code: "hu" },
  { continent: "Europe", name: "Iceland", code: "is" },
  { continent: "Europe", name: "Ireland", code: "ie" },
  { continent: "Europe", name: "Italy", code: "it" },
  { continent: "Europe", name: "Latvia", code: "lv" },
  { continent: "Europe", name: "Liechtenstein", code: "li" },
  { continent: "Europe", name: "Lithuania", code: "lt" },
  { continent: "Europe", name: "Luxembourg", code: "lu" },
  { continent: "Europe", name: "Malta", code: "mt" },
  { continent: "Europe", name: "Moldova", code: "md" },
  { continent: "Europe", name: "Monaco", code: "mc" },
  { continent: "Europe", name: "Montenegro", code: "me" },
  { continent: "Europe", name: "Netherlands", code: "nl", aliases: ["holland"] },
  { continent: "Europe", name: "North Macedonia", code: "mk" },
  { continent: "Europe", name: "Norway", code: "no" },
  { continent: "Europe", name: "Poland", code: "pl" },
  { continent: "Europe", name: "Portugal", code: "pt" },
  { continent: "Europe", name: "Romania", code: "ro" },
  { continent: "Europe", name: "Russia", code: "ru" },
  { continent: "Europe", name: "San Marino", code: "sm" },
  { continent: "Europe", name: "Serbia", code: "rs" },
  { continent: "Europe", name: "Slovakia", code: "sk" },
  { continent: "Europe", name: "Slovenia", code: "si" },
  { continent: "Europe", name: "Spain", code: "es" },
  { continent: "Europe", name: "Sweden", code: "se" },
  { continent: "Europe", name: "Switzerland", code: "ch" },
  { continent: "Europe", name: "Ukraine", code: "ua" },
  { continent: "Europe", name: "United Kingdom", code: "gb", aliases: ["uk", "great britain", "britain"] },
  { continent: "Europe", name: "Vatican City", code: "va" },
  { continent: "Europe", name: "Kosovo", code: "xk" },
  { continent: "Europe", name: "Gibraltar", code: "gi" },
  { continent: "Europe", name: "Faroe Islands", code: "fo" },
  { continent: "Europe", name: "Greenland", code: "gl" },
  { continent: "Europe", name: "Isle of Man", code: "im" },
  { continent: "Europe", name: "Jersey", code: "je" },
  { continent: "North America", name: "Antigua and Barbuda", code: "ag" },
  { continent: "North America", name: "Bahamas", code: "bs" },
  { continent: "North America", name: "Barbados", code: "bb" },
  { continent: "North America", name: "Belize", code: "bz" },
  { continent: "North America", name: "Canada", code: "ca" },
  { continent: "North America", name: "Costa Rica", code: "cr" },
  { continent: "North America", name: "Cuba", code: "cu" },
  { continent: "North America", name: "Dominica", code: "dm" },
  { continent: "North America", name: "Dominican Republic", code: "do" },
  { continent: "North America", name: "El Salvador", code: "sv" },
  { continent: "North America", name: "Grenada", code: "gd" },
  { continent: "North America", name: "Guatemala", code: "gt" },
  { continent: "North America", name: "Haiti", code: "ht" },
  { continent: "North America", name: "Honduras", code: "hn" },
  { continent: "North America", name: "Jamaica", code: "jm" },
  { continent: "North America", name: "Mexico", code: "mx" },
  { continent: "North America", name: "Nicaragua", code: "ni" },
  { continent: "North America", name: "Panama", code: "pa" },
  { continent: "North America", name: "Saint Kitts and Nevis", code: "kn" },
  { continent: "North America", name: "Saint Lucia", code: "lc" },
  { continent: "North America", name: "Saint Vincent and the Grenadines", code: "vc" },
  { continent: "North America", name: "Trinidad and Tobago", code: "tt" },
  { continent: "North America", name: "United States", code: "us", aliases: ["usa", "america", "us"] },
  { continent: "South America", name: "Argentina", code: "ar" },
  { continent: "South America", name: "Bolivia", code: "bo" },
  { continent: "South America", name: "Brazil", code: "br" },
  { continent: "South America", name: "Chile", code: "cl" },
  { continent: "South America", name: "Colombia", code: "co" },
  { continent: "South America", name: "Ecuador", code: "ec" },
  { continent: "South America", name: "Guyana", code: "gy" },
  { continent: "South America", name: "Paraguay", code: "py" },
  { continent: "South America", name: "Peru", code: "pe" },
  { continent: "South America", name: "Suriname", code: "sr" },
  { continent: "South America", name: "Uruguay", code: "uy" },
  { continent: "South America", name: "Venezuela", code: "ve" },
  { continent: "South America", name: "Falkland Islands", code: "fk" },
  { continent: "South America", name: "French Guiana", code: "gf" },
  { continent: "Oceania", name: "Australia", code: "au" },
  { continent: "Oceania", name: "New Zealand", code: "nz" },
  { continent: "Oceania", name: "Fiji", code: "fj" },
  { continent: "Oceania", name: "Papua New Guinea", code: "pg" },
  { continent: "Oceania", name: "Samoa", code: "ws" },
  { continent: "Oceania", name: "Tonga", code: "to" },
  { continent: "Oceania", name: "Vanuatu", code: "vu" },
  { continent: "Oceania", name: "Solomon Islands", code: "sb" },
  { continent: "Oceania", name: "Kiribati", code: "ki" },
  { continent: "Oceania", name: "Tuvalu", code: "tv" }
].map(country => ({
  ...country,
  id: `flag-${country.code}`,
  aliases: [normalizeAnswer(country.name), ...(country.aliases || []).map(normalizeAnswer)]
}));

const clients = new Map();
const players = new Map();
let hostId = null;

const game = {
  round: 1,
  status: "waiting",
  challengeId: null,
  options: [],
  winners: [],
  musicOn: false,
  winnerId: null,
  lastGuess: null
};

function cleanName(name) {
  return String(name || "")
    .replace(/[^\w .'-]/g, "")
    .trim()
    .slice(0, 22) || "Player";
}

function normalizeAnswer(answer) {
  return String(answer || "")
    .toLowerCase()
    .replace(/[^a-z ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function onlinePlayers() {
  return [...players.values()]
    .filter(player => player.online)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
}

function ensureHost() {
  if (hostId && players.get(hostId)?.online && isHostName(players.get(hostId).name)) return;
  const nextHost = onlinePlayers().find(player => isHostName(player.name));
  hostId = nextHost ? nextHost.id : null;
}

function isHostName(name) {
  return /^sukumar/i.test(String(name || "").trim());
}

function currentChallenge() {
  return challenges.find(challenge => challenge.id === game.challengeId) || null;
}

function shuffled(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function makeOptions(challenge) {
  const distractors = shuffled(challenges.filter(item => item.id !== challenge.id))
    .slice(0, 4)
    .map(item => item.name);
  return shuffled([challenge.name, ...distractors]);
}

function publicState(viewerId = "") {
  ensureHost();
  const challenge = currentChallenge();
  const winner = game.winnerId ? players.get(game.winnerId) : null;
  const viewer = players.get(viewerId);
  return {
    maxPlayers: MAX_PLAYERS,
    round: game.round,
    status: game.status,
    musicOn: game.musicOn,
    hostId,
    challenge: challenge ? { id: challenge.id, code: challenge.code } : null,
    options: game.options,
    answer: game.status === "won" && challenge ? challenge.name : null,
    winnerName: winner ? winner.name : null,
    winners: game.winners.map(({ playerId, points }) => ({
      playerId,
      name: players.get(playerId)?.name || "Player",
      points
    })),
    lastGuess: game.lastGuess,
    myWrongGuesses: viewer ? viewer.wrongGuesses || [] : [],
    challenges: challenges.map(({ id, continent, name }) => ({ id, continent, name })),
    players: onlinePlayers().map(({ id, name, score, online, roundAttempts = 0, roundCorrect = false }) => ({
      id,
      name,
      score,
      roundAttempts: id === viewerId ? roundAttempts : 0,
      triesLeft: id === viewerId ? Math.max(0, 2 - roundAttempts) : null,
      roundCorrect: id === viewerId ? roundCorrect : false,
      online,
      isHost: id === hostId
    }))
  };
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 10000) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

function broadcast() {
  for (const client of clients.values()) {
    client.res.write(`data: ${JSON.stringify(publicState(client.playerId))}\n\n`);
  }
}

function startRound(playerId, challengeId) {
  ensureHost();
  if (playerId !== hostId) return { ok: false, error: "Only the host can start a round." };
  if (!challenges.some(challenge => challenge.id === challengeId)) {
    return { ok: false, error: "Choose a flag first." };
  }
  game.round += game.challengeId ? 1 : 0;
  game.challengeId = challengeId;
  game.options = makeOptions(currentChallenge());
  game.status = "playing";
  game.winners = [];
  game.winnerId = null;
  game.lastGuess = null;
  for (const player of players.values()) {
    player.wrongGuesses = [];
    player.roundAttempts = 0;
    player.roundCorrect = false;
  }
  return { ok: true };
}

function resetGame(playerId) {
  ensureHost();
  if (playerId !== hostId) return { ok: false, error: "Only the host can reset the game." };
  game.round = 1;
  game.status = "waiting";
  game.challengeId = null;
  game.options = [];
  game.winners = [];
  game.winnerId = null;
  game.lastGuess = null;
  for (const player of players.values()) {
    player.score = 0;
    player.wrongGuesses = [];
    player.roundAttempts = 0;
    player.roundCorrect = false;
  }
  return { ok: true };
}

function endGame() {
  game.round = 1;
  game.status = "waiting";
  game.challengeId = null;
  game.options = [];
  game.winners = [];
  game.musicOn = false;
  game.winnerId = null;
  game.lastGuess = null;
  players.clear();
  hostId = null;
}

function submitGuess(playerId, guessText) {
  const player = players.get(playerId);
  const challenge = currentChallenge();
  if (!player || !player.online) return { ok: false, error: "Join the game before guessing." };
  if (game.status !== "playing" || !challenge) return { ok: false, error: "Waiting for the host to start a round." };
  if (player.roundCorrect) return { ok: false, error: "You already answered correctly this round." };
  if ((player.roundAttempts || 0) >= 2) return { ok: false, error: "You used both tries for this round." };

  const guess = normalizeAnswer(guessText);
  if (!guess) return { ok: false, error: "Choose an answer first." };
  if ((player.wrongGuesses || []).includes(guess)) {
    return { ok: false, error: "You already tried that guess." };
  }

  const isCorrect = challenge.aliases.includes(guess);
  game.lastGuess = { playerName: player.name, hit: isCorrect };
  player.roundAttempts = (player.roundAttempts || 0) + 1;

  if (isCorrect) {
    const pointsByPlace = [10, 5, 3];
    const points = pointsByPlace[game.winners.length] || 0;
    player.roundCorrect = true;
    if (points > 0) player.score += points;
    game.winners.push({ playerId: player.id, points });
    game.winnerId = game.winners[0].playerId;
    if (game.winners.length >= 3) game.status = "won";
  } else {
    player.wrongGuesses = [...(player.wrongGuesses || []), guess].slice(-5);
  }

  broadcast();
  return { ok: true, correct: isCorrect };
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const requested = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = path.normalize(path.join(PUBLIC_DIR, requested));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const type = {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "text/javascript; charset=utf-8"
    }[path.extname(filePath)] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    res.end(data);
  });
}

async function handleApi(req, res) {
  try {
    if (req.method === "GET" && req.url.startsWith("/api/state")) {
      const url = new URL(req.url, `http://${req.headers.host}`);
      sendJson(res, 200, publicState(url.searchParams.get("playerId") || ""));
      return;
    }

    if (req.method === "POST" && req.url === "/api/join") {
      const body = await readBody(req);
      const existingId = String(body.playerId || "");
      const name = cleanName(body.name);
      let id = existingId && players.has(existingId) ? existingId : crypto.randomUUID();
      let player = players.get(id);
      if (!player && onlinePlayers().length >= MAX_PLAYERS) {
        sendJson(res, 429, { ok: false, error: "This room is full. Try again later." });
        return;
      }
      if (!player) {
        player = { id, name, score: 0, wrongGuesses: [], online: true };
        players.set(id, player);
      }
      player.name = name;
      player.online = true;
      ensureHost();
      broadcast();
      sendJson(res, 200, { ok: true, playerId: id, state: publicState(id) });
      return;
    }

    if (req.method === "POST" && req.url === "/api/start") {
      const body = await readBody(req);
      const playerId = String(body.playerId || "");
      const result = startRound(playerId, String(body.challengeId || ""));
      if (!result.ok) {
        sendJson(res, 403, result);
        return;
      }
      broadcast();
      sendJson(res, 200, { ok: true, state: publicState(playerId) });
      return;
    }

    if (req.method === "POST" && req.url === "/api/guess") {
      const body = await readBody(req);
      const result = submitGuess(String(body.playerId || ""), body.guess);
      sendJson(res, result.ok ? 200 : 400, result);
      return;
    }

    if (req.method === "POST" && req.url === "/api/reset") {
      const body = await readBody(req);
      const playerId = String(body.playerId || "");
      const result = resetGame(playerId);
      if (!result.ok) {
        sendJson(res, 403, result);
        return;
      }
      broadcast();
      sendJson(res, 200, { ok: true, state: publicState(playerId) });
      return;
    }

    if (req.method === "POST" && req.url === "/api/music") {
      const body = await readBody(req);
      const playerId = String(body.playerId || "");
      ensureHost();
      if (playerId !== hostId) {
        sendJson(res, 403, { ok: false, error: "Only the host can control music." });
        return;
      }
      game.musicOn = Boolean(body.musicOn);
      broadcast();
      sendJson(res, 200, { ok: true, state: publicState(playerId) });
      return;
    }

    if (req.method === "POST" && req.url === "/api/end") {
      const body = await readBody(req);
      const playerId = String(body.playerId || "");
      ensureHost();
      if (!players.has(playerId)) {
        sendJson(res, 403, { ok: false, error: "Join the game before ending it." });
        return;
      }
      if (playerId !== hostId) {
        sendJson(res, 403, { ok: false, error: "Only the host can end the game." });
        return;
      }
      endGame();
      broadcast();
      sendJson(res, 200, { ok: true, state: publicState() });
      return;
    }

    if (req.method === "POST" && req.url === "/api/logout") {
      const body = await readBody(req);
      const playerId = String(body.playerId || "");
      if (players.has(playerId)) {
        players.delete(playerId);
        if (hostId === playerId) hostId = null;
        ensureHost();
        broadcast();
      }
      sendJson(res, 200, { ok: true, state: publicState() });
      return;
    }

    sendJson(res, 404, { ok: false, error: "Unknown API route." });
  } catch (error) {
    sendJson(res, 400, { ok: false, error: "Bad request." });
  }
}

function handleEvents(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const playerId = url.searchParams.get("playerId");
  if (playerId && players.has(playerId)) players.get(playerId).online = true;
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no"
  });
  res.write(`data: ${JSON.stringify(publicState(playerId))}\n\n`);
  const clientId = crypto.randomUUID();
  clients.set(clientId, { res, playerId });
  req.on("close", () => {
    clients.delete(clientId);
    if (playerId && players.has(playerId)) {
      setTimeout(() => {
        const hasOpenClient = [...clients.values()].some(client => client.playerId === playerId);
        if (!hasOpenClient && players.has(playerId)) {
          players.get(playerId).online = false;
          ensureHost();
          broadcast();
        }
      }, 3000);
    }
  });
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith("/events")) {
    handleEvents(req, res);
    return;
  }
  if (req.url.startsWith("/api/")) {
    handleApi(req, res);
    return;
  }
  serveStatic(req, res);
});

server.listen(PORT, HOST, () => {
  console.log(`Guess the Flag is running at http://localhost:${PORT}`);
});
