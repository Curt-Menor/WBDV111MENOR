const LS_KEYS = {
  users: "borgz_users",
  tables: "borgz_tables",
  reservations: "borgz_reservations",
  announcements: "borgz_announcements",
  settings: "borgz_settings",
  session: "borgz_session",
  flash: "borgz_flash"
};

const demoUsers = [
  { id: "u-guest", name: "Guest User", email: "guest@borgz.local", password: "guest123", role: "user", hours: 4, points: 6, visits: 1, phone: "0917 111 1111" },
  { id: "u-regular", name: "Maria Santos", email: "maria@borgz.local", password: "user123", role: "user", hours: 24, points: 30, visits: 6, phone: "0918 222 2222" },
  { id: "u-admin", name: "Staff Admin", email: "admin@borgz.local", password: "admin123", role: "admin", hours: 0, points: 0, visits: 0, phone: "0919 333 3333" },
  { id: "u-super", name: "Super Admin", email: "super@borgz.local", password: "super123", role: "superadmin", hours: 0, points: 0, visits: 0, phone: "0920 444 4444" }
];

const demoTables = [
  { id: "T1", name: "Rasson", type: "VIP", price: 200, capacity: 4, status: "Available" },
  { id: "T2", name: "Maxima 8", type: "Professional", price: 180, capacity: 4, status: "Available" },
  { id: "T3", name: "Maxima 7", type: "Standard", price: 150, capacity: 4, status: "Available" },
  { id: "T4", name: "Maxima 6", type: "Standard", price: 120, capacity: 4, status: "Available" }
];

const demoReservations = [
  { id: "B-1001", userId: "u-regular", userName: "Maria Santos", date: todayISO(), time: "18:00", duration: 2, tableId: "T1", tableName: "Rasson", type: "VIP", status: "Confirmed", total: 400, pointsEarned: 4, createdAt: todayISO() },
  { id: "B-1002", userId: "u-guest", userName: "Guest User", date: todayISO(), time: "20:00", duration: 1, tableId: "T3", tableName: "Maxima 7", type: "Standard", status: "Pending", total: 150, pointsEarned: 2, createdAt: todayISO() },
  { id: "B-1003", userId: "u-regular", userName: "Maria Santos", date: todayISO(), time: "21:00", duration: 1, tableId: "T2", tableName: "Maxima 8", type: "Professional", status: "On Going", total: 180, pointsEarned: 2, createdAt: todayISO() }
];

const demoAnnouncements = [
  { id: "A1", title: "Weekend Tournament", body: "Join our 9-ball tournament this Saturday. Registration closes at 6 PM Friday.", audience: "All", date: todayISO() },
  { id: "A2", title: "Rewards for Regular Customers", body: "Frequent guests can unlock perks after repeated bookings and play hours.", audience: "Members", date: todayISO() },
  { id: "A3", title: "New Tables Available", body: "Our four current tables are now organized for easier booking.", audience: "All", date: todayISO() }
];

const demoSettings = {
  hourlyRates: { VIP: 200, Professional: 180, Standard: 150 },
  rewardThresholdVisits: 5,
  rewardThresholdHours: 20,
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
  try {
    return JSON.parse(raw);
  } catch {
    return structuredClone(fallback);
  }
}

function setJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function seed() {
  if (!localStorage.getItem(LS_KEYS.users)) setJSON(LS_KEYS.users, demoUsers);
  if (!localStorage.getItem(LS_KEYS.tables)) setJSON(LS_KEYS.tables, demoTables);
  if (!localStorage.getItem(LS_KEYS.reservations)) setJSON(LS_KEYS.reservations, demoReservations);
  if (!localStorage.getItem(LS_KEYS.announcements)) setJSON(LS_KEYS.announcements, demoAnnouncements);
  if (!localStorage.getItem(LS_KEYS.settings)) setJSON(LS_KEYS.settings, demoSettings);
}

function users() { return getJSON(LS_KEYS.users, demoUsers); }
function saveUsers(v) { setJSON(LS_KEYS.users, v); }

function tables() { return getJSON(LS_KEYS.tables, demoTables); }
function saveTables(v) { setJSON(LS_KEYS.tables, v); }

function reservations() { return getJSON(LS_KEYS.reservations, demoReservations); }
function saveReservations(v) { setJSON(LS_KEYS.reservations, v); }

