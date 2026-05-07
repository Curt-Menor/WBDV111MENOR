
const LS_KEYS = {
  users: "borgz_users",
  tables: "borgz_tables",
  reservations: "borgz_reservations",
  announcements: "borgz_announcements",
  settings: "borgz_settings",
  session: "borgz_session"
};

const demoUsers = [
  { id: "u-guest", name: "Guest User", email: "guest@borgz.local", password: "guest123", role: "user", hours: 4, points: 6, visits: 1, phone: "0917 111 1111" },
  { id: "u-regular", name: "Maria Santos", email: "maria@borgz.local", password: "user123", role: "user", hours: 24, points: 30, visits: 6, phone: "0918 222 2222" },
  { id: "u-admin", name: "Staff Admin", email: "admin@borgz.local", password: "admin123", role: "admin", hours: 0, points: 0, visits: 0, phone: "0919 333 3333" },
  { id: "u-super", name: "Super Admin", email: "super@borgz.local", password: "super123", role: "superadmin", hours: 0, points: 0, visits: 0, phone: "0920 444 4444" }
];

const demoTables = [
  { id: "T1", name: "MAXIMA 6", type: "Standard", capacity: 4, status: "Available" },
  { id: "T2", name: "MAXIMA 7", type: "Standard", capacity: 4, status: "Available" },
  { id: "T3", name: "MAXIMA 8", type: "Standard", capacity: 4, status: "Reserved" },
  { id: "T4", name: "RASSON", type: "Professional", capacity: 4, status: "Available" },

];

const demoReservations = [
  { id: "B-1002", userId: "u-guest", userName: "Guest User", date: todayISO(), time: "20:00", duration: 1, tableId: "T2", tableName: "Table 2", type: "Standard", status: "Pending", total: 180, pointsEarned: 1 }
];

const demoAnnouncements = [
  { id: "A1", title: "Weekend Tournament", body: "Join our 9-ball tournament this Saturday. Registration closes at 6 PM Friday.", audience: "All", date: todayISO() },
  { id: "A2", title: "Regular Customer Reward", body: "Earn bonus points when you complete 5+ bookings in a month.", audience: "Members", date: todayISO() },
  { id: "A3", title: "New Tables Added", body: "Two new professional tables are now available for booking.", audience: "All", date: todayISO() }
];

const demoSettings = {
  hourlyRates: { Standard: 180, Professional: 200, VIP: 260 },
  rewardThresholdHours: 20,
  rewardThresholdVisits: 5,
  rewardDiscount: 0.10,
  openTime: "10:00",
  closeTime: "23:00"
};

function todayISO() {
  const d = new Date();
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 10);
}

function uid(prefix = "ID") {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function getJSON(key, fallback) {
  const raw = localStorage.getItem(key);
  if (!raw) return structuredClone(fallback);
  try { return JSON.parse(raw); } catch { return structuredClone(fallback); }
}
function setJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function removeExtraTables() {
  const allowedTableIds = new Set(["T1", "T2", "T3", "T4"]);
  const cleanTables = tables().filter(t => allowedTableIds.has(t.id));
  const cleanReservations = reservations().filter(r => allowedTableIds.has(r.tableId));
  setJSON(LS_KEYS.tables, cleanTables);
  setJSON(LS_KEYS.reservations, cleanReservations);
}

function seed() {
  if (!localStorage.getItem(LS_KEYS.users)) setJSON(LS_KEYS.users, demoUsers);
  if (!localStorage.getItem(LS_KEYS.tables)) setJSON(LS_KEYS.tables, demoTables);
  if (!localStorage.getItem(LS_KEYS.reservations)) setJSON(LS_KEYS.reservations, demoReservations);
  if (!localStorage.getItem(LS_KEYS.announcements)) setJSON(LS_KEYS.announcements, demoAnnouncements);
  if (!localStorage.getItem(LS_KEYS.settings)) setJSON(LS_KEYS.settings, demoSettings);
  removeExtraTables();
}

function users() { return getJSON(LS_KEYS.users, demoUsers); }
function tables() { return getJSON(LS_KEYS.tables, demoTables); }
function reservations() { return getJSON(LS_KEYS.reservations, demoReservations); }
function announcements() { return getJSON(LS_KEYS.announcements, demoAnnouncements); }
function settings() { return getJSON(LS_KEYS.settings, demoSettings); }

function currentUser() {
  const session = getJSON(LS_KEYS.session, null);
  if (!session) return null;
  return users().find(u => u.id === session.userId) || null;
}

function saveSession(user) {
  setJSON(LS_KEYS.session, { userId: user.id });
}

function logout() {
  localStorage.removeItem(LS_KEYS.session);
  window.location.href = "index.html";
}

function login(email, password) {
  const user = users().find(u => u.email.toLowerCase() === String(email).trim().toLowerCase() && u.password === password);
  if (!user) return { ok: false, message: "Invalid demo account credentials." };
  saveSession(user);
  return { ok: true, user };
}

function rolePage(role) {
  if (role === "user") return "user.html";
  if (role === "admin") return "admin.html";
  if (role === "superadmin") return "superadmin.html";
  return "general.html";
}

function money(n) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(Number(n || 0));
}

