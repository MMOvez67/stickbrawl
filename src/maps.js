'use strict';
// ── MAP DEFINITIONS ────────────────────────────────────────────────────────
// Each map: {name, bg1, bg2, style, plats[], wspawns[], sawblades[], neons?[]}
// plat:     {x,y,w,h,solid:bool, neon?:'#hex'}
// wspawn:   {x,y}
// sawblade: {x,y,r,speed}
// neon:     {x,y,text,col,w}

const MAPS=[
  {name:'ROOFTOPS',bg1:'#070d18',bg2:'#0b1525',style:'city',
   plats:[
    {x:0,y:562,w:1200,h:40,solid:true},
    {x:20,y:462,w:155,h:12,solid:false},{x:1025,y:462,w:155,h:12,solid:false},
    {x:430,y:462,w:340,h:12,solid:false},
    {x:155,y:322,w:205,h:12,solid:false},{x:840,y:322,w:205,h:12,solid:false},
    {x:488,y:272,w:224,h:12,solid:false},{x:518,y:158,w:164,h:12,solid:false},
   ],wspawns:[{x:600,y:444},{x:98,y:444},{x:1102,y:444},{x:258,y:304},{x:942,y:304},{x:600,y:254}],
   sawblades:[]},

  {name:'CASTLE',bg1:'#0d0c14',bg2:'#14111f',style:'castle',
   plats:[
    {x:0,y:562,w:1200,h:40,solid:true},
    {x:0,y:300,w:60,h:262,solid:true},{x:1140,y:300,w:60,h:262,solid:true},
    {x:80,y:452,w:130,h:12,solid:false},{x:990,y:452,w:130,h:12,solid:false},
    {x:80,y:340,w:100,h:12,solid:false},{x:1020,y:340,w:100,h:12,solid:false},
    {x:300,y:390,w:200,h:12,solid:false},{x:700,y:390,w:200,h:12,solid:false},
    {x:460,y:290,w:280,h:12,solid:false},{x:530,y:180,w:140,h:12,solid:false},
   ],wspawns:[{x:600,y:270},{x:140,y:322},{x:1060,y:322},{x:400,y:372},{x:800,y:372},{x:600,y:172}],
   sawblades:[{x:540,y:550,r:22,speed:.04}]},

  {name:'ABYSS',bg1:'#0d0a0e',bg2:'#13101a',style:'abyss',
   plats:[
    {x:400,y:540,w:400,h:20,solid:true},
    {x:80,y:460,w:200,h:12,solid:false},
    {x:920,y:460,w:200,h:12,solid:false},
    {x:250,y:370,w:180,h:12,solid:false},
    {x:770,y:370,w:180,h:12,solid:false},
    {x:510,y:340,w:180,h:12,solid:false},
    {x:100,y:260,w:150,h:12,solid:false},
    {x:950,y:260,w:150,h:12,solid:false},
    {x:480,y:220,w:240,h:12,solid:false},
    {x:520,y:130,w:160,h:12,solid:false},
   ],wspawns:[{x:600,y:515},{x:180,y:440},{x:1020,y:440},{x:340,y:350},{x:860,y:350},{x:600,y:320}],
   sawblades:[]},

  {name:'NEON CITY',bg1:'#040608',bg2:'#070a10',style:'neon',
   plats:[
    {x:0,y:562,w:1200,h:40,solid:true},
    {x:30,y:460,w:155,h:12,solid:false,neon:'#ff0066'},
    {x:1015,y:460,w:155,h:12,solid:false,neon:'#ff0066'},
    {x:420,y:460,w:360,h:12,solid:false,neon:'#00ffcc'},
    {x:130,y:318,w:210,h:12,solid:false,neon:'#ff9900'},
    {x:860,y:318,w:210,h:12,solid:false,neon:'#ff9900'},
    {x:455,y:262,w:290,h:12,solid:false,neon:'#aa44ff'},
    {x:505,y:148,w:190,h:12,solid:false,neon:'#00ccff'},
   ],wspawns:[{x:600,y:444},{x:107,y:442},{x:1093,y:442},{x:235,y:300},{x:965,y:300},{x:600,y:244}],
   sawblades:[],
   neons:[
    {x:180,y:470,text:'OPEN', col:'#ff0066',w:60},{x:960,y:470,text:'BAR',  col:'#ff0066',w:50},
    {x:70, y:350,text:'24H',  col:'#ff9900',w:50},{x:1080,y:350,text:'GUN', col:'#ff9900',w:50},
    {x:490,y:150,text:'FIGHT',col:'#00ccff',w:70},{x:550,y:295,text:'NOW',  col:'#aa44ff',w:50},
   ]},
];

