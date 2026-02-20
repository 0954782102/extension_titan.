// AirHrome Titan v3.2 — Core Script — Fixed & Enhanced
// Author: Артем Процко @bortovt

// ============================================================
// 1. CLOCK
// ============================================================
const clockEl = document.getElementById('clock');
const dateEl  = document.getElementById('date');
let clockMode = localStorage.getItem('airhrome_clock') || '24';

function updateClock() {
  const now = new Date();
  let h = now.getHours(), m = String(now.getMinutes()).padStart(2,'0');
  let suffix = '';
  if (clockMode === '12') {
    suffix = h >= 12 ? ' PM' : ' AM';
    h = h % 12 || 12;
  }
  clockEl.textContent = `${String(h).padStart(2,'0')}:${m}${suffix}`;
  dateEl.textContent = now.toLocaleDateString('uk-UA', { weekday:'long', day:'numeric', month:'long' }).toUpperCase();
}
setInterval(updateClock, 1000); updateClock();

// ============================================================
// 2. TOAST
// ============================================================
let _toastTimer = null;
function showToast(msg, dur = 2600) {
  let t = document.getElementById('_toast');
  if (!t) {
    t = document.createElement('div'); t.id = '_toast';
    t.style.cssText = 'position:fixed;bottom:108px;left:50%;transform:translateX(-50%) translateY(10px);z-index:99999;padding:10px 22px;background:rgba(10,10,14,0.92);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.1);border-radius:100px;font-size:.82rem;font-weight:500;color:#F0F0F3;pointer-events:none;opacity:0;transition:all .3s cubic-bezier(.23,1,.32,1);font-family:"DM Sans",sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.4);white-space:nowrap;';
    document.body.appendChild(t);
  }
  clearTimeout(_toastTimer);
  t.textContent = msg; t.style.opacity='1'; t.style.transform='translateX(-50%) translateY(0)';
  _toastTimer = setTimeout(() => { t.style.opacity='0'; t.style.transform='translateX(-50%) translateY(8px)'; }, dur);
}

// ============================================================
// 3. WALLPAPER DRAG-AND-DROP
// ============================================================
const bgEl = document.getElementById('bg');
const dropOverlay = document.getElementById('dropOverlay');

