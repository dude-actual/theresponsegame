import {test,expect} from '@playwright/test';
import fs from 'node:fs';
const release=JSON.parse(fs.readFileSync('package.json','utf8')).version;
const origin='http://trg-preview.localhost:8787';
test('worker install, failed update, old tab, offline activation and rollback',async({browser,request})=>{
 const context=await browser.newContext();let page=await context.newPage();
 async function fixture(revision,missing=false){await request.post('/__qa/release',{data:{revision,missing}});}
 async function activate(){await page.close();page=await context.newPage();await page.goto(origin);await page.reload();}
 try{
 await fixture(release);await page.goto(origin);await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(true);
 await page.getByRole('button',{name:'Play Oil Spill',exact:true}).click();await page.getByRole('radio',{name:/Use the regional team/}).check();
 const before=await page.evaluate(()=>localStorage.getItem('trg-v17-session'));
 await fixture('qa-broken',true);await page.evaluate(async()=>{const reg=await navigator.serviceWorker.getRegistration();await reg.update();});
 await expect.poll(()=>page.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();return !r.installing;})).toBe(true);
 await page.reload();await expect(page.locator('html')).toHaveAttribute('data-version',release);expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('trg-v17-session')).state.orders.length)).toBe(0);
 await fixture('qa-next');await page.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();await r.update();});await expect.poll(()=>page.evaluate(async()=>!!(await navigator.serviceWorker.getRegistration()).waiting)).toBe(true);
 await page.reload();await expect(page.locator('html')).toHaveAttribute('data-version',release);await expect(page.getByRole('radio',{name:/Use the regional team/})).toBeChecked();
 await activate();await expect(page.locator('html')).toHaveAttribute('data-version','qa-next');await expect(page.getByRole('radio',{name:/Use the regional team/})).toBeChecked();
 await context.setOffline(true);await page.reload();await page.getByRole('button',{name:'Send recommendation',exact:true}).click();await expect(page.getByRole('button',{name:'Continue response',exact:true})).toBeVisible();await page.reload();expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('trg-v17-session')).state.orders.length)).toBe(1);
 await context.setOffline(false);await fixture(release);await page.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();await r.update();});await expect.poll(()=>page.evaluate(async()=>!!(await navigator.serviceWorker.getRegistration()).waiting)).toBe(true);await activate();await expect(page.locator('html')).toHaveAttribute('data-version',release);expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('trg-v17-session')).state.orders.length)).toBe(1);
 expect(JSON.parse(before).state.orders).toHaveLength(0);await page.screenshot({path:'browser-evidence/worker-rollback-result.png'});
 }finally{await fixture(release);await context.close();}
});