function announcements() { return getJSON(LS_KEYS.announcements, demoAnnouncements); }
function saveAnnouncements(v) { setJSON(LS_KEYS.announcements, v); }

function settings() { return getJSON(LS_KEYS.settings, demoSettings); }
function saveSettings(v) { setJSON(LS_KEYS.settings, v); }

function currentUser() {
  const session = getJSON(LS_KEYS.session, null);
  if (!session) return null;
  return users().find(u => u.id === session.userId) || null;
}

function saveSession(user) {
  setJSON(LS_KEYS.session, { userId: user.id });
}

function clearSession() {
  localStorage.removeItem(LS_KEYS.session);
}

function logout() {
  clearSession();
  window.location.href = "index.html";
}

function login(email, password) {
  const user = users().find(u => u.email.toLowerCase() === String(email).trim().toLowerCase() && u.password === password);
  if (!user) return { ok: false, message: "Invalid email or password." };
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

function escapeHTML(str) {
  return String(str ?? "").replace(/[&<>"']/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[m]));
}

function calcMemberTier(user) {
  if (!user) return "Guest";
  const s = settings();
  if ((user.visits || 0) >= s.rewardThresholdVisits || (user.hours || 0) >= s.rewardThresholdHours || (user.points || 0) >= 20) return "Regular Customer";
  return "Guest";
}

function calcRewardStatus(user) {
  return calcMemberTier(user);
}

function reservationStatusClass(status) {
  const s = String(status || "").toLowerCase();
  if (s.includes("confirm")) return "booked";
  if (s.includes("ongo")) return "pending";
  if (s.includes("pend")) return "pending";
  if (s.includes("complete")) return "completed";
  if (s.includes("cancel")) return "cancelled";
  return "available";
}

function statusClass(status) {
  const s = String(status || "").toLowerCase();
  if (s.includes("confirm")) return "good";
  if (s.includes("ongo")) return "warn";
  if (s.includes("pend")) return "warn";
  if (s.includes("cancel")) return "danger";
  if (s.includes("avail")) return "good";
  return "";
}

function parseTimeToMinutes(time) {
  const [h, m] = String(time).split(":").map(Number);
  return (Number(h) * 60) + Number(m);
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
    ["Pending", "Confirmed", "On Going"].includes(r.status) &&
    overlaps(r.time, r.duration, time, duration)
  );
}

function availableTablesFor(type, date, time, duration) {
  return tables().filter(t => (!type || t.type === type) && tableIsFree(t.id, date, time, duration));
}

function activeReservationsForUser(userId) {
  return reservations().filter(r => r.userId === userId && ["Pending", "Confirmed", "On Going"].includes(r.status));
}

function futureReservationsForUser(userId) {
  const today = todayISO();
  return reservations().filter(r => r.userId === userId && new Date(r.date) >= new Date(today) && ["Pending", "Confirmed", "On Going"].includes(r.status));
}

function sumIncome(resList) {
  return resList.reduce((sum, r) => sum + Number(r.total || 0), 0);
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
      { label: "Current Reservations", value: my.filter(r => ["Pending", "Confirmed", "On Going"].includes(r.status)).length, hint: "Active bookings" },
      { label: "Hours Played", value: u ? (u.hours || 0) : 0, hint: "Lifetime usage" },
      { label: "Reward Points", value: u ? (u.points || 0) : 0, hint: calcRewardStatus(u || {}) },
      { label: "Upcoming Bookings", value: my.filter(r => new Date(r.date) >= new Date(today) && ["Pending", "Confirmed", "On Going"].includes(r.status)).length, hint: "Future schedules" },
    ];
  }

  if (role === "admin") {
    return [
      { label: "Today's Reservations", value: todays.length, hint: "All bookings today" },
      { label: "Active Tables", value: ts.filter(t => ["Occupied", "Reserved"].includes(t.status)).length, hint: "Currently in use" },
      { label: "Announcements", value: ann.length, hint: "Live notices" },
      { label: "Revenue Today", value: money(sumIncome(todays)), hint: "Estimated" },
    ];
  }

  if (role === "superadmin") {
    return [
      { label: "Income", value: money(sumIncome(rs.filter(r => ["Pending", "Confirmed", "On Going", "Completed"].includes(r.status)))), hint: "Estimated total" },
      { label: "Pending", value: rs.filter(r => r.status === "Pending").length, hint: "Needs action" },
      { label: "Confirmed", value: rs.filter(r => r.status === "Confirmed").length, hint: "Approved bookings" },
      { label: "On Going", value: rs.filter(r => r.status === "On Going").length, hint: "Currently active" },
      { label: "Users", value: users().length, hint: "Accounts" },
      { label: "Tables", value: ts.length, hint: "Business inventory" },
    ];
  }

  return [
    { label: "Tables", value: ts.length, hint: "Billiard tables" },
    { label: "Reservations", value: rs.length, hint: "Demo bookings" },
    { label: "Members", value: users().filter(u => u.role === "user").length, hint: "Customer accounts" },
    { label: "Announcements", value: ann.length, hint: "Latest updates" },
  ];
}

