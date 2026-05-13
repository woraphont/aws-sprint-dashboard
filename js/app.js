// ── Storage Keys ─────────────────────────────────────────────────────────────

const KEY = {
  sections:      'sprint_sections',
  settings:      'sprint_settings',
  practiceTests: 'sprint_practice_tests',
  daily:         'sprint_daily',
  flashcards:    'sprint_flashcards',
};

const load = key => JSON.parse(localStorage.getItem(key) || 'null');
const save = (key, val) => localStorage.setItem(key, JSON.stringify(val));
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

// ── Course Sections ──────────────────────────────────────────────────────────

const SECTIONS = [
  { num: 1,  title: "Introduction",                               phase: 1, desc: "ภาพรวม course และสิ่งที่จะเรียน — อ่านผ่านพอ" },
  { num: 2,  title: "Code & Slides Download",                     phase: 1, desc: "ดาวน์โหลด slides + code ของ course — ทำครั้งเดียวพอ" },
  { num: 3,  title: "Getting Started with AWS",                   phase: 1, desc: "สร้าง account, เข้าใจ Region/AZ, ตั้ง billing alert — setup ก่อนเริ่ม" },
  { num: 4,  title: "IAM & AWS CLI",                              phase: 1, desc: "User/Group/Role/Policy — เหมือน AD แต่บน cloud · ทุก service ต้องผ่านนี้ · ออกสอบ ~30%" },
  { num: 5,  title: "EC2 Fundamentals",                           phase: 1, desc: "VM บน cloud — instance type, keypair, security group · พื้นฐานที่ infra engineer ต้องรู้" },
  { num: 6,  title: "EC2 — Solutions Architect Level",            phase: 1, desc: "Placement group, ENI, Spot vs Reserved · เลือกให้ตรง workload ลด cost ได้มาก" },
  { num: 7,  title: "EC2 Instance Storage",                       phase: 1, desc: "EBS = disk attach, EFS = NFS share, Instance Store = temp · เลือกผิดข้อมูลหายหรือ cost พุ่ง" },
  { num: 8,  title: "High Availability & Scalability: ELB & ASG", phase: 2, desc: "Load balancer + Auto Scaling — หัวใจ HA · ออกสอบเยอะที่สุด topic นึง" },
  { num: 9,  title: "RDS + Aurora + ElastiCache",                 phase: 2, desc: "Managed SQL DB + Redis/Memcached cache · ไม่ต้อง patch OS · เลือก engine ให้ตรง usecase" },
  { num: 10, title: "Route 53",                                   phase: 2, desc: "DNS ของ AWS — failover/weighted/latency routing · ใช้สำหรับ HA cross-region" },
  { num: 11, title: "Classic Solutions Architecture",             phase: 2, desc: "เชื่อม concepts ก่อนหน้าเป็น real-world pattern เช่น stateless web app · เห็นภาพก่อนเรียนต่อ" },
  { num: 12, title: "Amazon S3 Introduction",                     phase: 2, desc: "Object storage เก็บได้ทุกอย่าง — backup, log, static website, data lake · ราคาถูกที่สุดบน AWS" },
  { num: 13, title: "Advanced Amazon S3",                         phase: 2, desc: "Versioning, Lifecycle policy, Replication · optimize cost + compliance" },
  { num: 14, title: "Amazon S3 Security",                         phase: 2, desc: "Bucket policy, encryption, pre-signed URL · ป้องกัน data leak · incident ที่พบบ่อย" },
  { num: 15, title: "CloudFront & AWS Global Accelerator",        phase: 2, desc: "CDN กระจาย content ทั่วโลก + เร่ง TCP global · ลด latency + load ที่ origin" },
  { num: 16, title: "AWS Storage Extras",                         phase: 2, desc: "Snow family (ส่ง HDD), Storage Gateway (hybrid), FSx · ใช้ migrate data ใหญ่หรือมี on-prem" },
  { num: 17, title: "Decoupling: SQS, SNS, Kinesis, Active MQ",   phase: 3, desc: "Queue + Pub/Sub + Stream · ตัด tight coupling ระหว่าง service · ระบบ scale + resilient" },
  { num: 18, title: "Containers: ECS, Fargate, ECR & EKS",        phase: 3, desc: "รัน container บน AWS — ECS = AWS-native, EKS = Kubernetes managed · Fargate = serverless container" },
  { num: 19, title: "Serverless Overview",                        phase: 3, desc: "Lambda + API Gateway + DynamoDB + Cognito · จ่ายตาม request · ไม่ต้องจัดการ server" },
  { num: 20, title: "Serverless Architecture Discussions",        phase: 3, desc: "Pattern จริง — mobile backend, thumbnail pipeline · เอา serverless มาต่อกันเป็น solution" },
  { num: 21, title: "Databases in AWS",                           phase: 3, desc: "RDS vs DynamoDB vs Redshift vs Neptune · เลือก DB ให้ถูก usecase · ผิดแล้วแก้ยาก" },
  { num: 22, title: "Data & Analytics",                           phase: 3, desc: "Athena (query S3), Glue (ETL), Redshift (warehouse), Kinesis (stream) · data pipeline บน AWS" },
  { num: 23, title: "Machine Learning",                           phase: 3, desc: "Rekognition, Comprehend, SageMaker · รู้ชื่อ + usecase พอ · ออกแบบ scenario เลือก service" },
  { num: 24, title: "AWS Monitoring, Audit & Performance",        phase: 4, desc: "CloudWatch (metrics/logs/alarm) + CloudTrail (API history) + Config · เหมือน SIEM + monitoring" },
  { num: 25, title: "IAM Advanced",                               phase: 4, desc: "Roles, SCP, Permission Boundary, Cross-account · จำเป็นสำหรับ multi-account enterprise" },
  { num: 26, title: "AWS Security & Encryption",                  phase: 4, desc: "KMS (key mgmt), Secrets Manager, WAF, Shield · data at rest/in transit + DDoS defense" },
  { num: 27, title: "Networking — VPC",                           phase: 4, desc: "Subnet, Routing, NAT, VPN, Direct Connect · network บน AWS · สำคัญถ้าทำ hybrid cloud" },
  { num: 28, title: "Disaster Recovery & Migrations",             phase: 4, desc: "RPO/RTO · Backup vs Pilot Light vs Warm Standby vs Multi-site · วาง DR ให้ถูก + cost effective" },
  { num: 29, title: "More Solution Architectures",                phase: 4, desc: "Event-driven, HPC, Microservices patterns · ดู architecture แบบ enterprise จริง" },
  { num: 30, title: "Other Services",                             phase: 4, desc: "SES, SSM, Pinpoint, Cost Explorer · รู้ชื่อ + usecase พอ · ออกสอบ 1-2 ข้อ" },
  { num: 31, title: "WhitePapers & Well-Architected Framework",   phase: 4, desc: "6 Pillars: Security/Reliability/Performance/Cost/Ops/Sustainability · framework ที่ข้อสอบอ้างถึงบ่อย" },
  { num: 32, title: "Preparing for Exam + Practice Exam",         phase: 5, desc: "Tips สอบ, time management, trap questions · อ่านก่อนสอบจริงเพิ่ม score 5-10%" },
];

