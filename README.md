# BOP Renovations (Static Site)

Static website for BOP Renovations, hosted on Netlify.

## Structure
- `index.html` and service/contact/privacy pages
- `site.config.json` — business name, address, phone, hours, and map links
- `assets/css/style.css`
- `assets/js/main.js` — navigation, galleries, and the contact form
- `netlify/functions/send-enquiry.js` — emails enquiries via Gmail
- `scripts/build-gallery.js` — generates `assets/js/gallery-data.js`
- `scripts/inject-chrome.js` — writes the shared header, footer, and JSON-LD into every page

## Run locally
Serve the folder with a simple static server (opening `index.html` as a file will not send the contact form):

```bash
npx --yes serve .
```

The contact form posts to `/.netlify/functions/send-enquiry`. For local form testing, use the Netlify CLI or deploy a draft. See `SETUP_GUIDE.md` for Gmail and Netlify environment variables.

## Build
```bash
npm run build
```

This regenerates the photo gallery and refreshes headers, footers, and structured data from `site.config.json`.

To change the business address or phone, edit `site.config.json` and run `npm run build:chrome`.
