'use strict';
let peer=null,conn=null,isHost=false,networkMode=false;
const ROOM_CHARS='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const genCode=()=>Array.from({length:4},()=>ROOM_CHARS[Math.random()*ROOM_CHARS.length|0]).join('');
let remoteInput={L:false,R:false,U:false,A:false,P:false};

window.hostGame=playerCount=>{
  const code=genCode();
  peer=new Peer(code,{debug:0});
  peer.on('open',id=>{
    document.getElementById('room-code-display').textContent=id;
    document.getElementById('room-code-display').style.display='inline';
  });
  peer.on('connection',c=>{
    conn=c;isHost=true;networkMode=true;
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
  if(!code||code.length!==4)return;
  peer=new Peer(undefined,{debug:0});
  peer.on('open',()=>{
    conn=peer.connect(code);
    conn.on('open',()=>{networkMode=true;isHost=false;});
    conn.on('data',d=>{
      if(d.type==='init'){startGame(d.playerCount,d.mapIdx);}
      else if(d.type==='input'){remoteInput=d;}
    });
  });
};

window.sendNetworkInput=input=>{if(conn&&conn.open)conn.send({type:'input',...input});};
window.getRemoteInput=()=>remoteInput;
window.isNetworkHost=()=>isHost;
window.isNetworkMode=()=>networkMode;
