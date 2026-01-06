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
function fadeIn(el,d=300){el.style.opacity=0;el.style.transition=`opacity ${d}ms ease`;requestAnimationFrame(()=>el.style.opacity=1);}
function fadeOut(el,d=300){return new Promise(res=>{el.style.opacity=1;el.style.transition=`opacity ${d}ms ease`;el.style.opacity=0;setTimeout(res,d);});}

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
      const percent=Math.min(elapsed/duration,1);
      fill.style.background=`conic-gradient(#6bc5a6 ${percent*360}deg, #444 0deg)`;
      if(percent<1) requestAnimationFrame(update); else resolve();
    }
    update();
  });
}

/* LOGGING */
function logResponse(resp){Storage.appendSession({timestamp:new Date(),response:resp});}

/* WEEKLY SUMMARY */
function showWeeklySummary(){
  const history=Storage.sessionHistory||[];
  const oneWeekAgo=new Date();oneWeekAgo.setDate(oneWeekAgo.getDate()-7);
  const weeklyData=history.filter(s=>new Date(s.timestamp)>=oneWeekAgo);
  const counts={"Yes":0,"A little":0,"No":0};weeklyData.forEach(s=>counts[s.response]++);
  
  app.innerHTML=`<div class="weekly-summary">
    <h2>Weekly Reflection</h2>
    <p>Fully overwhelmed: ${counts["Yes"]} day(s)</p>
    <p>A little overwhelmed: ${counts["A little"]} day(s)</p>
    <p>Calm: ${counts["No"]} day(s)</p>
    <p class="version">Version: ${APP_VERSION}</p>
    <button id="closeSummary">Close</button>
  </div>`;
  
  document.getElementById('closeSummary').onclick=()=>showEntry();
}

/* ENTRY SCREEN */
function showEntry(){
  app.innerHTML=`<div>Pause.</div>
    <div style="margin-top:12px;">
      <button id="yesBtn">Yes</button>
      <button id="littleBtn">A little</button>
      <button id="noBtn">No</button>
    </div>
    <div class="app-name"><span class="main">LIMEN</span><span class="year">2026</span></div>`;
  
  fadeIn(app);
  
  document.getElementById('yesBtn').onclick=async()=>{logResponse("Yes"); await fadeOut(app); showWeeklySummary();};
  document.getElementById('littleBtn').onclick=async()=>{logResponse("A little"); await fadeOut(app); startSession();};
  document.getElementById('noBtn').onclick=async()=>{logResponse("No"); await fadeOut(app); showWeeklySummary();};
}

/* INTERVENTION */
async function startSession(interventionKey="Baseline"){
  const step = interventions[interventionKey];
  app.innerHTML=`<div>${step.text}</div>
    <div class="timer-circle pulse">
      <div id="timerFill" class="timer-fill"></div>
      <div id="timerText">${step.duration}</div>
    </div>
    <div class="app-name"><span class="main">LIMEN</span><span class="year">2026</span></div>`;
  fadeIn(app);
  await runTimer(step.duration);
  await fadeOut(app);
  showEntry();
}

/* SPLASH SCREEN */
async function showSplash(){
  app.innerHTML=`<div class="splash-logo">LIMEN</div><div class="splash-tagline">Pause before crossing.</div>`;
  fadeIn(app);
  await new Promise(r=>setTimeout(r,1800));
  await fadeOut(app);
  showEntry();
}

/* INIT */
window.onload=()=>{showSplash();};
