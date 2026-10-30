const puppeteer = require('puppeteer-core');
const path = require('path');
const http = require('http');

function apiLogin(email, password) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ email, password });
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.token) resolve(json.token);
          else reject(new Error(json.error || 'Login failed'));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function captureAll() {
  console.log('Fetching JWT tokens for donor, ngo, and admin...');
  const donorToken = await apiLogin('donor@foodshare.org', 'password123');
  const ngoToken = await apiLogin('ngo@foodshare.org', 'password123');
  const adminToken = await apiLogin('admin@foodshare.org', 'password123');
  console.log('Tokens retrieved successfully!');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,920']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 920 });

  const shot = async (filename, waitMs = 1200) => {
    await new Promise(r => setTimeout(r, waitMs));
    const outPath = path.join(__dirname, 'screenshots', filename);
    await page.screenshot({ path: outPath, fullPage: false });
    console.log(`Captured: ${filename}`);
  };

  // 1. Portal Landing
  console.log('Capturing 01_portal_landing.png...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle2' });
  await shot('01_portal_landing.png');

  // 2. Portal Login Modal (Click Donor Card button)
  console.log('Capturing 02_donor_portal_login.png...');
  await page.evaluate(() => {
    const btn = document.getElementById('portal-btn-donor');
    if (btn) btn.click();
  });
  await shot('02_donor_portal_login.png', 1000);

  // 3. Donor Dashboard
  console.log('Capturing 03_donor_dashboard_overview.png...');
  await page.evaluate(token => {
    localStorage.setItem('foodshare_token', token);
  }, donorToken);
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  await shot('03_donor_dashboard_overview.png', 1500);

  // 4. Donor Add Food Modal
  console.log('Capturing 04_donor_post_food_modal.png...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const addBtn = buttons.find(b => b.textContent && (b.textContent.includes('+ New Food Donation') || b.textContent.includes('Post Food')));
    if (addBtn) addBtn.click();
  });
  await shot('04_donor_post_food_modal.png', 1000);

  // 5. NGO Explore Feed
  console.log('Capturing 05_ngo_explore_feed.png...');
  await page.evaluate(token => {
    localStorage.setItem('foodshare_token', token);
  }, ngoToken);
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  // Click on "Find Available Food" tab in navbar
  await page.evaluate(() => {
    const navItems = Array.from(document.querySelectorAll('button'));
    const exploreBtn = navItems.find(el => el.textContent && el.textContent.includes('Find Available Food'));
    if (exploreBtn) exploreBtn.click();
  });
  await shot('05_ngo_explore_feed.png', 1500);

  // 6. NGO Claim Modal
  console.log('Capturing 06_ngo_claim_modal.png...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const claimBtn = buttons.find(b => b.textContent && b.textContent.includes('Claim Batch'));
    if (claimBtn) claimBtn.click();
  });
  await shot('06_ngo_claim_modal.png', 1000);

  // 7. NGO Command Center Dashboard
  console.log('Capturing 07_ngo_dashboard_pipeline.png...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    const navItems = Array.from(document.querySelectorAll('button'));
    const dashBtn = navItems.find(el => el.textContent && el.textContent.includes('My Claims & Deliveries'));
    if (dashBtn) dashBtn.click();
  });
  await shot('07_ngo_dashboard_pipeline.png', 1500);

  // 8. Admin Dashboard Overview
  console.log('Capturing 08_admin_dashboard_overview.png...');
  await page.evaluate(token => {
    localStorage.setItem('foodshare_token', token);
  }, adminToken);
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  await shot('08_admin_dashboard_overview.png', 1500);

  // 9. Admin Donations & Status Overrides
  console.log('Capturing 09_admin_status_overrides.png...');
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const donTab = tabs.find(t => t.textContent && t.textContent.includes('Donations Management'));
    if (donTab) donTab.click();
  });
  await shot('09_admin_status_overrides.png', 1200);

  // 10. Admin Activity Audit Logs
  console.log('Capturing 10_admin_audit_logs.png...');
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const logTab = tabs.find(t => t.textContent && t.textContent.includes('Live Audit Logs'));
    if (logTab) logTab.click();
  });
  await shot('10_admin_audit_logs.png', 1200);

  // 11. Sustainability & Impact Page
  console.log('Capturing 11_sustainability_impact.png...');
  await page.evaluate(() => {
    const navItems = Array.from(document.querySelectorAll('button'));
    const impactBtn = navItems.find(el => el.textContent && el.textContent.includes('Impact'));
    if (impactBtn) impactBtn.click();
  });
  await shot('11_sustainability_impact.png', 1500);

  // 12. Smartphone Bezel Simulator Mode
  console.log('Capturing 12_mobile_bezel_simulator.png...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const simBtn = buttons.find(b => b.textContent && b.textContent.includes('Mobile'));
    if (simBtn) simBtn.click();
  });
  await shot('12_mobile_bezel_simulator.png', 1500);

  await browser.close();
  console.log('ALL SCREENSHOTS CAPTURED PERFECTLY!');
}

captureAll().catch(err => {
  console.error('Error during capture:', err);
  process.exit(1);
});