function statHTML(stat) {
  return `<div class="stat"><div class="label">${escapeHTML(stat.label)}</div><div class="value">${escapeHTML(stat.value)}</div><div class="hint">${escapeHTML(stat.hint || "")}</div></div>`;
}

function setText(id, txt) {
  const el = document.getElementById(id);
  if (el) el.textContent = txt;
}

function flashMessage() {
  const msg = localStorage.getItem(LS_KEYS.flash);
  if (!msg) return;
  localStorage.removeItem(LS_KEYS.flash);
  const el = document.querySelector(".flash");
  if (el) el.textContent = msg;
}

function bindLogoutButtons() {
  document.querySelectorAll("[data-action='logout']").forEach(btn => {
    btn.addEventListener("click", logout);
  });
}

function bindTopNav() {
  document.querySelectorAll("[data-go]").forEach(btn => {
    btn.addEventListener("click", () => window.location.href = btn.dataset.go);
  });
  document.querySelectorAll("[data-nav]").forEach(btn => {
    btn.addEventListener("click", () => window.location.href = btn.dataset.nav);
  });
}

function ensureLogin(roles) {
  const u = currentUser();
  if (!u) {
    location.href = "index.html";
    return null;
  }
  if (roles && !roles.includes(u.role)) {
    location.href = rolePage(u.role);
    return null;
  }
  return u;
}

