// ---------------------------------------------------------------------------
// "What Weirdly Specific Thing Are You?"
// Self-contained quiz: 6 questions -> 5-axis trait vector -> nearest-match
// result from a 45-item pool, picked with weighted randomness among the
// closest few matches so answers matter but replays stay fresh.
// Axes: [chaos, cozy, overlooked, nostalgic, social]
// ---------------------------------------------------------------------------

const AXES = ["chaos", "cozy", "overlooked", "nostalgic", "social"];

const QUESTIONS = [
  {
    text: "It's 2am and you can't sleep. What's actually keeping you up?",
    options: [
      { label: "Replaying a specific conversation from 2014", vec: [0, 0, 0, 2, 0] },
      { label: "A noise that might be nothing", vec: [2, 0, 1, 0, 0] },
      { label: "The urge to reorganize something that didn't need it", vec: [0, 2, 0, 0, 0] },
      { label: "Nothing — you just like the quiet dark", vec: [0, 1, 2, 0, 0] },
    ],
  },
  {
    text: "Pick a fate for a half-eaten sandwich.",
    options: [
      { label: "Wrapped carefully, saved for later, forgotten in the fridge", vec: [0, 0, 1, 2, 0] },
      { label: "Finished immediately, no regrets", vec: [1, 0, 0, 0, 2] },
      { label: "Left out until someone else deals with it", vec: [2, 0, 1, 0, 0] },
      { label: "Fed to something with mild ceremony", vec: [0, 2, 0, 0, 1] },
    ],
  },
  {
    text: "A group photo is being taken. Where are you?",
    options: [
      { label: "Front and center, mid-laugh", vec: [1, 0, 0, 0, 2] },
      { label: "Edge of frame, half cropped out", vec: [0, 0, 2, 0, 0] },
      { label: "Behind the camera, taking it", vec: [0, 1, 1, 0, 0] },
      { label: "Not in it — you'd already wandered off", vec: [2, 0, 1, 0, 0] },
    ],
  },
  {
    text: "Your ideal Sunday involves...",
    options: [
      { label: "Doing one tiny task extremely well", vec: [0, 2, 1, 0, 0] },
      { label: "Doing absolutely nothing of consequence", vec: [0, 2, 2, 0, 0] },
      { label: "An unplanned adventure that costs you Monday", vec: [2, 0, 0, 0, 1] },
      { label: "Fixing something no one asked you to fix", vec: [0, 1, 1, 1, 0] },
    ],
  },
  {
    text: "Which of these annoys you most?",
    options: [
      { label: "A wobbly table leg", vec: [0, 1, 0, 1, 0] },
      { label: "Someone rearranging your stuff", vec: [0, 1, 0, 2, 0] },
      { label: "Small talk", vec: [0, 0, 2, 0, 0] },
      { label: "Being on time when nobody else is", vec: [1, 0, 0, 0, 2] },
    ],
  },
  {
    text: "Pick a smell.",
    options: [
      { label: "Old paperback books", vec: [0, 0, 0, 2, 0] },
      { label: "Fresh laundry", vec: [0, 2, 0, 0, 0] },
      { label: "Rain on hot pavement", vec: [1, 0, 0, 1, 0] },
      { label: "The inside of a car that's been parked in the sun", vec: [1, 0, 2, 0, 0] },
    ],
  },
];

