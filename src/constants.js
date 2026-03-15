'use strict';
// ── PHYSICS ────────────────────────────────────────────────────────────────
const GRAV=.62, JUMP_V=-14.2, TERM_V=20;
const BASE_ACCEL=1.5, BASE_MAX_VX=7, FRIC=.80, FRIC_AIR=.96;
const WEIGHT_SLOWDOWN=0.42, HEAVY_PENALTY=0.55;

// ── PLAYER HITBOX ──────────────────────────────────────────────────────────
const PW=12;   // half-width
const PH=55;   // height (feet to top of body, not head)

// ── PLAYER IDENTITY ────────────────────────────────────────────────────────
const COLS  = ['#e63946','#457b9d','#2d9f2d','#d4850a'];
const NAMES = ['P1','P2','P3','P4'];
const SPAWNS= [{x:200,y:548},{x:1000,y:548},{x:420,y:548},{x:780,y:548}];

// ── CANVAS ─────────────────────────────────────────────────────────────────
const W=1200, H=600;

// ── ROUND SYSTEM ───────────────────────────────────────────────────────────
const FT=3; // first-to rounds to win match

// ── SHARED HELPERS — alle Module nutzen diese ──────────────────────────────
const pInBox  = (px,py,b) => px>b.x && px<b.x+b.w && py>b.y && py<b.y+b.h;
const boxOlp  = (a,b) => a.x<b.x+b.w && a.x+a.w>b.x && a.y<b.y+b.h && a.y+a.h>b.y;
const lerp    = (a,b,t) => a+(b-a)*t;
const clamp   = (v,lo,hi) => Math.max(lo,Math.min(hi,v));
const rnd     = (lo,hi) => lo+Math.random()*(hi-lo);
const dist    = (ax,ay,bx,by) => Math.sqrt((ax-bx)**2+(ay-by)**2);
