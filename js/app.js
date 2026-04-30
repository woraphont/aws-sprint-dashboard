// ── Constants ──────────────────────────────────────────────────────────────

const SECTIONS = [
  { num: 1,  title: "Introduction",                              phase: 1 },
  { num: 2,  title: "Code & Slides Download",                    phase: 1 },
  { num: 3,  title: "Getting Started with AWS",                  phase: 1 },
  { num: 4,  title: "IAM & AWS CLI",                             phase: 1 },
  { num: 5,  title: "EC2 Fundamentals",                          phase: 1 },
  { num: 6,  title: "EC2 — Solutions Architect Level",           phase: 1 },
  { num: 7,  title: "EC2 Instance Storage",                      phase: 1 },
  { num: 8,  title: "High Availability & Scalability: ELB & ASG",phase: 2 },
  { num: 9,  title: "RDS + Aurora + ElastiCache",                phase: 2 },
  { num: 10, title: "Route 53",                                  phase: 2 },
  { num: 11, title: "Classic Solutions Architecture",            phase: 2 },
  { num: 12, title: "Amazon S3 Introduction",                    phase: 2 },
  { num: 13, title: "Advanced Amazon S3",                        phase: 2 },
  { num: 14, title: "Amazon S3 Security",                        phase: 2 },
  { num: 15, title: "CloudFront & AWS Global Accelerator",       phase: 2 },
  { num: 16, title: "AWS Storage Extras",                        phase: 2 },
  { num: 17, title: "Decoupling: SQS, SNS, Kinesis, Active MQ", phase: 3 },
  { num: 18, title: "Containers: ECS, Fargate, ECR & EKS",      phase: 3 },
  { num: 19, title: "Serverless Overview",                       phase: 3 },
  { num: 20, title: "Serverless Architecture Discussions",       phase: 3 },
  { num: 21, title: "Databases in AWS",                          phase: 3 },
  { num: 22, title: "Data & Analytics",                          phase: 3 },
  { num: 23, title: "Machine Learning",                          phase: 3 },
  { num: 24, title: "AWS Monitoring, Audit & Performance",       phase: 4 },
  { num: 25, title: "IAM Advanced",                              phase: 4 },
  { num: 26, title: "AWS Security & Encryption",                 phase: 4 },
  { num: 27, title: "Networking — VPC",                          phase: 4 },
  { num: 28, title: "Disaster Recovery & Migrations",            phase: 4 },
  { num: 29, title: "More Solution Architectures",               phase: 4 },
  { num: 30, title: "Other Services",                            phase: 4 },
  { num: 31, title: "WhitePapers & Well-Architected Framework",  phase: 4 },
  { num: 32, title: "Preparing for Exam + Practice Exam",        phase: 5 },
];

const PHASE_LABELS = {
  1: "Phase 1 — Foundation (W1–W2)",
  2: "Phase 2 — Core Services (W3–W5)",
  3: "Phase 3 — Advanced (W6–W7)",
  4: "Phase 4 — Security & Networking (W8)",
  5: "Phase 5 — Exam Prep (W9–W11)",
};

const WEAK_STATUSES = ["งงอยู่", "กำลัง revisit", "เข้าใจแล้ว"];

// ── Firebase refs ──────────────────────────────────────────────────────────

const auth = firebase.auth();
const db   = firebase.firestore();

let currentUser = null;

function userCol(name) {
  return db.collection("users").doc(currentUser.uid).collection(name);
}

// ── Auth ───────────────────────────────────────────────────────────────────

auth.onAuthStateChanged(async user => {
  if (user) {
    currentUser = user;
    document.getElementById("login-screen").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
    document.getElementById("user-name").textContent = user.displayName || user.email;
    if (user.photoURL) {
      document.getElementById("user-avatar").src = user.photoURL;
    }
    await initApp();
  } else {
    document.getElementById("login-screen").classList.remove("hidden");
    document.getElementById("app").classList.add("hidden");
  }
});

document.getElementById("btn-google-login").addEventListener("click", () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).catch(err => showToast("Login failed: " + err.message));
});

document.getElementById("btn-sign-out").addEventListener("click", () => {
  auth.signOut();
});

// ── Init ───────────────────────────────────────────────────────────────────

