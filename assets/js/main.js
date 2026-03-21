'use strict';

// ── Gallery rendering ─────────────────────────────────────────────────────────
// Each [data-gallery-category] container gets a single preview image.
// Clicking the preview opens a full-screen slider (lightbox) for that category.

(function renderGalleries() {
  if (typeof window.GALLERY_DATA === 'undefined') return;

  document.querySelectorAll('[data-gallery-category]').forEach(function (container) {
    var cat = container.dataset.galleryCategory;

    // Case-insensitive key lookup
    var key = Object.keys(window.GALLERY_DATA).find(function (k) {
      return k.toLowerCase() === cat.toLowerCase();
    });
    var images = key ? window.GALLERY_DATA[key] : [];

    if (!images.length) return;

    var first  = images[0];
    var count  = images.length;
    var label  = count === 1 ? '1 photo' : count + ' photos';

    container.innerHTML =
      '<div class="gallery-preview"' +
          ' data-category-key="' + key + '"' +
          ' role="button"' +
          ' tabindex="0"' +
          ' aria-label="View gallery — ' + label + '">' +
        '<img src="' + first.src + '" alt="' + first.alt + '" loading="lazy" />' +
        '<div class="gallery-preview-badge">' +
          '<svg width="15" height="15" viewBox="0 0 24 24" fill="none"' +
              ' stroke="currentColor" stroke-width="2.2" aria-hidden="true">' +
            '<rect x="3" y="3" width="18" height="18" rx="2"/>' +
            '<circle cx="8.5" cy="8.5" r="1.5"/>' +
            '<polyline points="21 15 16 10 5 21"/>' +
          '</svg>' +
          'View ' + label +
        '</div>' +
      '</div>';
  });
}());

// ── Lightbox slider ───────────────────────────────────────────────────────────

var lightboxState = { images: [], index: 0 };
var lightboxOverlay = document.getElementById('lightbox');

if (lightboxOverlay) {
  var lightboxImg     = lightboxOverlay.querySelector('.lightbox-img');
  var lightboxClose   = lightboxOverlay.querySelector('.lightbox-close');
  var lightboxPrev    = lightboxOverlay.querySelector('.lightbox-prev');
  var lightboxNext    = lightboxOverlay.querySelector('.lightbox-next');
  var lightboxCounter = lightboxOverlay.querySelector('.lightbox-counter');

  function updateSlide() {
    var img = lightboxState.images[lightboxState.index];
    if (lightboxImg) { lightboxImg.src = img.src; lightboxImg.alt = img.alt; }
    if (lightboxCounter) {
      lightboxCounter.textContent =
        (lightboxState.index + 1) + ' / ' + lightboxState.images.length;
    }
    var multi = lightboxState.images.length > 1;
    if (lightboxPrev) lightboxPrev.style.display = multi ? '' : 'none';
    if (lightboxNext) lightboxNext.style.display = multi ? '' : 'none';
  }

  function openLightbox(images, startIndex) {
    lightboxState.images = images;
    lightboxState.index  = startIndex || 0;
    updateSlide();
    lightboxOverlay.classList.add('open');
    if (lightboxClose) lightboxClose.focus();
  }

  function slide(delta) {
    var n = lightboxState.images.length;
    lightboxState.index = ((lightboxState.index + delta) % n + n) % n;
    updateSlide();
  }

  // Open on preview click — event delegation handles dynamically-rendered HTML
  document.addEventListener('click', function (e) {
    var preview = e.target.closest('.gallery-preview');
    if (!preview) return;
    var key    = preview.dataset.categoryKey;
    var images = window.GALLERY_DATA && key ? (window.GALLERY_DATA[key] || []) : [];
    if (images.length) openLightbox(images, 0);
  });

  // Open preview with Enter / Space (keyboard accessibility)
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var preview = document.activeElement && document.activeElement.closest('.gallery-preview');
    if (!preview) return;
    e.preventDefault();
    var key    = preview.dataset.categoryKey;
    var images = window.GALLERY_DATA && key ? (window.GALLERY_DATA[key] || []) : [];
    if (images.length) openLightbox(images, 0);
  });

  // Arrow navigation buttons
  if (lightboxPrev) lightboxPrev.addEventListener('click', function () { slide(-1); });
  if (lightboxNext) lightboxNext.addEventListener('click', function () { slide(1); });

  // Close on backdrop click
  lightboxOverlay.addEventListener('click', function (e) {
    if (e.target === lightboxOverlay) lightboxOverlay.classList.remove('open');
  });

  // Close button
  if (lightboxClose) {
    lightboxClose.addEventListener('click', function () {
      lightboxOverlay.classList.remove('open');
    });
  }

  // Keyboard: arrows to navigate, Escape to close
  document.addEventListener('keydown', function (e) {
    if (!lightboxOverlay.classList.contains('open')) return;
    if (e.key === 'Escape')      lightboxOverlay.classList.remove('open');
    if (e.key === 'ArrowLeft')   slide(-1);
    if (e.key === 'ArrowRight')  slide(1);
  });
}

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
