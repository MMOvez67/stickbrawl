'use strict';
// ── GAME STATE ─────────────────────────────────────────────────────────────
let players=[],wpns=[],wTimers=[],thrownWpns=[],explosions=[],grenades=[],blinkStrikes=[],stickyBombs=[];
let roundWins=[0,0,0,0],roundState='fight',roundStateT=0,roundNum=0,roundWinner=null;
let gameState='title',finalWinner=null,goT=0,nP=2,frame=0,hudCache='';
let _selMap=0;

// ── VICTORY PHRASES ─────────────────────────────────────────────────────────
const WIN_PHRASES = [
  'GG EZ', 'NO DIFF', 'CLAPPED', 'GET REKT', 'TOO EASY',
  'SKILL ISSUE', 'NOT EVEN CLOSE', 'OUTPLAYED', 'RATIO',
  'BOZO', 'BUILT DIFFERENT', 'COPE', 'LIGHTS OUT', 'DELETED',
  'DONE COOKED', 'DIFF AF', 'RESPECTFULLY DEMOLISHED',
  'MEINE LKW MEINE PROBLEM', 'WAS IST DENN MIT KARSTEN LOS?!',
  'NICHT MEIN PROBLEM', 'COPIUM', 'TOUCH GRASS',
  'STAY MAD', 'SHEESH', 'BYE BYE', 'STAY LOSING',
  'FRIED', 'VAPORIZED', 'ATOMIZED', 'SZENE'
];

// ── SLOWMO & KILL CAM ───────────────────────────────────────────────────────
let slowmo=1.0;
let killCamTarget=null;
let killCamZoom=1.0;
let finishHimT=0;

// ── MAP SELECTION ──────────────────────────────────────────────────────────
window.selMap=i=>{
  _selMap=i;
  ['mb0','mb1','mb2','mb3','mb4'].forEach((id,idx)=>{
    const b=document.getElementById(id);
    if(b){b.style.background=idx===i?'#1c3248':'#0f1c2e';b.style.borderColor=idx===i?'#5090c0':'#1a3050';}
  });
};

// ── SPAWN WEAPON ON MAP ────────────────────────────────────────────────────
const spawnWpn=i=>{
  const t=WPN_KEYS[0|Math.random()*WPN_KEYS.length];
  wpns[i]=new WpnItem(map.wspawns[i].x,map.wspawns[i].y,t);
  wTimers[i]=0;
};

// ── START ROUND ────────────────────────────────────────────────────────────
const startRound=()=>{
  players.forEach(p=>{
    if(!p.active)return;
    Object.assign(p,{x:SPAWNS[p.id].x,y:SPAWNS[p.id].y,vx:0,vy:0,hp:100,dmg:0,stocks:3,alive:true,iF:180,respT:0,
      weapon:null,ammo:0,bullets:[],burning:0,deathProcessed:false,tumble:0,tumbleV:0,landSquash:0});
  });
  wpns=[];wTimers=Array(map.wspawns.length).fill(0);
  thrownWpns=[];explosions=[];grenades=[];blinkStrikes=[];stickyBombs=[];
  for(let i=0;i<map.wspawns.length;i++)spawnWpn(i);
  // Reset all particle arrays
  pts=[];dNums=[];dusts=[];muzzles=[];shells=[];kFeed=[];
  sawAngles=map.sawblades.map(()=>0);
  slowmo=1.0;killCamZoom=1.0;killCamTarget=null;finishHimT=0;
  roundState='intro';roundStateT=0;roundNum++;
};

// ── START GAME ─────────────────────────────────────────────────────────────
window.startGame=(n,mapIdx)=>{
  nP=n;
  const mi=mapIdx!==undefined?mapIdx:(_selMap===4?(0|Math.random()*MAPS.length):_selMap);
  map=MAPS[mi];
  document.getElementById('ts').style.display='none';
  players=Array.from({length:4},(_,i)=>new Player(i,i<n));
  roundWins=[0,0,0,0];roundNum=0;finalWinner=null;goT=0;frame=0;
  gameState='playing';startRound();
};