const PHASE_LABELS = {
  1: "Phase 1 — Foundation (W1–W2)",
  2: "Phase 2 — Core Services (W3–W5)",
  3: "Phase 3 — Advanced (W6–W7)",
  4: "Phase 4 — Security & Networking (W8)",
  5: "Phase 5 — Exam Prep (W9–W11)",
};

const PRACTICE_TESTS = [
  { num: 1, label: 'Practice Test 1 — 65 Questions' },
  { num: 2, label: 'Practice Test 2 — 65 Questions' },
  { num: 3, label: 'Practice Test 3 — 65 Questions' },
  { num: 4, label: 'Practice Test 4 — 65 Questions' },
  { num: 5, label: 'Practice Test 5 — 65 Questions' },
  { num: 6, label: 'Practice Test 6 — 65 Questions' },
];

const UNDERSTANDING = [
  { key: 'none',       label: '—',           cls: '' },
  { key: 'learning',   label: 'กำลังเรียน',  cls: 'u-learning' },
  { key: 'understood', label: 'เข้าใจแล้ว',  cls: 'u-understood' },
  { key: 'confused',   label: 'งงอยู่',       cls: 'u-confused' },
];

// ── Daily Checklist Tasks ────────────────────────────────────────────────────

const DAILY_TASKS = [
  { key: 'elsa',    icon: '🗣️', label: 'ELSA drill (15 min)',          desc: 'pronunciation + AWS service words' },
  { key: 'video',   icon: '🎬', label: 'AWS course (1+ section)',      desc: 'Stephane Maarek video' },
  { key: 'handson', icon: '🛠️', label: 'AWS hands-on (15 min)',        desc: 'Console / CLI ทำเอง' },
  { key: 'flash',   icon: '🃏', label: 'Flashcards (10 cards)',        desc: 'AWS services + IT vocab' },
  { key: 'shadow',  icon: '🎧', label: 'Shadow English (5 min)',       desc: 'AWS clip / re:Invent' },
];

// ── 11-Week Study Plan ───────────────────────────────────────────────────────