async function initApp() {
  setupTabs();
  setupForms();

  const settings = await loadSettings();
  await refreshDashboard(settings);
  await renderRecentLogs();

  // Set today's date as default in date inputs
  const today = todayStr();
  document.getElementById("log-date").value = today;
  document.getElementById("mock-date").value = today;

  // If no settings yet → go to settings tab first
  if (!settings || !settings.startDate) {
    switchTab("settings");
    showToast("กรุณาตั้ง Sprint Start Date ก่อนนะครับ ⚙️");
  }
}

// ── Tabs ───────────────────────────────────────────────────────────────────

function setupTabs() {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });
}

function switchTab(name) {
  document.querySelectorAll(".tab-btn").forEach(b =>
    b.classList.toggle("active", b.dataset.tab === name));
  document.querySelectorAll(".tab-content").forEach(c =>
    c.classList.toggle("active", c.id === "tab-" + name));

  if (name === "course") renderCourse();
  if (name === "weak")   renderWeakAreas();
  if (name === "mock")   renderMockExams();
}

// ── Dashboard Stats ────────────────────────────────────────────────────────

async function refreshDashboard(settings) {
  if (!settings || !settings.startDate) {
    document.getElementById("stat-week").textContent = "—/12";
    return;
  }

  const weeklyTarget = settings.weeklyTarget || 7;

  // Week number
  const week = getWeekNum(settings.startDate);
  document.getElementById("stat-week").textContent = `${Math.min(week, 12)}/12`;

  // All logs
  const logsSnap = await userCol("study_logs").orderBy("date", "desc").limit(60).get();
  const logs = logsSnap.docs.map(d => d.data());

  // Hours this week
  const hoursThisWeek = getHoursThisWeek(logs);
  const hPct = Math.min((hoursThisWeek / weeklyTarget) * 100, 100);
  const hColor = hoursThisWeek >= weeklyTarget ? "var(--success)" : hoursThisWeek >= weeklyTarget * 0.5 ? "var(--warning)" : "";
  document.getElementById("stat-hours").textContent = `${hoursThisWeek}/${weeklyTarget} hrs`;
  document.getElementById("stat-hours").style.color = hColor;
  document.getElementById("hours-bar-fill").style.width = hPct + "%";

  // Streak
  const streak = calcStreak(logs);
  document.getElementById("stat-streak").textContent = `${streak} day${streak !== 1 ? "s" : ""} 🔥`;
  document.getElementById("stat-streak").style.color = streak >= 5 ? "var(--success)" : "";

  // Sections
  const secSnap = await userCol("course_sections").where("done", "==", true).get();
  const doneCount = secSnap.size;
  const sPct = Math.round((doneCount / 32) * 100);
  document.getElementById("stat-sections").textContent = `${doneCount}/32`;
  document.getElementById("sections-bar-fill").style.width = sPct + "%";

  // Latest mock
  const mockSnap = await userCol("mock_exams").orderBy("date", "desc").limit(1).get();
  if (!mockSnap.empty) {
    const m = mockSnap.docs[0].data();
    const el = document.getElementById("stat-mock");
    el.textContent = m.score + "%";
    el.style.color = m.score >= 80 ? "var(--success)" : "var(--danger)";
  }
}

// ── Daily Log ──────────────────────────────────────────────────────────────

