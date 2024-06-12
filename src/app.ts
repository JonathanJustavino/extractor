import puppeteer, { ElementHandle } from "puppeteer";
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

    async rawLink(page: Page): Promise<Node[]> {
        const links = await page.$$eval('a.a-download--compact', (links) => (
            links.map((link) => {
                return link.getRootNode();
            })
        ));
        return links;
    }

    async relatedInfo(tableHandle: ElementHandle<HTMLTableElement>) {
        let headers = await tableHandle!.$$eval('thead > tr > th > p', (elements) => {
            let content = elements.map((item) => {
                console.log(item);
                return item.innerHTML;
            });

            return content;
        });

        let tbody = await tableHandle!.$$eval('tbody > tr > td > p', (elements) => {
            let content = elements.map((item) => {
                console.log(item);
                return item.innerHTML;
            });

            return content;
        });

        let data = new Map();

        headers.forEach((value, index) => {
            data.set(value, tbody[index]);
        });

        return data;
    }


    async topDown(page: Page) {
        let sums = await page.waitForSelector('summary.m-expander__summary');
        console.log("sums", sums);
        if(!sums) {
            console.error("no summaries");
        }

        let table = await page.waitForSelector('table.table-striped');
        console.log("t", table);

        if(!table) {
            console.error("no table");
        }

        let result = await this.relatedInfo(table!);
        console.log(result);
    }

    async fetch_url() {
        try {
            const URL = "https://www.dbinfrago.com/web/schienennetz/netzzugang-und-regulierung/regelwerke/betrieblich-technisch_regelwerke/betrieblich_technisches_regelwerk-12596092#";
            const browser = await puppeteer.launch({ headless: false, devtools: true });
            const page = await browser.newPage();

            await page.setViewport({ width: 1080, height: 1024 });
            await page.goto(URL, { waitUntil: 'load' });

            await page.waitForSelector('summary.m-expander__summary');

            // const links = await this.rawLink(page);
            const table = await this.topDown(page);
            // console.log(table);
            console.log('done retrieving');
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
