const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1284, height: 2778 });
  
  const url = 'https://nekolist-75ekixuda-yusukesawauchi475s-projects.vercel.app';
  
  // 1. NYC一覧
  console.log('Capturing NYC home...');
  await page.goto(url, { waitUntil: 'networkidle2' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshots/01-nyc-home.png', fullPage: false });
  
  // 2. 住まいカテゴリ
  console.log('Capturing home category...');
  await page.click('button:has-text("住まい")');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'screenshots/02-home-category.png', fullPage: false });
  
  // 3. 売りますカテゴリ
  console.log('Capturing sell category...');
  await page.click('button:has-text("売ります")');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'screenshots/03-sell-category.png', fullPage: false });
  
  // 4. LA切替
  console.log('Capturing LA...');
  await page.click('button:has-text("LA")');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'screenshots/04-la-listings.png', fullPage: false });
  
  // 5. 投稿画面
  console.log('Capturing post form...');
  await page.goto(url, { waitUntil: 'networkidle2' });
  await page.waitForTimeout(1500);
  await page.click('button:has-text("投稿")');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'screenshots/05-post-form.png', fullPage: false });
  
  await browser.close();
  console.log('✅ Screenshots saved to screenshots/');
})();
