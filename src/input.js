'use strict';
// ── INPUT ──────────────────────────────────────────────────────────────────
const keys={};
window.addEventListener('keydown',e=>{
  keys[e.key]=true;
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();
  initAudio();
});
window.addEventListener('keyup',e=>keys[e.key]=false);
const kH=k=>!!keys[k];

// Keyboard bindings per player index (null = gamepad)
const KB=[
  {L:'a',         R:'d',          U:'w',       ATK:'f',    PK:'g'},
  {L:'ArrowLeft', R:'ArrowRight', U:'ArrowUp', ATK:'Enter',PK:'Shift'},
  {L:'j',         R:'l',          U:'i',       ATK:'h',    PK:'y'},
  null,
];

// ── HELPERS ────────────────────────────────────────────────────────────────
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const boxOlp=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const dist=(ax,ay,bx,by)=>Math.sqrt((ax-bx)**2+(ay-by)**2);
