'use strict';
class Player{
  constructor(id,active){
    this.id=id;this.col=COLS[id];this.name=NAMES[id];this.ctrl=KB[id];this.active=active;
    this.x=SPAWNS[id].x;this.y=SPAWNS[id].y;
    this.vx=0;this.vy=0;this.onGround=false;this.jumpsLeft=2;
    this.hp=100;this.maxHp=100;this.dmg=0;this.stocks=3;this.alive=true;this.respT=0;this.iF=0;
    this.weapon=null;this.ammo=0;this.bullets=[];
    this.atkT=0;this.atkCD=0;this.hitT=0;this.shielding=false;
    this.burning=0;this.coyoteT=0;this.wallDir=0;this.wallT=0;
    this.anim=Math.random()*100;this.facing=id<2?1:-1;
    this.pJ=false;this.pA=false;this.pP=false;this.chargeT=0;
    this.minigunHeld=0;this.deathProcessed=false;
    this.tumble=0;this.tumbleV=0;this.landSquash=0;this.prevVy=0;
  }

  getInput(){
    let L=false,R=false,U=false,A=false,P=false;
    if(!this.active)return{L,R,U,A,P};
    if(this.ctrl){
      L=kH(this.ctrl.L);R=kH(this.ctrl.R);U=kH(this.ctrl.U);A=kH(this.ctrl.ATK);P=kH(this.ctrl.PK);
    }else{
      const pad=navigator.getGamepads()[0];
      if(pad){L=pad.axes[0]<-.3||(pad.buttons[14]?.pressed||false);R=pad.axes[0]>.3||(pad.buttons[15]?.pressed||false);U=pad.buttons[0]?.pressed||false;A=pad.buttons[2]?.pressed||false;P=pad.buttons[1]?.pressed||false;}
    }
    return{L,R,U,A,P};
  }

  box(){return{x:this.x-PW,y:this.y-PH,w:PW*2,h:PH};}
  headBox(){return{x:this.x-9,y:this.y-72,w:18,h:20};}
  punchBox(){
    const isMelee=!this.weapon||this.weapon==='SWORD'||this.weapon==='FLAME_FISTS';
    if(this.atkT<=14||!isMelee)return null;
    const rng=this.weapon==='SWORD'?48:30;
    const ox=this.facing===1?10:-10-rng;
    return{x:this.x+ox,y:this.y-54,w:rng,h:26};
  }

