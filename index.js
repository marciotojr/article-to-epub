import http from 'https';
import fs  from 'fs';

import { Readability } from '@mozilla/readability';
import {JSDOM} from "jsdom";
import { EPub }  from "@lesjoursfr/html-to-epub";

const url = process.argv[2];

process.argv.forEach(function (val, index, array) {
    console.log(index + ': ' + val);
  });

const css = fs.readFileSync(`./css/style.css`);

var request = http.request(url, function (res) {
    var data = '';
    res.on('data', function (chunk) {
        data += chunk;
    });
    res.on('end', function () {
        var doc = new JSDOM(data);
          let reader = new Readability(doc.window.document);
          let article = reader.parse();
          console.log(Object.keys(article));
          article.content=[{title:article.title,data:article.content}]
          article.css = css;
          const epub = new EPub(article, '/mnt/e/output.epub');
        epub.render()
            .then(() => {
                console.log("Ebook Generated Successfully!");
            })
            .catch((err) => {
                console.error("Failed to generate Ebook because of ", err);
            });
        //   fs.writeFile('/mnt/e/output.html',article.content,(err)=>{console.log(err)})
    });
});
request.on('error', function (e) {
    console.log(e.message);
});
request.end();