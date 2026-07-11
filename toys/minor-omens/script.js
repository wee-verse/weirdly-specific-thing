// ---------------------------------------------------------------------------
// "What Minor Omen Has Been Following You?"
// Same engine as toy #1 (What Weirdly Specific Thing Are You?): 6 questions ->
// 5-axis vector -> nearest-match result from a pool, picked with weighted
// randomness among the closest few matches.
// Axes: [domestic, loud, lucky, fleeting, personal]
//   domestic  = domestic/indoor  (+)  vs  wild/outdoor      (-)
//   loud      = loud/noticeable  (+)  vs  quiet/subtle       (-)
//   lucky     = lucky/fortunate  (+)  vs  unlucky/cautionary (-)
//   fleeting  = fleeting/passing (+)  vs  persistent/lasting (-)
//   personal  = personal/private (+)  vs  shared/communal    (-)
// ---------------------------------------------------------------------------

const AXES = ["domestic", "loud", "lucky", "fleeting", "personal"];

const QUESTIONS = [
  {
    text: "Choose a window at dusk.",
    options: [
      { label: "Looking out over a quiet garden", vec: [2, -1, 0, 0, 0] },
      { label: "Rattling faintly in the wind", vec: [-1, 1, 0, 0, 0] },
      { label: "Curtain already drawn", vec: [0, -1, 0, 0, 2] },
      { label: "Facing a street full of strangers", vec: [0, 2, 0, 0, -2] },
    ],
  },
  {
    text: "Something's been left on the path. What is it?",
    options: [
      { label: "A single coin, heads up", vec: [0, 0, 2, -1, 0] },
      { label: "A torn piece of paper, blank", vec: [0, 0, -1, 1, 0] },
      { label: "A small bundle of feathers", vec: [-1, 0, 1, 0, 0] },
      { label: "Nothing — but you're sure something was there", vec: [0, 0, 0, 2, 1] },
    ],
  },
  {
    text: "Which sound came from the next room?",
    options: [
      { label: "A clock, ticking slightly too slow", vec: [1, 0, 0, -2, 0] },
      { label: "Laughter, then silence", vec: [0, 0, 0, 1, -2] },
      { label: "A chair scraping, once", vec: [0, 1, 0, 1, 0] },
      { label: "Nothing. The room is empty", vec: [0, -2, 0, 0, 1] },
    ],
  },
  {
    text: "Pick the object you'd actually keep, if you had to choose one.",
    options: [
      { label: "A key with no known lock", vec: [0, 0, 1, 0, 1] },
      { label: "A photograph, slightly overexposed", vec: [0, 0, 0, -1, 2] },
      { label: "A pocketknife, well-used", vec: [1, 0, 0, -1, 0] },
      { label: "A ticket stub from somewhere you don't remember", vec: [0, 0, 0, 2, -1] },
    ],
  },
  {
    text: "Which small daily inconvenience feels meaningful today?",
    options: [
      { label: "The door that sticks in humid weather", vec: [2, 0, 0, -1, 0] },
      { label: "The traffic light that's always red for you", vec: [0, 1, -2, 0, 0] },
      { label: "The neighbor's dog, barking at nothing", vec: [0, 2, 0, 0, -1] },
      { label: "The silence right after you turn off the music", vec: [0, -2, 0, 1, 0] },
    ],
  },
  {
    text: "If you disappeared for an hour, what would notice first?",
    options: [
      { label: "The chair, missing its usual weight", vec: [2, 0, 0, 0, 1] },
      { label: "A group chat, going quiet", vec: [0, -1, 0, 0, -2] },
      { label: "Nothing. That's the interesting part", vec: [0, -1, 0, 2, 0] },
      { label: "A cat, checking twice", vec: [1, 0, 1, 0, 0] },
    ],
  },
];

