'use strict';
// ── WEAPONS REGISTRY ───────────────────────────────────────────────────────
// To add a weapon:
// 1. Add entry here
// 2. Add attack logic in player.js _doAttack()
// 3. Add hand-weapon visual in player.js _drawHandWpn()
// 4. Add pickup icon in WpnItem.draw() below
const WPN={
  PISTOL:      {name:'PISTOL',    col:'#99aaaa', ammo:15, weight:0.3, recoil:0.8},
  SHOTGUN:     {name:'SHOTGUN',   col:'#cc8833', ammo:6, weight:0.7, recoil:2.2},
  ROCKET:      {name:'ROCKET',    col:'#cc3333', ammo:3, weight:0.9, recoil:1.6},
  BOUNCER:     {name:'BOUNCER',   col:'#cc44ff', ammo:8, weight:0.5, recoil:0.6},
  SNIPER:      {name:'SNIPER',    col:'#44ffcc', ammo:4, weight:0.8, recoil:1.8},
  MINIGUN:     {name:'MINIGUN',   col:'#ff9900', ammo:30, weight:1.0, recoil:0.3},
  GRENADE:     {name:'GRENADE',   col:'#44cc44', ammo:4, weight:0.4, recoil:0.2},
  BLINK_DAGGER:{name:'BLINK DGR', col:'#ff44ff', ammo:3, weight:0.1, recoil:0.0},
  THRUSTER:    {name:'THRUSTER',  col:'#ff9900', ammo:5, weight:0.6, recoil:0.4},
  SWORD:       {name:'SWORD',     col:'#88aaff', ammo:7, weight:0.7, recoil:0.0},
  FLAME_FISTS: {name:'FLAME FX',  col:'#ff5500', ammo:8, weight:0.2, recoil:0.0},
  SHIELD:      {name:'SHIELD',    col:'#44aaff', ammo:14, weight:0.85, recoil:0.0},
};
const WPN_KEYS=Object.keys(WPN);

// ── WEAPON ITEM (pickup on ground) ─────────────────────────────────────────
class WpnItem{
  constructor(x,y,type){this.x=x;this.y=y;this.type=type;this.active=true;this.t=Math.random()*Math.PI*2;}
  tick(){this.t+=.04;}
  draw(){
    if(!this.active)return;
    const dy=Math.sin(this.t)*4,def=WPN[this.type];
    ctx.save();ctx.translate(this.x,this.y+dy);ctx.shadowColor=def.col;ctx.shadowBlur=24;
    ctx.strokeStyle=def.col;ctx.lineWidth=2;ctx.fillStyle='#080f1c';
    const t=this.type;
    if(t==='PISTOL'){ctx.fillRect(-9,-4,18,7);ctx.strokeRect(-9,-4,18,7);ctx.fillRect(4,-10,5,6);ctx.strokeRect(4,-10,5,6);}
    else if(t==='MINIGUN'){ctx.fillRect(-15,-4,30,7);ctx.strokeRect(-15,-4,30,7);ctx.fillRect(4,-10,5,6);ctx.strokeRect(4,-10,5,6);}
    else if(t==='SHOTGUN'){ctx.fillRect(-14,-4,26,7);ctx.strokeRect(-14,-4,26,7);ctx.fillRect(8,-10,5,6);}
    else if(t==='ROCKET'){ctx.fillRect(-16,-4,28,7);ctx.strokeRect(-16,-4,28,7);ctx.fillStyle=def.col;ctx.beginPath();ctx.moveTo(12,-4);ctx.lineTo(18,0);ctx.lineTo(12,4);ctx.fill();}
    else if(t==='BOUNCER'){ctx.fillRect(-16,-4,24,7);ctx.strokeRect(-16,-4,24,7);ctx.fillStyle=def.col;ctx.beginPath();ctx.arc(8,0,5,0,Math.PI*2);ctx.fill();}
    else if(t==='SNIPER'){ctx.fillRect(-20,-3,36,6);ctx.strokeRect(-20,-3,36,6);ctx.fillRect(-8,-8,4,5);}
    else if(t==='GRENADE'){ctx.fillStyle=def.col;ctx.beginPath();ctx.arc(0,0,6,0,Math.PI*2);ctx.fill();ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-6);ctx.lineTo(0,-14);ctx.stroke();ctx.fillRect(-2,-16,4,5);}
    else if(t==='BLINK_DAGGER'){ctx.strokeStyle=def.col;ctx.lineWidth=3;ctx.shadowBlur=18;ctx.beginPath();ctx.moveTo(-14,8);ctx.lineTo(14,-8);ctx.stroke();ctx.beginPath();ctx.moveTo(14,-8);ctx.lineTo(8,-14);ctx.lineTo(14,-8);ctx.lineTo(20,-2);ctx.stroke();}
    else if(t==='THRUSTER'){ctx.fillStyle=def.col;ctx.beginPath();ctx.arc(0,0,5,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#222';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-3,-3);ctx.lineTo(3,3);ctx.moveTo(3,-3);ctx.lineTo(-3,3);ctx.stroke();}
    else if(t==='SWORD'){ctx.strokeStyle=def.col;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,12);ctx.lineTo(0,-22);ctx.stroke();ctx.beginPath();ctx.moveTo(-10,-2);ctx.lineTo(10,-2);ctx.stroke();}
    else if(t==='FLAME_FISTS'){ctx.fillStyle=def.col;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(-8+i*8,0,5-i,0,Math.PI*2);ctx.fill();}}
    else if(t==='SHIELD'){ctx.strokeStyle=def.col;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-12,10);ctx.lineTo(-16,-10);ctx.lineTo(0,-16);ctx.lineTo(16,-10);ctx.lineTo(12,10);ctx.closePath();ctx.stroke();}
    ctx.restore();
    ctx.save();ctx.globalAlpha=.35+Math.sin(this.t*2)*.22;ctx.font='bold 9px Courier New';ctx.fillStyle=def.col;ctx.textAlign='center';ctx.fillText(def.name,this.x,this.y+dy-28);ctx.restore();
  }
  box(){return{x:this.x-22,y:this.y-28,w:44,h:36};}
}
