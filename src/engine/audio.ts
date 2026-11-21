export class Sound {
 private context?:AudioContext;private noise?:AudioBuffer;muted=false;private last=0;
 unlock(){this.context??=new AudioContext();void this.context.resume();}
 play(type:string,strength:number){if(this.muted||!this.context||this.context.state!=='running')return;const c=this.context;if(c.currentTime-this.last<.065)return;this.last=c.currentTime;
  const osc=c.createOscillator(),gain=c.createGain();osc.type=type==='blast'?'sawtooth':type==='shock'?'square':'sine';const f=type==='blast'?80:type==='freeze'?700:type==='launch'?240:130;
  if(type==='blast'){
   // Original synthesized low-frequency rumble and filtered noise, no media fetch.
   if(!this.noise){this.noise=c.createBuffer(1,c.sampleRate,c.sampleRate);const data=this.noise.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;}
   const source=c.createBufferSource(),filter=c.createBiquadFilter(),rumble=c.createGain();source.buffer=this.noise;filter.type='lowpass';filter.frequency.setValueAtTime(1600,c.currentTime);filter.frequency.exponentialRampToValueAtTime(70,c.currentTime+.75);rumble.gain.setValueAtTime(.18,c.currentTime);rumble.gain.exponentialRampToValueAtTime(.001,c.currentTime+.85);source.connect(filter).connect(rumble).connect(c.destination);source.start();source.stop(c.currentTime+.9);source.onended=()=>{source.disconnect();filter.disconnect();rumble.disconnect();};
  }
  osc.frequency.setValueAtTime(f,c.currentTime);osc.frequency.exponentialRampToValueAtTime(Math.max(30,f*.25),c.currentTime+.18);gain.gain.setValueAtTime(Math.min(.12,.025+strength*.003),c.currentTime);gain.gain.exponentialRampToValueAtTime(.001,c.currentTime+.2);osc.connect(gain).connect(c.destination);osc.start();osc.stop(c.currentTime+.21);osc.onended=()=>{osc.disconnect();gain.disconnect();};
 }
}