const hint = document.createElement('div'); hint.className = 'wallpaper-hint';
hint.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> Перетягни фото для зміни шпалер`;
document.body.appendChild(hint);

let _drc = 0;
const hasImg = dt => dt && dt.types && Array.from(dt.types).includes('Files');

document.addEventListener('dragenter', e => { if (!hasImg(e.dataTransfer)) return; e.preventDefault(); _drc++; if (_drc===1){ dropOverlay.classList.remove('hidden'); requestAnimationFrame(()=>dropOverlay.classList.add('visible')); } });
document.addEventListener('dragleave', () => { _drc--; if (_drc<=0){ _drc=0; dropOverlay.classList.remove('visible','drag-accept'); setTimeout(()=>dropOverlay.classList.add('hidden'),250); } });
document.addEventListener('dragover', e => { if (!hasImg(e.dataTransfer)) return; e.preventDefault(); dropOverlay.classList.add('drag-accept'); });
document.addEventListener('drop', e => {
  e.preventDefault(); _drc=0;
  dropOverlay.classList.remove('visible','drag-accept');
  setTimeout(()=>dropOverlay.classList.add('hidden'),300);
  const file = e.dataTransfer?.files?.[0];
  if (!file || !file.type.startsWith('image/')) { showToast('Перетягни зображення (JPG, PNG, WebP...)'); return; }
  const reader = new FileReader();
  reader.onload = ev => {
    applyWallpaper(ev.target.result);
    try { localStorage.setItem('airhrome_bg_data', ev.target.result); localStorage.removeItem('airhrome_bg'); } catch(e) { console.warn('Too large for LS'); }
    showToast('Шпалери змінено!');
  };
  reader.readAsDataURL(file);
});

function applyWallpaper(src) { bgEl.style.backgroundImage = `url("${src}")`; }

(function loadBg() {
  const d = localStorage.getItem('airhrome_bg_data');
  const u = localStorage.getItem('airhrome_bg');
  if (d) applyWallpaper(d); else if (u) applyWallpaper(u);
})();

// Overlay darkness
(function loadOverlay() {
  const v = localStorage.getItem('airhrome_overlay');
  if (v) applyOverlay(v);
})();
function applyOverlay(pct) {
  const ov = document.getElementById('bgOverlay');
  if (!ov) return;
  ov.style.background = `
    radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,0,0,0.15) 0%, transparent 70%),
    radial-gradient(ellipse 100% 60% at 50% 100%, rgba(0,0,0,${pct/100*1.5}) 0%, transparent 70%),
    linear-gradient(180deg, rgba(0,0,0,${pct/100*0.6}) 0%, transparent 40%, rgba(0,0,0,${pct/100*0.5}) 100%)`;
}

// ============================================================
// 4. FLOATING APP WINDOW — iframe + declarativeNetRequest strips X-Frame-Options
// ============================================================

const floatWin        = document.getElementById('floatWin');
const floatWinTitle   = document.getElementById('floatWinTitle');
const floatWinFavicon = document.getElementById('floatWinFavicon');
const floatWinUrlText = document.getElementById('floatWinUrlText');
const floatWinLoading = document.getElementById('floatWinLoading');
const floatWinIframe  = document.getElementById('floatWinIframe');
const floatWinBody    = document.getElementById('floatWinBody');

let _fwUrl       = '';
let _fwBtn       = null;
let _fwIsMax     = false;
let _fwSavedRect = null;
let _fwLoadTimer = null;

const FW_DEFAULT = { w: 860, h: 600 };

function openFloatWin(url, name, btn) {
  // Toggle same window
  if (!floatWin.classList.contains('hidden') && _fwUrl === url) {
    closeFloatWin(); return;
  }

  _fwUrl = url;

  // Title & favicon
  floatWinTitle.textContent = name;
  floatWinUrlText.textContent = url.replace(/^https?:\/\/(www\.)?/,'').split('/')[0];
  try {
    floatWinFavicon.innerHTML = `<img src="https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32" width="16" height="16" alt="">`;
  } catch(e) { floatWinFavicon.innerHTML = ''; }

  // Dock button state
  if (_fwBtn) _fwBtn.classList.remove('panel-active');
  _fwBtn = btn;
  if (btn) btn.classList.add('panel-active');

  // Show loading, hide iframe
  floatWinLoading.style.display = 'flex';
  floatWinIframe.style.opacity  = '0';

  // Remove old fallback
  const oldFb = document.getElementById('floatFallback');
  if (oldFb) oldFb.remove();

  // Position window on first open
  if (floatWin.classList.contains('hidden')) {
    const vw = window.innerWidth, vh = window.innerHeight;
    const w = Math.min(FW_DEFAULT.w, vw - 80);
    const h = Math.min(FW_DEFAULT.h, vh - 120);
    floatWin.style.width  = w + 'px';
    floatWin.style.height = h + 'px';
    floatWin.style.left   = Math.round((vw - w) / 2) + 'px';
    floatWin.style.top    = Math.round((vh - h) / 2 - 30) + 'px';
  }

  floatWin.classList.remove('hidden');
  requestAnimationFrame(() => floatWin.classList.add('float-win-visible'));

  // Clear old iframe completely before loading new url
  floatWinIframe.src = 'about:blank';
  clearTimeout(_fwLoadTimer);

  // Small delay then load — rules.json strips X-Frame-Options on the fly
  _fwLoadTimer = setTimeout(() => {
    floatWinIframe.src = url;
  }, 80);

  // On load — hide spinner, show iframe
  floatWinIframe.onload = () => {
    if (floatWinIframe.src === 'about:blank') return;
    floatWinLoading.style.display = 'none';
    floatWinIframe.style.opacity  = '1';
  };

  // Safety: after 15s hide spinner anyway
  _fwLoadTimer = setTimeout(() => {
    floatWinLoading.style.display = 'none';
    floatWinIframe.style.opacity  = '1';
  }, 15000);
}

function closeFloatWin() {
  floatWin.classList.remove('float-win-visible');
  clearTimeout(_fwLoadTimer);
  setTimeout(() => {
    floatWin.classList.add('hidden');
    floatWinIframe.src = 'about:blank';
    _fwUrl = '';
  }, 280);
  if (_fwBtn) { _fwBtn.classList.remove('panel-active'); _fwBtn = null; }
}

// Controls
document.getElementById('floatWinClose').addEventListener('click', closeFloatWin);

document.getElementById('floatWinRefresh').addEventListener('click', () => {
  if (!_fwUrl) return;
  floatWinLoading.style.display = 'flex';
  floatWinIframe.style.opacity  = '0';
  floatWinIframe.src = 'about:blank';
  setTimeout(() => { floatWinIframe.src = _fwUrl; }, 60);
});

document.getElementById('floatWinNewTab').addEventListener('click', () => {
  if (_fwUrl) window.open(_fwUrl, '_blank');
});

document.getElementById('floatWinMaximize').addEventListener('click', () => {
  if (_fwIsMax) {
    _fwIsMax = false;
    floatWin.classList.remove('float-win-maximized');
    if (_fwSavedRect) {
      floatWin.style.left   = _fwSavedRect.left;
      floatWin.style.top    = _fwSavedRect.top;
      floatWin.style.width  = _fwSavedRect.width;
      floatWin.style.height = _fwSavedRect.height;
    }
    document.getElementById('floatWinMaximize').innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>`;
  } else {
    _fwSavedRect = { left: floatWin.style.left, top: floatWin.style.top, width: floatWin.style.width, height: floatWin.style.height };
    _fwIsMax = true;
    floatWin.classList.add('float-win-maximized');
    document.getElementById('floatWinMaximize').innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`;
  }
});

// ── DRAG ──────────────────────────────────────────────────────────
(function initFloatDrag() {
  const titlebar = document.getElementById('floatWinTitlebar');
  let dragging = false, ox = 0, oy = 0, startL = 0, startT = 0;

  titlebar.addEventListener('mousedown', e => {
    if (e.target.closest('button') || _fwIsMax) return;
    dragging = true;
    ox = e.clientX; oy = e.clientY;
    startL = parseInt(floatWin.style.left) || 0;
    startT = parseInt(floatWin.style.top)  || 0;
    floatWin.style.transition = 'none';
    floatWin.style.userSelect = 'none';
    floatWinIframe.style.pointerEvents = 'none';
    e.preventDefault();
  });

  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const nx = Math.max(0, Math.min(startL + (e.clientX - ox), window.innerWidth  - floatWin.offsetWidth));
    const ny = Math.max(0, Math.min(startT + (e.clientY - oy), window.innerHeight - 60));
    floatWin.style.left = nx + 'px';
    floatWin.style.top  = ny + 'px';
  });

  document.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    floatWin.style.transition = '';
    floatWin.style.userSelect = '';
    floatWinIframe.style.pointerEvents = '';
  });
})();

// ── RESIZE ────────────────────────────────────────────────────────
(function initFloatResize() {
  let resizing = false, dir = '', sx = 0, sy = 0, sl = 0, st = 0, sw = 0, sh = 0;
  const MIN_W = 360, MIN_H = 280;

  document.querySelectorAll('[data-dir]').forEach(handle => {
    handle.addEventListener('mousedown', e => {
      if (_fwIsMax) return;
      e.preventDefault(); e.stopPropagation();
      resizing = true;
      dir = handle.dataset.dir;
      sx = e.clientX; sy = e.clientY;
      sl = parseInt(floatWin.style.left) || 0;
      st = parseInt(floatWin.style.top)  || 0;
      sw = floatWin.offsetWidth;
      sh = floatWin.offsetHeight;
      floatWin.style.transition = 'none';
      floatWinIframe.style.pointerEvents = 'none';
      document.body.style.userSelect = 'none';
    });
  });

  document.addEventListener('mousemove', e => {
    if (!resizing) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    let newL = sl, newT = st, newW = sw, newH = sh;

    if (dir.includes('e'))  newW = Math.max(MIN_W, sw + dx);
    if (dir.includes('s'))  newH = Math.max(MIN_H, sh + dy);
    if (dir.includes('w'))  { newW = Math.max(MIN_W, sw - dx); newL = sl + (sw - newW); }
    if (dir.includes('n'))  { newH = Math.max(MIN_H, sh - dy); newT = st + (sh - newH); }

    floatWin.style.left   = newL + 'px';
    floatWin.style.top    = newT + 'px';
    floatWin.style.width  = newW + 'px';
    floatWin.style.height = newH + 'px';
  });

  document.addEventListener('mouseup', () => {
    if (!resizing) return;
    resizing = false;
    floatWin.style.transition = '';
    floatWinIframe.style.pointerEvents = '';
    document.body.style.userSelect = '';
  });
})();

// ── Keep alias for old code that calls openAppPanel ──────────────
function openAppPanel(url, name, btn) { openFloatWin(url, name, btn); }
function closeAppPanel() { closeFloatWin(); }

// ============================================================
// 5. DOCK APPS → open in side panel
// ============================================================
function bindDockApps() {
  document.querySelectorAll('.dock-app').forEach(btn => {
    btn.addEventListener('click', () => {
      const url  = btn.getAttribute('data-url');
      const name = btn.getAttribute('data-name') || btn.getAttribute('title') || 'App';
      if (!url) return;
      openAppPanel(url, name, btn);
    });
  });
}
bindDockApps();

// ============================================================
// 6. DRAGGABLE & RESIZABLE WIDGETS
// ============================================================
const LAYOUT_KEY = 'airhrome_widget_layout';
const DEFAULTS = {
  notes:   { x:30, y:170, w:260, h:250 },
  focus:   { x:30, y:440, w:260, h:230 },
  weather: { x:30, y:700, w:200, h:140 },
  music:   { x:310, y:700, w:300, h:300 }
};

function saveLayout() {
  const layout = {};
  document.querySelectorAll('.draggable-widget').forEach(w => {
    layout[w.dataset.widgetId] = { x:parseInt(w.style.left), y:parseInt(w.style.top), w:w.offsetWidth, h:w.offsetHeight };
  });
  localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout));
}

function loadLayout() { try { const s = localStorage.getItem(LAYOUT_KEY); return s ? JSON.parse(s) : null; } catch { return null; } }
function applyPos(el, p) { el.style.left=p.x+'px'; el.style.top=p.y+'px'; el.style.width=p.w+'px'; el.style.height=p.h+'px'; }

function makeDraggable(el) {
  const handle = el.querySelector('.widget-drag-handle');
  let sx,sy,sl,st,dragging=false;
  handle.addEventListener('mousedown', e => {
    if (e.target.closest('textarea,input,button')) return;
    dragging=true; sx=e.clientX; sy=e.clientY; sl=parseInt(el.style.left)||0; st=parseInt(el.style.top)||0;
    el.classList.add('dragging'); el.style.transition='none'; el.style.zIndex='500';
    document.body.style.userSelect='none'; document.body.style.cursor='grabbing'; e.preventDefault();
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    el.style.left = Math.max(10, Math.min(sl+(e.clientX-sx), window.innerWidth-el.offsetWidth-10))+'px';
    el.style.top  = Math.max(60, Math.min(st+(e.clientY-sy), window.innerHeight-el.offsetHeight-80))+'px';
  });
  document.addEventListener('mouseup', () => {
    if (!dragging) return; dragging=false;
    el.classList.remove('dragging'); el.style.transition=''; el.style.zIndex='';
    document.body.style.userSelect=''; document.body.style.cursor=''; saveLayout();
  });
}

function makeResizable(el) {
  const h = el.querySelector('.widget-resize-handle');
  let sx,sy,sw,sh,resizing=false;
  h.addEventListener('mousedown', e => {
    e.stopPropagation(); e.preventDefault(); resizing=true; sx=e.clientX; sy=e.clientY; sw=el.offsetWidth; sh=el.offsetHeight;
    el.style.transition='none'; document.body.style.userSelect='none'; document.body.style.cursor='se-resize';
  });
  document.addEventListener('mousemove', e => {
    if (!resizing) return;
    el.style.width  = Math.max(200, Math.min(sw+(e.clientX-sx), 600))+'px';
    el.style.height = Math.max(120, Math.min(sh+(e.clientY-sy), 700))+'px';
  });
  document.addEventListener('mouseup', () => {
    if (resizing) { resizing=false; el.style.transition=''; document.body.style.userSelect=''; document.body.style.cursor=''; saveLayout(); }
  });
}

function initWidgets() {
  const saved = loadLayout();
  document.querySelectorAll('.draggable-widget').forEach(w => {
    applyPos(w, (saved && saved[w.dataset.widgetId]) || DEFAULTS[w.dataset.widgetId] || {x:40,y:200,w:260,h:220});
    makeDraggable(w); makeResizable(w);
  });
}
initWidgets();

// Edit mode
const editBtn = document.getElementById('editModeBtn');
let editActive = false;
editBtn.addEventListener('click', () => {
  editActive = !editActive;
  document.body.classList.toggle('edit-mode', editActive);
  editBtn.innerHTML = editActive
    ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span>Done</span>`
    : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg><span>Customize</span>`;
  showToast(editActive ? 'Режим кастомізації — перетягуй панелі' : 'Позиції збережено');
});

// ============================================================
// 7. SEARCH
// ============================================================
const mainSearch = document.getElementById('mainSearch');
document.getElementById('searchSubmit').addEventListener('click', doSearch);
mainSearch.addEventListener('keydown', e => { if (e.key==='Enter') doSearch(); });
function doSearch() {
  const q = mainSearch.value.trim(); if (!q) return;
  if (q.startsWith('http')) window.location.href = q;
  else if (q.includes('.')&&!q.includes(' ')&&q.length<80) window.location.href = 'https://'+q;
  else window.location.href = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
}

// ============================================================
// 8. FOCUS TIMER — with presets
// ============================================================
let WORK = 25*60;
let tLeft=WORK, tActive=false, tInt=null;
const timerDisp=document.getElementById('timer');
const timerToggle=document.getElementById('timerToggle');
const pBar=document.getElementById('progressBar');
const pIcon=document.getElementById('playIcon');

function updTimer(){ timerDisp.textContent=`${String(Math.floor(tLeft/60)).padStart(2,'0')}:${String(tLeft%60).padStart(2,'0')}`; pBar.style.width=`${((WORK-tLeft)/WORK)*100}%`; }
function setIcon(p){ pIcon.innerHTML = p ? '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>' : '<polygon points="5 3 19 12 5 21 5 3"/>'; }

timerToggle.addEventListener('click', () => {
  if (tActive) { clearInterval(tInt); tActive=false; setIcon(false); }
  else {
    if (tLeft<=0) return;
    tInt = setInterval(() => { tLeft--; updTimer(); if (tLeft<=0) { clearInterval(tInt); tActive=false; setIcon(false); showToast('Сесія завершена! Зроби перерву.'); } }, 1000);
    tActive=true; setIcon(true);
  }
});
document.getElementById('timerReset').addEventListener('click', () => { clearInterval(tInt); tActive=false; tLeft=WORK; updTimer(); setIcon(false); });

// Preset buttons
document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    clearInterval(tInt); tActive=false; setIcon(false);
    const mins = parseInt(btn.dataset.mins);
    WORK = mins * 60; tLeft = WORK; updTimer();
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    showToast(`Таймер: ${mins} хвилин`);
  });
});

updTimer();

// ============================================================
// 9. NOTES
// ============================================================
const notesArea = document.getElementById('notesArea');
notesArea.value = localStorage.getItem('airhrome_notes') || '';
notesArea.addEventListener('input', () => localStorage.setItem('airhrome_notes', notesArea.value));

// ============================================================
// 10. AI PANEL
// ============================================================
const aiPanel = document.getElementById('aiPanel');
const aiHubBtn = document.getElementById('aiHubBtn');
document.getElementById('aiPanelClose').addEventListener('click', () => aiPanel.classList.remove('open'));
aiHubBtn.addEventListener('click', () => aiPanel.classList.toggle('open'));
document.addEventListener('click', e => { if (!aiPanel.contains(e.target) && !aiHubBtn.contains(e.target)) aiPanel.classList.remove('open'); });

document.getElementById('addAiBtn').addEventListener('click', () => {
  const inp = document.getElementById('customAiUrl');
  const url = inp.value.trim(); if (!url) return;
  const full = url.startsWith('http') ? url : 'https://'+url;
  const label = url.replace(/^https?:\/\/(www\.)?/,'').split('/')[0];
  const item = document.createElement('button'); item.className='ai-item'; item.onclick=()=>window.open(full);
  item.innerHTML=`<div class="ai-item-icon" style="background:rgba(255,255,255,.05)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></div><span>${label}</span><svg class="ai-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
  document.querySelector('.ai-list').appendChild(item);
  inp.value=''; showToast(`${label} додано`);
});

