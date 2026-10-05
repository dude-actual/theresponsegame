import {defineConfig} from '@playwright/test';
export default defineConfig({
  testDir:'tests/browser',timeout:60000,expect:{timeout:10000},workers:1,retries:0,
  reporter:[['list'],['html',{open:'never'}]],
  use:{baseURL:'http://127.0.0.1:8787',trace:'retain-on-failure',screenshot:'only-on-failure'},
  webServer:{command:'node tests/browser/server.mjs',url:'http://127.0.0.1:8787',reuseExistingServer:false},
  projects:[{name:'chromium',use:{browserName:'chromium'}}]
});
