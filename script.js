'use strict';
/* ════════════════════════════════════════════════════════
   Smart Kindergarten Classroom — Logica applicativa
   Estratto da app_finale_ium.html e refactorizzato.

   Indice delle sezioni:
     1.  Costanti condivise (etichette/classi riusate più volte)
     2.  Dati (attività, alunni)
     3.  Stato applicativo
     4.  Navigazione tra pagine
     5.  Dashboard / alert proattivo
     6.  Heatmap (canvas)
     7.  Attività: rendering, ricerca, categorie, filtri
     8.  Modale conferma / successo attività
     9.  Report: elenco alunni, dettaglio, filtri
     10. Grafico andamento alunno (canvas)
     11. Pannelli filtro generici (Attività + Report)
     12. Binding eventi statici & inizializzazione
   ════════════════════════════════════════════════════════ */

// ─────────────────────────────────────────────
//  1. COSTANTI CONDIVISE
//  (prima erano duplicate in 4-5 punti diversi del file)
// ─────────────────────────────────────────────
const CATEGORY_LABELS = {
  calmanti: 'Calmanti',
  cognitive: 'Cognitive',
  creative: 'Creative',
  ludico: 'Ludico',
  collaborative: 'Collaborative',
  motorie: 'Motorie',
};

const STATUS_LABELS = {
  norma: 'Nella norma',
  osservare: 'Da osservare',
  approfondire: 'Da approfondire',
};
const STATUS_CLASSES = {
  norma: 'status-norma',
  osservare: 'status-osservare',
  approfondire: 'status-approfondire',
};

const TREND_LABELS = {
  up: '↑ In aumento',
  down: '↓ In calo',
  stable: '→ Stabile',
};
const TREND_CLASSES = {
  up: 'trend-up',
  down: 'trend-down',
  stable: 'trend-stable',
};

const DURATION_LABELS = {
  short: '≤ 5 min',
  medium: '6–10 min',
  long: '≥ 11 min',
};

// ─────────────────────────────────────────────
//  2. DATI
// ─────────────────────────────────────────────
const ACTIVITIES = [
  { id:1,  name:'Puzzle lento',          emoji:'🧩', cat:'calmanti',      desc:'Ricomponi il puzzle in silenzio',         dur:10, reason:'Rumore elevato rilevato' },
  { id:2,  name:'Respirazione guidata',  emoji:'🧘', cat:'calmanti',      desc:'Esercizi di respiro guidato',              dur:5,  reason:'Classe agitata' },
  { id:3,  name:'Arcobaleno colorato',   emoji:'🌈', cat:'calmanti',      desc:'Colora l\'arcobaleno',                    dur:10, reason:null },
  { id:4,  name:'Traccia la stella',     emoji:'⭐', cat:'calmanti',      desc:'Segui il contorno con il dito',            dur:10, reason:null },
  { id:5,  name:'Disegno libero',        emoji:'✏️', cat:'calmanti',      desc:'Disegno libero sul tavolo touch',          dur:10, reason:null },
  { id:6,  name:'Origami semplice',      emoji:'📐', cat:'calmanti',      desc:'Ricrea un origami digitale',               dur:10, reason:null },
  { id:7,  name:'Bolle da scoppiare',    emoji:'🔵', cat:'calmanti',      desc:'Tocca lentamente le bolle galleggianti',   dur:10, reason:null },
  { id:8,  name:'Memory classico',       emoji:'🧠', cat:'cognitive',     desc:'Abbina le coppie di carte',                dur:7,  reason:'Attenzione in calo' },
  { id:9,  name:'Riconosci le forme',    emoji:'🔺', cat:'cognitive',     desc:'Identifica le figure geometriche',         dur:6,  reason:null },
  { id:10, name:'Sequenze logiche',      emoji:'🔢', cat:'cognitive',     desc:'Completa la sequenza di numeri',           dur:6,  reason:null },
  { id:11, name:'Trova le differenze',   emoji:'🔍', cat:'cognitive',     desc:'Individua le 5 differenze',                dur:8,  reason:null },
  { id:12, name:'Conta e colora',        emoji:'🎨', cat:'cognitive',     desc:'Conta gli oggetti e colorali',             dur:7,  reason:null },
  { id:13, name:'Storie animate',        emoji:'🎨', cat:'creative',      desc:'Racconta una storia con i disegni',        dur:9,  reason:null },
  { id:14, name:'Mosaico colorato',      emoji:'🖼️', cat:'creative',     desc:'Componi un mosaico digitale',             dur:12, reason:null },
  { id:15, name:'Musica e ritmo',        emoji:'🎵', cat:'creative',      desc:'Ripeti il ritmo musicale',                 dur:8,  reason:null },
  { id:16, name:'Ballo ritmico',         emoji:'🤸', cat:'ludico',        desc:'Balla seguendo i passi',                  dur:15, reason:null },
  { id:17, name:'Centra il bersaglio',   emoji:'🎯', cat:'ludico',        desc:'Centra il canestro',                       dur:15, reason:null },
  { id:18, name:'Gioco dei colori',      emoji:'🌈', cat:'ludico',        desc:'Scegli il colore corretto velocemente',    dur:10, reason:null },
  { id:19, name:'Torre in gruppo',       emoji:'🤝', cat:'collaborative', desc:'Costruisci la torre più alta insieme',     dur:12, reason:null },
  { id:20, name:'Catena di parole',      emoji:'💬', cat:'collaborative', desc:'Inventa la storia con i tuoi compagni',    dur:10, reason:null },
  { id:21, name:'Corsa a squadre',       emoji:'🏃', cat:'motorie',       desc:'Muoviti velocemente sul tappeto touch',    dur:15, reason:null },
  { id:22, name:'Yoga per bambini',      emoji:'🧘', cat:'motorie',       desc:'Posizioni yoga semplici e guidate',        dur:10, reason:null },
];

