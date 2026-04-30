// ── Storage Keys ───────────────────────────────────────────────────────────

const KEY = {
  logs:     'sprint_logs',
  sections: 'sprint_sections',
  weak:     'sprint_weak',
  mocks:    'sprint_mocks',
  settings: 'sprint_settings',
};

// ── localStorage helpers ───────────────────────────────────────────────────

const load = key => JSON.parse(localStorage.getItem(key) || 'null');
const save = (key, val) => localStorage.setItem(key, JSON.stringify(val));

// ── Course sections ────────────────────────────────────────────────────────

const SECTIONS = [
  { num: 1,  title: "Introduction",                               phase: 1 },
  { num: 2,  title: "Code & Slides Download",                     phase: 1 },
  { num: 3,  title: "Getting Started with AWS",                   phase: 1 },
  { num: 4,  title: "IAM & AWS CLI",                              phase: 1 },
  { num: 5,  title: "EC2 Fundamentals",                           phase: 1 },
  { num: 6,  title: "EC2 — Solutions Architect Level",            phase: 1 },
  { num: 7,  title: "EC2 Instance Storage",                       phase: 1 },
  { num: 8,  title: "High Availability & Scalability: ELB & ASG", phase: 2 },
  { num: 9,  title: "RDS + Aurora + ElastiCache",                 phase: 2 },
  { num: 10, title: "Route 53",                                   phase: 2 },
  { num: 11, title: "Classic Solutions Architecture",             phase: 2 },
  { num: 12, title: "Amazon S3 Introduction",                     phase: 2 },
  { num: 13, title: "Advanced Amazon S3",                         phase: 2 },
  { num: 14, title: "Amazon S3 Security",                         phase: 2 },
  { num: 15, title: "CloudFront & AWS Global Accelerator",        phase: 2 },
  { num: 16, title: "AWS Storage Extras",                         phase: 2 },
  { num: 17, title: "Decoupling: SQS, SNS, Kinesis, Active MQ",  phase: 3 },
  { num: 18, title: "Containers: ECS, Fargate, ECR & EKS",       phase: 3 },
  { num: 19, title: "Serverless Overview",                        phase: 3 },
  { num: 20, title: "Serverless Architecture Discussions",        phase: 3 },
  { num: 21, title: "Databases in AWS",                           phase: 3 },
  { num: 22, title: "Data & Analytics",                           phase: 3 },
  { num: 23, title: "Machine Learning",                           phase: 3 },
  { num: 24, title: "AWS Monitoring, Audit & Performance",        phase: 4 },
  { num: 25, title: "IAM Advanced",                               phase: 4 },
  { num: 26, title: "AWS Security & Encryption",                  phase: 4 },
  { num: 27, title: "Networking — VPC",                           phase: 4 },
  { num: 28, title: "Disaster Recovery & Migrations",             phase: 4 },
  { num: 29, title: "More Solution Architectures",                phase: 4 },
  { num: 30, title: "Other Services",                             phase: 4 },
  { num: 31, title: "WhitePapers & Well-Architected Framework",   phase: 4 },
  { num: 32, title: "Preparing for Exam + Practice Exam",         phase: 5 },
];

const PHASE_LABELS = {
  1: "Phase 1 — Foundation (W1–W2)",
  2: "Phase 2 — Core Services (W3–W5)",
  3: "Phase 3 — Advanced (W6–W7)",
  4: "Phase 4 — Security & Networking (W8)",
  5: "Phase 5 — Exam Prep (W9–W11)",
};

const WEAK_STATUSES = ["งงอยู่", "กำลัง revisit", "เข้าใจแล้ว"];

// ── Init ───────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  setupForms();
  setupExportImport();

  const today = todayStr();
  document.getElementById('log-date').value = today;
  document.getElementById('mock-date').value = today;

  const settings = load(KEY.settings);
  if (settings?.startDate) {
    document.getElementById('settings-start').value = settings.startDate;
    document.getElementById('settings-target').value = settings.weeklyTarget || 7;
  } else {
    switchTab('settings');
    showToast('กรุณาตั้ง Sprint Start Date ก่อนครับ ⚙️');
  }

  refreshDashboard();
  renderRecentLogs();
});

