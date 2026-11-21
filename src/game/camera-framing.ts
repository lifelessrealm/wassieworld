export function cameraFrame(width:number,height:number,compact:boolean){
 const aspect=Math.max(1,width)/Math.max(1,height),span=compact?Math.max(5.8,5.8/aspect):Math.max(9.5,19/aspect);
 return {left:-span*aspect/2,right:span*aspect/2,top:span/2,bottom:-span/2};
}
export type TouchPoint={x:number;y:number};
export function touchPair(points:TouchPoint[]){const [a,b]=points;return {x:(a.x+b.x)/2,y:(a.y+b.y)/2,distance:Math.max(1,Math.hypot(b.x-a.x,b.y-a.y))};}