function calcRewardStatus(user) {
  const s = settings();
  const hours = Number(user?.hours || 0);
  const visits = Number(user?.visits || 0);
  const points = Number(user?.points || 0);
  if (hours >= s.rewardThresholdHours || visits >= s.rewardThresholdVisits || points >= 20) return "Regular Customer";
  return "Guest";
}

function reservationStatusClass(status) {
  const s = String(status || "").toLowerCase();
  if (s.includes("confirm")) return "booked";
  if (s.includes("pend")) return "pending";
  if (s.includes("complete")) return "completed";
  if (s.includes("cancel")) return "cancelled";
  return "available";
}

function parseTimeToMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function overlaps(aStart, aDuration, bStart, bDuration) {
  const a1 = parseTimeToMinutes(aStart);
  const a2 = a1 + Number(aDuration) * 60;
  const b1 = parseTimeToMinutes(bStart);
  const b2 = b1 + Number(bDuration) * 60;
  return a1 < b2 && b1 < a2;
}

function tableIsFree(tableId, date, time, duration) {
  return !reservations().some(r =>
    r.tableId === tableId &&
    r.date === date &&
    ["Pending", "Confirmed"].includes(r.status) &&
    overlaps(r.time, r.duration, time, duration)
  );
}

function availableTablesFor(type, date, time, duration) {
  return tables().filter(t => (!type || t.type === type) && tableIsFree(t.id, date, time, duration));
}

function computeStats(role) {
  const u = currentUser();
  const rs = reservations();
  const ts = tables();
  const ann = announcements();
  const today = todayISO();
  const todays = rs.filter(r => r.date === today);

  if (role === "user") {
    const my = u ? rs.filter(r => r.userId === u.id) : [];
    return [
      { label: "Current Reservations", value: my.filter(r => ["Pending", "Confirmed"].includes(r.status)).length, hint: "Active bookings" },
      { label: "Hours Played", value: u ? (u.hours || 0) : 0, hint: "Lifetime usage" },
      { label: "Reward Points", value: u ? (u.points || 0) : 0, hint: calcRewardStatus(u || {}) },
      { label: "Upcoming Bookings", value: my.filter(r => new Date(r.date) >= new Date(today) && ["Pending", "Confirmed"].includes(r.status)).length, hint: "Future schedules" },
    ];
  }
  if (role === "admin") {
    return [
      { label: "Today's Reservations", value: todays.length, hint: "All bookings today" },
      { label: "Active Tables", value: ts.filter(t => ["Occupied", "Reserved"].includes(t.status)).length, hint: "Currently in use" },
      { label: "Announcements", value: ann.length, hint: "Live notices" },
      { label: "Revenue Today", value: money(todays.reduce((a, r) => a + Number(r.total || 0), 0)), hint: "Estimated" },
    ];
  }
  if (role === "superadmin") {
    return [
      { label: "Total Users", value: users().length, hint: "All demo accounts" },
      { label: "Staff Accounts", value: users().filter(u => u.role === "admin" || u.role === "superadmin").length, hint: "Role control" },
      { label: "Tables", value: ts.length, hint: "Inventory" },
      { label: "Open Reservations", value: rs.filter(r => ["Pending", "Confirmed"].includes(r.status)).length, hint: "Need action" },
    ];
  }
  return [
    { label: "Tables", value: ts.length, hint: "Billiard lanes" },
    { label: "Reservations", value: rs.length, hint: "Demo bookings" },
    { label: "Members", value: users().filter(u => u.role === "user").length, hint: "Customer accounts" },
    { label: "Announcements", value: ann.length, hint: "Latest updates" },
  ];
}

function statHTML(stat) {
  return `<div class="stat"><div class="label">${stat.label}</div><div class="value">${stat.value}</div><div class="hint">${stat.hint}</div></div>`;
}