// ── Tabs ───────────────────────────────────────────────────────────────────

function setupTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn =>
    btn.addEventListener('click', () => switchTab(btn.dataset.tab)));
}

function switchTab(name) {
  document.querySelectorAll('.tab-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.tab === name));
  document.querySelectorAll('.tab-content').forEach(c =>
    c.classList.toggle('active', c.id === 'tab-' + name));
  if (name === 'course') renderCourse();
  if (name === 'weak')   renderWeakAreas();
  if (name === 'mock')   renderMockExams();
}

// ── Dashboard ──────────────────────────────────────────────────────────────

function refreshDashboard() {
  const settings = load(KEY.settings);
  const logs     = Object.values(load(KEY.logs) || {});
  const sections = load(KEY.sections) || {};
  const mocks    = load(KEY.mocks) || [];
  const target   = settings?.weeklyTarget || 7;

  // Week
  if (settings?.startDate) {
    document.getElementById('stat-week').textContent =
      Math.min(getWeekNum(settings.startDate), 12) + '/12';
  }

  // Hours this week
  const hrs = getHoursThisWeek(logs);
  const hPct = Math.min((hrs / target) * 100, 100);
  const hEl  = document.getElementById('stat-hours');
  hEl.textContent = `${hrs}/${target} hrs`;
  hEl.style.color = hrs >= target ? 'var(--success)' : hrs >= target * 0.5 ? 'var(--warning)' : '';
  document.getElementById('hours-bar-fill').style.width = hPct + '%';

  // Streak
  const streak = calcStreak(logs);
  const sEl    = document.getElementById('stat-streak');
  sEl.textContent = `${streak} day${streak !== 1 ? 's' : ''} 🔥`;
  sEl.style.color = streak >= 5 ? 'var(--success)' : '';

  // Sections
  const doneCount = Object.values(sections).filter(s => s.done).length;
  const sPct = Math.round((doneCount / 32) * 100);
  document.getElementById('stat-sections').textContent = `${doneCount}/32`;
  document.getElementById('sections-bar-fill').style.width = sPct + '%';

  // Latest mock
  if (mocks.length) {
    const latest = [...mocks].sort((a, b) => b.date.localeCompare(a.date))[0];
    const mEl = document.getElementById('stat-mock');
    mEl.textContent = latest.score + '%';
    mEl.style.color = latest.score >= 80 ? 'var(--success)' : 'var(--danger)';
  }
}

// ── Forms ──────────────────────────────────────────────────────────────────

function setupForms() {

  // Daily log
  document.getElementById('form-log').addEventListener('submit', e => {
    e.preventDefault();
    const logs = load(KEY.logs) || {};
    const date = document.getElementById('log-date').value;
    logs[date] = {
      date,
      hours:   parseFloat(document.getElementById('log-hours').value),
      topics:  document.getElementById('log-topics').value.trim(),
      notes:   document.getElementById('log-notes').value.trim(),
      labDone: document.getElementById('log-lab').checked,
    };
    save(KEY.logs, logs);
    e.target.reset();
    document.getElementById('log-date').value = todayStr();
    showToast('✅ Log saved!');
    renderRecentLogs();
    refreshDashboard();
  });

  // Weak area
  document.getElementById('form-weak').addEventListener('submit', e => {
    e.preventDefault();
    const list = load(KEY.weak) || [];
    list.push({
      id:          Date.now(),
      topic:       document.getElementById('weak-topic').value.trim(),
      service:     document.getElementById('weak-service').value.trim(),
      source:      document.getElementById('weak-source').value,
      status:      'งงอยู่',
      firstFlagged: todayStr(),
      lastReviewed: null,
    });
    save(KEY.weak, list);
    e.target.reset();
    showToast('⚠️ Weak area added!');
    renderWeakAreas();
  });

  // Mock exam
  document.getElementById('form-mock').addEventListener('submit', e => {
    e.preventDefault();
    const score = parseInt(document.getElementById('mock-score').value);
    const list  = load(KEY.mocks) || [];
    list.push({
      id:       Date.now(),
      examName: document.getElementById('mock-exam-name').value,
      score,
      date:     document.getElementById('mock-date').value,
      notes:    document.getElementById('mock-notes').value.trim(),
      pass:     score >= 80,
    });
    save(KEY.mocks, list);
    e.target.reset();
    document.getElementById('mock-date').value = todayStr();
    showToast(score >= 80 ? '🎉 PASS! ' + score + '%' : '📝 Score saved: ' + score + '%');
    renderMockExams();
    refreshDashboard();
  });

  // Settings
  document.getElementById('form-settings').addEventListener('submit', e => {
    e.preventDefault();
    save(KEY.settings, {
      startDate:    document.getElementById('settings-start').value,
      weeklyTarget: parseInt(document.getElementById('settings-target').value) || 7,
    });
    showToast('✅ Settings saved!');
    refreshDashboard();
  });
}

// ── Recent Logs ────────────────────────────────────────────────────────────

function renderRecentLogs() {
  const logs = Object.values(load(KEY.logs) || {})
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7);

  const el = document.getElementById('recent-logs');
  if (!logs.length) {
    el.innerHTML = '<p class="empty">ยังไม่มี log — เริ่มเลยวันนี้!</p>';
    return;
  }
  el.innerHTML = logs.map(log => `
    <div class="log-entry ${log.hours === 0 ? 'zero-hours' : ''}">
      <div class="log-date">${formatDateTH(log.date)}</div>
      <div class="log-hours ${log.hours === 0 ? 'zero' : ''}">${log.hours} hrs</div>
      ${log.topics  ? `<div class="log-topics">📚 ${log.topics}</div>` : ''}
      ${log.notes   ? `<div class="log-notes">"${log.notes}"</div>` : ''}
      ${log.labDone ? `<div class="log-lab">✅ ทำ Lab แล้ว</div>` : ''}
    </div>`).join('');
}

