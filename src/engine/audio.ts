export class Sound {
 private context?:AudioContext;muted=false;private last=0;
 unlock(){this.context??=new AudioContext();void this.context.resume();}
 play(type:string,strength:number){if(this.muted||!this.context||this.context.state!=='running')return;const c=this.context;if(c.currentTime-this.last<.065)return;this.last=c.currentTime;
  const osc=c.createOscillator(),gain=c.createGain();osc.type=type==='blast'?'sawtooth':type==='shock'?'square':'sine';const f=type==='blast'?80:type==='freeze'?700:type==='launch'?240:130;
  osc.frequency.setValueAtTime(f,c.currentTime);osc.frequency.exponentialRampToValueAtTime(Math.max(30,f*.25),c.currentTime+.18);gain.gain.setValueAtTime(Math.min(.12,.025+strength*.003),c.currentTime);gain.gain.exponentialRampToValueAtTime(.001,c.currentTime+.2);osc.connect(gain).connect(c.destination);osc.start();osc.stop(c.currentTime+.21);osc.onended=()=>{osc.disconnect();gain.disconnect();};
 }
}
