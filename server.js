/**
 * @file server.ts
 *
 * Entry point for Heroku. Do not use this file for local development.
 */
require('module-alias/register');
const path = require('path');
const express = require('express');
const app = require('./bedes-backend/dist/bedes-backend/src/App').default;

app.use(express.static(path.join(__dirname, 'bedes-frontend', 'dist', 'Bedes-App')));
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'bedes-frontend', 'dist', 'Bedes-App', 'index.html'));
});
// Start the app by listening on the default Heroku port (or 8080 if local).
const port = process.env.PORT || 8080;
app.listen(port, (err) => {
    if (err) {
        return console.log(err);
    }

    return console.log(`server is listening on ${port}`);
});
