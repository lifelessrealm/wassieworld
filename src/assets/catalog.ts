export type Behavior='impact'|'explosive'|'rocket'|'spring'|'fan'|'freeze'|'electric';
export type Tool={id:string;name:string;category:string;icon:string;description:string;mass:number;restitution:number;friction:number;behavior:Behavior;fixed?:boolean;held?:boolean;};
export const tools:Tool[]=[
 {id:'mallet',name:'Heavy mallet',category:'Impact',icon:'⚒',description:'Hold and drag to swing from the handle. Faster sweeps hit harder.',mass:5,restitution:.18,friction:.6,behavior:'impact',held:true},
 {id:'glove',name:'Boxing glove',category:'Impact',icon:'◉',description:'Hold and drag to punch. Follows your hand with a little spring.',mass:2,restitution:.8,friction:.5,behavior:'impact',held:true},
 {id:'anvil',name:'Anvil',category:'Impact',icon:'▰',description:'Gravity does the paperwork.',mass:12,restitution:.08,friction:.8,behavior:'impact'},
 {id:'crate',name:'Wooden crate',category:'Props',icon:'▧',description:'Stack it. Throw it. Introduce it to an explosion.',mass:2,restitution:.2,friction:.75,behavior:'impact'},
 {id:'bomb',name:'Cartoon bomb',category:'Chaos',icon:'●',description:'2.8 seconds of increasingly poor decisions. Chains with nearby bombs.',mass:1.8,restitution:.4,friction:.6,behavior:'explosive'},
 {id:'rocket',name:'Bottle rocket',category:'Chaos',icon:'↟',description:'Upward thrust. No flight qualifications required.',mass:.7,restitution:.3,friction:.5,behavior:'rocket'},
 {id:'spring',name:'Launch pad',category:'Machines',icon:'≋',description:'An automatic, deeply enthusiastic floor launcher.',mass:8,restitution:.9,friction:.7,behavior:'spring',fixed:true},
 {id:'fan',name:'Giant fan',category:'Machines',icon:'✣',description:'Pushes everything in its field toward the ceiling.',mass:8,restitution:.2,friction:.7,behavior:'fan',fixed:true},
 {id:'freeze',name:'Cryo capsule',category:'Elements',icon:'❄',description:'Chills nearby Wassies. Electricity makes things interesting.',mass:2,restitution:.2,friction:.15,behavior:'freeze'},
 {id:'tesla',name:'Tesla coil',category:'Elements',icon:'ϟ',description:'A nearby electrical field. May invalidate the warranty.',mass:8,restitution:.1,friction:.8,behavior:'electric',fixed:true}
];
export const toolById=(id:string)=>tools.find(t=>t.id===id);
