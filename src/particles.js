'use strict';
// ── PARTICLES ──────────────────────────────────────────────────────────────
let pts=[];
const addPts=(x,y,col,n=6,spd=5,sz=3,grav=.25)=>{for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=rnd(spd*.4,spd);pts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-rnd(1,3),life:1,d:.028+Math.random()*.025,r:rnd(sz*.5,sz),col,grav});}};
const addFire=(x,y,n=4)=>{for(let i=0;i<n;i++){const c=['#ff3300','#ff6600','#ff9900','#ffcc00'][0|Math.random()*4];pts.push({x:x+rnd(-8,8),y,vx:rnd(-1.5,1.5),vy:rnd(-4.5,-1.5),life:1,d:.055+Math.random()*.04,r:rnd(2,5.5),col:c,grav:-.04});}};
const addBlood=(x,y,col,n=5)=>{for(let i=0;i<n;i++){const a=rnd(-Math.PI*.4,-Math.PI*.9),s=rnd(2,8);pts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:1,d:.02+Math.random()*.025,r:rnd(1.5,3.5),col,grav:.3});}};
const addImpactSparks=(x,y,vx,vy)=>{const spd=Math.sqrt(vx*vx+vy*vy)||1;for(let i=0;i<7;i++){const nx=-vx/spd+rnd(-.7,.7),ny=-vy/spd+rnd(-.6,.6);pts.push({x,y,vx:nx*rnd(3,9),vy:ny*rnd(3,9)-1,life:1,d:.07+Math.random()*.05,r:rnd(1.5,3.5),col:Math.random()>.5?'#ffcc44':'#ff8800',grav:.22});}};
const tickPts=(dt=1)=>{pts=pts.filter(p=>p.life>0);pts.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=p.grav*dt;p.vx*=Math.pow(.92,dt);p.life-=p.d*dt;});};
const drawPts=()=>{pts.forEach(p=>{ctx.save();ctx.globalAlpha=p.life*.85;ctx.fillStyle=p.col;ctx.shadowColor=p.col;ctx.shadowBlur=4;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();ctx.restore();});};

// ── MUZZLE FLASH ───────────────────────────────────────────────────────────
let muzzles=[];
const addMuzzle=(x,y,facing)=>muzzles.push({x,y,facing,life:6});
const tickMuzzles=(dt=1)=>{muzzles=muzzles.filter(m=>m.life>0);muzzles.forEach(m=>m.life-=dt);};
const drawMuzzles=()=>{
  muzzles.forEach(m=>{const t=m.life/6;ctx.save();ctx.translate(m.x,m.y);ctx.globalAlpha=t;ctx.fillStyle='#ffee88';ctx.shadowColor='#ffcc00';ctx.shadowBlur=20*t;ctx.beginPath();for(let i=0;i<8;i++){const a=i/8*Math.PI*2,r=(i%2===0?14:6)*t*m.facing;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r*1.2);}ctx.closePath();ctx.fill();ctx.fillStyle='#ffffff';ctx.globalAlpha=t*.8;ctx.beginPath();ctx.arc(0,0,5*t,0,Math.PI*2);ctx.fill();ctx.restore();});
};

// ── SHELL CASINGS ──────────────────────────────────────────────────────────
let shells=[];
class ShellCasing{
  constructor(x,y,facing){Object.assign(this,{x,y,vx:-facing*rnd(2,5)+rnd(-1,1),vy:rnd(-3.5,-6.5),angle:Math.random()*Math.PI,spin:rnd(-.28,.28),life:90+rnd(0,60)|0});}
  tick(dt=1){this.vy+=GRAV*.65*dt;this.x+=this.vx*dt;this.y+=this.vy*dt;this.angle+=this.spin;this.vx*=Math.pow(.98,dt);this.spin*=Math.pow(.96,dt);this.life-=dt;for(const p of map.plats){if(this.x>p.x&&this.x<p.x+p.w&&this.vy>0&&this.y>=p.y&&this.y<=p.y+8){this.y=p.y;this.vy*=-.38;this.vx*=.62;this.spin*=.5;break;}}if(this.y>H+30)this.life=0;}
  draw(){if(this.life<=0)return;ctx.save();ctx.translate(this.x,this.y);ctx.rotate(this.angle);ctx.globalAlpha=Math.min(1,this.life/22)*.8;ctx.fillStyle='#ccaa44';ctx.shadowColor='#aa8822';ctx.shadowBlur=3;ctx.fillRect(-3,-1.5,7,3);ctx.restore();}
}
const addShell=(x,y,facing)=>shells.push(new ShellCasing(x,y,facing));
const tickShells=(dt=1)=>{shells=shells.filter(s=>s.life>0);shells.forEach(s=>s.tick(dt));};
const drawShells=()=>shells.forEach(s=>s.draw());

