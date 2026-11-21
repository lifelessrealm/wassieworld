import test,{before} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PNG} from 'pngjs';
import {characterParts,bindPosition,SOURCE_SCALE} from '../src/assets/character.ts';
import {volumes,sample} from '../src/assets/volumes.ts';
import {DamageState} from '../src/game/damage.ts';
import {Simulation,initPhysics,STEP} from '../src/game/simulation.ts';
before(initPhysics);
test('all six character parts share the reference pixel scale and authored joint space',()=>{
 assert.equal(characterParts.length,6);for(const part of characterParts){const v=volumes[part.asset];assert.equal(v.size[0],(part.crop[2]-part.crop[0])*SOURCE_SCALE);assert.equal(v.size[1],(part.crop[3]-part.crop[1])*SOURCE_SCALE);assert.equal(v.reference,part.id);assert.ok(v.layers>=40);}
});
test('canonical eye, lip, brow and crescent landmarks retain the supplied image colors',()=>{
 const png=PNG.sync.read(readFileSync('public/references/wassie-canonical.png'));
 for(const [asset,sx,sy]of [['head',446,730],['head',469,724],['head',500,978],['head',512,590],['torso',402,1258]] as const){
  const p=characterParts.find(p=>p.asset===asset)!,v=volumes[asset],x=((sx-(p.crop[0]+p.crop[2])/2)*SOURCE_SCALE),y=(((p.crop[1]+p.crop[3])/2-sy)*SOURCE_SCALE);
  const value=sample(v,[x,y,v.size[2]/2-v.size[2]/32]);assert.ok(value,`${asset} landmark ${sx},${sy} must remain occupied`);
  const rgb=parseInt(value.color.slice(1),16),actual=[rgb>>16,(rgb>>8)&255,rgb&255],index=(sy*png.width+sx)*4;
  for(let i=0;i<3;i++)assert.ok(Math.abs(actual[i]-png.data[index+i])<24,`${asset} landmark ${sx},${sy}: ${value.color}`);
 }
});
test('joint limits survive repeated torques while the complete ragdoll stays planar',()=>{
 const s=new Simulation();try{s.damage.quiet=-10;for(let i=0;i<600;i++){if(i%45===0)for(const e of s.entities)e.body.applyTorqueImpulse({x:0,y:0,z:i%90===0?.2:-.2},true);s.step();}
  const torso=s.entities[0].body.rotation(),root=2*Math.atan2(torso.z,torso.w);
  for(const e of s.entities.slice(1)){const q=e.body.rotation(),relative=Math.atan2(Math.sin(2*Math.atan2(q.z,q.w)-root),Math.cos(2*Math.atan2(q.z,q.w)-root)),spec=characterParts.find(p=>p.id===e.rigPart)!;assert.ok(relative>=spec.limits![0]-.12&&relative<=spec.limits![1]+.12,`${spec.id}: ${relative}`);assert.ok(Math.abs(e.body.translation().z)<.02);}
 }finally{s.dispose();}
});
test('holding a spring grab does not recover early or create unbounded throw speeds',()=>{
 const s=new Simulation();try{const head=s.entities.find(e=>e.rigPart==='head')!,p=head.body.translation();s.beginGrab(head,[p.x,p.y,0]);for(let i=0;i<1000;i++){s.moveGrab([Math.sin(i/180)*3,5,0]);s.step();}assert.equal(s.damage.quiet,0);assert.ok(head.body.translation().y>4.3);assert.ok(s.grabbing);s.release();for(let i=0;i<24;i++)s.step();assert.ok(s.damage.quiet<.21);assert.ok(Math.hypot(head.body.linvel().x,head.body.linvel().y)<30);assert.equal(s.world.impulseJoints.len(),5);}finally{s.dispose();}
});
test('a landing produces spaced reactions and recovers to the canonical stance',()=>{
 const s=new Simulation();try{const head=s.entities.find(e=>e.rigPart==='head')!,p=head.body.translation();s.beginGrab(head,[p.x,p.y,0]);s.release();
  for(const e of s.entities){const p=e.body.translation();e.body.setTranslation({x:p.x,y:p.y+3,z:0},true);e.body.setLinvel({x:0,y:-7,z:0},true);}
  const impacts:number[]=[];s.onEvent=e=>{if(e.type==='impact')impacts.push(s.elapsed);};for(let i=0;i<3600;i++)s.step();assert.ok(impacts.length>0);for(let i=1;i<impacts.length;i++)assert.ok(impacts[i]-impacts[i-1]>=.12-STEP);assert.equal(s.damage.amount,0);assert.ok(head.body.translation().y>2.6);assert.ok(s.entities.every(e=>Math.abs(e.body.translation().x)<8));
 }finally{s.dispose();}
});
test('a quiet chamber cannot farm damage or points after deploying an unrelated prop',()=>{
 const s=new Simulation();try{s.spawn('crate',6,.7);for(let i=0;i<2400;i++)s.step();assert.equal(s.damage.amount,0);assert.equal(s.score.total,0);assert.ok(Math.abs(s.entities[0].body.translation().x)<.1);}finally{s.dispose();}
});
test('one explosion applies one character reaction rather than six stacked damage hits',()=>{const s=new Simulation();try{s.blast(s.spawn('bomb',.1,1.7)!);assert.equal(s.damage.sequence,1);assert.ok(s.damage.amount>0&&s.damage.amount<=25);assert.ok(s.damage.statuses.has('soot'));}finally{s.dispose();}});
test('damage marks are local, bounded, and dissolve during recovery',()=>{const d=new DamageState();for(let i=0;i<20;i++)d.hit(12,{region:i%2?'head':'torso',u:(i%5)/5,v:.7});assert.ok(d.marks.length<=6);assert.ok(d.marks.some(m=>m.region==='head')&&d.marks.some(m=>m.region==='torso'));for(let i=0;i<3600;i++)d.tick(STEP);assert.equal(d.amount,0);assert.equal(d.marks.length,0);assert.equal(d.expression,'neutral');});
test('squash and recoil settle continuously and agree at different simulation sampling rates',()=>{
 const a=new DamageState(),b=new DamageState();a.hit(24);b.hit(24);let last=a.deformation.y;
 for(let i=0;i<240;i++){a.tick(STEP);const y=a.deformation.y;assert.ok(Math.abs(y-last)<.05);last=y;}
 for(let i=0;i<120;i++)b.tick(1/60);assert.ok(Math.abs(a.deformation.y-b.deformation.y)<.001);assert.ok(Math.abs(a.deformation.y-1)<.001);
});
test('zero gravity does not silently pull the character back to a floor pose',()=>{const s=new Simulation();try{s.gravity=0;for(const e of s.entities){const p=e.body.translation();e.body.setTranslation({x:p.x,y:p.y+3,z:p.z},true);}const y=s.entities[0].body.translation().y;for(let i=0;i<720;i++)s.step();assert.ok(Math.abs(s.entities[0].body.translation().y-y)<.03);}finally{s.dispose();}});
test('reset clears active dragging, damage layers and stale recovery anchors',()=>{const s=new Simulation();try{const head=s.entities[1],p=head.body.translation();s.beginGrab(head,[p.x,p.y,0]);s.damage.hit(24);s.damage.add('frozen',3);s.resetWassie();for(let i=0;i<240;i++)s.step();assert.equal(s.world.bodies.len(),6);assert.equal(s.world.impulseJoints.len(),5);assert.equal(s.damage.marks.length,0);assert.equal(s.damage.statuses.size,0);assert.ok(Math.abs(s.entities[0].body.translation().x-bindPosition(characterParts[0])[0])<.1);}finally{s.dispose();}});
