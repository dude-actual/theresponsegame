import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Exercise the real worker handlers with a simulated network and cache API.
// Browser installation/upgrade still needs a deployed-origin acceptance check.
const origin = 'https://example.test';
const scope = `${origin}/theresponsegame/`;
const key = request => new URL(typeof request === 'string' ? request : request.url, scope).href;
const stores = new Map([
  ['trg-v16-1', new Map()],
  ['unrelated-app', new Map()]
]);
let online = true, failInstall = false, claimed = false, skipped = false;
const handlers = {};
const network = async request => {
  if (!online) throw new Error('offline');
  return new Response(`network:${key(request)}`, {status: 200});
};
const caches = {
  async open(name) {
    if (!stores.has(name)) stores.set(name, new Map());
    const entries = stores.get(name);
    return {
      async addAll(paths) {
        if (failInstall) throw new Error('missing required asset');
        const responses = await Promise.all(paths.map(network));
        paths.forEach((path, i) => entries.set(key(path), responses[i]));
      },
      async put(request, response) { entries.set(key(request), response); }
    };
  },
  async keys() { return [...stores.keys()]; },
  async delete(name) { return stores.delete(name); },
  async match(request) {
    for (const entries of stores.values()) {
      const response = entries.get(key(request));
      if (response) return response.clone();
    }
  }
};
vm.runInNewContext(fs.readFileSync('trg-sw.js', 'utf8'), {
  URL, Response, caches, fetch: network,
  self: {
    location: {origin},
    clients: {async claim() { claimed = true; }},
    skipWaiting() { skipped = true; },
    addEventListener(type, callback) { handlers[type] = callback; }
  }
});
async function dispatch(type, request) {
  const jobs = [];
  let response;
  handlers[type]({request, waitUntil(p) { jobs.push(p); }, respondWith(p) { response = p; }});
  const result = await response;
  for (let i = 0; i < jobs.length; i++) await jobs[i];
  return result;
}
failInstall = true;
await assert.rejects(dispatch('install'), /missing required asset/);
assert(stores.has('trg-v16-1'), 'Failed installation must preserve previous cache');
failInstall = false;
await dispatch('install');
assert(skipped);
assert(await caches.match('./v17-ui.js?v=17.1'));
assert(await caches.match('./assets/v17/fonts/ibm-plex-sans-latin-variable.woff2'));
await dispatch('activate');
assert(claimed);
assert(!stores.has('trg-v16-1'));
assert(stores.has('unrelated-app'));
const request = (path, mode = 'cors', method = 'GET') => ({url: new URL(path, scope).href, mode, method});
const live = await dispatch('fetch', request('./v17.css?v=17.1'));
assert.match(await live.text(), /^network:/);
online = false;
const cached = await dispatch('fetch', request('./v17.css?v=17.1'));
assert.equal(cached.status, 200);
const fallback = await dispatch('fetch', request('./unseen-route', 'navigate'));
assert.match(await fallback.text(), /index\.html$/);
const missing = await dispatch('fetch', request('./missing.png'));
assert.equal(missing.type, 'error');
assert.equal(await dispatch('fetch', request('https://outside.test/data')), undefined);
assert.equal(await dispatch('fetch', request('./data', 'cors', 'POST')), undefined);
console.log('v17 offline worker passed: required install, failed-install preservation, scoped upgrade cleanup, network/cache fallback and request isolation (simulated APIs).');