  tick(dt=1,wpns,thrownWpns,explosions){
    if(!this.active)return;
    if(!this.alive){
      if(this.stocks>0){this.respT+=dt;if(this.respT>=145){this.respT=0;this._spawn();}}
      return;
    }
    this.anim++;
    if(this.atkT>0)this.atkT-=dt;if(this.atkCD>0)this.atkCD-=dt;
    if(this.iF>0)this.iF-=dt;if(this.hitT>0)this.hitT-=dt;if(this.wallT>0)this.wallT-=dt;
    if(this.burning>0){const prevBurn=this.burning;this.burning-=dt;if(Math.floor(prevBurn/6)!==Math.floor(this.burning/6)){this.dmg+=1;addFire(this.x+(Math.random()*16-8),this.y-(Math.random()*30+20),2);}}
    this.tumble+=this.tumbleV;this.tumbleV*=Math.pow(this.onGround?.72:.93,dt);
    if(Math.abs(this.tumbleV)<.005&&this.onGround)this.tumble+=(0-this.tumble)*.15;
    if(this.landSquash>0)this.landSquash=Math.max(0,this.landSquash-.09);

    const wpnW=this.weapon&&WPN[this.weapon]?WPN[this.weapon].weight:0;
    const curAccel=BASE_ACCEL*(1-wpnW*WEIGHT_SLOWDOWN)*dt;
    const curMaxVx=BASE_MAX_VX*(1-wpnW*WEIGHT_SLOWDOWN);

    const c=this.getInput();
    if(c.L){this.vx-=curAccel;this.facing=-1;}if(c.R){this.vx+=curAccel;this.facing=1;}
    this.vx=clamp(this.vx,-curMaxVx,curMaxVx);

    const canJump=this.jumpsLeft>0||this.coyoteT>0;
    if(c.U&&!this.pJ){
      if(this.wallT>0&&this.jumpsLeft<=0){this.vy=JUMP_V*.9;this.vx=-this.wallDir*8;this.wallT=0;addDustCloud(this.x,this.y,this.col,true);}
      else if(canJump){
        const isAir=!this.onGround&&this.coyoteT<=0;this.vy=JUMP_V;
        if(this.coyoteT>0)this.coyoteT=0;else this.jumpsLeft--;
        if(isAir)addDustCloud(this.x,this.y-PH*.4,this.col,true);else addDustCloud(this.x,this.y,this.col,false);
      }
    }
    this.pJ=c.U;
    this.shielding=this.weapon==='SHIELD'&&c.A;
    if(c.A&&!this.shielding){
      if(this.weapon==='MINIGUN'){
        this.minigunHeld++;
        if(this.atkCD<=0&&this.minigunHeld>3){
          this.bullets.push(new Bullet(this.x+this.facing*22,this.y-36,this.facing*(14+(Math.random()*2-1)),Math.random()*2-1,this.id,'minigun'));
          this.vx-=this.facing*.6;addMuzzle(this.x+this.facing*22,this.y-36,this.facing);addShell(this.x+this.facing*8,this.y-36,this.facing);
          this._useAmmo(4,6);sound('shoot');
        }
      }else if(!this.pA&&this.atkCD<=0)this._doAttack();
    }else this.minigunHeld=0;
    this.pA=c.A;

    if(c.P&&!this.pP&&this.weapon)this.chargeT=0;
    if(c.P&&this.weapon)this.chargeT+=dt;
    if(!c.P&&this.pP&&this.weapon){
      const chargeMult=1+Math.min(this.chargeT/120,1);
      thrownWpns.push(new ThrownWpn(this.x+this.facing*20,this.y-30,this.facing*10*chargeMult,-4,this.id,this.weapon));
      this.weapon=null;this.ammo=0;this.chargeT=0;
    }
    this.pP=c.P;

    if(!this.weapon){
      for(const w of wpns){if(!w||!w.active)continue;if(boxOlp(this.box(),w.box())){this.weapon=w.type;this.ammo=WPN[w.type].ammo;w.active=false;sound('pickup');break;}}
      for(const tw of thrownWpns){if(!tw.active)continue;if(boxOlp(this.box(),tw.box())){this.weapon=tw.type;this.ammo=Math.ceil(WPN[tw.type].ammo*.6);tw.active=false;sound('pickup');break;}}
    }

    const s=typeof slowmo!=='undefined'?slowmo:1;
    this.vy=Math.min(this.vy+GRAV*dt*s,TERM_V);
    this.vx*=Math.pow(this.onGround?FRIC:FRIC_AIR,dt);
    if(Math.abs(this.vx)<.07)this.vx=0;
    this.x+=this.vx*dt*s;
    this.prevVy=this.vy;

    const wasGround=this.onGround;
    this.onGround=false;this.wallDir=0;
    const steps=Math.ceil(Math.abs(this.vy*dt*s)/7),stepVy=this.vy*dt*s/steps;
    for(let si=0;si<steps;si++){
      const prevY=this.y;this.y+=stepVy;let hit=false;
      for(const p of map.plats){
        if(this.x+PW<=p.x||this.x-PW>=p.x+p.w)continue;
        if(stepVy>=0&&prevY<=p.y+2&&this.y>=p.y){
          if(!wasGround&&this.prevVy>4)this.landSquash=Math.min(this.prevVy/14,1);
          this.y=p.y;this.onGround=true;this.vy=0;hit=true;break;
        }
        if(p.solid&&stepVy<0){const hY=this.y-PH,phY=prevY-PH;if(phY>=p.y+p.h&&hY<p.y+p.h){this.y=p.y+p.h+PH;this.vy=0;}}
      }
      if(hit)break;
    }
    if(!this.onGround){
      for(const p of map.plats){
        if(!p.solid)continue;const oy=this.y>p.y&&(this.y-PH)<p.y+p.h;if(!oy)continue;
        if(this.x-PW<=p.x+p.w&&this.x-PW>=p.x+p.w-10&&this.vx<0){this.wallDir=-1;this.wallT=10;this.vx=Math.max(this.vx,-.5);break;}
        if(this.x+PW>=p.x&&this.x+PW<=p.x+10&&this.vx>0){this.wallDir=1;this.wallT=10;this.vx=Math.min(this.vx,.5);break;}
      }
    }
    if(this.onGround){this.jumpsLeft=2;this.coyoteT=7;}else if(this.coyoteT>0)this.coyoteT-=dt;

    for(const b of this.bullets){
      if(!b.active||b.type!=='rocket')continue;
      for(const p of map.plats){if(pInBox(b.x,b.y,p)){explosions.push(new Explosion(b.x,b.y,100));addPts(b.x,b.y,'#ff6600',22,9,6,.12);addShake(2,8);sound('rocket');b.active=false;break;}}
    }
    for(const sb of map.sawblades){
      if(dist(this.x,this.y-PH*.5,sb.x,sb.y)<sb.r+8){const dx=this.x-sb.x,dy=(this.y-PH*.5)-sb.y,n=Math.max(dist(this.x,this.y-PH*.5,sb.x,sb.y),.1);this.takeDmg(3,(dx/n)*5,(dy/n)*5);}
    }
    for(const b of this.bullets)b.tick(dt);
    this.bullets=this.bullets.filter(b=>b.active);
    if(this.y>H+260||this.x<-440||this.x>W+440||this.y<-600)this._die();
  }

