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
