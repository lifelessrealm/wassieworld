import * as T from 'three';
import {canonicalData} from '../assets/canonical-data.ts';
import {partForAsset,type RigPart} from '../assets/character.ts';
import {volumes} from '../assets/volumes.ts';
import {DamageState} from '../game/damage.ts';
import {createStack} from './stack.ts';

export type CharacterOverlay={mesh:T.InstancedMesh;effects:T.Group;canvas:HTMLCanvasElement;texture:T.CanvasTexture;mask:HTMLCanvasElement;part:RigPart;material:T.ShaderMaterial};
export function createCharacterOverlay(asset:string):CharacterOverlay|undefined {
 const spec=partForAsset(asset);if(!spec)return;const profile=canonicalData[spec.id],v=volumes[asset],part=spec.id;
 const canvas=document.createElement('canvas');canvas.width=part==='head'||part==='torso'?256:48;canvas.height=Math.round(canvas.width*v.size[1]/v.size[0]);
 const mask=document.createElement('canvas');mask.width=profile.width;mask.height=profile.height;
 const ctx=mask.getContext('2d')!,pixels=Uint8ClampedArray.from(atob(profile.pixels),c=>c.charCodeAt(0));ctx.putImageData(new ImageData(pixels,profile.width,profile.height),0,0);
 const texture=new T.CanvasTexture(canvas);texture.magFilter=T.NearestFilter;texture.minFilter=T.NearestFilter;texture.colorSpace=T.SRGBColorSpace;
 const material=new T.ShaderMaterial({transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-2,toneMapped:false,
  uniforms:{face:{value:texture},size:{value:new T.Vector3(...v.size)},soot:{value:0},frost:{value:0},shock:{value:0},clock:{value:0},bandage:{value:0},marks:{value:Array.from({length:6},()=>new T.Vector4(0,0,0,-1))},strengths:{value:new Float32Array(6)}},
  vertexShader:`varying vec3 localPoint; varying vec3 surfaceNormal;
   void main(){localPoint=position;surfaceNormal=normal;gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.);}`,
  fragmentShader:`uniform sampler2D face;uniform vec3 size;uniform float soot,frost,shock,clock,bandage;uniform vec4 marks[6];uniform float strengths[6];varying vec3 localPoint;varying vec3 surfaceNormal;
   void main(){vec3 n=normalize(surfaceNormal);vec2 uv=vec2(localPoint.x/size.x+.5,localPoint.y/size.y+.5);vec4 color=texture2D(face,uv);color.a*=smoothstep(.15,.7,n.z);
    float grime=soot*(.19+.16*(.5+.5*sin(localPoint.x*17.+localPoint.y*9.+localPoint.z*15.)));
    color.rgb=mix(color.rgb,vec3(.035,.045,.035),grime/(color.a+grime+.0001));color.a+=grime*(1.-color.a);
    if(frost>0.){float line=1.-smoothstep(.004,.014,abs(fract(dot(localPoint,vec3(1.9,2.8,-1.5)))-.5));float alpha=frost*(.24+line*.32);color.rgb=mix(color.rgb,vec3(.46,.78,.88),alpha/(color.a+alpha+.0001));color.a+=alpha*(1.-color.a);}
    for(int i=0;i<6;i++){vec4 mark=marks[i];if(mark.w<.5)continue;
     float weight=mark.w<1.5?smoothstep(.05,.7,-n.z):mark.w<2.5?smoothstep(.12,.75,-n.x):smoothstep(.12,.75,n.x);
     vec2 coord=mark.w<1.5?vec2(uv.x,1.-uv.y):vec2(localPoint.z/size.z+.5,1.-uv.y);vec2 delta=(coord-mark.xy)/vec2(.11,.07);
     float alpha=exp(-dot(delta,delta)*2.)*strengths[i]*.6*weight;
     vec3 ink=vec3(.27,.14,.32);if(bandage>.5&&abs(delta.x)<.8&&abs(delta.y)<.35){alpha=max(alpha,.9*weight);ink=vec3(.77,.66,.46);}
     color.rgb=mix(color.rgb,ink,alpha/(color.a+alpha+.0001));color.a+=alpha*(1.-color.a);
    }
    if(shock>0.){float zig=abs(fract(localPoint.y*7.+clock*.8)-.5)*.12;float line=1.-smoothstep(.006,.025,abs(fract((localPoint.x+localPoint.z)*2.)-.5-zig));float alpha=shock*line*.85;color.rgb=mix(color.rgb,vec3(.84,.96,.35),alpha);color.a+=alpha*(1.-color.a);}
    if(color.a<.002)discard;gl_FragColor=vec4(color.rgb,min(.9,color.a));
    #include <colorspace_fragment>
   }`});
 const mesh=createStack(asset);mesh.material=material;mesh.userData.damageOverlay=true;
 const effects=new T.Group();if(part==='head'){
  const shape=new T.Shape();for(let i=0;i<10;i++){const a=i*Math.PI/5,r=i%2?.025:.065;const x=Math.cos(a)*r,y=Math.sin(a)*r;if(i)shape.lineTo(x,y);else shape.moveTo(x,y);}shape.closePath();
  const geometry=new T.ExtrudeGeometry(shape,{depth:.015,bevelEnabled:false}),starMaterial=new T.MeshBasicMaterial({color:'#f0d978',toneMapped:false});
  for(let i=0;i<3;i++)effects.add(new T.Mesh(geometry,starMaterial));
 }
 return {mesh,effects,canvas,mask,texture,part,material};
}
export function paintCharacterOverlay(overlay:CharacterOverlay,damage:DamageState,time:number){
 const {canvas,mask,part}=overlay,ctx=canvas.getContext('2d')!,w=canvas.width,h=canvas.height;
 overlay.mesh.visible=damage.marks.some(m=>m.region===part)||['soot','frozen','shocked'].some(s=>damage.statuses.has(s as 'soot'|'frozen'|'shocked'))||(part==='head'&&(damage.blink>.01||damage.amount>40||damage.statuses.has('bandaged')));
 ctx.clearRect(0,0,w,h);ctx.save();ctx.scale(w,h);
 for(const mark of damage.marks){if(mark.region!==part||mark.surface!=='front')continue;ctx.fillStyle=`rgba(101,68,118,${mark.intensity*.63})`;ctx.beginPath();ctx.ellipse(mark.u,Math.max(part==='head'?.59:.1,mark.v),.065+mark.intensity*.03,.035+mark.intensity*.02,.2,0,Math.PI*2);ctx.fill();ctx.strokeStyle=`rgba(49,46,51,${mark.intensity*.6})`;ctx.lineWidth=.006;ctx.beginPath();ctx.moveTo(mark.u-.04,mark.v+.04);ctx.lineTo(mark.u-.015,mark.v+.065);ctx.moveTo(mark.u,mark.v+.04);ctx.lineTo(mark.u+.02,mark.v+.065);ctx.stroke();}
 if(part==='head'){
  // Landmarks are measured in the unchanged canonical PNG, then normalized into
  // the head crop. Eyelids and tears therefore stay attached to the actual eyes.
  const closed=damage.blink;
  if(closed>.04){for(const [u,v,rx,ry]of [[.49,.416,.177,.168],[.814,.416,.143,.16]]){ctx.save();ctx.beginPath();ctx.ellipse(u,v,rx,ry,0,0,7);ctx.clip();ctx.fillStyle='#5c8d3d';ctx.fillRect(u-rx,v-ry,rx*2,ry*2*closed);ctx.strokeStyle='#142015';ctx.lineWidth=.009;ctx.beginPath();ctx.moveTo(u-rx,v-ry+ry*2*closed);ctx.quadraticCurveTo(u,v-ry+ry*2*closed+.025,u+rx,v-ry+ry*2*closed);ctx.stroke();ctx.restore();}}
  if(damage.amount>40){ctx.strokeStyle='rgba(139,216,231,.9)';ctx.lineWidth=.012;for(const u of [.37,.89]){ctx.beginPath();ctx.moveTo(u,.57);ctx.quadraticCurveTo(u-.012,.65,u,.71+Math.sin(time*5)*.015);ctx.stroke();}}
 }
 const wound=damage.marks.find(m=>m.region===part&&m.surface==='front');if(damage.statuses.has('bandaged')&&wound){ctx.save();ctx.translate(wound.u,wound.v);ctx.rotate(-.35);ctx.fillStyle='#d4bb8b';ctx.fillRect(-.083,-.026,.166,.052);ctx.fillStyle='#eee0bd';ctx.fillRect(-.027,-.025,.054,.05);ctx.fillStyle='#a79370';for(const x of [-.059,.059])for(const y of [-.012,.012])ctx.fillRect(x,y,.006,.006);ctx.restore();}
 ctx.restore();ctx.globalCompositeOperation='destination-in';ctx.imageSmoothingEnabled=false;ctx.drawImage(mask,0,0,w,h);ctx.globalCompositeOperation='source-over';
 const uniforms=overlay.material.uniforms;uniforms.soot.value=Math.min(1,(damage.statuses.get('soot')??0)/1.2);uniforms.frost.value=Math.min(1,(damage.statuses.get('frozen')??0)/.5);uniforms.shock.value=Math.min(1,(damage.statuses.get('shocked')??0)/.25);uniforms.clock.value=time;uniforms.bandage.value=damage.statuses.has('bandaged')?1:0;
 const marks=damage.marks.filter(m=>m.region===part&&m.surface!=='front');for(let i=0;i<6;i++){const m=marks[i];(uniforms.marks.value[i] as T.Vector4).set(m?.u??0,m?.v??0,0,m?({back:1,left:2,right:3,front:0}[m.surface]):-1);uniforms.strengths.value[i]=m?.intensity??0;}
 overlay.effects.visible=part==='head'&&damage.statuses.has('dizzy');overlay.effects.children.forEach((star,i)=>{const a=time*3+i*Math.PI*2/3;star.position.set(Math.cos(a)*.63,uniforms.size.value.y*.52+Math.sin(a)*.045,.2+Math.sin(a)*.22);star.rotation.z=-a*.4;});
 overlay.texture.needsUpdate=true;
}
export function disposeCharacterOverlay(overlay?:CharacterOverlay){if(!overlay)return;overlay.mesh.dispose();overlay.material.dispose();overlay.texture.dispose();const star=overlay.effects.children[0] as T.Mesh|undefined;if(star){star.geometry.dispose();(star.material as T.Material).dispose();}}
