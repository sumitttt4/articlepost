import { defineConfig, devices } from "@playwright/test";
const baseURL=process.env.PLAYWRIGHT_BASE_URL||"http://localhost:3000";
export default defineConfig({
 testDir:"./e2e",fullyParallel:false,workers:1,timeout:60000,expect:{timeout:15000},
 use:{baseURL,...devices["Desktop Chrome"],viewport:{width:1440,height:1000},channel:process.env.PLAYWRIGHT_CHANNEL||undefined,trace:"retain-on-failure"},
 webServer:{command:"npm run dev",url:baseURL,reuseExistingServer:!process.env.CI,timeout:120000}
});
