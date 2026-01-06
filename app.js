const app = document.getElementById('app');

// Helper: fade in content
function fadeIn(element, duration = 300) {
  element.style.opacity = 0;
  element.style.transition = `opacity ${duration}ms ease-in-out`;
  requestAnimationFrame(() => {
    element.style.opacity = 1;
  });
}

function showEntry() {
  app.innerHTML = `
    <div>Pause.</div>
    <button id="continueBtn">Continue</button>
    <div class="app-name">LIMEN</div>
  `;
  fadeIn(app);
  document.getElementById('continueBtn').onclick = () => startSession();
}

function startSession(stateOverride = null) {
  const state = stateOverride || inferState();
  deliverIntervention(state);
}

function deliverIntervention(state) {
  const intervention = interventions[state];
  const duration = intervention.duration;

  app.innerHTML = `
    <div>${intervention.text}</div>
    <div class="timer-circle">
      <div id="timerFill" class="timer-fill"></div>
      <div id="timerText">${duration}</div>
    </div>
    <button id="doneBtn">Done</button>
    <div class="app-name">LIMEN</div>
  `;
  fadeIn(app);

  const startTime = Date.now();
  const fill = document.getElementById('timerFill');
  const text = document.getElementById('timerText');

  // Timer animation + countdown
  const interval = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000;
    const remaining = Math.max(Math.ceil(duration - elapsed), 0);
    text.textContent = remaining;
    const percent = Math.min(elapsed / duration, 1);
    fill.style.background = `conic-gradient(#6bc5a6 ${percent * 360}deg, #444 0deg)`;
    if (percent >= 1) clearInterval(interval);
  }, 100);

  document.getElementById('doneBtn').onclick = () => {
    clearInterval(interval);
    Storage.appendSession({ state, timestamp: new Date() });
    showFeedback(state, startTime);
  };
}

function showFeedback(state, startTime) {
  app.innerHTML = `
    <div>Closer to baseline?</div>
    <button onclick="saveFeedback('${state}', 'Yes', ${startTime})">Yes</button>
    <button onclick="saveFeedback('${state}', 'A little', ${startTime})">A little</button>
    <button onclick="saveFeedback('${state}', 'No', ${startTime})">No</button>
    <div class="app-name">LIMEN</div>
  `;
  fadeIn(app);
}

function saveFeedback(state, feedback, startTime) {
  const sessions = Storage.get('sessionHistory');
  const last = sessions[sessions.length - 1];
  last.feedback = feedback;
  last.duration = Math.round((Date.now() - startTime) / 1000);
  Storage.set('sessionHistory', sessions);

  if (feedback === 'Yes') {
    app.innerHTML = `<div>Returning to baseline...</div><div class="app-name">LIMEN</div>`;
    fadeIn(app);
    setTimeout(showEntry, 2000);
  } else if (feedback === 'A little') {
    startSession(state);
  } else if (feedback === 'No') {
    const states = Object.keys(interventions).filter(s => s !== state);
    const newState = states[Math.floor(Math.random() * states.length)];
    startSession(newState);
    setTimeout(showEntry, (interventions[newState].duration + 2) * 1000);
  }
}

window.onload = () => {
  showEntry();
};
