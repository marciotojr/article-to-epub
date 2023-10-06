import http from 'https';
import fs from 'fs';

import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import { EPub } from '@lesjoursfr/html-to-epub';

const url = process.argv[2];

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
    const epub = new EPub(article, '/mnt/e/output.epub');
    epub.render()
      .then(() => {
        console.log('Ebook Generated Successfully!');
      })
      .catch((err) => {
        console.error('Failed to generate Ebook because of ', err);
      });
  });
});
request.on('error', (e) => {
  console.log(e.message);
});
request.end();