let map=MAPS[0];
let sawAngles=[];

// ── MAP RENDERER ───────────────────────────────────────────────────────────
// Reads: ctx, W, H, map, sawAngles, frame (all global)
const drawMap=()=>{
  const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,map.bg1);sky.addColorStop(1,map.bg2);ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);

  if(map.style==='city'){
    ctx.fillStyle='rgba(160,205,255,.14)';for(let i=0;i<60;i++){ctx.beginPath();ctx.arc((i*173+11)%W,(i*97+7)%290,1,0,Math.PI*2);ctx.fill();}
    ctx.fillStyle='rgba(210,230,255,.28)';for(let i=0;i<14;i++){ctx.beginPath();ctx.arc((i*311+41)%W,15+(i*67+3)%210,1.4,0,Math.PI*2);ctx.fill();}
    const bldgs=[[0,400,70,162],[72,425,80,137],[155,410,60,152],[220,450,55,112],[280,460,45,102],[800,467,40,95],[845,460,45,102],[895,455,60,107],[958,415,68,147],[1030,432,78,130],[1112,405,88,157]];
    for(const[x,y,w,h]of bldgs){ctx.fillStyle='#0c1828';ctx.fillRect(x,y,w,h);for(let wy=y+10;wy<y+h-8;wy+=17){for(let wx=x+6;wx<x+w-6;wx+=11){const lit=(wx*29+wy*13)%100;if(lit>45){ctx.fillStyle=lit>72?'rgba(255,215,100,.18)':'rgba(130,180,255,.1)';ctx.fillRect(wx,wy,5,8);ctx.fillStyle='#0c1828';}}}}
  }else if(map.style==='castle'){
    ctx.fillStyle='#0a0c12';ctx.fillRect(300,140,600,422);ctx.fillStyle='#0c0e15';for(let cx=300;cx<900;cx+=36)ctx.fillRect(cx,140,18,30);ctx.fillStyle='#0a0c12';ctx.fillRect(320,160,560,40);
  }else if(map.style==='abyss'){
    ctx.fillStyle='rgba(80,0,140,.05)';ctx.fillRect(0,0,W,H);
    const vg=ctx.createLinearGradient(0,H-80,0,H);vg.addColorStop(0,'transparent');vg.addColorStop(1,'rgba(120,0,200,.18)');ctx.fillStyle=vg;ctx.fillRect(0,H-80,W,80);
  }else if(map.style==='neon'){
    ctx.save();ctx.globalAlpha=.04;ctx.strokeStyle='#88aaff';ctx.lineWidth=1;
    for(let i=0;i<40;i++){const rx=(i*137+frame*.8)%W,ry=(i*89+frame*1.4)%H;ctx.beginPath();ctx.moveTo(rx,ry);ctx.lineTo(rx-2,ry+14);ctx.stroke();}
    ctx.restore();
    const nb=[[0,380,60,220],[62,410,70,190],[135,395,55,205],[195,430,50,170],[250,450,40,150],[860,450,40,150],[905,435,50,165],[958,415,55,185],[1015,420,65,180],[1083,400,55,200],[1140,390,60,210]];
    for(const[x,y,w,h]of nb){ctx.fillStyle='#060810';ctx.fillRect(x,y,w,h);for(let wy=y+12;wy<y+h-8;wy+=18){for(let wx=x+6;wx<x+w-6;wx+=12){const lit=(wx*31+wy*17+frame)%100;if(lit>50){const r=((wx+wy)*7)%100;ctx.fillStyle=r>60?`rgba(255,0,100,${.06+.03*Math.sin(frame*.05+wx)})`:r>30?`rgba(0,255,200,${.05+.02*Math.sin(frame*.04+wy)})`:r>10?`rgba(0,180,255,.07)`:r>0?`rgba(255,150,0,.05)`:'rgba(150,150,255,.04)';ctx.fillRect(wx,wy,5,9);}}}}
    if(map.neons)map.neons.forEach(n=>{const fl=Math.sin(frame*.12+n.x*.04)*Math.sin(frame*.07+n.y*.03);ctx.save();ctx.globalAlpha=.55+fl*.18;ctx.strokeStyle=n.col;ctx.lineWidth=2;ctx.shadowColor=n.col;ctx.shadowBlur=14+fl*6;ctx.strokeRect(n.x-n.w/2-2,n.y-14,n.w+4,22);ctx.font='bold 11px Courier New';ctx.fillStyle=n.col;ctx.textAlign='center';ctx.fillText(n.text,n.x,n.y+2);ctx.restore();});
  }

  // Platforms
  for(const p of map.plats){
    if(p.solid){
      ctx.fillStyle='#101e2e';ctx.fillRect(p.x,p.y,p.w,p.h);
      ctx.fillStyle='#1c3048';ctx.fillRect(p.x,p.y,p.w,3);
      ctx.strokeStyle='#0e1c2c';ctx.lineWidth=1;for(let x=50;x<p.w;x+=50){ctx.beginPath();ctx.moveTo(p.x+x,p.y);ctx.lineTo(p.x+x,p.y+p.h);ctx.stroke();}
    }else{
      ctx.save();ctx.globalAlpha=.2;ctx.fillStyle='#000';ctx.fillRect(p.x+4,p.y+5,p.w,p.h);ctx.restore();
      ctx.fillStyle='#14243a';ctx.fillRect(p.x,p.y,p.w,p.h);
      ctx.fillStyle='#1c324e';ctx.fillRect(p.x,p.y+2,p.w,p.h-3);
      if(p.neon){
        ctx.save();ctx.shadowColor=p.neon;ctx.shadowBlur=10+Math.sin(frame*.06+p.x*.01)*4;ctx.fillStyle=p.neon;ctx.globalAlpha=.8+Math.sin(frame*.05+p.x*.01)*.15;ctx.fillRect(p.x+1,p.y,p.w-2,2);ctx.globalAlpha=.25;ctx.fillRect(p.x,p.y-6,p.w,6);ctx.restore();
      }else{
        ctx.fillStyle='#5090c0';ctx.fillRect(p.x+1,p.y,p.w-2,2);
        ctx.fillStyle='#70b8ee';ctx.fillRect(p.x,p.y,3,3);ctx.fillRect(p.x+p.w-3,p.y,3,3);
      }
      ctx.fillStyle='#0a1420';ctx.fillRect(p.x,p.y+p.h-2,p.w,2);
    }
  }

  // Sawblades
  for(let i=0;i<map.sawblades.length;i++){
    const sb=map.sawblades[i];sawAngles[i]=(sawAngles[i]||0)+sb.speed;
    ctx.save();ctx.translate(sb.x,sb.y);ctx.rotate(sawAngles[i]);
    ctx.strokeStyle='#cc3333';ctx.lineWidth=2;ctx.shadowColor='#ff2222';ctx.shadowBlur=14;
    ctx.beginPath();ctx.arc(0,0,sb.r,0,Math.PI*2);ctx.stroke();
    for(let t=0;t<8;t++){const a=t/8*Math.PI*2;ctx.beginPath();ctx.moveTo(Math.cos(a)*sb.r,Math.sin(a)*sb.r);ctx.lineTo(Math.cos(a)*(sb.r+8),Math.sin(a)*(sb.r+8));ctx.stroke();}
    ctx.restore();
  }

  // Edge danger
  ctx.save();ctx.globalAlpha=.04;ctx.fillStyle='#e63946';ctx.fillRect(0,0,40,H);ctx.fillRect(W-40,0,40,H);ctx.fillRect(0,H-12,W,12);ctx.restore();
};
