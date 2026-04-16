'use strict';

// ── Gallery preview rendering ─────────────────────────────────────────────────
// Fills each [data-gallery-category] container with a single preview thumbnail.
// Clicking it opens the full-screen lightbox for that category.

(function renderGalleries() {
  if (typeof window.GALLERY_DATA === 'undefined') return;

  document.querySelectorAll('[data-gallery-category]').forEach(function (container) {
    var cat = container.dataset.galleryCategory;
    var key = Object.keys(window.GALLERY_DATA).find(function (k) {
      return k.toLowerCase() === cat.toLowerCase();
    });
    var images = key ? window.GALLERY_DATA[key] : [];
    if (!images.length) return;

    var count = images.length;
    var label = count === 1 ? '1 photo' : count + ' photos';

    container.innerHTML =
      '<div class="gallery-preview"' +
          ' data-category-key="' + key + '"' +
          ' role="button" tabindex="0"' +
          ' aria-label="View gallery — ' + label + '">' +
        '<img src="' + images[0].src + '" alt="' + images[0].alt + '" loading="lazy" />' +
        '<div class="gallery-preview-badge">' +
          '<svg width="15" height="15" viewBox="0 0 24 24" fill="none"' +
              ' stroke="currentColor" stroke-width="2.2" aria-hidden="true">' +
            '<rect x="3" y="3" width="18" height="18" rx="2"/>' +
            '<circle cx="8.5" cy="8.5" r="1.5"/>' +
            '<polyline points="21 15 16 10 5 21"/>' +
          '</svg>' +
          ' View ' + label +
        '</div>' +
      '</div>';
  });
}());

// ── Lightbox (module-scope so both gallery previews & card carousels can use it)

var lightboxState   = { images: [], index: 0 };
var lightboxOverlay = document.getElementById('lightbox');
var lightboxImg, lightboxClose, lightboxPrev, lightboxNext, lightboxCounter;

if (lightboxOverlay) {
  lightboxImg     = lightboxOverlay.querySelector('.lightbox-img');
  lightboxClose   = lightboxOverlay.querySelector('.lightbox-close');
  lightboxPrev    = lightboxOverlay.querySelector('.lightbox-prev');
  lightboxNext    = lightboxOverlay.querySelector('.lightbox-next');
  lightboxCounter = lightboxOverlay.querySelector('.lightbox-counter');
}

function updateSlide() {
  if (!lightboxOverlay) return;
  var item = lightboxState.images[lightboxState.index];
  if (lightboxImg) { lightboxImg.src = item.src; lightboxImg.alt = item.alt; }
  if (lightboxCounter) {
    lightboxCounter.textContent = (lightboxState.index + 1) + ' / ' + lightboxState.images.length;
  }
  var multi = lightboxState.images.length > 1;
  if (lightboxPrev) lightboxPrev.style.display = multi ? '' : 'none';
  if (lightboxNext) lightboxNext.style.display = multi ? '' : 'none';
}

function openLightbox(images, startIndex) {
  if (!lightboxOverlay) return;
  lightboxState.images = images;
  lightboxState.index  = startIndex || 0;
  updateSlide();
  lightboxOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  if (lightboxClose) lightboxClose.focus();
}

