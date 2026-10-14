/* Visit Locals — CMS-driven Experience catalogue */
(function () {
  'use strict';

  const FALLBACK_IMAGES = {
    Nature: '/assets/experience/highlands.png',
    Adventure: '/assets/experience/maritime.png',
    Lifestyle: '/assets/experience/rice.png',
    Culinary: '/assets/experience/rice.png',
    Culture: '/assets/experience/artisan.png',
    Heritage: '/assets/experience/artisan.png',
    Wellness: '/assets/experience/rice.png',
    Luxury: '/assets/experience/artisan.png',
    default: '/assets/experience/jakarta.png'
  };

  let allExperiences = [];
  let visibleExperiences = [];
  let expanded = false;
  let activeFilter = '';

  const esc = (value) => {
    const div = document.createElement('div');
    div.textContent = value == null ? '' : String(value);
    return div.innerHTML;
  };

  const plain = (value) => String(value || '').replace(/<[^>]*>/g, '').trim();

  const field = (item, key) => (item && item.acf && item.acf[key] != null ? item.acf[key] : '');

  function imageFor(item) {
    const hero = field(item, 'hero_image');
    if (typeof hero === 'string' && /^https?:\/\//i.test(hero)) return hero;
    if (hero && typeof hero === 'object' && hero.url) return hero.url;
    const category = String(field(item, 'category') || 'default');
    const match = Object.keys(FALLBACK_IMAGES).find(k => category.toLowerCase().includes(k.toLowerCase()));
    return FALLBACK_IMAGES[match || 'default'];
  }

  function durationLabel(value) {
    const text = plain(value);
    return text || 'Custom itinerary';
  }

  function destinationLabel(value) {
    return plain(value) || 'Indonesia';
  }

  function renderCards(items) {
    const grid = document.getElementById('ledger-grid');
    if (!grid) return;

    grid.innerHTML = items.map((item, index) => {
      const acf = item.acf || {};
      const title = plain(item.title?.rendered || item.title || 'Untitled Experience');
      const destination = destinationLabel(acf.destination);
      const category = plain(acf.category) || 'Experience';
      const description = plain(acf.short_description || acf.full_description).slice(0, 280);
      const duration = durationLabel(acf.duration);
      const price = plain(acf.price);
      const currency = plain(acf.currency);
      const priceLabel = price ? `${currency ? esc(currency) + ' ' : ''}${esc(price)}` : 'Request a proposal';
      const ref = plain(item.slug || `experience-${index + 1}`);
      const img = imageFor(item);
      const hidden = !expanded && index >= 5 ? ' itinerary-hidden' : '';

      return `
        <article class="vl-ledger-card bg-surface-container-lowest rounded-xl p-6 lg:p-8 shadow-sm hover:shadow-md transition-shadow${hidden}" data-ledger-index="${index}" data-cms-index="${index}">
          <div class="vl-card-media vl-ledger-media">
            <img alt="${esc(title)} — Visit Locals Indonesia" decoding="async" loading="lazy" src="${esc(img)}"/>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div class="lg:col-span-3">
              <div class="flex items-center gap-2 mb-2 flex-wrap">
                <span class="px-2.5 py-1 rounded bg-surface-container-highest text-primary font-label-md text-[11px] uppercase tracking-wider">${esc(duration)}</span>
                <span class="px-2.5 py-1 rounded bg-surface-container text-on-surface-variant font-label-md text-[11px] uppercase tracking-wider">${esc(category)}</span>
              </div>
              <h3 class="font-display-lg text-2xl text-primary font-normal">${esc(title)}</h3>
              <p class="font-label-md text-xs text-on-surface-variant mt-1">${esc(destination)}</p>
            </div>
            <div class="lg:col-span-6">
              <p class="font-body-lg text-sm text-on-surface-variant leading-relaxed">${esc(description)}</p>
              <div class="mt-4 flex flex-wrap gap-2">
                <span class="text-[11px] font-label-md px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">${esc(ref)}</span>
                ${price ? `<span class="text-[11px] font-label-md px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">${priceLabel}</span>` : ''}
              </div>
            </div>
            <div class="lg:col-span-3 flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4">
              <div class="text-left lg:text-right">
                <span class="block text-xs font-label-md text-on-surface-variant">Destination</span>
                <span class="font-mono text-xs text-primary font-bold">${esc(destination)}</span>
              </div>
              <button class="px-5 py-2.5 rounded-lg bg-primary-container text-on-primary hover:bg-primary font-label-md text-xs uppercase tracking-wider transition-colors" type="button" data-cms-open="${index}">
                View Experience
              </button>
            </div>
          </div>
        </article>`;
    }).join('');

    grid.querySelectorAll('[data-cms-open]').forEach(button => {
      button.addEventListener('click', () => openCmsExperience(Number(button.dataset.cmsOpen)));
    });
  }

  function parseList(value) {
    const text = plain(value);
    if (!text) return [];
    return text.split(/\r?\n|\s*;\s*|\s*•\s*/).map(x => x.trim()).filter(Boolean);
  }

  function itineraryRows(value) {
    const text = plain(value);
    if (!text) return [];
    const parts = text.split(/\r?\n|\s*;\s*/).map(x => x.trim()).filter(Boolean);
    return parts.map((part, i) => {
      const m = part.match(/^(DAY\s*\d+(?:\s*[–-]\s*\d+)?|FINAL DAY|DAY\s*\d+)\s*[:—-]\s*(.*)$/i);
      if (m) return [m[1], 'Field itinerary', m[2]];
      return [`${String(i + 1).padStart(2, '0')}`, 'Itinerary', part];
    });
  }

  function openCmsExperience(index) {
    const item = visibleExperiences[index];
    if (!item) return;
    const acf = item.acf || {};
    const title = plain(item.title?.rendered || item.title || 'Visit Locals Experience');
    const destination = destinationLabel(acf.destination);
    const duration = durationLabel(acf.duration);
    const description = plain(acf.full_description || acf.short_description);
    const rows = itineraryRows(acf.itinerary);
    const includes = parseList(acf.whats_included);
    const extra = [];
    if (acf.local_guide) extra.push(`Local guide: ${plain(acf.local_guide)}`);
    if (acf.best_time_to_visit) extra.push(`Best time: ${plain(acf.best_time_to_visit)}`);
    if (acf.know_before_you_go) extra.push(`Know before you go: ${plain(acf.know_before_you_go)}`);
    if (acf.guest_guidelines) extra.push(`Guest guidelines: ${plain(acf.guest_guidelines)}`);
    const allIncludes = includes.concat(extra);

    const set = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value || ''; };
    set('detail-kicker', `${plain(acf.category) || 'Experience'} · ${destination}`);
    set('detail-title', title);
    set('detail-duration', duration);
    set('detail-route', destination);
    set('detail-intro', description);
    set('detail-kind', 'Visit Locals Experience');

    const itineraryEl = document.getElementById('detail-itinerary');
    if (itineraryEl) {
      itineraryEl.innerHTML = (rows.length ? rows : [['INFO', 'Experience details', description || 'Details available on request.']]).map(x =>
        `<div class="flex gap-4"><div class="w-20 shrink-0 text-xs font-bold text-tertiary pt-0.5">${esc(x[0])}</div><div><h5 class="font-display-lg text-lg text-primary">${esc(x[1])}</h5><p class="text-sm text-on-surface-variant leading-relaxed mt-1">${esc(x[2])}</p></div></div>`
      ).join('');
    }

    const includesEl = document.getElementById('detail-includes');
    if (includesEl) {
      includesEl.innerHTML = (allIncludes.length ? allIncludes : ['Local coordination', 'On-the-ground guidance']).map(x =>
        `<li class="flex items-start gap-2"><span class="w-1.5 h-1.5 mt-2 rounded-full bg-secondary shrink-0"></span><span>${esc(x)}</span></li>`
      ).join('');
    }

    const wa = document.getElementById('detail-wa');
    if (wa) {
      const number = String(acf.whatsapp_cta || '').match(/\d{8,}/)?.[0] || '6285285469417';
      wa.href = 'https://wa.me/' + number + '?text=' + encodeURIComponent(`Hello Visit Locals, I would like to discuss ${title} in ${destination}. Please share availability, requirements, itinerary details, and next steps.`);
    }

    const modal = document.getElementById('vl-detail-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('overflow-hidden');
    }
  }

  function applyFilter(query) {
    const q = String(query || '').trim().toLowerCase();
    activeFilter = q;
    visibleExperiences = allExperiences.filter(item => {
      const acf = item.acf || {};
      const haystack = [
        item.slug,
        plain(item.title?.rendered || item.title),
        acf.destination,
        acf.category,
        acf.region,
        acf.experience_type,
        acf.short_description,
        acf.full_description
      ].join(' ').toLowerCase();
      return !q || haystack.includes(q);
    });
    expanded = !!q;
    renderCards(visibleExperiences);
    updateMoreButton();
  }

  function updateMoreButton() {
    const button = document.getElementById('itinerary-show-more');
    if (!button) return;
    const hiddenCount = Math.max(0, visibleExperiences.length - 5);
    button.classList.toggle('hidden', hiddenCount === 0);
    button.innerHTML = expanded
      ? 'Show fewer curated experiences <span class="material-symbols-outlined notranslate text-base">expand_less</span>'
      : `Show ${hiddenCount} more curated experiences <span class="material-symbols-outlined notranslate text-base">expand_more</span>`;
  }

  function toggleCmsMore() {
    expanded = !expanded;
    renderCards(visibleExperiences);
    updateMoreButton();
  }

  async function loadCmsExperiences() {
    const grid = document.getElementById('ledger-grid');
    if (!grid || !window.VisitLocalsCMS) return;

    try {
      grid.setAttribute('aria-busy', 'true');
      const data = await window.VisitLocalsCMS.getExperiences();
      allExperiences = Array.isArray(data) ? data : [];
      visibleExperiences = allExperiences.slice();
      expanded = false;
      renderCards(visibleExperiences);
      updateMoreButton();
    } catch (error) {
      console.error('[Visit Locals CMS]', error);
      const note = document.createElement('div');
      note.className = 'col-span-full rounded-xl bg-surface-container p-6 text-sm text-on-surface-variant';
      note.textContent = 'Experience catalogue could not be loaded from the CMS. Please try again shortly.';
      grid.innerHTML = '';
      grid.appendChild(note);
    } finally {
      grid.setAttribute('aria-busy', 'false');
    }
  }

  window.filterDestination = function (destination) {
    const input = document.getElementById('destination-search-input');
    if (input) input.value = destination || '';
    applyFilter(destination || '');
    document.getElementById('curated-journeys')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  window.toggleItineraries = toggleCmsMore;

  document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('destination-search-input');
    if (input) {
      let timer;
      input.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(() => applyFilter(input.value), 120);
      });
    }
    loadCmsExperiences();
  });
})();
