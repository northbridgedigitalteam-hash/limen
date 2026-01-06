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
   SERVICE WORKER REGISTRATION (for Android)
-------------------------- */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js')
    .then(() => console.log('Service Worker registered'))
    .catch(err => console.log('SW registration failed:', err));
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
   ENTRY
-------------------------- */
function showEntry() {
  app.innerHTML = `
    <div>Pause.</div>
    <button id="continueBtn">Continue</button>
    <div class="app-name">
      <span class="main">LIMEN</span>
      <span class="year">2026</span>
    </div>
  `;
  fadeIn(app);
  document.getElementById('continueBtn').onclick = () => startSession();
}

/* --------------------------
   INTERVENTION
-------------------------- */
function startSession() {
  const intervention = interventions.Baseline;
  deliverIntervention(intervention);
}

function deliverIntervention(intervention) {
  const duration = intervention.duration;

  app.innerHTML = `
    <div>${intervention.text}</div>
    <div class="timer-circle pulse">
      <div id="timerFill" class="timer-fill"></div>
      <div id="timerText">${duration}</div>
    </div>
    <button id="doneBtn">Done</button>
    <div class="app-name">
      <span class="main">LIMEN</span>
      <span class="year">2026</span>
    </div>
  `;
  fadeIn(app);

  const startTime = Date.now();
  const fill = document.getElementById('timerFill');
  const text = document.getElementById('timerText');
  const circle = document.querySelector('.timer-circle');

  function updateTimer() {
    const elapsed = (Date.now() - startTime) / 1000;
    const remaining = Math.max(Math.ceil(duration - elapsed), 0);
    text.textContent = remaining;

    const percent = Math.min(elapsed / duration, 1);
    const color = remaining <= 5 ? '#f5a623' : '#6bc5a6';
    fill.style.background = `conic-gradient(${color} ${percent * 360}deg, #444 0deg)`;
    circle.style.animationDuration = remaining <= 5 ? '0.5s' : '1.2s';

    if (percent < 1) requestAnimationFrame(updateTimer);
  }

  updateTimer();

  document.getElementById('doneBtn').onclick = async () => {
    Storage.appendSession({ timestamp: new Date() });
    await fadeOut(app);
    showEntry();
  };
}

/* --------------------------
   INIT
-------------------------- */
window.onload = () => {
  showSplash();
  setTimeout(showInstallHint, 1500);
};

