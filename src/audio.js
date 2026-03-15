'use strict';
// ── WEB AUDIO API — no file assets needed ──────────────────────────────────
let AC=null;
const initAudio=()=>{if(!AC)AC=new(window.AudioContext||window.webkitAudioContext)();};

const sound=(type,vol=1)=>{
  if(!AC)return;try{
  const t=AC.currentTime;
  const tone=(freq,endF,dur,wave='sawtooth',gain=.18)=>{const o=AC.createOscillator(),g=AC.createGain();o.connect(g);g.connect(AC.destination);o.type=wave;o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(endF,t+dur);g.gain.setValueAtTime(gain*vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur+.02);o.start(t);o.stop(t+dur+.05);};
  const noise=(dur,lp,gain=.35)=>{const buf=AC.createBuffer(1,AC.sampleRate*dur,AC.sampleRate);const d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length);const s=AC.createBufferSource(),g=AC.createGain(),f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=lp;s.buffer=buf;s.connect(f);f.connect(g);g.connect(AC.destination);g.gain.setValueAtTime(gain*vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.start(t);};
  if(type==='shoot')    tone(280,55,.1,'sawtooth',.16);
  else if(type==='shotgun')  noise(.15,1800,.38);
  else if(type==='rocket')   tone(90,22,.42,'sine',.38);
  else if(type==='hit')      tone(160,58,.09,'triangle',.22);
  else if(type==='die')      tone(440,55,.5,'sawtooth',.2);
  else if(type==='pickup')   tone(660,990,.12,'sine',.1);
  else if(type==='sniper')   tone(800,180,.06,'sawtooth',.28);
  else if(type==='headshot'){tone(1200,400,.08,'square',.15);tone(600,200,.15,'sawtooth',.12);}
  }catch(e){}
};
