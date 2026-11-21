import RAPIER from '@dimforge/rapier3d-compat';
import {toolById, type Tool} from '../assets/catalog.ts';
import {volumes, type Vec} from '../assets/volumes.ts';
import {DamageState,Score} from './damage.ts';
import {characterParts,bindPosition,sourcePosition,partForAsset,characterDepthOffset,type RigPart} from '../assets/character.ts';
import {angleDelta,clamp,impactStrength,jointRestImpulse} from './rig-physics.ts';
import {HeldMotion,heldProfiles,type HeldId} from './held-motion.ts';
export const STEP=1/120, MAX_PROPS=40;
export type Entity={id:number;asset:string;body:RAPIER.RigidBody;collider:RAPIER.Collider;part:boolean;held?:boolean;rigPart?:RigPart;tool?:Tool;age:number;fuse:number;cooldown:number;previous:{x:number;y:number;z:number};previousCenter:{x:number;y:number;z:number};previousRotation:RAPIER.Quaternion;previousVelocity:{x:number;y:number;z:number};previousSpin:number};
export type GameEvent={type:'impact'|'swing'|'blast'|'freeze'|'shock'|'launch'|'recovery';position:Vec;strength:number;points:number;direction?:Vec;tool?:string;speed?:number};
export type Setup={version:1;props:{asset:string;x:number;y:number;angle:number}[]};
export class Simulation {
 world:RAPIER.World;events:RAPIER.EventQueue;entities:Entity[]=[];damage=new DamageState();score=new Score();elapsed=0;gravity=9.81;
 private nextId=1;private contacts=new Map<string,number>();private byCollider=new Map<number,Entity>();private interacted=false;private impactCooldown=0;
 private grab?:{cursor:RAPIER.RigidBody;joint:RAPIER.ImpulseJoint;target:Vec;entity:Entity};
 private swing?:{cursor:RAPIER.RigidBody;joint:RAPIER.ImpulseJoint;target:Vec;entity:Entity;motion:HeldMotion};
 readonly rigJoints:RAPIER.RevoluteImpulseJoint[]=[];
 private recoveryX=0;private needsRecoveryAnchor=false;private lastDamageSequence=0;private airborneTime=0;
 private supportUntil=0;private supportY=0;
 private recoveryTime=0;private recoveryHeight=0;private recoveryAngle=0;private recoveryDuration=.65;private recoveryLost=0;
 poseState:'held'|'airborne'|'settling'|'rising'|'standing'|'stunned'='settling';
 onEvent:(event:GameEvent)=>void=()=>{};
 constructor(){
  this.world=new RAPIER.World({x:0,y:-this.gravity,z:0});this.world.timestep=STEP;this.world.integrationParameters.numSolverIterations=8;
  this.events=new RAPIER.EventQueue(true);
  for(const [x,y,hx,hy]of [[0,-.25,9,.25],[-9,5,.25,5],[9,5,.25,5],[0,10,9,.25]])this.world.createCollider(RAPIER.ColliderDesc.cuboid(hx,hy,2).setTranslation(x,y,0).setRestitution(.35).setFriction(.8).setCollisionGroups(0x00020003));
  this.createWassie();this.damage.quiet=6;
 }
 private entity(asset:string,x:number,y:number,part:boolean,mass:number,fixed=false):Entity{
  const size=volumes[asset].size;
  // Revolute child joints already lock the non-planar axes. Locking them again
  // on each child body overconstrains Rapier's solver under impacts.
  const child=part&&asset!=='torso';
  const desc=(fixed?RAPIER.RigidBodyDesc.fixed():RAPIER.RigidBodyDesc.dynamic()).setTranslation(x,y,0).setLinearDamping(.18).setAngularDamping(.8).setCcdEnabled(true).enabledTranslations(true,true,child).enabledRotations(child,child,true);
  const body=this.world.createRigidBody(desc);
  const shape=asset==='bomb'?RAPIER.ColliderDesc.ball(.38):asset==='mallet'?RAPIER.ColliderDesc.roundCuboid(.54,.26,.27,.025).setTranslation(0,.38,0):asset==='glove'?RAPIER.ColliderDesc.ball(.4).setTranslation(0,.1,0):part?RAPIER.ColliderDesc.roundCuboid(size[0]*.4,size[1]*.43,size[2]*.35,.04):RAPIER.ColliderDesc.cuboid(size[0]*.45,size[1]*.47,size[2]*.45);
  const collider=this.world.createCollider(shape.setMass(mass).setFriction(part?.75:.6).setRestitution(part?.18:.25).setCollisionGroups(part?0x00010002:0x00020003).setActiveEvents(RAPIER.ActiveEvents.CONTACT_FORCE_EVENTS).setContactForceEventThreshold(120),body);
  const entity:Entity={id:this.nextId++,asset,body,collider,part,age:0,fuse:2.8,cooldown:0,previous:{...body.translation()},previousCenter:{...body.worldCom()},previousRotation:{...body.rotation()},previousVelocity:{x:0,y:0,z:0},previousSpin:0};
  this.entities.push(entity);this.byCollider.set(collider.handle,entity);return entity;
 }
 private createWassie(){
  this.rigJoints.length=0;
  const parts=characterParts.map(p=>{const [x,y]=bindPosition(p);const e=this.entity(p.asset,x,y,true,p.mass);e.rigPart=p.id;return e;});const torso=parts[0];
  for(let i=1;i<parts.length;i++){
   const spec=characterParts[i],part=parts[i],[x,y]=sourcePosition(spec.joint!),a=torso.body.translation(),b=part.body.translation();
   const joint=this.world.createImpulseJoint(RAPIER.JointData.revolute({x:x-a.x,y:y-a.y,z:0},{x:x-b.x,y:y-b.y,z:0},{x:0,y:0,z:1}),torso.body,part.body,true) as RAPIER.RevoluteImpulseJoint;
   joint.setLimits(...spec.limits!);this.rigJoints.push(joint);
  }
 }
 spawn(id:string,x=2,y=5):Entity|null{
  const tool=toolById(id);if(!tool)throw Error(`Unknown tool: ${id}`);
  if(this.entities.filter(e=>!e.part&&!e.held).length>=MAX_PROPS)return null;
  if(!Number.isFinite(x)||!Number.isFinite(y))throw Error('Invalid spawn coordinates');
  const half=volumes[id].size[1]/2;
  const e=this.entity(id,Math.max(-7.8,Math.min(7.8,x)),tool.fixed?half+.03:Math.max(half+.1,Math.min(8.5,y)),false,tool.mass,tool.fixed);
  e.tool=tool;e.collider.setRestitution(tool.restitution);e.collider.setFriction(tool.friction);this.interacted=true;return e;
 }
 private emit(type:GameEvent['type'],e:Entity,strength:number,key:string,detail:Partial<Pick<GameEvent,'position'|'direction'|'tool'|'speed'>>={}){const p=e.body.translation();const points=this.score.event(key,strength);this.onEvent({type,position:[p.x,p.y,p.z],strength,points,...detail});}
 blast(e:Entity){
  const p=e.body.translation();this.emit('blast',e,30,`blast-${e.id}`);
  let strongest=0;
  for(const other of this.entities){if(other===e)continue;const q=other.body.translation(),dx=q.x-p.x,dy=q.y-p.y,d=Math.hypot(dx,dy);if(d>5.6)continue;const power=(1-d/5.6)**1.2*25;
   if(other.tool?.behavior==='explosive')other.fuse=Math.min(other.fuse,.08);
   const mass=other.part?other.body.mass()*.65:1;
   if(!other.body.isFixed())other.body.applyImpulse({x:dx/(d||1)*power*mass,y:(dy/(d||1)+.65)*power*mass,z:0},true);
   if(other.part)strongest=Math.max(strongest,power);
  }
  if(strongest>0){this.damage.hit(strongest);this.damage.add('soot',7);this.impactCooldown=.12;}
  this.remove(e);
 }
 remove(e:Entity){if(this.swing?.entity===e){this.endSwing();return;}if(this.grab?.entity===e)this.release();this.byCollider.delete(e.collider.handle);this.world.removeRigidBody(e.body);this.entities=this.entities.filter(x=>x!==e);}
 beginGrab(e:Entity,point:Vec){
  if(e.held)return;this.endSwing();this.release();if(e.body.isFixed()||!point.every(Number.isFinite))return;this.interacted=true;this.damage.quiet=0;this.needsRecoveryAnchor=true;
  const p=e.body.translation(),q=e.body.rotation();const dx=point[0]-p.x,dy=point[1]-p.y;const angle=2*Math.atan2(q.z,q.w);
  const anchor={x:dx*Math.cos(angle)+dy*Math.sin(angle),y:-dx*Math.sin(angle)+dy*Math.cos(angle),z:0};
  const cursor=this.world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(point[0],point[1],0));
  const joint=this.world.createImpulseJoint(RAPIER.JointData.spring(0,520,48,anchor,{x:0,y:0,z:0}),e.body,cursor,true);
  this.grab={cursor,joint,target:point,entity:e};e.body.wakeUp();
 }
 moveGrab(point:Vec){if(this.grab&&point.every(Number.isFinite))this.grab.target=[Math.max(-8,Math.min(8,point[0])),Math.max(.15,Math.min(9,point[1])),0];}
 release(){if(!this.grab)return;this.world.removeImpulseJoint(this.grab.joint,true);this.world.removeRigidBody(this.grab.cursor);this.grab=undefined;}
 get grabbing(){return !!this.grab;}
 /** One dynamic tool attached at its handle; the cursor never teleports a collider. */
 beginSwing(id:string,point:Vec){
  this.endSwing();this.release();const tool=toolById(id);if(!tool?.held||!(id in heldProfiles)||!point.every(Number.isFinite))return;
  point=[clamp(point[0],-8,8),clamp(point[1],.3,8.5),0];const motion=new HeldMotion(id as HeldId),{anchorY,stiffness,damping}=motion.profile;
  const e=this.entity(id,point[0],point[1]-anchorY,false,tool.mass);e.tool=tool;e.held=true;e.collider.setRestitution(tool.restitution);e.body.setGravityScale(0,true);
  const cursor=this.world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(point[0],point[1],0));
  const joint=this.world.createImpulseJoint(RAPIER.JointData.spring(0,stiffness,damping,{x:0,y:anchorY,z:0},{x:0,y:0,z:0}),e.body,cursor,true);
  this.swing={cursor,joint,target:[...point],entity:e,motion};this.interacted=true;
 }
 moveSwing(point:Vec){if(this.swing&&point.every(Number.isFinite))this.swing.target=[clamp(point[0],-8,8),clamp(point[1],.3,8.5),0];}
 endSwing(){if(!this.swing)return;const {joint,cursor,entity}=this.swing;this.swing=undefined;this.world.removeImpulseJoint(joint,true);this.world.removeRigidBody(cursor);this.remove(entity);}
 get swinging(){return !!this.swing;}
 get heldTool(){return this.swing?.entity;}
 get swingMotion(){return this.swing?.motion;}
 get grounded(){return this.elapsed<this.supportUntil;}
 private updateSupport(){
  let height=-Infinity;
  for(const e of this.entities){if(!e.part)continue;const p=e.body.translation();
   this.world.contactPairsWith(e.collider,other=>{
    const parent=other.parent();if(parent&&Math.hypot(parent.linvel().x,parent.linvel().y)>1.2)return;
    this.world.contactPair(e.collider,other,manifold=>{
     if(Math.abs(manifold.normal().y)<.55)return;
     for(let i=0;i<manifold.numSolverContacts();i++){const point=manifold.solverContactPoint(i);if(point.y<p.y-.04&&manifold.solverContactDist(i)<.035)height=Math.max(height,point.y);}
    });
   });
  }
  if(Number.isFinite(height)){this.supportY=height;this.supportUntil=this.elapsed+.18;}
 }
 step(){
  const dt=STEP;this.elapsed+=dt;this.damage.tick(dt);this.score.tick(dt);this.impactCooldown=Math.max(0,this.impactCooldown-dt);this.world.gravity.y=-this.gravity;if(this.grab)this.damage.quiet=0;
  const torso=this.entities.find(p=>p.rigPart==='torso')!;
  this.airborneTime=this.grounded?0:this.airborneTime+dt;
  if(this.airborneTime>.5||this.damage.sequence!==this.lastDamageSequence)this.needsRecoveryAnchor=true;this.lastDamageSequence=this.damage.sequence;
  const speed=Math.hypot(torso.body.linvel().x,torso.body.linvel().y),stunned=this.damage.statuses.has('frozen')||this.damage.statuses.has('shocked');
  const recovering=!this.grab&&this.gravity>0&&!stunned&&this.grounded&&this.damage.quiet>2.8&&this.damage.amount<65&&speed<(this.recoveryTime>0?3:1.8);
  if(recovering){this.recoveryLost=0;if(this.recoveryTime===0){this.recoveryDuration=this.needsRecoveryAnchor?2.4:.65;this.recoveryHeight=torso.body.translation().y;const q=torso.body.rotation();this.recoveryAngle=angleDelta(2*Math.atan2(q.z,q.w));}this.recoveryTime+=dt;}
  else {this.recoveryLost+=dt;if(this.grab||stunned||this.damage.quiet<2.8||this.recoveryLost>.16)this.recoveryTime=0;}
  const ease=(t:number)=>t*t*t*(t*(t*6-15)+10),phase=recovering?Math.min(1,this.recoveryTime/this.recoveryDuration):0,blend=ease(phase);
  const pose=torso.body.translation(),rotation=torso.body.rotation(),head=this.entities.find(e=>e.rigPart==='head')!.body.translation();
  const upright=blend>.98&&speed<.2&&Math.abs(angleDelta(2*Math.atan2(rotation.z,rotation.w)))<.15&&Math.abs(pose.y-bindPosition(characterParts[0])[1]-this.supportY)<.1&&head.y>bindPosition(characterParts[1])[1]+this.supportY-.18;
  this.poseState=this.grab?'held':stunned?'stunned':!this.grounded?'airborne':blend>0?(upright?'standing':'rising'):'settling';
  if(recovering&&this.needsRecoveryAnchor){this.recoveryX=torso.body.translation().x;this.needsRecoveryAnchor=false;}
  for(const e of this.entities){e.previous={...e.body.translation()};e.previousCenter={...e.body.worldCom()};e.previousRotation={...e.body.rotation()};e.previousVelocity={...e.body.linvel()};e.previousSpin=e.body.angvel().z;e.age+=dt;e.cooldown=Math.max(0,e.cooldown-dt);
   if(e.part){
    e.body.setLinearDamping(this.damage.statuses.has('frozen')?6:.18);
    // Blend into a supported bind pose after a quiet moment, keeping bodies dynamic.
    const p=e.body.translation();
    if(e!==torso){const q=e.body.rotation(),tq=torso.body.rotation(),relative=2*Math.atan2(q.z,q.w)-2*Math.atan2(tq.z,tq.w),impulse=jointRestImpulse(relative,e.body.angvel().z-torso.body.angvel().z,e.body.principalInertia().z,stunned?5:(e.rigPart==='head'?3:2)+blend*3,dt);e.body.applyTorqueImpulse({x:0,y:0,z:impulse},true);torso.body.applyTorqueImpulse({x:0,y:0,z:-impulse},true);}
    if(blend>0){
     const q=e.body.rotation(),angle=2*Math.atan2(q.z,q.w),velocity=e.body.linvel();
     const spec=partForAsset(e.asset)!,[offset,targetY]=bindPosition(spec);
     // Lift through the torso rather than pulling six bodies independently into
     // place. The joint springs let the head and limbs follow with natural lag.
     if(e===torso){const mass=characterParts.reduce((sum,part)=>sum+part.mass,0),rise=ease(clamp((phase-.12)/.88,0,1)),height=this.recoveryHeight+(targetY+this.supportY-this.recoveryHeight)*rise;
      e.body.applyImpulse({x:clamp((this.recoveryX+offset-p.x)*12-velocity.x*7,-12,12)*mass*dt*blend,y:(clamp((height-p.y)*18-velocity.y*8,-16,16)+this.gravity)*mass*dt*blend,z:0},true);}
     const orientation=ease(clamp(phase/.85,0,1)),targetAngle=this.recoveryAngle*(1-orientation),inertia=e.body.principalInertia().z,frequency=e===torso?12:8,torque=clamp(-angleDelta(angle-targetAngle)*frequency**2-e.body.angvel().z*frequency*2,-60,60)*inertia;
     e.body.applyTorqueImpulse({x:0,y:0,z:torque*dt*blend},true);
    }
   }
   if(e.tool?.behavior==='rocket'&&e.age<2.5){const q=e.body.rotation(),angle=2*Math.atan2(q.z,q.w);e.body.applyImpulse({x:-Math.sin(angle)*.12,y:Math.cos(angle)*.12,z:0},true);}
   const v=e.body.linvel(),speed=Math.hypot(v.x,v.y);if(speed>26)e.body.setLinvel({x:v.x/speed*26,y:v.y/speed*26,z:0},true);const spin=e.body.angvel().z;if(Math.abs(spin)>18)e.body.setAngvel({x:0,y:0,z:Math.sign(spin)*18},true);
  }
  if(this.grab){const p=this.grab.cursor.translation(),target=this.grab.target;const dx=target[0]-p.x,dy=target[1]-p.y,d=Math.hypot(dx,dy),f=Math.min(1-Math.exp(-dt*28),12*dt/(d||1));this.grab.cursor.setNextKinematicTranslation({x:p.x+dx*f,y:p.y+dy*f,z:0});}
  if(this.swing){const s=this.swing,p=s.cursor.translation(),profile=s.motion.profile,dx=s.target[0]+s.motion.recoilX-p.x,dy=s.target[1]+s.motion.recoilY-p.y,d=Math.hypot(dx,dy),f=Math.min(1-Math.exp(-dt*profile.follow),profile.maxSpeed*dt/(d||1)),vx=dx*f/dt,vy=dy*f/dt;
   s.cursor.setNextKinematicTranslation({x:p.x+dx*f,y:p.y+dy*f,z:0});
   s.motion.tick(vx,vy,dt);if(s.motion.whoosh)this.onEvent({type:'swing',position:[p.x,p.y,0],strength:s.motion.speed,points:0,tool:s.entity.asset});const q=s.entity.body.rotation(),angle=2*Math.atan2(q.z,q.w),inertia=s.entity.body.principalInertia().z,freq=profile.torqueFrequency;
   s.entity.body.applyTorqueImpulse({x:0,y:0,z:clamp(angleDelta(s.motion.angle-angle)*freq*freq-s.entity.body.angvel().z*freq*1.7,-100,100)*inertia*dt},true);
  }
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
  if(this.swing){let touching=false;this.world.contactPairsWith(this.swing.entity.collider,other=>{if(!this.byCollider.get(other.handle)?.part)return;this.world.contactPair(this.swing!.entity.collider,other,m=>{for(let i=0;i<m.numSolverContacts();i++)if(m.solverContactDist(i)<.015)touching=true;});});this.swing.motion.contact(touching,dt);if(touching){this.damage.quiet=0;this.needsRecoveryAnchor=true;}}
  this.updateSupport();
  let impact:{entity:Entity;impulse:number;direction:Vec;incoming:Vec;point:Vec;key:string;other?:Entity;speed:number}|undefined;
  this.events.drainContactForceEvents(event=>{
   const a=this.byCollider.get(event.collider1()),b=this.byCollider.get(event.collider2());if(!this.interacted||(!a?.part&&!b?.part))return;
   const key=[event.collider1(),event.collider2()].sort().join(':');if((this.contacts.get(key)??-1)>this.elapsed)return;
   const impulse=event.totalForceMagnitude()*dt;if(impulse<2.8)return;
   const direction=event.maxForceDirection();let point:Vec=[(a??b!).body.translation().x,(a??b!).body.translation().y,0];
   this.world.contactPair(this.world.getCollider(event.collider1()),this.world.getCollider(event.collider2()),manifold=>{if(manifold.numSolverContacts()){const p=manifold.solverContactPoint(0);point=[p.x,p.y,p.z];}});
   const velocityAt=(e:Entity|undefined)=>{if(!e)return {x:0,y:0};const p=e.previousCenter;return {x:e.previousVelocity.x-e.previousSpin*(point[1]-p.y),y:e.previousVelocity.y+e.previousSpin*(point[0]-p.x)};};
   const va=velocityAt(a),vb=velocityAt(b);
   const approach=Math.abs((va.x-vb.x)*direction.x+(va.y-vb.y)*direction.y);
   if(approach<1.4)return;this.contacts.set(key,this.elapsed+.24);const e=a?.part?a:b!;
   const other=a?.part?b:a,characterMass=characterParts.reduce((sum,p)=>sum+p.mass,0),strength=impactStrength(impulse,approach,characterMass,other?.body.mass()??Infinity);
   // Planting a foot during an assisted rise is not a fresh injury. Significant
   // falls and contacts with moving props still interrupt recovery normally.
   if(this.recoveryTime>0&&this.damage.quiet>2.8&&(!other||other.body.isFixed())&&approach<3.5&&strength<7)return;
   if(other?.held&&!this.swing?.motion.ready)return;
   if(strength<2.8)return;
   const p=e.body.translation(),normal:[number,number,number]=[point[0]-p.x,point[1]-p.y,0],length=Math.hypot(...normal)||1;
   const incomingVelocity=a?.part?{x:vb.x-va.x,y:vb.y-va.y}:{x:va.x-vb.x,y:va.y-vb.y},incomingLength=Math.hypot(incomingVelocity.x,incomingVelocity.y)||1;
   if(!impact||strength>impact.impulse)impact={entity:e,impulse:strength,direction:normal.map(x=>x/length) as Vec,incoming:[incomingVelocity.x/incomingLength,incomingVelocity.y/incomingLength,0],point,key:`contact-${a?.id??0}-${b?.id??0}`,other,speed:approach};
  });
  // One collision episode produces one recoil; six rig colliders must not
  // multiply the damage or audio of the same landing.
  if(impact&&this.impactCooldown===0){
   const {entity,impulse,direction,incoming,point,key,other,speed}=impact,p=entity.body.translation(),q=entity.body.rotation(),angle=2*Math.atan2(q.z,q.w),dx=point[0]-p.x,dy=point[1]-p.y,size=volumes[entity.asset].size,lx=dx*Math.cos(angle)+dy*Math.sin(angle),ly=-dx*Math.sin(angle)+dy*Math.cos(angle),normalX=direction[0]*Math.cos(angle)+direction[1]*Math.sin(angle);
   const side=Math.abs(normalX)>.45;
   if(other?.held)this.swing?.motion.strike(impulse,incoming);
   const style=other?.asset==='mallet'?'heavy':other?.asset==='glove'?'punch':'impact';
   this.damage.hit(impulse,{region:entity.rigPart!,u:side?(point[2]-characterDepthOffset(entity.asset))/size[2]+.5:lx/size[0]+.5,v:.5-ly/size[1],normal:[direction[0],direction[1]],surface:side?(normalX>0?'right':'left'):'front',style});this.impactCooldown=.12;this.emit('impact',entity,impulse,key,{position:point,direction:incoming,tool:other?.asset,speed});
  }
  for(const [key,time]of this.contacts)if(time<this.elapsed)this.contacts.delete(key);
 }
 resetWassie(){this.endSwing();this.release();this.recoveryTime=0;this.recoveryLost=0;for(const e of [...this.entities])if(e.part)this.remove(e);this.contacts.clear();this.impactCooldown=0;this.needsRecoveryAnchor=false;this.recoveryX=0;this.airborneTime=0;this.supportUntil=0;this.supportY=0;this.lastDamageSequence=0;this.damage.reset();this.damage.quiet=6;this.createWassie();}
 resetRoom(){this.endSwing();this.release();this.recoveryTime=0;this.recoveryLost=0;for(const e of [...this.entities])this.remove(e);this.contacts.clear();this.impactCooldown=0;this.needsRecoveryAnchor=false;this.recoveryX=0;this.airborneTime=0;this.supportUntil=0;this.supportY=0;this.lastDamageSequence=0;this.score=new Score();this.damage.reset();this.damage.quiet=6;this.elapsed=0;this.interacted=false;this.createWassie();}
 save():Setup{return {version:1,props:this.entities.filter(e=>!e.part&&!e.held).map(e=>({asset:e.asset,x:e.body.translation().x,y:e.body.translation().y,angle:2*Math.atan2(e.body.rotation().z,e.body.rotation().w)}))};}
 load(value:unknown){
  const s=value as Setup;if(!s||s.version!==1||!Array.isArray(s.props)||s.props.length>MAX_PROPS||s.props.some(p=>!p||!toolById(p.asset)||![p.x,p.y,p.angle].every(Number.isFinite)))throw Error('This setup is invalid or belongs to a different version.');
  this.resetRoom();for(const p of s.props){const e=this.spawn(p.asset,p.x,p.y)!;e.body.setRotation({x:0,y:0,z:Math.sin(p.angle/2),w:Math.cos(p.angle/2)},true);}
 }
 dispose(){this.endSwing();this.release();this.events.free();this.world.free();}
}
export async function initPhysics(){await RAPIER.init();}