// Each result: name, emoji, 5-axis vec, blurb, traits (exactly 3: category, rarity, mood).
const RESULTS = [
  { name: "The Key That Prefers the Second Door", emoji: "🗝️", vec: [1,0,1,-1,0],
    blurb: "An opportunity is approaching, but it will arrive disguised as an inconvenience. Don't trust the first obvious solution — carry a spare key for three days, just in case.",
    traits: ["Domestic portent", "Uncommon", "Mildly cooperative"] },
  { name: "Three Moths, Separately, Same Opinion", emoji: "🦋", vec: [0,0,1,1,-1],
    blurb: "Something you already suspected is about to be confirmed by more than one source. Leave a light on tonight and see who agrees.",
    traits: ["Aerial consensus", "Uncommon", "Quietly validating"] },
  { name: "A Receipt for Something You Haven't Bought Yet", emoji: "🧾", vec: [0,0,1,2,1],
    blurb: "You're closer to a decision than you think. Keep it in your pocket until it makes sense.",
    traits: ["Temporal artifact", "Rare", "Ahead of schedule"] },
  { name: "The Crow Who Only Knows You on Thursdays", emoji: "🐦", vec: [-1,0,0,-1,1],
    blurb: "A recurring relationship in your life is more one-sided than it appears, and that's fine. Wave back anyway.",
    traits: ["Seasonal acquaintance", "Common", "Selectively loyal"] },
  { name: "An Empty Chair, Increasingly Relevant", emoji: "🪑", vec: [2,0,0,-1,1],
    blurb: "Someone's absence has been taking up more room than their presence did. Save them a seat this week, but don't explain why.",
    traits: ["Domestic portent", "Uncommon", "Quietly overdue"] },
  { name: "The Smell of Rain in a Room With No Windows", emoji: "🌧️", vec: [1,-1,0,1,0],
    blurb: "Nostalgia is about to visit uninvited. Let it stay for one song's length, then get back to your day.",
    traits: ["Atmospheric intrusion", "Common", "Briefly sentimental"] },
  { name: "A Streetlight That Only Flickers for You", emoji: "💡", vec: [-1,1,1,0,1],
    blurb: "The neighborhood has noticed your routine and is attempting, badly, to acknowledge it. Nod once — that's the whole ritual.",
    traits: ["Electrical omen", "Uncommon", "Shy but persistent"] },
  { name: "The Second Sock, Delivered Separately", emoji: "🧦", vec: [2,-1,0,1,1],
    blurb: "Reunion is coming, but in installments. Don't throw out the first one yet.",
    traits: ["Domestic portent", "Common", "Slow but sure"] },
  { name: "A Cat That Chooses Your Doorstep, Not Your Lap", emoji: "🐈", vec: [1,-1,1,0,1],
    blurb: "Respect without affection is still respect. Leave a saucer out, and ask for nothing in return.",
    traits: ["Territorial omen", "Uncommon", "Conditionally warm"] },
  { name: "The Elevator That Waits One Extra Second", emoji: "🛗", vec: [-1,0,1,0,-1],
    blurb: "Something slightly behind schedule is still trying to reach you. Hold the door this week, even when the hallway looks empty.",
    traits: ["Mechanical courtesy", "Common", "Quietly patient"] },
  { name: "A Coin, Heads-Up, in a Place Coins Don't Belong", emoji: "🪙", vec: [0,0,2,1,0],
    blurb: "Small luck, oddly specific in its timing. Spend it before midnight, on something unnecessary.",
    traits: ["Fortune fragment", "Rare", "Narrowly timed"] },
  { name: "The Radio Station That Finds You in Every Rental Car", emoji: "📻", vec: [-1,1,0,-1,1],
    blurb: "A former version of you has retained control of the dial. Let the whole song play before deciding whether they were wrong.",
    traits: ["Personal signature", "Uncommon", "Unreasonably consistent"] },
  { name: "A Spider Web, Rebuilt Overnight, in the Exact Same Spot", emoji: "🕸️", vec: [2,-1,0,-2,0],
    blurb: "Your persistence is being quietly out-competed by something much smaller. Leave it — it's earned the corner.",
    traits: ["Domestic portent", "Common", "Unbothered by eviction"] },
  { name: "The Song Stuck in Your Head That Isn't Yours", emoji: "🎵", vec: [0,0,0,1,-2],
    blurb: "You've absorbed someone else's mood without noticing. Ask who you were with last.",
    traits: ["Borrowed omen", "Uncommon", "Not actually yours"] },
  { name: "A Second Shadow, Briefly, at Noon", emoji: "🌗", vec: [-1,0,1,2,-1],
    blurb: "Someone has noticed the part of you that usually disappears in full light. Stand still for it — explanations will only make you blurrier.",
    traits: ["Solar anomaly", "Rare", "Brief but flattering"] },
  { name: "The Voicemail Icon That Won't Clear", emoji: "📞", vec: [1,0,-1,-2,1],
    blurb: "Unfinished business is older than you think and quieter than you'd like. Listen once, then decide whether it still deserves the notification.",
    traits: ["Temporal artifact", "Common", "Politely insistent"] },
  { name: "A Dog That Refuses to Pass One Specific Tree", emoji: "🐕", vec: [-1,-1,-1,0,0],
    blurb: "Some caution isn't yours, but it's worth respecting anyway. Go around.",
    traits: ["Territorial omen", "Common", "Unexplained but firm"] },
  { name: "The Last Bus, On Time, With No One Else On It", emoji: "🚌", vec: [-1,0,2,1,-1],
    blurb: "A window is open that won't stay open. Get on.",
    traits: ["Fortune fragment", "Uncommon", "Narrow but real"] },
];

console.assert(RESULTS.length >= 15, "Need a healthy result pool.");
RESULTS.forEach(r => console.assert(r.traits.length === 3, `Result "${r.name}" needs exactly 3 traits.`));

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
let currentQuestion = 0;
const answers = new Array(QUESTIONS.length).fill(null);
let currentResult = null;

// ---------------------------------------------------------------------------
// DOM refs
// ---------------------------------------------------------------------------
const screens = {
  intro: document.getElementById("screen-intro"),
  quiz: document.getElementById("screen-quiz"),
  result: document.getElementById("screen-result"),
};

