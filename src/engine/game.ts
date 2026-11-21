import * as T from 'three';
import {createStack,disposeStackCache} from './stack.ts';
import {Simulation,STEP,type Entity,type GameEvent} from '../game/simulation.ts';
import {volumes,type Vec} from '../assets/volumes.ts';
import {Sound} from './audio.ts';
type Visual={root:T.Group;mesh:T.InstancedMesh;shadow:T.Mesh;overlay?:T.Mesh;canvas?:HTMLCanvasElement;texture?:T.CanvasTexture;ice?:T.Mesh};
export class Game {
 readonly sim=new Simulation();readonly scene=new T.Scene();readonly camera=new T.OrthographicCamera();readonly renderer:T.WebGLRenderer;
 readonly sound=new Sound(); selected='grab';paused=false;timeScale=1;reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
 lab=false;labAsset='head';private labMesh?:T.InstancedMesh;private visuals=new Map<number,Visual>();private ray=new T.Raycaster();private plane=new T.Plane(new T.Vector3(0,0,1),0);private point=new T.Vector3();private pointer=new T.Vector2();private pointerId:number|null=null;private abort=new AbortController();private resize:ResizeObserver;private frame=0;private accumulator=0;private last=0;private frames=0;private fpsTime=0;fps=0;physicsMs=0;private shake=0;private particles:{mesh:T.Mesh;velocity:T.Vector3;life:number}[]=[];
 onChange=()=>{};onNotice=(text:string)=>{};onMetrics=()=>{};
 constructor(readonly host:HTMLElement){
  this.renderer=new T.WebGLRenderer({antialias:false,alpha:false,preserveDrawingBuffer:true});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));this.renderer.setClearColor('#263b35');this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.25;
  this.renderer.domElement.setAttribute('aria-label','Interactive WassieWorld physics chamber. Select a tool and click to place it, or drag Wassie.');this.renderer.domElement.tabIndex=0;host.prepend(this.renderer.domElement);
  this.scene.fog=new T.Fog('#263b35',28,52);this.camera.position.set(2.4,7.5,19);this.camera.lookAt(0,2.5,0);
  this.scene.add(new T.HemisphereLight('#f3f4cf','#34493d',2.5));const key=new T.DirectionalLight('#fff0cf',3.8);key.position.set(-5,9,6);this.scene.add(key);const rim=new T.DirectionalLight('#97d8cc',2.6);rim.position.set(5,6,-5);this.scene.add(rim);const lamp=new T.PointLight('#dcf895',18,12,2);lamp.position.set(-4,5,2);this.scene.add(lamp);
  this.room();this.sim.onEvent=e=>this.effect(e);
  this.resize=new ResizeObserver(()=>this.resizeView());this.resize.observe(host);this.resizeView();
  const canvas=this.renderer.domElement,signal=this.abort.signal;
  canvas.addEventListener('pointerdown',e=>{if(this.lab||this.pointerId!==null)return;this.sound.unlock();canvas.focus();const p=this.worldPoint(e);this.pointerId=e.pointerId;canvas.setPointerCapture(e.pointerId);
   if(this.selected==='grab'||this.selected==='delete'){
    this.ray.setFromCamera(this.pointer,this.camera);const hits=this.ray.intersectObjects([...this.visuals.values()].map(v=>v.mesh),false);const id=hits[0]?.object.userData.entity as number|undefined;const entity=this.sim.entities.find(x=>x.id===id);
    if(entity){if(this.selected==='delete'){if(!entity.part)this.sim.remove(entity);}else this.sim.beginGrab(entity,p);}
   }else{const entity=this.sim.spawn(this.selected,p[0],p[1]);if(!entity)this.onNotice('Chamber limit reached. Delete a prop or reset the room.');else this.onNotice(`${entity.tool!.name} deployed`);}
   this.onChange();
  },{signal});
  canvas.addEventListener('pointermove',e=>{if(this.pointerId===e.pointerId)this.sim.moveGrab(this.worldPoint(e));},{signal});
  const end=(e:PointerEvent)=>{if(e.pointerId!==this.pointerId)return;this.sim.release();this.pointerId=null;};for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,end as EventListener,{signal});
  window.addEventListener('blur',()=>{this.sim.release();this.pointerId=null;},{signal});
  document.addEventListener('visibilitychange',()=>{this.accumulator=0;this.last=0;if(document.hidden){this.sim.release();this.pointerId=null;}},{signal});
  canvas.addEventListener('wheel',e=>{e.preventDefault();this.camera.zoom=T.MathUtils.clamp(this.camera.zoom-e.deltaY*.001,.75,1.7);this.camera.updateProjectionMatrix();},{passive:false,signal});
  this.frame=requestAnimationFrame(t=>this.animate(t));
 }
 private box(w:number,h:number,d:number,color:string,x:number,y:number,z:number){const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshStandardMaterial({color,roughness:.85}));mesh.position.set(x,y,z);this.scene.add(mesh);return mesh;}
 private label(text:string,x:number,y:number,z:number,width:number,color='#d5e3ca',font='bold 60px monospace'){
  const c=document.createElement('canvas');c.width=1024;c.height=256;const ctx=c.getContext('2d')!;ctx.fillStyle=color;ctx.font=font;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,512,128);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;
  const mesh=new T.Mesh(new T.PlaneGeometry(width,width/4),new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false}));mesh.position.set(x,y,z);this.scene.add(mesh);return mesh;
 }
 private room(){
  this.box(18,.5,6,'#687d69',0,-.27,0);this.box(18,8,.25,'#344b41',0,3.8,-2.5);
  for(let x=-8.5;x<9;x+=1)for(let z=-2;z<3;z+=1)this.box(.98,.018,.98,(Math.round(x*2)+Math.round(z))%3===0?'#a6b498':'#95a78b',x,.001,z);
  this.box(18,.16,.3,'#293c33',0,.04,3);this.box(18,.09,.05,'#e0d46e',0,.14,3.17);
  for(const x of [-8.6,8.6]){this.box(.45,8,.7,'#455e4e',x,3.9,-2.1);this.box(.07,5,.08,'#d1e992',x,3.2,-1.71);}
  for(let x=-8;x<=8;x+=2){this.box(.025,7,.04,'#4c6553',x,3.5,-2.32);this.box(1.5,.055,.04,'#526b56',x,1.3,-2.32);}
  this.box(17,.12,.35,'#172b25',0,7,-2.2);this.box(12,.07,.12,'#d3e6a3',0,6.9,-1.98);
  this.label('W A S S I E   R E S E A R C H   D I V I S I O N',0,5.8,-2.32,12,'#7d9880','24px monospace');
  this.label('PLEASE REMAIN UNFORTUNATE.',0,4.85,-2.3,11,'#a6ba9b','bold 48px monospace');
  this.label('01',-6.7,3.1,-2.28,2.4,'#a8c38e','bold 120px monospace');
  this.label('TESTING CHAMBER',0,.03,2.3,5,'#334c39','bold 48px monospace').rotation.x=-Math.PI/2;
  for(let i=0;i<16;i++)this.box(.27,.02,.3,i%2?'#293d30':'#d0ca6a',-8+i*1.06,.021,2.9);
  const boxes=this.scene.children.filter((o):o is T.Mesh<T.BoxGeometry,T.MeshStandardMaterial>=>o instanceof T.Mesh&&o.geometry instanceof T.BoxGeometry);
  const batch=new T.InstancedMesh(new T.BoxGeometry(1,1,1),new T.MeshStandardMaterial({roughness:.85}),boxes.length);const m=new T.Matrix4();
  boxes.forEach((o,i)=>{const p=o.geometry.parameters;m.compose(o.position,o.quaternion,new T.Vector3(p.width,p.height,p.depth));batch.setMatrixAt(i,m);batch.setColorAt(i,o.material.color);this.scene.remove(o);o.geometry.dispose();o.material.dispose();});batch.computeBoundingSphere();this.scene.add(batch);
 }
 private resizeView(){const w=this.host.clientWidth,h=this.host.clientHeight;if(!w||!h)return;this.renderer.setSize(w,h);const aspect=w/h,height=Math.max(9.5,(w<600?11.5:19)/aspect);this.camera.left=-height*aspect/2;this.camera.right=height*aspect/2;this.camera.top=height/2;this.camera.bottom=-height/2;this.camera.near=.1;this.camera.far=70;this.camera.updateProjectionMatrix();}
 private worldPoint(e:PointerEvent):Vec{const r=this.renderer.domElement.getBoundingClientRect();this.pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);this.ray.setFromCamera(this.pointer,this.camera);this.ray.ray.intersectPlane(this.plane,this.point);return [T.MathUtils.clamp(this.point.x,-8,8),T.MathUtils.clamp(this.point.y,.3,9),0];}
 private visual(e:Entity):Visual{
  const root=new T.Group(),mesh=createStack(e.asset);mesh.userData.entity=e.id;root.add(mesh);this.scene.add(root);
  const shadow=new T.Mesh(new T.CircleGeometry(1,32),new T.MeshBasicMaterial({color:'#173126',transparent:true,opacity:.2,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.035;this.scene.add(shadow);
  const v:Visual={root,mesh,shadow};
  if(e.asset==='head'){
   const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;const texture=new T.CanvasTexture(canvas);texture.magFilter=T.NearestFilter;texture.minFilter=T.NearestFilter;texture.colorSpace=T.SRGBColorSpace;
   const overlay=new T.Mesh(new T.PlaneGeometry(1.45,1.43),new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false}));overlay.position.z=.51;overlay.renderOrder=2;root.add(overlay);
   const ice=new T.Mesh(new T.BoxGeometry(1.5,1.5,1.05),new T.MeshStandardMaterial({color:'#95edf5',transparent:true,opacity:.32,roughness:.25,metalness:.35}));root.add(ice);Object.assign(v,{canvas,texture,overlay,ice});
  }
  this.visuals.set(e.id,v);return v;
 }
 private paintDamage(v:Visual){if(!v.canvas)return;const ctx=v.canvas.getContext('2d')!,d=this.sim.damage;ctx.clearRect(0,0,128,128);
  if(d.amount>15){ctx.fillStyle='rgba(100,55,111,.7)';ctx.beginPath();ctx.ellipse(22,71,12,7,.3,0,Math.PI*2);ctx.fill();}
  if(d.statuses.has('soot')){ctx.fillStyle='rgba(20,30,26,.5)';for(const [x,y,r]of [[22,30,14],[99,78,14],[57,97,11],[100,13,10]]){ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();}}
  if(d.amount>40){ctx.strokeStyle='#93d8df';ctx.lineWidth=4;for(const x of [31,98]){ctx.beginPath();ctx.moveTo(x,58);ctx.lineTo(x,80+Math.sin(this.sim.elapsed*4)*6);ctx.stroke();}}
  if(d.statuses.has('bandaged')){ctx.save();ctx.translate(99,77);ctx.rotate(-.35);ctx.fillStyle='#e4cf9e';ctx.fillRect(-16,-6,32,12);ctx.fillStyle='#f8e6b8';ctx.fillRect(-5,-5,10,10);ctx.restore();}
  if(d.statuses.has('dizzy')){ctx.fillStyle='#f4dc6f';ctx.font='20px sans-serif';for(let i=0;i<3;i++){const a=this.sim.elapsed*3+i*2.1;ctx.fillText('✦',56+Math.cos(a)*42,13+Math.sin(a)*9);}}
  if(d.statuses.has('shocked')){ctx.strokeStyle='#e4fa99';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(8,20);ctx.lineTo(22,45);ctx.lineTo(10,43);ctx.lineTo(29,69);ctx.moveTo(110,13);ctx.lineTo(99,34);ctx.lineTo(116,31);ctx.lineTo(103,59);ctx.stroke();}
  v.ice!.visible=d.statuses.has('frozen');v.texture!.needsUpdate=true;
 }
 private effect(e:GameEvent){this.sound.play(e.type,e.strength);this.shake=this.reducedMotion?0:Math.min(.13,e.strength*.005);if(e.points)this.onNotice(`${e.type==='blast'?'UNSCHEDULED DISASSEMBLY':e.type==='freeze'?'BRAIN FREEZE':e.type==='shock'?'SHOCKING DEVELOPMENT':e.type==='launch'?'SPACE PROGRAM':'MINOR INCONVENIENCE'}  +${e.points}`);
  const count=this.reducedMotion?3:Math.min(20,Math.ceil(e.strength));for(let i=0;i<count&&this.particles.length<100;i++){const mesh=new T.Mesh(new T.BoxGeometry(.055,.055,.055),new T.MeshBasicMaterial({color:e.type==='blast'?'#efbb69':e.type==='freeze'?'#a4e4eb':'#d7e887'}));mesh.position.set(...e.position);this.scene.add(mesh);const angle=i*2.39996;this.particles.push({mesh,velocity:new T.Vector3(Math.cos(angle)*2,Math.sin(angle)*2+2,.7),life:.7});}this.onChange();
 }
 private animate(now:number){this.frame=requestAnimationFrame(t=>this.animate(t));const dt=this.last?Math.min((now-this.last)/1000,.08):0;this.last=now;this.frames++;this.fpsTime+=dt;
  if(this.fpsTime>.5){this.fps=Math.round(this.frames/this.fpsTime);this.frames=0;this.fpsTime=0;this.onMetrics();}
  if(!this.paused&&!this.lab&&!document.hidden){this.accumulator+=dt*this.timeScale;const start=performance.now();let steps=0;while(this.accumulator>=STEP&&steps<12){this.sim.step();this.accumulator-=STEP;steps++;}if(steps===12)this.accumulator=0;this.physicsMs=performance.now()-start;}else this.accumulator=0;
  const alpha=this.paused||this.lab?1:this.accumulator/STEP;
  const active=new Set(this.sim.entities.map(e=>e.id));for(const [id,v]of this.visuals)if(!active.has(id)){this.scene.remove(v.root,v.shadow);v.shadow.geometry.dispose();(v.shadow.material as T.Material).dispose();v.overlay?.geometry.dispose();(v.overlay?.material as T.Material|undefined)?.dispose();v.texture?.dispose();v.ice?.geometry.dispose();(v.ice?.material as T.Material|undefined)?.dispose();v.mesh.dispose();this.visuals.delete(id);}
  for(const e of this.sim.entities){const v=this.visuals.get(e.id)??this.visual(e),p=e.body.translation(),q=e.body.rotation();v.root.position.set(e.previous.x+(p.x-e.previous.x)*alpha,e.previous.y+(p.y-e.previous.y)*alpha,0);v.root.quaternion.copy(e.previousRotation as T.Quaternion).slerp(new T.Quaternion(q.x,q.y,q.z,q.w),alpha);v.root.visible=!this.lab;v.shadow.visible=!this.lab;v.shadow.position.x=p.x;v.shadow.scale.setScalar(Math.max(.2,volumes[e.asset].size[0]*.7));(v.shadow.material as T.MeshBasicMaterial).opacity=Math.max(.035,.22-p.y*.022);if(e.part){const squash=this.sim.damage.statuses.has('flattened')?.65:1;v.root.scale.set(1/squash,squash,1);this.paintDamage(v);}}
  for(const p of [...this.particles]){p.life-=dt;p.mesh.position.addScaledVector(p.velocity,dt);p.velocity.y-=dt*6;p.mesh.scale.setScalar(Math.max(0,p.life));if(p.life<=0){this.scene.remove(p.mesh);p.mesh.geometry.dispose();(p.mesh.material as T.Material).dispose();this.particles.splice(this.particles.indexOf(p),1);}}
  if(this.labMesh)this.labMesh.rotation.y+=dt*.25;
  this.shake*=.86;this.camera.setViewOffset(this.host.clientWidth,this.host.clientHeight,Math.sin(now*.08)*this.shake*35,Math.cos(now*.09)*this.shake*25,this.host.clientWidth,this.host.clientHeight);
  this.renderer.render(this.scene,this.camera);
 }
 setLab(enabled:boolean,asset=this.labAsset){this.lab=enabled;this.labAsset=asset;if(this.labMesh){this.scene.remove(this.labMesh);this.labMesh.dispose();this.labMesh=undefined;}if(enabled){this.labMesh=createStack(asset);this.labMesh.position.set(0,2.3,0);this.labMesh.scale.setScalar(2);this.scene.add(this.labMesh);}this.sim.release();this.onChange();}
 setSliceCount(count:number){if(this.labMesh){const ends=this.labMesh.userData.sliceEnds as number[];this.labMesh.userData.visibleVertices=ends[Math.max(0,Math.min(ends.length-1,count-1))];}}
 setQuality(level:string){this.renderer.setPixelRatio(level==='low'?1:Math.min(devicePixelRatio,level==='ultra'?2:1.5));this.resizeView();}
 resetCamera(){this.camera.zoom=1;this.camera.updateProjectionMatrix();}
 capture(){this.renderer.render(this.scene,this.camera);const a=document.createElement('a');a.download='wassieworld-experiment.png';a.href=this.renderer.domElement.toDataURL('image/png');a.click();}
 get metrics(){return {fps:this.fps,drawCalls:this.renderer.info.render.calls,triangles:this.renderer.info.render.triangles,bodies:this.sim.world.bodies.len(),physicsMs:+this.physicsMs.toFixed(2)};}
 dispose(){cancelAnimationFrame(this.frame);this.abort.abort();this.resize.disconnect();this.sim.dispose();disposeStackCache();this.renderer.dispose();}
}