function setText(id, txt) {
  const el = document.getElementById(id);
  if (el) el.textContent = txt;
}

function bindLogout() {
  document.querySelectorAll("[data-action='logout']").forEach(btn => btn.addEventListener("click", logout));
}

function requireRole(roles) {
  const u = currentUser();
  if (!u) {
    window.location.href = "index.html";
    return null;
  }
  if (!roles.includes(u.role)) {
    window.location.href = rolePage(u.role);
    return null;
  }
  return u;
}

function renderIndex() {
  seed();
  const current = currentUser();
  const status = document.getElementById("demoStatus");
  if (status) {
    status.innerHTML = current
      ? `<span class="badge good">Signed in as ${current.name}</span> <span class="badge">${current.role}</span>`
      : `<span class="badge warn">Not signed in</span> <span class="badge">Use any demo account below</span>`;
  }

  const quick = document.getElementById("indexQuickLink");
  if (quick && current) {
    quick.innerHTML = `<a class="primary-btn" href="${rolePage(current.role)}">Continue to ${current.role} dashboard</a>`;
  }

  document.querySelectorAll("[data-login]").forEach(btn => {
    btn.addEventListener("click", () => {
      const result = login(btn.dataset.email, btn.dataset.password);
      const msg = document.getElementById("loginMsg");
      if (!result.ok) {
        if (msg) msg.textContent = result.message;
        return;
      }
      window.location.href = rolePage(result.user.role);
    });
  });

  const form = document.getElementById("loginForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const result = login(email, password);
      const msg = document.getElementById("loginMsg");
      if (!result.ok) {
        if (msg) msg.textContent = result.message;
        return;
      }
      window.location.href = rolePage(result.user.role);
    });
  }
}

function renderGeneral() {
  seed();
  document.getElementById("stats").innerHTML = computeStats("general").map(statHTML).join("");

  const tableType = document.getElementById("generalTableType");
  const available = document.getElementById("generalAvailable");
  if (tableType && available) {
    const render = () => {
      const type = tableType.value;
      const list = tables().filter(t => !type || t.type === type);
      available.innerHTML = list.map(t => `
        <div class="list-item">
          <div>
            <strong>${t.name}</strong>
            <div class="meta">${t.type} • ${t.capacity} players</div>
          </div>
          <span class="pill ${t.status.toLowerCase()} status-pill">${t.status}</span>
        </div>
      `).join("");
    };
    tableType.addEventListener("change", render);
    render();
  }

  const ann = announcements().slice(0, 3);
  const mount = document.getElementById("generalAnnouncements");
  if (mount) {
    mount.innerHTML = ann.map(a => `
      <div class="list-item">
        <div>
          <strong>${a.title}</strong>
          <div class="meta">${a.body}</div>
        </div>
        <span class="badge">${a.audience}</span>
      </div>
    `).join("");
  }

  const featureMount = document.getElementById("generalFeatures");
  if (featureMount) {
    featureMount.innerHTML = [
      { icon: "🕒", title: "Time Management", text: "Track schedules, prevent overlapping reservations, and keep the hall running smoothly." },
      { icon: "🏆", title: "Rewards System", text: "Regular customers earn points and unlock member benefits." },
      { icon: "🛠️", title: "Admin Control", text: "Staff can monitor tables, update statuses, and post notices." }
    ].map(f => `
      <div class="feature">
        <div class="icon">${f.icon}</div>
        <h3>${f.title}</h3>
        <p>${f.text}</p>
      </div>
    `).join("");
  }
}

