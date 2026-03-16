'use strict';
// ── COMBAT ─────────────────────────────────────────────────────────────────
// Reads global: players[], explosions[], blinkStrikes[], thrownWpns[]

const doCombat=()=>{
  const alive=players.filter(p=>p.active&&p.alive);

  // Explosion — 1× per player via Set
  for(const ex of explosions){
    if(!ex.peaked)continue;
    for(const def of alive){
      if(ex.hitPlayers.has(def.id))continue;
      const dx=def.x-ex.x,dy=(def.y-PH/2)-ex.y,d=Math.sqrt(dx*dx+dy*dy);
      if(d<ex.maxR*.78){ex.hitPlayers.add(def.id);const n=Math.max(d,1);def.takeDmg(30,(dx/n)*9.5,(dy/n)*7-2);}
    }
  }

  for(const atk of alive){
    // Melee
    const pb=atk.punchBox();
    if(pb){
      const isFire=atk.weapon==='FLAME_FISTS',isSwd=atk.weapon==='SWORD';
      for(const def of alive){
        if(def.id===atk.id||!boxOlp(pb,def.box()))continue;
        if(def.shielding&&def.weapon==='SHIELD'&&atk.facing!==def.facing){def.ammo--;if(def.ammo<=0)def.weapon=null;addPts(def.x,def.y-25,'#44aaff',5,3,2,.08);continue;}
        const kbx=isSwd?atk.facing*6.0:isFire?atk.facing*4.0:atk.facing*4.5;
        const kby=isSwd?-7.0:isFire?-5.0:-5.5;
        def.takeDmg(isSwd?16:isFire?13:10, kbx, kby, isFire);
      }
    }

    // Bullets — with headshot detection
    for(const bul of atk.bullets){
      if(!bul.active||bul.reflected)continue;
      for(const def of alive){
        if(def.id===atk.id)continue;
        // Directional shield
        if(def.shielding&&def.weapon==='SHIELD'&&Math.sign(bul.vx)!==def.facing){
          bul.vx*=-1;bul.x+=bul.vx*10;bul.reflected=true;bul.reflectImmunity=def.id;
          def.ammo--;if(def.ammo<=0)def.weapon=null;
          addPts(bul.x,bul.y,'#44aaff',6,4,2,.08);continue;
        }
        const isHead=pInBox(bul.x,bul.y,def.headBox());
        if(bul.type==='sniper'){
          if(bul.pierced.has(def.id))continue;
          if(!pInBox(bul.x,bul.y,def.box())&&!isHead)continue;
          bul.pierced.add(def.id);
          def.takeDmg(40,bul.vx>0?10:-10,-4,false,isHead);
          addPts(bul.x,bul.y,def.col,10,6,4,.15);addShake(5,10);continue;
        }
        if(!pInBox(bul.x,bul.y,def.box())&&!isHead)continue;
        const dmgMap={normal:16,pellet:11,rocket:32,bouncer:18,minigun:8};
        const kbxMap={normal:5.5,pellet:3.5,rocket:9.0,bouncer:6.0,minigun:2.5,flame:5.5};
        const kbx=bul.vx>0?kbxMap[bul.type]||5.5:-(kbxMap[bul.type]||5.5);
        const kbyMap={normal:-3.5,pellet:-2.5,rocket:-8.0,bouncer:-4.0,minigun:-1.5,flame:-3.5};
        const kby=kbyMap[bul.type]||-3.5;
        if(def.takeDmg(dmgMap[bul.type]||12,kbx,kby,bul.type==='flame',isHead)){
          if(bul.type!=='rocket')addPts(bul.x,bul.y,def.col,8);
          bul.active=false;
        }
      }
    }
  }

  // Reflected bullets
  for(const bul of players.flatMap(p=>p.bullets)){
    if(!bul.active||!bul.reflected)continue;
    for(const def of alive){
      if(def.id===bul.reflectImmunity)continue;
      if(!pInBox(bul.x,bul.y,def.box()))continue;
      def.takeDmg(20,bul.vx>0?8:-8,-5);addPts(bul.x,bul.y,def.col,7);bul.active=false;
    }
  }

  // Thrown weapons
  for(const tw of thrownWpns){
    if(!tw.active)continue;
    for(const def of alive){
      if(def.id===tw.owner||!boxOlp(tw.box(),def.box()))continue;
      def.takeDmg(18,tw.vx*.4,tw.vy*.3);addPts(tw.x,tw.y,WPN[tw.type].col,6,5,3,.15);tw.active=false;break;
    }
  }

  // Blink dagger
  for(const bs of blinkStrikes){
    if(!bs.active)continue;const tip=bs.tip();
    for(const def of alive){
      if(def.id===bs.owner||!pInBox(tip.x,tip.y,def.box()))continue;
      def.takeDmg(55,bs.facing*14,-8);addPts(tip.x,tip.y,'#ff44ff',12,7,4,.1);addShake(6,10);bs.active=false;break;
    }
  }
};