// ── CHECK WIN ──────────────────────────────────────────────────────────────
const checkWin=()=>{
  if(roundState!=='fight')return;
  const act=players.filter(p=>p.active);
  const alive=act.filter(p=>p.alive);
  if(alive.length<=1){
    roundWinner=alive[0]||null;
    if(roundWinner){
      roundWins[roundWinner.id]++;
      addKill(roundWinner.col,roundWinner.name,'#e63946',act.filter(p=>p.id!==roundWinner.id&&!p.alive).map(p=>p.name).join('&'));
    }
    if(roundWinner&&roundWins[roundWinner.id]>=FT){
      finalWinner=roundWinner;
      finalWinner._phrase=WIN_PHRASES[Math.floor(Math.random()*WIN_PHRASES.length)];
      gameState='gameover';goT=0;slowmo=1.0;killCamZoom=1.0;killCamTarget=null;finishHimT=0;
    }
    else{roundState='roundend';roundStateT=0;slowmo=1.0;killCamZoom=1.0;killCamTarget=null;finishHimT=0;}
  }
};

// ── KILL CAM TRIGGER ───────────────────────────────────────────────────────
const checkKillCamTrigger=(dt=1)=>{
  if(roundState!=='fight')return;
  const act=players.filter(p=>p.active&&p.alive);
  if(act.length!==1)return;
  const lastDanger=act[0];
  const pred=45*dt;
  const willDie=(lastDanger.x+lastDanger.vx*pred>W+60)||(lastDanger.x+lastDanger.vx*pred<-60)||(lastDanger.y+lastDanger.vy*pred>H+60);
  const inFinalKill=lastDanger.hp<=25&&lastDanger.hitT>14&&willDie;
  if(inFinalKill&&slowmo===1.0){slowmo=0.15;killCamTarget={x:lastDanger.x,y:lastDanger.y};finishHimT=1;}
  else if(!willDie)slowmo=Math.max(slowmo-(1-slowmo)*0.08,1);
  else if(slowmo<1)slowmo=slowmo+(1-slowmo)*0.08;
};

// ── HUD ────────────────────────────────────────────────────────────────────
const drawHUD=()=>{
  let html='';
  for(const p of players.filter(p=>p.active)){
    const dmgC=p.dmg>150?'#e63946':p.dmg>80?'#d4850a':'#aac8e0';
    const stk='●'.repeat(Math.max(0,p.stocks))+'○'.repeat(Math.max(0,3-p.stocks));
    const dmgT=(!p.alive&&p.stocks===0)?'OUT':(!p.alive?'···':Math.floor(p.dmg)+'%');
    const wpnT=p.weapon?`<div class="pwpn" style="color:${WPN[p.weapon].col}">${WPN[p.weapon].name}×${p.ammo}</div>`:'';
    const ws=roundWins[p.id];const wStr=`<span style="color:${p.col}">${'◆'.repeat(ws)+'◇'.repeat(Math.max(0,FT-ws))}</span>`;
    html+=`<div class="ph"><div class="pdot" style="background:${p.col}"></div><div><div class="pname">${p.name} ${wStr}</div><div class="pdmg" style="color:${dmgC}">${dmgT}</div>${wpnT}</div><div class="pstk" style="color:${p.col}">${stk}</div></div>`;
  }
  if(html!==hudCache){document.getElementById('hud').innerHTML=html;hudCache=html;}
};

// ── ROUND OVERLAY ──────────────────────────────────────────────────────────
const drawRoundOverlay=(dt=1)=>{
  roundStateT+=dt;
  if(roundState==='intro'){
    if(roundStateT>90){roundState='fight';return;}
    const a=roundStateT<15?roundStateT/15:roundStateT>75?(90-roundStateT)/15:1;
    ctx.save();ctx.globalAlpha=a*.92;ctx.textAlign='center';ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(0,H/2-60,W,120);
    ctx.globalAlpha=a;ctx.shadowColor='#FF6B00';ctx.shadowBlur=30;ctx.fillStyle='#FF6B00';ctx.font='bold 72px Courier New';
    ctx.fillText(roundNum===1?'FIGHT!':'ROUND '+roundNum,W/2,H/2+24);ctx.restore();
  }else if(roundState==='roundend'){
    if(roundStateT>180){
      if(_selMap===4){map=MAPS[0|Math.random()*MAPS.length];sawAngles=map.sawblades.map(()=>0);}
      startRound();return;
    }
    const a=Math.min(roundStateT/18,1);
    ctx.save();ctx.globalAlpha=a*.7;ctx.fillStyle='#04090f';ctx.fillRect(0,0,W,H);
    ctx.globalAlpha=a;ctx.textAlign='center';
    if(roundWinner){ctx.shadowColor=roundWinner.col;ctx.shadowBlur=25;ctx.fillStyle=roundWinner.col;ctx.font='bold 60px Courier New';ctx.fillText(roundWinner.name+' WINS ROUND',W/2,H/2-10);}
    const ap=players.filter(p=>p.active);
    ap.forEach((p,i)=>{
      const bx=W/2+(i-ap.length/2+.5)*120;ctx.shadowBlur=0;ctx.fillStyle='#2a3a4a';ctx.font='bold 13px Courier New';ctx.fillText(p.name,bx,H/2+50);
      for(let w=0;w<FT;w++){ctx.beginPath();ctx.arc(bx-FT*9+w*18,H/2+66,7,0,Math.PI*2);ctx.fillStyle=w<roundWins[p.id]?p.col:'#0f1e2e';ctx.fill();ctx.strokeStyle=p.col;ctx.lineWidth=1.5;ctx.stroke();}
    });
    ctx.restore();
  }
};