// ============================================================
// 11. ADD SITE TO DOCK (FIXED)
// ============================================================
const CUSTOM_SITES_KEY = 'airhrome_custom_sites';

function loadCustomSites() {
  try { return JSON.parse(localStorage.getItem(CUSTOM_SITES_KEY)) || []; } catch { return []; }
}

function saveCustomSites(sites) {
  localStorage.setItem(CUSTOM_SITES_KEY, JSON.stringify(sites));
}

function createDockBtn(site) {
  const btn = document.createElement('button');
  btn.className = 'dock-btn dock-app custom-site';
  btn.setAttribute('data-url', site.url);
  btn.setAttribute('data-name', site.name);
  btn.setAttribute('title', site.name);
  // Use favicon as image or fallback to first 2 letters
  const initials = site.name.substring(0,2).toUpperCase();
  try {
    const domain = new URL(site.url).hostname;
    btn.innerHTML = `<img src="https://www.google.com/s2/favicons?domain=${domain}&sz=32" width="18" height="18" style="border-radius:3px" onerror="this.style.display='none';this.nextSibling.style.display='flex'" alt=""><span style="display:none;font-size:.65rem;font-weight:700;letter-spacing:-.02em">${initials}</span>`;
  } catch { btn.innerHTML = `<span style="font-size:.65rem;font-weight:700">${initials}</span>`; }
  // Right-click to remove
  btn.addEventListener('contextmenu', e => {
    e.preventDefault();
    if (confirm(`Видалити "${site.name}" з панелі?`)) {
      btn.remove();
      const sites = loadCustomSites().filter(s => s.url !== site.url);
      saveCustomSites(sites);
      showToast(`${site.name} видалено`);
    }
  });
  btn.addEventListener('click', () => openAppPanel(site.url, site.name, btn));
  return btn;
}