const STUDENTS = [
  { id:1,  name:'Leo Rossi',          initials:'LR', section:'Sezione B', status:'osservare',     trend:'down',   trendDays:[72,68,61,55,50],  suggestion:'Riscontrata fatica nei giochi cognitivi lunghi. Si consiglia attività Ludica o Collaborativa.', avatarClass:'avatar-bg-1' },
  { id:2,  name:'Diego Martini',      initials:'DM', section:'Sezione A', status:'norma',         trend:'stable', trendDays:[78,80,82,79,81],  suggestion:'Andamento nella norma. Continua con attività ludiche e di gruppo per mantenere il coinvolgimento.', avatarClass:'avatar-bg-2' },
  { id:3,  name:'Sofia Esposito',     initials:'SE', section:'Sezione B', status:'norma',         trend:'up',     trendDays:[70,73,76,79,82],  suggestion:'Ottimo miglioramento nell\'ultima settimana. Proponi attività cognitive più sfidanti.', avatarClass:'avatar-bg-3' },
  { id:4,  name:'Marco Ferrari',      initials:'MF', section:'Sezione A', status:'approfondire',  trend:'down',   trendDays:[65,60,52,44,38],  suggestion:'Riscontrato alto stress in attività ludiche. Si consiglia attività Collaborativa o Ludica di gruppo.', avatarClass:'avatar-bg-4' },
  { id:5,  name:'Giulia Romano',      initials:'GR', section:'Sezione B', status:'norma',         trend:'stable', trendDays:[75,76,74,77,75],  suggestion:'Andamento stabile. Considera attività creative per stimolare l\'espressione.', avatarClass:'avatar-bg-5' },
  { id:6,  name:'Luca Conti',         initials:'LC', section:'Sezione A', status:'norma',         trend:'up',     trendDays:[68,72,75,78,82],  suggestion:'In netto miglioramento. Continua con attività cognitive strutturate.', avatarClass:'avatar-bg-1' },
  { id:7,  name:'Chiara Bruno',       initials:'CB', section:'Sezione B', status:'norma',         trend:'stable', trendDays:[80,79,81,80,82],  suggestion:'Ottima concentrazione. Proponi attività collaborative per stimolare le abilità sociali.', avatarClass:'avatar-bg-2' },
  { id:8,  name:'Matteo Ricci',       initials:'MR', section:'Sezione A', status:'osservare',     trend:'down',   trendDays:[70,66,62,58,55],  suggestion:'Attenzione in calo nelle ultime sessioni. Prova con attività più brevi e ludiche.', avatarClass:'avatar-bg-3' },
  { id:9,  name:'Anna Moretti',       initials:'AM', section:'Sezione B', status:'norma',         trend:'up',     trendDays:[65,68,72,76,80],  suggestion:'Miglioramento costante. Ottima risposta alle attività calmanti.', avatarClass:'avatar-bg-4' },
  { id:10, name:'Francesco Costa',    initials:'FC', section:'Sezione A', status:'norma',         trend:'stable', trendDays:[77,78,76,79,77],  suggestion:'Andamento stabile. Buona partecipazione alle attività di gruppo.', avatarClass:'avatar-bg-5' },
  { id:11, name:'Valentina Gallo',    initials:'VG', section:'Sezione B', status:'norma',         trend:'up',     trendDays:[60,65,70,75,80],  suggestion:'Eccellente progresso nelle attività cognitive. Aumenta gradualmente la difficoltà.', avatarClass:'avatar-bg-1' },
  { id:12, name:'Alessandro Bianchi', initials:'AB', section:'Sezione A', status:'osservare',     trend:'stable', trendDays:[55,58,56,59,57],  suggestion:'Punteggi bassi ma stabili. Valuta supporto aggiuntivo nelle attività di riconoscimento.', avatarClass:'avatar-bg-2' },
];

