import RAPIER from '@dimforge/rapier3d-compat';
import {toolById, type Tool} from '../assets/catalog.ts';
import {volumes, type Vec} from '../assets/volumes.ts';
import {DamageState,Score} from './damage.ts';
export const STEP=1/120, MAX_PROPS=40;
export type Entity={id:number;asset:string;body:RAPIER.RigidBody;collider:RAPIER.Collider;part:boolean;tool?:Tool;age:number;fuse:number;cooldown:number;previous:{x:number;y:number;z:number};previousRotation:RAPIER.Quaternion};
export type GameEvent={type:'impact'|'blast'|'freeze'|'shock'|'launch'|'recovery';position:Vec;strength:number;points:number};
export type Setup={version:1;props:{asset:string;x:number;y:number;angle:number}[]};
export class Simulation {
 world:RAPIER.World;events:RAPIER.EventQueue;entities:Entity[]=[];damage=new DamageState();score=new Score();elapsed=0;gravity=9.81;
 private nextId=1;private contacts=new Map<string,number>();private byCollider=new Map<number,Entity>();private interacted=false;private grab?:{cursor:RAPIER.RigidBody;joint:RAPIER.ImpulseJoint;target:Vec;entity:Entity};
 onEvent:(event:GameEvent)=>void=()=>{};
 constructor(){
  this.world=new RAPIER.World({x:0,y:-this.gravity,z:0});this.world.timestep=STEP;this.world.integrationParameters.numSolverIterations=8;
  this.events=new RAPIER.EventQueue(true);
  for(const [x,y,hx,hy]of [[0,-.25,9,.25],[-9,5,.25,5],[9,5,.25,5],[0,10,9,.25]])this.world.createCollider(RAPIER.ColliderDesc.cuboid(hx,hy,2).setTranslation(x,y,0).setRestitution(.35).setFriction(.8).setCollisionGroups(0x00020003));
  this.createWassie();this.damage.quiet=6;
 }
 private entity(asset:string,x:number,y:number,part:boolean,mass:number,fixed=false):Entity{
  const size=volumes[asset].size;
  const desc=(fixed?RAPIER.RigidBodyDesc.fixed():RAPIER.RigidBodyDesc.dynamic()).setTranslation(x,y,0).setLinearDamping(.18).setAngularDamping(.8).setCcdEnabled(true).enabledTranslations(true,true,false).enabledRotations(false,false,true);
  const body=this.world.createRigidBody(desc);
  const shape=asset==='bomb'?RAPIER.ColliderDesc.ball(.38):RAPIER.ColliderDesc.cuboid(size[0]*.45,size[1]*.47,size[2]*.45);
  const collider=this.world.createCollider(shape.setMass(mass).setFriction(.6).setRestitution(part?.32:.25).setCollisionGroups(part?0x00010002:0x00020003).setActiveEvents(RAPIER.ActiveEvents.CONTACT_FORCE_EVENTS).setContactForceEventThreshold(160),body);
  const entity:Entity={id:this.nextId++,asset,body,collider,part,age:0,fuse:2.8,cooldown:0,previous:{...body.translation()},previousRotation:{...body.rotation()}};
  this.entities.push(entity);this.byCollider.set(collider.handle,entity);return entity;
 }
 private createWassie(){
  const torso=this.entity('torso',0,1.3,true,2.3),head=this.entity('head',.17,2.78,true,1.4);
  const join=(a:Entity,b:Entity,anchorA:Vec,anchorB:Vec)=>this.world.createImpulseJoint(RAPIER.JointData.spherical({x:anchorA[0],y:anchorA[1],z:anchorA[2]},{x:anchorB[0],y:anchorB[1],z:anchorB[2]}),a.body,b.body,true);
  join(torso,head,[.17,.87,0],[0,-.61,0]);
  for(const side of [-1,1]){const arm=this.entity('arm',side*.61,1.26,true,.3),foot=this.entity(side<0?'foot':'rightFoot',side*.28,.21,true,.35);join(torso,arm,[side*.55,.55,0],[0,.59,0]);join(torso,foot,[side*.28,-.9,0],[0,.19,0]);}
 }
 spawn(id:string,x=2,y=5):Entity|null{
  const tool=toolById(id);if(!tool)throw Error(`Unknown tool: ${id}`);
  if(this.entities.filter(e=>!e.part).length>=MAX_PROPS)return null;
  if(!Number.isFinite(x)||!Number.isFinite(y))throw Error('Invalid spawn coordinates');
  const half=volumes[id].size[1]/2;
  const e=this.entity(id,Math.max(-7.8,Math.min(7.8,x)),tool.fixed?half+.03:Math.max(half+.1,Math.min(8.5,y)),false,tool.mass,tool.fixed);
  e.tool=tool;e.collider.setRestitution(tool.restitution);e.collider.setFriction(tool.friction);this.interacted=true;return e;
 }
 private emit(type:GameEvent['type'],e:Entity,strength:number,key:string){const p=e.body.translation();const points=this.score.event(key,strength);this.onEvent({type,position:[p.x,p.y,p.z],strength,points});}
 blast(e:Entity){
  const p=e.body.translation();this.emit('blast',e,18,`blast-${e.id}`);
  for(const other of this.entities){if(other===e)continue;const q=other.body.translation(),dx=q.x-p.x,dy=q.y-p.y,d=Math.hypot(dx,dy);if(d>3.8)continue;const power=(1-d/3.8)*17;
   if(other.tool?.behavior==='explosive')other.fuse=Math.min(other.fuse,.08);
   if(!other.body.isFixed())other.body.applyImpulse({x:dx/(d||1)*power,y:(dy/(d||1)+.65)*power,z:0},true);
   if(other.part){this.damage.hit(power);this.damage.add('soot',7);}
  }
  this.remove(e);
 }
 remove(e:Entity){if(this.grab?.entity===e)this.release();this.byCollider.delete(e.collider.handle);this.world.removeRigidBody(e.body);this.entities=this.entities.filter(x=>x!==e);}
 beginGrab(e:Entity,point:Vec){
  this.release();if(e.body.isFixed())return;this.interacted=true;this.damage.quiet=0;
  const p=e.body.translation(),q=e.body.rotation();const dx=point[0]-p.x,dy=point[1]-p.y;const angle=2*Math.atan2(q.z,q.w);
  const anchor={x:dx*Math.cos(angle)+dy*Math.sin(angle),y:-dx*Math.sin(angle)+dy*Math.cos(angle),z:0};
  const cursor=this.world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(point[0],point[1],0));
  const joint=this.world.createImpulseJoint(RAPIER.JointData.spherical(anchor,{x:0,y:0,z:0}),e.body,cursor,true);
  this.grab={cursor,joint,target:point,entity:e};e.body.wakeUp();
 }
 moveGrab(point:Vec){if(this.grab)this.grab.target=point;}
 release(){if(!this.grab)return;this.world.removeImpulseJoint(this.grab.joint,true);this.world.removeRigidBody(this.grab.cursor);this.grab=undefined;}
 get grabbing(){return !!this.grab;}
 step(){
  const dt=STEP;this.elapsed+=dt;this.damage.tick(dt);this.score.tick(dt);this.world.gravity.y=-this.gravity;
  for(const e of this.entities){e.previous={...e.body.translation()};e.previousRotation={...e.body.rotation()};e.age+=dt;e.cooldown=Math.max(0,e.cooldown-dt);
   if(e.part){
    e.body.setLinearDamping(this.damage.statuses.has('frozen')?6:.18);
    // Blend into a supported bind pose after a quiet moment, keeping bodies dynamic.
    const torso=this.entities.find(p=>p.asset==='torso')!,p=e.body.translation();
    if(!this.grab&&this.damage.quiet>3&&this.damage.amount<55&&torso.body.translation().y<3.2){
     const q=e.body.rotation(),angle=2*Math.atan2(q.z,q.w),velocity=e.body.linvel();
     const armIndex=this.entities.filter(v=>v.asset==='arm').indexOf(e);
     const offset=e.asset==='arm'?(armIndex===0?-.61:.61):e.asset==='foot'?-.28:e.asset==='rightFoot'?.28:e.asset==='head'?.17:0;
     const targetY=e.asset==='head'?2.78:e.asset==='torso'?1.3:e.asset==='arm'?1.26:.21;
     const clamp=(n:number)=>Math.max(-40,Math.min(40,n));
     e.body.applyImpulse({x:clamp((torso.body.translation().x+offset-p.x)*22-velocity.x*7)*e.body.mass()*dt,y:(clamp((targetY-p.y)*45-velocity.y*10)+this.gravity)*e.body.mass()*dt,z:0},true);
     e.body.applyTorqueImpulse({x:0,y:0,z:clamp(-angle*25-e.body.angvel().z*6)*e.body.mass()*dt},true);
    }
   }
   if(e.tool?.behavior==='rocket'&&e.age<2.5){const q=e.body.rotation(),angle=2*Math.atan2(q.z,q.w);e.body.applyImpulse({x:-Math.sin(angle)*.12,y:Math.cos(angle)*.12,z:0},true);}
   const v=e.body.linvel(),speed=Math.hypot(v.x,v.y);if(speed>32)e.body.setLinvel({x:v.x/speed*32,y:v.y/speed*32,z:0},true);
  }
  if(this.grab){const p=this.grab.cursor.translation(),target=this.grab.target;const dx=target[0]-p.x,dy=target[1]-p.y,d=Math.hypot(dx,dy),f=Math.min(1,.32/(d||1));this.grab.cursor.setNextKinematicTranslation({x:p.x+dx*f,y:p.y+dy*f,z:0});}
  for(const machine of [...this.entities]){
   const behavior=machine.tool?.behavior;if(!behavior)continue;
   if(behavior==='explosive'){machine.fuse-=dt;if(machine.fuse<=0){this.blast(machine);continue;}}
   if(behavior==='rocket'&&machine.age>3){this.blast(machine);continue;}
   if(!['fan','spring','freeze','electric'].includes(behavior))continue;
   const p=machine.body.translation();
   for(const e of this.entities){if(e===machine||e.body.isFixed())continue;const q=e.body.translation(),dx=q.x-p.x,dy=q.y-p.y,d=Math.hypot(dx,dy);
    if(behavior==='fan'&&Math.abs(dx)<1.25&&dy>0&&dy<4)e.body.applyImpulse({x:dx*.04*dt,y:20*dt,z:0},true);
    if(behavior==='spring'&&Math.abs(dx)<.9&&dy>0&&dy<1.25&&machine.cooldown===0){e.body.applyImpulse({x:dx*2,y:15*e.body.mass(),z:0},true);machine.cooldown=.7;this.emit('launch',e,8,`spring-${machine.id}`);if(e.part)this.damage.add('dizzy',2);}
    if(e.part&&d<2&&machine.cooldown===0){
     if(behavior==='freeze'){this.damage.add('frozen',3);this.emit('freeze',e,3,`freeze-${machine.id}`);machine.cooldown=2;}
     if(behavior==='electric'){const combo=this.damage.statuses.has('frozen');this.damage.statuses.delete('frozen');this.damage.add('shocked',2);this.damage.hit(combo?18:7);e.body.applyImpulse({x:dx*2,y:5,z:0},true);this.emit('shock',e,combo?15:5,`shock-${machine.id}`);machine.cooldown=1.2;}
    }
   }
  }
  this.world.step(this.events);
  this.events.drainContactForceEvents(event=>{
   const a=this.byCollider.get(event.collider1()),b=this.byCollider.get(event.collider2());if(!this.interacted||(!a?.part&&!b?.part))return;
   const key=[event.collider1(),event.collider2()].sort().join(':');if((this.contacts.get(key)??-1)>this.elapsed)return;
   const impulse=event.totalForceMagnitude()*dt;if(impulse<2.4)return;this.contacts.set(key,this.elapsed+.22);const e=a?.part?a:b!;
   this.damage.hit(impulse);this.emit('impact',e,impulse,`contact-${a?.id??0}-${b?.id??0}`);
  });
  for(const [key,time]of this.contacts)if(time<this.elapsed)this.contacts.delete(key);
 }
 resetWassie(){this.release();for(const e of [...this.entities])if(e.part)this.remove(e);this.damage.reset();this.damage.quiet=6;this.createWassie();}
 resetRoom(){this.release();for(const e of [...this.entities])this.remove(e);this.contacts.clear();this.score=new Score();this.damage.reset();this.damage.quiet=6;this.elapsed=0;this.interacted=false;this.createWassie();}
 save():Setup{return {version:1,props:this.entities.filter(e=>!e.part).map(e=>({asset:e.asset,x:e.body.translation().x,y:e.body.translation().y,angle:2*Math.atan2(e.body.rotation().z,e.body.rotation().w)}))};}
 load(value:unknown){
  const s=value as Setup;if(!s||s.version!==1||!Array.isArray(s.props)||s.props.length>MAX_PROPS||s.props.some(p=>!p||!toolById(p.asset)||![p.x,p.y,p.angle].every(Number.isFinite)))throw Error('This setup is invalid or belongs to a different version.');
  this.resetRoom();for(const p of s.props){const e=this.spawn(p.asset,p.x,p.y)!;e.body.setRotation({x:0,y:0,z:Math.sin(p.angle/2),w:Math.cos(p.angle/2)},true);}
 }
 dispose(){this.release();this.events.free();this.world.free();}
}
export async function initPhysics(){await RAPIER.init();}
