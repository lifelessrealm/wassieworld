export class Sound {
 private context?:AudioContext;private noise?:AudioBuffer;muted=false;private last=-1;private lastType='';
 unlock(){this.context??=new AudioContext();void this.context.resume();}
 private noiseBurst(filterType:BiquadFilterType,frequency:number,gain:number,duration:number){
  const c=this.context!;if(!this.noise){this.noise=c.createBuffer(1,c.sampleRate,c.sampleRate);const data=this.noise.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;}
  const source=c.createBufferSource(),filter=c.createBiquadFilter(),envelope=c.createGain();source.buffer=this.noise;filter.type=filterType;filter.frequency.setValueAtTime(frequency,c.currentTime);filter.frequency.exponentialRampToValueAtTime(Math.max(65,frequency*.18),c.currentTime+duration);
  envelope.gain.setValueAtTime(.001,c.currentTime);envelope.gain.linearRampToValueAtTime(gain,c.currentTime+.004);envelope.gain.exponentialRampToValueAtTime(.001,c.currentTime+duration);source.connect(filter).connect(envelope).connect(c.destination);source.start();source.stop(c.currentTime+duration+.01);source.onended=()=>{source.disconnect();filter.disconnect();envelope.disconnect();};
 }
 play(type:string,strength:number,tool?:string){
  if(this.muted||!this.context||this.context.state!=='running')return;const c=this.context;
  // Contacts can interrupt a whoosh; pile-up sounds remain rate limited.
  if(c.currentTime-this.last<.05&&!(this.lastType==='swing'&&type!=='swing'))return;this.last=c.currentTime;this.lastType=type;
  if(type==='swing'){this.noiseBurst('bandpass',tool==='mallet'?550:1000,Math.min(.045,.012+strength*.002),tool==='mallet'?.14:.09);return;}
  const heavy=type==='impact'&&tool==='mallet',punch=type==='impact'&&tool==='glove',duration=heavy?.16:punch?.085:.2,f=heavy?95:punch?185:type==='blast'?80:type==='freeze'?700:type==='launch'?240:130;
  if(type==='blast')this.noiseBurst('lowpass',1600,.18,.85);
  if(heavy||punch)this.noiseBurst(heavy?'lowpass':'highpass',heavy?2100:1400,Math.min(.11,.04+strength*.003),heavy?.07:.035);
  const oscillator=c.createOscillator(),envelope=c.createGain();oscillator.type=type==='blast'?'sawtooth':type==='shock'?'square':heavy?'triangle':'sine';oscillator.frequency.setValueAtTime(f,c.currentTime);oscillator.frequency.exponentialRampToValueAtTime(Math.max(30,f*.28),c.currentTime+duration);envelope.gain.setValueAtTime(Math.min(.12,.025+strength*.003),c.currentTime);envelope.gain.exponentialRampToValueAtTime(.001,c.currentTime+duration);oscillator.connect(envelope).connect(c.destination);oscillator.start();oscillator.stop(c.currentTime+duration+.01);oscillator.onended=()=>{oscillator.disconnect();envelope.disconnect();};
 }
 dispose(){if(this.context)void this.context.close();this.context=undefined;this.noise=undefined;}
}
