// Analytics schema: allowlisted fields only, no free text, off by default.
import test from 'node:test';
import assert from 'node:assert/strict';
import {clean,enabled,track,durationBucket,SCHEMA,_queue} from '../src/v14/analytics.js';
test('off by default: nothing is queued',()=>{assert.equal(enabled(),false);assert.equal(track('level_started',{level:'w1-l1',mode:'play'}),false);assert.equal(_queue().length,0);});
test('unknown events and fields are dropped; strings must be enum values',()=>{
  assert.equal(clean('page_view',{}),null);
  assert.deepEqual(clean('level_started',{level:'w1-l1',mode:'play',name:'Ali',email:'a@b.c'}),{level:'w1-l1',mode:'play'});
  assert.deepEqual(clean('level_started',{level:'<script>',mode:'hack'}),{});
  assert.deepEqual(clean('level_completed',{level:'w1-l2',duration_s:121,coins:4,secrets:1,ranked_eligible:false,first_completion:true,nickname:'X'}),{level:'w1-l2',duration_s:121,coins:4,secrets:1,ranked_eligible:false,first_completion:true});
});
test('purchase_completed is refused while no checkout exists',()=>{assert.equal(clean('purchase_completed',{offer:'supporter',currency:'MYR',amount_bucket:'<10'}),null);});
test('durations are bucketed',()=>{assert.equal(durationBucket(45000),60);assert.equal(durationBucket(151000),180);assert.equal(durationBucket(9e6),3601);});
test('no schema field can carry free text',()=>{for(const [name,spec] of Object.entries(SCHEMA))for(const [k,check] of Object.entries(spec))assert.equal(check('free text here'),undefined,`${name}.${k}`);});