  _getAimVector(speed){
    const dx=mouseX-this.x,dy=mouseY-(this.y-36);
    const len=Math.sqrt(dx*dx+dy*dy)||1;
    this.facing=dx>=0?1:-1;
    return{vx:(dx/len)*speed,vy:(dy/len)*speed};
  }

  _doAttack(){
    const bx=this.x+this.facing*22,by=this.y-36;
    if(!this.weapon){this.atkT=24;this.atkCD=26;sound('hit');}
    else if(this.weapon==='PISTOL'){const{vx,vy}=this._getAimVector(15);this.bullets.push(new Bullet(bx,by,vx,vy,this.id,'normal'));addMuzzle(bx,by,this.facing);addShell(this.x+this.facing*8,by,this.facing);this._useAmmo(10,10);sound('shoot');}
    else if(this.weapon==='SHOTGUN'){const aim=this._getAimVector(12);const angle=Math.atan2(aim.vy,aim.vx);for(let i=-2;i<=2;i++){const spread=i*0.12;this.bullets.push(new Bullet(bx,by,Math.cos(angle+spread)*12,Math.sin(angle+spread)*12,this.id,'pellet'));}addMuzzle(bx,by,this.facing);this.vx-=this.facing*5.5;this.vy-=1.5;this._useAmmo(24,24);sound('shotgun');addShake(2,4);}
    else if(this.weapon==='ROCKET'){const{vx:rvx,vy:rvy}=this._getAimVector(7);this.bullets.push(new Bullet(this.x+this.facing*26,by,rvx,rvy,this.id,'rocket'));addMuzzle(this.x+this.facing*26,by,this.facing);this.vx-=this.facing*2.5;this._useAmmo(50,50);addShake(2,4);}
    else if(this.weapon==='BOUNCER'){const{vx:bvx,vy:bvy}=this._getAimVector(13);this.bullets.push(new Bullet(bx,by,bvx,bvy,this.id,'bouncer'));addMuzzle(bx,by,this.facing);addShell(this.x+this.facing*8,by,this.facing);this._useAmmo(14,14);sound('shoot');}
    else if(this.weapon==='SNIPER'){const{vx:svx,vy:svy}=this._getAimVector(32);this.bullets.push(new Bullet(bx,by,svx,svy,this.id,'sniper'));addMuzzle(bx,by,this.facing);this.vx-=this.facing*3.5;this._useAmmo(30,30);sound('sniper');addShake(2,6);}
    else if(this.weapon==='MINIGUN'){const{vx:mvx,vy:mvy}=this._getAimVector(14);const mAngle=Math.atan2(mvy,mvx);const mSpread=(Math.random()-.5)*.15;this.bullets.push(new Bullet(bx,by,Math.cos(mAngle+mSpread)*14,Math.sin(mAngle+mSpread)*14,this.id,'minigun'));this.vx-=this.facing*.6;addMuzzle(bx,by,this.facing);addShell(this.x+this.facing*8,by,this.facing);this._useAmmo(4,6);sound('shoot');}
    else if(this.weapon==='GRENADE'){const aim=this._getAimVector(8);grenades.push(new Grenade(this.x+this.facing*18,by,aim.vx,aim.vy-2,this.id));this._useAmmo(20,28);sound('shoot');}
    else if(this.weapon==='BLINK_DAGGER'){blinkStrikes.push(new BlinkStrike(this.x,by,this.facing,this.id));this.x+=this.facing*200;addDustCloud(this.x,by,this.col,true);addPts(this.x,by,'#ff44ff',8,5,3,.12);this._useAmmo(18,40);sound('sniper');}
    else if(this.weapon==='THRUSTER'){const aim=this._getAimVector(10);stickyBombs.push(new StickyBomb(this.x+this.facing*18,by,aim.vx,aim.vy-2,this.id));this._useAmmo(16,22);sound('shoot');}
    else if(this.weapon==='FLAME_FISTS'){this.atkT=28;this.atkCD=22;}
    else if(this.weapon==='SWORD'){this.atkT=32;this.atkCD=34;}
  }
  _useAmmo(atk,cd){this.atkT=atk;this.atkCD=cd;this.ammo--;if(this.ammo<=0)this.weapon=null;}

