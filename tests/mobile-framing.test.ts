import test from 'node:test';
import assert from 'node:assert/strict';
import {cameraFrame,touchPair} from '../src/game/camera-framing.ts';
test('compact framing keeps a useful character scale in portrait and landscape',()=>{
 for(const [w,h]of [[390,604],[360,400],[742,282],[768,784]]){const f=cameraFrame(w,h,true),width=f.right-f.left,height=f.top-f.bottom;assert.ok(width>=5.8-1e-6);assert.ok(height>=5.8-1e-6);assert.ok(Math.abs(width/height-w/h)<1e-6);const characterHeight=3.6/height*h;assert.ok(characterHeight>170&&characterHeight<h*.8);}
 assert.ok(cameraFrame(390,604,true).right-cameraFrame(390,604,true).left<cameraFrame(390,604,false).right-cameraFrame(390,604,false).left,'Mobile magnifies the subject rather than shrinking the desktop room');
});
test('touch pair measurements remain symmetric and safe for coincident fingers',()=>{
 const a={x:20,y:30},b={x:80,y:110};assert.deepEqual(touchPair([a,b]),touchPair([b,a]));assert.deepEqual(touchPair([a,b]),{x:50,y:70,distance:100});assert.equal(touchPair([a,a]).distance,1);
});
