import puppeteer from "puppeteer";
import { Page } from "puppeteer";


class App {

    async searchATags(page: Page): Promise<string[]> {
        const links = await page.$$eval('a.a-download--compact', (links) => (
            links
            .map((link) => link.getAttribute("href") ?? "")
            .filter((item) => (item.toLowerCase().endsWith(".pdf")))
        ));
        return links;
    }

    async fetch_url() {
        try {
            const URL = "https://www.dbinfrago.com/web/schienennetz/netzzugang-und-regulierung/regelwerke/betrieblich-technisch_regelwerke/betrieblich_technisches_regelwerk-12596092#";
            const browser = await puppeteer.launch({ headless: false });
            const page = await browser.newPage();

            await page.setViewport({ width: 1080, height: 1024 });
            await page.goto(URL, { waitUntil: 'load' });

            const links = await this.searchATags(page);
            console.log(links);
            console.log(links.length);

        } catch (error) {
            console.error(error);
        }
    }

    public async start() {
        console.log("Visiting yeff");
        await this.fetch_url();
    }
}

const app = new App();
app.start();