function renderCustomSites() {
  const group = document.getElementById('dockAppsGroup');
  // Remove existing custom sites
  group.querySelectorAll('.custom-site').forEach(b => b.remove());
  loadCustomSites().forEach(site => group.appendChild(createDockBtn(site)));
}

renderCustomSites();

// Add site modal logic (FIXED)
const addSiteModal = document.getElementById('addSiteModal');
document.getElementById('addSiteBtn').addEventListener('click', () => {
  addSiteModal.classList.remove('hidden');
  document.getElementById('addSiteName').focus();
});
document.getElementById('addSiteCancel').addEventListener('click', () => addSiteModal.classList.add('hidden'));
document.getElementById('addSiteConfirm').addEventListener('click', addCustomSite);
document.getElementById('addSiteName').addEventListener('keydown', e => { if (e.key==='Enter') document.getElementById('addSiteUrl').focus(); });
document.getElementById('addSiteUrl').addEventListener('keydown', e => { if (e.key==='Enter') addCustomSite(); });

function addCustomSite() {
  const name = document.getElementById('addSiteName').value.trim();
  const rawUrl = document.getElementById('addSiteUrl').value.trim();
  if (!name || !rawUrl) { showToast('Заповни назву та URL'); return; }
  const url = rawUrl.startsWith('http') ? rawUrl : 'https://'+rawUrl;
  const site = { name, url };
  const sites = loadCustomSites();
  sites.push(site);
  saveCustomSites(sites);
  const group = document.getElementById('dockAppsGroup');
  group.appendChild(createDockBtn(site));
  document.getElementById('addSiteName').value = '';
  document.getElementById('addSiteUrl').value = '';
  addSiteModal.classList.add('hidden');
  showToast(`${name} додано в панель`);
}

