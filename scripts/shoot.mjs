// Dev-only visual QA helper: captures full-page screenshots of the built site.
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

const base = process.env.SHOT_BASE ?? "http://localhost:3000";
const only = process.argv[2];
const targets = [
  { name: "home", path: "/", full: true },
  { name: "home-fold", path: "/", full: false },
  { name: "login", path: "/login", full: true },
  { name: "status", path: "/status", full: true },
  { name: "docs", path: "/docs", full: true },
  { name: "mobile", path: "/", full: true, mobile: true },
].filter((t) => !only || t.name === only);

chromium.setHeadlessMode = true;

const browser = await puppeteer.launch({
  args: [...chromium.args, "--no-sandbox", "--font-render-hinting=none"],
  defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
  executablePath: await chromium.executablePath(),
  headless: "shell",
});

for (const t of targets) {
  const page = await browser.newPage();
  if (t.mobile) {
    await page.setViewport({ width: 414, height: 896, deviceScaleFactor: 2 });
  }
  await page.goto(base + t.path, { waitUntil: "networkidle2", timeout: 60000 });

  // scroll through the page to trigger reveal animations
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.7);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 90));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 350));
  });

  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({
    path: `/tmp/shots/${t.name}.png`,
    fullPage: t.full,
  });
  console.log("shot", t.name);
  await page.close();
}

await browser.close();