function renderUser() {
  seed();
  const u = requireRole(["user"]);
  if (!u) return;

  setText("welcomeName", u.name);
  setText("memberStatus", calcRewardStatus(u));
  document.getElementById("userStats").innerHTML = computeStats("user").map(statHTML).join("");

  const rateLabel = document.getElementById("rateLabel");
  if (rateLabel) {
    const s = settings();
    rateLabel.textContent = `Rates: ${money(s.hourlyRates.Standard)} Standard • ${money(s.hourlyRates.Professional)} Professional • ${money(s.hourlyRates.VIP)} VIP`;
  }

  const dateInput = document.getElementById("bookDate");
  const timeInput = document.getElementById("bookTime");
  const durationInput = document.getElementById("duration");
  const typeInput = document.getElementById("tableType");
  const tableInput = document.getElementById("tableId");
  if (dateInput) dateInput.min = todayISO();

  function updateTables() {
    const date = dateInput.value || todayISO();
    const time = timeInput.value || "10:00";
    const duration = Number(durationInput.value || 1);
    const type = typeInput.value;
    const list = availableTablesFor(type, date, time, duration);
    tableInput.innerHTML = list.map(t => `<option value="${t.id}">${t.name} — ${t.type}</option>`).join("") || `<option value="">No available tables</option>`;

    const board = document.getElementById("tableBoard");
    if (board) {
      board.innerHTML = tables().filter(t => !type || t.type === type).map(t => {
        const free = tableIsFree(t.id, date, time, duration);
        const cls = free ? "available" : "booked";
        const active = tableInput.value === t.id ? "active" : "";
        return `
          <div class="table-card ${active}">
            <div>
              <strong>${t.name}</strong>
              <div class="meta">${t.type} • ${t.capacity} pax</div>
            </div>
            <span class="pill ${cls} status-pill">${free ? "Available" : "Booked"}</span>
          </div>
        `;
      }).join("");
    }
  }

  [dateInput, timeInput, durationInput, typeInput].forEach(el => el && el.addEventListener("change", updateTables));
  updateTables();

  const form = document.getElementById("bookingForm");
  const msg = document.getElementById("bookingMsg");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const date = dateInput.value;
      const time = timeInput.value;
      const duration = Number(durationInput.value);
      const tableId = tableInput.value;

      if (!date || !time || !tableId) {
        msg.textContent = "Please choose a date, time, and available table.";
        return;
      }
      if (!tableIsFree(tableId, date, time, duration)) {
        msg.textContent = "That table is already booked at this time.";
        return;
      }

      const table = tables().find(t => t.id === tableId);
      const rate = settings().hourlyRates[table.type] || settings().hourlyRates.Standard;
      const total = rate * duration;
      const pointGain = Math.max(1, duration * 2);

      const rs = reservations();
      const newRes = {
        id: uid("B"),
        userId: u.id,
        userName: u.name,
        date, time, duration,
        tableId: table.id,
        tableName: table.name,
        type: table.type,
        status: "Pending",
        total,
        pointsEarned: pointGain
      };
      rs.unshift(newRes);
      setJSON(LS_KEYS.reservations, rs);

      const us = users();
      const idx = us.findIndex(x => x.id === u.id);
      us[idx].hours = Number(us[idx].hours || 0) + duration;
      us[idx].points = Number(us[idx].points || 0) + pointGain;
      us[idx].visits = Number(us[idx].visits || 0) + 1;
      setJSON(LS_KEYS.users, us);

      msg.textContent = `Reservation created: ${newRes.id}.`;
      renderUser();
    });
  }

  const mine = reservations().filter(r => r.userId === u.id);
  const resList = document.getElementById("userReservations");
  if (resList) {
    resList.innerHTML = mine.map(r => `
      <div class="list-item">
        <div>
          <strong>${r.tableName} • ${r.date} • ${r.time}</strong>
          <div class="meta">${r.duration} hour(s) • ${money(r.total)} • ${r.type}</div>
        </div>
        <span class="pill ${reservationStatusClass(r.status)}">${r.status}</span>
      </div>
    `).join("") || `<div class="small">No reservations yet.</div>`;
  }

  const rewards = document.getElementById("rewardDetails");
  const s = settings();
  if (rewards) {
    rewards.innerHTML = `
      <div class="kpi"><span>Status</span><strong>${calcRewardStatus(u)}</strong></div>
      <div class="kpi"><span>Points</span><strong>${u.points || 0}</strong></div>
      <div class="kpi"><span>Hours Played</span><strong>${u.hours || 0}</strong></div>
      <div class="kpi"><span>Next Reward</span><strong>${Math.max(0, s.rewardThresholdHours - (u.hours || 0))} hours left</strong></div>
    `;
  }

  const tips = document.getElementById("rewardTips");
  if (tips) {
    tips.innerHTML = `
      <div class="list-item"><div><strong>10% discount</strong><div class="meta">At ${s.rewardThresholdHours}+ hours.</div></div><span class="badge good">Unlocked later</span></div>
      <div class="list-item"><div><strong>Priority booking</strong><div class="meta">For regular customers.</div></div><span class="badge">Member perk</span></div>
      <div class="list-item"><div><strong>Free add-on</strong><div class="meta">Optional cue rental on promos.</div></div><span class="badge warn">Promo</span></div>
    `;
  }

  const ann = document.getElementById("userAnnouncements");
  if (ann) {
    ann.innerHTML = announcements().slice(0, 3).map(a => `
      <div class="list-item">
        <div>
          <strong>${a.title}</strong>
          <div class="meta">${a.body}</div>
        </div>
        <span class="badge">${a.audience}</span>
      </div>
    `).join("");
  }
}