// Each result: name, emoji, 5-axis vec, blurb, traits (exactly 3).
const RESULTS = [
  { name: "A shopping cart with one bad wheel", emoji: "🛒", vec: [2,0,1,0,1],
    blurb: "You get the job done, just never in a straight line. People notice you before they notice why they're annoyed.",
    traits: ["Reliably crooked", "Weirdly beloved", "Impossible to steer"] },
  { name: "The cold side of the pillow", emoji: "🛏️", vec: [0,2,1,0,0],
    blurb: "You are the relief nobody talks about until it's gone. Quietly essential, briefly perfect, gone the moment anyone leans on you too hard.",
    traits: ["Instant comfort", "Underrated", "Doesn't last"] },
  { name: "A receipt kept for no reason", emoji: "🧾", vec: [0,0,2,2,0],
    blurb: "Nobody asked you to stick around, and yet here you are, three months later, still in the bottom of the bag.",
    traits: ["Sentimental by accident", "Faded but present", "Never actually needed"] },
  { name: "The last mozzarella stick", emoji: "🧀", vec: [0,1,1,0,2],
    blurb: "Everyone wants you. Nobody will admit it. You end up split four ways and somehow still satisfying.",
    traits: ["Quietly desired", "Diplomatically shared", "Peaks under pressure"] },
  { name: "A chair covered in clothes", emoji: "🪑", vec: [2,1,1,0,0],
    blurb: "You were built for one purpose and have been serving a completely different one for years, without complaint.",
    traits: ["Flexible job description", "Secretly load-bearing", "Never actually sat in"] },
  { name: "A suspiciously warm USB cable", emoji: "🔌", vec: [1,0,2,0,0],
    blurb: "You're doing something back there. Nobody knows exactly what. It's probably fine.",
    traits: ["Working overtime", "Mildly concerning", "Gets ignored until it doesn't"] },
  { name: "A hallway light nobody remembers turning on", emoji: "💡", vec: [0,0,2,1,0],
    blurb: "You've been quietly on this whole time. No one will claim responsibility for you, and no one will turn you off either.",
    traits: ["Perpetually on", "Unclaimed", "Low-key dependable"] },
  { name: "A junk drawer that somehow still closes", emoji: "🗄️", vec: [2,1,1,1,0],
    blurb: "Chaos on the inside, function on the outside. You contain multitudes, several batteries, and one instruction manual you'll never need again.",
    traits: ["Deceptively organized", "Holds everything", "Structurally optimistic"] },
  { name: "The \"close door\" button that may or may not work", emoji: "🔘", vec: [1,0,2,0,0],
    blurb: "People press you out of habit more than hope. Occasionally you come through. That's enough to keep your job.",
    traits: ["Unverified effectiveness", "Pressed anyway", "Placebo energy"] },
  { name: "A phone stuck at exactly 40% for three days", emoji: "🔋", vec: [1,1,1,0,0],
    blurb: "You're not dying, you're not thriving, you're just persisting at a suspiciously stable number and refusing to explain how.",
    traits: ["Mysteriously stable", "Low-effort survival", "Charges when it feels like it"] },
  { name: "The last slice nobody wants to be the one to take", emoji: "🍕", vec: [0,1,1,0,2],
    blurb: "Everyone's hungry. Everyone's polite. You sit there getting cold while an entire room performs mutual restraint.",
    traits: ["Highly desired", "Politely ignored", "Eventually claimed"] },
  { name: "A single sock with no known partner", emoji: "🧦", vec: [1,0,2,1,0],
    blurb: "You used to be part of a pair. Now you're a philosophical question that lives in the back of a drawer.",
    traits: ["Formerly paired", "Unbothered by the loss", "Holding out hope"] },
  { name: "The email marked \"unread\" on purpose", emoji: "📧", vec: [1,0,2,0,0],
    blurb: "You've technically been seen. You are choosing, deliberately, to remain a small bolded act of denial.",
    traits: ["Seen but unacknowledged", "Quietly defiant", "A problem for later you"] },
  { name: "A rubber-band bracelet you can't throw away", emoji: "🔗", vec: [0,1,1,2,1],
    blurb: "Objectively worthless, sentimentally irreplaceable. You've survived four closet purges on charm alone.",
    traits: ["Zero resale value", "Emotionally armored", "Survives every purge"] },
  { name: "The office chair that spins slightly to the left", emoji: "🪑", vec: [1,0,2,0,0],
    blurb: "Nobody built you crooked on purpose. And yet, years later, you still lean the same direction every single time.",
    traits: ["Consistently off-center", "Never fixed", "Somehow still comfortable"] },
  { name: "A \"Do Not Disturb\" sign left on the knob for a week", emoji: "🚪", vec: [0,1,2,0,0],
    blurb: "The original reason is long gone. The boundary, somehow, remains fully intact and completely respected.",
    traits: ["Boundary enforcer", "Outlived its reason", "Still working, somehow"] },
  { name: "The extra key nobody remembers what it opens", emoji: "🔑", vec: [0,0,2,2,0],
    blurb: "You are kept on principle, not utility. Someone, someday, might need you. That day has not come in six years.",
    traits: ["Purpose unknown", "Kept just in case", "Quietly irreplaceable-feeling"] },
  { name: "A phone charger that only works at one exact angle", emoji: "🔋", vec: [2,0,1,0,0],
    blurb: "You have one very specific way of functioning, and you will not be adjusting for anyone's convenience.",
    traits: ["Highly specific requirements", "Non-negotiable", "Works when it wants to"] },
  { name: "The last cookie, wrapped up \"for later\"", emoji: "🍪", vec: [0,1,0,1,0],
    blurb: "You represent restraint that will absolutely not last past 9pm. Everyone knows it, including you.",
    traits: ["Temporarily disciplined", "Secretly doomed", "Worth the wait"] },
  { name: "A birthday candle saved in a drawer since 2019", emoji: "🕯️", vec: [0,0,0,2,0],
    blurb: "You've missed every occasion you were meant for and gotten more meaningful with each one you missed.",
    traits: ["Perpetually postponed", "Accidentally symbolic", "Still technically usable"] },
  { name: "The smoke detector that chirps once a night", emoji: "🚨", vec: [2,0,1,0,0],
    blurb: "You show up at the worst possible time with the smallest possible amount of information, and somehow that's the whole personality.",
    traits: ["Impeccably bad timing", "Cryptically brief", "Impossible to locate"] },
  { name: "A grocery list written on the back of another list", emoji: "📝", vec: [1,0,1,1,0],
    blurb: "Layered, a little redundant, technically two documents pretending to be one. History is on your back, literally.",
    traits: ["Built on old plans", "Efficient by accident", "Never fully erased"] },
  { name: "The bus seat that's always slightly wet for no reason", emoji: "🚌", vec: [2,0,1,0,0],
    blurb: "No one investigates you. Everyone just quietly chooses a different seat and moves on with their life.",
    traits: ["Unexplained", "Universally avoided", "Never actually addressed"] },
  { name: "A takeout menu still taped inside a cabinet door", emoji: "📋", vec: [0,0,1,2,0],
    blurb: "That restaurant closed years ago. You remain, laminated, hopeful, completely useless, and no one has the heart to peel you off.",
    traits: ["Outdated but treasured", "Structurally sentimental", "Still technically readable"] },
  { name: "The browser tab you've had open for three weeks", emoji: "🌐", vec: [1,0,1,1,0],
    blurb: "You represent a decision being actively avoided. You will be closed the day the decision is finally made, and not one second earlier.",
    traits: ["Unfinished business", "Quietly draining memory", "Emotionally load-bearing"] },
  { name: "A candle you're \"saving\" for a special occasion that never comes", emoji: "🕯️", vec: [0,2,0,1,1],
    blurb: "You are too good to use and too good to give up. Eventually you'll just be thrown away, still full, still perfect.",
    traits: ["Reserved for greatness", "Never actually lit", "Weirdly high standards"] },
  { name: "The one pen in the house that actually writes", emoji: "🖊️", vec: [1,0,2,0,0],
    blurb: "Everyone knows exactly where you are. Everyone hides you from everyone else. You are the most fought-over object in the building.",
    traits: ["Quietly essential", "Constantly hidden", "Never where you left it"] },
  { name: "A door that's technically locked but everyone just pushes", emoji: "🚪", vec: [1,0,1,0,0],
    blurb: "Your rules are more of a suggestion at this point. Everyone respects the idea of you far more than the reality.",
    traits: ["Nominal security", "Widely ignored", "Still there for morale"] },
  { name: "The last parking spot that's definitely too small", emoji: "🚗", vec: [2,0,0,0,1],
    blurb: "Optimism made physical. Someone will try you. It will take four attempts and a small prayer.",
    traits: ["Aggressively hopeful", "Technically legal", "A group activity"] },
  { name: "A voicemail you've never listened to", emoji: "📞", vec: [0,0,2,1,0],
    blurb: "Whatever you contain has been frozen in time for months. At this point opening you feels riskier than never knowing.",
    traits: ["Permanently unopened", "Quietly looming", "Quietly harmless, probably"] },
  { name: "The remote with the batteries taped in", emoji: "📺", vec: [1,1,0,1,0],
    blurb: "You are a workaround that became a permanent fixture. Nobody remembers the original problem, only your very committed solution.",
    traits: ["A patch job for life", "Weirdly reliable now", "Held together on principle"] },
  { name: "A plant that's \"resting,\" not dead", emoji: "🪴", vec: [0,1,1,1,0],
    blurb: "You are given the benefit of the doubt well past the point anyone should give it. And somehow, occasionally, you prove them right.",
    traits: ["Perpetually ambiguous", "Undeservedly optimistic owners", "One good week from a comeback"] },
  { name: "The good scissors, hidden from the rest of the house", emoji: "✂️", vec: [1,0,1,0,0],
    blurb: "You are rationed like a resource, not treated like an object. One person controls your location and shares that information with no one.",
    traits: ["Tightly controlled", "Quietly superior", "Never where the drawer says"] },
  { name: "A group chat that's just \"...\" since March", emoji: "💬", vec: [0,0,1,0,2],
    blurb: "The energy was real once. Now you're a monument to good intentions and a notification everyone has muted.",
    traits: ["Once thriving", "Now a ghost town", "One meme from reviving"] },
  { name: "The last 2% of a shampoo bottle kept out of principle", emoji: "🧴", vec: [0,0,0,2,0],
    blurb: "You require three separate maneuvers to extract anything useful, and yet no one will simply admit you're finished.",
    traits: ["Technically still functional", "Stubbornly held onto", "One good shake from empty"] },
  { name: "A Tupperware lid with no matching container", emoji: "📦", vec: [2,0,2,0,0],
    blurb: "You've outlived your entire original purpose and nobody has the heart to recycle you. You just exist now, hopeful and orphaned.",
    traits: ["Orphaned but optimistic", "Refuses to be discarded", "Waiting for a miracle match"] },
  { name: "The streetlamp that's on during the day for some reason", emoji: "🏮", vec: [1,0,2,0,0],
    blurb: "You are giving 100% effort toward a job nobody currently needs done. Admirable. Slightly wasteful. Very you.",
    traits: ["Committed regardless of context", "Technically working", "Nobody's noticed but you"] },
  { name: "A birthday card signed just \"Love, [Name]\" because you blanked", emoji: "💌", vec: [0,0,1,1,1],
    blurb: "The effort was real. The execution was rushed. It's the thought that counts, and the thought was mostly panic.",
    traits: ["Sincere under pressure", "Last-minute but earnest", "Better than forgetting entirely"] },
  { name: "The last ice cube tray nobody refills", emoji: "🧊", vec: [1,0,2,0,0],
    blurb: "You are a system that only works if someone else keeps it going, and that someone has clearly checked out.",
    traits: ["Running on fumes", "Everyone's problem, no one's job", "Occasionally comes through"] },
  { name: "A \"Wet Floor\" sign left out long after the floor dried", emoji: "⚠️", vec: [1,0,2,0,0],
    blurb: "The danger passed a while ago. You're still standing there, warning people about a threat that no longer exists, and they still walk around you.",
    traits: ["Outdated but respected", "Cautionary out of habit", "Nobody double-checks you"] },
  { name: "The blanket that's \"just for the couch\"", emoji: "🛋️", vec: [0,2,0,0,0],
    blurb: "You have one job and you have never once left your post. Everyone in the house has a specific, unspoken loyalty to you.",
    traits: ["Fiercely dedicated", "Never washed, never judged", "The real head of the household"] },
  { name: "A found $5 bill in an old coat pocket", emoji: "💵", vec: [0,1,0,1,0],
    blurb: "You show up unannounced and improve someone's entire day for no reason at all. A small, forgotten gift from a past version of them.",
    traits: ["Unexpectedly delightful", "Low stakes, high joy", "Better than you have any right to be"] },
  { name: "The last text left on read out of pure social exhaustion", emoji: "📱", vec: [1,0,0,0,2],
    blurb: "You're not ignored, you're just facing a battle of executive function. The reply is coming. It's just going to take a genuinely unreasonable amount of time.",
    traits: ["Fully intending to respond", "Emotionally at capacity", "Loyal, eventually"] },
  { name: "A charging cable exactly one inch too short", emoji: "🔌", vec: [1,0,2,0,0],
    blurb: "You work fine, technically, as long as everyone rearranges their entire posture around your one limitation.",
    traits: ["Functionally inconvenient", "Never quite enough reach", "Somehow still in daily use"] },
  { name: "The extra chair at the table always covered in bags", emoji: "🪑", vec: [2,0,1,0,0],
    blurb: "You were meant for guests. You have become a storage unit. Nobody remembers when the transition happened.",
    traits: ["Repurposed without discussion", "Rarely sat in", "Secretly essential storage"] },
];

// -- Basic sanity check (dev-time only; harmless in production) -------------
console.assert(RESULTS.length >= 40, "Need at least 40 results.");
RESULTS.forEach(r => console.assert(r.traits.length === 3, `Result "${r.name}" needs exactly 3 traits.`));

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
let currentQuestion = 0;
const answers = new Array(QUESTIONS.length).fill(null); // index of chosen option per question
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

  // Weighted random pick among the closest matches, biased toward the top.
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

function shareText() {
  return `I took "What Weirdly Specific Thing Are You?" and the verdict is: ${currentResult.name} ${currentResult.emoji}\n\n${currentResult.blurb}`;
}

document.getElementById("btn-copy").addEventListener("click", async () => {
  const text = shareText();
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
  const text = shareText();
  if (navigator.share) {
    try {
      await navigator.share({ title: "What Weirdly Specific Thing Are You?", text });
    } catch (err) {
      // user cancelled share sheet — no action needed
    }
  } else {
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
