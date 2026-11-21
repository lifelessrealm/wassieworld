export type Status='soot'|'frozen'|'shocked'|'dizzy'|'flattened'|'bandaged';
export class DamageState {
  amount=0; quiet=0; statuses=new Map<Status,number>();
  get stage(){return this.amount<15?'unbothered':this.amount<40?'scuffed':this.amount<75?'dazed':'extremely unfortunate';}
  hit(impulse:number){ if(impulse<1.5)return 0; const damage=Math.min(30,impulse*1.2);this.amount=Math.min(100,this.amount+damage);this.quiet=0;if(damage>8)this.add('dizzy',3);if(damage>20)this.add('flattened',.8);return damage; }
  add(status:Status,seconds:number){this.statuses.set(status,Math.max(seconds,this.statuses.get(status)??0));}
  tick(dt:number){this.quiet+=dt;for(const [k,v]of this.statuses){if(v<=dt)this.statuses.delete(k);else this.statuses.set(k,v-dt);}if(this.quiet>5){this.amount=Math.max(0,this.amount-dt*7);if(this.amount>5)this.add('bandaged',1);}}
  reset(){this.amount=0;this.quiet=0;this.statuses.clear();}
}
export class Score {
  total=0;combo=0;window=0; best=0;private repeats=new Map<string,number>();
  event(key:string,strength:number){const n=this.repeats.get(key)??0;if(n>=8)return 0;const points=Math.round(Math.min(150,strength*8)/(1+n*.6));if(points<=0)return 0;this.repeats.set(key,n+1);this.combo=Math.min(8,this.combo+1);this.window=2.5;const earned=points*this.combo;this.total+=earned;this.best=Math.max(this.best,this.combo);return earned;}
  tick(dt:number){this.window-=dt;if(this.window<=0){this.combo=0;this.repeats.clear();}}
}