// ── Course ─────────────────────────────────────────────────────────────────

function renderCourse() {
  const sections = load(KEY.sections) || {};
  const doneCount = Object.values(sections).filter(s => s.done).length;
  const pct = Math.round((doneCount / 32) * 100);

  document.getElementById('course-bar-fill').style.width = pct + '%';
  document.getElementById('course-pct').textContent = pct + '%';
  document.getElementById('course-summary').textContent =
    `${doneCount} / 32 sections เสร็จแล้ว`;

  const phases = {};
  SECTIONS.forEach(s => { (phases[s.phase] = phases[s.phase] || []).push(s); });

  document.getElementById('sections-list').innerHTML =
    Object.entries(phases).map(([phase, secs]) => `
      <div class="phase-group">
        <div class="phase-title">${PHASE_LABELS[phase]}</div>
        ${secs.map(s => {
          const data = sections['s' + s.num] || {};
          const done = data.done || false;
          return `
            <div class="section-item ${done ? 'done' : ''}" data-num="${s.num}">
              <div class="section-check">${done ? '✓' : ''}</div>
              <span class="section-num">${s.num}.</span>
              <span class="section-title">${s.title}</span>
              ${done && data.date ? `<span class="section-date">${formatDateTH(data.date)}</span>` : ''}
            </div>`;
        }).join('')}
      </div>`).join('');

  document.querySelectorAll('.section-item').forEach(el => {
    el.addEventListener('click', () => {
      const num  = parseInt(el.dataset.num);
      const key  = 's' + num;
      const data = sections[key] || {};
      const done = !data.done;
      sections[key] = { done, date: done ? todayStr() : null };
      save(KEY.sections, sections);
      showToast(done ? `✅ Section ${num} done!` : `↩️ Section ${num} unmarked`);
      renderCourse();
      refreshDashboard();
    });
  });
}

// ── Weak Areas ─────────────────────────────────────────────────────────────