// ─────────────────────────────────────────────
//  3. STATO APPLICATIVO
//  Tutto lo stato mutabile della pagina, centralizzato qui
//  invece di essere sparso tra variabili globali create
//  in punti diversi del file originale.
// ─────────────────────────────────────────────
const state = {
  currentCat: 'tutte',
  searchQuery: '',
  currentActivity: null,
  selectedStudent: null,
  actFilters: { dur: null, cat: null },
  repFilters: { status: null, trend: null, section: null },
};

// ─────────────────────────────────────────────
//  4. NAVIGAZIONE TRA PAGINE
// ─────────────────────────────────────────────
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  document.getElementById('nav-' + name).classList.add('active');
  if (name === 'attivita') renderActivities();
  if (name === 'report') renderStudents();
}

// ─────────────────────────────────────────────
//  5. DASHBOARD / ALERT PROATTIVO
// ─────────────────────────────────────────────
function dismissAlert() {
  document.getElementById('alert-banner').classList.add('hidden');
}

// ─────────────────────────────────────────────
//  6. HEATMAP (canvas)
// ─────────────────────────────────────────────
function drawHeatmap() {
  const canvas = document.getElementById('heatmap-canvas');
  if (!canvas) return;
  const container = canvas.parentElement;
  canvas.width  = container.offsetWidth;
  canvas.height = container.offsetHeight;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  ctx.fillStyle = '#f8f4ef';
  ctx.fillRect(0, 0, W, H);

  // bordo aula
  ctx.strokeStyle = '#c9b8a8';
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, W - 20, H - 20);

  // tavoli (gruppi)
  const tables = [
    { x:0.18, y:0.45, r:0.09, heat:0.1 },
    { x:0.33, y:0.50, r:0.10, heat:0.4 },
    { x:0.50, y:0.45, r:0.09, heat:0.2 },
    { x:0.67, y:0.50, r:0.11, heat:0.7 },
    { x:0.82, y:0.48, r:0.10, heat:0.85 },
  ];

  tables.forEach(t => {
    const cx = t.x * W, cy = t.y * H, r = t.r * Math.min(W, H);
    // alone di calore
    const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.6);
    const alpha = t.heat;
    if (t.heat < 0.3) {
      grd.addColorStop(0, `rgba(76,175,80,${alpha * 0.9})`);
      grd.addColorStop(1, 'rgba(76,175,80,0)');
    } else if (t.heat < 0.6) {
      grd.addColorStop(0, `rgba(255,193,7,${alpha * 0.8})`);
      grd.addColorStop(1, 'rgba(255,193,7,0)');
    } else if (t.heat < 0.8) {
      grd.addColorStop(0, `rgba(255,87,34,${alpha * 0.8})`);
      grd.addColorStop(1, 'rgba(255,87,34,0)');
    } else {
      grd.addColorStop(0, `rgba(211,47,47,${alpha * 0.85})`);
      grd.addColorStop(1, 'rgba(211,47,47,0)');
    }
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.6, 0, Math.PI * 2);
    ctx.fill();

    // cerchio tavolo
    ctx.strokeStyle = '#bbb';
    ctx.lineWidth = 1.5;
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.65, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  // etichette
  ctx.fillStyle = '#999';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('INGRESSO', 20, H * 0.75);
  ctx.save();
  ctx.translate(W - 16, H / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Banco insegnante', -52, 0);
  ctx.restore();
}

