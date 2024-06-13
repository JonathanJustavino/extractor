import puppeteer, { ElementHandle } from "puppeteer";
import { Page } from "puppeteer";



function find(item: HTMLElement | null, parentClass: string): HTMLElement | null {
    while (true) {
        if (!item) {
            return null;
        }

        if (item.getAttribute("class") === parentClass) {
            return item;
        }

        item = item.parentElement;
    }
}

class App {

    async searchATags(page: Page): Promise<{ title: string | null, url: string }[]> {
        const links = await page.$$eval('a.a-download--compact', (links) => {
            return links
                .map(link => {
                    return {
                        title: link.getAttribute("title"),
                        url: link.getAttribute("href") ?? ""
                    }
                })
                .filter(item => item.url.toLowerCase().endsWith(".pdf"));
        });
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

    createData(keys: string[], values: string[]) {
        const result = [];
        const chunkSize = keys.length;

        for (let i = 0; i < values.length; i += chunkSize) {
            const chunk = values.slice(i, i + chunkSize);
            const data = new Map();

            keys.forEach((key, index) => {
                data.set(key, chunk[index]);
            });

            result.push(data);
        }

        return result;
    }


    async relatedInfo(tableHandle: ElementHandle<HTMLTableElement>, exclude?: string) {

        let headers = await tableHandle!.$$eval('thead > tr > th', (elements) => {
            let content = elements.map((item) => {
                return item.textContent!;
            });
            return content;
        });

        let tbody = await tableHandle!.$$eval('tbody > tr > td', (elements) => {
            let content = elements.map((item) => {
                return item.textContent!;
            });
            return content;
        });

        if (exclude) {
            tbody = tbody.filter(content => !content.includes(exclude));
        }

        const data = this.createData(headers, tbody);

        return data;
    }


    async topDown(page: Page) {

        let details = await page.$$('details.m-expander__details');
        let data = [];

        for (const detail of details) {
            const text = await detail.$eval('summary', node => node.innerText);

            const tableHandle = await detail.$('table.table-striped');

            if (tableHandle) {
                const filter = "Bitte beachten Sie zusätzlich die geltenden" ;
                let items = await this.relatedInfo(tableHandle, filter);
                items = items.map((item) => item.set('header', text));
                data.push(...items);
            }
        }

        return data;
    }

    merge(data: Map<string, string>[], links: { title: string | null, url: string }[]) {
        data.flatMap((item, index) => {
            item.set("Download", links[index].url)
        })
        return data;
    }

    async fetch_url() {
        try {
            const URL = "https://www.dbinfrago.com/web/schienennetz/netzzugang-und-regulierung/regelwerke/betrieblich-technisch_regelwerke/betrieblich_technisches_regelwerk-12596092#";
            const browser = await puppeteer.launch({ headless: false, devtools: true });
            const page = await browser.newPage();

            await page.setViewport({ width: 1080, height: 1024 });
            await page.goto(URL, { waitUntil: 'load' });

            await page.waitForSelector('summary.m-expander__summary');

            const links = await this.searchATags(page);
            const data = await this.topDown(page);

            const info = this.merge(data, links);
            // console.log(info);
            info.forEach(element => {
                console.log(element);
            });

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
