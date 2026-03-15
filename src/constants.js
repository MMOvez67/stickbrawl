'use strict';
// ── PHYSICS ────────────────────────────────────────────────────────────────
const GRAV=.62, JUMP_V=-14.2, TERM_V=20;
const ACCEL=1.5, MAX_VX=7, FRIC=.80, FRIC_AIR=.96;

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
