import * as T from 'three';
import {compileVolume,volumes} from '../assets/volumes.ts';
import {characterDepthOffset} from '../assets/character.ts';
type Cached={geometry:T.BufferGeometry;material:T.MeshStandardMaterial;ends:number[]};
const cache=new Map<string,Cached>();
export function createStack(id:string):T.InstancedMesh {
 let c=cache.get(id);
 if(!c){
  const v=volumes[id];if(!v)throw Error(`Unknown volume ${id}`);
  const data=compileVolume(v),r=v.resolution,depth=v.depthResolution??r;
  const index=(x:number,y:number,z:number)=>((Math.floor(y/8)*depth+z)*data.width+(y%8)*r+x)*4;
  const occupied=(x:number,y:number,z:number)=>x>=0&&x<r&&y>=0&&y<v.layers&&z>=0&&z<depth&&data.color[index(x,y,z)+3]>0;
  const positions:number[]=[],colors:number[]=[],normals:number[]=[],inks:number[]=[],sideColors:number[]=[],ends:number[]=[];const color=new T.Color(),sideColor=new T.Color();
  const cell=[v.size[0]/r,v.size[1]/v.layers,v.size[2]/depth];
  const directions=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
  // Each occupied slice texel is extruded by the exact layer spacing. Emit only
  // exposed faces, so a tumbling stack has no gaps or hidden interior geometry.
  for(let y=0;y<v.layers;y++){
   for(let z=0;z<depth;z++)for(let x=0;x<r;x++){
    if(!occupied(x,y,z))continue;const i=index(x,y,z);color.setRGB(data.color[i]/255,data.color[i+1]/255,data.color[i+2]/255,T.SRGBColorSpace);sideColor.setRGB(data.sideColors[i]/255,data.sideColors[i+1]/255,data.sideColors[i+2]/255,T.SRGBColorSpace);
    for(const d of directions){if(occupied(x+d[0],y+d[1],z+d[2]))continue;
     const axis=d.findIndex(n=>n!==0),u=(axis+1)%3,w=(axis+2)%3;
     const center=[(x+.5)*cell[0]-v.size[0]/2,(y+.5)*cell[1]-v.size[1]/2,(z+.5)*cell[2]-v.size[2]/2];center[axis]+=d[axis]*cell[axis]/2;
     const corners=[[-1,-1],[1,-1],[1,1],[-1,1]];const order=d[axis]>0?[0,1,2,0,2,3]:[0,2,1,0,3,2];
     for(const j of order){const p=[...center];p[u]+=corners[j][0]*cell[u]/2;p[w]+=corners[j][1]*cell[w]/2;positions.push(...p);colors.push(color.r,color.g,color.b);normals.push(data.normals[i]/255*2-1,data.normals[i+1]/255*2-1,data.normals[i+2]/255*2-1);inks.push(data.edgeInk[i/4]);sideColors.push(sideColor.r,sideColor.g,sideColor.b);}
    }
   }ends.push(positions.length/3);
  }
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new T.Float32BufferAttribute(normals,3));geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));geometry.setAttribute('edgeInk',new T.Float32BufferAttribute(inks,1));geometry.setAttribute('sideColor',new T.Float32BufferAttribute(sideColors,3));geometry.computeBoundingSphere();
  const material=new T.MeshStandardMaterial({vertexColors:true,roughness:.9,metalness:v.reference?0:.025,toneMapped:!v.reference});
  material.onBeforeCompile=shader=>{
   if(v.reference){shader.vertexShader='attribute vec3 sideColor; varying vec3 surfaceColor; attribute float edgeInk; varying float inkFade; varying float referenceView; varying float frontness;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n referenceView=smoothstep(.2,.95,normalize((modelViewMatrix*vec4(0.,0.,1.,0.)).xyz).z);frontness=step(0.0,normal.z);surfaceColor=sideColor;inkFade=frontness*max(edgeInk,1.-smoothstep(.15,.7,normal.z))*(1.-smoothstep(.15,.75,normalize((modelViewMatrix*vec4(0.,0.,1.,0.)).xyz).z));');shader.fragmentShader='varying vec3 surfaceColor; varying float inkFade; varying float referenceView; varying float frontness;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>\n diffuseColor.rgb=mix(diffuseColor.rgb,surfaceColor,inkFade);`);}
   shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`${v.reference?'vec3 stableFront=mix(diffuseColor.rgb,clamp(outgoingLight,diffuseColor.rgb*.96,diffuseColor.rgb*1.35),.2);vec3 sculptedBack=mix(diffuseColor.rgb*.55,min(outgoingLight,diffuseColor.rgb*1.7),.65);outgoingLight=mix(sculptedBack,stableFront,frontness*referenceView);':''}
    float rim = abs(dot(normalize(vViewPosition), normal));
    ${v.reference?'outgoingLight*=mix(.78+.22*smoothstep(.02,.38,rim),1.,frontness);':'outgoingLight *= smoothstep(0.06, 0.25, rim) * 0.68 + 0.32;'}
    #include <opaque_fragment>`);
  };
  material.customProgramCacheKey=()=>`wassie-extruded-slice-v6-${!!v.reference}`;
  c={geometry,material,ends};cache.set(id,c);
 }
 // Reuse the same GPU geometry for repeated props. Set each inspection range
 // immediately before its draw, so partial laboratory slices remain independent.
 const mesh=new T.InstancedMesh(c.geometry,c.material,1);mesh.setMatrixAt(0,new T.Matrix4());mesh.computeBoundingSphere();mesh.userData.asset=id;mesh.userData.sliceEnds=c.ends;
 if(volumes[id].reference)mesh.position.z=characterDepthOffset(id);
 mesh.onBeforeRender=()=>mesh.geometry.setDrawRange(0,mesh.userData.visibleVertices??Infinity);return mesh;
}
export function disposeStackCache(){for(const c of cache.values()){c.geometry.dispose();c.material.dispose();}cache.clear();}