const WEEKLY_PLAN = [
  { week: 1,  phase: 1, title: 'Foundation — IAM + EC2 basics',
    aws:   'Sections 1–5: Intro, AWS Setup, IAM, EC2 Fundamentals',
    elsa:  'Phase 1 — daily ELSA + drill: EC2, S3, IAM, EBS, RDS, VPC',
    hands: 'สร้าง IAM user + role · launch EC2 t2.micro · ssh เข้าได้' },
  { week: 2,  phase: 1, title: 'EC2 deep + Storage',
    aws:   'Sections 6–7: EC2 SA-level, EBS/EFS/Instance Store',
    elsa:  'ELSA daily · drill: ELB, ASG, EFS pronunciation',
    hands: 'attach EBS · snapshot · mount EFS จาก 2 EC2' },
  { week: 3,  phase: 2, title: 'HA — ELB + ASG',
    aws:   'Section 8: ELB + Auto Scaling Group',
    elsa:  'Phase 2 start · ฝึกพูด architecture เป็น English',
    hands: 'สร้าง ALB + Target Group + ASG · scale-out ดูจริง' },
  { week: 4,  phase: 2, title: 'Database + DNS',
    aws:   'Sections 9–11: RDS, Aurora, ElastiCache, Route 53, Solutions Arch',
    elsa:  'IT vocab drill (Infrastructure track)',
    hands: 'RDS MySQL + connect จาก EC2 · Route 53 record' },
  { week: 5,  phase: 2, title: 'S3 mastery',
    aws:   'Sections 12–16: S3, Advanced S3, Security, CloudFront, Storage extras',
    elsa:  'Shadow 1 AWS re:Invent clip 5 min',
    hands: 'S3 versioning + lifecycle · CloudFront ต่อ S3 static site' },
  { week: 6,  phase: 3, title: 'Decoupling + Containers',
    aws:   'Sections 17–18: SQS/SNS/Kinesis, ECS/EKS/Fargate',
    elsa:  'Mock standup เป็น English (ทุกวันศุกร์)',
    hands: 'SQS queue + Lambda consumer · ECS Fargate task' },
  { week: 7,  phase: 3, title: 'Serverless + Data',
    aws:   'Sections 19–23: Lambda, API GW, DynamoDB, Athena, ML services',
    elsa:  'IT vocab (Security/Ops track)',
    hands: 'Lambda + API GW + DynamoDB CRUD' },
  { week: 8,  phase: 4, title: 'Security + VPC + DR',
    aws:   'Sections 24–31: CloudWatch, IAM Adv, KMS, VPC, DR, Well-Arch',
    elsa:  'Phase 3 start · vendor-call practice',
    hands: 'VPC custom + public/private subnet + NAT GW' },
  { week: 9,  phase: 5, title: 'Practice Exam Round 1',
    aws:   'TutorialsDojo Test 1–2 · จด pattern ที่ผิด',
    elsa:  'อ่าน explanation TD เป็น English ทั้งหมด',
    hands: 'แก้ scenario ที่ทำผิดด้วย Console จริง' },
  { week: 10, phase: 5, title: 'Practice Exam Round 2',
    aws:   'TutorialsDojo Test 3–5 · เป้า 80%+ ทุกชุด',
    elsa:  'Mock interview AWS English (ใช้ Claude)',
    hands: 'review topic ที่ยังพลาด — VPC, IAM Adv, KMS' },
  { week: 11, phase: 5, title: 'Final + Exam',
    aws:   'TD Test 6 · Section 32 (exam tips) · light review only',
    elsa:  'rest mode',
    hands: 'พักก่อนสอบ 1 วัน · นอนให้พอ · 🎯 สอบจริง!' },
];

// ── ELSA / English (informational) ───────────────────────────────────────────

const ELSA_LEARNING_PLAN = [
  {
    phase: 'Phase 1', months: 'Month 1–2', title: 'Foundation (Phonetic Awareness)',
    time: '20–25 min/day',
    items: [
      '<b>Daily Lesson</b> (10 min) — pronunciation basics ใน ELSA app',
      '<b>Pinpoint exercises</b> — focus เสียงที่คนไทยมักผิด: <code>th</code>, <code>v</code> vs <code>w</code>, <code>-tion</code>, final consonants',
      '<b>AWS service drill</b> (5 min/day) — EC2, S3, IAM, EBS, RDS, VPC พูดให้ถูก',
    ],
    goal: 'Baseline pronunciation test passed + 28-day streak',
  },
  {
    phase: 'Phase 2', months: 'Month 3–4', title: 'Sentence + Listening',
    time: '25–30 min/day',
    items: [
      '<b>Daily Lesson + Conversation mode</b> — ฝึกตอบเป็นประโยคเต็ม',
      '<b>IT Vocab drill</b> (Technology track) — Infrastructure / Security / AWS terms',
      '<b>Weekly shadowing</b> (1 video) — AWS re:Invent keynote (5 min) / What\'s New / Cisco / Palo Alto demos',
      '<b>ฝึกพูด</b> — describe Stock Bot architecture, AIS infra เป็น English (3 ประโยค)',
    ],
    goal: '50 lessons + 56-day streak + พูดประโยคยาวได้',
  },
  {
    phase: 'Phase 3', months: 'Month 5–6', title: 'Real-World Application',
    time: '20 min/day + weekly mock meeting',
    items: [
      '<b>ELSA Conversation mode</b> — รักษา fluency',
      '<b>Mock meetings with Claude</b> (พิมพ์ scenario, พูดออกเสียงตอบ → ขอ feedback):<br>• Incident bridge — "We have an SLA breach on..."<br>• Vendor call — "Could you confirm the firewall rule change scope?"<br>• Standup — "Yesterday I deployed... today I am working on..."',
      '<b>Real practice</b> — เขียน incident summary เป็น English ก่อน translate Thai',
    ],
    goal: '100 lessons + 4 mock meetings + vendor call confidence',
  },
];

