import fs from 'node:fs';
import assert from 'node:assert/strict';

// Packaging and accessibility guardrails; these do not substitute for a browser run.
const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('v17.css', 'utf8');
const worker = fs.readFileSync('trg-sw.js', 'utf8');
const scripts = [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/g)].map(m => m[1].split('?')[0]);
const styles = [...html.matchAll(/<link\b[^>]*\brel=["']stylesheet["'][^>]*\bhref=["']([^"']+)["'][^>]*>/g)].map(m => m[1].split('?')[0]);

assert.match(html, /data-release=["']v17["']/);
assert.deepEqual(scripts, ['v17-engine.js', 'v17-ui.js'], 'v17 must own its runtime rather than load legacy wrappers');
assert.deepEqual(styles, ['v17.css'], 'v17 must use a consolidated visual system');
for (const path of [...scripts, ...styles]) assert.ok(fs.existsSync(path), `production asset exists: ${path}`);
assert.doesNotMatch(css, /@import[^;]*trg-v1[2-6]/, 'legacy CSS must not be reintroduced through imports');
assert.doesNotMatch(html, /user-scalable\s*=\s*no|maximum-scale\s*=\s*1(?:[",])/i, 'browser zoom remains available');
assert.match(html, /aria-live=["']polite["']/);
assert.match(css, /prefers-reduced-motion\s*:\s*reduce/);
assert.match(css, /:focus-visible/);
assert.match(css, /forced-colors/);
for (const path of ['v17-engine.js', 'v17-ui.js', 'v17.css']) assert.ok(worker.includes(path), `offline worker includes ${path}`);
assert.doesNotMatch(worker, /trg-v1[2-6](?:-ui|-impact|-planning|-engine|-data|-services)?\.(?:js|css)/, 'v17 offline cache must not depend on the old runtime');
assert.ok(fs.existsSync('v16.html'), 'historical baseline remains available separately');

console.log('v17 production packaging and accessibility guardrails passed (static checks only).');