function setupForms() {
  document.getElementById("form-log").addEventListener("submit", async e => {
    e.preventDefault();
    const data = {
      date:    document.getElementById("log-date").value,
      hours:   parseFloat(document.getElementById("log-hours").value),
      topics:  document.getElementById("log-topics").value.trim(),
      notes:   document.getElementById("log-notes").value.trim(),
      labDone: document.getElementById("log-lab").checked,
      savedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };
    await userCol("study_logs").doc(data.date).set(data);
    e.target.reset();
    document.getElementById("log-date").value = todayStr();
    showToast("✅ Log saved!");
    await renderRecentLogs();
    const settings = await loadSettings();
    await refreshDashboard(settings);
  });

  document.getElementById("form-weak").addEventListener("submit", async e => {
    e.preventDefault();
    await userCol("weak_areas").add({
      topic:       document.getElementById("weak-topic").value.trim(),
      service:     document.getElementById("weak-service").value.trim(),
      source:      document.getElementById("weak-source").value,
      status:      "งงอยู่",
      firstFlagged: todayStr(),
      lastReviewed: null,
    });
    e.target.reset();
    showToast("⚠️ Weak area added!");
    renderWeakAreas();
  });

  document.getElementById("form-mock").addEventListener("submit", async e => {
    e.preventDefault();
    const score = parseInt(document.getElementById("mock-score").value);
    await userCol("mock_exams").add({
      examName: document.getElementById("mock-exam-name").value,
      score,
      date:     document.getElementById("mock-date").value,
      notes:    document.getElementById("mock-notes").value.trim(),
      pass:     score >= 80,
    });
    e.target.reset();
    document.getElementById("mock-date").value = todayStr();
    showToast(score >= 80 ? "🎉 PASS! " + score + "%" : "📝 Score saved: " + score + "%");
    renderMockExams();
    const settings = await loadSettings();
    await refreshDashboard(settings);
  });

  document.getElementById("form-settings").addEventListener("submit", async e => {
    e.preventDefault();
    const data = {
      startDate:    document.getElementById("settings-start").value,
      weeklyTarget: parseInt(document.getElementById("settings-target").value) || 7,
    };
    await db.collection("users").doc(currentUser.uid).set(data, { merge: true });
    showToast("✅ Settings saved!");
    await refreshDashboard(data);
  });
}

async function renderRecentLogs() {
  const snap = await userCol("study_logs").orderBy("date", "desc").limit(7).get();
  const container = document.getElementById("recent-logs");

  if (snap.empty) {
    container.innerHTML = '<p class="empty">ยังไม่มี log — เริ่มเลยวันนี้!</p>';
    return;
  }

  container.innerHTML = snap.docs.map(d => {
    const log = d.data();
    const zero = log.hours === 0;
    return `
      <div class="log-entry ${zero ? "zero-hours" : ""}">
        <div class="log-date">${formatDateTH(log.date)}</div>
        <div class="log-hours ${zero ? "zero" : ""}">${log.hours} hrs</div>
        ${log.topics ? `<div class="log-topics">📚 ${log.topics}</div>` : ""}
        ${log.notes  ? `<div class="log-notes">"${log.notes}"</div>` : ""}
        ${log.labDone ? `<div class="log-lab">✅ ทำ Lab แล้ว</div>` : ""}
      </div>`;
  }).join("");
}

// ── Course Progress ────────────────────────────────────────────────────────

async function renderCourse() {
  const snap = await userCol("course_sections").get();
  const doneMap = {};
  snap.docs.forEach(d => { doneMap[d.id] = d.data(); });

  const doneCount = Object.values(doneMap).filter(s => s.done).length;
  const pct = Math.round((doneCount / 32) * 100);

  document.getElementById("course-bar-fill").style.width = pct + "%";
  document.getElementById("course-pct").textContent = pct + "%";
  document.getElementById("course-summary").textContent =
    `${doneCount} / 32 sections เสร็จแล้ว`;

  // Group by phase
  const phases = {};
  SECTIONS.forEach(s => {
    if (!phases[s.phase]) phases[s.phase] = [];
    phases[s.phase].push(s);
  });

  const container = document.getElementById("sections-list");
  container.innerHTML = Object.entries(phases).map(([phase, secs]) => `
    <div class="phase-group">
      <div class="phase-title">${PHASE_LABELS[phase]}</div>
      ${secs.map(s => {
        const key = "section_" + s.num;
        const data = doneMap[key] || {};
        const done = data.done || false;
        return `
          <div class="section-item ${done ? "done" : ""}" data-num="${s.num}">
            <div class="section-check">${done ? "✓" : ""}</div>
            <span class="section-num">${s.num}.</span>
            <span class="section-title">${s.title}</span>
            ${done && data.completedDate ? `<span class="section-date">${formatDateTH(data.completedDate)}</span>` : ""}
          </div>`;
      }).join("")}
    </div>`
  ).join("");

  // Toggle section done/undone on click
  container.querySelectorAll(".section-item").forEach(el => {
    el.addEventListener("click", async () => {
      const num = parseInt(el.dataset.num);
      const key = "section_" + num;
      const current = doneMap[key]?.done || false;
      const newDone = !current;
      await userCol("course_sections").doc(key).set({
        done: newDone,
        completedDate: newDone ? todayStr() : null,
        sectionNum: num,
      });
      showToast(newDone ? `✅ Section ${num} done!` : `↩️ Section ${num} unmarked`);
      renderCourse();
      const settings = await loadSettings();
      refreshDashboard(settings);
    });
  });
}

