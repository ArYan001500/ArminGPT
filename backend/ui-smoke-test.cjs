const { createReadStream, existsSync, mkdirSync } = require('node:fs');
const { createServer } = require('node:http');
const { extname, join, normalize } = require('node:path');
const { chromium } = require('playwright');

const root = join(process.cwd(), 'dist');
const output = join(process.cwd(), 'qa', 'armingpt-home.png');
const types = {
  '.css': 'text/css',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
};

const server = createServer((request, response) => {
  const pathname = request.url === '/' ? '/index.html' : request.url.split('?')[0];
  const requested = normalize(join(root, pathname));
  const file = requested.startsWith(root) && existsSync(requested) ? requested : join(root, 'index.html');
  response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
  createReadStream(file).pipe(response);
});

async function main() {
  await new Promise((resolve) => server.listen(4174, '127.0.0.1', resolve));
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });
  const page = await browser.newPage({ viewport: { height: 844, width: 390 } });

  await page.goto('http://127.0.0.1:4174', { waitUntil: 'networkidle' });
  mkdirSync(join(process.cwd(), 'qa'), { recursive: true });
  await page.screenshot({ path: join(process.cwd(), 'qa', 'armingpt-splash.png') });
  await page.waitForTimeout(2_700);
  await page.screenshot({ path: join(process.cwd(), 'qa', 'armingpt-settings.png') });
  await page.getByText('بعداً').click();
  await page.getByText('امروز چطور کمکت کنم؟').waitFor();
  await page.getByText('خودت را معرفی کن').click();
  await page.getByText(/من آرمین جی‌پی‌تی/).waitFor();

  await page.screenshot({ fullPage: true, path: output });
  await browser.close();
  console.log(`UI smoke test passed: ${output}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => server.close());
