const app = document.getElementById('app');

// Storage & State
function inferState() { return "Baseline"; }
const Storage = {
  sessionHistory: [],
  get(key) { if(key==='sessionHistory') return this.sessionHistory; return null; },
  set(key,value){ if(key==='sessionHistory') this.sessionHistory = value; },
  appendSession(session){ this.sessionHistory.push(session); }
};

// Fade helpers
function fadeIn(el, duration=300){ el.style.opacity=0; el.style.transition=`opacity ${duration}ms ease-in-out`; requestAnimationFrame(()=>el.style.opacity=1); }
function fadeOut(el, duration=300){ return new Promise(resolve=>{ el.style.opacity=1; el.style.transition=`opacity ${duration}ms ease-in-out`; el.style.opacity=0; setTimeout(resolve,duration); }); }

// Splash Screen
async function showSplash(){
  app.innerHTML = `
    <div class="splash-logo">LIMEN</div>
    <div class="splash-tagline">Your micro-regulation companion</div>
  `;
  await new Promise(r=>setTimeout(r,2000));
  await fadeOut(app);
  showEntry();
}

// Entry Screen
function showEntry(){
  app.innerHTML = `
    <div>Pause.</div>
    <button id="continueBtn">Continue</button>
    <div class="app-name"><span class="main">LIMEN</span><span class="year">2026</span></div>
  `;
  fadeIn(app);
  document.getElementById('continueBtn').onclick = () => startSession();
}

// Intervention
function startSession(stateOverride=null){
  const state = stateOverride || inferState();
  deliverIntervention(state);
}

function deliverIntervention(state){
  const intervention = interventions[state];
  const duration = intervention.duration;

  app.innerHTML=`
    <div>${intervention.text}</div>
    <div class="timer-circle pulse">
      <div id="timerFill" class="timer-fill"></div>
      <div id="timerText">${duration}</div>
    </div>
    <button id="doneBtn">Done</button>
    <div class="app-name"><span class="main">LIMEN</span><span class="year">2026</span></div>
  `;
  fadeIn(app);

  const startTime = Date.now();
  const fill = document.getElementById('timerFill');
  const text = document.getElementById('timerText');

  function updateTimer(){
    const elapsed = (Date.now()-startTime)/1000;
    const remaining = Math.max(Math.ceil(duration-elapsed),0);
    text.textContent = remaining;
    const percent = Math.min(elapsed/duration,1);
    fill.style.background=`conic-gradient(#6bc5a6 ${percent*360}deg, #444 0deg)`;
    if(percent<1) requestAnimationFrame(updateTimer);
  }
  updateTimer();

  document.getElementById('doneBtn').onclick=()=>{
    Storage.appendSession({state,timestamp:new Date()});
    showFeedback(state,startTime);
  };
}

// Feedback
async function showFeedback(state,startTime){
  await fadeOut(app);
  app.innerHTML=`
    <div>Closer to baseline?</div>
    <button onclick="saveFeedback('${state}','Yes',${startTime})">Yes</button>
    <button onclick="saveFeedback('${state}','A little',${startTime})">A little</button>
    <button onclick="saveFeedback('${state}','No',${startTime})">No</button>
    <div class="app-name"><span class="main">LIMEN</span><span class="year">2026</span></div>
  `;
  fadeIn(app);
}

async function saveFeedback(state,feedback,startTime){
  const sessions = Storage.get('sessionHistory');
  const last = sessions[sessions.length-1];
  last.feedback = feedback;
  last.duration = Math.round((Date.now()-startTime)/1000);
  Storage.set('sessionHistory',sessions);

  if(feedback==='Yes'){
    await fadeOut(app);
    app.innerHTML=`<div>Returning to baseline...</div><div class="app-name"><span class="main">LIMEN</span><span class="year">2026</span></div>`;
    fadeIn(app);
    setTimeout(showEntry,2000);
  } else if(feedback==='A little'){
    startSession(state);
  } else if(feedback==='No'){
    const states = Object.keys(interventions).filter(s=>s!==state);
    const newState = states[Math.floor(Math.random()*states.length)];
    await fadeOut(app);
    startSession(newState);
  }
}

// Launch
window.onload=()=>{ showSplash(); };
