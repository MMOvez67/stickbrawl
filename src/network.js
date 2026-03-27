'use strict';
let peer=null,conn=null,isHost=false,networkMode=false;
const ROOM_CHARS='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const genCode=()=>Array.from({length:4},()=>ROOM_CHARS[Math.random()*ROOM_CHARS.length|0]).join('');
let remoteInput={L:false,R:false,U:false,A:false,P:false};

const _setStatus=t=>{const el=document.getElementById('net-status');if(el){el.textContent=t;el.style.display=t?'block':'none';}};

window.hostGame=playerCount=>{
  const code=genCode();
  _setStatus('VERBINDE MIT SERVER...');
  peer=new Peer(code,{debug:0});
  peer.on('open',id=>{
    document.getElementById('room-code-display').textContent=id;
    document.getElementById('room-code-display').style.display='inline';
    _setStatus('WARTE AUF SPIELER...');
  });
  peer.on('error',e=>_setStatus('FEHLER: '+e.type.toUpperCase()));
  peer.on('connection',c=>{
    conn=c;isHost=true;networkMode=true;
    _setStatus('SPIELER VERBUNDEN — STARTE...');
    conn.on('open',()=>{
      const mi=typeof _selMap!=='undefined'&&_selMap!==4?(0|_selMap):(0|Math.random()*MAPS.length);
      conn.send({type:'init',mapIdx:mi,playerCount});
      startGame(playerCount,mi);
    });
    conn.on('data',d=>{if(d.type==='input')remoteInput=d;});
  });
};

window.joinGame=()=>{
  const code=document.getElementById('join-code-input').value.toUpperCase().trim();
  if(!code||code.length!==4){_setStatus('CODE MUSS 4 ZEICHEN HABEN');return;}
  _setStatus('VERBINDE MIT '+code+'...');
  peer=new Peer(undefined,{debug:0});
  peer.on('open',()=>{
    _setStatus('SUCHE HOST...');
    conn=peer.connect(code);
    conn.on('open',()=>{networkMode=true;isHost=false;_setStatus('VERBUNDEN — WARTE AUF START...');});
    conn.on('data',d=>{
      if(d.type==='init'){startGame(d.playerCount,d.mapIdx);}
      else if(d.type==='input'){remoteInput=d;}
    });
    conn.on('error',e=>_setStatus('VERBINDUNG FEHLGESCHLAGEN'));
  });
  peer.on('error',e=>_setStatus('FEHLER: KEIN HOST UNTER '+code));
};

window.sendNetworkInput=input=>{if(conn&&conn.open)conn.send({type:'input',...input});};
window.getRemoteInput=()=>remoteInput;
window.isNetworkHost=()=>isHost;
window.isNetworkMode=()=>networkMode;
