import http from 'https';
import fs from 'fs';

import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import Epub from 'epub-gen';
import ogs from 'open-graph-scraper';

const url = process.argv[2];
const output = process.argv[3];

const css = fs.readFileSync('./css/style.css');

const extractArticle = (data) => {
    const doc = new JSDOM(data);
    const reader = new Readability(doc.window.document);
    return reader.parse();
};

const extractOGMetadata = async (html) => await ogs({ html });

const renderEpub = (option) => {
    new Epub(option, output).promise.then(
        () => console.log('Ebook Generated Successfully!'),
        (err) => console.error('Failed to generate Ebook because of ', err),
    );
};

const generateEpub = async (html) => {
    const article = extractArticle(html);
    const option = {
        ...article,
        content: [
            {
                title: article.title,
                data: article.content,
                beforeToc: true,
            },
        ],
        author: article.byline,
        publisher: article.siteName,
        css,
    };
    try {
        const metadata = await extractOGMetadata(html);
        // console.log(Object.keys(metadata.result));
        console.log(metadata.result.twitterImage);
        option.cover = metadata.result.twitterImage
            ? metadata.result.twitterImage[0].url
            : null;
    } finally {
        renderEpub(option, output);
    }
};

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
