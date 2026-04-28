const state = {
  playerId: localStorage.getItem("flagMapPlayerId") || "",
  playerName: localStorage.getItem("flagMapPlayerName") || "",
  game: null,
  winnerCount: 0,
  audioContext: null
};

const els = {
  landingPage: document.querySelector("#landingPage"),
  gamePage: document.querySelector("#gamePage"),
  nameInput: document.querySelector("#nameInput"),
  joinButton: document.querySelector("#joinButton"),
  joinMessage: document.querySelector("#joinMessage"),
  onlineCount: document.querySelector("#onlineCount"),
  roundNumber: document.querySelector("#roundNumber"),
  visual: document.querySelector("#visual"),
  options: document.querySelector("#options"),
  message: document.querySelector("#message"),
  roundPoints: document.querySelector("#roundPoints"),
  hostTools: document.querySelector("#hostTools"),
  continentSelect: document.querySelector("#continentSelect"),
  challengeSelect: document.querySelector("#challengeSelect"),
  startButton: document.querySelector("#startButton"),
  resetButton: document.querySelector("#resetButton"),
  musicButton: document.querySelector("#musicButton"),
  backgroundMusic: document.querySelector("#backgroundMusic"),
  logoutButton: document.querySelector("#logoutButton"),
  capacity: document.querySelector("#capacity"),
  hostNotice: document.querySelector("#hostNotice"),
  players: document.querySelector("#players")
};

els.nameInput.value = state.playerName;

function api(path, payload) {
  return fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).then(async response => {
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Something went wrong.");
    return data;
  });
}

function currentPlayer(game) {
  return game.players.find(player => player.id === state.playerId);
}

function audioContext() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  if (!state.audioContext) state.audioContext = new AudioContext();
  return state.audioContext;
}

function playClap() {
  const context = audioContext();
  if (!context) return;
  if (context.state === "suspended") context.resume();

  const now = context.currentTime;
  for (let i = 0; i < 5; i += 1) {
    const noise = context.createBufferSource();
    const buffer = context.createBuffer(1, context.sampleRate * 0.09, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let j = 0; j < data.length; j += 1) {
      data[j] = (Math.random() * 2 - 1) * (1 - j / data.length);
    }

    const filter = context.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1200 + i * 180;

    const gain = context.createGain();
    const start = now + i * 0.045;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.34, start + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.08);

    noise.buffer = buffer;
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);
    noise.start(start);
    noise.stop(start + 0.09);
  }
}

function syncMusic(musicOn) {
  els.musicButton.textContent = musicOn ? "Music on" : "Music off";
  if (musicOn) {
    els.backgroundMusic.volume = 0.35;
    els.backgroundMusic.play().catch(() => {
      els.message.textContent = "Music is on. Click anywhere once if your browser blocks autoplay.";
    });
  } else {
    els.backgroundMusic.pause();
  }
}

function renderVisual(challenge) {
  els.visual.innerHTML = "";
  if (!challenge) {
    els.visual.className = "visual waiting-visual";
    els.visual.textContent = "Host picks a flag";
    return;
  }

  const flag = document.createElement("img");
  flag.className = "flag-image";
  flag.alt = "Country flag";
  flag.src = `https://flagcdn.com/w640/${challenge.code}.png`;
  flag.addEventListener("error", () => {
    flag.replaceWith(Object.assign(document.createElement("div"), {
      className: "waiting-visual",
      textContent: "Flag image unavailable"
    }));
  });
  els.visual.className = "visual flag-stage";
  els.visual.appendChild(flag);
}

function renderOptions(game) {
  els.options.innerHTML = "";
  const me = currentPlayer(game);
  const disabled = !me || game.status !== "playing" || me.triesLeft <= 0 || me.roundCorrect;

  for (const option of game.options || []) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "option-button";
    button.textContent = option;
    if (game.myWrongGuesses.includes(option.toLowerCase())) button.classList.add("wrong");
    button.disabled = disabled || game.myWrongGuesses.includes(option.toLowerCase());
    button.addEventListener("click", () => submitGuess(option));
    els.options.appendChild(button);
  }
}

function populateCountryOptions(challenges) {
  const continent = els.continentSelect.value;
  const currentCountry = els.challengeSelect.value;
  els.challengeSelect.innerHTML = "";
  for (const challenge of challenges.filter(item => item.continent === continent)) {
    const option = document.createElement("option");
    option.value = challenge.id;
    option.textContent = challenge.name;
    els.challengeSelect.appendChild(option);
  }
  if ([...els.challengeSelect.options].some(option => option.value === currentCountry)) {
    els.challengeSelect.value = currentCountry;
  }
}

function renderChallengeOptions(challenges) {
  if (!els.continentSelect.options.length) {
    const continents = [...new Set(challenges.map(challenge => challenge.continent))];
    for (const continent of continents) {
      const option = document.createElement("option");
      option.value = continent;
      option.textContent = continent;
      els.continentSelect.appendChild(option);
    }
  }
  if (!els.challengeSelect.options.length) populateCountryOptions(challenges);
}

function renderPlayers(players) {
  els.players.innerHTML = "";
  for (const player of players) {
    const item = document.createElement("li");
    const name = document.createElement("strong");
    const score = document.createElement("span");
    name.textContent = `${player.name}${player.id === state.playerId ? " (you)" : ""}`;
    if (player.isHost) name.textContent += " - Host";
    score.className = "score";
    score.textContent = player.score;
    item.append(name, score);
    els.players.appendChild(item);
  }
}

