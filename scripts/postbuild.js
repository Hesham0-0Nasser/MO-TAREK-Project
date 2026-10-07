// Post-export step for GitHub Pages.
//  1. Inject the head tags (no-index, fonts, title, RTL default) into dist/index.html. Expo's
//     single-page export doesn't use a custom HTML template, so we patch the generated file.
//  2. Serve index.html as 404.html so a hard refresh on /admin or /shipment/<code> loads the app,
//     which then resolves the route on the client (GitHub Pages has no server-side routing).
//  3. Add .nojekyll so folders starting with "_" (like _expo) are served.
const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, '..', 'dist');
const indexPath = path.join(dist, 'index.html');

const head = `
    <meta name="robots" content="noindex, nofollow" />
    <meta name="description" content="Interactive demo of a shipment tracking app. Sample data only." />
    <title>Shipment Tracker · Demo</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap" rel="stylesheet" />
    <style>body{background:#EEF0F3}input::placeholder{color:#98A2B3}</style>`;

let html = fs.readFileSync(indexPath, 'utf8');
html = html.replace(/<title>.*?<\/title>/s, head.trim());
fs.writeFileSync(indexPath, html);

fs.copyFileSync(indexPath, path.join(dist, '404.html'));
fs.writeFileSync(path.join(dist, '.nojekyll'), '');
console.log('postbuild: patched index.html, wrote 404.html and .nojekyll');