function renderAdmin() {
  seed();
  const u = requireRole(["admin", "superadmin"]);
  if (!u) return;

  setText("adminName", u.name);
  document.getElementById("adminStats").innerHTML = computeStats("admin").map(statHTML).join("");

  const list = document.getElementById("reservationTableBody");
  function drawReservations() {
    const rs = reservations();
    if (!list) return;
    list.innerHTML = rs.map(r => `
      <tr>
        <td>${r.id}</td>
        <td>${r.userName}</td>
        <td>${r.date}</td>
        <td>${r.time}</td>
        <td>${r.tableName}</td>
        <td>${money(r.total)}</td>
        <td><span class="pill ${reservationStatusClass(r.status)}">${r.status}</span></td>
        <td>
          <select data-reservation-status="${r.id}">
            <option ${r.status==="Pending"?"selected":""}>Pending</option>
            <option ${r.status==="Confirmed"?"selected":""}>Confirmed</option>
            <option ${r.status==="Completed"?"selected":""}>Completed</option>
            <option ${r.status==="Cancelled"?"selected":""}>Cancelled</option>
          </select>
        </td>
      </tr>
    `).join("");

    list.querySelectorAll("[data-reservation-status]").forEach(sel => {
      sel.addEventListener("change", () => {
        const rs2 = reservations();
        const idx = rs2.findIndex(x => x.id === sel.dataset.reservationStatus);
        rs2[idx].status = sel.value;
        setJSON(LS_KEYS.reservations, rs2);
        drawReservations();
        drawTables();
        document.getElementById("adminStats").innerHTML = computeStats("admin").map(statHTML).join("");
      });
    });
  }

  function drawTables() {
    const mount = document.getElementById("adminTables");
    if (!mount) return;
    mount.innerHTML = tables().map(t => `
      <div class="table-card">
        <div>
          <strong>${t.name}</strong>
          <div class="meta">${t.type} • ${t.capacity} players</div>
        </div>
        <span class="pill ${t.status.toLowerCase()} status-pill">${t.status}</span>
        <select data-table-status="${t.id}">
          <option ${t.status==="Available"?"selected":""}>Available</option>
          <option ${t.status==="Reserved"?"selected":""}>Reserved</option>
          <option ${t.status==="Occupied"?"selected":""}>Occupied</option>
          <option ${t.status==="Maintenance"?"selected":""}>Maintenance</option>
        </select>
      </div>
    `).join("");

    mount.querySelectorAll("[data-table-status]").forEach(sel => {
      sel.addEventListener("change", () => {
        const ts = tables();
        const idx = ts.findIndex(x => x.id === sel.dataset.tableStatus);
        ts[idx].status = sel.value;
        setJSON(LS_KEYS.tables, ts);
        drawTables();
        document.getElementById("adminStats").innerHTML = computeStats("admin").map(statHTML).join("");
      });
    });
  }

  drawReservations();
  drawTables();

  const annList = document.getElementById("adminAnnouncements");
  function drawAnnouncements() {
    if (!annList) return;
    annList.innerHTML = announcements().map(a => `
      <div class="list-item">
        <div>
          <strong>${a.title}</strong>
          <div class="meta">${a.body}</div>
        </div>
        <span class="badge">${a.audience}</span>
      </div>
    `).join("");
  }
  drawAnnouncements();

  const form = document.getElementById("announcementForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = document.getElementById("annTitle").value.trim();
      const body = document.getElementById("annBody").value.trim();
      const audience = document.getElementById("annAudience").value;
      const ann = announcements();
      ann.unshift({ id: uid("A"), title, body, audience, date: todayISO() });
      setJSON(LS_KEYS.announcements, ann);
      form.reset();
      drawAnnouncements();
      document.getElementById("adminStats").innerHTML = computeStats("admin").map(statHTML).join("");
    });
  }
}

