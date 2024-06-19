# extractor

Prototype for extracting Pdf information from URL.

With this repository, a predetermined [endpoint](https://www.dbinfrago.com/web/schienennetz/netzzugang-und-regulierung/regelwerke/betrieblich-technisch_regelwerke/betrieblich_technisches_regelwerk-12596092#) can be scraped,
and the extracted data can be published on the Databus.

## Setup & Install

```bash
npm install
```

Make sure `post.sh` is executable

```bash
chmod +x post.sh
```

## Quickstart

### Scrape the information from the endpoint

```bash
npm start
```

### Publish the scraped information on the databus

```bash
./post.sh
```