// Click outside to close modal
addSiteModal.addEventListener('click', e => { if (e.target === addSiteModal) addSiteModal.classList.add('hidden'); });

// ============================================================
// 12. DOCK NAVIGATION BUTTONS (FIXED — use window.location)
// ============================================================
function openChromeUrl(url) {
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
    chrome.runtime.sendMessage({ action: 'openTab', url });
  } else {
    window.open(url, '_blank');
  }
}

document.getElementById('dockHistory').addEventListener('click', () => openChromeUrl('chrome://history'));
document.getElementById('dockDownloads').addEventListener('click', () => openChromeUrl('chrome://downloads'));
document.getElementById('dockBookmarks').addEventListener('click', () => openChromeUrl('chrome://bookmarks'));

// ============================================================
// 13. SETTINGS
// ============================================================
const settBackdrop = document.getElementById('settingsBackdrop');
document.getElementById('settingsTrigger').addEventListener('click', () => settBackdrop.classList.remove('hidden'));
document.getElementById('closeSettings').addEventListener('click', () => settBackdrop.classList.add('hidden'));
settBackdrop.addEventListener('click', e => { if (e.target===settBackdrop) settBackdrop.classList.add('hidden'); });

document.querySelectorAll('.settings-nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.settings-nav-item').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.settings-tab').forEach(t=>t.classList.add('hidden'));
    btn.classList.add('active');
    document.querySelector(`.settings-tab[data-tab="${btn.dataset.tab}"]`).classList.remove('hidden');
  });
});