// ─────────────────────────────────────────────
//  7. ATTIVITÀ — rendering, ricerca, categorie, filtri
//
//  Nel file originale "filterActivities" e "renderActivities"
//  venivano definite due volte: una versione base e poi una
//  seconda versione che la sovrascriveva ("monkey patch") per
//  aggiungere il supporto ai filtri avanzati. Qui la logica è
//  unificata in una sola implementazione, più semplice da
//  leggere e da mantenere.
// ─────────────────────────────────────────────
function setCat(cat, btn) {
  state.currentCat = cat;
  document.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderActivities();
}

function filterActivities() {
  state.searchQuery = document.getElementById('activity-search').value.toLowerCase();
  renderActivities();
}

function activityCardHTML(activity, isSuggested) {
  const catClass = 'cat-' + activity.cat;
  const barClass = 'bar-' + activity.cat;
  const catName = CATEGORY_LABELS[activity.cat] || activity.cat;
  const escapedName = activity.name.replace(/'/g, "\\'");
  const escapedDesc = activity.desc.replace(/'/g, "\\'");

  return `<div class="activity-card">
    <div class="card-top-bar ${barClass}"></div>
    <div class="card-body">
      <div class="card-header">
        <div class="card-emoji-wrap emoji-${activity.cat}">${activity.emoji}</div>
        <div class="card-meta">
          <span class="card-cat-badge ${catClass}">${catName}</span>
          <div class="card-name">${activity.name}</div>
          <div class="card-desc">${activity.desc}</div>
          ${isSuggested && activity.reason ? `<span class="card-reason">${activity.reason}</span>` : ''}
          <div class="card-dur">⏱ ${activity.dur} min</div>
        </div>
      </div>
      <div class="card-divider"></div>
      <button class="btn-avvia-full btn-${activity.cat}" onclick="openModal('${escapedName}','${activity.emoji}','${catName}','${catClass}','${barClass}',${activity.dur},'${escapedDesc}')">Avvia</button>
    </div>
  </div>`;
}

function renderActivities() {
  // Suggerite dal sistema (sempre non filtrate)
  const sugGrid = document.getElementById('suggested-grid');
  const suggested = ACTIVITIES.filter(a => a.reason).slice(0, 3);
  sugGrid.innerHTML = suggested.map(a => activityCardHTML(a, true)).join('');

  // Tutte / filtrate
  const grid = document.getElementById('activities-grid');
  const { actFilters, currentCat, searchQuery } = state;
  let filtered = ACTIVITIES;

  if (currentCat !== 'tutte') filtered = filtered.filter(a => a.cat === currentCat);
  if (searchQuery) {
    filtered = filtered.filter(a =>
      a.name.toLowerCase().includes(searchQuery) || a.desc.toLowerCase().includes(searchQuery));
  }
  if (actFilters.dur === 'short')  filtered = filtered.filter(a => a.dur <= 5);
  if (actFilters.dur === 'medium') filtered = filtered.filter(a => a.dur >= 6 && a.dur <= 10);
  if (actFilters.dur === 'long')   filtered = filtered.filter(a => a.dur >= 11);
  if (actFilters.cat) filtered = filtered.filter(a => a.cat === actFilters.cat);

  const label = document.getElementById('all-label');
  const catName = actFilters.cat
    ? CATEGORY_LABELS[actFilters.cat]
    : (currentCat === 'tutte' ? 'TUTTE LE ATTIVITÀ' : currentCat.toUpperCase());
  label.textContent = catName + (filtered.length < ACTIVITIES.length ? ' · ' + filtered.length + ' risultati' : '');

  if (filtered.length === 0) {
    grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><div class="empty-icon">🔍</div><p>Nessuna attività trovata.</p></div>';
  } else {
    grid.innerHTML = filtered.map(a => activityCardHTML(a, false)).join('');
  }
}

// ─────────────────────────────────────────────
//  8. MODALE CONFERMA / SUCCESSO ATTIVITÀ
// ─────────────────────────────────────────────
function openModal(name, emoji, cat, catClass, barClass, dur, desc) {
  state.currentActivity = { name, emoji, cat, catClass, barClass, dur, desc };
  document.getElementById('modal-emoji').textContent = emoji;
  document.getElementById('modal-cat').className = 'modal-cat ' + catClass;
  document.getElementById('modal-cat').textContent = cat;
  document.getElementById('modal-name').textContent = name;
  document.getElementById('modal-dur').textContent = '⏱ ' + dur + ' min';
  document.getElementById('modal-header-bar').className = 'modal-header-bar ' + barClass;
  document.getElementById('modal-overlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  state.currentActivity = null;
}

function confirmActivity() {
  const name = state.currentActivity ? state.currentActivity.name : 'Attività';
  document.getElementById('success-sub').textContent = name + ' è stata inviata a tutti i tavoli touch.';
  closeModal();
  document.getElementById('success-overlay').classList.add('open');
}

function closeSuccess() {
  document.getElementById('success-overlay').classList.remove('open');
  showPage('dashboard');
  // Aggiorna il badge rumore per riflettere l'alert risolto
  document.getElementById('noise-badge').textContent = 'BASSO';
  document.getElementById('noise-badge').className = 'kpi-badge badge-green';
  document.getElementById('noise-sub').textContent = '✅ Rientrato nella norma';
  document.getElementById('noise-sub').style.color = 'var(--green)';
  dismissAlert();
}

// ─────────────────────────────────────────────
//  9. REPORT — elenco alunni, dettaglio, filtri
//
//  Stesso discorso del punto 7: "filterStudents" e
//  "renderStudents" erano definite due volte nel file
//  originale. Qui c'è una sola implementazione che gestisce
//  ricerca testuale + filtri avanzati insieme.
// ─────────────────────────────────────────────
function filterStudents() {
  renderStudents();
}

function renderStudents() {
  const query = document.getElementById('student-search').value.toLowerCase();
  const { repFilters, selectedStudent } = state;
  const list = document.getElementById('student-list-body');

  let filtered = STUDENTS;
  if (query)              filtered = filtered.filter(s => s.name.toLowerCase().includes(query));
  if (repFilters.status)  filtered = filtered.filter(s => s.status  === repFilters.status);
  if (repFilters.trend)   filtered = filtered.filter(s => s.trend   === repFilters.trend);
  if (repFilters.section) filtered = filtered.filter(s => s.section === repFilters.section);

  document.getElementById('student-count-label').textContent = filtered.length + ' alunni';

  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty-state" style="padding:40px 20px;text-align:center;color:var(--text-muted);"><div style="font-size:36px;margin-bottom:8px;">🔍</div><p style="font-size:14px;">Nessun alunno trovato.</p></div>';
    return;
  }

  list.innerHTML = filtered.map(s => {
    const sel = selectedStudent && selectedStudent.id === s.id ? ' selected' : '';
    return `<div class="student-row${sel}" onclick="selectStudent(${s.id})">
      <div class="student-avatar ${s.avatarClass}">${s.initials}</div>
      <div class="student-info">
        <div class="student-name">${s.name}</div>
        <div class="student-class">${s.section}</div>
      </div>
      <span class="status-pill ${STATUS_CLASSES[s.status]}">${STATUS_LABELS[s.status]}</span>
      <span class="student-chevron">›</span>
    </div>`;
  }).join('');
}

function selectStudent(id) {
  state.selectedStudent = STUDENTS.find(s => s.id === id);
  renderStudents();
  renderDetail(state.selectedStudent);
}

function renderDetail(s) {
  const panel = document.getElementById('student-detail-panel');
  panel.innerHTML = `
    <div class="detail-header">
      <div class="detail-student">
        <div class="student-avatar ${s.avatarClass}" style="width:44px;height:44px;font-size:17px;">${s.initials}</div>
        <div>
          <div class="detail-name">${s.name}</div>
          <div class="detail-class">${s.section}</div>
        </div>
      </div>
      <button class="btn-close-detail" onclick="closeDetail()">✕</button>
    </div>
    <div class="detail-divider"></div>
    <div>
      <div class="detail-section-label">Stato Attuale</div>
      <div class="detail-status-row">
        <span class="status-pill ${STATUS_CLASSES[s.status]}">${STATUS_LABELS[s.status]}</span>
        <span class="trend-badge ${TREND_CLASSES[s.trend]}">${TREND_LABELS[s.trend]}</span>
      </div>
    </div>
    <div>
      <div class="detail-section-label">Trend Attenzione (Ultimi 5 gg)</div>
      <div class="chart-wrap">
        <canvas id="trend-chart" width="380" height="100"></canvas>
      </div>
    </div>
    <div class="suggestion-box">
      <div class="suggestion-title"><span>💡</span> SUGGERIMENTO DEL SISTEMA</div>
      <div class="suggestion-text">${s.suggestion}</div>
    </div>
  `;
  drawTrendChart(s.trendDays);
}

function closeDetail() {
  state.selectedStudent = null;
  document.getElementById('student-detail-panel').innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:var(--text-muted);gap:12px;">
      <div style="font-size:48px;">👤</div>
      <p style="font-size:15px;font-weight:600;">Seleziona un alunno per vedere i dettagli</p>
    </div>`;
  document.querySelectorAll('.student-row').forEach(r => r.classList.remove('selected'));
}

// ─────────────────────────────────────────────
//  10. GRAFICO ANDAMENTO ALUNNO (canvas)
// ─────────────────────────────────────────────
function drawTrendChart(days) {
  const canvas = document.getElementById('trend-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  const padL = 30, padR = 10, padT = 12, padB = 24;
  const cW = W - padL - padR, cH = H - padT - padB;

  // griglia orizzontale
  ctx.strokeStyle = '#eee';
  ctx.lineWidth = 1;
  [0, 25, 50, 75, 100].forEach(v => {
    const y = padT + cH - (v / 100) * cH;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(W - padR, y);
    ctx.stroke();
    ctx.fillStyle = '#bbb';
    ctx.font = '9px sans-serif';
    ctx.fillText(v, 2, y + 3);
  });

  // etichette asse X
  const labels = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven'];
  const step = cW / (days.length - 1);
  days.forEach((v, i) => {
    const x = padL + i * step;
    ctx.fillStyle = '#bbb';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(labels[i], x, H - 4);
  });
  ctx.textAlign = 'left';

  // linea andamento
  const pts = days.map((v, i) => ({ x: padL + i * step, y: padT + cH - (v / 100) * cH }));
  ctx.beginPath();
  ctx.strokeStyle = '#1b9ef0';
  ctx.lineWidth = 2.5;
  pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.stroke();

  // area sotto la linea
  ctx.beginPath();
  pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.lineTo(pts[pts.length - 1].x, padT + cH);
  ctx.lineTo(pts[0].x, padT + cH);
  ctx.closePath();
  const grad = ctx.createLinearGradient(0, padT, 0, padT + cH);
  grad.addColorStop(0, 'rgba(27,158,240,0.25)');
  grad.addColorStop(1, 'rgba(27,158,240,0)');
  ctx.fillStyle = grad;
  ctx.fill();

  // punti
  pts.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#1b9ef0';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
  });
}

// ─────────────────────────────────────────────
//  11. PANNELLI FILTRO (generici per Attività + Report)
// ─────────────────────────────────────────────
function toggleFilterPanel(panelId, btnId) {
  const panel   = document.getElementById(panelId);
  const btn     = document.getElementById(btnId);
  const overlay = document.getElementById(panelId + '-overlay');
  const isOpen  = panel.classList.contains('open');

  // chiude tutto prima di aprire un eventuale nuovo pannello
  closeAllPanels();

  if (!isOpen) {
    // posiziona il pannello appena sotto il bottone
    const rect = btn.getBoundingClientRect();
    panel.style.top = (rect.bottom + 6) + 'px';
    // allinea il bordo destro del pannello se troppo vicino al bordo finestra
    const panelW = 340;
    let left = rect.left;
    if (left + panelW > window.innerWidth - 16) {
      left = window.innerWidth - panelW - 16;
    }
    panel.style.left = left + 'px';
    panel.classList.add('open');
    if (overlay) overlay.classList.add('open');
  }
}

function closeAllPanels() {
  document.querySelectorAll('.filter-panel-fixed').forEach(p => p.classList.remove('open'));
  document.querySelectorAll('.filter-panel-overlay').forEach(o => o.classList.remove('open'));
}

function toggleChip(chip, scope) {
  const filter = chip.dataset.filter;
  const val    = chip.dataset.val;
  const filterState = scope === 'act' ? state.actFilters : state.repFilters;

  // all'interno dello stesso tipo di filtro è attiva una sola opzione
  // (un nuovo click sulla stessa la deseleziona)
  const siblings = chip.closest('.filter-chips').querySelectorAll('.filter-chip');
  siblings.forEach(s => s.classList.remove('active'));

  if (filterState[filter] === val) {
    filterState[filter] = null;
  } else {
    filterState[filter] = val;
    chip.classList.add('active');
  }
}

function applyFilters(scope) {
  const panel = document.getElementById(scope === 'act' ? 'filter-act' : 'filter-rep');
  panel.classList.remove('open');

  const btnEl = document.getElementById(scope === 'act' ? 'btn-filtri-act' : 'btn-filtri-rep');
  const filterState = scope === 'act' ? state.actFilters : state.repFilters;
  const hasActive = Object.values(filterState).some(v => v !== null);
  btnEl.classList.toggle('active-filter', hasActive);

  if (scope === 'act') {
    renderActivities();
    renderActTags();
  } else {
    renderStudents();
    renderRepTags();
  }
}

function resetFilters(scope) {
  const filterState = scope === 'act' ? state.actFilters : state.repFilters;
  Object.keys(filterState).forEach(k => filterState[k] = null);
  const panelId = scope === 'act' ? 'filter-act' : 'filter-rep';
  document.querySelectorAll('#' + panelId + ' .filter-chip').forEach(c => c.classList.remove('active'));
  applyFilters(scope);
}

// ── Tag dei filtri attivi: Attività ──
function renderActTags() {
  const container = document.getElementById('act-active-tags');
  const { actFilters } = state;
  let html = '';
  if (actFilters.dur) html += `<span class="active-filter-tag">Durata: ${DURATION_LABELS[actFilters.dur]}<button onclick="removeActFilter('dur')">✕</button></span>`;
  if (actFilters.cat) html += `<span class="active-filter-tag">Categoria: ${CATEGORY_LABELS[actFilters.cat]}<button onclick="removeActFilter('cat')">✕</button></span>`;
  container.innerHTML = html;
}

function removeActFilter(key) {
  state.actFilters[key] = null;
  document.querySelectorAll('#filter-act .filter-chip[data-filter="' + key + '"]').forEach(c => c.classList.remove('active'));
  renderActivities();
  renderActTags();
  const hasActive = Object.values(state.actFilters).some(v => v !== null);
  document.getElementById('btn-filtri-act').classList.toggle('active-filter', hasActive);
}

// ── Tag dei filtri attivi: Report ──
function renderRepTags() {
  const container = document.getElementById('rep-active-tags');
  const { repFilters } = state;
  let html = '';
  if (repFilters.status)  html += `<span class="active-filter-tag">Stato: ${STATUS_LABELS[repFilters.status]}<button onclick="removeRepFilter('status')">✕</button></span>`;
  if (repFilters.trend)   html += `<span class="active-filter-tag">Trend: ${TREND_LABELS[repFilters.trend]}<button onclick="removeRepFilter('trend')">✕</button></span>`;
  if (repFilters.section) html += `<span class="active-filter-tag">Sezione: ${repFilters.section}<button onclick="removeRepFilter('section')">✕</button></span>`;
  container.innerHTML = html;
}

function removeRepFilter(key) {
  state.repFilters[key] = null;
  document.querySelectorAll('#filter-rep .filter-chip[data-filter="' + key + '"]').forEach(c => c.classList.remove('active'));
  renderStudents();
  renderRepTags();
  const hasActive = Object.values(state.repFilters).some(v => v !== null);
  document.getElementById('btn-filtri-rep').classList.toggle('active-filter', hasActive);
}

// ─────────────────────────────────────────────
//  12. BINDING EVENTI STATICI & INIZIALIZZAZIONE
//  (raccolti qui invece di essere sparsi tra le varie
//  sezioni funzionali, per maggiore chiarezza)
// ─────────────────────────────────────────────
function bindStaticEvents() {
  document.getElementById('modal-overlay').addEventListener('click', function (e) {
    if (e.target === this) closeModal();
  });
  document.getElementById('success-overlay').addEventListener('click', function (e) {
    if (e.target === this) closeSuccess();
  });

  window.addEventListener('resize', closeAllPanels);
  document.getElementById('main').addEventListener('scroll', closeAllPanels);
  window.addEventListener('resize', drawHeatmap);
}

window.addEventListener('DOMContentLoaded', () => {
  bindStaticEvents();

  // Imposta la data odierna
  const today = new Date();
  const dateStr = today.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  document.getElementById('welcome-date').textContent = `Insegnante · ${dateStr}`;

  // Disegna la heatmap dopo che il layout è stato renderizzato
  setTimeout(() => {
    drawHeatmap();
    renderActivities();
  }, 80);
});