  takeDmg(amt,kbx,kby,flaming=false,headshot=false){
    if(this.iF>0)return false;
    if(this.shielding&&Math.sign(kbx||1)!==this.facing){this.ammo--;if(this.ammo<=0)this.weapon=null;return 'blocked';}
    const finalAmt=headshot?amt*2:amt;
    this.hp=Math.max(0,this.hp-finalAmt);
    this.dmg=Math.round(100-this.hp);
    this.vx+=kbx;this.vy+=kby;this.hitT=18;this.iF=5;
    if(flaming)this.burning=120;
    if(Math.abs(kbx)>4||Math.abs(kby)>6)this.tumbleV=(kbx>0?1:-1)*(Math.random()*.23+.15);
    addDmgNum(this.x+(Math.random()*20-10),this.y-PH-5,Math.round(finalAmt),this.col,headshot);
    sound(headshot?'headshot':'hit');addShake(headshot?3:1.5,headshot?8:4);
    if(this.hp<=0)this._die();
    return true;
  }

  _die(){
    if(this.deathProcessed)return;this.deathProcessed=true;this.stocks--;
    this.alive=false;this.weapon=null;this.ammo=0;this.burning=0;
    this.tumbleV=(Math.random()-0.5)*1.2;this.tumble=Math.random()*Math.PI*2;
    addPts(this.x,this.y-25,this.col,20,9,5,.2);addBlood(this.x,this.y-30,this.col,8);
    addShake(3,10);sound('die');
  }

  _spawn(){
    this.x=SPAWNS[this.id].x;this.y=SPAWNS[this.id].y;
    this.vx=0;this.vy=0;this.hp=100;this.dmg=0;this.alive=true;this.iF=180;
    this.deathProcessed=false;this.tumble=0;this.tumbleV=0;this.landSquash=0;
  }