// ── Weak Areas ─────────────────────────────────────────────────────────────

async function renderWeakAreas() {
  const snap = await userCol("weak_areas").orderBy("firstFlagged", "asc").get();
  const container = document.getElementById("weak-list");
  const countEl = document.getElementById("weak-count");

  const pending = snap.docs.filter(d => d.data().status !== "เข้าใจแล้ว");
  countEl.textContent = pending.length || "";

  if (snap.empty) {
    container.innerHTML = '<p class="empty">ยังไม่มี — เพิ่มเมื่อเจอข้อที่งง</p>';
    return;
  }

  container.innerHTML = snap.docs.map(doc => {
    const w = doc.data();
    const nextStatus = WEAK_STATUSES[(WEAK_STATUSES.indexOf(w.status) + 1) % WEAK_STATUSES.length];
    return `
      <div class="weak-item">
        <div class="weak-info">
          <div class="weak-topic">${w.topic}</div>
          <div class="weak-meta">${w.service ? w.service + " · " : ""}${w.source} · ${formatDateTH(w.firstFlagged)}</div>
        </div>
        <button
          class="status-badge status-${w.status.replace(/\s/g,".")}"
          data-id="${doc.id}"
          data-next="${nextStatus}"
          title="คลิกเพื่อเปลี่ยน status"
        >${w.status}</button>
      </div>`;
  }).join("");

  container.querySelectorAll(".status-badge").forEach(btn => {
    btn.addEventListener("click", async () => {
      const next = btn.dataset.next;
      await userCol("weak_areas").doc(btn.dataset.id).update({
        status: next,
        lastReviewed: next === "เข้าใจแล้ว" ? todayStr() : null,
      });
      showToast("Status → " + next);
      renderWeakAreas();
    });
  });
}

// ── Mock Exams ─────────────────────────────────────────────────────────────

async function renderMockExams() {
  const snap = await userCol("mock_exams").orderBy("date", "desc").get();
  const container = document.getElementById("mock-list");

  if (snap.empty) {
    container.innerHTML = '<p class="empty">ยังไม่มี — เริ่ม W9-10</p>';
    return;
  }

  container.innerHTML = snap.docs.map(doc => {
    const m = doc.data();
    return `
      <div class="mock-item">
        <div class="mock-score-circle ${m.pass ? "pass" : "fail"}">${m.score}%</div>
        <div class="mock-info">
          <div class="mock-name">${m.examName} ${m.pass ? "✅" : "❌"}</div>
          <div class="mock-meta">${formatDateTH(m.date)}</div>
          ${m.notes ? `<div class="mock-notes-text">${m.notes}</div>` : ""}
        </div>
      </div>`;
  }).join("");
}

// ── Settings ───────────────────────────────────────────────────────────────

async function loadSettings() {
  const doc = await db.collection("users").doc(currentUser.uid).get();
  const data = doc.exists ? doc.data() : null;
  if (data?.startDate) {
    document.getElementById("settings-start").value = data.startDate;
    document.getElementById("settings-target").value = data.weeklyTarget || 7;
  }
  return data;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function formatDateTH(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" });
}

function getWeekNum(startDateStr) {
  const start = new Date(startDateStr + "T00:00:00");
  const now = new Date();
  const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.floor(diffDays / 7) + 1);
}

function getHoursThisWeek(logs) {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);
  const mondayStr = monday.toISOString().split("T")[0];

  return logs
    .filter(l => l.date >= mondayStr)
    .reduce((sum, l) => sum + (l.hours || 0), 0);
}

function calcStreak(logs) {
  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  let checkDate = todayStr();

  for (const log of sorted) {
    if (log.date === checkDate && log.hours > 0) {
      streak++;
      const d = new Date(checkDate + "T00:00:00");
      d.setDate(d.getDate() - 1);
      checkDate = d.toISOString().split("T")[0];
    } else if (log.date < checkDate) {
      break;
    }
  }
  return streak;
}

let toastTimer = null;

function showToast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add("hidden"), 2500);
}
