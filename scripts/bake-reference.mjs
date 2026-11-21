import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {PNG} from 'pngjs';
import {characterParts,armMasks} from '../src/assets/character.ts';
const png=PNG.sync.read(await readFile('public/references/wassie-canonical.png'));
const exterior=new Uint8Array(png.width*png.height),queue=[];
const white=i=>png.data[i*4]>230&&png.data[i*4+1]>230&&png.data[i*4+2]>230;
const enqueue=(x,y)=>{if(x<2||x>=png.width-2||y<2||y>=png.height-2)return;const i=y*png.width+x;if(exterior[i]||!white(i))return;exterior[i]=1;queue.push(i);};
for(let x=2;x<png.width-2;x++){enqueue(x,2);enqueue(x,png.height-3);}for(let y=2;y<png.height-2;y++){enqueue(2,y);enqueue(png.width-3,y);}
for(let j=0;j<queue.length;j++){const i=queue[j],x=i%png.width,y=Math.floor(i/png.width);enqueue(x-1,y);enqueue(x+1,y);enqueue(x,y-1);enqueue(x,y+1);}
const inside=(x,y,polygon)=>{let hit=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const [a,b]=polygon[i],[c,d]=polygon[j];if((b>y)!==(d>y)&&x<(c-a)*(y-b)/(d-b)+a)hit=!hit;}return hit;};
const profiles={};
for(const part of characterParts){
 const [left,top,right,bottom]=part.crop,width=Math.round((right-left)/4),height=Math.round((bottom-top)/4),bytes=new Uint8Array(width*height*4);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const sx=Math.floor(left+(x+.5)/width*(right-left)),sy=Math.floor(top+(y+.5)/height*(bottom-top)),i=(sy*png.width+sx)*4,j=(y*width+x)*4;
  if(exterior[sy*png.width+sx])continue;
  const leftArm=inside(sx,sy,armMasks.leftArm),rightArm=inside(sx,sy,armMasks.rightArm);
  if(part.id==='leftArm'&&!leftArm||part.id==='rightArm'&&!rightArm)continue;
  // Head overlaps the neck by 20 source pixels; the torso owns no duplicate arms.
  if(part.id==='torso'&&(leftArm||rightArm))continue;
  bytes.set(png.data.subarray(i,i+4),j);
 }
 // Four-neighbour inward distance supports a small consistent bevel, independent
 // of each row's width. Unlike cylindrical wrapping, the front art stays planar.
 const distance=new Uint16Array(width*height);distance.fill(65500);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){const i=y*width+x;if(!bytes[i*4+3])distance[i]=0;else distance[i]=Math.min(distance[i],x?distance[i-1]+1:1,y?distance[i-width]+1:1);}
 for(let y=height-1;y>=0;y--)for(let x=width-1;x>=0;x--){const i=y*width+x;distance[i]=Math.min(distance[i],x<width-1?distance[i+1]+1:1,y<height-1?distance[i+width]+1:1);}
 profiles[part.id]={width,height,pixels:Buffer.from(bytes).toString('base64'),distance:Buffer.from(Uint8Array.from(distance,n=>Math.min(255,n))).toString('base64'),crop:part.crop};
}
await writeFile('src/assets/canonical-data.ts',`// Generated from the unchanged canonical PNG by scripts/bake-reference.mjs.\nexport const canonicalData = ${JSON.stringify(profiles)};\n`);
await mkdir('public/generated',{recursive:true});
const crop=new PNG({width:796,height:1564});PNG.bitblt(png,crop,28,480,796,1564,0,0);await writeFile('public/generated/wassie-reference-crop.png',PNG.sync.write(crop));
console.log('Baked six aligned canonical profiles, arm masks and inward bevel fields.');