function renderWeakAreas() {
  const list = load(KEY.weak) || [];
  const el   = document.getElementById('weak-list');
  const pending = list.filter(w => w.status !== 'เข้าใจแล้ว').length;
  document.getElementById('weak-count').textContent = pending || '';

  if (!list.length) {
    el.innerHTML = '<p class="empty">ยังไม่มี — เพิ่มเมื่อเจอข้อที่งง</p>';
    return;
  }

  el.innerHTML = list.map(w => {
    const next = WEAK_STATUSES[(WEAK_STATUSES.indexOf(w.status) + 1) % WEAK_STATUSES.length];
    return `
      <div class="weak-item">
        <div class="weak-info">
          <div class="weak-topic">${w.topic}</div>
          <div class="weak-meta">${w.service ? w.service + ' · ' : ''}${w.source} · ${formatDateTH(w.firstFlagged)}</div>
        </div>
        <button class="status-badge status-${w.status.replace(/\s/g,'_')}"
          data-id="${w.id}" data-next="${next}" title="คลิกเพื่อเปลี่ยน status"
        >${w.status}</button>
      </div>`;
  }).join('');

  el.querySelectorAll('.status-badge').forEach(btn => {
    btn.addEventListener('click', () => {
      const updated = list.map(w =>
        w.id == btn.dataset.id
          ? { ...w, status: btn.dataset.next, lastReviewed: todayStr() }
          : w);
      save(KEY.weak, updated);
      showToast('Status → ' + btn.dataset.next);
      renderWeakAreas();
    });
  });
}

// ── Mock Exams ─────────────────────────────────────────────────────────────

function renderMockExams() {
  const list = (load(KEY.mocks) || []).sort((a, b) => b.date.localeCompare(a.date));
  const el   = document.getElementById('mock-list');

  if (!list.length) {
    el.innerHTML = '<p class="empty">ยังไม่มี — เริ่ม W9-10</p>';
    return;
  }

  el.innerHTML = list.map(m => `
    <div class="mock-item">
      <div class="mock-score-circle ${m.pass ? 'pass' : 'fail'}">${m.score}%</div>
      <div class="mock-info">
        <div class="mock-name">${m.examName} ${m.pass ? '✅' : '❌'}</div>
        <div class="mock-meta">${formatDateTH(m.date)}</div>
        ${m.notes ? `<div class="mock-notes-text">${m.notes}</div>` : ''}
      </div>
    </div>`).join('');
}

// ── Export / Import ────────────────────────────────────────────────────────

function setupExportImport() {
  document.getElementById('btn-export').addEventListener('click', () => {
    const data = {
      logs:     load(KEY.logs),
      sections: load(KEY.sections),
      weak:     load(KEY.weak),
      mocks:    load(KEY.mocks),
      settings: load(KEY.settings),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `sprint-backup-${todayStr()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('⬇ Exported!');
  });

  document.getElementById('import-file').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.logs)     save(KEY.logs,     data.logs);
        if (data.sections) save(KEY.sections, data.sections);
        if (data.weak)     save(KEY.weak,     data.weak);
        if (data.mocks)    save(KEY.mocks,    data.mocks);
        if (data.settings) save(KEY.settings, data.settings);
        showToast('⬆ Imported!');
        location.reload();
      } catch { showToast('❌ Invalid file'); }
    };
    reader.readAsText(file);
  });
}

// ── Helpers ────────────────────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function formatDateTH(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('th-TH', {
    day: 'numeric', month: 'short', year: '2-digit'
  });
}

function getWeekNum(startDateStr) {
  const diff = new Date() - new Date(startDateStr + 'T00:00:00');
  return Math.max(1, Math.floor(diff / (7 * 864e5)) + 1);
}

function getHoursThisWeek(logs) {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);
  const mondayStr = monday.toISOString().split('T')[0];
  return logs.filter(l => l.date >= mondayStr).reduce((s, l) => s + (l.hours || 0), 0);
}

function calcStreak(logs) {
  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  let check  = todayStr();
  for (const log of sorted) {
    if (log.date === check && log.hours > 0) {
      streak++;
      const d = new Date(check + 'T00:00:00');
      d.setDate(d.getDate() - 1);
      check = d.toISOString().split('T')[0];
    } else if (log.date < check) break;
  }
  return streak;
}

let toastTimer;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 2500);
}