function statusMessage(game) {
  if (!currentPlayer(game)) return "Enter your name to join.";
  if (game.status === "waiting") return game.hostId === state.playerId
    ? "Choose a flag to start."
    : "Waiting for the host to start.";
  if (game.status === "won") return `Round complete. Answer: ${game.answer}.`;
  if (game.lastGuess) return game.lastGuess.hit
    ? `${game.lastGuess.playerName} got it right.`
    : `${game.lastGuess.playerName} chose an answer.`;
  return "Choose the correct country from the five options.";
}

function render(game) {
  const hadGame = Boolean(state.game);
  const previousWinnerCount = state.winnerCount;
  state.game = game;
  state.winnerCount = game.winners.length;
  const me = currentPlayer(game);
  const host = game.players.find(player => player.isHost);
  const isHost = Boolean(me && game.hostId === state.playerId);

  els.landingPage.hidden = Boolean(me);
  els.gamePage.hidden = !me;
  els.hostTools.hidden = !isHost;
  els.onlineCount.textContent = game.players.length;
  els.capacity.textContent = game.players.length >= game.maxPlayers ? "Room full" : "Room open";
  els.roundNumber.textContent = game.round;
  els.hostNotice.innerHTML = host
    ? `<span class="host-label">Host:</span> ${host.name}`
    : "Join to become host.";
  els.message.textContent = me && game.status === "playing" && !me.roundCorrect
    ? `${me.triesLeft} tries left.`
    : statusMessage(game);
  if (me && game.status === "playing" && !me.roundCorrect) {
    els.message.textContent = `${me.triesLeft} tries left.`;
  }
  els.roundPoints.hidden = !game.winners.length;
  els.roundPoints.innerHTML = game.winners
    .map(winner => `<div><strong>${winner.name}</strong> +${winner.points}</div>`)
    .join("");
  syncMusic(game.musicOn);
  if (hadGame && game.winners.length > previousWinnerCount) playClap();
  renderVisual(game.challenge);
  renderOptions(game);
  renderChallengeOptions(game.challenges);
  renderPlayers(game.players);
}

async function join() {
  try {
    const name = els.nameInput.value.trim();
    const data = await api("/api/join", { name, playerId: state.playerId });
    state.playerId = data.playerId;
    state.playerName = name || "Player";
    localStorage.setItem("flagMapPlayerId", state.playerId);
    localStorage.setItem("flagMapPlayerName", state.playerName);
    connectEvents();
    render(data.state);
  } catch (error) {
    els.joinMessage.textContent = error.message;
  }
}

async function startRound() {
  try {
    const data = await api("/api/start", {
      playerId: state.playerId,
      challengeId: els.challengeSelect.value
    });
    render(data.state);
  } catch (error) {
    els.message.textContent = error.message;
  }
}

async function submitGuess(guess) {
  try {
    const result = await api("/api/guess", { playerId: state.playerId, guess });
    if (result.correct) {
      playClap();
      els.message.textContent = "Correct!";
    }
  } catch (error) {
    els.message.textContent = error.message;
  }
}

async function resetGame() {
  try {
    const data = await api("/api/reset", { playerId: state.playerId });
    render(data.state);
  } catch (error) {
    els.message.textContent = error.message;
  }
}

async function toggleMusic() {
  try {
    const data = await api("/api/music", {
      playerId: state.playerId,
      musicOn: !state.game.musicOn
    });
    render(data.state);
  } catch (error) {
    els.message.textContent = error.message;
  }
}

async function logout() {
  const oldPlayerId = state.playerId;
  if (eventSource) eventSource.close();
  els.backgroundMusic.pause();
  els.backgroundMusic.currentTime = 0;
  state.playerId = "";
  state.playerName = "";
  localStorage.removeItem("flagMapPlayerId");
  localStorage.removeItem("flagMapPlayerName");
  els.nameInput.value = "";
  try {
    const data = await api("/api/logout", { playerId: oldPlayerId });
    render(data.state);
  } catch {
    els.landingPage.hidden = false;
    els.gamePage.hidden = true;
  }
}

let eventSource;
function connectEvents() {
  if (eventSource) eventSource.close();
  const query = state.playerId ? `?playerId=${encodeURIComponent(state.playerId)}` : "";
  eventSource = new EventSource(`/events${query}`);
  eventSource.onmessage = event => render(JSON.parse(event.data));
  eventSource.onerror = () => {
    if (!els.gamePage.hidden) els.message.textContent = "Reconnecting to the room...";
  };
}

els.joinButton.addEventListener("click", join);
document.addEventListener("click", () => {
  const context = audioContext();
  if (context && context.state === "suspended") context.resume();
}, { once: true });
els.nameInput.addEventListener("keydown", event => {
  if (event.key === "Enter") join();
});
els.startButton.addEventListener("click", startRound);
els.resetButton.addEventListener("click", resetGame);
els.musicButton.addEventListener("click", toggleMusic);
els.logoutButton.addEventListener("click", logout);
els.continentSelect.addEventListener("change", () => {
  if (state.game) populateCountryOptions(state.game.challenges);
});

fetch(`/api/state${state.playerId ? `?playerId=${encodeURIComponent(state.playerId)}` : ""}`)
  .then(response => response.json())
  .then(render)
  .finally(connectEvents);
