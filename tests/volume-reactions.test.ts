import test,{before} from 'node:test';
import assert from 'node:assert/strict';
import RAPIER from '@dimforge/rapier3d-compat';
import {Simulation,initPhysics,STEP} from '../src/game/simulation.ts';
import {characterEnvelope,sample,volumes} from '../src/assets/volumes.ts';
import {bindPosition,characterParts} from '../src/assets/character.ts';
import {impactStrength} from '../src/game/rig-physics.ts';
import {DamageState} from '../src/game/damage.ts';
before(initPhysics);
test('head and torso have continuous rounded cross sections with outward rear normals',()=>{
 for(const asset of ['head','torso']){const v=volumes[asset],center=characterEnvelope(asset,.5,.5)!,flank=characterEnvelope(asset,.78,.5)!;assert.ok(center.front-center.back>flank.front-flank.back,'The back rounds across the body width');assert.ok(center.front-center.back>.55,'The model has substantive volume');
  for(let i=1;i<30;i++){const z=center.back+(center.front-center.back)*i/30;assert.ok(sample(v,[0,0,z]),`${asset} must contain its entire coherent depth interval`);}
  const rear=sample(v,[0,0,center.back+.00001])!;assert.ok(rear.normal[2]<0);assert.ok(Math.abs(Math.hypot(...rear.normal)-1)<.001);
 }
});
test('side anatomy gives the eyes and lips depth while the back stays skin colored',()=>{
 const eye=characterEnvelope('head',.49,.416)!,cheek=characterEnvelope('head',.35,.65)!,lip=characterEnvelope('head',.62,.82)!;
 assert.ok(eye.front>cheek.front+.12);assert.ok(lip.front>cheek.front+.08);
 const v=volumes.head,point:[number,number,number]=[(.49-.5)*v.size[0],(.5-.416)*v.size[1],eye.back+.00001];assert.equal(sample(v,point)!.color,'#5e8e3d','The rear must not mirror the eyes or mouth');
});
test('support-aware recovery stands on a platform instead of pulling through it',()=>{
 const s=new Simulation();try{s.world.createCollider(RAPIER.ColliderDesc.cuboid(2,.15,1).setTranslation(0,1.25,0));for(const e of s.entities){const p=e.body.translation();e.body.setTranslation({x:p.x,y:p.y+1.4,z:p.z},true);}for(let i=0;i<1200;i++)s.step();
  assert.ok(s.grounded);assert.ok(s.entities[0].body.translation().y>2.6);assert.ok(['rising','standing'].includes(s.poseState));assert.ok(s.entities.find(e=>e.rigPart==='leftFoot')!.body.translation().y>1.5);
 }finally{s.dispose();}
});
test('a quiet airborne character falls under gravity without a hidden pose force',()=>{
 const s=new Simulation();try{for(const e of s.entities){const p=e.body.translation();e.body.setTranslation({x:p.x,y:p.y+.8,z:p.z},true);}s.damage.quiet=10;const mass=characterParts.reduce((sum,p)=>sum+p.mass,0),center=()=>s.entities.reduce((sum,e)=>sum+e.body.translation().y*e.body.mass(),0)/mass,start=center();for(let i=0;i<15;i++)s.step();
  assert.equal(s.poseState,'airborne');assert.equal(s.grounded,false);assert.ok(Math.abs(center()-(start-.5*9.81*(15*STEP)**2))<.02);assert.ok(s.entities[0].body.translation().y>bindPosition(characterParts[0])[1]+.65);
 }finally{s.dispose();}
});
test('impact intensity respects mass and available incoming momentum',()=>{
 assert.equal(impactStrength(1000,0,5.8,10),0);
 assert.ok(impactStrength(1000,6,5.8,12)>impactStrength(1000,6,5.8,.2));
 assert.equal(impactStrength(3,50,5.8,Infinity),3,'Constraint force spikes cannot create energy beyond the measured impulse');
});
test('surface-specific marks stay separate and limb impacts retain their identity',()=>{
 const d=new DamageState();d.hit(12,{region:'head',u:.5,v:.6,surface:'front'});d.hit(12,{region:'head',u:.5,v:.6,surface:'back'});d.hit(12,{region:'leftArm',u:.5,v:.5,surface:'left'});
 assert.equal(d.marks.length,3);assert.ok(d.marks.some(m=>m.region==='leftArm'&&m.surface==='left'));assert.equal(new Set(d.marks.map(m=>m.surface)).size,3);
});
test('repeated impacts add recoil velocity without a deformation discontinuity',()=>{
 const d=new DamageState();d.hit(18,{region:'head',u:.5,v:.6,normal:[0,-1]});for(let i=0;i<5;i++)d.tick(STEP);const previous={...d.deformation};d.hit(15,{region:'torso',u:.4,v:.4,normal:[-1,0]});assert.deepEqual(d.deformation,previous);d.tick(STEP);assert.ok(Math.abs(d.deformation.y-previous.y)<.05);
 const landing=new DamageState();landing.hit(18,{region:'leftFoot',u:.5,v:.6,normal:[0,-1]});landing.tick(.08);assert.ok(Math.abs(landing.deformation.angle)<.001,'Opposite normals describe the same compression axis');
});
