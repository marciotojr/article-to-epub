import http from 'https';
import fs from 'fs';

import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import Epub from 'epub-gen';

const url = process.argv[2];
const outupt = process.argv[2];

const css = fs.readFileSync('./css/style.css');

const request = http.request(url, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        const doc = new JSDOM(data);
        const reader = new Readability(doc.window.document);
        const article = reader.parse();
        article.content = [{ title: article.title, data: article.content }];
        article.css = css;
        new Epub(article, outupt).promise.then(
            () => console.log('Ebook Generated Successfully!'),
            (err) => console.error('Failed to generate Ebook because of ', err),
        );
    });
});
request.on('error', (e) => {
    console.log(e.message);
});
request.end();
