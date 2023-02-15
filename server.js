const express = require('express');
const http = require('http');
const path = require('path');
const process = require('process');

require('dotenv').config();
const app = express();

const multiPagePathList = [ '/', '/categories', '/setTopBoxes' ];
const nonPageExtensionList = [ 'js', 'css', 'txt', 'json' ];

multiPagePathList.forEach(pagePath => {
    app.get(pagePath, (req, res) => {
        res.set({
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Date": Date.now()
        });
        res.sendFile(path.join(__dirname, "build", "index.html"))
    })
});

nonPageExtensionList.forEach(pageExtension => {
    app.get(`/**/*.${pageExtension}`, (req, res) => {
        res.set({
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Date": Date.now()
        });
        res.sendFile(path.join(__dirname, "build", req.originalUrl))
    })
});

http.createServer(app).listen(process.env['PORT'], () => {
    console.log(`App is listening at ${process.env['PORT']}`);
})