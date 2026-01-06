const APP_VERSION = "1.1.1.1";
const app = document.getElementById('app');

/* STORAGE */
const Storage = {
  sessionHistory: JSON.parse(localStorage.getItem('sessionHistory') || '[]'),
  appendSession(session) {
    this.sessionHistory.push(session);
    localStorage.setItem('sessionHistory', JSON.stringify(this.sessionHistory));
  }
};

/* HELPERS */
function fadeIn(el,d=300){ el.style.opacity=0; el.style.transition=`opacity ${d}ms ease`; requestAnimationFrame(()=>el.style.opacity=1); }
function fadeOut(el,d=300){ return new Promise(res=>{ el.style.opacity=1; el.style.transition=`opacity ${d}ms ease`; el.style.opacity=0; setTimeout(res,d); }); }

async function runTimer(duration){
  const timerText=document.getElementById('timerText');
  const fill=document.getElementById('timerFill');
  const circle=document.querySelector('.timer-circle');
  const startTime=Date.now();
  return new Promise(resolve=>{
    function update(){
      const elapsed=(Date.now()-startTime)/1000;
      const remaining=Math.max(Math.ceil(duration-elapsed),0);
      timerText.textContent=remaining;

      // Grey glow normally, red/amber pulse if <=5s
      if(remaining<=5){
        circle.classList.remove('pulse');
        circle.classList.add('pulse-alert');
      } else {
        circle.classList.remove('pulse-alert');
        circle.classList.add('pulse');
      }

      const percent=Math.min(elapsed/duration,1);
      fill.style.background=`conic-gradient(rgba(200,200,200,0.6) ${percent*360}deg, #444 0deg)`;
      if(percent<1) requestAnimationFrame(update); else resolve();
    }
    update();
  });
}

/* LOGGING */
function logResponse(resp){ Storage.appendSession({timestamp:new Date(),response:resp}); }

/* WEEKLY SUMMARY */
function showWeeklySummary(){
  const history=Storage.sessionHistory||[];
  const oneWeekAgo=new Date(); oneWeekAgo.setDate(oneWeekAgo.getDate()-7);
  const weeklyData=history.filter(s=>new Date(s.timestamp)>=oneWeekAgo);
  const counts={"Yes":0,"A little":0,"No":0};
  weeklyData.forEach(s=>counts[s.response]++);
  
  app.innerHTML=`<div class="weekly-summary">
    <h2>Weekly Reflection</h2>
    <p>Fully overwhelmed: ${counts["Yes"]} day(s)</p>
    <p>A little overwhelmed: ${counts["A little"]} day(s)</p>
    <p>Calm: ${counts["No"]} day(s)</p>
    <p class="version">Version: ${APP_VERSION}</p>
    <button id="closeSummary">Close</button>
  </div>`;
  
  document.getElementById('closeSummary').onclick=()=>showPause();
}

/* PAUSE SCREEN */
function showPause(){
  app.innerHTML=`<div>Pause.</div>
    <div style="margin-top:12px;">
      <button id="continueBtn">Continue</button>
    </div>
    <div class="app-name"><span class="main">LIMEN</span><span class="year">2026</span></div>`;

  document.getElementById('continueBtn').onclick=()=>startSession("Baseline");
}

/* ENTRY SCREEN AFTER DONE */
function showEntry(currentIntervention){
  app.innerHTML=`<div>How did that feel?</div>
    <div style="margin-top:12px;">
      <button id="yesBtn">Yes</button>
      <button id="littleBtn">A little</button>
      <button id="noBtn">No</button>
    </div>
    <div class="app-name"><span class="main">LIMEN</span><span class="year">2026</span></div>`;

  fadeIn(app);

  document.getElementById('yesBtn').onclick=async()=>{
    logResponse("Yes");
    await fadeOut(app);
    showWeeklySummary();
  };
  document.getElementById('littleBtn').onclick=async()=>{
    logResponse("A little");
    await fadeOut(app);
    startSession(currentIntervention); // repeat same until baseline
  };
  document.getElementById('noBtn').onclick=async()=>{
    logResponse("No");
    await fadeOut(app);
    // pick a new random intervention (not current)
    const keys = Object.keys(interventions).filter(k=>k!==currentIntervention);
    const randomKey = keys[Math.floor(Math.random()*keys.length)];
    startSession(randomKey);
  };
}

/* INTERVENTION SCREEN */
async function startSession(interventionKey){
  const step = interventions[interventionKey];
  app.innerHTML=`<div>${step.text}</div>
    <div class="timer-circle pulse">
      <div id="timerFill" class="timer-fill"></div>
      <div id="timerText">${step.duration}</div>
    </div>
    <div style="text-align:center;margin-top:12px;"><button id="doneBtn" disabled>Done</button></div>
    <div class="app-name"><span class="main">LIMEN</span><span class="year">2026</span></div>`;
  
  fadeIn(app);
  await runTimer(step.duration);
  const doneBtn=document.getElementById('doneBtn');
  doneBtn.disabled=false;
  doneBtn.onclick=()=>showEntry(interventionKey);
}

/* SPLASH SCREEN */
async function showSplash(){
  app.innerHTML=`<div class="splash-logo">LIMEN</div><div class="splash-tagline">Pause before crossing.</div>`;
  fadeIn(app);
  await new Promise(r=>setTimeout(r,1800));
  await fadeOut(app);
  showPause();
}

/* INIT */
window.onload=()=>{ showSplash(); };