const ELSA_SERVICES = [
  { name: 'EC2',        desc: 'Elastic Compute Cloud — VM (เครื่อง server) บน cloud' },
  { name: 'S3',         desc: 'Simple Storage Service — object storage เก็บไฟล์ทุกชนิด' },
  { name: 'IAM',        desc: 'Identity & Access Management — User/Role/Policy' },
  { name: 'EBS',        desc: 'Elastic Block Store — disk attach กับ EC2' },
  { name: 'EFS',        desc: 'Elastic File System — NFS share หลาย EC2 mount ได้' },
  { name: 'ELB',        desc: 'Elastic Load Balancer — กระจาย traffic เข้า EC2' },
  { name: 'ASG',        desc: 'Auto Scaling Group — เพิ่ม/ลด EC2 อัตโนมัติ' },
  { name: 'VPC',        desc: 'Virtual Private Cloud — network ของคุณบน AWS' },
  { name: 'RDS',        desc: 'Relational Database Service — managed SQL DB' },
  { name: 'Aurora',     desc: 'AWS-native MySQL/PostgreSQL — เร็วกว่า RDS ~5x' },
  { name: 'DynamoDB',   desc: 'Managed NoSQL — fast key-value, single-digit ms latency' },
  { name: 'Lambda',     desc: 'Serverless function — รัน code เมื่อมี trigger' },
  { name: 'SQS',        desc: 'Simple Queue Service — message queue (decouple)' },
  { name: 'SNS',        desc: 'Simple Notification Service — pub/sub topic' },
  { name: 'KMS',        desc: 'Key Management Service — จัดการ encryption keys' },
  { name: 'CloudFront', desc: 'CDN — กระจาย content ทั่วโลก ลด latency' },
  { name: 'CloudWatch', desc: 'Monitoring + logs + alarms ของ AWS' },
  { name: 'Route 53',   desc: 'DNS service ของ AWS — failover/weighted routing' },
];

const ELSA_VOCAB = [
  { cat: 'Infrastructure', words: [
    { w: 'failover',       m: 'การสลับไปใช้ระบบสำรองเมื่อหลัก fail' },
    { w: 'throughput',     m: 'อัตราข้อมูลที่ระบบประมวลได้ต่อวินาที' },
    { w: 'latency',        m: 'เวลา response (ดีเลย์) ยิ่งน้อยยิ่งดี' },
    { w: 'mitigation',     m: 'การลดผลกระทบของปัญหา' },
    { w: 'remediation',    m: 'การแก้ไขให้กลับสู่สภาพปกติ' },
    { w: 'provisioning',   m: 'การสร้าง/เตรียมทรัพยากร' },
    { w: 'orchestration',  m: 'การประสานงาน automate หลายขั้นตอน' },
    { w: 'redundancy',     m: 'ความซ้ำซ้อน — มีตัวสำรองเพื่อ HA' },
  ]},
  { cat: 'Security/Ops', words: [
    { w: 'compliance',     m: 'การปฏิบัติตามกฎ/มาตรฐาน (PCI-DSS, ISO)' },
    { w: 'authentication', m: 'ตรวจสอบว่าเป็นใคร (login)' },
    { w: 'authorization',  m: 'ตรวจสอบว่ามีสิทธิ์ทำอะไร (permissions)' },
    { w: 'encryption',     m: 'การเข้ารหัสข้อมูล' },
    { w: 'vulnerability',  m: 'ช่องโหว่ความปลอดภัย' },
    { w: 'patch',          m: 'แพตช์ — ปะรอยช่องโหว่' },
    { w: 'hardening',      m: 'เพิ่มความปลอดภัยของระบบ (ปิด port, จำกัดสิทธิ์)' },
    { w: 'root cause',     m: 'สาเหตุต้นตอของปัญหา' },
  ]},
  { cat: 'AWS-specific', words: [
    { w: 'instance', m: 'EC2 ตัวนึง = 1 instance' },
    { w: 'bucket',   m: 'container ของ object ใน S3' },
    { w: 'function', m: 'Lambda function (serverless)' },
    { w: 'queue',    m: 'SQS queue สำหรับ message' },
    { w: 'topic',    m: 'SNS topic สำหรับ pub/sub' },
    { w: 'stack',    m: 'CloudFormation stack — กลุ่ม resources' },
    { w: 'role',     m: 'IAM role — set ของ permissions' },
    { w: 'policy',   m: 'JSON document ระบุ permissions' },
    { w: 'endpoint', m: 'URL/IP ที่ service ฟังอยู่' },
    { w: 'gateway',  m: 'ตัวกลางเชื่อมระหว่าง networks' },
  ]},
  { cat: 'Meeting phrases', words: [
    { w: 'Could you elaborate on...',          m: 'ช่วยขยายความ ... ให้หน่อยได้มั้ย' },
    { w: 'To clarify...',                      m: 'เพื่อความชัดเจน...' },
    { w: 'Just to make sure I understand...',  m: 'แค่เช็คให้แน่ใจว่าเข้าใจ...' },
    { w: "Let's circle back on...",            m: 'กลับมาคุยเรื่อง ... อีกที' },
  ]},
];

// Leitner box intervals (days). Box 5 = mastered.
const LEITNER_INTERVAL_DAYS = [0, 1, 2, 4, 8, 16];

// ── Init ──────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  setupForms();
  setupExportImport();
  setupCourseEvents();
  setupDailyEvents();
  setupFlashcardEvents();
  setupResetButtons();

  hydrateSettings();
  renderAll();
});

