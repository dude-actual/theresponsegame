import {test,expect} from '@playwright/test';
const button=(p,name)=>p.getByRole('button',{name,exact:true});
async function fit(p,label,width,height){
 const dimensions=await p.evaluate(()=>({width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight}));
 expect(dimensions.width,`${label} horizontal reflow`).toBeLessThanOrEqual(width);
 if(width!==320)expect(dimensions.height,`${label} default screen fit`).toBeLessThanOrEqual(height+2);
 await p.screenshot({path:`browser-evidence/${test.info().title.replace(/[^a-z0-9-]/gi,'-')}-${label}.png`,fullPage:true});
}
async function next(p){await button(p,'Continue response').press('Enter');}
async function fresh(p){await p.goto('/');await button(p,'Play Oil Spill').click();}
async function mission(p,variant,width,height){
 await p.getByRole('radio',{name:/Bring in the fast team/}).check();await button(p,'Send recommendation').press('Enter');await next(p);
 await p.getByLabel(/Marsh sections/).fill(variant?'2':'4');await p.getByLabel(/Channel sections/).fill(variant?'3':'1');await button(p,'Review placement').press('Enter');
 await p.reload();await expect(button(p,'Commit placement · 10 min')).toBeVisible();await fit(p,'placement',width,height);await button(p,'Commit placement · 10 min').press('Enter');await next(p);await button(p,'Continue to next period').press('Enter');await next(p);
 await p.getByLabel('Record SK-02 as',{exact:true}).selectOption('out_of_service');await p.getByLabel('Based on',{exact:true}).selectOption('maintenance');await button(p,'Record decision · 6 min').press('Enter');await next(p);
 await fit(p,'recovery',width,height);await p.getByRole('radio',{name:/Bring a contractor/}).check();await button(p,'Record decision · 8 min').press('Enter');await next(p);
 await button(p,'Commit relief plan · 4 min').press('Enter');await p.reload();await next(p);await expect(p.getByLabel('Waste packages to order')).toHaveValue('1');await button(p,'Commit waste plan · 4 min').press('Enter');await next(p);await button(p,'Continue to next period').press('Enter');await next(p);
 await fit(p,'handover',width,height);await button(p,'Move Containment / exposed receptors up').press('Enter');await button(p,'Move Containment / exposed receptors up').press('Enter');await button(p,'Send handover · 8 min').press('Enter');await next(p);await button(p,'Complete handover').press('Enter');
 await expect(button(p,'Try another approach')).toBeVisible();await fit(p,'ending',width,height);
 const saved=await p.evaluate(()=>JSON.parse(localStorage.getItem('trg-v17-session')).state);expect(saved.finished).toBe(true);expect(saved.variant).toBe(variant);expect(saved.events.filter(e=>e.type==='decision')).toHaveLength(7);
 const download=p.waitForEvent('download');await button(p,'Open detailed AAR & downloads').click();await button(p,'Download session JSON').click();expect((await download).suggestedFilename()).toContain('.json');
}
for(const [width,height] of [[1920,1080],[1366,768],[390,844],[320,844]])test(`full mission ${width}x${height} both currents`,async({page})=>{
 await page.setViewportSize({width,height});const errors=[];page.on('pageerror',e=>errors.push(e.message));await fresh(page);await fit(page,'source',width,height);await mission(page,0,width,height);
 await button(page,'Run changed conditions ↗').click();await button(page,'Replace checkpoint and start').click();await mission(page,1,width,height);expect(errors).toEqual([]);
});
test('reduced motion and forced colors retain keyboard controls',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce',forcedColors:'active'});await page.setViewportSize({width:1366,height:768});await fresh(page);await page.getByRole('radio',{name:/Bring in the fast team/}).press('Space');await button(page,'Send recommendation').press('Enter');await expect(page.locator('#active-work')).toBeFocused();await page.locator('#active-work').press('Tab');await expect(button(page,'Continue response')).toBeFocused();
});
test('intentional browser assertion failure proves the gate',async({page})=>{
 test.skip(!process.env.RUN_GATE_PROBE,'Only run in the failure-gate probe');await page.goto('/');expect(await button(page,'Play Oil Spill').textContent()).toBe('INTENTIONAL_GATE_PROBE');
});