const blurRange   = document.getElementById('blurRange');
const blurVal     = document.getElementById('blurVal');
const overlayRange = document.getElementById('overlayRange');
const overlayVal  = document.getElementById('overlayVal');

blurRange.addEventListener('input', () => { blurVal.textContent=blurRange.value+'px'; document.documentElement.style.setProperty('--blur', blurRange.value+'px'); });
overlayRange.addEventListener('input', () => { overlayVal.textContent=overlayRange.value+'%'; applyOverlay(overlayRange.value); });

// Load saved blur
(function loadBlur() {
  const v = localStorage.getItem('airhrome_blur'); if (!v) return;
  blurRange.value = v; blurVal.textContent = v+'px';
  document.documentElement.style.setProperty('--blur', v+'px');
})();

document.querySelectorAll('.color-dot').forEach(dot => {
  dot.addEventListener('click', () => {
    document.querySelectorAll('.color-dot').forEach(d=>d.classList.remove('active'));
    dot.classList.add('active');
    const c = dot.dataset.color;
    document.documentElement.style.setProperty('--accent', c);
    const h=c.replace('#','');
    document.documentElement.style.setProperty('--accent-rgb', `${parseInt(h.substring(0,2),16)},${parseInt(h.substring(2,4),16)},${parseInt(h.substring(4,6),16)}`);
    localStorage.setItem('airhrome_accent', c);
  });
});

