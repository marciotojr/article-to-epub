import http from 'https';
import fs from 'fs';

import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import Epub from 'epub-gen';

const url = process.argv[2];
const output = process.argv[3];

const css = fs.readFileSync('./css/style.css');

const request = http.request(url, (res) => {
    let html = '';
    res.on('data', (chunk) => {
        html += chunk;
    });
    res.on('end', () => {
        generateEpub(html);
    });
});
request.on('error', (e) => {
    console.log(e.message);
});
request.end();

const generateEpub = (html) => {
    const article = extractArticle(html);
    const option = {
        ...article,
        content: [{ title: article.title, data: article.content, beforeToc: true }],
        css
    }
    renderEpub(option,output);
}

const extractArticle = (data) => {
    const doc = new JSDOM(data);
    const reader = new Readability(doc.window.document);
    return reader.parse();
}

const renderEpub = (option, output) => {
    console.log(option);
    new Epub(option, output).promise.then(
        () => console.log('Ebook Generated Successfully!'),
        (err) => console.error('Failed to generate Ebook because of ', err),
    );
}
