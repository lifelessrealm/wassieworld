import {angleDelta,clamp} from './rig-physics.ts';

export const heldProfiles={
 mallet:{anchorY:-.62,follow:24,maxSpeed:13,stiffness:820,damping:88,aimFrequency:7,torqueFrequency:8,style:'heavy' as const},
 glove:{anchorY:-.28,follow:44,maxSpeed:17,stiffness:900,damping:58,aimFrequency:16,torqueFrequency:13,style:'punch' as const},
};
export type HeldId=keyof typeof heldProfiles;

/** Fixed-step wrist give, tool aim and one hit per separated contact episode. */
export class HeldMotion {
 angle=0;speed=0;compression=0;recoilX=0;recoilY=0;whoosh=false;
 private spin=0;private squeezeVelocity=0;private kickX=0;private kickY=0;private idle=0;
 private separated=.2;private armed=true;
 private whooshCooldown=0;private lastHeading=0;
 constructor(readonly id:HeldId){}
 get profile(){return heldProfiles[this.id];}
 get ready(){return this.armed;}
 contact(touching:boolean,dt:number){this.separated=touching?0:this.separated+dt;if(this.separated>=.1)this.armed=true;}
 strike(strength:number,direction:readonly number[]){
  if(!this.armed)return false;this.armed=false;this.separated=0;
  const magnitude=clamp(strength,0,28)*(this.id==='glove'?.25:.16);
  this.kickX-=direction[0]*magnitude;this.kickY-=direction[1]*magnitude;
  this.spin+=direction[0]*(this.id==='mallet'?2.2:.65);
  if(this.id==='glove')this.squeezeVelocity+=Math.min(4,strength*.22);
  return true;
 }
 tick(vx:number,vy:number,dt:number){
  const speed=Math.hypot(vx,vy),heading=Math.atan2(vy,vx);this.whooshCooldown=Math.max(0,this.whooshCooldown-dt);this.whoosh=speed>5&&this.whooshCooldown===0&&(this.speed<3||Math.abs(angleDelta(heading-this.lastHeading))>Math.PI/2);if(this.whoosh){this.whooshCooldown=.25;this.lastHeading=heading;}
  this.speed+=(speed-this.speed)*(1-Math.exp(-dt*20));this.idle=speed<.7?this.idle+dt:0;
  const target=this.id==='mallet'?clamp(-vx*.11,-1.35,1.35):speed>1?Math.atan2(vy,vx)-Math.PI/2:this.idle>.3?0:this.angle;
  const steps=Math.max(1,Math.ceil(dt/(1/120))),h=dt/steps;
  for(let i=0;i<steps;i++){
   const f=this.profile.aimFrequency;this.spin+=(angleDelta(target-this.angle)*f*f-2*.85*f*this.spin)*h;this.spin=clamp(this.spin,-14,14);this.angle=angleDelta(this.angle+this.spin*h);
   this.kickX+=(-this.recoilX*15**2-2*.9*15*this.kickX)*h;this.kickY+=(-this.recoilY*15**2-2*.9*15*this.kickY)*h;
   this.recoilX=clamp(this.recoilX+this.kickX*h,-.3,.3);this.recoilY=clamp(this.recoilY+this.kickY*h,-.3,.3);
   this.squeezeVelocity+=(-this.compression*24**2-2*.7*24*this.squeezeVelocity)*h;this.compression=clamp(this.compression+this.squeezeVelocity*h,-.08,.3);
  }
 }
}