function ensureTermsModal() {
  let modal = document.getElementById("termsModal");
  if (modal) return modal;

  modal = document.createElement("div");
  modal.id = "termsModal";
  modal.className = "modal-backdrop";
  modal.innerHTML = `
    <div class="modal-card">
      <h3>Reservation Terms and Conditions</h3>
      <div class="terms" id="termsText"></div>
      <div class="actions">
        <button type="button" class="secondary-btn" data-terms-cancel>Cancel</button>
        <button type="button" class="primary-btn" data-terms-accept>I Agree and Reserve</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  return modal;
}

function indexPage() {
  seed();
  flashMessage();
  const user = currentUser();
  const quick = document.getElementById("indexQuickLink");
  const demoStatus = document.getElementById("demoStatus");
  const loginForm = document.getElementById("loginForm");
  const loginMsg = document.getElementById("loginMsg");

  if (demoStatus) {
    demoStatus.innerHTML = user
      ? `<span class="badge good">Signed in as ${escapeHTML(user.name)}</span> <span class="badge">${escapeHTML(user.role)}</span>`
      : `<span class="badge warn">No session active</span> <span class="badge">Use a demo account below</span>`;
  }

  if (user && quick) {
    quick.innerHTML = `<a class="primary-btn" href="${rolePage(user.role)}">Continue to ${escapeHTML(user.role)} dashboard</a>`;
  }

  document.querySelectorAll("[data-login]").forEach(btn => {
    btn.addEventListener("click", () => {
      const res = login(btn.dataset.email, btn.dataset.password);
      if (res.ok) {
        window.location.href = rolePage(res.user.role);
      } else if (loginMsg) {
        loginMsg.textContent = res.message;
      }
    });
  });

  if (loginForm) {
    loginForm.addEventListener("submit", e => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const res = login(email, password);
      if (!res.ok) {
        if (loginMsg) loginMsg.textContent = res.message;
        return;
      }
      window.location.href = rolePage(res.user.role);
    });
  }
}

function generalPage() {
  seed();
  const statsMount = document.getElementById("generalStats");
  if (statsMount) statsMount.innerHTML = computeStats("general").map(statHTML).join("");

  const tableType = document.getElementById("generalTableType");
  const available = document.getElementById("generalAvailable");
  if (tableType && available) {
    const render = () => {
      const type = tableType.value;
      const list = tables().filter(t => !type || t.type === type);
      available.innerHTML = list.map(t => `
        <div class="list-item">
          <div>
            <strong>${escapeHTML(t.name)}</strong>
            <div class="meta">${escapeHTML(t.type)} • ${t.capacity} players</div>
          </div>
          <span class="pill ${t.status.toLowerCase()} status-pill">${escapeHTML(t.status)}</span>
        </div>
      `).join("");
    };
    tableType.addEventListener("change", render);
    render();
  }

  const annMount = document.getElementById("generalAnnouncements");
  if (annMount) {
    annMount.innerHTML = announcements().slice(0, 3).map(a => `
      <div class="list-item">
        <div>
          <strong>${escapeHTML(a.title)}</strong>
          <div class="meta">${escapeHTML(a.body)}</div>
        </div>
        <span class="badge">${escapeHTML(a.audience)}</span>
      </div>
    `).join("");
  }

  const features = document.getElementById("generalFeatures");
  if (features) {
    features.innerHTML = [
      { icon: "🕒", title: "Time Management", text: "Track schedules, prevent overlapping reservations, and keep the hall running smoothly." },
      { icon: "🏆", title: "Rewards System", text: "Regular customers earn points and unlock member benefits." },
      { icon: "🛠️", title: "Admin Control", text: "Staff can monitor tables, update statuses, and post notices." }
    ].map(f => `
      <div class="feature">
        <div class="icon">${f.icon}</div>
        <h3>${escapeHTML(f.title)}</h3>
        <p>${escapeHTML(f.text)}</p>
      </div>
    `).join("");
  }
}

function renderUserBoard() {
  const date = document.getElementById("bookDate")?.value || todayISO();
  const time = document.getElementById("bookTime")?.value || "10:00";
  const duration = Number(document.getElementById("duration")?.value || 1);
  const type = document.getElementById("tableType")?.value || "";
  const tableId = document.getElementById("tableId")?.value || "";
  const board = document.getElementById("tableBoard");
  if (!board) return;

  board.innerHTML = tables().filter(t => !type || t.type === type).map(t => {
    const free = tableIsFree(t.id, date, time, duration);
    return `
      <div class="table-card ${free ? "available" : "reserved"} ${tableId === t.id ? "selected" : ""}">
        <div>
          <div class="name">${escapeHTML(t.name)}</div>
          <div class="type">${escapeHTML(t.type)} • ${t.capacity} pax</div>
          <div class="price">${money(t.price)}</div>
        </div>
        <span class="pill ${free ? "available" : "reserved"}">${free ? "Available" : "Booked"}</span>
      </div>
    `;
  }).join("") || `<div class="notice">No tables found.</div>`;
}

function refreshUserTableOptions() {
  const tableType = document.getElementById("tableType")?.value || "";
  const date = document.getElementById("bookDate")?.value || todayISO();
  const time = document.getElementById("bookTime")?.value || "10:00";
  const duration = Number(document.getElementById("duration")?.value || 1);
  const select = document.getElementById("tableId");
  if (!select) return;

  const avail = availableTablesFor(tableType, date, time, duration);
  if (!avail.length) {
    select.innerHTML = `<option value="">No available tables</option>`;
    return;
  }

  select.innerHTML = avail.map(t => `<option value="${t.id}">${escapeHTML(t.name)} — ${escapeHTML(t.type)} — ${money(t.price)}</option>`).join("");
}

function getBookingInputs() {
  const date = document.getElementById("bookDate")?.value || todayISO();
  const time = document.getElementById("bookTime")?.value || "10:00";
  const duration = Number(document.getElementById("duration")?.value || 1);
  const type = document.getElementById("tableType")?.value || "";
  const tableId = document.getElementById("tableId")?.value || "";
  const table = tables().find(t => t.id === tableId);
  return { date, time, duration, type, tableId, table };
}

function renderUserReservations(user) {
  const el = document.getElementById("userReservations");
  if (!el) return;
  const list = reservations()
    .filter(r => r.userId === user.id)
    .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));

  el.innerHTML = list.length
    ? list.map(r => `
      <div class="list-item">
        <div>
          <strong>${escapeHTML(r.id)} — ${escapeHTML(r.tableName)}</strong>
          <div class="meta">${escapeHTML(r.date)} • ${escapeHTML(r.time)} • ${r.duration} hour(s) • ${escapeHTML(r.type)}</div>
          <div class="meta">Total: ${money(r.total)}</div>
        </div>
        <span class="badge ${statusClass(r.status)}">${escapeHTML(r.status)}</span>
      </div>
    `).join("")
    : `<div class="notice">No reservations yet.</div>`;
}

function renderUserRewards(user) {
  const el = document.getElementById("rewardDetails");
  if (el) {
    const tier = calcMemberTier(user);
    el.innerHTML = `
      <div class="kpi"><span>Member Type</span><strong>${escapeHTML(tier)}</strong></div>
      <div class="kpi"><span>Lifetime Visits</span><strong>${Number(user.visits || 0)}</strong></div>
      <div class="kpi"><span>Points</span><strong>${Number(user.points || 0)}</strong></div>
      <div class="kpi"><span>Hours Played</span><strong>${Number(user.hours || 0)}</strong></div>
    `;
  }

  const tips = document.getElementById("rewardTips");
  if (tips) {
    tips.innerHTML = `
      <div class="list-item"><div><strong>10% Discount</strong><div class="meta">Unlocked after reaching regular customer status.</div></div></div>
      <div class="list-item"><div><strong>Priority Booking</strong><div class="meta">Regular customers get faster table access.</div></div></div>
      <div class="list-item"><div><strong>Event Perks</strong><div class="meta">Special promos may apply during tournaments and holidays.</div></div></div>
    `;
  }
}

function renderUserAnnouncements() {
  const el = document.getElementById("userAnnouncements");
  if (!el) return;
  el.innerHTML = announcements().map(a => `
    <div class="list-item">
      <div>
        <strong>${escapeHTML(a.title)}</strong>
        <div class="meta">${escapeHTML(a.body)}</div>
      </div>
      <span class="badge">${escapeHTML(a.audience)}</span>
    </div>
  `).join("");
}

function userPage() {
  seed();
  const user = ensureLogin(["user", "admin", "superadmin"]);
  if (!user) return;

  setText("welcomeName", user.name);
  setText("memberStatus", calcMemberTier(user));
  setText("rateLabel", `Rates: ${money(settings().hourlyRates.VIP)} VIP • ${money(settings().hourlyRates.Professional)} Professional • ${money(settings().hourlyRates.Standard)} Standard`);

  const stats = document.getElementById("userStats");
  if (stats) {
    stats.innerHTML = computeStats("user").map(statHTML).join("");
  }

  const dateEl = document.getElementById("bookDate");
  if (dateEl && !dateEl.value) dateEl.value = todayISO();

  refreshUserTableOptions();
  renderUserBoard();
  renderUserReservations(user);
  renderUserRewards(user);
  renderUserAnnouncements();

  const modal = ensureTermsModal();
  const modalText = document.getElementById("termsText");
  let pendingBooking = null;

  function openTerms(booking) {
    pendingBooking = booking;
    if (modalText) {
      const s = settings();
      modalText.innerHTML = `
        <div><strong>Reservation Terms and Conditions</strong></div>
        <ul class="bullet-list" style="margin-top:12px">
          <li>Arrive on time to avoid losing your slot.</li>
          <li>The table will be reserved once you agree to these terms.</li>
          <li>Cancellations should be made as early as possible.</li>
          <li>Charges are based on table type and duration.</li>
          <li>Damage to equipment may be charged to the customer.</li>
          <li>Regular customer discount: ${Math.round(s.rewardDiscount * 100)}% may apply based on your account status.</li>
        </ul>
      `;
    }
    modal.classList.add("show");
  }

  function closeTerms() {
    modal.classList.remove("show");
    pendingBooking = null;
  }

  document.querySelector("[data-terms-accept]")?.addEventListener("click", () => {
    if (!pendingBooking) return;

    const list = reservations();
    const booking = {
      id: uid("B"),
      userId: user.id,
      userName: user.name,
      date: pendingBooking.date,
      time: pendingBooking.time,
      duration: pendingBooking.duration,
      tableId: pendingBooking.table.id,
      tableName: pendingBooking.table.name,
      type: pendingBooking.table.type,
      status: "Pending",
      total: pendingBooking.total,
      pointsEarned: pendingBooking.pointsEarned,
      createdAt: todayISO()
    };

    list.unshift(booking);
    saveReservations(list);

    const updatedUsers = users().map(u => u.id === user.id
      ? {
          ...u,
          visits: Number(u.visits || 0) + 1,
          hours: Number(u.hours || 0) + pendingBooking.duration,
          points: Number(u.points || 0) + pendingBooking.pointsEarned
        }
      : u
    );
    saveUsers(updatedUsers);

    localStorage.setItem(LS_KEYS.flash, "Table reserved successfully.");
    closeTerms();
    location.reload();
  });

  document.querySelector("[data-terms-cancel]")?.addEventListener("click", closeTerms);
  modal.addEventListener("click", e => {
    if (e.target === modal) closeTerms();
  });

  ["bookDate", "bookTime", "duration", "tableType"].forEach(id => {
    document.getElementById(id)?.addEventListener("change", () => {
      refreshUserTableOptions();
      renderUserBoard();
    });
  });
  document.getElementById("tableId")?.addEventListener("change", renderUserBoard);

  const form = document.getElementById("bookingForm");
  const msg = document.getElementById("bookingMsg");

  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      const { date, time, duration, table } = getBookingInputs();

      if (!table) {
        if (msg) {
          msg.textContent = "Please select an available table.";
          msg.style.color = "#f0cf7a";
        }
        return;
      }

      if (tableIsFree(table.id, date, time, duration) === false) {
        if (msg) {
          msg.textContent = "That table is already reserved for the selected schedule.";
          msg.style.color = "#e78e9c";
        }
        return;
      }

      const pointsEarned = Math.max(1, duration * 2);
      openTerms({ date, time, duration, table, total: table.price * duration, pointsEarned });
    });
  }

  flashMessage();
}

function adminPage() {
  seed();
  const user = ensureLogin(["admin", "superadmin"]);
  if (!user) return;

  setText("adminName", user.name);

  const today = todayISO();
  const todays = reservations().filter(r => r.date === today);
  const stats = document.getElementById("adminStats");
  if (stats) {
    stats.innerHTML = computeStats("admin").map(statHTML).join("");
  }

  const tbody = document.getElementById("reservationTableBody");
  if (tbody) {
    tbody.innerHTML = reservations().map(r => `
      <tr>
        <td>${escapeHTML(r.id)}</td>
        <td>${escapeHTML(r.userName)}</td>
        <td>${escapeHTML(r.date)}</td>
        <td>${escapeHTML(r.time)}</td>
        <td>${escapeHTML(r.tableName)}</td>
        <td>${money(r.total)}</td>
        <td><span class="badge ${statusClass(r.status)}">${escapeHTML(r.status)}</span></td>
        <td>
          <div class="row-actions">
            <select class="compact" data-res-status="${escapeHTML(r.id)}">
              ${["Pending", "Confirmed", "On Going", "Completed", "Cancelled"].map(s => `<option ${r.status === s ? "selected" : ""}>${s}</option>`).join("")}
            </select>
          </div>
        </td>
      </tr>
    `).join("");

    tbody.querySelectorAll("[data-res-status]").forEach(sel => {
      sel.addEventListener("change", e => {
        const id = e.target.dataset.resStatus;
        const status = e.target.value;
        saveReservations(reservations().map(r => r.id === id ? { ...r, status } : r));
        location.reload();
      });
    });
  }

  const monitor = document.getElementById("adminTables");
  if (monitor) {
    monitor.className = "table-grid admin-table-grid";
    monitor.innerHTML = tables().map(t => `
      <div class="table-card ${t.status.toLowerCase()}">
        <div class="name">${escapeHTML(t.name)}</div>
        <div class="type">${escapeHTML(t.type)} • ${t.capacity} pax</div>
        <div class="price">${money(t.price)}</div>
        <div class="pill">${escapeHTML(t.status)}</div>
      </div>
    `).join("");
  }

  const annList = document.getElementById("adminAnnouncements");
  if (annList) {
    annList.innerHTML = announcements().map(a => `
      <div class="list-item">
        <div>
          <strong>${escapeHTML(a.title)}</strong>
          <div class="meta">${escapeHTML(a.body)}</div>
        </div>
        <span class="badge">${escapeHTML(a.audience)}</span>
      </div>
    `).join("");
  }

  const form = document.getElementById("announcementForm");
  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      const title = document.getElementById("annTitle").value.trim();
      const body = document.getElementById("annBody").value.trim();
      const audience = document.getElementById("annAudience").value;
      const list = announcements();
      list.unshift({ id: uid("A"), title, body, audience, date: todayISO() });
      saveAnnouncements(list);
      localStorage.setItem(LS_KEYS.flash, "Announcement posted.");
      location.reload();
    });
  }
}

function superAdminPage() {
  seed();
  const user = ensureLogin(["superadmin"]);
  if (!user) return;

  setText("superName", user.name);

  const stats = document.getElementById("superStats");
  if (stats) {
    stats.innerHTML = computeStats("superadmin").map(statHTML).join("");
  }

  const list = document.getElementById("userAdminList");
  if (list) {
    list.innerHTML = users().map(u => `
      <div class="list-item">
        <div>
          <strong>${escapeHTML(u.name)}</strong>
          <div class="meta">${escapeHTML(u.email)}</div>
          <div class="meta">${escapeHTML(u.phone || "")}</div>
        </div>
        <div style="min-width:180px">
          <select class="compact" data-role-user="${escapeHTML(u.id)}">
            ${["user", "admin", "superadmin"].map(r => `<option value="${r}" ${u.role === r ? "selected" : ""}>${r}</option>`).join("")}
          </select>
        </div>
      </div>
    `).join("");

    list.querySelectorAll("[data-role-user]").forEach(sel => {
      sel.addEventListener("change", e => {
        const id = e.target.dataset.roleUser;
        const role = e.target.value;
        saveUsers(users().map(u => u.id === id ? { ...u, role } : u));
        localStorage.setItem(LS_KEYS.flash, "Role updated.");
        location.reload();
      });
    });
  }

  const systemStats = document.getElementById("systemStats");
  if (systemStats) {
    const allRes = reservations();
    const income = sumIncome(allRes.filter(r => ["Pending", "Confirmed", "On Going", "Completed"].includes(r.status)));
    systemStats.innerHTML = `
      <div class="stat"><div class="label">Daily Income</div><div class="value">${money(income)}</div><div class="hint">From current business reservations</div></div>
      <div class="stat"><div class="label">Average Rate</div><div class="value">${money(Math.round(tables().reduce((a, t) => a + Number(t.price), 0) / Math.max(1, tables().length)))}</div><div class="hint">Per table average</div></div>
      <div class="stat"><div class="label">Regular Members</div><div class="value">${users().filter(u => u.role === "user" && calcMemberTier(u) === "Regular Customer").length}</div><div class="hint">Returning customers</div></div>
      <div class="stat"><div class="label">Business Announcements</div><div class="value">${announcements().length}</div><div class="hint">Current notices</div></div>
    `;
  }

  const settingsForm = document.getElementById("settingsForm");
  if (settingsForm) {
    const s = settings();
    const std = document.getElementById("rateStandard");
    const pro = document.getElementById("rateProfessional");
    const vip = document.getElementById("rateVIP");
    const hours = document.getElementById("rewardHours");
    const visits = document.getElementById("rewardVisits");
    if (std) std.value = s.hourlyRates.Standard;
    if (pro) pro.value = s.hourlyRates.Professional;
    if (vip) vip.value = s.hourlyRates.VIP;
    if (hours) hours.value = s.rewardThresholdHours;
    if (visits) visits.value = s.rewardThresholdVisits;

    settingsForm.addEventListener("submit", e => {
      e.preventDefault();
      saveSettings({
        hourlyRates: {
          Standard: Number(document.getElementById("rateStandard").value || 0),
          Professional: Number(document.getElementById("rateProfessional").value || 0),
          VIP: Number(document.getElementById("rateVIP").value || 0)
        },
        rewardThresholdHours: Number(document.getElementById("rewardHours").value || 20),
        rewardThresholdVisits: Number(document.getElementById("rewardVisits").value || 5),
        rewardDiscount: settings().rewardDiscount || 0.10,
        openTime: "10:00",
        closeTime: "23:00"
      });
      localStorage.setItem(LS_KEYS.flash, "System settings updated.");
      location.reload();
    });
  }

  document.getElementById("resetDemo")?.addEventListener("click", () => {
    localStorage.removeItem(LS_KEYS.users);
    localStorage.removeItem(LS_KEYS.tables);
    localStorage.removeItem(LS_KEYS.reservations);
    localStorage.removeItem(LS_KEYS.announcements);
    localStorage.removeItem(LS_KEYS.settings);
    localStorage.removeItem(LS_KEYS.session);
    seed();
    localStorage.setItem(LS_KEYS.flash, "Demo data reset.");
    location.reload();
  });
}

function renderAbout() {
  seed();
  const box = document.getElementById("aboutStats");
  if (box) box.innerHTML = computeStats("general").map(statHTML).join("");

  const info = document.getElementById("businessInfo");
  if (info) {
    info.innerHTML = `
      <div class="list-item"><div><strong>Address</strong><div class="meta">1260 Tamaraw Hills, Gen t de Leon, Valenzuela, Philippines, 1442</div></div></div>
      <div class="list-item"><div><strong>Contact No.</strong><div class="meta">0917 123 0705</div></div></div>
      <div class="list-item"><div><strong>Social</strong><div class="meta">Borgz' Billiard Hall - Bilyaran sa Bitik (Facebook)</div></div></div>
      <div class="list-item"><div><strong>Page</strong><div class="meta">https://www.facebook.com/borgzbilliard</div></div></div>
    `;
  }

  const slides = Array.from(document.querySelectorAll(".about-slide"));
  if (slides.length) {
    let idx = 0;
    const show = (n) => {
      idx = (n + slides.length) % slides.length;
      slides.forEach((s, i) => s.classList.toggle("active", i === idx));
      const dots = document.querySelectorAll("[data-slide-dot]");
      dots.forEach((d, i) => d.classList.toggle("active", i === idx));
    };
    show(0);
    const timer = setInterval(() => show(idx + 1), 3500);
    document.querySelector("[data-slide-prev]")?.addEventListener("click", () => show(idx - 1));
    document.querySelector("[data-slide-next]")?.addEventListener("click", () => show(idx + 1));
    document.querySelectorAll("[data-slide-dot]").forEach((dot, i) => dot.addEventListener("click", () => show(i)));
    window.addEventListener("beforeunload", () => clearInterval(timer), { once: true });
  }
}

function init() {
  seed();
  bindTopNav();
  bindLogoutButtons();

  const page = document.body.dataset.page;
  if (page === "index") indexPage();
  if (page === "signup") signupPage();
  if (page === "about") renderAbout();
  if (page === "general") generalPage();
  if (page === "user") userPage();
  if (page === "admin") adminPage();
  if (page === "superadmin") superAdminPage();

  document.querySelectorAll("[data-go]").forEach(btn => {
    btn.addEventListener("click", () => window.location.href = btn.dataset.go);
  });
}

function signupPage() {
  seed();
  flashMessage();
  const form = document.getElementById("signupForm");
  const msg = document.getElementById("signupMsg");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();
    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim().toLowerCase();
    const phone = document.getElementById("signupPhone").value.trim();
    const password = document.getElementById("signupPassword").value;
    const confirm = document.getElementById("signupConfirm").value;

    if (password !== confirm) {
      if (msg) {
        msg.textContent = "Passwords do not match.";
        msg.style.color = "#e78e9c";
      }
      return;
    }

    const list = users();
    if (list.some(u => u.email.toLowerCase() === email)) {
      if (msg) {
        msg.textContent = "Email already exists.";
        msg.style.color = "#e78e9c";
      }
      return;
    }

    const newUser = {
      id: `u-${Math.random().toString(36).slice(2, 8)}`,
      name,
      email,
      password,
      phone,
      role: "user",
      hours: 0,
      visits: 0,
      points: 0
    };
    list.push(newUser);
    saveUsers(list);
    localStorage.setItem(LS_KEYS.flash, "Account created successfully. You can log in now.");
    location.href = "index.html";
  });
}

document.addEventListener("DOMContentLoaded", init);
