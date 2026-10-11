#!/usr/bin/env node
'use strict';

/**
 * Writes the shared header, footer, and JSON-LD into every HTML page
 * from site.config.json. Edit that file to change address, phone, or hours,
 * then run: npm run build:chrome
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const config = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'site.config.json'), 'utf8')
);

const PAGES = [
  { file: 'index.html', home: true, jsonLd: 'business' },
  { file: 'contact-us.html', home: false, jsonLd: 'contact' },
  { file: 'privacy-policy.html', home: false },
  { file: 'affordable-kitchen-renovation-rotorua.html', home: false },
  { file: 'affordable-bathroom-renovation-rotorua.html', home: false },
  { file: 'flooring-services-rotorua.html', home: false },
  { file: 'house-painters-rotorua.html', home: false },
  { file: 'home-renovation-projects-rotorua.html', home: false },
];

function wrap(name, inner) {
  const lines = inner.trim().split('\n');
  lines[0] = '    ' + lines[0].trimStart();
  return `<!-- SITE_${name}_START -->\n${lines.join('\n')}\n    <!-- SITE_${name}_END -->`;
}

function replaceBlock(html, name, inner, fallbackRegex) {
  const wrapped = wrap(name, inner);
  const marker = new RegExp(
    `<!-- SITE_${name}_START -->[\\s\\S]*?<!-- SITE_${name}_END -->`
  );
  if (marker.test(html)) return html.replace(marker, wrapped);
  if (fallbackRegex) return html.replace(fallbackRegex, wrapped);
  return html;
}

function businessSchema(options) {
  const includeContext = !options || options.includeContext !== false;
  const data = {
    '@id': config.url + '#business',
    '@type': 'HomeAndConstructionBusiness',
    name: config.name,
    description: config.description,
    url: config.url,
    image: config.ogImage,
    telephone: config.phone,
    email: config.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${config.address.street}, ${config.address.suburb}`,
      addressLocality: config.address.city,
      addressRegion: config.address.region,
      postalCode: config.address.postalCode,
      addressCountry: config.address.country,
    },
    openingHours: config.openingHours,
    hasMap: config.mapsUrl,
    areaServed: config.areaServed,
    sameAs: [config.facebook],
  };
  if (includeContext) {
    return Object.assign({ '@context': 'https://schema.org' }, data);
  }
  return data;
}

function jsonLdScript(data) {
  const json = JSON.stringify(data, null, 2)
    .split('\n')
    .map((line, i) => (i === 0 ? line : '    ' + line))
    .join('\n');
  return `<script type="application/ld+json">\n    ${json}\n    </script>`;
}

function headerHtml(isHome) {
  const prefix = isHome ? '' : 'index.html';
  const headerAttrs = isHome ? ' id="top"' : '';
  return `<header class="site-header"${headerAttrs}>
      <div class="container header-content">
        <a class="logo" href="index.html"><img src="${config.logoPath}" alt="${config.name} logo" width="40" height="40" />${config.name}</a>
        <nav class="main-nav" aria-label="Main">
          <button class="nav-toggle" aria-expanded="false" aria-controls="nav-menu">
            <span class="sr-only">Toggle navigation</span>
            <span class="nav-toggle-bar"></span>
            <span class="nav-toggle-bar"></span>
            <span class="nav-toggle-bar"></span>
          </button>
          <ul id="nav-menu" class="nav-menu">
            <li><a href="${prefix}#services">Services</a></li>
            <li><a href="${prefix}#why">Why Us</a></li>
            <li><a href="${prefix}#projects">Projects</a></li>
            <li><a href="contact-us.html">Contact</a></li>
          </ul>
        </nav>
        <a class="button button-primary" href="contact-us.html">Work With Us</a>
      </div>
    </header>`;
}

function footerHtml() {
  return `<footer class="site-footer">
      <div class="container footer-grid">
        <div>
          <h3>Build With ${config.name}</h3>
          <p>${config.hoursDisplay}</p>
          <p>
            Transform your home with Bay of Plenty's trusted renovation experts.
            We deliver quality workmanship, modern design, and seamless service — from
            start to finish.
          </p>
        </div>
        <div>
          <h3>Our Services</h3>
          <ul>
            <li><a href="affordable-kitchen-renovation-rotorua.html">Kitchen Renovation</a></li>
            <li><a href="affordable-bathroom-renovation-rotorua.html">Bathroom Renovation</a></li>
            <li><a href="flooring-services-rotorua.html">Flooring &amp; Tiling</a></li>
            <li><a href="house-painters-rotorua.html">Painting</a></li>
            <li><a href="home-renovation-projects-rotorua.html">Projects</a></li>
          </ul>
        </div>
        <div>
          <h3>Office in Rotorua</h3>
          <address>
            <a href="${config.mapsUrl}" target="_blank" rel="noopener noreferrer">${config.address.full}</a>
          </address>
          <p><a href="tel:${config.phone}">${config.phoneDisplay}</a></p>
          <p><a href="mailto:${config.email}">${config.email}</a></p>
          <p><a href="${config.facebook}" target="_blank" rel="noopener noreferrer">Facebook</a></p>
        </div>
      </div>
      <div class="container footer-bottom">
        <p>Copyright &copy; ${config.copyrightYear} ${config.name}</p>
        <a href="privacy-policy.html">Privacy Policy</a>
      </div>
    </footer>`;
}

function contactCardHtml() {
  const a = config.address;
  return `<div class="contact-card">
              <h2>Our Rotorua office</h2>
              <address>
                <a href="${config.mapsUrl}" target="_blank" rel="noopener noreferrer">
                  ${a.street}<br />
                  ${a.suburb}<br />
                  ${a.city} ${a.postalCode}
                </a>
              </address>
              <p><a href="tel:${config.phone}">${config.phoneDisplay}</a></p>
              <p><a href="mailto:${config.email}">${config.email}</a></p>
              <p>${config.hoursDisplay}</p>
              <a class="button button-ghost" href="${config.mapsUrl}" target="_blank" rel="noopener noreferrer">Open in Google Maps</a>
            </div>`;
}

function contactMapHtml() {
  return `<div class="contact-map">
          <iframe
            title="Map of ${config.name} at ${config.address.full}"
            src="${config.mapsEmbedUrl}"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            allowfullscreen
          ></iframe>
        </div>`;
}

function patchMeta(html) {
  html = html.replace(
    /<link rel="icon"[^>]*>/,
    `<link rel="icon" href="${config.logoPath}" type="image/jpeg" />`
  );
  html = html.replace(
    /<meta property="og:image"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:image"       content="${config.ogImage}" />`
  );
  if (!html.includes('property="og:image:alt"')) {
    html = html.replace(
      /(<meta property="og:image"\s+content="[^"]*"\s*\/>)/,
      `$1\n    <meta property="og:image:alt"   content="${config.name}" />\n    <meta property="og:locale"      content="en_NZ" />\n    <meta name="twitter:card"       content="summary" />`
    );
  }
  return html;
}

for (const page of PAGES) {
  const filePath = path.join(ROOT, page.file);
  let html = fs.readFileSync(filePath, 'utf8');

  html = replaceBlock(
    html,
    'HEADER',
    headerHtml(page.home),
    /<header class="site-header"[\s\S]*?<\/header>/
  );
  html = replaceBlock(
    html,
    'FOOTER',
    footerHtml(),
    /<footer class="site-footer"[\s\S]*?<\/footer>/
  );

  if (page.jsonLd === 'business') {
    html = replaceBlock(
      html,
      'JSON_LD',
      jsonLdScript(businessSchema()),
      /<script type="application\/ld\+json">[\s\S]*?<\/script>/
    );
  }

  if (page.jsonLd === 'contact') {
    const business = businessSchema({ includeContext: false });
    const graph = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'ContactPage',
          '@id': config.url + 'contact-us.html',
          url: config.url + 'contact-us.html',
          name: 'Contact Us | ' + config.name,
          mainEntity: { '@id': config.url + '#business' },
        },
        business,
      ],
    };
    html = replaceBlock(
      html,
      'JSON_LD',
      jsonLdScript(graph),
      /<script type="application\/ld\+json">[\s\S]*?<\/script>/
    );
    if (!html.includes('SITE_JSON_LD_START')) {
      html = html.replace(
        '<link rel="stylesheet" href="assets/css/style.css" />',
        `<link rel="stylesheet" href="assets/css/style.css" />\n    ${wrap('JSON_LD', jsonLdScript(graph))}`
      );
    }
    html = replaceBlock(html, 'CONTACT_CARD', contactCardHtml());
    html = replaceBlock(html, 'CONTACT_MAP', contactMapHtml());
  }

  html = patchMeta(html);
  fs.writeFileSync(filePath, html);
  console.log('Updated', page.file);
}
