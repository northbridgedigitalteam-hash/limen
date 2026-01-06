const app = document.getElementById('app');

function showEntry() {
  app.innerHTML = `
    <div>Pause.</div>
    <button onclick="startSession()">Continue</button>
  `;
}

function startSession() {
  const state = inferState();
  deliverIntervention(state);
}

function deliverIntervention(state) {
  const intervention = interventions[state];
  const duration = intervention.duration; // in seconds

  app.innerHTML = `
    <div style="margin-bottom: 20px;">${intervention.text}</div>
    <div class="timer-circle">
      <div id="timerFill" class="timer-fill"></div>
    </div>
    <button id="doneBtn">Done</button>
  `;

  const startTime = Date.now();
  const fill = document.getElementById('timerFill');

  // Animate timer
  const interval = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000; // seconds
    const percent = Math.min(elapsed / duration, 1);
    fill.style.background = `conic-gradient(#0f0 ${percent * 360}deg, #555 0deg)`;

    if (percent >= 1) clearInterval(interval);
  }, 100);

  // Done button stops timer
  document.getElementById('doneBtn').onclick = () => {
    clearInterval(interval);
    Storage.appendSession({
      state,
      timestamp: new Date()
    });
    showFeedback(state, startTime);
  };
}

function showFeedback(state, startTime) {
  app.innerHTML = `
    <div>Closer to baseline?</div>
    <button onclick="saveFeedback('${state}', 'Yes', ${startTime})">Yes</button>
    <button onclick="saveFeedback('${state}', 'A little', ${startTime})">A little</button>
    <button onclick="saveFeedback('${state}', 'No', ${startTime})">No</button>
  `;
}

function saveFeedback(state, feedback, startTime) {
  const sessions = Storage.get('sessionHistory');
  const last = sessions[sessions.length - 1];
  last.feedback = feedback;
  last.duration = Math.round((Date.now() - startTime) / 1000);
  Storage.set('sessionHistory', sessions);
  showEntry();
}

window.onload = () => {
  showEntry();
};

