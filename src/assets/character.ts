/** Authored in canonical PNG pixels. Every render part and joint uses this space. */
export const SOURCE_SCALE = 1 / 432;
export const SOURCE_ORIGIN = [350, 2044] as const;
export type RigPart = 'torso' | 'head' | 'leftArm' | 'rightArm' | 'leftFoot' | 'rightFoot';
export type CharacterPart = {
  id: RigPart; asset: string; crop: [number, number, number, number];
  depth: number; relief:number; layers: number; mass: number; joint?: [number, number]; limits?: [number, number];
};
export const characterParts: CharacterPart[] = [
  {id:'torso',asset:'torso',crop:[28,1060,676,1896],depth:1.12,relief:.018,layers:209,mass:2.5},
  {id:'head',asset:'head',crop:[100,480,824,1080],depth:1.48,relief:.32,layers:150,mass:1.15,joint:[350,1070],limits:[-.55,.55]},
  {id:'leftArm',asset:'leftArm',crop:[80,1080,252,1740],depth:1.14,relief:.012,layers:165,mass:.22,joint:[232,1110],limits:[-.7,.55]},
  {id:'rightArm',asset:'rightArm',crop:[580,1132,676,1752],depth:1.14,relief:.012,layers:155,mass:.22,joint:[605,1160],limits:[-.55,.7]},
  {id:'leftFoot',asset:'foot',crop:[156,1856,364,2044],depth:1.1,relief:.16,layers:47,mass:.38,joint:[244,1884],limits:[-.35,.45]},
  {id:'rightFoot',asset:'rightFoot',crop:[332,1856,652,2016],depth:1.1,relief:.16,layers:40,mass:.38,joint:[433,1884],limits:[-.45,.35]},
];
export const armMasks: Record<'leftArm'|'rightArm',number[][]> = {
  leftArm:[[60,1080],[245,1080],[243,1290],[228,1430],[206,1520],[165,1595],[105,1725],[60,1725]],
  rightArm:[[598,1140],[676,1140],[676,1770],[602,1740],[628,1660],[622,1440]],
};
export function sourcePosition(point:readonly number[]):[number,number,number] {
  return [(point[0]-SOURCE_ORIGIN[0])*SOURCE_SCALE,(SOURCE_ORIGIN[1]-point[1])*SOURCE_SCALE,0];
}
export function bindPosition(part:CharacterPart):[number,number,number] {
  const [left,top,right,bottom]=part.crop;return sourcePosition([(left+right)/2,(top+bottom)/2]);
}
export const partForAsset=(asset:string)=>characterParts.find(p=>p.asset===asset);
export const characterFront=(asset:string)=>.23+Math.max(0,characterParts.findIndex(p=>p.asset===asset))*.00015;
export const characterDepthOffset=(asset:string)=>characterFront(asset)+(partForAsset(asset)?.relief??0)-(partForAsset(asset)?.depth??0)/2;