// Clock format pills
document.querySelectorAll('.option-pill').forEach(pill => {
  if (pill.dataset.clock === clockMode) pill.classList.add('active');
  else pill.classList.remove('active');
  pill.addEventListener('click', () => {
    document.querySelectorAll('.option-pill').forEach(p=>p.classList.remove('active'));
    pill.classList.add('active');
    clockMode = pill.dataset.clock;
    localStorage.setItem('airhrome_clock', clockMode);
    updateClock();
    showToast(`Формат часу: ${clockMode}h`);
  });
});

document.getElementById('saveSettings').addEventListener('click', () => {
  const bgUrl = document.getElementById('bgInput').value.trim();
  if (bgUrl) { applyWallpaper(bgUrl); localStorage.setItem('airhrome_bg', bgUrl); localStorage.removeItem('airhrome_bg_data'); }
  localStorage.setItem('airhrome_blur', blurRange.value);
  localStorage.setItem('airhrome_overlay', overlayRange.value);
  settBackdrop.classList.add('hidden');
  showToast('Налаштування збережено');
});

(function loadAccent() {
  const c = localStorage.getItem('airhrome_accent'); if (!c) return;
  document.documentElement.style.setProperty('--accent', c);
  const h=c.replace('#','');
  document.documentElement.style.setProperty('--accent-rgb', `${parseInt(h.substring(0,2),16)},${parseInt(h.substring(2,4),16)},${parseInt(h.substring(4,6),16)}`);
  document.querySelectorAll('.color-dot').forEach(d=>d.classList.toggle('active', d.dataset.color===c));
})();

// Widget visibility toggles
function setupWidgetToggle(id, widgetId) {
  const tog = document.getElementById(id);
  const w = document.getElementById('widget-' + widgetId);
  const key = 'airhrome_tog_' + widgetId;
  const saved = localStorage.getItem(key);
  if (saved === 'false') { tog.checked=false; if(w) w.style.display='none'; }
  tog.addEventListener('change', () => {
    if (w) w.style.display = tog.checked ? '' : 'none';
    localStorage.setItem(key, tog.checked);
  });
}
setupWidgetToggle('togFocus', 'focus');
setupWidgetToggle('togNotes', 'notes');
setupWidgetToggle('togWeather', 'weather');
setupWidgetToggle('togMusic', 'music');

// Reset layout
document.getElementById('resetLayoutBtn').addEventListener('click', () => {
  localStorage.removeItem(LAYOUT_KEY);
  document.querySelectorAll('.draggable-widget').forEach(w => { const p=DEFAULTS[w.dataset.widgetId]; if(p) applyPos(w,p); });
  showToast('Позиції скинуто');
});