function closeLightbox() {
  if (!lightboxOverlay) return;
  lightboxOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

function slide(delta) {
  var n = lightboxState.images.length;
  lightboxState.index = ((lightboxState.index + delta) % n + n) % n;
  updateSlide();
}

if (lightboxOverlay) {
  // Gallery preview click (service pages)
  document.addEventListener('click', function (e) {
    var preview = e.target.closest('.gallery-preview');
    if (!preview) return;
    var key    = preview.dataset.categoryKey;
    var images = window.GALLERY_DATA && key ? (window.GALLERY_DATA[key] || []) : [];
    if (images.length) openLightbox(images, 0);
  });

  // Gallery preview keyboard (Enter / Space)
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var preview = document.activeElement && document.activeElement.closest('.gallery-preview');
    if (!preview) return;
    e.preventDefault();
    var key    = preview.dataset.categoryKey;
    var images = window.GALLERY_DATA && key ? (window.GALLERY_DATA[key] || []) : [];
    if (images.length) openLightbox(images, 0);
  });

  if (lightboxPrev) lightboxPrev.addEventListener('click', function () { slide(-1); });
  if (lightboxNext) lightboxNext.addEventListener('click', function () { slide(1); });

  lightboxOverlay.addEventListener('click', function (e) {
    if (e.target === lightboxOverlay) closeLightbox();
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);

  document.addEventListener('keydown', function (e) {
    if (!lightboxOverlay.classList.contains('open')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   slide(-1);
    if (e.key === 'ArrowRight')  slide(1);
  });
}

// ── Homepage card carousel ─────────────────────────────────────────────────────
// Each .card-img-wrap[data-category] on index.html gets:
//   • prev / next buttons to flip through the category's photos
//   • click-on-image → full-screen lightbox at current index

(function initCardCarousels() {
  if (typeof window.GALLERY_DATA === 'undefined') return;

  document.querySelectorAll('.card-img-wrap[data-category]').forEach(function (wrap) {
    var cat = wrap.dataset.category;
    var key = Object.keys(window.GALLERY_DATA).find(function (k) {
      return k.toLowerCase() === cat.toLowerCase();
    });
    var images = key ? window.GALLERY_DATA[key] : [];
    if (!images.length) return;

    var idx     = 0;
    var img     = wrap.querySelector('img');
    var btnPrev = wrap.querySelector('.card-prev');
    var btnNext = wrap.querySelector('.card-next');
    var counter = wrap.querySelector('.card-counter');

    function update() {
      if (img)     { img.src = images[idx].src; img.alt = images[idx].alt; }
      if (counter) { counter.textContent = (idx + 1) + ' / ' + images.length; }
    }

    update(); // sync counter with whichever image is already shown

    if (images.length <= 1) {
      if (btnPrev) btnPrev.style.display = 'none';
      if (btnNext) btnNext.style.display = 'none';
    }

    if (btnPrev) {
      btnPrev.addEventListener('click', function (e) {
        e.stopPropagation();
        idx = (idx - 1 + images.length) % images.length;
        update();
      });
    }

    if (btnNext) {
      btnNext.addEventListener('click', function (e) {
        e.stopPropagation();
        idx = (idx + 1) % images.length;
        update();
      });
    }

    // Clicking the photo opens full-screen lightbox at current slide
    if (img) {
      img.style.cursor = 'pointer';
      img.addEventListener('click', function () {
        openLightbox(images, idx);
      });
    }
  });
}());

// ── Mobile nav toggle ─────────────────────────────────────────────────────────

var navToggle = document.querySelector('.nav-toggle');
var navMenu   = document.querySelector('.nav-menu');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', function () {
    var isOpen = navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navMenu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ── Active nav link ───────────────────────────────────────────────────────────

(function setActiveNav() {
  var current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-menu a').forEach(function (link) {
    var href = link.getAttribute('href') || '';
    var page = href.split('#')[0].split('/').pop();
    if (page === current) link.setAttribute('aria-current', 'page');
  });
}());

// ── Contact / enquiry form ────────────────────────────────────────────────────

var enquiryForm = document.querySelector('#enquiry-form');

if (enquiryForm instanceof HTMLFormElement) {
  var statusMessage = enquiryForm.querySelector('.form-status');
  var submitButton  = enquiryForm.querySelector('button[type="submit"]');

  enquiryForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    if (enquiryForm.dataset.submitting === 'true') return;

    enquiryForm.dataset.submitting = 'true';
    enquiryForm.setAttribute('aria-busy', 'true');
    if (submitButton instanceof HTMLButtonElement) submitButton.disabled = true;
    if (statusMessage instanceof HTMLElement) statusMessage.textContent = 'Sending your enquiry…';

    var formData = new FormData(enquiryForm);
    var payload  = {
      name:    formData.get('name'),
      email:   formData.get('email'),
      phone:   formData.get('phone'),
      service: formData.get('service'),
      message: formData.get('message'),
    };

    try {
      var response = await fetch('/.netlify/functions/send-enquiry', {
        method:  'POST',
        body:    JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        if (statusMessage instanceof HTMLElement) {
          statusMessage.textContent = "Thanks! We'll be in touch shortly. Check your email for confirmation.";
        }
        enquiryForm.reset();
      } else {
        var errorMessage = 'Sorry, something went wrong. Please call or email us.';
        try {
          var data = await response.json();
          if (data && data.error) errorMessage = data.error;
        } catch (_) { /* ignore */ }
        if (statusMessage instanceof HTMLElement) statusMessage.textContent = errorMessage;
      }
    } catch (_) {
      if (statusMessage instanceof HTMLElement) {
        statusMessage.textContent = 'Sorry, something went wrong. Please call or email us.';
      }
    } finally {
      enquiryForm.dataset.submitting = 'false';
      enquiryForm.removeAttribute('aria-busy');
      if (submitButton instanceof HTMLButtonElement) submitButton.disabled = false;
    }
  });
}
