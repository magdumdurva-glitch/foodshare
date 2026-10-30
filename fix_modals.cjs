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

async function fixModals() {
  const ngoToken = await apiLogin('ngo@foodshare.org', 'password123');
  const adminToken = await apiLogin('admin@foodshare.org', 'password123');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,920']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 920 });

  // 1. Claim Modal
  await page.evaluate(token => {
    localStorage.setItem('foodshare_token', token);
  }, ngoToken);
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    const navItems = Array.from(document.querySelectorAll('button'));
    const exploreBtn = navItems.find(el => el.textContent && el.textContent.includes('Find Available Food'));
    if (exploreBtn) exploreBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const claimBtn = buttons.find(b => b.textContent && b.textContent.includes('Claim Food'));
    if (claimBtn) claimBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(__dirname, 'screenshots', '06_ngo_claim_modal.png') });
  console.log('06_ngo_claim_modal.png captured with modal open!');

  // 2. Admin User Accounts tab
  await page.evaluate(token => {
    localStorage.setItem('foodshare_token', token);
  }, adminToken);
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const uTab = tabs.find(t => t.textContent && t.textContent.includes('User Accounts'));
    if (uTab) uTab.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(__dirname, 'screenshots', '08b_admin_user_accounts.png') });
  console.log('08b_admin_user_accounts.png captured!');

  await browser.close();
}

fixModals().catch(console.error);
