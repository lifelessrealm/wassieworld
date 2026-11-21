import {canonicalData} from './canonical-data.ts';
export type Vec = [number, number, number];
export type Primitive = { shape: 'ellipsoid' | 'box'; center: Vec; size: Vec; color: string };
export type Volume = { id: string; size: Vec; resolution: number; layers: number; parts: Primitive[]; reference?:keyof typeof canonicalData };
const e = (center: Vec, size: Vec, color: string): Primitive => ({ shape: 'ellipsoid', center, size, color });
const b = (center: Vec, size: Vec, color: string): Primitive => ({ shape: 'box', center, size, color });
const green = '#5e8e3d', ink = '#17241b', cream = '#f5f1d8', steel = '#869c9b', red = '#e56d53', wood = '#bc8756';
const volume = (id: string, size: Vec, parts: Primitive[], layers = 48, resolution = 48): Volume => ({ id, size, parts, layers, resolution });
export const volumes: Record<string, Volume> = {
  torso: {...volume('torso', [1.34, 1.86, .7], [], 80,64),reference:'torso'},
  head: volume('head', [1.48, 1.43, 1.03], [
    e([0,0,-.08],[.69,.65,.4],green), e([-.27,.4,-.05],[.4,.28,.37],green),e([.28,.4,-.05],[.37,.26,.37],green),
    e([-.31,.12,.267],[.36,.4,.2],ink),e([.31,.12,.267],[.34,.39,.2],ink),
    e([-.31,.12,.29],[.332,.369,.19],cream),e([.31,.12,.29],[.313,.36,.19],cream),
    e([-.26,.12,.442],[.202,.24,.046],'#080e0b'),e([.34,.12,.442],[.195,.23,.046],'#080e0b'),
    e([-.32,.22,.482],[.044,.05,.016],'#ffffff'),e([-.18,.12,.483],[.065,.07,.015],'#ffffff'),
    e([.28,.22,.482],[.04,.045,.016],'#ffffff'),e([.42,.12,.483],[.06,.065,.015],'#ffffff'),
    e([-.32,.49,.283],[.39,.075,.075],ink),e([.31,.49,.283],[.36,.075,.075],ink),
    e([-.32,.52,.29],[.39,.064,.07],green),e([.31,.52,.29],[.36,.064,.07],green),
    e([0,-.39,.29],[.65,.12,.12],ink),e([0,-.39,.322],[.619,.09,.12],'#b66e57'),
    e([0,-.395,.427],[.57,.014,.012],'#482b23')
  ], 64,64),
  arm: volume('arm',[.26,1.25,.32],[e([0,0,0],[.12,.61,.14],green)],48,32),
  foot: volume('foot',[.5,.25,.64],[e([0,0,0],[.23,.11,.3],ink),e([0,.025,.02],[.21,.09,.28],cream),b([-.13,-.01,.21],[.09,.06,.1],cream),b([.13,-.01,.21],[.09,.06,.1],cream)],16,32),
  mallet: volume('mallet',[1.2,1.5,.65],[b([0,-.32,0],[.09,.41,.09],wood),b([0,.38,0],[.57,.29,.29],steel),b([-.49,.38,0],[.07,.31,.31],'#c4d4ca'),b([.49,.38,0],[.07,.31,.31],'#c4d4ca')]),
  glove: volume('glove',[.95,1.05,.8],[b([0,-.34,0],[.27,.17,.28],cream),e([0,.13,0],[.44,.39,.36],red),e([-.29,-.02,.14],[.16,.23,.24],'#bd453d')]),
  anvil: volume('anvil',[1.5,.9,.75],[b([0,-.31,0],[.55,.12,.34],steel),b([0,0,0],[.24,.3,.24],'#4f6565'),b([-.1,.29,0],[.56,.14,.32],steel),e([.5,.28,0],[.23,.12,.23],steel)]),
  crate: volume('crate',[1,1,1],[b([0,0,0],[.46,.46,.46],wood),b([-.36,0,.47],[.06,.48,.025],'#795233'),b([.36,0,.47],[.06,.48,.025],'#795233'),b([0,.36,.47],[.46,.06,.025],'#e7b783'),b([0,-.36,.47],[.46,.06,.025],'#e7b783')]),
  bomb: volume('bomb',[.85,1.02,.85],[e([0,-.08,0],[.39,.39,.39],'#354344'),b([0,.34,0],[.12,.09,.12],steel),b([.05,.45,0],[.03,.06,.03],'#efbe65')]),
  rocket: volume('rocket',[.65,1.5,.65],[e([0,.06,0],[.25,.63,.25],cream),e([0,.57,0],[.24,.17,.24],red),b([0,-.4,0],[.3,.13,.1],red),b([0,-.4,0],[.1,.13,.3],red),e([0,.08,.23],[.13,.17,.04],'#62bdc6')]),
  spring: volume('spring',[1.15,.64,.85],[b([0,-.24,0],[.54,.07,.38],'#495f5e'),b([0,.25,0],[.54,.06,.38],'#d9e96a'),...[-.14,0,.14].map(y=>b([0,y,0],[.26,.025,.22],steel))],32),
  fan: volume('fan',[1.2,1.8,.6],[b([0,-.8,0],[.48,.08,.25],steel),b([0,-.4,0],[.08,.4,.08],steel),e([0,.28,0],[.56,.56,.23],'#374d4a'),e([0,.28,.2],[.48,.48,.05],'#84b8a6'),b([0,.28,.26],[.065,.45,.025],cream),b([0,.28,.27],[.45,.065,.025],cream),e([0,.28,.29],[.13,.13,.04],steel)]),
  freeze: volume('freeze',[.72,1.1,.72],[e([0,0,0],[.32,.49,.32],'#9bdce3'),b([0,.44,0],[.24,.08,.24],steel),b([0,-.44,0],[.24,.08,.24],steel),b([0,0,.32],[.14,.19,.025],cream)]),
  tesla: volume('tesla',[.84,1.4,.84],[b([0,-.57,0],[.39,.1,.39],'#384c49'),b([0,-.05,0],[.15,.46,.15],'#ab7e52'),...[-.3,-.1,.1,.3].map(y=>e([0,y,0],[.25,.045,.25],steel)),e([0,.49,0],[.36,.18,.36],'#a2c9c4')])
};
// Front identity comes from the canonical drawing. Its silhouette is converted
// into a depth field, then sampled as a coherent 3D volume, not scaled 2D copies.
volumes.head={...volume('head',[1.58,1.32,1.02],[],64,64),reference:'head'};
volumes.foot={...volume('foot',[.46,.38,.68],[],24,48),reference:'leftFoot'};
volumes.rightFoot={...volume('rightFoot',[.64,.35,.68],[],24,48),reference:'rightFoot'};
const profiles=new Map<string,{width:number;height:number;bytes:Uint8Array;bounds:[number,number][]}>();
function getProfile(key:keyof typeof canonicalData){
 let p=profiles.get(key);if(p)return p;const d=canonicalData[key],bytes=Uint8Array.from(atob(d.pixels),c=>c.charCodeAt(0)),bounds:[number,number][]=[];
 for(let y=0;y<d.height;y++){let left=d.width,right=-1;for(let x=0;x<d.width;x++)if(bytes[(y*d.width+x)*4+3]){left=Math.min(left,x);right=Math.max(right,x);}bounds.push([left,right]);}
 p={width:d.width,height:d.height,bytes,bounds};profiles.set(key,p);return p;
}
function referenceSample(v:Volume,point:Vec):{color:string;normal:Vec}|null{
 const p=getProfile(v.reference!),x=Math.floor((point[0]/v.size[0]+.5)*p.width),y=Math.floor((.5-point[1]/v.size[1])*p.height);
 if(x<0||x>=p.width||y<0||y>=p.height)return null;const i=(y*p.width+x)*4;if(!p.bytes[i+3])return null;
 const depthAt=(px:number,py:number)=>{const [l,r]=p.bounds[Math.max(0,Math.min(p.height-1,py))];const center=(l+r)/2,radius=Math.max(1,(r-l+1)/2);const t=(px-center)/radius;return v.size[2]*.47*Math.sqrt(Math.max(.035,1-t*t));};
 const depth=depthAt(x,y);if(Math.abs(point[2])>depth)return null;
 const nx=-(depthAt(x+1,y)-depthAt(x-1,y))/(2*v.size[0]/p.width),ny=(depthAt(x,y+1)-depthAt(x,y-1))/(2*v.size[1]/p.height),nz=Math.sign(point[2])||1;
 const n:Vec=[nx,ny,nz];const length=Math.hypot(...n);const painted=point[2]>depth*.35||v.id.toLowerCase().includes('foot');
 const color=painted?'#'+[...p.bytes.slice(i,i+3)].map(v=>v.toString(16).padStart(2,'0')).join(''):green;
 return {color,normal:n.map(x=>x/length) as Vec};
}