function renderAll() {
  renderProgress();
  renderGuidance();
  renderDaily();
  renderWeeklyPlan();
  renderFlashcards();
}

function hydrateSettings() {
  const settings = load(KEY.settings);
  if (settings?.startDate) document.getElementById('settings-start').value = settings.startDate;
  if (settings?.examDate)  document.getElementById('settings-exam').value  = settings.examDate;
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

function setupTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn =>
    btn.addEventListener('click', () => switchTab(btn.dataset.tab)));
}

function switchTab(name) {
  document.querySelectorAll('.tab-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.tab === name));
  document.querySelectorAll('.tab-content').forEach(c =>
    c.classList.toggle('active', c.id === 'tab-' + name));
}

// ── Forms ─────────────────────────────────────────────────────────────────────

function setupForms() {
  document.getElementById('form-settings').addEventListener('submit', e => {
    e.preventDefault();
    save(KEY.settings, {
      startDate: document.getElementById('settings-start').value,
      examDate:  document.getElementById('settings-exam').value,
    });
    showToast('✅ Settings saved!');
    renderAll();
  });
}

function setupResetButtons() {
  document.getElementById('btn-reset-daily').addEventListener('click', () => {
    if (!confirm('ลบ daily checklist ทั้งหมด?')) return;
    localStorage.removeItem(KEY.daily);
    showToast('🗑️ Daily reset');
    renderAll();
  });
  document.getElementById('btn-reset-flash').addEventListener('click', () => {
    if (!confirm('ลบ flashcard progress ทั้งหมด?')) return;
    localStorage.removeItem(KEY.flashcards);
    showToast('🗑️ Flashcards reset');
    renderAll();
  });
}

// ── Render: Course Progress ──────────────────────────────────────────────────

function renderProgress() {
  const sections  = load(KEY.sections) || {};
  const ptData    = load(KEY.practiceTests) || {};
  const doneCount = Object.values(sections).filter(s => s.done).length;
  const pct       = Math.round((doneCount / SECTIONS.length) * 100);

  document.getElementById('course-bar-fill').style.width = pct + '%';
  document.getElementById('course-pct').textContent = pct + '%';
  document.getElementById('course-summary').textContent =
    `${doneCount} / ${SECTIONS.length} sections เสร็จแล้ว`;

  const sectionsByPhase = SECTIONS.reduce((acc, s) => {
    (acc[s.phase] ??= []).push(s);
    return acc;
  }, {});

  const sectionsHtml = Object.entries(sectionsByPhase).map(([phase, secs]) => `
    <div class="phase-group">
      <div class="phase-title">${PHASE_LABELS[phase]}</div>
      ${secs.map(s => sectionRowHtml(s, sections['s' + s.num] || {})).join('')}
    </div>`).join('');

  const ptDoneCount = PRACTICE_TESTS.filter(t => (ptData['pt' + t.num] || {}).done).length;
  const practiceHtml = `
    <div class="phase-group">
      <div class="phase-title">Practice Exams — ${ptDoneCount}/${PRACTICE_TESTS.length} done</div>
      ${PRACTICE_TESTS.map(t => practiceRowHtml(t, ptData['pt' + t.num] || {})).join('')}
    </div>`;

  document.getElementById('sections-list').innerHTML = sectionsHtml + practiceHtml;
}

function sectionRowHtml(s, data) {
  const done = !!data.done;
  const uIdx = Math.max(0, UNDERSTANDING.findIndex(u => u.key === (data.understanding || 'none')));
  const u    = UNDERSTANDING[uIdx];
  return `
    <div class="section-item ${done ? 'done' : ''}" data-num="${s.num}">
      <div class="section-check">${done ? '✓' : ''}</div>
      <span class="section-num">${s.num}.</span>
      <div class="section-body">
        <span class="section-title">${escapeHtml(s.title)}</span>
        ${s.desc ? `<div class="section-desc">${escapeHtml(s.desc)}</div>` : ''}
      </div>
      <div class="section-right">
        ${done && data.date ? `<span class="section-date">${formatDateTH(data.date)}</span>` : ''}
        <button class="u-badge ${u.cls}" data-num="${s.num}" data-uidx="${uIdx}">${u.label}</button>
      </div>
    </div>`;
}

function practiceRowHtml(t, pt) {
  const done = !!pt.done;
  return `
    <div class="section-item ${done ? 'done' : ''}" data-pt="${t.num}">
      <div class="section-check">${done ? '✓' : ''}</div>
      <div class="section-body">
        <span class="section-title">${escapeHtml(t.label)}</span>
      </div>
      <div class="section-right">
        ${done && pt.date ? `<span class="section-date">${formatDateTH(pt.date)}</span>` : ''}
      </div>
    </div>`;
}

function renderGuidance() {
  document.getElementById('elsa-plan').innerHTML = ELSA_LEARNING_PLAN.map((p, idx) => `
    <details class="elsa-phase" ${idx === 0 ? 'open' : ''}>
      <summary class="elsa-phase-head">
        <span class="elsa-phase-tag">${escapeHtml(p.phase)}</span>
        <span class="elsa-phase-title">${escapeHtml(p.months)} — ${escapeHtml(p.title)}</span>
        <span class="elsa-phase-time">⏱️ ${escapeHtml(p.time)}</span>
      </summary>
      <ul class="elsa-phase-list">
        ${p.items.map(it => `<li>${it}</li>`).join('')}
      </ul>
      <div class="elsa-phase-goal">🎯 <b>Goal:</b> ${escapeHtml(p.goal)}</div>
    </details>`).join('');

  document.getElementById('elsa-services').innerHTML = `
    <div class="elsa-svc-grid">
      ${ELSA_SERVICES.map(svc => `
        <div class="elsa-svc-card-info">
          <div class="elsa-svc-name">${escapeHtml(svc.name)}</div>
          <div class="elsa-svc-desc">${escapeHtml(svc.desc)}</div>
        </div>`).join('')}
    </div>`;

  document.getElementById('elsa-vocab').innerHTML = ELSA_VOCAB.map(group => `
    <div class="elsa-vocab-group">
      <div class="elsa-vocab-title">${escapeHtml(group.cat)}</div>
      <div class="elsa-vocab-grid">
        ${group.words.map(item => `
          <div class="elsa-vocab-item-info">
            <div class="elsa-vocab-word">${escapeHtml(item.w)}</div>
            <div class="elsa-vocab-meaning">${escapeHtml(item.m)}</div>
          </div>`).join('')}
      </div>
    </div>`).join('');
}

function setupCourseEvents() {
  document.getElementById('sections-list').addEventListener('click', e => {
    const badge = e.target.closest('.u-badge[data-num]');
    if (badge) {
      e.stopPropagation();
      cycleUnderstanding(parseInt(badge.dataset.num), parseInt(badge.dataset.uidx));
      return;
    }
    const section = e.target.closest('.section-item[data-num]');
    if (section) { toggleSection(parseInt(section.dataset.num)); return; }
    const pt = e.target.closest('.section-item[data-pt]');
    if (pt) togglePracticeTest(parseInt(pt.dataset.pt));
  });
}

function toggleSection(num) {
  const secs = load(KEY.sections) || {};
  const key  = 's' + num;
  const data = secs[key] || {};
  const done = !data.done;
  secs[key]  = { ...data, done, date: done ? todayStr() : null };
  save(KEY.sections, secs);
  showToast(done ? `✅ Section ${num} done!` : `↩️ Section ${num} unmarked`);
  renderProgress();
}

function cycleUnderstanding(num, uIdx) {
  const nextU = UNDERSTANDING[(uIdx + 1) % UNDERSTANDING.length];
  const secs  = load(KEY.sections) || {};
  secs['s' + num] = { ...(secs['s' + num] || {}), understanding: nextU.key };
  save(KEY.sections, secs);
  showToast('→ ' + nextU.label);
  renderProgress();
}

function togglePracticeTest(num) {
  const pt   = load(KEY.practiceTests) || {};
  const key  = 'pt' + num;
  const done = !(pt[key] || {}).done;
  pt[key] = { done, date: done ? todayStr() : null };
  save(KEY.practiceTests, pt);
  showToast(done ? `✅ Practice Test ${num} done!` : `↩️ Practice Test ${num} unmarked`);
  renderProgress();
}

// ── Render: Daily (Today tab) ────────────────────────────────────────────────

function renderDaily() {
  const today    = todayStr();
  const settings = load(KEY.settings) || {};
  const daily    = load(KEY.daily) || {};
  const sections = load(KEY.sections) || {};

  document.getElementById('today-date').textContent = formatDateTH(today);

  const streak = calcStreak(daily, today);
  document.getElementById('stat-streak').textContent = streak;

  const countdownEl    = document.getElementById('stat-countdown');
  const countdownLabel = document.getElementById('stat-countdown-label');
  if (settings.examDate) {
    const days = daysUntil(settings.examDate);
    countdownEl.textContent = days >= 0 ? days : 'สอบไปแล้ว';
    countdownLabel.textContent = days >= 0 ? `วันถึง ${formatDateTH(settings.examDate)}` : 'อดีต';
  } else {
    countdownEl.textContent = '—';
    countdownLabel.textContent = 'ตั้งวันสอบใน Settings';
  }

  const courseDone = Object.values(sections).filter(s => s.done).length;
  const coursePct  = Math.round((courseDone / SECTIONS.length) * 100);
  document.getElementById('stat-course-pct').textContent = coursePct + '%';

  const week = currentWeekNumber(settings.startDate);
  document.getElementById('stat-week').textContent = 'W' + week;
  document.getElementById('stat-week-label').textContent =
    settings.startDate ? `จาก ${formatDateTH(settings.startDate)}` : 'ตั้ง start date ใน Settings';

  const todayTasks = daily[today] || {};
  document.getElementById('daily-checklist').innerHTML = DAILY_TASKS.map(task => {
    const done = !!todayTasks[task.key];
    return `
      <div class="checklist-item ${done ? 'done' : ''}" data-task="${task.key}">
        <div class="checklist-check">${done ? '✓' : ''}</div>
        <div class="checklist-icon">${task.icon}</div>
        <div class="checklist-body">
          <div class="checklist-label">${escapeHtml(task.label)}</div>
          <div class="checklist-desc">${escapeHtml(task.desc)}</div>
        </div>
      </div>`;
  }).join('');

  const focusWeek = WEEKLY_PLAN.find(w => w.week === week) || WEEKLY_PLAN[0];
  document.getElementById('week-focus').innerHTML = `
    <div class="focus-card">
      <div class="focus-week">Week ${focusWeek.week} — ${escapeHtml(focusWeek.title)}</div>
      <div class="focus-row"><span class="focus-tag">AWS</span> ${escapeHtml(focusWeek.aws)}</div>
      <div class="focus-row"><span class="focus-tag focus-elsa">ELSA</span> ${escapeHtml(focusWeek.elsa)}</div>
      <div class="focus-row"><span class="focus-tag focus-hands">Hands-on</span> ${escapeHtml(focusWeek.hands)}</div>
    </div>`;
}

function setupDailyEvents() {
  document.getElementById('daily-checklist').addEventListener('click', e => {
    const item = e.target.closest('.checklist-item[data-task]');
    if (!item) return;
    toggleDailyTask(item.dataset.task);
  });
}

function toggleDailyTask(taskKey) {
  const today = todayStr();
  const daily = load(KEY.daily) || {};
  daily[today] ??= {};
  daily[today][taskKey] = !daily[today][taskKey];
  save(KEY.daily, daily);
  renderDaily();
}

function calcStreak(daily, today) {
  let streak = 0;
  let cursor = today;
  while (true) {
    const tasks = daily[cursor];
    if (!tasks || !Object.values(tasks).some(Boolean)) break;
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

// ── Render: Weekly Plan ──────────────────────────────────────────────────────

function renderWeeklyPlan() {
  const settings = load(KEY.settings) || {};
  const currentWeek = currentWeekNumber(settings.startDate);

  document.getElementById('weekly-plan').innerHTML = WEEKLY_PLAN.map(w => {
    const isCurrent = w.week === currentWeek;
    const isPast    = currentWeek && w.week < currentWeek;
    return `
      <div class="plan-week ${isCurrent ? 'current' : ''} ${isPast ? 'past' : ''}">
        <div class="plan-week-num">W${w.week}</div>
        <div class="plan-week-body">
          <div class="plan-week-title">
            <span class="plan-phase-tag phase-${w.phase}">Phase ${w.phase}</span>
            ${escapeHtml(w.title)}
          </div>
          <div class="plan-row"><span class="focus-tag">AWS</span> ${escapeHtml(w.aws)}</div>
          <div class="plan-row"><span class="focus-tag focus-elsa">ELSA</span> ${escapeHtml(w.elsa)}</div>
          <div class="plan-row"><span class="focus-tag focus-hands">Hands-on</span> ${escapeHtml(w.hands)}</div>
        </div>
      </div>`;
  }).join('');
}

// ── Render: Flashcards ───────────────────────────────────────────────────────

let flashState = { deck: 'all', queue: [], current: null, flipped: false };

function buildAllCards() {
  const aws = ELSA_SERVICES.map(s => ({
    id: 'aws:' + s.name, deck: 'aws', front: s.name, back: s.desc,
  }));
  const vocab = ELSA_VOCAB.flatMap(g =>
    g.words.map(w => ({
      id: 'vocab:' + g.cat + ':' + w.w, deck: 'vocab',
      front: w.w, back: w.m, sub: g.cat,
    }))
  );
  return [...aws, ...vocab];
}

function getFlashProgress() {
  return load(KEY.flashcards) || {};
}

function isCardDue(card, progress) {
  const p = progress[card.id];
  if (!p) return true;
  const interval = LEITNER_INTERVAL_DAYS[Math.min(p.box, 5)] ?? 0;
  if (p.box >= 5) return false;
  return daysSince(p.lastReview) >= interval;
}

function buildQueue(deck) {
  const all = buildAllCards();
  const progress = getFlashProgress();
  let pool = all;
  if (deck === 'aws')   pool = all.filter(c => c.deck === 'aws');
  if (deck === 'vocab') pool = all.filter(c => c.deck === 'vocab');
  if (deck === 'due')   pool = all.filter(c => isCardDue(c, progress));
  return shuffle(pool);
}

function renderFlashcards() {
  const all = buildAllCards();
  const progress = getFlashProgress();
  const dueCount      = all.filter(c => isCardDue(c, progress)).length;
  const masteredCount = all.filter(c => (progress[c.id]?.box ?? 0) >= 5).length;

  document.getElementById('flash-total').textContent    = all.length;
  document.getElementById('flash-due').textContent      = dueCount;
  document.getElementById('flash-mastered').textContent = masteredCount;

  document.querySelectorAll('[data-flash-deck]').forEach(b =>
    b.classList.toggle('active', b.dataset.flashDeck === flashState.deck));

  if (!flashState.queue.length) flashState.queue = buildQueue(flashState.deck);
  flashState.current = flashState.queue[0] || null;
  flashState.flipped = false;
  renderFlashCardArea();
}

function renderFlashCardArea() {
  const area = document.getElementById('flash-area');
  const card = flashState.current;

  if (!card) {
    area.innerHTML = `
      <div class="flash-empty">
        <div style="font-size:48px;margin-bottom:8px">🎉</div>
        <div>ไม่มีการ์ดให้ทบทวน · กลับมาใหม่พรุ่งนี้!</div>
      </div>`;
    return;
  }

  const progress = getFlashProgress();
  const box = progress[card.id]?.box ?? 0;
  const remaining = flashState.queue.length;

  area.innerHTML = `
    <div class="flash-meta">
      <span>Box ${box} / 5</span>
      <span>เหลือใน queue: ${remaining}</span>
    </div>
    <div class="flashcard ${flashState.flipped ? 'flipped' : ''}" id="flashcard-flip">
      <div class="flashcard-inner">
        <div class="flashcard-face flashcard-front">
          <div class="flashcard-deck-tag">${card.deck === 'aws' ? '☁️ AWS Service' : '📚 ' + (card.sub || 'Vocab')}</div>
          <div class="flashcard-text">${escapeHtml(card.front)}</div>
          <div class="flashcard-hint">กดเพื่อเปิด</div>
        </div>
        <div class="flashcard-face flashcard-back">
          <div class="flashcard-text-back">${escapeHtml(card.back)}</div>
        </div>
      </div>
    </div>
    <div class="flash-actions ${flashState.flipped ? '' : 'hidden'}">
      <button class="btn-flash btn-flash-no"  data-flash-result="0">❌ ไม่รู้</button>
      <button class="btn-flash btn-flash-ok"  data-flash-result="1">✅ รู้</button>
    </div>
    ${flashState.flipped ? '' : '<div class="flash-tap-hint">tap card → เปิด</div>'}
  `;
}

function setupFlashcardEvents() {
  document.querySelectorAll('[data-flash-deck]').forEach(btn =>
    btn.addEventListener('click', () => {
      flashState.deck = btn.dataset.flashDeck;
      flashState.queue = [];
      renderFlashcards();
    }));

  document.getElementById('flash-area').addEventListener('click', e => {
    const flipEl = e.target.closest('#flashcard-flip');
    if (flipEl && !flashState.flipped) {
      flashState.flipped = true;
      renderFlashCardArea();
      return;
    }
    const ans = e.target.closest('[data-flash-result]');
    if (ans) {
      reviewCard(parseInt(ans.dataset.flashResult));
    }
  });
}

function reviewCard(known) {
  const card = flashState.current;
  if (!card) return;
  const progress = getFlashProgress();
  const cur = progress[card.id]?.box ?? 0;
  const nextBox = known ? Math.min(cur + 1, 5) : 1;
  progress[card.id] = { box: nextBox, lastReview: todayStr() };
  save(KEY.flashcards, progress);

  if (known) {
    showToast(nextBox >= 5 ? '🏆 Mastered!' : `✅ Box ${nextBox}`);
    if (!flashState.todayCount) flashState.todayCount = 0;
    flashState.todayCount++;
    if (flashState.todayCount >= 10 && !flashState.toastedTen) {
      flashState.toastedTen = true;
      showToast('🔥 ครบ 10 cards วันนี้แล้ว!');
    }
  } else {
    showToast('↩️ กลับ Box 1');
  }

  flashState.queue.shift();
  flashState.current = flashState.queue[0] || null;
  flashState.flipped = false;

  renderFlashCardArea();
  renderFlashcards();
}

// ── Export / Import ───────────────────────────────────────────────────────────

function setupExportImport() {
  document.getElementById('btn-export').addEventListener('click', () => {
    const data = {
      sections:      load(KEY.sections),
      settings:      load(KEY.settings),
      practiceTests: load(KEY.practiceTests),
      daily:         load(KEY.daily),
      flashcards:    load(KEY.flashcards),
      exportedAt:    new Date().toISOString(),
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
        if (data.sections)      save(KEY.sections,      data.sections);
        if (data.settings)      save(KEY.settings,      data.settings);
        if (data.practiceTests) save(KEY.practiceTests, data.practiceTests);
        if (data.daily)         save(KEY.daily,         data.daily);
        if (data.flashcards)    save(KEY.flashcards,    data.flashcards);
        showToast('⬆ Imported!');
        location.reload();
      } catch { showToast('❌ Invalid file'); }
    };
    reader.readAsText(file);
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function formatDateTH(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('th-TH', {
    day: 'numeric', month: 'short', year: '2-digit'
  });
}

function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function daysSince(dateStr) {
  if (!dateStr) return Infinity;
  const a = new Date(dateStr + 'T00:00:00').getTime();
  const b = new Date(todayStr() + 'T00:00:00').getTime();
  return Math.floor((b - a) / 86_400_000);
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const a = new Date(dateStr + 'T00:00:00').getTime();
  const b = new Date(todayStr() + 'T00:00:00').getTime();
  return Math.ceil((a - b) / 86_400_000);
}

function currentWeekNumber(startDateStr) {
  if (!startDateStr) return 1;
  const days = -daysUntil(startDateStr);
  return Math.max(1, Math.min(11, Math.floor(days / 7) + 1));
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let toastTimer;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 2500);
}
