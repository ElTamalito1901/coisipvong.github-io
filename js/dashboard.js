import { db, collection, getDocs } from "../firebase.js";

// ── ESTADO ──────────────────────────────────────────────
const STATUS_MAP = {
  'Pendiente':   { key:'pendiente', color:getCssVar('--st-pendiente') },
  'En proceso':  { key:'proceso',   color:getCssVar('--st-proceso') },
  'Atendido':    { key:'atendido',  color:getCssVar('--st-atendido') },
  'Cerrado':     { key:'cerrado',   color:getCssVar('--st-cerrado') },
};

let charts = { tendencia:null, estado:null, distrito:null };

// ── UTILS ───────────────────────────────────────────────
function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function getCssVar(name){ return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
function getAns(r, label){
  if(!r.answers) return '';
  const a = r.answers.find(a=>a.label&&a.label.toLowerCase().includes(label.toLowerCase()));
  return a ? (Array.isArray(a.value)?a.value.join(', '):a.value) : '';
}
function getEstado(r){ return r.estado || 'Pendiente'; }
function estadoKey(estado){ return (STATUS_MAP[estado]||STATUS_MAP['Pendiente']).key; }
function fmtDay(d){ return d.toLocaleDateString('es-PE',{day:'2-digit',month:'2-digit'}); }
function dayKey(d){ return d.toISOString().slice(0,10); }

// ── CARGAR DATOS ────────────────────────────────────────
async function loadAll(){
  let responses = [];
  try {
    const qs = await getDocs(collection(db,"respuestas"));
    qs.forEach(d => responses.push({ firebaseId:d.id, ...d.data() }));
  } catch(e){
    console.error("Error al cargar respuestas:", e);
  }
  render(responses);
  document.getElementById('updated-at').textContent =
    'Actualizado: ' + new Date().toLocaleTimeString('es-PE');
}

// ── RENDER PRINCIPAL ────────────────────────────────────
function render(responses){
  renderStats(responses);
  renderTendencia(responses);
  renderEstadoChart(responses);
  renderDistritoChart(responses);
  renderRecentTable(responses);
}

// ── STATS ───────────────────────────────────────────────
function renderStats(responses){
  const counts = { Pendiente:0, 'En proceso':0, Atendido:0, Cerrado:0 };
  responses.forEach(r=>{ const e=getEstado(r); counts[e] = (counts[e]||0)+1; });

  const cards = [
    { label:'Total respuestas', value:responses.length, cls:'' },
    { label:'Pendientes',  value:counts['Pendiente'],  cls:'st-pendiente' },
    { label:'En proceso',  value:counts['En proceso'], cls:'st-proceso' },
    { label:'Atendidos',   value:counts['Atendido'],   cls:'st-atendido' },
    { label:'Cerrados',    value:counts['Cerrado'],    cls:'st-cerrado' },
  ];

  document.getElementById('stats-row').innerHTML = cards.map(c=>`
    <div class="stat-card ${c.cls}">
      <div class="sn">${c.value}</div>
      <div class="sl">${c.label}</div>
    </div>
  `).join('');
}

// ── TENDENCIA (últimos 14 días) ─────────────────────────
function renderTendencia(responses){
  const days = [];
  const today = new Date();
  for(let i=13;i>=0;i--){
    const d = new Date(today);
    d.setDate(d.getDate()-i);
    days.push(d);
  }
  const counts = days.map(d=>{
    const key = dayKey(d);
    return responses.filter(r=>r.sentAt && dayKey(new Date(r.sentAt))===key).length;
  });

  const ctx = document.getElementById('chart-tendencia');
  if(charts.tendencia) charts.tendencia.destroy();
  charts.tendencia = new Chart(ctx, {
    type: 'line',
    data: {
      labels: days.map(fmtDay),
      datasets: [{
        data: counts,
        borderColor: getCssVar('--primary'),
        backgroundColor: 'rgba(145,110,172,0.12)',
        tension: 0.35,
        fill: true,
        pointRadius: 3,
        pointBackgroundColor: getCssVar('--primary'),
      }]
    },
    options: {
      plugins: { legend: { display:false } },
      scales: {
        y: { beginAtZero:true, ticks:{ precision:0 }, grid:{ color:'#f0eaf7' } },
        x: { grid:{ display:false } }
      }
    }
  });
}

// ── POR ESTADO ──────────────────────────────────────────
function renderEstadoChart(responses){
  const labels = Object.keys(STATUS_MAP);
  const counts = labels.map(l=>responses.filter(r=>getEstado(r)===l).length);
  const colors = labels.map(l=>STATUS_MAP[l].color);

  const ctx = document.getElementById('chart-estado');
  if(charts.estado) charts.estado.destroy();
  charts.estado = new Chart(ctx, {
    type: 'doughnut',
    data: { labels, datasets: [{ data: counts, backgroundColor: colors, borderWidth: 0 }] },
    options: {
      cutout: '68%',
      plugins: { legend: { display:false } }
    }
  });

  document.getElementById('legend-estado').innerHTML = labels.map((l,i)=>`
    <div class="legend-item">
      <span class="legend-dot" style="background:${colors[i]}"></span>
      ${esc(l)} (${counts[i]})
    </div>
  `).join('');
}

// ── POR DISTRITO ────────────────────────────────────────
function renderDistritoChart(responses){
  const map = {};
  responses.forEach(r=>{
    const d = getAns(r,'Distrito de domicilio') || 'Sin distrito';
    map[d] = (map[d]||0)+1;
  });
  const sorted = Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,8);

  const ctx = document.getElementById('chart-distrito');
  if(charts.distrito) charts.distrito.destroy();
  charts.distrito = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sorted.map(s=>s[0]),
      datasets: [{
        data: sorted.map(s=>s[1]),
        backgroundColor: getCssVar('--primary'),
        borderRadius: 6,
        maxBarThickness: 36
      }]
    },
    options: {
      plugins: { legend: { display:false } },
      scales: {
        y: { beginAtZero:true, ticks:{ precision:0 }, grid:{ color:'#f0eaf7' } },
        x: { grid:{ display:false } }
      }
    }
  });
}

// ── TABLA RECIENTE ──────────────────────────────────────
function renderRecentTable(responses){
  document.getElementById('empty-msg').style.display = responses.length===0 ? 'block' : 'none';

  const recent = [...responses]
    .sort((a,b)=> new Date(b.sentAt||0) - new Date(a.sentAt||0))
    .slice(0,8);

  const tbody = document.getElementById('recent-tbody');

  if(recent.length===0){
    tbody.innerHTML = '';
    return;
  }

  tbody.innerHTML = recent.map(r=>{
    const nombre = [getAns(r,'Nombres'),getAns(r,'Apellidos')].filter(Boolean).join(' ')||'—';
    const estado = getEstado(r);
    return `
      <tr>
        <td><strong>${esc(nombre)}</strong></td>
        <td>${esc(getAns(r,'Nombre del encuestador/a')||'—')}</td>
        <td>${esc(getAns(r,'Distrito de domicilio')||'—')}</td>
        <td><span class="tag-estado st-${estadoKey(estado)}">${esc(estado)}</span></td>
        <td>${r.sentAt ? new Date(r.sentAt).toLocaleDateString('es-PE') : '—'}</td>
      </tr>
    `;
  }).join('');
}

// ── EVENTOS ─────────────────────────────────────────────
document.getElementById('btn-refresh').addEventListener('click', loadAll);

// ── INIT ────────────────────────────────────────────────
loadAll();