export function distance(p: Vec, part: Primitive): number {
  const q = p.map((v,i)=>Math.abs(v-part.center[i])) as Vec;
  if (part.shape==='ellipsoid') return (Math.hypot(...q.map((v,i)=>v/part.size[i]))-1)*Math.min(...part.size);
  return Math.max(...q.map((v,i)=>v-part.size[i]));
}
export function sample(v: Volume,p: Vec): {color:string;normal:Vec}|null {
  if(v.reference)return referenceSample(v,p);
  // Ordered CSG paint volumes: later shapes color the interior of their intersection.
  let found: Primitive|undefined;
  for (const part of v.parts) if(distance(p,part)<=0) found=part;
  if (!found) return null;
  let n: Vec;
  if(found.shape==='ellipsoid') n=p.map((x,i)=>(x-found!.center[i])/(found!.size[i]**2)) as Vec;
  else { const q=p.map((x,i)=>Math.abs(x-found!.center[i])-found!.size[i]); const axis=q.indexOf(Math.max(...q)); n=[0,0,0]; n[axis]=Math.sign(p[axis]-found.center[axis])||1; }
  const l=Math.hypot(...n)||1; return {color:found.color,normal:n.map(x=>x/l) as Vec};
}
export function compileVolume(v: Volume) {
  const cols=8, rows=Math.ceil(v.layers/cols), width=v.resolution*cols, height=v.resolution*rows;
  const color=new Uint8Array(width*height*4), normals=new Uint8Array(width*height*4); let occupied=0;
  for(let y=0;y<v.layers;y++) for(let z=0;z<v.resolution;z++) for(let x=0;x<v.resolution;x++) {
    const p:Vec=[((x+.5)/v.resolution-.5)*v.size[0],((y+.5)/v.layers-.5)*v.size[1],((z+.5)/v.resolution-.5)*v.size[2]];
    const s=sample(v,p); if(!s) continue;
    const i=(((Math.floor(y/cols)*v.resolution+z)*width)+(y%cols)*v.resolution+x)*4;
    const c=parseInt(s.color.slice(1),16);color.set([c>>16,(c>>8)&255,c&255,255],i);
    normals.set([...s.normal.map(n=>Math.round((n*.5+.5)*255)),255],i); occupied++;
  }
  return {color,normals,width,height,occupied,metadata:{id:v.id,size:v.size,layers:v.layers,resolution:v.resolution,columns:cols,rows,spacing:v.size[1]/v.layers,pivot:[0,0,0],axis:'Y',filter:'nearest',source:`src/assets/volumes.ts#${v.id}`}};
}
