// import puppeteer from "puppeteer";
// import { Page } from "puppeteer";

// async function searchATags(page: Page) {
//     const links = await page.$$('a');
//     return links;
// }

// async function denyCookies(page: Page) {
//     const denyLabel = "uc-deny-all-button"
//     const selector = `[data-testid="${denyLabel}"]`
//     const button = await page.$(selector);
//     button?.click();
// }

// async function fetch_url(){
//     try {
//         const URL = "https://www.dbinfrago.com/web/schienennetz/netzzugang-und-regulierung/regelwerke/betrieblich-technisch_regelwerke/betrieblich_technisches_regelwerk-12596092#";
//         const browser = await puppeteer.launch({ headless: false });
//         const page = await browser.newPage();
//         await page.goto(URL);
//         await page.setViewport({width: 1080, height: 1024});
//         await denyCookies(page);
//         const links = await searchATags(page);
//         console.log(links);
//     } catch (error) {
//         console.error(error);
//     }
// }

// async function main() {
//     await fetch_url();
// }

// main();