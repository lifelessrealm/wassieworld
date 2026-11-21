import test,{before} from 'node:test';
import assert from 'node:assert/strict';
import {HeldMotion} from '../src/game/held-motion.ts';
import {characterParts} from '../src/assets/character.ts';
import {characterEnvelope,volumes} from '../src/assets/volumes.ts';
import {DamageState} from '../src/game/damage.ts';
import {Simulation,initPhysics,STEP,type GameEvent} from '../src/game/simulation.ts';
before(initPhysics);

test('all authored character envelopes fit inside their atlas without a clipped back cap',()=>{
 for(const p of characterParts){const half=volumes[p.asset].size[2]/2;let minimum=half;
  for(let x=1;x<80;x++)for(let y=1;y<80;y++){const envelope=characterEnvelope(p.asset,x/80,y/80);if(!envelope)continue;assert.ok(envelope.back<=envelope.front);assert.ok(envelope.back>=-half-.0001,`${p.asset} back outside atlas`);assert.ok(envelope.front<=half+.0001,`${p.asset} front outside atlas`);minimum=Math.min(minimum,envelope.back);}
  if(p.id==='head')assert.ok(minimum>-half+.015,'Displaced cranium has headroom rather than clipping flat');
 }
});

test('a continuous contact episode consumes one strike and separation rearms it',()=>{
 const m=new HeldMotion('mallet');assert.ok(m.strike(18,[1,0]));for(let i=0;i<60;i++){m.contact(true,STEP);m.tick(8,0,STEP);assert.equal(m.strike(18,[1,0]),false);}for(let i=0;i<8;i++)m.contact(false,STEP);assert.equal(m.ready,false);for(let i=0;i<6;i++)m.contact(false,STEP);assert.ok(m.strike(18,[-1,0]));
});

test('glove wrist give and squeeze start continuously and settle across sample rates',()=>{
 const a=new HeldMotion('glove'),b=new HeldMotion('glove');a.strike(18,[1,0]);b.strike(18,[1,0]);assert.equal(a.compression,0);assert.equal(a.recoilX,0);a.tick(0,0,STEP);assert.ok(a.compression>0&&a.compression<.06);assert.ok(a.recoilX<0);
 for(let i=1;i<240;i++)a.tick(0,0,STEP);for(let i=0;i<120;i++)b.tick(0,0,1/60);assert.ok(Math.abs(a.recoilX-b.recoilX)<.001);assert.ok(Math.abs(a.compression-b.compression)<.001);assert.ok(Math.abs(a.compression)<.001);assert.ok(Math.abs(a.recoilX)<.001);
 const hammer=new HeldMotion('mallet');hammer.strike(18,[1,0]);hammer.tick(0,0,STEP);assert.equal(hammer.compression,0,'A metal mallet must not squash like a glove');
});

test('heavy and punch recoil preserve continuity but have different settling and wince timing',()=>{
 const heavy=new DamageState(),punch=new DamageState();heavy.hit(15,{region:'head',u:.5,v:.6,style:'heavy'});punch.hit(15,{region:'head',u:.5,v:.6,style:'punch'});assert.ok(heavy.blink>0&&punch.blink>0,'A contact already winces during hit-stop');heavy.tick(.17);punch.tick(.17);assert.ok(heavy.blink>0);assert.equal(punch.blink,0);assert.notEqual(heavy.deformation.y,punch.deformation.y);const old={...heavy.deformation};heavy.hit(12,{region:'head',u:.5,v:.6,style:'punch'});assert.deepEqual(heavy.deformation,old);
});

test('actual swings emit local directional contacts, bounded strike count and unscored whooshes',()=>{
 for(const id of ['mallet','glove']){const s=new Simulation();try{for(let i=0;i<120;i++)s.step();const events:GameEvent[]=[];s.onEvent=e=>events.push(e);const y=id==='mallet'?2:2.6;s.beginSwing(id,[-3,y,0]);for(let i=0;i<90;i++){s.moveSwing([-3+i*8*STEP,y,0]);s.step();}
  const hits=events.filter(e=>e.type==='impact'&&e.tool===id);assert.ok(hits.length>=1&&hits.length<=2);const hit=hits[0];assert.ok(hit.direction![0]>.4);assert.ok(hit.position.every(Number.isFinite));assert.ok(hit.speed!>3);assert.ok(events.some(e=>e.type==='swing'&&e.points===0));assert.ok(s.entities.every(e=>Math.hypot(e.body.linvel().x,e.body.linvel().y)<27));
 }finally{s.dispose();}}
});

test('grabbing during a rise interrupts recovery without a pose snap or stale progress',()=>{
 const s=new Simulation();try{s.blast(s.spawn('bomb',.2,1.5)!);let rising=false;for(let i=0;i<2400;i++){s.step();if(s.poseState==='rising'){rising=true;break;}}assert.ok(rising);const head=s.entities[1],p=head.body.translation();s.beginGrab(head,[p.x,p.y,0]);const before={...head.body.translation()};s.step();assert.equal(s.poseState,'held');assert.ok(Math.hypot(head.body.translation().x-before.x,head.body.translation().y-before.y)<.05);s.release();for(let i=0;i<3000;i++)s.step();assert.ok(s.entities[1].body.translation().y>2.6);assert.equal(s.damage.amount,0);
 }finally{s.dispose();}
});

test('standing is reported only after the actual post-punch body has risen upright',()=>{
 const s=new Simulation();try{for(let i=0;i<120;i++)s.step();s.beginSwing('glove',[-3,2.6,0]);for(let i=0;i<90;i++){s.moveSwing([-3+i*8*STEP,2.6,0]);s.step();}s.endSwing();let finished=false;
  for(let i=0;i<3600;i++){s.step();if(s.poseState==='standing'){assert.ok(s.entities[1].body.translation().y>2.6);const q=s.entities[0].body.rotation();assert.ok(Math.abs(2*Math.atan2(q.z,q.w))<.16);finished=true;break;}}assert.ok(finished);
 }finally{s.dispose();}
});
