export type Status='soot'|'frozen'|'shocked'|'dizzy'|'flattened'|'bandaged';
export type ImpactLocation={region:'head'|'torso';u:number;v:number;direction?:number};
export type Bruise={u:number;v:number;region:ImpactLocation['region'];intensity:number;age:number};
const clamp=(v:number,min=0,max=1)=>Math.max(min,Math.min(max,v));
export class DamageState {
  amount=0; quiet=0; statuses=new Map<Status,number>();marks:Bruise[]=[];
  impactAge=10;impactStrength=0;impactDirection=1;sequence=0;
  get stage(){return this.amount<15?'unbothered':this.amount<40?'scuffed':this.amount<75?'dazed':'extremely unfortunate';}
  get expression(){return this.statuses.has('frozen')?'frozen':this.statuses.has('shocked')?'shocked':this.impactAge<.2?'wince':this.amount>60?'crying':this.statuses.has('dizzy')?'dizzy':this.quiet>5&&this.amount>5?'recovering':'neutral';}
  /** Damped recoil is driven by simulation time, so pause and slow motion agree. */
  get deformation(){
    const recoil=this.impactStrength*Math.exp(-this.impactAge*11)*Math.cos(this.impactAge*25);
    const remaining=this.statuses.get('flattened')??0;
    const flat=clamp(remaining/.35)*.18;
    const y=clamp(1-recoil*.13-flat,.65,1.13);
    return {x:1/Math.sqrt(y),y};
  }
  get blink(){return this.impactAge<.18?Math.sin(Math.PI*clamp(this.impactAge/.18)):0;}
  hit(impulse:number,location:ImpactLocation={region:'head',u:.28,v:.67}){
    if(!Number.isFinite(impulse)||impulse<1.5)return 0;
    const damage=Math.min(25,(impulse-1)*1.15);this.amount=clamp(this.amount+damage,0,100);this.quiet=0;
    this.impactAge=0;this.impactStrength=clamp(impulse/18);this.impactDirection=location.direction??1;this.sequence++;
    if(damage>8)this.add('dizzy',Math.min(4,1+damage*.09));if(damage>20)this.add('flattened',.65);
    if(damage>4){
      const u=clamp(location.u,.12,.9),v=clamp(location.v,.12,.85);
      const existing=this.marks.find(m=>m.region===location.region&&Math.hypot(m.u-u,m.v-v)<.15);
      if(existing){existing.intensity=clamp(existing.intensity+damage/45);existing.age=0;}
      else {this.marks.push({region:location.region,u,v,intensity:clamp(damage/30,.2,.8),age:0});if(this.marks.length>6)this.marks.shift();}
    }
    return damage;
  }
  add(status:Status,seconds:number){if(!Number.isFinite(seconds)||seconds<=0)return;this.statuses.set(status,Math.max(seconds,this.statuses.get(status)??0));}
  tick(dt:number){
    this.quiet+=dt;this.impactAge+=dt;
    for(const [k,v]of this.statuses){if(v<=dt)this.statuses.delete(k);else this.statuses.set(k,v-dt);}
    for(const mark of this.marks){mark.age+=dt;if(this.quiet>5)mark.intensity=Math.max(0,mark.intensity-dt*.055);}
    this.marks=this.marks.filter(m=>m.intensity>0);
    if(this.quiet>5){this.amount=Math.max(0,this.amount-dt*8);if(this.amount>5)this.add('bandaged',1);}
  }
  reset(){this.amount=0;this.quiet=0;this.statuses.clear();this.marks=[];this.impactAge=10;this.impactStrength=0;this.sequence=0;}
}
export class Score {
  total=0;combo=0;window=0; best=0;private repeats=new Map<string,number>();
  event(key:string,strength:number){const n=this.repeats.get(key)??0;if(n>=8)return 0;const points=Math.round(Math.min(150,strength*8)/(1+n*.6));if(points<=0)return 0;this.repeats.set(key,n+1);this.combo=Math.min(8,this.combo+1);this.window=2.5;const earned=points*this.combo;this.total+=earned;this.best=Math.max(this.best,this.combo);return earned;}
  tick(dt:number){this.window-=dt;if(this.window<=0){this.combo=0;this.repeats.clear();}}
}
