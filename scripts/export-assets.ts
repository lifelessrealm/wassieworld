import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {PNG} from 'pngjs';
import {volumes,compileVolume} from '../src/assets/volumes.ts';
import {tools} from '../src/assets/catalog.ts';
await mkdir('public/generated',{recursive:true});
const manifest=[];
for(const v of Object.values(volumes)){
 const data=compileVolume(v);
 for(const [suffix,bytes]of [['color',data.color],['normal',data.normals]] as const){const png=new PNG({width:data.width,height:data.height});png.data=Buffer.from(bytes);await writeFile(`public/generated/${v.id}-${suffix}.png`,PNG.sync.write(png));}
 await writeFile(`public/generated/${v.id}.json`,JSON.stringify({...data.metadata,occupiedVoxels:data.occupied,colorAtlas:`${v.id}-color.png`,normalAtlas:`${v.id}-normal.png`},null,2)+'\n');manifest.push(data.metadata);
}
await writeFile('public/generated/manifest.json',JSON.stringify(manifest,null,2)+'\n');
const plan=await readFile('docs/MASTER_PLAN.md','utf8');
const inventory:{id:string;name:string;category:string;status:string;source:string|null;dimensions:number[]|null;slices:number|null;resolution:number|null;physics:unknown;qa:string;dependencies:string[];productionNotes:string}[]=[];
let category='';let inInventory=false;let capture=false;
for(const line of plan.split(/\r?\n/)){
 if(line.startsWith('# PART 3'))inInventory=true;if(line.startsWith('# PART 4'))inInventory=false;if(!inInventory)continue;
 if(line.startsWith('## 3.')){category=line.replace(/^## 3\.\d+ /,'');capture=false;}
 if(line==='Initial inventory:'||line==='Include:'||line==='Initial environments:'||line==='Components:')capture=true;
 if(capture&&(/^- /.test(line)||/^\d+\. /.test(line))){const name=line.replace(/^(- |\d+\. )/,'');const id=`${category}-${name}`.toLowerCase().replace(/[^a-z0-9]+/g,'-');const tool=tools.find(t=>t.name.toLowerCase()===name.toLowerCase()||t.id===name.toLowerCase());const v=tool?volumes[tool.id]:undefined;
 inventory.push({id,name,category,status:tool?'initial-implementation':'planned',source:tool?`src/assets/volumes.ts#${tool.id}`:null,dimensions:v?.size??null,slices:v?.layers??null,resolution:v?.resolution??null,physics:tool?{mass:tool.mass,friction:tool.friction,restitution:tool.restitution,behavior:tool.behavior}:null,qa:tool?'automated-system-tests; visual-refinement-pending':'not-produced',dependencies:[],productionNotes:tool?'Playable first-pass asset. See runtime catalog.':'Requires authored coherent source volume, collider, audio profile, behavior, lighting and in-engine QA before registration.'});}
 if(capture&&line&& !line.startsWith('- ')&&!/^\d+\. /.test(line)&&!['Initial inventory:','Include:','Initial environments:','Components:'].includes(line))capture=false;
}
await mkdir('assets',{recursive:true});await writeFile('assets/production-inventory.json',JSON.stringify({schemaVersion:1,source:'docs/MASTER_PLAN.md',entries:inventory},null,2)+'\n');
console.log(`Exported ${manifest.length} coherent volumes with color/normal atlases; indexed ${inventory.length} production requirements.`);
