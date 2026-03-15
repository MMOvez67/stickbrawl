'use strict';
// ── HELPERS ────────────────────────────────────────────────────────────────
const lerp=(a,b,t)=>a+(b-a)*t;
const pInBox=(px,py,b)=>px>b.x&&px<b.x+b.w&&py>b.y&&py<b.y+b.h;
const rnd=(lo,hi)=>lo+Math.random()*(hi-lo);

// ── EXPLOSION ──────────────────────────────────────────────────────────────
class Explosion{
  constructor(x,y,r){this.x=x;this.y=y;this.maxR=r;this.r=0;this.life=1;this.active=true;this.hitPlayers=new Set();this.peaked=false;}
  tick(){this.r=lerp(this.r,this.maxR,.22);this.life-=.048;if(!this.peaked&&this.r>this.maxR*.45)this.peaked=true;if(this.life<=0)this.active=false;}
  draw(){if(!this.active)return;ctx.save();ctx.globalAlpha=this.life*.65;const g=ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,this.r);g.addColorStop(0,'#ffffaa');g.addColorStop(.25,'#ff8800');g.addColorStop(1,'rgba(200,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=this.life*.2;ctx.strokeStyle='#ff6600';ctx.lineWidth=2;ctx.beginPath();ctx.arc(this.x,this.y,this.r*.9,0,Math.PI*2);ctx.stroke();ctx.restore();}
}

// ── BULLET ─────────────────────────────────────────────────────────────────
// type: 'normal'|'pellet'|'rocket'|'bouncer'|'sniper'|'minigun'
class Bullet{
  constructor(x,y,vx,vy,owner,type='normal'){
    Object.assign(this,{x,y,vx,vy,owner,type,active:true,trail:[],life:200,reflected:false,reflectImmunity:-1,bounces:0});
    if(type==='rocket'){this.r=6;this.life=260;}
    else if(type==='pellet'){this.r=3;this.life=80;}
    else if(type==='bouncer'){this.r=4;this.life=320;}
    else if(type==='sniper'){this.r=3;this.life=80;this.pierced=new Set();}
    else if(type==='minigun'){this.r=3;this.life=120;}
    else this.r=4;
  }
  tick(){
    this.trail.push({x:this.x,y:this.y});if(this.trail.length>9)this.trail.shift();
    if(this.type==='rocket')this.vy+=.06*slowmo;
    else if(this.type==='sniper')this.vy+=.01*slowmo;
    else if(this.type==='bouncer')this.vy+=.04*slowmo;
    else if(this.type==='pellet')this.vy+=.12*slowmo;
    else if(this.type==='minigun')this.vy+=.08*slowmo;
    else if(this.type==='normal')this.vy+=.03*slowmo;
    this.x+=this.vx*slowmo;this.y+=this.vy*slowmo;this.life--;
    if(this.life<=0||this.x<-150||this.x>W+150||this.y<-260||this.y>H+260){this.active=false;return;}
    for(const p of map.plats){
      if(!pInBox(this.x,this.y,p))continue;
      if(this.type==='rocket')return;
      if(this.type==='bouncer'&&this.bounces<5){const fl=this.vx>0&&this.x<p.x+20,fr=this.vx<0&&this.x>p.x+p.w-20;if(fl||fr)this.vx*=-1;else this.vy*=-1;this.bounces++;this.x+=this.vx*2;this.y+=this.vy*2;addImpactSparks(this.x,this.y,this.vx,this.vy);return;}
      addImpactSparks(this.x,this.y,this.vx,this.vy);this.active=false;return;
    }
  }
  draw(){
    if(!this.active)return;
    const cols={normal:'#FF9800',pellet:'#ffdd55',rocket:'#ff4400',bouncer:'#dd44ff',sniper:'#44ffcc',minigun:'#ffbb44'};
    const c=cols[this.type]||'#FF9800';
    this.trail.forEach((t,i)=>{ctx.globalAlpha=(i/this.trail.length)*.15;ctx.fillStyle=c;ctx.beginPath();ctx.arc(t.x,t.y,this.r*.4,0,Math.PI*2);ctx.fill();});
    ctx.globalAlpha=1;ctx.save();
    const spd=Math.sqrt(this.vx*this.vx+this.vy*this.vy);
    if(spd>3&&this.type!=='rocket'){
      ctx.translate(this.x,this.y);ctx.rotate(Math.atan2(this.vy,this.vx));
      const tLen=Math.min(spd*2.2,26);ctx.fillStyle=c;ctx.shadowColor=c;ctx.shadowBlur=10;
      ctx.beginPath();ctx.ellipse(0,0,tLen*.5,this.r*.55,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#ffffff';ctx.globalAlpha=.55;ctx.beginPath();ctx.ellipse(0,0,tLen*.28,this.r*.28,0,0,Math.PI*2);ctx.fill();
    }else{
      ctx.fillStyle=c;ctx.shadowColor=c;ctx.shadowBlur=this.type==='rocket'?18:10;
      ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fill();
      if(this.type==='rocket'){ctx.fillStyle='#aa2200';ctx.fillRect(this.x-10,this.y-3,16,6);if(Math.random()>.5)addFire(this.x-(this.vx>0?9:-9),this.y,1);}
    }
    if(this.type==='sniper'){ctx.strokeStyle=c;ctx.lineWidth=1.5;ctx.globalAlpha=.35;ctx.beginPath();ctx.moveTo(this.x-this.vx*3,this.y-this.vy*3);ctx.lineTo(this.x,this.y);ctx.stroke();}
    ctx.restore();
  }
}

// ── GRENADE ────────────────────────────────────────────────────────────────
class Grenade{
  constructor(x,y,vx,vy,owner){Object.assign(this,{x,y,vx,vy,owner,active:true,fuse:200,bounces:0,angle:0});}
  tick(explosions){this.vy+=GRAV*.7*slowmo;this.vx*=.992;this.x+=this.vx*slowmo;this.y+=this.vy*slowmo;this.angle+=this.vx*.08;this.fuse--;if(this.fuse<=0){this._explode(explosions);return;}for(const p of map.plats){if(!pInBox(this.x,this.y,p))continue;if(this.vy>0){this.y=p.y-1;this.vy*=-.55;this.vx*=.7;}else{this.y=p.y+p.h+1;this.vy*=-.4;}this.bounces++;if(this.bounces>4)this._explode(explosions);break;}if(this.y>H+60)this.active=false;}
  _explode(exp){if(!this.active)return;exp.push(new Explosion(this.x,this.y,85));addPts(this.x,this.y,'#ff8800',18,8,5,.14);addShake(7,12);sound('rocket');this.active=false;}
  draw(){if(!this.active)return;const blink=this.fuse<60&&Math.floor(this.fuse/6)%2===0;ctx.save();ctx.translate(this.x,this.y);ctx.rotate(this.angle);ctx.fillStyle=blink?'#ff4400':'#44aa44';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=blink?14:6;ctx.beginPath();ctx.arc(0,0,5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#888';ctx.fillRect(-2,-8,4,6);ctx.restore();}
}

// ── BLINK DAGGER ───────────────────────────────────────────────────────────
class BlinkStrike{
  constructor(x,y,facing,owner){Object.assign(this,{x,y,tx:x+facing*200,ty:y,owner,facing,active:true,t:0,dur:12});}
  tick(){this.t++;if(this.t>=this.dur)this.active=false;}
  draw(){if(!this.active)return;const prog=this.t/this.dur,cx2=lerp(this.x,this.tx,prog),cy=lerp(this.y,this.ty,prog);ctx.save();ctx.globalAlpha=(1-prog)*.8;ctx.strokeStyle='#ff44ff';ctx.lineWidth=2;ctx.shadowColor='#ff44ff';ctx.shadowBlur=20;ctx.beginPath();ctx.moveTo(this.x,this.y);ctx.lineTo(cx2,cy);ctx.stroke();ctx.fillStyle='#ff44ff';ctx.beginPath();ctx.arc(cx2,cy,6,0,Math.PI*2);ctx.fill();ctx.restore();}
  tip(){const prog=Math.min(this.t/this.dur,1);return{x:lerp(this.x,this.tx,prog),y:lerp(this.y,this.ty,prog)};}
}

// ── STICKY BOMB ────────────────────────────────────────────────────────────
class StickyBomb{
  constructor(x,y,vx,vy,owner){Object.assign(this,{x,y,vx,vy,owner,active:true,stuck:false,stuckTo:null,fuse:180});}
  tick(players,exp){
    this.fuse--;
    if(!this.stuck){this.vy+=GRAV*.6*slowmo;this.x+=this.vx*slowmo;this.y+=this.vy*slowmo;for(const p of map.plats){if(pInBox(this.x,this.y,p)){this.stuck=true;this.vx=0;this.vy=0;break;}}for(const p of players){if(!p.active||!p.alive||p.id===this.owner)continue;if(pInBox(this.x,this.y,p.box())){this.stuck=true;this.stuckTo=p;this.vx=0;this.vy=0;break;}}}
    else if(this.stuckTo?.alive){this.x=this.stuckTo.x;this.y=this.stuckTo.y-20;}
    if(this.fuse<=0){if(this.stuckTo?.alive){const dir=this.stuckTo.vx>=0?1:-1;this.stuckTo.vx+=dir*22;this.stuckTo.vy-=4;addPts(this.x,this.y,'#ff6600',14,9,5,.12);addShake(6,10);sound('rocket');}else{exp.push(new Explosion(this.x,this.y,70));addShake(5,8);sound('rocket');}this.active=false;}
    if(this.y>H+60)this.active=false;
  }
  draw(){if(!this.active)return;const blink=this.fuse<60&&Math.floor(this.fuse/5)%2===0;ctx.save();ctx.translate(this.x,this.y);ctx.fillStyle=blink?'#ff4400':'#ff9900';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=blink?16:8;ctx.beginPath();ctx.arc(0,0,5,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#222';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-3,-3);ctx.lineTo(3,3);ctx.moveTo(3,-3);ctx.lineTo(-3,3);ctx.stroke();ctx.restore();}
}

// ── THROWN WEAPON ──────────────────────────────────────────────────────────
class ThrownWpn{
  constructor(x,y,vx,vy,owner,type){Object.assign(this,{x,y,vx,vy,owner,type,active:true,angle:0,spin:vx*.06});}
  tick(){this.vy+=GRAV*.8*slowmo;this.x+=this.vx*slowmo;this.y+=this.vy*slowmo;this.angle+=this.spin;this.vx*=.97;if(this.y>H+100)this.active=false;for(const p of map.plats){if(pInBox(this.x,this.y,p)){this.vy*=-.5;this.vx*=.5;this.spin*=.5;break;}}}
  draw(){if(!this.active)return;const def=WPN[this.type];ctx.save();ctx.translate(this.x,this.y);ctx.rotate(this.angle);ctx.fillStyle=def.col;ctx.shadowColor=def.col;ctx.shadowBlur=10;ctx.fillRect(-10,-3,18,5);ctx.restore();}
  box(){return{x:this.x-14,y:this.y-10,w:28,h:20};}
}