// ── GAME OVER ──────────────────────────────────────────────────────────────
const drawGO=(dt=1)=>{
  goT+=dt;ctx.save();ctx.globalAlpha=Math.min(goT/38,.95);ctx.fillStyle='#04090f';ctx.fillRect(0,0,W,H);ctx.restore();
  if(goT<28)return;const ta=Math.min((goT-28)/20,1);ctx.save();ctx.globalAlpha=ta;ctx.textAlign='center';
  if(finalWinner){
    ctx.shadowColor=finalWinner.col;ctx.shadowBlur=40;ctx.fillStyle=finalWinner.col;ctx.font='bold 90px Courier New';ctx.fillText(finalWinner.name,W/2,H/2-40);
    ctx.shadowBlur=0;ctx.fillStyle=finalWinner.col;ctx.font='bold 32px Courier New';ctx.fillText(finalWinner._phrase,W/2,H/2+12);
    ctx.fillStyle='#6a8ea8';ctx.font='13px Courier New';ctx.fillText('— '+roundWins[finalWinner.id]+'/'+FT+' ROUNDS',W/2,H/2+42);
    if(goT>52){const cx2=W/2+260,fy2=H/2+100;ctx.strokeStyle=finalWinner.col;ctx.lineWidth=4;ctx.lineCap='round';ctx.shadowColor=finalWinner.col;ctx.shadowBlur=16;ctx.beginPath();ctx.arc(cx2,fy2-90,13,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(cx2,fy2-77);ctx.lineTo(cx2,fy2-44);ctx.stroke();ctx.beginPath();ctx.moveTo(cx2,fy2-44);ctx.lineTo(cx2-16,fy2);ctx.stroke();ctx.beginPath();ctx.moveTo(cx2,fy2-44);ctx.lineTo(cx2+16,fy2);ctx.stroke();ctx.beginPath();ctx.moveTo(cx2,fy2-64);ctx.lineTo(cx2-26,fy2-92);ctx.stroke();ctx.beginPath();ctx.moveTo(cx2,fy2-64);ctx.lineTo(cx2+26,fy2-92);ctx.stroke();}
  }else{ctx.fillStyle='#6a8ea8';ctx.font='bold 52px Courier New';ctx.fillText('UNENTSCHIEDEN!',W/2,H/2);}
  if(goT>95){ctx.globalAlpha=ta*(.38+Math.sin(goT*.09)*.32);ctx.font='11px Courier New';ctx.fillStyle='#2a3a4a';ctx.fillText('[ R = Neustart ]   [ ESC = Menü ]',W/2,H/2+85);}
  ctx.restore();
};

window.addEventListener('keydown',e=>{
  if(gameState!=='gameover'||goT<95)return;
  if(e.key==='r'||e.key==='R'||e.key===' ')startGame(nP);
  else if(e.key==='Escape'){gameState='title';document.getElementById('ts').style.display='flex';}
});

// ── FRAMERATE INDEPENDENCE ────────────────────────────────────────────────
const TARGET_FPS=60;
const TARGET_DT=1000/TARGET_FPS;
let lastTime=0;

// ── MAIN LOOP ──────────────────────────────────────────────────────────────
const loop=(timestamp)=>{
  requestAnimationFrame(loop);
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,W,H);ctx.restore();
  const rawDt=timestamp-lastTime;lastTime=timestamp;
  const dt=Math.min(rawDt,50)/TARGET_DT;
  frame++;

  if(gameState==='title'){
    const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#07111e');sky.addColorStop(1,'#0b1525');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);return;
  }

  // Weapon timers
  for(let i=0;i<map.wspawns.length;i++){if(wpns[i]){if(!wpns[i].active){wTimers[i]+=dt;if(wTimers[i]>340)spawnWpn(i);}else wpns[i].tick(dt);}}
  for(const ex of explosions)ex.tick(dt);
  for(const tw of thrownWpns)tw.tick(dt);
  for(const g of grenades)g.tick(dt,explosions);
  for(const bs of blinkStrikes)bs.tick(dt);
  for(const sb of stickyBombs)sb.tick(dt,players,explosions);
  [grenades,blinkStrikes,stickyBombs].forEach(arr=>{for(let i=arr.length-1;i>=0;i--)if(!arr[i].active)arr.splice(i,1);});

  if(gameState==='playing'&&roundState==='fight'){
    for(const p of players)p.tick(dt,wpns,thrownWpns,explosions);
    doCombat();checkWin();checkKillCamTrigger(dt);
    tickAllParticles(dt);
  }

  const sh=getShake();
  if(killCamTarget&&slowmo<0.5){
    killCamZoom=Math.min(killCamZoom+0.04,2.2);
    const alivePlayer=players.find(p=>p.active&&p.alive);
    const targetX=alivePlayer?.x||W/2;
    const targetY=alivePlayer?.y||H/2;
    killCamTarget.x+=(targetX-killCamTarget.x)*0.04;
    killCamTarget.y+=(targetY-killCamTarget.y)*0.04;
  }else killCamZoom=Math.max(killCamZoom-0.06,1.0);
  const zx=killCamTarget?killCamTarget.x:W/2,zy=killCamTarget?killCamTarget.y:H/2;
  ctx.save();ctx.translate(sh.x,sh.y);ctx.translate(zx,zy);ctx.scale(killCamZoom,killCamZoom);ctx.translate(-zx,-zy);
  drawMap();
  explosions.forEach(e=>e.draw());for(let i=explosions.length-1;i>=0;i--)if(!explosions[i].active)explosions.splice(i,1);
  thrownWpns.forEach(tw=>{if(tw.active)tw.draw();});for(let i=thrownWpns.length-1;i>=0;i--)if(!thrownWpns[i].active)thrownWpns.splice(i,1);
  grenades.forEach(g=>g.draw());blinkStrikes.forEach(bs=>bs.draw());stickyBombs.forEach(sb=>sb.draw());
  wpns.forEach(w=>{if(w&&w.active)w.draw();});
  drawShells();players.forEach(p=>p.draw());
  drawPts();drawDusts();drawMuzzles();drawDnums();

  // Respawn rings
  for(const p of players){
    if(!p.active||p.alive||p.stocks<=0)continue;const sp=SPAWNS[p.id],prog=1-p.respT/145;
    ctx.save();ctx.strokeStyle=p.col;ctx.lineWidth=2.5;ctx.globalAlpha=.55;
    ctx.beginPath();ctx.arc(sp.x,sp.y-40,24,-Math.PI/2,-Math.PI/2+Math.PI*2*prog);ctx.stroke();
    ctx.fillStyle=p.col;ctx.globalAlpha=.35;ctx.beginPath();ctx.arc(sp.x,sp.y-40,4,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  drawKFeed();
  if(finishHimT>0&&finishHimT<120){finishHimT+=dt;const a=finishHimT<20?finishHimT/20:finishHimT>100?(120-finishHimT)/20:1;const s=1+Math.sin(finishHimT*0.15)*0.04;ctx.save();ctx.globalAlpha=a*0.92;ctx.textAlign='center';ctx.translate(W/2,H/2-60);ctx.scale(s,s);ctx.font='bold 68px Courier New';ctx.fillStyle='#ff2200';ctx.shadowColor='#ff0000';ctx.shadowBlur=30;ctx.fillText('FINISH HIM',0,0);ctx.restore();}
  ctx.save();ctx.globalAlpha=.18;ctx.font='bold 11px Courier New';ctx.fillStyle='#5090c0';ctx.fillText(map.name,10,16);ctx.restore();
  ctx.restore();

  if(roundState!=='fight')drawRoundOverlay(dt);
  if(gameState==='gameover')drawGO(dt);
  if(frame%3===0)drawHUD();
  if(typeof isNetworkMode==='function'&&isNetworkMode()){
    const myId=isNetworkHost()?0:1;const p=players[myId];
    if(p&&p.active)sendNetworkInput(p.getInput());
  }
};

requestAnimationFrame(loop);
