import * as T from 'three';
import {createStack,disposeStackCache} from './stack.ts';
import {Simulation,STEP,type Entity,type GameEvent} from '../game/simulation.ts';
import {volumes,type Vec} from '../assets/volumes.ts';
import {Sound} from './audio.ts';
import {ImpactFeedback} from './impact-feedback.ts';
import {characterParts,bindPosition} from '../assets/character.ts';
import {DamageState} from '../game/damage.ts';
import {toolById} from '../assets/catalog.ts';
import {cameraFrame,touchPair,type TouchPoint} from '../game/camera-framing.ts';
import {createCharacterOverlay,paintCharacterOverlay,disposeCharacterOverlay,type CharacterOverlay} from './character-effects.ts';
type Visual={root:T.Group;mesh:T.InstancedMesh;shadow:T.Mesh;overlay?:CharacterOverlay};
export class Game {
 readonly sim=new Simulation();readonly scene=new T.Scene();readonly camera=new T.OrthographicCamera();readonly renderer:T.WebGLRenderer;
 readonly sound=new Sound();private impactFeedback=new ImpactFeedback(this.scene);private selection='grab';paused=false;timeScale=1;reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
 private cursorTool?:T.InstancedMesh;private cursorPoint:Vec=[0,3,0];private pointerInside=false;
 private compactQuery=matchMedia('(max-width:760px), (pointer:coarse) and (max-width:1024px)');quality='medium';
 private cameraFocus=new T.Vector3(0,1.95,0);private cameraPan=new T.Vector2();private viewWidth=0;private viewHeight=0;
 private touches=new Map<number,TouchPoint>();private gestureActive=false;
 private gesture?:{x:number;y:number;distance:number;zoom:number;panX:number;panY:number;unitsX:number;unitsY:number};
 private pendingPlace?:{id:string;point:Vec;x:number;y:number};
 private blasts:{root:T.Group;ring:T.Mesh;flash:T.Mesh;light:T.PointLight;age:number}[]=[];
 lab=false;labAsset='character';labDamage=new DamageState();labTurntable=false;private labRoot?:T.Group;private labMesh?:T.InstancedMesh;private labOverlays:CharacterOverlay[]=[];private visuals=new Map<number,Visual>();private ray=new T.Raycaster();private plane=new T.Plane(new T.Vector3(0,0,1),0);private point=new T.Vector3();private pointer=new T.Vector2();private pointerId:number|null=null;private abort=new AbortController();private resize:ResizeObserver;private frame=0;private accumulator=0;private last=0;private frames=0;private fpsTime=0;fps=0;physicsMs=0;private shake=0;private hitStop=0;private particles:{mesh:T.Mesh;velocity:T.Vector3;life:number}[]=[];
 onChange=()=>{};onNotice=(text:string)=>{};onMetrics=()=>{};
 private labBackdrop?:T.Mesh;
 constructor(readonly host:HTMLElement){
  this.renderer=new T.WebGLRenderer({antialias:false,alpha:false,preserveDrawingBuffer:true});this.quality=this.compact?'low':'medium';this.renderer.setPixelRatio(this.compact?1:Math.min(devicePixelRatio,1.5));this.renderer.setClearColor('#263b35');this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.25;
  this.renderer.domElement.setAttribute('aria-label','Interactive WassieWorld physics chamber. Hold and drag to swing a mallet or glove, click to place other tools, or drag Wassie.');this.renderer.domElement.tabIndex=0;host.prepend(this.renderer.domElement);
  this.scene.fog=new T.Fog('#263b35',28,52);this.camera.position.set(2.4,7.5,19);this.camera.lookAt(0,2.5,0);
  this.scene.add(new T.HemisphereLight('#f3f4cf','#34493d',2.5));const key=new T.DirectionalLight('#fff0cf',3.8);key.position.set(-5,9,6);this.scene.add(key);const rim=new T.DirectionalLight('#97d8cc',2.6);rim.position.set(5,6,-5);this.scene.add(rim);const lamp=new T.PointLight('#dcf895',18,12,2);lamp.position.set(-4,5,2);this.scene.add(lamp);
  this.room();this.sim.onEvent=e=>this.effect(e);
  this.resize=new ResizeObserver(()=>this.resizeView());this.resize.observe(host);this.resizeView();
  const canvas=this.renderer.domElement,signal=this.abort.signal;
  this.compactQuery.addEventListener('change',()=>{this.suspendInput();this.resetCamera();this.resizeView();},{signal});
  canvas.addEventListener('contextmenu',e=>e.preventDefault(),{signal});
  canvas.addEventListener('pointerdown',e=>{
   if(e.pointerType==='touch'){this.touches.set(e.pointerId,{x:e.clientX,y:e.clientY});canvas.setPointerCapture(e.pointerId);if(this.touches.size>=2){this.cancelInteraction(false);this.pointerInside=false;this.gestureActive=true;const pair=touchPair([...this.touches.values()]);this.gesture={...pair,zoom:this.camera.zoom,panX:this.cameraPan.x,panY:this.cameraPan.y,unitsX:(this.camera.right-this.camera.left)/this.camera.zoom/this.host.clientWidth,unitsY:(this.camera.top-this.camera.bottom)/this.camera.zoom/this.host.clientHeight};return;}if(this.gestureActive)return;}
   if(this.lab||this.pointerId!==null)return;this.sound.unlock();canvas.focus({preventScroll:true});const p=this.worldPoint(e);this.pointerId=e.pointerId;canvas.setPointerCapture(e.pointerId);
   this.pointerInside=true;this.cursorPoint=p;
   if(toolById(this.selected)?.held){this.sim.beginSwing(this.selected,p);}
   else if(this.selected==='grab'||this.selected==='delete'){
    this.ray.setFromCamera(this.pointer,this.camera);const hits=this.ray.intersectObjects([...this.visuals.values()].map(v=>v.mesh),false);const id=hits[0]?.object.userData.entity as number|undefined;const entity=this.sim.entities.find(x=>x.id===id)??(e.pointerType==='touch'?this.touchEntity(e):undefined);
    if(entity){if(this.selected==='delete'){if(!entity.part)this.sim.remove(entity);}else this.sim.beginGrab(entity,p);}
   }else if(e.pointerType==='touch')this.pendingPlace={id:this.selected,point:p,x:e.clientX,y:e.clientY};else this.placeTool(this.selected,p);
   this.onChange();
  },{signal});
  canvas.addEventListener('pointermove',e=>{
   if(this.touches.has(e.pointerId))this.touches.set(e.pointerId,{x:e.clientX,y:e.clientY});
   if(this.gestureActive){if(this.gesture&&this.touches.size>=2){const pair=touchPair([...this.touches.values()]),g=this.gesture;this.camera.zoom=T.MathUtils.clamp(g.zoom*pair.distance/g.distance,.8,1.8);this.cameraPan.set(T.MathUtils.clamp(g.panX-(pair.x-g.x)*g.unitsX,-6,6),T.MathUtils.clamp(g.panY+(pair.y-g.y)*g.unitsY,-2,4));this.camera.updateProjectionMatrix();}return;}
   if(this.pendingPlace&&Math.hypot(e.clientX-this.pendingPlace.x,e.clientY-this.pendingPlace.y)>14)this.pendingPlace=undefined;
   this.cursorPoint=this.worldPoint(e);this.pointerInside=true;if(this.pointerId===e.pointerId){this.sim.moveGrab(this.cursorPoint);this.sim.moveSwing(this.cursorPoint);}
  },{signal});
  canvas.addEventListener('pointerleave',()=>{this.pointerInside=false;},{signal});
  const end=(e:PointerEvent)=>{if(e.type==='lostpointercapture'&&e.pointerId!==this.pointerId)return;this.touches.delete(e.pointerId);if(this.gestureActive){if(this.touches.size<2)this.gesture=undefined;if(this.touches.size===0)this.gestureActive=false;return;}if(e.pointerId!==this.pointerId)return;if(e.type==='pointerup'&&this.pendingPlace)this.placeTool(this.pendingPlace.id,this.worldPoint(e));this.cancelInteraction();if(e.pointerType==='touch'||e.type==='pointercancel')this.pointerInside=false;};for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,end as EventListener,{signal});
  window.addEventListener('blur',()=>this.suspendInput(),{signal});
  document.addEventListener('visibilitychange',()=>{this.accumulator=0;this.last=0;if(document.hidden)this.suspendInput();},{signal});
  canvas.addEventListener('wheel',e=>{e.preventDefault();this.camera.zoom=T.MathUtils.clamp(this.camera.zoom-e.deltaY*.001,.75,1.7);this.camera.updateProjectionMatrix();},{passive:false,signal});
  this.frame=requestAnimationFrame(t=>this.animate(t));
 }
 get compact(){return this.compactQuery.matches;}
 get selected(){return this.selection;}
 set selected(id:string){this.suspendInput();this.selection=id;if(this.cursorTool){this.scene.remove(this.cursorTool);this.cursorTool.dispose();this.cursorTool=undefined;}if(toolById(id)?.held){this.cursorTool=createStack(id);this.scene.add(this.cursorTool);}this.renderer.domElement.style.cursor=!this.lab&&toolById(id)?.held?'none':'';}
 private cancelInteraction(releaseCapture=true){const id=this.pointerId;this.pointerId=null;this.pendingPlace=undefined;this.sim.release();this.sim.endSwing();if(releaseCapture&&id!==null&&this.renderer.domElement.hasPointerCapture(id))this.renderer.domElement.releasePointerCapture(id);}
 suspendInput(){const ids=[...this.touches.keys()];this.touches.clear();this.gesture=undefined;this.gestureActive=false;this.cancelInteraction();this.pointerInside=false;for(const id of ids)if(this.renderer.domElement.hasPointerCapture(id))this.renderer.domElement.releasePointerCapture(id);}
 private placeTool(id:string,point:Vec){const entity=this.sim.spawn(id,point[0],point[1]);if(!entity)this.onNotice('Chamber limit reached. Delete a prop or reset the room.');else this.onNotice(`${entity.tool!.name} deployed`);this.onChange();}
 private touchEntity(event:PointerEvent){const r=this.renderer.domElement.getBoundingClientRect();let nearest:Entity|undefined,best=18;for(const entity of this.sim.entities){const p=entity.body.translation(),v=new T.Vector3(p.x,p.y,.2).project(this.camera),size=volumes[entity.asset].size,pixelsPerWorld=this.host.clientHeight/(this.camera.top-this.camera.bottom)*this.camera.zoom,dx=Math.max(0,Math.abs(event.clientX-(r.left+(v.x+1)*r.width/2))-size[0]*pixelsPerWorld*.4),dy=Math.max(0,Math.abs(event.clientY-(r.top+(1-v.y)*r.height/2))-size[1]*pixelsPerWorld*.4),distance=Math.hypot(dx,dy);if(distance<best){best=distance;nearest=entity;}}return nearest;}
 private box(w:number,h:number,d:number,color:string,x:number,y:number,z:number){const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshStandardMaterial({color,roughness:.85}));mesh.position.set(x,y,z);this.scene.add(mesh);return mesh;}
 private label(text:string,x:number,y:number,z:number,width:number,color='#d5e3ca',font='bold 60px monospace'){
  const c=document.createElement('canvas');c.width=1024;c.height=256;const ctx=c.getContext('2d')!;ctx.fillStyle=color;ctx.font=font;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,512,128);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;
  const mesh=new T.Mesh(new T.PlaneGeometry(width,width/4),new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false}));mesh.position.set(x,y,z);mesh.userData.chamberLabel=true;mesh.visible=!this.compact;this.scene.add(mesh);return mesh;
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
  boxes.forEach((o,i)=>{const p=o.geometry.parameters;m.compose(o.position,o.quaternion,new T.Vector3(p.width,p.height,p.depth));batch.setMatrixAt(i,m);batch.setColorAt(i,o.material.color);this.scene.remove(o);o.geometry.dispose();o.material.dispose();});batch.computeBoundingSphere();batch.userData.environment=true;this.scene.add(batch);
 }
 private resizeView(){const w=this.host.clientWidth,h=this.host.clientHeight;if(!w||!h)return;if(this.viewWidth&&(this.viewWidth!==w||this.viewHeight!==h))this.suspendInput();this.viewWidth=w;this.viewHeight=h;this.renderer.setSize(w,h);Object.assign(this.camera,cameraFrame(w,h,this.compact));this.camera.near=.1;this.camera.far=70;this.camera.updateProjectionMatrix();for(const object of this.scene.children)if(object.userData.chamberLabel)object.visible=!this.compact&&!this.lab;this.updateCompactCamera(1);}
 private updateCompactCamera(dt:number){if(!this.compact)return;if(this.lab){this.camera.position.set(this.cameraPan.x,1.8+this.cameraPan.y,19);this.camera.lookAt(this.cameraPan.x,1.8+this.cameraPan.y,0);return;}if(this.pointerId===null&&!this.gestureActive){const p=this.sim.entities.find(e=>e.rigPart==='torso')!.body.translation(),limit=Math.max(1,9-(this.camera.right-this.camera.left)/this.camera.zoom*.5);this.cameraFocus.lerp(new T.Vector3(T.MathUtils.clamp(p.x+.17,-limit,limit),T.MathUtils.clamp(p.y+.55,1.95,5.5),0),1-Math.exp(-dt*5));}const focus=this.cameraFocus.clone().add(new T.Vector3(this.cameraPan.x,this.cameraPan.y,0));this.camera.position.copy(focus).add(new T.Vector3(1.1,3.2,19));this.camera.lookAt(focus);}
 private worldPoint(e:PointerEvent):Vec{const r=this.renderer.domElement.getBoundingClientRect();this.pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);this.ray.setFromCamera(this.pointer,this.camera);this.ray.ray.intersectPlane(this.plane,this.point);return [T.MathUtils.clamp(this.point.x,-8,8),T.MathUtils.clamp(this.point.y,.3,9),0];}
 private visual(e:Entity):Visual{
  const root=new T.Group(),mesh=createStack(e.asset);mesh.userData.entity=e.id;root.add(mesh);this.scene.add(root);
  const shadow=new T.Mesh(new T.CircleGeometry(1,32),new T.MeshBasicMaterial({color:'#173126',transparent:true,opacity:.2,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.035;this.scene.add(shadow);
  const v:Visual={root,mesh,shadow};
  v.overlay=createCharacterOverlay(e.asset);if(v.overlay)root.add(v.overlay.mesh,v.overlay.effects);
  this.visuals.set(e.id,v);return v;
 }
 private disposeOverlay(overlay?:CharacterOverlay){disposeCharacterOverlay(overlay);}
 private effect(e:GameEvent){this.sound.play(e.type,e.strength,e.tool);if(e.type==='swing')return;if(e.type==='impact')this.impactFeedback.spawn(e,this.reducedMotion);this.shake=this.reducedMotion?0:Math.min(e.type==='blast'?.22:.1,e.strength*.006);if(!this.reducedMotion&&e.type==='impact'&&e.strength>8)this.hitStop=Math.min(e.tool==='mallet'?.052:e.tool==='glove'?.032:.045,e.strength*.0025);if(e.points)this.onNotice(`${e.type==='blast'?'UNSCHEDULED DISASSEMBLY':e.type==='freeze'?'BRAIN FREEZE':e.type==='shock'?'SHOCKING DEVELOPMENT':e.type==='launch'?'SPACE PROGRAM':'MINOR INCONVENIENCE'}  +${e.points}`);
  if(e.type==='blast'&&this.blasts.length<4){const root=new T.Group();root.name='blast-wave';root.position.set(...e.position);const ring=new T.Mesh(new T.RingGeometry(.94,1,64),new T.MeshBasicMaterial({color:'#ffd58a',transparent:true,opacity:.85,side:T.DoubleSide,depthWrite:false}));const flash=new T.Mesh(new T.IcosahedronGeometry(1,1),new T.MeshBasicMaterial({color:'#fff1b6',transparent:true,opacity:.9,depthWrite:false}));const light=new T.PointLight('#ffb856',35,8,2);root.add(ring,flash,light);this.scene.add(root);this.blasts.push({root,ring,flash,light,age:0});}
  const count=this.reducedMotion?3:e.type==='blast'?44:e.type==='impact'?8:Math.min(20,Math.ceil(e.strength));for(let i=0;i<count&&this.particles.length<100;i++){const blast=e.type==='blast',smoke=blast&&i%3===0,size=blast?(smoke?.28:.12):.055,mesh=new T.Mesh(new T.BoxGeometry(size,size,size),new T.MeshBasicMaterial({color:blast?(smoke?'#626756':i%2?'#efbb69':'#ee8248'):e.type==='freeze'?'#a4e4eb':e.type==='impact'?'#f0dfb6':'#d7e887',transparent:true}));mesh.name='effect-particle';mesh.position.set(...e.position);this.scene.add(mesh);const angle=i*2.39996,speed=blast?(smoke?2:4+i%4):2;const velocity=new T.Vector3(Math.cos(angle)*speed,Math.sin(angle)*speed+2,Math.sin(i*1.7)*(blast?2:.7));if(e.type==='impact'&&e.direction){velocity.x=e.direction[0]*(1.5+e.strength*.08)-e.direction[1]*Math.sin(angle)*1.6;velocity.y=e.direction[1]*(1.5+e.strength*.08)+e.direction[0]*Math.sin(angle)*1.6+.7;}this.particles.push({mesh,velocity,life:blast?1.3:.7});}this.onChange();
 }
 private animate(now:number){this.frame=requestAnimationFrame(t=>this.animate(t));const dt=this.last?Math.min((now-this.last)/1000,.08):0;this.last=now;this.frames++;this.fpsTime+=dt;
  if(this.fpsTime>.5){this.fps=Math.round(this.frames/this.fpsTime);this.frames=0;this.fpsTime=0;this.onMetrics();}
  const stopped=this.hitStop>0;this.hitStop=Math.max(0,this.hitStop-dt);
  if(!this.paused&&!this.lab&&!document.hidden&&!stopped){this.accumulator+=dt*this.timeScale;const start=performance.now();let steps=0;while(this.accumulator>=STEP&&steps<12){this.sim.step();this.accumulator-=STEP;steps++;if(this.hitStop>0){this.accumulator=0;break;}}if(steps===12)this.accumulator=0;this.physicsMs=performance.now()-start;}else this.accumulator=0;
  const alpha=this.paused||this.lab||this.hitStop>0?1:this.accumulator/STEP;
  const active=new Set(this.sim.entities.map(e=>e.id));for(const [id,v]of this.visuals)if(!active.has(id)){this.scene.remove(v.root,v.shadow);v.shadow.geometry.dispose();(v.shadow.material as T.Material).dispose();this.disposeOverlay(v.overlay);v.mesh.dispose();this.visuals.delete(id);}
  const torso=this.sim.entities.find(e=>e.rigPart==='torso')!.body.translation(),squash=this.sim.damage.deformation;
  const deform=new T.Matrix4().makeTranslation(torso.x,torso.y,0).multiply(new T.Matrix4().makeRotationZ(squash.angle)).multiply(new T.Matrix4().makeScale(squash.x,squash.y,1)).multiply(new T.Matrix4().makeRotationZ(-squash.angle)).multiply(new T.Matrix4().makeTranslation(-torso.x,-torso.y,0));
  for(const e of this.sim.entities){
   const v=this.visuals.get(e.id)??this.visual(e),p=e.body.translation(),q=e.body.rotation();v.root.position.set(e.previous.x+(p.x-e.previous.x)*alpha,e.previous.y+(p.y-e.previous.y)*alpha,0);v.root.quaternion.copy(e.previousRotation as T.Quaternion).slerp(new T.Quaternion(q.x,q.y,q.z,q.w),alpha);v.root.matrixAutoUpdate=false;v.root.matrix.compose(v.root.position,v.root.quaternion,new T.Vector3(1,1,1));if(e.part)v.root.matrix.premultiply(deform);v.root.matrixWorldNeedsUpdate=true;
   if(e.held&&e.asset==='glove'){const compression=this.sim.swingMotion?.compression??0;v.mesh.scale.set(1+compression*.35,1-compression,1+compression*.2);v.mesh.position.y=compression*.1;}v.root.visible=!this.lab;v.shadow.visible=!this.lab;v.shadow.position.x=p.x;v.shadow.scale.setScalar(Math.max(.2,volumes[e.asset].size[0]*.7));(v.shadow.material as T.MeshBasicMaterial).opacity=Math.max(.035,.22-p.y*.022);if(v.overlay)paintCharacterOverlay(v.overlay,this.sim.damage,this.sim.elapsed);
  }
  const effectsDt=this.paused||this.lab||stopped||this.hitStop>0?0:dt*this.timeScale;this.impactFeedback.tick(effectsDt,this.reducedMotion,!this.lab);
  if(this.cursorTool){this.cursorTool.visible=this.pointerInside&&!this.lab&&!this.sim.swinging;this.cursorTool.position.set(this.cursorPoint[0],this.cursorPoint[1]+(this.selected==='mallet'?.62:.28),.35);}
  for(const b of [...this.blasts]){b.age+=effectsDt;const t=b.age;b.root.visible=!this.lab;b.ring.scale.setScalar(this.reducedMotion?1.2:.25+Math.min(1,t/.55)*5.6);(b.ring.material as T.MeshBasicMaterial).opacity=(this.reducedMotion?.2:.8)*Math.max(0,1-t/.65);b.flash.scale.setScalar(this.reducedMotion?.45:.15+Math.sin(Math.min(1,t/.32)*Math.PI)*1.7);(b.flash.material as T.MeshBasicMaterial).opacity=(this.reducedMotion?.2:1)*Math.max(0,1-t/.32);b.light.intensity=this.reducedMotion?0:35*Math.max(0,1-t/.3);if(t>.7){this.scene.remove(b.root);b.ring.geometry.dispose();b.flash.geometry.dispose();(b.ring.material as T.Material).dispose();(b.flash.material as T.Material).dispose();b.light.dispose();this.blasts.splice(this.blasts.indexOf(b),1);}}
  for(const p of [...this.particles]){p.life-=effectsDt;p.mesh.position.addScaledVector(p.velocity,effectsDt);p.velocity.y-=effectsDt*6;p.mesh.scale.setScalar(Math.max(0,p.life));if(p.life<=0){this.scene.remove(p.mesh);p.mesh.geometry.dispose();(p.mesh.material as T.Material).dispose();this.particles.splice(this.particles.indexOf(p),1);}}
  if(this.labRoot){this.labDamage.tick(dt);if(this.labTurntable)this.labRoot.rotation.y+=dt*.25;for(const overlay of this.labOverlays)paintCharacterOverlay(overlay,this.labDamage,now/1000);const d=this.labDamage.deformation,p=bindPosition(characterParts[0]);const deformation=new T.Matrix4().makeTranslation(...p).multiply(new T.Matrix4().makeRotationZ(d.angle)).multiply(new T.Matrix4().makeScale(d.x,d.y,1)).multiply(new T.Matrix4().makeRotationZ(-d.angle)).multiply(new T.Matrix4().makeTranslation(-p[0],-p[1],0));this.labRoot.matrixAutoUpdate=false;this.labRoot.matrix.compose(this.labRoot.position,this.labRoot.quaternion,new T.Vector3(1,1,1)).multiply(deformation);this.labRoot.matrixWorldNeedsUpdate=true;}
  this.updateCompactCamera(dt);this.shake*=Math.exp(-dt*18);this.camera.setViewOffset(this.host.clientWidth,this.host.clientHeight,Math.sin(now*.08)*this.shake*35,Math.cos(now*.09)*this.shake*25,this.host.clientWidth,this.host.clientHeight);
  this.renderer.render(this.scene,this.camera);
 }
 setLab(enabled:boolean,asset=this.labAsset){
  this.suspendInput();this.cameraPan.set(0,0);this.lab=enabled;this.labAsset=asset;this.labDamage.reset();this.labTurntable=false;
  this.host.classList.toggle('studio',enabled);for(const object of this.scene.children)if(object.userData.environment)object.visible=!enabled;
  if(this.labBackdrop){this.scene.remove(this.labBackdrop);this.labBackdrop.geometry.dispose();(this.labBackdrop.material as T.Material).dispose();this.labBackdrop=undefined;}
  if(this.labRoot){this.scene.remove(this.labRoot);this.labRoot.traverse(o=>{if(o instanceof T.InstancedMesh&&!o.userData.damageOverlay)o.dispose();});for(const overlay of this.labOverlays)this.disposeOverlay(overlay);this.labOverlays=[];this.labRoot=undefined;this.labMesh=undefined;}
  if(enabled){
   const root=new T.Group();this.labRoot=root;root.position.z=4;
   const backdrop=new T.Mesh(new T.PlaneGeometry(80,80),new T.MeshBasicMaterial({color:'#dfe5d4',toneMapped:false}));backdrop.position.set(0,2,2.5);this.scene.add(backdrop);this.labBackdrop=backdrop;
   if(asset==='character'){for(const part of characterParts){const group=new T.Group();group.position.set(...bindPosition(part));group.add(createStack(part.asset));const overlay=createCharacterOverlay(part.asset);if(overlay){group.add(overlay.mesh,overlay.effects);this.labOverlays.push(overlay);}root.add(group);}}
   else {const mesh=createStack(asset);this.labMesh=mesh;mesh.position.y=1.8;root.add(mesh);const overlay=createCharacterOverlay(asset);if(overlay){overlay.mesh.position.y=1.8;overlay.effects.position.y=1.8;root.add(overlay.mesh,overlay.effects);this.labOverlays.push(overlay);}}
   this.scene.add(root);this.camera.position.set(0,1.8,19);this.camera.lookAt(0,1.8,0);this.camera.zoom=this.compact?1.15:2;
  }else {this.camera.position.set(2.4,7.5,19);this.camera.lookAt(0,2.5,0);this.camera.zoom=1;}
  this.camera.updateProjectionMatrix();this.cancelInteraction();this.renderer.domElement.style.cursor=!enabled&&toolById(this.selected)?.held?'none':'';this.onChange();
 }
 setLabAngle(angle:number){if(this.labRoot){this.labTurntable=false;this.labRoot.rotation.y=angle;}}
 setDamagePreview(preset:string){
  const d=this.labDamage;d.reset();if(preset==='light')d.hit(9,{region:'head',u:.26,v:.7});
  if(preset==='heavy'||preset==='combined'){d.hit(24);d.hit(24,{region:'torso',u:.6,v:.4});d.hit(22,{region:'head',u:.85,v:.66});d.add('dizzy',5);}
  if(preset==='frozen'||preset==='combined')d.add('frozen',5);
  if(preset==='shocked'||preset==='combined'){d.add('shocked',4);d.add('soot',6);}
  if(preset==='recovering'){d.hit(20);d.quiet=6;d.add('bandaged',5);}
  if(preset==='side'){d.hit(17,{region:'head',u:.55,v:.6,surface:'left',normal:[-1,0]});d.hit(14,{region:'torso',u:.5,v:.5,surface:'left',normal:[-1,0]});}
  if(preset==='rear'){d.hit(17,{region:'head',u:.5,v:.6,surface:'back'});d.hit(14,{region:'torso',u:.55,v:.5,surface:'back'});}
 }
 setSliceCount(count:number){if(this.labMesh){const ends=this.labMesh.userData.sliceEnds as number[];this.labMesh.userData.visibleVertices=ends[Math.max(0,Math.min(ends.length-1,count-1))];for(const overlay of this.labOverlays)overlay.mesh.userData.visibleVertices=this.labMesh.userData.visibleVertices;}}
 setQuality(level:string){this.quality=level;this.renderer.setPixelRatio(level==='low'?1:Math.min(devicePixelRatio,level==='ultra'?2:1.5));this.resizeView();}
 resetCamera(){this.suspendInput();this.cameraPan.set(0,0);this.camera.zoom=this.lab&&!this.compact?2:1;if(!this.compact&&!this.lab){this.camera.position.set(2.4,7.5,19);this.camera.lookAt(0,2.5,0);}this.updateCompactCamera(10);this.camera.updateProjectionMatrix();}
 capture(){this.renderer.render(this.scene,this.camera);const a=document.createElement('a');a.download='wassieworld-experiment.png';a.href=this.renderer.domElement.toDataURL('image/png');a.click();}
 get metrics(){return {fps:this.fps,drawCalls:this.renderer.info.render.calls,triangles:this.renderer.info.render.triangles,bodies:this.sim.world.bodies.len(),physicsMs:+this.physicsMs.toFixed(2)};}
 dispose(){cancelAnimationFrame(this.frame);this.abort.abort();this.resize.disconnect();this.cancelInteraction();this.cursorTool?.dispose();for(const b of this.blasts){b.ring.geometry.dispose();b.flash.geometry.dispose();(b.ring.material as T.Material).dispose();(b.flash.material as T.Material).dispose();b.light.dispose();}for(const p of this.particles){p.mesh.geometry.dispose();(p.mesh.material as T.Material).dispose();}for(const v of this.visuals.values()){this.disposeOverlay(v.overlay);v.mesh.dispose();v.shadow.geometry.dispose();(v.shadow.material as T.Material).dispose();}for(const overlay of this.labOverlays)this.disposeOverlay(overlay);this.impactFeedback.dispose();this.sound.dispose();this.sim.dispose();disposeStackCache();this.renderer.dispose();}
}