// Export notes
document.getElementById('exportNotesBtn').addEventListener('click', () => {
  const text = localStorage.getItem('airhrome_notes') || '';
  const blob = new Blob([text], {type:'text/plain'});
  const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='airhrome-notes.txt'; a.click();
  showToast('Нотатки завантажено');
});

// Clear all data
document.getElementById('clearDataBtn').addEventListener('click', () => {
  if (!confirm('Очистити всі налаштування AirHrome? Це незворотня дія.')) return;
  const keys = ['airhrome_bg','airhrome_bg_data','airhrome_accent','airhrome_notes','airhrome_blur','airhrome_overlay','airhrome_clock',LAYOUT_KEY,CUSTOM_SITES_KEY,'airhrome_tog_focus','airhrome_tog_notes','airhrome_tog_weather'];
  keys.forEach(k => localStorage.removeItem(k));
  location.reload();
});

// ============================================================
// 14. WEATHER WIDGET
// ============================================================
(function initWeather() {
  const wMap = {0:'☀️',1:'🌤️',2:'⛅',3:'☁️',45:'🌫️',48:'🌫️',51:'🌦️',53:'🌦️',55:'🌧️',61:'🌧️',63:'🌧️',65:'🌧️',71:'❄️',73:'❄️',75:'❄️',80:'🌦️',81:'🌧️',82:'⛈️',95:'⛈️',96:'⛈️',99:'⛈️'};
  const descMap = {0:'Ясно',1:'Переважно ясно',2:'Мінлива хмарність',3:'Хмарно',45:'Туман',48:'Паморозь',51:'Мряка',53:'Мряка',55:'Густа мряка',61:'Дощ',63:'Помірний дощ',65:'Сильний дощ',71:'Сніг',73:'Помірний сніг',75:'Сильний сніг',80:'Зливи',81:'Сильні зливи',82:'Шквал',95:'Гроза',96:'Гроза з градом',99:'Гроза з градом'};
  if (!navigator.geolocation) { document.getElementById('weatherDesc').textContent='Геолокація недоступна'; return; }
  navigator.geolocation.getCurrentPosition(pos => {
    const {latitude:lat, longitude:lon} = pos.coords;
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode&timezone=auto`)
      .then(r=>r.json()).then(d => {
        const t = Math.round(d.current.temperature_2m);
        const code = d.current.weathercode;
        document.getElementById('weatherTemp').textContent = `${t}°`;
        document.getElementById('weatherDesc').textContent = `${wMap[code]||'🌡️'} ${descMap[code]||''}`;
        // Reverse geocode
        return fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
      })
      .then(r=>r.json()).then(g => {
        const city = g.address?.city || g.address?.town || g.address?.village || '';
        document.getElementById('weatherCity').textContent = city;
      }).catch(() => {});
  }, () => { document.getElementById('weatherDesc').textContent='Немає дозволу'; });
})();

// ============================================================
// 15. MUSIC PLAYER WIDGET
// ============================================================
(function initMusicPlayer() {
  const SOURCES = {
    soundcloud: {
      src: 'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/discover&color=%230A84FF&auto_play=false&hide_related=false&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=true',
      openUrl: 'https://soundcloud.com'
    },
    youtube: {
      src: 'https://www.youtube.com/embed/videoseries?list=PLDIoUOhQQPlXr63I_vwF06Dq2oqces4zF&autoplay=0',
      openUrl: 'https://music.youtube.com'
    },
    spotify: {
      src: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator&theme=0',
      openUrl: 'https://open.spotify.com'
    }
  };

  let currentSource = 'soundcloud';
  const frame = document.getElementById('musicFrame');
  const openBtn = document.getElementById('musicOpenBtn');

  document.querySelectorAll('.music-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.music-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentSource = tab.dataset.src;
      const s = SOURCES[currentSource];
      frame.src = s.src;
    });
  });

  if (openBtn) {
    openBtn.addEventListener('click', () => {
      window.open(SOURCES[currentSource].openUrl, '_blank');
    });
  }
})();

// ============================================================
// 16. KEYBOARD SHORTCUTS
// ============================================================
window.addEventListener('keydown', e => {
  if ((e.metaKey||e.ctrlKey) && e.key==='k') { e.preventDefault(); mainSearch.focus(); mainSearch.select(); }
  if (e.key==='Escape') {
    settBackdrop.classList.add('hidden');
    aiPanel.classList.remove('open');
    addSiteModal.classList.add('hidden');
    closeFloatWin();
    if (editActive) editBtn.click();
  }
});