function renderSuperAdmin() {
  seed();
  const u = requireRole(["superadmin"]);
  if (!u) return;

  setText("superName", u.name);
  document.getElementById("superStats").innerHTML = computeStats("superadmin").map(statHTML).join("");

  const userList = document.getElementById("userAdminList");
  function drawUsers() {
    const us = users();
    if (!userList) return;
    userList.innerHTML = us.map(user => `
      <div class="list-item">
        <div>
          <strong>${user.name}</strong>
          <div class="meta">${user.email} • ${user.role} • ${user.phone || "No phone"}</div>
        </div>
        <div class="actions">
          <select data-user-role="${user.id}">
            <option value="user" ${user.role==="user"?"selected":""}>User</option>
            <option value="admin" ${user.role==="admin"?"selected":""}>Admin</option>
            <option value="superadmin" ${user.role==="superadmin"?"selected":""}>Super Admin</option>
          </select>
        </div>
      </div>
    `).join("");

    userList.querySelectorAll("[data-user-role]").forEach(sel => {
      sel.addEventListener("change", () => {
        const us2 = users();
        const idx = us2.findIndex(x => x.id === sel.dataset.userRole);
        us2[idx].role = sel.value;
        setJSON(LS_KEYS.users, us2);
        drawUsers();
        document.getElementById("superStats").innerHTML = computeStats("superadmin").map(statHTML).join("");
      });
    });
  }
  drawUsers();

  const settingsBox = document.getElementById("systemSettings");
  function drawSettingsBox(s) {
    if (!settingsBox) return;
    settingsBox.innerHTML = `
      <div class="kpi"><span>Standard Rate</span><strong>${money(s.hourlyRates.Standard)}</strong></div>
      <div class="kpi"><span>Professional Rate</span><strong>${money(s.hourlyRates.Professional)}</strong></div>
      <div class="kpi"><span>VIP Rate</span><strong>${money(s.hourlyRates.VIP)}</strong></div>
      <div class="kpi"><span>Reward Threshold</span><strong>${s.rewardThresholdHours} hours</strong></div>
    `;
  }
  const s = settings();
  drawSettingsBox(s);

  const settingsForm = document.getElementById("settingsForm");
  if (settingsForm) {
    settingsForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const current = settings();
      current.hourlyRates.Standard = Number(document.getElementById("rateStandard").value);
      current.hourlyRates.Professional = Number(document.getElementById("rateProfessional").value);
      current.hourlyRates.VIP = Number(document.getElementById("rateVIP").value);
      current.rewardThresholdHours = Number(document.getElementById("rewardHours").value);
      current.rewardThresholdVisits = Number(document.getElementById("rewardVisits").value);
      setJSON(LS_KEYS.settings, current);
      drawSettingsBox(current);
      document.getElementById("superStats").innerHTML = computeStats("superadmin").map(statHTML).join("");
    });
  }

  document.getElementById("rateStandard").value = s.hourlyRates.Standard;
  document.getElementById("rateProfessional").value = s.hourlyRates.Professional;
  document.getElementById("rateVIP").value = s.hourlyRates.VIP;
  document.getElementById("rewardHours").value = s.rewardThresholdHours;
  document.getElementById("rewardVisits").value = s.rewardThresholdVisits;

  const resetBtn = document.getElementById("resetDemo");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      localStorage.removeItem(LS_KEYS.users);
      localStorage.removeItem(LS_KEYS.tables);
      localStorage.removeItem(LS_KEYS.reservations);
      localStorage.removeItem(LS_KEYS.announcements);
      localStorage.removeItem(LS_KEYS.settings);
      seed();
      drawUsers();
      document.getElementById("superStats").innerHTML = computeStats("superadmin").map(statHTML).join("");
      const fresh = settings();
      document.getElementById("rateStandard").value = fresh.hourlyRates.Standard;
      document.getElementById("rateProfessional").value = fresh.hourlyRates.Professional;
      document.getElementById("rateVIP").value = fresh.hourlyRates.VIP;
      document.getElementById("rewardHours").value = fresh.rewardThresholdHours;
      document.getElementById("rewardVisits").value = fresh.rewardThresholdVisits;
      drawSettingsBox(fresh);
    });
  }
}

function renderAbout() {
  seed();
  const box = document.getElementById("aboutStats");
  if (box) {
    box.innerHTML = computeStats("general").map(statHTML).join("");
  }
}

function init() {
  seed();
  bindLogout();

  const page = document.body.dataset.page;
  if (page === "index") renderIndex();
  if (page === "general") renderGeneral();
  if (page === "user") renderUser();
  if (page === "admin") renderAdmin();
  if (page === "superadmin") renderSuperAdmin();
  if (page === "about") renderAbout();

  document.querySelectorAll("[data-go]").forEach(btn => {
    btn.addEventListener("click", () => window.location.href = btn.dataset.go);
  });
}

document.addEventListener("DOMContentLoaded", init);