const progressFill = document.getElementById("progress-fill");
const progressBar = document.getElementById("progress-bar");
const qCounter = document.getElementById("q-counter");
const qText = document.getElementById("q-text");
const qOptions = document.getElementById("q-options");
const btnBack = document.getElementById("btn-back");

const resultEmoji = document.getElementById("result-emoji");
const resultName = document.getElementById("result-name");
const resultBlurb = document.getElementById("result-blurb");
const resultTraits = document.getElementById("result-traits");
const copyToast = document.getElementById("copy-toast");

function showScreen(name) {
  Object.entries(screens).forEach(([key, el]) => {
    el.hidden = key !== name;
  });
  const heading = screens[name].querySelector("h1, h2");
  if (heading) {
    heading.setAttribute("tabindex", "-1");
    heading.focus({ preventScroll: false });
  }
}

// ---------------------------------------------------------------------------
// Quiz flow
// ---------------------------------------------------------------------------
function renderQuestion() {
  const q = QUESTIONS[currentQuestion];
  qCounter.textContent = `Question ${currentQuestion + 1} of ${QUESTIONS.length}`;
  qText.textContent = q.text;

  const pct = Math.round((currentQuestion / QUESTIONS.length) * 100);
  progressFill.style.width = `${pct}%`;
  progressBar.setAttribute("aria-valuenow", String(pct));

  qOptions.innerHTML = "";
  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "option-btn";
    btn.textContent = opt.label;
    if (answers[currentQuestion] === i) btn.classList.add("selected");
    btn.addEventListener("click", () => selectAnswer(i));
    qOptions.appendChild(btn);
  });

  btnBack.style.visibility = currentQuestion === 0 ? "hidden" : "visible";
}

function selectAnswer(optionIndex) {
  answers[currentQuestion] = optionIndex;
  if (currentQuestion < QUESTIONS.length - 1) {
    currentQuestion += 1;
    renderQuestion();
  } else {
    progressFill.style.width = "100%";
    finishQuiz();
  }
}

btnBack.addEventListener("click", () => {
  if (currentQuestion > 0) {
    currentQuestion -= 1;
    renderQuestion();
  }
});

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------
function computeUserVector() {
  const vec = AXES.map(() => 0);
  answers.forEach((optIndex, qIndex) => {
    if (optIndex === null) return;
    const chosen = QUESTIONS[qIndex].options[optIndex].vec;
    chosen.forEach((v, i) => { vec[i] += v; });
  });
  return vec;
}

function cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

function pickResult(userVec) {
  const scored = RESULTS.map(r => ({ r, score: cosineSimilarity(userVec, r.vec) }));
  scored.sort((a, b) => b.score - a.score);

  const poolSize = 5;
  const pool = scored.slice(0, poolSize);

  const weights = pool.map((_, i) => poolSize - i);
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return pool[i].r;
  }
  return pool[0].r;
}

function finishQuiz() {
  const userVec = computeUserVector();
  currentResult = pickResult(userVec);
  renderResult(currentResult);
  showScreen("result");
}

function renderResult(result) {
  resultEmoji.textContent = result.emoji;
  resultName.textContent = result.name;
  resultBlurb.textContent = result.blurb;
  resultTraits.innerHTML = "";
  result.traits.forEach(t => {
    const li = document.createElement("li");
    li.textContent = t;
    resultTraits.appendChild(li);
  });
  copyToast.textContent = "";
}

// ---------------------------------------------------------------------------
// Buttons: start / restart / copy / share
// ---------------------------------------------------------------------------
document.getElementById("btn-start").addEventListener("click", () => {
  currentQuestion = 0;
  answers.fill(null);
  renderQuestion();
  showScreen("quiz");
});

document.getElementById("btn-restart").addEventListener("click", () => {
  currentQuestion = 0;
  answers.fill(null);
  renderQuestion();
  showScreen("quiz");
});

function shareMessage() {
  return `I consulted Weevil World and my omen is: ${currentResult.name} ${currentResult.emoji}\n\n${currentResult.blurb}`;
}

function shareUrl() {
  return window.location.href.split("#")[0].split("?")[0];
}

document.getElementById("btn-copy").addEventListener("click", async () => {
  const text = `${shareMessage()}\n\n${shareUrl()}`;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    copyToast.textContent = "Copied to clipboard.";
  } catch (err) {
    copyToast.textContent = "Couldn't copy — try selecting the text manually.";
  }
  setTimeout(() => { copyToast.textContent = ""; }, 3500);
});

document.getElementById("btn-share").addEventListener("click", async () => {
  const url = shareUrl();
  if (navigator.share) {
    try {
      await navigator.share({ title: "What Minor Omen Has Been Following You?", text: shareMessage(), url });
    } catch (err) {
      // user cancelled share sheet — no action needed
    }
  } else {
    const text = `${shareMessage()}\n\n${url}`;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      copyToast.textContent = "Sharing isn't supported here — copied the result instead.";
    } catch (err) {
      copyToast.textContent = "Couldn't share or copy on this device.";
    }
    setTimeout(() => { copyToast.textContent = ""; }, 4000);
  }
});

// Initial state
showScreen("intro");
