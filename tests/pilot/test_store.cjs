'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { harness, D } = require('./fixture.cjs');

globalThis.TRG_PILOT_DOMAIN = D;
globalThis.IDBKeyRange = { bound: (lower, upper) => ({ lower, upper }) };
require('../../pilot/store.js');
const PilotStore = globalThis.TRG_PILOT_STORE;

// A deterministic read-only IDB seam, not a substitute for native browser tests.
// Each transaction captures one committed image. A scheduled writer becomes
// visible to subsequent transactions, never to other requests in that image.
// This exposes load-versus-write races without sleeps or probabilistic timing.
function snapshotDatabase(state, events = state?.events || [], afterStateRead) {
  let committed = { state: state ? D.copy(state) : undefined, events: D.copy(events) };
  let writerScheduled = false;
  const transactions = [];
  const database = {
    transactions,
    replace(nextState, nextEvents = nextState.events) {
      committed = { state: D.copy(nextState), events: D.copy(nextEvents) };
    },
    transaction(names, mode = 'readonly') {
      const stores = Array.isArray(names) ? [...names] : [names];
      assert.equal(mode, 'readonly', 'Loading must never create a write transaction');
      const snapshot = { state: committed.state && D.copy(committed.state), events: D.copy(committed.events) };
      const record = { stores, mode, requests: [] };
      transactions.push(record);
      let pending = 0;
      let completed = false;
      const tx = {
        objectStore(name) {
          assert.ok(stores.includes(name), 'Every request must be in its transaction scope');
          const request = (kind, key) => {
            const req = {};
            pending++;
            record.requests.push({ store: name, kind, key });
            setImmediate(() => {
              if (name === 'states' && kind === 'get') {
                req.result = snapshot.state?.org === key ? D.copy(snapshot.state) : undefined;
              } else {
                assert.equal(name, 'events');
                assert.equal(kind, 'getAll');
                req.result = snapshot.events.filter(e => e.org === key.lower[0] && e.sequence >= key.lower[1] && e.sequence <= key.upper[1]).map(D.copy);
              }
              req.onsuccess?.({ target: req });
              if (name === 'states' && !writerScheduled && afterStateRead) {
                writerScheduled = true;
                afterStateRead(database);
              }
              pending--;
              setImmediate(() => {
                if (!pending && !completed) {
                  completed = true;
                  tx.oncomplete?.({ target: tx });
                }
              });
            });
            return req;
          };
          return { get: key => request('get', key), getAll: key => request('getAll', key) };
        }
      };
      return tx;
    }
  };
  return database;
}

function stored(state, events, afterStateRead) {
  const store = new PilotStore(state?.org || 'internal-demo');
  store.mode = 'indexeddb';
  store.db = snapshotDatabase(state, events, afterStateRead);
  return store;
}

function twoValidRevisions() {
  const h = harness();
  h.assign();
  const before = D.copy(h.state);
  h.start();
  const after = D.copy(h.state);
  D.validate(before);
  D.validate(after);
  return { before, after };
}

test('load reads projection and ledger within one readonly transaction', async () => {
  const { before } = twoValidRevisions();
  const store = stored(before);
  const result = await store.load();
  assert.deepEqual(result, before);
  assert.equal(store.db.transactions.length, 1);
  assert.deepEqual([...store.db.transactions[0].stores].sort(), ['events', 'states']);
  assert.deepEqual(store.db.transactions[0].requests.map(r => r.store).sort(), ['events', 'states']);
  result.campaigns[0].name = 'Caller edit must not change the saved projection';
  assert.deepEqual(store.raw, before);
});

test('a valid concurrent writer cannot cause a false corruption diagnosis', async () => {
  const { before, after } = twoValidRevisions();
  const store = stored(before, before.events, db => db.replace(after));
  const first = await store.load();
  assert.deepEqual(first, before, 'All reads in the first transaction share its original snapshot');
  const second = await store.load();
  assert.deepEqual(second, after, 'A later transaction sees the committed writer');
  assert.equal(store.db.transactions.length, 2, 'Each load owns exactly one transaction');
  D.validate(first);
  D.validate(second);
});

test('a real same-snapshot ledger mismatch still blocks recovery without rewriting state', async () => {
  const { before } = twoValidRevisions();
  const store = stored(before, []);
  await assert.rejects(store.load(), error => error.code === 'CORRUPT' && /Event store/.test(error.message));
  assert.deepEqual(store.raw, before, 'The original projection remains available for recovery');
  assert.ok(store.db.transactions.every(tx => tx.mode === 'readonly'));
});

test('an empty native store yields the initial state without seeding writes', async () => {
  const store = stored(undefined, []);
  assert.deepEqual(await store.load(), D.initial());
  assert.equal(store.db.transactions.length, 1);
  assert.deepEqual([...store.db.transactions[0].stores].sort(), ['events', 'states']);
});

test('volatile fallback still returns an isolated validated copy', async () => {
  const { before } = twoValidRevisions();
  const store = new PilotStore();
  store.mode = 'volatile';
  store.memory = D.copy(before);
  const result = await store.load();
  assert.deepEqual(result, before);
  result.campaigns[0].name = 'Unsaved caller edit';
  assert.deepEqual(store.memory, before);
});
