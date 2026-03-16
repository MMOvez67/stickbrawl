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

// ── MOUSE TRACKING FOR P1 AIMING ────────────────────────────────────────────
let mouseX=W/2,mouseY=H/2;
window.addEventListener('mousemove',e=>{
  const rect=canvas.getBoundingClientRect();
  mouseX=(e.clientX-rect.left)*(canvas.width/rect.width);
  mouseY=(e.clientY-rect.top)*(canvas.height/rect.height);
});

// Keyboard bindings per player index (null = gamepad)
const KB=[
  {L:'a',         R:'d',          U:'w',       ATK:'f',    PK:'g'},
  {L:'ArrowLeft', R:'ArrowRight', U:'ArrowUp', ATK:'Enter',PK:'Shift'},
  {L:'j',         R:'l',          U:'i',       ATK:'h',    PK:'y'},
  null,
];
