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
  app.innerHTML = `
    <div>${intervention.text}</div>
    <button id="doneBtn">Done</button>
  `;

  const startTime = Date.now();
  document.getElementById('doneBtn').onclick = () => {
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
