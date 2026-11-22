import test from 'node:test';
import assert from 'node:assert/strict';
import {DialogueQueue,LINES,missionObjective} from '../../app/addmath/rooftop/src/v12/dialogue.js';
import {sanitize} from '../../app/addmath/rooftop/src/v12/save.js';
test('obsolete or other-zone reactions become journal entries instead of contradicting current play',()=>{
 const q=new DialogueQueue();q.enqueue('failed:lift');q.enqueue('zone:G');q.tick(16,true);
 assert.equal(q.retireStale('G',new Set(['lift'])),true);assert.equal(q.active,null);assert.deepEqual(q.pending,['zone:G']);
 const river=new DialogueQueue();river.enqueue('failed:river-final');river.enqueue('activated:river-crossing');
 river.retireStale('G',new Set(['river-input','river-crossing']));assert.deepEqual(river.pending,['activated:river-crossing']);assert.ok(river.seen.has('failed:river-final'));
});
test('first entry, repeats, ordered triggers and cooldown',()=>{
 const q=new DialogueQueue();assert.equal(q.enqueue('zone:A'),true);assert.equal(q.enqueue('zone:A'),false);
 q.enqueue('found:lift');q.enqueue('failed:lift');q.tick(16,true);assert.equal(q.active,'zone:A');
 assert.equal(q.enqueue('zone:A'),false);q.dismiss();q.tick(100,true);assert.equal(q.active,null);
 for(let i=0;i<15;i++)q.tick(100,true);assert.equal(q.active,'found:lift');assert.deepEqual(q.pending,['failed:lift']);
});
test('pause, hidden tab and unavailable space freeze lifetime and cooldown',()=>{
 const q=new DialogueQueue();q.enqueue('zone:F');q.tick(16,false);assert.equal(q.active,null);
 q.tick(16,true);const time=q.remaining;for(let i=0;i<100;i++)q.tick(100,false);assert.equal(q.remaining,time);
 q.dismiss();q.tick(9000,false);assert.equal(q.cooldown,1600);
});
test('reload deduplicates shown lines while retaining undisplayed reactions',()=>{
 const q=new DialogueQueue();q.enqueue('zone:B');q.enqueue('failed:lift');q.tick(16,true);
 const restored=new DialogueQueue(JSON.parse(JSON.stringify(q.snapshot())));
 assert.equal(restored.enqueue('zone:B'),false);assert.equal(restored.active,null);
 restored.tick(16,true);assert.equal(restored.active,'failed:lift');
});
test('old and malformed saves accept only known dialogue identifiers',()=>{
 const base={schemaVersion:1,layoutVersion:120,levelId:'denai-bab1-functions-v12'};
 assert.deepEqual(sanitize(base).dialogue,{seen:[],pending:[]});
 assert.deepEqual(sanitize({...base,dialogue:{seen:['zone:A','<script>','zone:A'],pending:['zone:A','failed:lift',null]}}).dialogue,{seen:['zone:A'],pending:['failed:lift']});
});
test('mission follows mandatory gates; dialogue never supplies numeric answers',()=>{
 const s={solvedGates:new Set()};assert.match(missionObjective(s),/bukit/);
 s.solvedGates=new Set(['lift','number-span','water-crossing']);assert.match(missionObjective(s),/sungai/);
 s.solvedGates.add('river-crossing');assert.match(missionObjective(s),/destinasi/);
 assert.ok(Object.values(LINES).every(line=>!/[0-9=]/.test(line)));
});
