import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const context = vm.createContext({Date});
vm.runInContext(fs.readFileSync('v17-engine.js', 'utf8'), context);
const E = context.RR17;
const clone = value => JSON.parse(JSON.stringify(value));
function act(s, action) {
  const result = E.act(s, action);
  assert.equal(result.ok, true, result.error);
  assert.equal(E.validateState(s).ok, true);
}
function reject(s, action) {
  const before = JSON.stringify(s);
  assert.equal(E.act(s, action).ok, false);
  assert.equal(JSON.stringify(s), before, 'rejection must be atomic');
}
const verified = ['id','leader','capability','comms'];
const correction = {type:'correct-checkin',verified,assignment:'source'};
function dispatched(vendor='harbor') {
  const s = E.createState();
  act(s,{type:'validate',fields:['capability','location']});
  act(s,{type:'route',tactical:'resources',support:'logistics'});
  act(s,{type:'source',vendor});
  act(s,{type:'allocate',marsh:4,channel:1});
  return s;
}

// Harbor physically arrives at 07:34. Receiving it during OP1 must be possible.
const early = dispatched();
reject(early,{type:'checkin',verified,assignment:'source'});
reject(early,correction);
act(early,{type:'wait'});
assert.equal(early.minute,36);
assert.equal(early.tasks.find(t=>t.id==='arrival').available,true);
act(early,{type:'checkin',verified,assignment:'source'});
assert.equal(early.period,0);
assert.equal(early.minute,44);
assert.ok(early.minute < early.intel.monitoringNeededBy);
assert.equal(early.safetyHold,false);
reject(early,{type:'checkin',verified,assignment:'source'});
reject(early,correction);
act(early,{type:'advance'});
assert.ok(!early.queue.includes('arrival'),'received resource is not requested twice next period');

// An incomplete receipt remains an immutable historical decision after recovery.
const incomplete = dispatched();
act(incomplete,{type:'wait'});
act(incomplete,{type:'checkin',verified:['id'],assignment:'source'});
assert.equal(incomplete.safetyHold,true);
const original = clone(incomplete.history), originalCost=incomplete.cost;
const originalAccountability=incomplete.accountability, originalMinute=incomplete.minute;
reject(incomplete,{...correction,verified:['id']});
const restored = clone(incomplete);
act(incomplete,correction); act(restored,correction);
assert.deepEqual(clone(restored),clone(incomplete),'restore yields the same correction and consequences');
assert.deepEqual(clone(incomplete.history.slice(0,-1)),original);
assert.equal(incomplete.minute,originalMinute+8);
assert.equal(incomplete.cost,originalCost);
assert.equal(incomplete.accountability,originalAccountability,'correction does not erase the prior loss');
assert.equal(incomplete.safetyHold,false);
assert.equal(incomplete.history[incomplete.history.at(-1).correctsHistoryIndex].action,'Resource check-in');
assert.equal(incomplete.events.at(-1).correctsHistoryIndex,incomplete.history.at(-1).correctsHistoryIndex);
reject(incomplete,correction);

// A staging assignment is correctable; no resource can be conjured or repaired.
const staged = dispatched('internal');
act(staged,{type:'checkin',verified,assignment:'staging'});
act(staged,correction);
assert.equal(staged.intel.monitoringConfirmed,true);
assert.equal(staged.flags.channelMonitoringGap,true,'recovery does not silently fill the origin gap');
const incompatible=dispatched('industrial');
act(incompatible,{type:'checkin',verified,assignment:'source'});
reject(incompatible,correction);
assert.equal(incompatible.safetyHold,true);

// Correcting monitoring after the crew duty limit does not invent source relief.
const late=dispatched();
act(late,{type:'wait'});
act(late,{type:'checkin',verified:[],assignment:'source'});
// A saved elapsed-time fixture preserves all physical resources and task records.
late.minute=180;
act(late,correction);
assert.equal(late.intel.monitoringConfirmed,true);
assert.equal(late.safetyHold,true);
assert.equal(late.intel.sourceReliefAssigned,false);
late.finished=true; late.tasks.forEach(t=>t.status='done'); late.queue=[];
reject(late,correction);
console.log('Arrival/recovery: before-deadline reception, physical eligibility, append-only correction, save equivalence, duplicate rejection and duty-limit safety passed.');
