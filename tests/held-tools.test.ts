import test,{before} from 'node:test';
import assert from 'node:assert/strict';
import {Simulation,initPhysics,STEP} from '../src/game/simulation.ts';
import {characterEnvelope} from '../src/assets/volumes.ts';
before(initPhysics);

test('head and body curve on both surfaces and the cranium tapers at the crown',()=>{
 for(const asset of ['head','torso']){const middle=characterEnvelope(asset,.5,.5)!,flank=characterEnvelope(asset,.82,.5)!;
  assert.ok(middle.front>flank.front+.045,`${asset}: the front cannot be a flat cap`);
  assert.ok(middle.back<flank.back-.08,`${asset}: rounded rear`);
 }
 const crown=characterEnvelope('head',.5,.09)!,cranium=characterEnvelope('head',.5,.4)!;assert.ok(cranium.front-cranium.back>crown.front-crown.back+.2);
});

test('held tools attach once at the handle, stay out of saves and release their resources',()=>{
 const s=new Simulation();try{for(let i=0;i<20;i++){s.beginSwing(i%2?'mallet':'glove',[-3,3,0]);assert.ok(s.swinging);assert.equal(s.world.bodies.len(),8);assert.equal(s.world.impulseJoints.len(),6);assert.equal(s.save().props.length,0);s.moveSwing([3,4,0]);const previous=s.heldTool!.body.translation().x;s.step();assert.ok(Math.abs(s.heldTool!.body.translation().x-previous)<.25,'The collider follows forces instead of teleporting');s.endSwing();assert.equal(s.world.bodies.len(),6);assert.equal(s.world.impulseJoints.len(),5);}s.beginSwing('bomb',[0,3,0]);assert.equal(s.swinging,false);s.beginSwing('mallet',[NaN,3,0]);assert.equal(s.swinging,false);
 }finally{s.dispose();}
});

test('sweeping a held hammer or glove faster produces a stronger physical hit',()=>{
 for(const id of ['mallet','glove']){const strengths:number[]=[];for(const speed of [1,8]){const s=new Simulation();try{for(let i=0;i<120;i++)s.step();let strongest=0;s.onEvent=e=>{if(e.type==='impact')strongest=Math.max(strongest,e.strength);};const y=id==='mallet'?2:2.6;s.beginSwing(id,[-3,y,0]);for(let i=0;i<Math.ceil(6/speed/STEP);i++){s.moveSwing([-3+i*speed*STEP,y,0]);s.step();}strengths.push(strongest);assert.ok(s.entities.every(e=>Object.values(e.body.translation()).every(Number.isFinite)));}finally{s.dispose();}}assert.ok(strengths[1]>strengths[0]+3,`${id}: ${strengths}`);}
});

test('an actual cursor hit settles and rises continuously before returning to stance',()=>{
 const s=new Simulation();try{for(let i=0;i<120;i++)s.step();s.beginSwing('mallet',[-3,2,0]);for(let i=0;i<90;i++){s.moveSwing([-3+i*8*STEP,2,0]);s.step();}s.endSwing();const states=new Set<string>();let previous=s.entities[0].body.translation().y;
  for(let i=0;i<3600;i++){s.step();states.add(s.poseState);const height=s.entities[0].body.translation().y;if(s.poseState==='rising')assert.ok(Math.abs(height-previous)<.04,'No get-up pose snap');previous=height;}
  assert.ok(states.has('settling')&&states.has('rising')&&states.has('standing'));assert.equal(s.damage.amount,0);assert.ok(s.entities[1].body.translation().y>2.6);assert.equal(s.world.bodies.len(),6);
 }finally{s.dispose();}
});

test('room and character resets cancel active cursor tools',()=>{
 const s=new Simulation();try{for(const reset of [()=>s.resetWassie(),()=>s.resetRoom()]){s.beginSwing('glove',[2,3,0]);s.step();reset();assert.equal(s.swinging,false);assert.equal(s.world.bodies.len(),6);assert.equal(s.world.impulseJoints.len(),5);}}finally{s.dispose();}
});

test('larger bomb blast reaches distant props with falloff and chains within the new radius',()=>{
 const s=new Simulation();try{const bomb=s.spawn('bomb',0,3)!,near=s.spawn('crate',2,3)!,far=s.spawn('crate',4.5,3)!,outside=s.spawn('crate',7,3)!,chain=s.spawn('bomb',4.8,3)!;s.blast(bomb);assert.ok(far.body.linvel().x>0,'Beyond the previous 3.8m radius');assert.ok(near.body.linvel().x>far.body.linvel().x);assert.equal(outside.body.linvel().x,0);assert.ok(chain.fuse<=.08);assert.equal(s.damage.sequence,1);assert.ok(s.damage.amount<=25,'One bounded cartoon reaction per blast');}finally{s.dispose();}
});
