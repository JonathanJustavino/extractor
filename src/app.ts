import puppeteer, { ElementHandle } from "puppeteer";
import { Page } from "puppeteer";
import * as fs from 'fs';
import path from "path";


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

    reverseDate(date: string): string {
        const [day, month, year] = date.split('.');
        return `${year}-${month}-${day}`;
    }

    extractGroup(header: string | undefined): string {
        const groupRegEx = /.*\d+/
        if(!header) {
            return "";
        }

        const match = header.match(groupRegEx);
        const result = match?.[0]
        let group = result ?? "";
        group = group.replace(" ", "-");
        return group;
    }


    build(entry: Map<string, string>, index: number): any {
        const license = "https://www.dbinfrago.com/web/schienennetz/netzzugang-und-regulierung/nutzungsbedingungen/NBN-INB/Nutzungsbedingungen-Netz-der-DB-Netz-AG-NBN-2024-12595472#"
        const link = "https://www.dbinfrago.com/web/schienennetz/netzzugang-und-regulierung/regelwerke/betrieblich-technisch_regelwerke/betrieblich_technisches_regelwerk-12596092#";
        const date = entry.get("Gültig ab") ?? "";
        const hasVersion = this.reverseDate(date);
        const user = "prototype"
        const header = entry.get("header");
        // const group = this.extractGroup(header);
        const group = "RIL";
        const artifact = entry.get("Nr.:");
        const title = entry.get("Titel");
        let id = `https://dev.databus.dbpedia.org/${user}/${group}/${artifact}/${hasVersion}`;
        const baseURL = new URL(link);
        const download = entry.get("Download");
        const downloadURL = `https://${baseURL.hostname}${download}`;

        let output: any = {
            "@context": "https://downloads.dbpedia.org/databus/context.jsonld",
            "@graph": [
                {
                    "@type": [
                        "Version",
                        "Dataset"
                    ],
                    "@id": id,
                    "hasVersion": hasVersion,
                    "title": title,
                    "description": `${header} / ${title}`,
                    "abstract": `PDF as found on this page: ${link}`,
                    "license": license,
                    "distribution": [
                        {
                            "@type": "Part",
                            "formatExtension": "pdf",
                            "compression": "none",
                            "downloadURL": downloadURL
                        }
                    ]
                }
            ]
        }

        let jsonString = JSON.stringify(output, null, 2);
        let dir = path.dirname(__dirname)
        const filePath = path.join(dir, "output", `file-${index}.jsonld`)
        fs.writeFile(filePath, jsonString, (err) => {
            if (err) {
                console.error("Error writing file", err);
            }
            else {
                console.log("Successful wrote file");
            }
        })

        return output;
    }

    to_format(data: Map<string, string>[]) {
        const entries = data.map((element, index) => {
            return this.build(element, index);
        });
        return entries;
    }

    async fetch_url() {
        try {
            const URL = "https://www.dbinfrago.com/web/schienennetz/netzzugang-und-regulierung/regelwerke/betrieblich-technisch_regelwerke/betrieblich_technisches_regelwerk-12596092#";
            const browser = await puppeteer.launch({ headless: false, devtools: true });
            const page = await browser.newPage();
            page.goto(URL);

            await page.setViewport({ width: 1080, height: 1024 });


            await page.waitForSelector('summary.m-expander__summary');

            const links = await this.searchATags(page);
            const data = await this.topDown(page);

            const info = this.merge(data, links);

            const result = this.to_format(info);
            result.forEach(element => {
                console.log(element);
            });

            console.log('done retrieving');
        } catch (error) {
            console.error(error);
        }
    }

    publishFiles(dir: string) {

    }

    public async start() {
        console.log("Visiting yeff");
        await this.fetch_url();
    }
}

const app = new App();
app.start();
