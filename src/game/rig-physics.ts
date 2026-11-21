export const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
export const angleDelta=(v:number)=>Math.atan2(Math.sin(v),Math.cos(v));
/** Bound gameplay response using relative speed, reduced mass and measured impulse. */
export function impactStrength(measuredImpulse:number,approachSpeed:number,characterMass:number,otherMass:number){
 const reduced=Number.isFinite(otherMass)?characterMass*otherMass/(characterMass+otherMass):characterMass;
 return Math.min(28,measuredImpulse,approachSpeed*Math.sqrt(Math.max(.01,reduced)));
}
export function jointRestImpulse(angle:number,relativeSpeed:number,inertia:number,frequency:number,dt:number){
 const torque=-angleDelta(angle)*inertia*frequency**2-relativeSpeed*inertia*2*frequency*.85;
 return clamp(torque,-inertia*18,inertia*18)*dt;
}
