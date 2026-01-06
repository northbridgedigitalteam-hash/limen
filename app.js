const app = document.getElementById('app');

/* --------------------------
   STORAGE
-------------------------- */
const Storage = {
  sessionHistory: JSON.parse(localStorage.getItem('sessionHistory') || '[]'),
  get(key) {
    return JSON.parse(localStorage.getItem(key));
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  appendSession(session) {
    this.sessionHistory.push(session);
    localStorage.setItem('sessionHistory', JSON.stringify(this.sessionHistory));
  }
};

/* --------------------------
   HELPERS
-------------------------- */
function fadeIn(el, duration = 300) {
  el.style.opacity = 0;
  el.style.transition = `opacity ${duration}ms ease`;
  requestAnimationFrame(() => el.style.opacity = 1);
}

function fadeOut(el, duration = 300) {
  return new Promise(resolve => {
    el.style.opacity = 1;
    el.style.transition = `opacity ${duration}ms ease`;
    el.style.opacity = 0;
    setTimeout(resolve, duration);
  });
}

async function runTimer(duration) {
  const timerText = document.getElementById('timerText');
  const fill = document.getElementById('timerFill');
  const circle = document.querySelector('.timer-circle');

  const startTime = Date.now();

  return new Promise(resolve => {
    function update() {
      const elapsed = (Date.now() - startTime) / 1000;
      const remaining = Math.max(Math.ceil(duration - elapsed), 0);
      timerText.textContent = remaining;

      const percent = Math.min(elapsed / duration, 1);
      const color = remaining <= 5 ? '#f5a623' : '#6bc5a6';
      fill.style.background = `conic-gradient(${color} ${percent * 360}deg, #444 0deg)`;
      circle.style.animationDuration = remaining <= 5 ? '0.5s' : '1.2s';

      if (percent < 1) requestAnimationFrame(update);
      else resolve();
    }
    update();
  });
}

/* --------------------------
   INSTALL HINT (ONE-TIME)
-------------------------- */
function showInstallHint() {
  if (localStorage.getItem('installHintDismissed')) return;

  const hint = document.createElement('div');
  hint.innerHTML = `
    <div style="
      position: fixed;
      bottom: 16px;
      left: 16px;
      right: 16px;
      background: rgba(28,28,35,0.95);
      border: 1px solid #2a2a33;
      border-radius: 12px;
      padding: 12px 14px;
      font-size: 0.85rem;
      color: #ccc;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 9999;
    ">
      <span>Add LIMEN to your home screen</span>
      <button id="dismissInstall" style="
        background: none;
        border: none;
        color: #6bc5a6;
        font-size: 0.85rem;
        cursor: pointer;
      ">
        Not now
      </button>
    </div>
  `;

  document.body.appendChild(hint);

  document.getElementById('dismissInstall').onclick = () => {
    localStorage.setItem('installHintDismissed', 'true');
    hint.remove();
  };

  setTimeout(() => {
    if (document.body.contains(hint)) hint.remove();
  }, 8000);
}

/* --------------------------
   SERVICE WORKER REGISTRATION (Android PWA)
-------------------------- */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js')
    .then(() => console.log('Service Worker registered'))
    .catch(err => console.log('SW registration failed:', err));
}

/* --------------------------
   INTERVENTIONS (Polyvagal + Attention Regulation)
-------------------------- */
const interventions = {
  Baseline: {
    steps: [
      { text: "Peripheral vision + micro-movements", duration: 20 },
      { text: "Apply alternating pressure to hands or thighs", duration: 20 },
      { text: "Drop your tongue, roll shoulders, and breathe slowly", duration: 20 }
    ]
  }
};

/* --------------------------
   SESSION LOGGING
-------------------------- */
function logResponse(response) {
  Storage.appendSession({
    timestamp: new Date(),
    response: response
  });
}

/* --------------------------
   WEEKLY SUMMARY
-------------------------- */
function showWeeklySummary() {
  const history = Storage.sessionHistory || [];
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const weeklyData = history.filter(s => new Date(s.timestamp) >= oneWeekAgo);

  const counts = { "Yes": 0, "A little": 0, "No": 0 };
  weeklyData.forEach(s => counts[s.response]++);

  app.innerHTML = `
    <div class="weekly-summary">
      <h2>Weekly Reflection</h2>
      <p>Fully overwhelmed: ${counts["Yes"]} day(s)</p>
      <p>A little overwhelmed: ${counts["A little"]} day(s)</p>
      <p>Calm: ${counts["No"]} day(s)</p>
      <button id="closeSummary">Close</button>
    </div>
  `;

  document.getElementById('closeSummary').onclick = () => showEntry();
}

/* --------------------------
   SPLASH
-------------------------- */
async function showSplash() {
  app.innerHTML = `
    <div class="splash-logo">LIMEN</div>
    <div class="splash-tagline">Pause before crossing.</div>
  `;
  fadeIn(app);
  await new Promise(r => setTimeout(r, 1800));
  await fadeOut(app);
  showEntry();
}

/* --------------------------
   ENTRY SCREEN
-------------------------- */
function showEntry() {
  app.innerHTML = `
    <div>Pause.</div>
    <div style="margin-top:12px;">
      <button id="yesBtn">Yes</button>
      <button id="littleBtn">A little</button>
      <button id="noBtn">No</button>
    </div>
    <div class="app-name">
      <span class="main">LIMEN</span>
      <span class="year">2026</span>
    </div>
  `;

  fadeIn(app);

  document.getElementById('yesBtn').onclick = async () => {
    logResponse("Yes");
    await fadeOut(app);
    showWeeklySummary();
  };

  document.getElementById('littleBtn').onclick = async () => {
    logResponse("A little");
    await fadeOut(app);
    startSession();
  };

  document.getElementById('noBtn').onclick = async () => {
    logResponse("No");
    await fadeOut(app);
    showWeeklySummary();
  };
}

/* --------------------------
   DELIVER INTERVENTION
-------------------------- */
async function startSession() {
  const intervention = interventions.Baseline;

  for (const step of intervention.steps) {
    app.innerHTML = `
      <div>${step.text}</div>
      <div class="timer-circle pulse">
        <div id="timerFill" class="timer-fill"></div>
        <div id="timerText">${step.duration}</div>
      </div>
      <div class="app-name">
        <span class="main">LIMEN</span>
        <span class="year">2026</span>
      </div>
    `;
    fadeIn(app);
    await runTimer(step.duration);
    await fadeOut(app);
  }

  showEntry();
}

/* --------------------------
   INIT
-------------------------- */
window.onload = () => {
  showSplash();
  setTimeout(showInstallHint, 1500);
};
