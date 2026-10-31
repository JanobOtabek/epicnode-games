/* EpicNode Games — umumiy skript (katalog, o'yin sahifasi, reklama) */
(function(){
'use strict';
const C = window.EPICNODE || {};
const $ = (s, r) => (r || document).querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ---------- Google Analytics ---------- */
// analyticsId kiritilgan bo'lsa, tashriflar va o'yin boshlanishlari hisoblanadi.
window.dataLayer = window.dataLayer || [];
window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };
const gaOn = /^G-[A-Z0-9]{4,}$/.test(C.analyticsId || '');
if (gaOn) {
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(C.analyticsId);
  document.head.appendChild(s);
  gtag('js', new Date());
  gtag('config', C.analyticsId);
}
function track(name, params) { if (gaOn) try { gtag('event', name, params || {}); } catch (e) {} }

/* ---------- AdSense ---------- */
// Publisher ID kiritilgan bo'lsa, AdSense skripti yuklanadi (Auto ads ham shu orqali ishlaydi)
// va H5 Games Ad Placement API ishga tushiriladi.
window.adsbygoogle = window.adsbygoogle || [];
window.adBreak = window.adConfig = function(o){ window.adsbygoogle.push(o); };
const adsOn = /^ca-pub-\d{10,}$/.test(C.adsenseClient || '');
if (adsOn) {
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(C.adsenseClient);
  s.crossOrigin = 'anonymous';
  s.setAttribute('data-ad-frequency-hint', (C.adFrequencySeconds || 120) + 's');
  if (C.adsenseTest) s.setAttribute('data-adbreak-test', 'on');
  document.head.appendChild(s);
  adConfig({ preloadAdBreaks: 'on', sound: 'on' });
}

/* O'yin oldidan reklama. Reklama bo'lmasa yoki xato bo'lsa ham o'yin baribir boshlanadi. */
function adThenPlay(type, name, done) {
  if (!adsOn) { done(); return; }
  let finished = false;
  const go = () => { if (!finished) { finished = true; done(); } };
  try {
    adBreak({ type, name, adBreakDone: go });
  } catch (e) { go(); }
  setTimeout(go, 9000); // xavfsizlik: API javob bermasa ham kutib qolmaymiz
}

/* ---------- ma'lumot ---------- */
let gamesCache = null;
async function loadGames() {
  if (gamesCache) return gamesCache;
  try {
    const r = await fetch('games.json', { cache: 'no-cache' });
    const j = await r.json();
    gamesCache = (j.games || []).filter(g => !g.hidden);
  } catch (e) {
    console.warn('games.json yuklanmadi', e);
    gamesCache = [];
  }
  return gamesCache;
}

function cardHTML(g) {
  return `<a class="gcard" href="game.html?id=${encodeURIComponent(g.id)}" aria-label="${esc(g.title)} o'ynash">
    <div class="th"><img src="${esc(g.thumb)}" alt="" loading="lazy">
      ${g.featured ? '<span class="badge">TOP</span>' : ''}
      <span class="play"><svg width="16" height="16" viewBox="0 0 24 24" fill="#140a00"><path d="M7 4v16l13-8z"/></svg></span></div>
    <div class="meta"><h3>${esc(g.title)}</h3><div class="c">${esc(g.category || '')}</div></div></a>`;
}
function soonHTML() {
  return `<div class="gcard soon" aria-hidden="true"><div class="th"><span>Tez orada</span></div>
    <div class="meta"><h3>Yangi o'yin</h3><div class="c">Kutib qoling</div></div></div>`;
}

/* ---------- bosh sahifa ---------- */
async function initHome() {
  const grid = $('#grid'); if (!grid) return;
  const games = await loadGames();
  const cats = ['Hammasi', ...new Set(games.map(g => g.category).filter(Boolean))];
  const catsEl = $('#cats');
  let cat = 'Hammasi', q = '';
  catsEl.innerHTML = cats.map(c => `<button class="cat" type="button" aria-pressed="${c === cat}" data-c="${esc(c)}">${esc(c)}</button>`).join('');
  catsEl.addEventListener('click', e => {
    const b = e.target.closest('.cat'); if (!b) return;
    cat = b.dataset.c;
    catsEl.querySelectorAll('.cat').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    render();
  });
  const inp = $('#q');
  if (inp) inp.addEventListener('input', () => { q = inp.value.trim().toLowerCase(); render(); });

  const feat = games.find(g => g.featured) || games[0];
  if (feat) {
    $('#heroImg').src = feat.thumb;
    $('#heroTitle').textContent = feat.title;
    $('#heroText').textContent = feat.short || '';
    $('#heroBtn').href = 'game.html?id=' + encodeURIComponent(feat.id);
    $('#hero').classList.remove('hidden');
  }

  function render() {
    const list = games.filter(g =>
      (cat === 'Hammasi' || g.category === cat) &&
      (!q || (g.title + ' ' + (g.tags || []).join(' ') + ' ' + (g.category || '')).toLowerCase().includes(q)));
    $('#count').textContent = list.length + " ta o'yin";
    if (!list.length) { grid.innerHTML = '<div class="empty" style="grid-column:1/-1">Hech narsa topilmadi.</div>'; return; }
    let html = list.map(cardHTML).join('');
    if (!q && cat === 'Hammasi') for (let i = list.length; i < 4; i++) html += soonHTML();
    grid.innerHTML = html;
  }
  render();
}

/* ---------- o'yin sahifasi ---------- */
async function initGame() {
  const stage = $('#stage'); if (!stage) return;
  const id = new URLSearchParams(location.search).get('id');
  const games = await loadGames();
  const g = games.find(x => x.id === id);
  if (!g) {
    $('#gameMain').innerHTML = `<div class="empty">O'yin topilmadi. <a href="index.html" style="color:var(--orange)">Bosh sahifaga qaytish</a></div>`;
    return;
  }
  document.title = g.title + " — o'ynash | EpicNode Games";
  const md = document.querySelector('meta[name="description"]');
  if (md) md.setAttribute('content', g.short || g.title);

  $('#coverImg').src = g.thumb;
  $('#coverTitle').textContent = g.title;
  $('#gTitle').textContent = g.title;
  $('#gDesc').textContent = g.description || g.short || '';
  $('#gTags').innerHTML = (g.age ? `<span class="tag" style="background:rgba(255,77,79,.16);color:#ffb3b4">${esc(g.age)}</span>` : '') +
    [g.category, ...(g.tags || [])].filter((v, i, a) => v && a.indexOf(v) === i)
    .map(t => `<span class="tag">${esc(t)}</span>`).join('');
  const how = g.howto || [];
  $('#gHow').innerHTML = how.map(h => `<li>${esc(h)}</li>`).join('');
  $('#howPanel').classList.toggle('hidden', !how.length);
  const ctl = g.controls || [];
  $('#gKeys').innerHTML = ctl.map(([k, v]) => `<kbd>${esc(k)}</kbd><span>${esc(v)}</span>`).join('');
  $('#ctlPanel').classList.toggle('hidden', !ctl.length);

  const others = games.filter(x => x.id !== g.id);
  $('#more').innerHTML = others.length
    ? others.slice(0, 6).map(o => `<a class="mini" href="game.html?id=${encodeURIComponent(o.id)}"><img src="${esc(o.thumb)}" alt="" loading="lazy"><div><b>${esc(o.title)}</b><span>${esc(o.category || '')}</span></div></a>`).join('')
    : `<p style="color:var(--muted);margin:0;font-size:14px">Yangi o'yinlar tez orada qo'shiladi.</p>`;

  let frame = null;
  function start() {
    $('#cover').classList.add('hidden');
    track('game_start', { game_id: g.id, game_title: g.title, game_category: g.category || '' });
    adThenPlay('start', 'game-start-' + g.id, () => {
      frame = document.createElement('iframe');
      frame.src = g.path;
      frame.title = g.title;
      frame.allow = 'fullscreen; autoplay; gamepad; pointer-lock';
      frame.setAttribute('allowfullscreen', '');
      stage.appendChild(frame);
      frame.addEventListener('load', () => { try { frame.contentWindow.focus(); } catch (e) {} });
    });
  }
  $('#cover').addEventListener('click', start);
  $('#cover').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); start(); } });

  $('#fsBtn').addEventListener('click', () => {
    const el = stage;
    const req = el.requestFullscreen || el.webkitRequestFullscreen;
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    } else if (req) {
      req.call(el).catch(() => {});
      if (frame) try { frame.contentWindow.focus(); } catch (e) {}
    }
  });
  $('#restartBtn').addEventListener('click', () => {
    if (!frame) { start(); return; }
    track('game_restart', { game_id: g.id, game_title: g.title });
    adThenPlay('next', 'game-restart-' + g.id, () => { frame.src = g.path; });
  });
}

/* ---------- footer yili + aloqa email ---------- */
document.querySelectorAll('[data-year]').forEach(e => e.textContent = new Date().getFullYear());
document.querySelectorAll('[data-email]').forEach(e => { e.textContent = C.contactEmail; e.href = 'mailto:' + C.contactEmail; });

initHome();
initGame();
})();
