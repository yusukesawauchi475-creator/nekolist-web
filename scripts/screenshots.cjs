const puppeteer = require('puppeteer');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1284, height: 2778 });
  
  const url = 'https://nekolist-75ekixuda-yusukesawauchi475s-projects.vercel.app';
  
  // 1. NYC一覧
  console.log('Capturing NYC home...');
  await page.goto(url, { waitUntil: 'networkidle2' });
  await sleep(2000);
  await page.screenshot({ path: 'screenshots/01-nyc-home.png', fullPage: false });
  
  // 2. 住まいカテゴリ
  console.log('Capturing home category...');
  try {
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const homeBtn = buttons.find(b => b.textContent.includes('住まい'));
      if (homeBtn) homeBtn.click();
    });
    await sleep(1500);
    await page.screenshot({ path: 'screenshots/02-home-category.png', fullPage: false });
  } catch (e) {
    console.log('Skip home category');
  }
  
  // 3. 売りますカテゴリ
  console.log('Capturing sell category...');
  try {
    await page.goto(url, { waitUntil: 'networkidle2' });
    await sleep(1000);
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const sellBtn = buttons.find(b => b.textContent.includes('売ります'));
      if (sellBtn) sellBtn.click();
    });
    await sleep(1500);
    await page.screenshot({ path: 'screenshots/03-sell-category.png', fullPage: false });
  } catch (e) {
    console.log('Skip sell category');
  }
  
  // 4. LA切替
  console.log('Capturing LA...');
  try {
    await page.goto(url, { waitUntil: 'networkidle2' });
    await sleep(1000);
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const laBtn = buttons.find(b => b.textContent === 'LA');
      if (laBtn) laBtn.click();
    });
    await sleep(1500);
    await page.screenshot({ path: 'screenshots/04-la-listings.png', fullPage: false });
  } catch (e) {
    console.log('Skip LA');
  }
  
  // 5. 投稿画面
  console.log('Capturing post form...');
  try {
    await page.goto(url, { waitUntil: 'networkidle2' });
    await sleep(1500);
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const postBtn = buttons.find(b => b.textContent === '投稿');
      if (postBtn) postBtn.click();
    });
    await sleep(1500);
    await page.screenshot({ path: 'screenshots/05-post-form.png', fullPage: false });
  } catch (e) {
    console.log('Skip post form');
  }
  
  await browser.close();
  console.log('✅ Screenshots saved to screenshots/');
})();
