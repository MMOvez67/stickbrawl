# StickBrawl — Claude Code Guide

## TL;DR für schnelle Edits
- Neue Waffe → `src/weapons.js` (WPN registry) + `src/projectiles.js` (Bullet subtype) + `src/player.js` (`_doAttack`)
- Neue Map → nur `src/maps.js` (MAPS array)
- Physics tweaken → nur `src/constants.js` oder `src/player.js` (tick())
- Balance (damage/ammo) → nur `src/constants.js` oder `src/weapons.js`
- Visuelles (partikel/effects) → nur `src/particles.js`
- UI/HUD → nur `src/game.js` (drawHUD)
- Sound → nur `src/audio.js`

## Projekt-Übersicht
4-Spieler local-multiplayer Browser-Brawler. Stickfight-Klon mit eigenem Spin.
Keine Dependencies, kein Build-Step — reines Vanilla JS, alles läuft im Browser per Doppelklick.

## Datei-Struktur
```
stickbrawl/
├── index.html          ← Lädt alle src/ files per <script>, Canvas + HUD HTML
├── CLAUDE.md           ← Du bist hier
├── src/
│   ├── constants.js    ← Alle Magic Numbers (GRAV, JUMP_V, PW, PH, COLS, SPAWNS, FRIC...)
│   ├── audio.js        ← Web Audio API synth, sound() function, initAudio()
│   ├── maps.js         ← MAPS[] array + drawMap() + sawAngles state
│   ├── particles.js    ← pts[], dusts[], shells[], muzzles[], dNums[], kFeed[]
│   │                      addPts, addFire, addBlood, addImpactSparks
│   │                      addDustCloud, addMuzzle, addShell, addDmgNum, addKill
│   │                      tickPts/Dusts/Shells/Muzzles/Dnums + all draw functions
│   ├── weapons.js      ← WPN registry object + WPN_KEYS + WpnItem class
│   ├── projectiles.js  ← Bullet, Grenade, BlinkStrike, StickyBomb, Explosion, ThrownWpn
│   ├── player.js       ← Player class (constructor, tick, draw, combat helpers)
│   ├── combat.js       ← doCombat() function (reads global players[], explosions[] etc.)
│   └── game.js         ← Game state, round system, startGame, startRound,
│                          checkWin, drawHUD, drawRoundOverlay, drawGO, main loop
├── README.md
└── .gitignore
```

## Globale Variablen (definiert in game.js, gelesen von allen)
- `canvas`, `ctx`, `W`, `H` — Canvas setup
- `players[]`, `wpns[]`, `wTimers[]` — Player + weapon state
- `thrownWpns[]`, `explosions[]`, `grenades[]`, `blinkStrikes[]`, `stickyBombs[]` — Projektile
- `map` — Aktuell aktive Map (Objekt aus MAPS[])
- `frame` — Frame counter (für Animationen)
- `gameState`, `roundState`, `roundNum`, `roundWins[]` — Spielzustand

## Coding-Konventionen
- Vanilla JS, kein TypeScript, kein Build-Step
- `const`/`let` überall, kein `var`
- Kurze Funktionsnamen für Hot-Path Code (tickPts statt tickParticles)
- Canvas-State immer mit ctx.save()/ctx.restore() wrappen
- Alle Koordinaten: x=rechts+, y=unten+, (0,0) = oben links
- Spieler-Koordinaten: `p.y` = Fußpunkt, Kopf = `p.y - PH - 11`
- shadowBlur immer nach Benutzung auf 0 zurücksetzen (Performance)

## Git Workflow
```bash
# Nach jeder Änderung:
git add -A
git commit -m "kurze beschreibung was geändert wurde"
git push
# GitHub Pages updated sich automatisch in ~30sec
```

## Häufige Aufgaben

### Neue Waffe hinzufügen
1. `src/weapons.js` — Eintrag in WPN{} hinzufügen: `{name, col, ammo}`
2. `src/projectiles.js` — Falls neue Bullet-Art: neuer type in Bullet constructor + tick/draw
3. `src/player.js` — In `_doAttack()`: neuer `else if(this.weapon==='...')` Block
4. `src/weapons.js` — In `WpnItem.draw()`: visuelles Icon
5. `src/player.js` — In `_drawHandWpn()`: Waffe in der Hand

### Neue Map hinzufügen
`src/maps.js` — Neues Objekt in MAPS[] eintragen:
```js
{
  name:'MAP NAME',
  bg1:'#hex', bg2:'#hex',   // Himmel-Gradient
  style:'city|castle|abyss|neon|custom', // Für drawMap() switch
  plats:[...],              // {x,y,w,h,solid:bool, optional neon:'#hex'}
  wspawns:[...],            // {x,y} Waffen-Spawn-Punkte
  sawblades:[],             // [] oder [{x,y,r,speed}]
}
```
Dann in `drawMap()` einen neuen `else if(map.style==='custom')` Case hinzufügen.

### Physics anpassen
`src/constants.js`:
- `GRAV` — Schwerkraft (aktuell .62)
- `JUMP_V` — Sprungkraft (aktuell -14.2, negativer = höher)
- `MAX_VX` — Max horizontale Speed (7)
- `FRIC` — Boden-Reibung (.80), `FRIC_AIR` — Luft-Reibung (.96)

## Bekannte Bugs / TODO
Reihenfolge nach Priorität:
1. [ ] Online Multiplayer — WebSockets via Partykit
2. [ ] Moving Platforms — für neue Maps
3. [ ] Lava Rising — als Map Hazard
4. [ ] Waffen-Disarm — Waffe aus Hand schlagen möglich machen
5. [ ] Charakterauswahl mit Skins
6. [ ] Map Editor (Drag-and-Drop)
7. [ ] Electron Build → Steam

## Performance-Tipps
- `ctx.shadowBlur` ist die teuerste Canvas-Op — nur setzen wenn wirklich nötig
- HUD nur alle 3 Frames rebuilden (aktuell frame%3===0)
- Particles array per frame mit filter() cleanen (nicht splice in loop)
- Bei >200 aktiven particles beginnt spürbarer FPS-Einbruch
