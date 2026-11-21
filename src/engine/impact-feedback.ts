import * as T from 'three';
import type {GameEvent} from '../game/simulation.ts';

type Burst={root:T.Group;core:T.Mesh;outline:T.Mesh;ring:T.Mesh;streaks:T.InstancedMesh;age:number;duration:number;size:number};
const star=(rays:number)=>{const shape=new T.Shape();for(let i=0;i<rays*2;i++){const a=i*Math.PI/rays,r=i%2?.42:1;if(i)shape.lineTo(Math.cos(a)*r,Math.sin(a)*r);else shape.moveTo(r,0);}shape.closePath();return new T.ShapeGeometry(shape);};

/** Contact-anchored, bounded presentation. No impulses or simulation timing here. */
export class ImpactFeedback {
 private heavy=star(7);private punch=star(5);private ringGeometry=new T.RingGeometry(.91,1,32);private streakGeometry=new T.BoxGeometry(1,1,.01);
 private bursts:Burst[]=[];
 constructor(private scene:T.Scene){}
 spawn(event:GameEvent,reduced:boolean){
  if(event.type!=='impact'||event.strength<3||this.bursts.length>=4)return;
  const heavy=event.tool==='mallet',root=new T.Group(),geometry=heavy?this.heavy:this.punch;
  root.name='strike-feedback';root.position.set(event.position[0],event.position[1],.68);root.rotation.z=Math.atan2(event.direction?.[1]??0,event.direction?.[0]??1);
  const material=(color:string,opacity=1)=>new T.MeshBasicMaterial({color,transparent:true,opacity,depthWrite:false,toneMapped:false});
  const core=new T.Mesh(geometry,material(heavy?'#fff0ae':'#fff9dc')),outline=new T.Mesh(geometry,material('#3b4a2e')),ring=new T.Mesh(this.ringGeometry,material('#f4e6ae',.7));
  outline.scale.setScalar(1.13);outline.position.z=-.005;core.position.z=.005;ring.position.z=-.01;
  const count=reduced?0:6,streaks=new T.InstancedMesh(this.streakGeometry,material('#f4e8be'),count),matrix=new T.Matrix4();
  for(let i=0;i<count;i++){const a=(i/count-.5)*Math.PI*1.7,position=new T.Vector3(Math.cos(a)*1.5,Math.sin(a)*1.5,0);matrix.compose(position,new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),a),new T.Vector3(.35+(i%2)*.2,.035,1));streaks.setMatrixAt(i,matrix);}streaks.computeBoundingSphere();
  root.add(outline,core,ring,streaks);this.scene.add(root);
  const size=(heavy?.24:.18)+Math.min(28,event.strength)*.006;root.scale.setScalar(reduced?size*.55:size);
  this.bursts.push({root,core,outline,ring,streaks,age:0,duration:heavy?.24:.17,size});
 }
 tick(dt:number,reduced:boolean,visible:boolean){for(const b of [...this.bursts]){
  b.age+=dt;const t=Math.min(1,b.age/b.duration),alpha=(1-t)**.7;b.root.visible=visible;b.root.scale.setScalar(b.size*(reduced?.55:1+Math.sin(t*Math.PI)*.25));
  b.core.scale.setScalar(1-t*.65);b.outline.scale.setScalar((1-t*.65)*1.13);b.ring.scale.setScalar(reduced?1:1+t*1.5);b.streaks.scale.setScalar(1+t*.7);
  for(const mesh of [b.core,b.outline,b.ring,b.streaks])(mesh.material as T.MeshBasicMaterial).opacity=alpha*(reduced?.45:1);
  if(t>=1)this.remove(b);
 }}
 private remove(b:Burst){this.scene.remove(b.root);for(const mesh of [b.core,b.outline,b.ring,b.streaks])(mesh.material as T.Material).dispose();b.streaks.dispose();this.bursts.splice(this.bursts.indexOf(b),1);}
 dispose(){for(const b of [...this.bursts])this.remove(b);for(const geometry of [this.heavy,this.punch,this.ringGeometry,this.streakGeometry])geometry.dispose();}
}