  draw(){
    if(!this.active)return;
    for(const b of this.bullets)b.draw();
    if(!this.alive)return;
    if(this.iF>0&&(this.iF>>2)%2===1)return;
    const cx=this.x,fy=this.y;

    ctx.save();ctx.globalAlpha=.1;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(cx,fy+2,13,4,0,0,Math.PI*2);ctx.fill();ctx.restore();

    const flash=this.hitT>0,c=flash?'#ffffff':this.col;
    const sq=1-this.landSquash*.28,sx=this.landSquash>0?1+(1-sq)*.5:1;

    ctx.save();
    ctx.translate(cx,fy-PH*.5);ctx.rotate(this.tumble);ctx.translate(-cx,-(fy-PH*.5));
    ctx.translate(cx,fy);ctx.scale(sx,sq);ctx.translate(-cx,-fy);
    ctx.strokeStyle=c;ctx.lineWidth=3;ctx.lineCap='round';ctx.lineJoin='round';
    if(flash||this.burning>0){ctx.shadowColor=this.burning>0?'#ff5500':this.col;ctx.shadowBlur=18;}else{ctx.shadowBlur=0;}

    const hipY=fy-22,shlY=fy-46,headY=fy-61,HR=9;
    const mov=Math.abs(this.vx)>.6;
    const wc=Math.sin(this.anim*.22)*(mov?.6:.09);
    const as=Math.sin(this.anim*.22+Math.PI)*(mov?.42:0);
    const isAtk=this.atkT>14;

    ctx.beginPath();ctx.moveTo(cx,hipY);ctx.lineTo(cx+Math.sin(wc)*18,fy);ctx.stroke();
    ctx.beginPath();ctx.moveTo(cx,hipY);ctx.lineTo(cx-Math.sin(wc)*18,fy);ctx.stroke();
    ctx.beginPath();ctx.moveTo(cx,hipY);ctx.lineTo(cx,shlY);ctx.stroke();

    if(this.shielding){
      ctx.beginPath();ctx.moveTo(cx,shlY);ctx.lineTo(cx+this.facing*24,shlY+2);ctx.stroke();
      ctx.beginPath();ctx.moveTo(cx,shlY);ctx.lineTo(cx+this.facing*16,shlY+12);ctx.stroke();
      ctx.save();ctx.translate(cx+this.facing*34,shlY-2);ctx.strokeStyle='#44aaff';ctx.lineWidth=4;ctx.shadowColor='#44aaff';ctx.shadowBlur=26;ctx.beginPath();ctx.moveTo(-8,16);ctx.lineTo(-12,-12);ctx.lineTo(0,-18);ctx.lineTo(12,-12);ctx.lineTo(8,16);ctx.closePath();ctx.stroke();ctx.restore();
    }else if(this.weapon==='FLAME_FISTS'&&isAtk){
      ctx.beginPath();ctx.moveTo(cx,shlY);ctx.lineTo(cx+this.facing*34,shlY);ctx.stroke();
      ctx.beginPath();ctx.moveTo(cx,shlY);ctx.lineTo(cx-this.facing*8,shlY+12);ctx.stroke();
      addFire(cx+this.facing*34,shlY,3);
    }else if(this.weapon==='SWORD'&&isAtk){
      ctx.beginPath();ctx.moveTo(cx,shlY);ctx.lineTo(cx+this.facing*28,shlY-6);ctx.stroke();
      ctx.save();ctx.strokeStyle='#88aaff';ctx.lineWidth=4;ctx.shadowColor='#99bbff';ctx.shadowBlur=16;ctx.beginPath();ctx.moveTo(cx+this.facing*22,shlY+8);ctx.lineTo(cx+this.facing*50,shlY-24);ctx.stroke();ctx.restore();
    }else if(isAtk&&!this.weapon){
      ctx.beginPath();ctx.moveTo(cx,shlY);ctx.lineTo(cx+this.facing*32,shlY+2);ctx.stroke();
      ctx.beginPath();ctx.moveTo(cx,shlY);ctx.lineTo(cx-this.facing*8,shlY+12);ctx.stroke();
    }else if(this.weapon){
      ctx.beginPath();ctx.moveTo(cx,shlY);ctx.lineTo(cx+this.facing*21,shlY-2);ctx.stroke();
      ctx.beginPath();ctx.moveTo(cx,shlY);ctx.lineTo(cx+this.facing*13,shlY+8);ctx.stroke();
      this._drawHandWpn(cx,shlY,c);
    }else{
      ctx.beginPath();ctx.moveTo(cx,shlY);ctx.lineTo(cx+Math.sin(as)*14,shlY+12);ctx.stroke();
      ctx.beginPath();ctx.moveTo(cx,shlY);ctx.lineTo(cx-Math.sin(as)*14,shlY+12);ctx.stroke();
    }
    ctx.beginPath();ctx.arc(cx,headY,HR,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle=c;ctx.beginPath();ctx.arc(cx+this.facing*4.5,headY,2.5,0,Math.PI*2);ctx.fill();
    if(this.hitT>12){ctx.strokeStyle=this.col;ctx.lineWidth=2;ctx.shadowBlur=0;const ex=cx+this.facing*4;ctx.beginPath();ctx.moveTo(ex-3,headY-3);ctx.lineTo(ex+3,headY+3);ctx.moveTo(ex+3,headY-3);ctx.lineTo(ex-3,headY+3);ctx.stroke();}
    if(this.wallT>5){ctx.fillStyle=this.col;ctx.globalAlpha=.4;ctx.fillRect(cx+this.wallDir*14,shlY,4,24);}
    ctx.restore();

    this._drawHPBar(cx,fy-PH-38);
    if(this.burning>0){ctx.save();ctx.globalAlpha=.5+Math.sin(Date.now()*.022)*.3;ctx.font='bold 11px Courier New';ctx.textAlign='center';ctx.fillStyle='#ff5500';ctx.shadowColor='#ff3300';ctx.shadowBlur=10;ctx.fillText('🔥',cx,fy-PH-60);ctx.restore();}
  }

  _drawHandWpn(cx,shlY,c){
    if(!this.weapon||!WPN[this.weapon])return;
    ctx.save();ctx.translate(cx+this.facing*21,shlY-1);ctx.scale(this.facing,1);
    const t=this.weapon;
    if(t==='PISTOL'){ctx.fillStyle=c;ctx.fillRect(0,-3,15,5);ctx.fillRect(11,-8,4,5);}
    else if(t==='SHOTGUN'){ctx.fillStyle=c;ctx.fillRect(-2,-3,22,7);ctx.fillRect(14,-9,4,6);}
    else if(t==='ROCKET'){ctx.fillStyle=c;ctx.fillRect(-2,-4,24,8);ctx.fillStyle='#ff4400';ctx.beginPath();ctx.moveTo(22,-4);ctx.lineTo(28,0);ctx.lineTo(22,4);ctx.fill();}
    else if(t==='BOUNCER'){ctx.fillStyle=c;ctx.fillRect(-4,-3,18,6);ctx.fillStyle='#dd44ff';ctx.beginPath();ctx.arc(14,0,4,0,Math.PI*2);ctx.fill();}
    else if(t==='SNIPER'){ctx.fillStyle=c;ctx.fillRect(-4,-3,32,5);ctx.fillRect(-2,-8,4,5);}
    else if(t==='MINIGUN'){ctx.fillStyle=c;ctx.fillRect(-4,-3,28,6);ctx.fillRect(14,-8,4,5);ctx.fillStyle='#333';ctx.fillRect(-4,-1,28,2);}
    else if(t==='GRENADE'){ctx.fillStyle=WPN[t].col;ctx.beginPath();ctx.arc(0,0,5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#888';ctx.fillRect(-1,-6,2,4);}
    else if(t==='SWORD'){ctx.strokeStyle='#88aaff';ctx.lineWidth=3;ctx.shadowColor='#88aaff';ctx.shadowBlur=8;ctx.beginPath();ctx.moveTo(0,8);ctx.lineTo(0,-26);ctx.stroke();ctx.beginPath();ctx.moveTo(-8,-2);ctx.lineTo(8,-2);ctx.stroke();}
    else if(t==='FLAME_FISTS'){ctx.fillStyle='#ff5500';for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(i*6,0,5-i,0,Math.PI*2);ctx.fill();}}
    else if(t==='BLINK_DAGGER'){ctx.strokeStyle=WPN[t].col;ctx.lineWidth=2.5;ctx.shadowBlur=12;ctx.beginPath();ctx.moveTo(-10,6);ctx.lineTo(10,-6);ctx.stroke();ctx.beginPath();ctx.moveTo(10,-6);ctx.lineTo(6,-12);ctx.lineTo(10,-6);ctx.lineTo(14,0);ctx.stroke();}
    else if(t==='THRUSTER'){ctx.fillStyle=WPN[t].col;ctx.beginPath();ctx.arc(0,0,4,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#222';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-2,-2);ctx.lineTo(2,2);ctx.moveTo(2,-2);ctx.lineTo(-2,2);ctx.stroke();}
    else if(t==='SHIELD'){ctx.strokeStyle='#44aaff';ctx.lineWidth=2.5;ctx.shadowColor='#44aaff';ctx.shadowBlur=8;ctx.beginPath();ctx.moveTo(-8,12);ctx.lineTo(-10,-8);ctx.lineTo(0,-14);ctx.lineTo(10,-8);ctx.lineTo(8,12);ctx.closePath();ctx.stroke();}
    ctx.restore();
  }

  _drawHPBar(x,y){
    const pct=clamp(this.hp/100,0,1),bw=52,bh=8;
    ctx.save();
    ctx.fillStyle='rgba(0,0,0,.75)';ctx.fillRect(x-bw/2-3,y-3,bw+6,bh+6);
    ctx.strokeStyle=this.col;ctx.lineWidth=1.5;ctx.strokeRect(x-bw/2-1,y-1,bw+2,bh+2);
    ctx.fillStyle='#2a3f52';ctx.fillRect(x-bw/2,y,bw,bh);
    const hue=Math.round(pct*120),barCol=`hsl(${hue},88%,52%)`;
    if(pct>0){ctx.fillStyle=barCol;ctx.fillRect(x-bw/2,y,bw*pct,bh);ctx.fillStyle=`hsla(${hue},88%,80%,.3)`;ctx.fillRect(x-bw/2,y,bw*pct,3);if(pct>.55){ctx.shadowColor=barCol;ctx.shadowBlur=10;}}
    ctx.shadowBlur=0;ctx.font='bold 9px Courier New';ctx.textAlign='center';ctx.fillStyle='#ffffff';ctx.globalAlpha=.9;ctx.fillText(Math.ceil(this.hp)+' HP',x,y-3);
    ctx.restore();
  }
}