// ── FLOATING DAMAGE NUMBERS ────────────────────────────────────────────────
let dNums=[];
const addDmgNum=(x,y,val,col,isHead=false)=>dNums.push({x,y,val,col,life:1,vy:-2.8,isHead});
const tickDnums=(dt=1)=>{dNums=dNums.filter(d=>d.life>0);dNums.forEach(d=>{d.y+=d.vy*dt;d.vy*=Math.pow(.93,dt);d.life-=.024*dt;});};
const drawDnums=()=>{dNums.forEach(d=>{ctx.save();ctx.globalAlpha=d.life;if(d.isHead){ctx.fillStyle='#ffdd00';ctx.shadowColor='#ffaa00';ctx.shadowBlur=14;ctx.font='bold 13px Courier New';}else{ctx.fillStyle=d.col;ctx.shadowColor=d.col;ctx.shadowBlur=8;ctx.font=`bold ${10+d.val*.05}px Courier New`;}ctx.textAlign='center';if(d.isHead)ctx.fillText('HEADSHOT!',d.x,d.y-12);ctx.fillText((d.isHead?'×2 ':'')+'-'+d.val,d.x,d.y);ctx.restore();});};

// ── KILL FEED ──────────────────────────────────────────────────────────────
let kFeed=[];
const addKill=(kc,kn,vc,vn)=>{kFeed.unshift({k:kn,kc,v:vn,vc,life:1});if(kFeed.length>4)kFeed.pop();};
const drawKFeed=()=>{kFeed=kFeed.filter(k=>k.life>0);kFeed.forEach((k,i)=>{k.life-=.004;const x=W-12,y=14+i*20;ctx.save();ctx.globalAlpha=k.life*.85;ctx.textAlign='right';ctx.font='bold 11px Courier New';ctx.fillStyle=k.kc;ctx.fillText(k.k,x-60,y);ctx.fillStyle='#3a4a5a';ctx.fillText(' › ',x-55,y);ctx.fillStyle=k.vc;ctx.fillText(k.v,x,y);ctx.restore();});};

// ── DUST CLOUDS ────────────────────────────────────────────────────────────
let dusts=[];
const addDustCloud=(x,y,col,isAir)=>{
  const n=isAir?10:7;
  for(let i=0;i<n;i++){const side=i%2===0?1:-1,spd=rnd(1.5,isAir?4.5:3);const a=isAir?(Math.PI*.5+side*rnd(.2,1.1)):(Math.PI+side*rnd(.1,.7));dusts.push({x:x+rnd(-6,6),y,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd-(isAir?.5:0),life:1,d:isAir?.045:.055,r:rnd(4,isAir?9:7),col:isAir?col:'#aabbcc',isAir});}
  if(isAir)dusts.push({x,y,vx:0,vy:0,life:1,d:.08,r:18,col,isAir:true,ring:true});
};
const tickDusts=(dt=1)=>{dusts=dusts.filter(d=>d.life>0);dusts.forEach(d=>{d.x+=d.vx*dt;d.y+=d.vy*dt;d.vx*=Math.pow(.88,dt);d.vy*=Math.pow(.88,dt);d.life-=d.d*dt;});};
const drawDusts=()=>{dusts.forEach(d=>{ctx.save();ctx.globalAlpha=d.life*(d.isAir?.7:.45);if(d.ring){ctx.strokeStyle=d.col;ctx.lineWidth=2;ctx.shadowColor=d.col;ctx.shadowBlur=12;ctx.beginPath();ctx.arc(d.x,d.y,d.r*(1-d.life)*3+4,0,Math.PI*2);ctx.stroke();}else{ctx.fillStyle=d.col;ctx.shadowColor=d.col;ctx.shadowBlur=d.isAir?6:0;ctx.beginPath();ctx.arc(d.x,d.y,d.r*d.life,0,Math.PI*2);ctx.fill();}ctx.restore();});};

// ── SCREEN SHAKE ───────────────────────────────────────────────────────────
let shakeT=0,shakeStr=0;
const addShake=(s,d=8)=>{shakeStr=Math.max(shakeStr,s);shakeT=d;};
const getShake=()=>{if(shakeT<=0)return{x:0,y:0};const s=shakeStr*(shakeT/8);return{x:rnd(-s,s),y:rnd(-s,s)};};

// ── TICK ALL ───────────────────────────────────────────────────────────────
const tickAllParticles=(dt=1)=>{tickPts(dt);tickDnums(dt);tickDusts(dt);tickMuzzles(dt);tickShells(dt);if(shakeT>0)shakeT-=dt;else if(shakeStr>0)shakeStr=0;};
