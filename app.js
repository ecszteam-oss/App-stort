/* EXPERT CYBER SECURITY ZONE — CYBER SOHAG APP STORE
   Client-side only: catalogue from apps.json, accounts / downloads /
   visits in localStorage on this device. No backend, no external libs.
   Passwords are stored only as SHA-256 hashes (Web Crypto API).
   The admin account is "sohag11"; only its SHA-256 hash is stored here. */
(function () {
  "use strict";

  var TELEGRAM_URL = "https://t.me/cyberkingsohag";
  var ADMIN_USERNAME = "sohag11";
  var ADMIN_PASS_HASH = "01e15a42051b55733e8cdf607042165d3102caa787b22d1d6a26c7764b32a7b5";
  var USERS_KEY = "ecszAppStoreUsers";
  var SESSION_KEY = "ecszAppStoreSession";
  var LOCAL_KEY = "cyberSohagAppStoreLocalApps";
  var VISITS_KEY = "cyberSohagAppStoreVisits";
  var DOWNLOADS_KEY = "cyberSohagAppStoreDownloads";

  var state = { apps: [], category: "All", query: "", session: null };
  var currentDetailApp = null;

  function $(id) { return document.getElementById(id); }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function fmt(n) {
    n = +n || 0;
    if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
    return String(n);
  }

  async function sha256Hex(text) {
    if (window.crypto && crypto.subtle) {
      var buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
      return Array.from(new Uint8Array(buf)).map(function (b) {
        return b.toString(16).padStart(2, "0");
      }).join("");
    }
    throw new Error("Secure crypto is not available in this browser.");
  }

  /* ---------- storage helpers ---------- */
  function readJSON(key, fallback) {
    try {
      var parsed = JSON.parse(localStorage.getItem(key) || "null");
      return parsed == null ? fallback : parsed;
    } catch (e) { return fallback; }
  }
  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
  }
  function loadUsers() {
    var users = readJSON(USERS_KEY, []);
    return Array.isArray(users) ? users : [];
  }
  function saveUsers(users) { writeJSON(USERS_KEY, users); }
  function loadDownloads() { return readJSON(DOWNLOADS_KEY, {}) || {}; }
  function saveDownloads(map) { writeJSON(DOWNLOADS_KEY, map); }
  function loadLocalApps() { return readJSON(LOCAL_KEY, []) || []; }
  function saveLocalApps(apps) { writeJSON(LOCAL_KEY, apps); }
  function getVisits() {
    try { return parseInt(localStorage.getItem(VISITS_KEY) || "0", 10) || 0; } catch (e) { return 0; }
  }
  function incrementVisits() {
    var v = getVisits() + 1;
    try { localStorage.setItem(VISITS_KEY, String(v)); } catch (e) { /* ignore */ }
    return v;
  }

  /* ---------- auth ---------- */
  function currentUser() {
    if (!state.session) return null;
    if (state.session.username === ADMIN_USERNAME) {
      return { name: "Sohag (Admin)", username: ADMIN_USERNAME, admin: true, created: "" };
    }
    var users = loadUsers();
    for (var i = 0; i < users.length; i++) {
      if (users[i].username === state.session.username) return users[i];
    }
    return null;
  }
  function isAdmin() { return !!(state.session && state.session.username === ADMIN_USERNAME); }

  function showAuth(showRegister) {
    $("authView").hidden = false;
    $("appShell").hidden = true;
    $("bottomNav").hidden = true;
    setAuthMode(showRegister);
  }
  function showStore() {
    $("authView").hidden = true;
    $("appShell").hidden = false;
    $("bottomNav").hidden = false;
    var user = currentUser();
    if (user) {
      $("topUserName").textContent = user.name || user.username;
      $("topAv").textContent = (user.name || user.username || "U").charAt(0).toUpperCase();
    }
    $("navAdmin").hidden = !isAdmin();
    showView("view-apps");
    renderAll();
  }
  function setAuthMode(register) {
    $("loginForm").hidden = register;
    $("registerForm").hidden = !register;
    $("authTitle").textContent = register ? "📝 রেজিস্টার • Register" : "🔐 লগইন • Login";
    $("authSub").textContent = register
      ? "নতুন অ্যাকাউন্ট খুলুন, তারপর লগইন করুন।"
      : "অ্যাকাউন্টে লগইন করে স্টোর ব্যবহার করুন।";
    $("authToggle").textContent = register
      ? "ইতিমধ্যে অ্যাকাউন্ট আছে? লগইন করুন"
      : "নতুন অ্যাকাউন্ট খুলুন • Create an account";
    hideAuthError();
  }
  function showAuthError(msg) {
    var el = $("authError");
    el.style.background = "";
    el.style.borderColor = "";
    el.style.color = "";
    el.textContent = msg;
    el.hidden = false;
  }
  function hideAuthError() { $("authError").hidden = true; }

  function saveSession(username) {
    state.session = { username: username };
    writeJSON(SESSION_KEY, state.session);
  }
  function clearSession() {
    state.session = null;
    try { localStorage.removeItem(SESSION_KEY); } catch (e) { /* ignore */ }
  }

  async function handleLogin(event) {
    event.preventDefault();
    hideAuthError();
    var username = $("loginUser").value.trim().toLowerCase();
    var password = $("loginPass").value;
    if (!username || !password) { showAuthError("ইউজারনেম ও পাসওয়ার্ড দিন।"); return; }
    try {
      var hash = await sha256Hex(password);
      if (username === ADMIN_USERNAME) {
        if (hash === ADMIN_PASS_HASH) { saveSession(ADMIN_USERNAME); showStore(); return; }
        showAuthError("ইউজারনেম বা পাসওয়ার্ড ভুল। / Wrong username or password.");
        return;
      }
      var users = loadUsers();
      for (var i = 0; i < users.length; i++) {
        if (users[i].username === username && users[i].passHash === hash) {
          saveSession(username);
          showStore();
          return;
        }
      }
      showAuthError("ইউজারনেম বা পাসওয়ার্ড ভুল। / Wrong username or password.");
    } catch (e) {
      showAuthError("এই ব্রাউজারে নিরাপদ লগইন সম্ভব নয় (HTTPS দরকার)।");
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    hideAuthError();
    var name = $("regName").value.trim();
    var username = $("regUser").value.trim().toLowerCase();
    var password = $("regPass").value;
    if (!name || !username || !password) { showAuthError("সব ঘর পূরণ করুন।"); return; }
    if (!/^[a-z0-9_.-]{3,40}$/.test(username)) {
      showAuthError("ইউজারনেমে শুধু ইংরেজি অক্ষর, সংখ্যা, _ . - ব্যবহার করুন (কমপক্ষে ৩ অক্ষর)।");
      return;
    }
    if (password.length < 4) { showAuthError("পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।"); return; }
    if (username === ADMIN_USERNAME) { showAuthError("এই ইউজারনেমটি নেওয়া যাবে না।"); return; }
    var users = loadUsers();
    for (var i = 0; i < users.length; i++) {
      if (users[i].username === username) { showAuthError("এই ইউজারনেমে ইতিমধ্যে অ্যাকাউন্ট আছে। অন্য নাম নিন।"); return; }
    }
    try {
      var hash = await sha256Hex(password);
      users.push({
        name: name,
        username: username,
        passHash: hash,
        created: new Date().toISOString().slice(0, 10)
      });
      saveUsers(users);
      event.target.reset();
      setAuthMode(false);
      showAuthError("✅ অ্যাকাউন্ট খোলা হয়েছে! এখন লগইন করুন।");
      $("authError").style.background = "rgba(255,122,26,.15)";
      $("authError").style.borderColor = "rgba(255,122,26,.5)";
      $("authError").style.color = "#ffd9b0";
    } catch (e) {
      showAuthError("এই ব্রাউজারে নিরাপদ রেজিস্ট্রেশন সম্ভব নয় (HTTPS দরকার)।");
    }
  }

  /* ---------- catalogue / stats ---------- */
  function appDownloads(app) {
    var map = loadDownloads();
    return (Number(app.downloads) || 0) + (Number(map[app.id]) || 0);
  }
  function totalDownloads() {
    var total = 0;
    for (var i = 0; i < state.apps.length; i++) total += appDownloads(state.apps[i]);
    return total;
  }
  function byDownloads(a, b) { return appDownloads(b) - appDownloads(a); }

  function updateStats() {
    var byDl = state.apps.slice().sort(byDownloads);
    var top = byDl.length ? byDl[0] : null;
    $("topTrendApp").textContent = top ? top.name + " · " + fmt(appDownloads(top)) : "No data";
    $("storeTotalDl").textContent = totalDownloads().toLocaleString();
    $("statApps").textContent = String(state.apps.length);
    $("statVisits").textContent = String(getVisits());
  }

  function visibleApps() {
    var q = state.query.trim().toLowerCase();
    return state.apps.filter(function (app) {
      var inCat = state.category === "All" || app.category === state.category;
      if (!inCat) return false;
      if (!q) return true;
      return [app.name, app.category, app.description, app.description_en || ""]
        .join(" ").toLowerCase().indexOf(q) !== -1;
    });
  }

  function gridCard(app, rank, i) {
    return '<article class="app-card" tabindex="0" data-id="' + escapeHtml(app.id) + '" style="animation-delay:' + (i * 0.04).toFixed(2) + 's">' +
      '<span class="rank-tag ' + (rank === 1 ? "hot" : "") + '">' + (rank === 1 ? "🔥 #1" : "#" + rank) + "</span>" +
      '<div class="card-icon-wrap">' + escapeHtml(app.icon || "📦") + "</div>" +
      '<div class="card-title">' + escapeHtml(app.name) + "</div>" +
      '<div class="card-footer"><span class="dl-stat">⬇ ' + fmt(appDownloads(app)) + "</span>" +
      '<span class="format-tag">' + escapeHtml(app.category) + "</span></div>" +
      "</article>";
  }

  function renderHome() {
    var items = visibleApps();
    var byDl = state.apps.slice().sort(byDownloads);
    updateStats();

    var top = items.slice().sort(byDownloads).slice(0, 10);
    $("topRow").innerHTML = top.map(function (a, i) {
      return '<div class="mini-card" data-id="' + escapeHtml(a.id) + '">' +
        '<span class="trank">#' + (i + 1) + "</span>" +
        '<div class="mc-img">' + escapeHtml(a.icon || "📦") + "</div>" +
        "<b>" + escapeHtml(a.name) + "</b>" +
        "<span>⬇ " + fmt(appDownloads(a)) + "</span></div>";
    }).join("");

    var feat = items.slice().sort(byDownloads).slice(0, 4);
    $("featTrack").innerHTML = feat.map(function (a) {
      return '<div class="feat-card" data-id="' + escapeHtml(a.id) + '">' +
        '<span class="tag">🔥 FEATURED</span>' +
        '<div class="row"><div class="feat-icon">' + escapeHtml(a.icon || "📦") + "</div>" +
        "<div><h3>" + escapeHtml(a.name) + "</h3><p>⬇ " + fmt(appDownloads(a)) + " · " + escapeHtml(a.category) + "</p></div></div>" +
        '<button class="inst" type="button" data-install="' + escapeHtml(a.id) + '">⬇ INSTALL</button></div>';
    }).join("");
    $("featDots").innerHTML = feat.map(function (_, i) {
      return '<i class="' + (i === 0 ? "on" : "") + '"></i>';
    }).join("");

    var sug = items.slice().sort(byDownloads).slice(4, 14);
    $("suggestRow").innerHTML = sug.map(function (a) {
      return '<div class="mini-card" data-id="' + escapeHtml(a.id) + '">' +
        '<div class="mc-img">' + escapeHtml(a.icon || "📦") + "</div>" +
        "<b>" + escapeHtml(a.name) + "</b>" +
        "<span>⬇ " + fmt(appDownloads(a)) + "</span></div>";
    }).join("");

    var sorted = items.slice().sort(byDownloads);
    var grid = $("allGrid");
    $("appCount").textContent = sorted.length + " টি অ্যাপ • " + sorted.length + " app(s)";
    $("emptyMessage").hidden = sorted.length !== 0;
    if (!state.apps.length) {
      /* keep skeletons while loading */
    } else if (!sorted.length) {
      grid.innerHTML = '<div class="empty-state"><span class="empty-icon">🔍</span><div class="empty-title">NO APPS FOUND</div><div class="empty-text">অন্য কিছু সার্চ করুন বা ক্যাটাগরি বদলান</div></div>';
    } else {
      grid.innerHTML = sorted.map(function (a, i) {
        return gridCard(a, byDl.indexOf(a) + 1, i);
      }).join("");
    }

    var charts = items.slice().sort(byDownloads).slice(0, 10);
    $("chartsList").innerHTML = charts.map(function (a, i) {
      return '<div class="rank-row ' + (i < 3 ? "top3" : "") + '" data-id="' + escapeHtml(a.id) + '">' +
        '<div class="n">' + (i + 1) + '</div><div class="rank-icon">' + escapeHtml(a.icon || "📦") + "</div>" +
        '<div class="inf"><b>' + escapeHtml(a.name) + "</b><span>⬇ " + fmt(appDownloads(a)) + " downloads</span></div>" +
        '<div class="chev">›</div></div>';
    }).join("");
  }

  function renderProfile() {
    var user = currentUser();
    if (!user) return;
    $("youBox").innerHTML =
      '<div class="you-card"><div class="youav">' + escapeHtml((user.name || "U").charAt(0).toUpperCase()) + "</div>" +
      "<h3>" + escapeHtml(user.name) + "</h3>" +
      "<p>@" + escapeHtml(user.username) + (user.admin ? " • 🛡️ Admin" : "") + "</p>" +
      (user.created ? "<p>অ্যাকাউন্ট খোলা: " + escapeHtml(user.created) + "</p>" : "") +
      '<div class="meta-specs-grid" style="margin-top:14px;text-align:left">' +
      '<div class="spec-item"><span class="spec-label">মোট অ্যাপ</span><span class="spec-value">' + state.apps.length + "</span></div>" +
      '<div class="spec-item"><span class="spec-label">মোট ডাউনলোড</span><span class="spec-value">' + fmt(totalDownloads()) + "</span></div>" +
      "</div>" +
      '<p style="margin-top:10px">ইনস্টল করতে Telegram-এ যোগাযোগ করুন: <a href="' + TELEGRAM_URL + '" target="_blank" rel="noopener">@cyberkingsohag</a></p>' +
      '<button class="btn btn-ghost" type="button" id="logoutBtn" style="margin-top:14px">🚪 লগআউট • Logout</button></div>';
    var logoutBtn = $("logoutBtn");
    if (logoutBtn) logoutBtn.addEventListener("click", function () {
      clearSession();
      showAuth(false);
    });
  }

  function renderAdmin() {
    if (!isAdmin()) return;
    var users = loadUsers();
    $("adminTotalUsers").textContent = String(users.length);
    $("adminTotalApps").textContent = String(state.apps.length);
    $("adminTotalDl").textContent = totalDownloads().toLocaleString();
    $("adminTotalVisits").textContent = String(getVisits());
    $("adminUserList").innerHTML = users.length ? users.map(function (u) {
      return '<div class="user-row"><div class="uav">' + escapeHtml((u.name || "U").charAt(0).toUpperCase()) + "</div>" +
        '<div class="inf"><b>' + escapeHtml(u.name) + '</b><span>@' + escapeHtml(u.username) + "</span></div>" +
        '<span class="role">' + escapeHtml(u.created || "") + "</span></div>";
    }).join("") : '<div class="empty-state"><span class="empty-icon">👥</span><div class="empty-title">NO USERS YET</div><div class="empty-text">এই ডিভাইসে এখনো কেউ রেজিস্টার করেনি।</div></div>';
  }

  function renderAll() {
    renderHome();
    renderProfile();
    renderAdmin();
  }

  /* ---------- views / detail ---------- */
  function showView(id) {
    $("detailView").classList.remove("visible");
    $("detailView").style.display = "none";
    $("storeView").style.display = "block";
    document.querySelectorAll(".view").forEach(function (v) { v.classList.remove("on"); });
    $(id).classList.add("on");
    document.querySelectorAll(".bnav[data-view]").forEach(function (b) {
      b.classList.toggle("on", b.getAttribute("data-view") === id);
    });
    window.scrollTo(0, 0);
    if (id === "view-you") renderProfile();
    if (id === "view-admin") renderAdmin();
  }

  function findApp(id) {
    for (var i = 0; i < state.apps.length; i++) {
      if (state.apps[i].id === id) return state.apps[i];
    }
    return null;
  }

  function openDetail(id) {
    var app = findApp(id);
    if (!app) return;
    currentDetailApp = app;
    var byDl = state.apps.slice().sort(byDownloads);
    var rank = byDl.indexOf(app) + 1;
    var others = state.apps.filter(function (x) { return x.id !== id; }).slice(0, 6);
    var d = $("detailView");
    d.innerHTML =
      '<div class="detail-container">' +
      '<div class="detail-icon-wrap">' + escapeHtml(app.icon || "📦") + "</div>" +
      '<h2 class="detail-app-name">' + escapeHtml(app.name) + "</h2>" +
      '<div style="margin:2px 0 8px"><span class="catbadge">' + escapeHtml(app.category) + "</span></div>" +
      '<div class="detail-package">Rank #' + rank + " • " + escapeHtml(app.status || app.badge || "Available") + "</div>" +
      '<div class="meta-specs-grid">' +
      '<div class="spec-item"><span class="spec-label">Downloads</span><span class="spec-value">' + fmt(appDownloads(app)) + "</span></div>" +
      '<div class="spec-item"><span class="spec-label">Category</span><span class="spec-value">' + escapeHtml(app.category) + "</span></div>" +
      '<div class="spec-item"><span class="spec-label">Price</span><span class="spec-value">' + escapeHtml(app.price || "Contact on Telegram") + "</span></div>" +
      '<div class="spec-item"><span class="spec-label">Security</span><span class="spec-value">Verified 🛡️</span></div>' +
      "</div>" +
      '<div class="desc-card"><div class="desc-head"><span>📄</span> APP DESCRIPTION</div><div class="desc-body">' +
      escapeHtml(app.description || "") + (app.description_en ? "\n" + escapeHtml(app.description_en) : "") + "</div></div>" +
      '<div class="detail-actions">' +
      '<a class="btn-download" href="' + TELEGRAM_URL + '" target="_blank" rel="noopener" data-install="' + escapeHtml(app.id) + '">⬇️ INSTALL NOW</a>' +
      '<button class="btn-back" type="button" id="detailBack">← BACK TO STORE</button>' +
      "</div></div>" +
      '<div class="sec-title">📦 আরও অ্যাপ</div>' +
      '<div class="apps-grid">' + others.map(function (x, i) { return gridCard(x, byDl.indexOf(x) + 1, i); }).join("") + "</div>";
    $("storeView").style.display = "none";
    d.style.display = "block";
    d.classList.add("visible");
    window.scrollTo(0, 0);
    $("detailBack").addEventListener("click", function () {
      d.classList.remove("visible");
      d.style.display = "none";
      $("storeView").style.display = "block";
      window.scrollTo(0, 0);
    });
  }

  function recordDownload(appId) {
    var map = loadDownloads();
    map[appId] = (Number(map[appId]) || 0) + 1;
    saveDownloads(map);
    renderAll();
  }

  /* ---------- init ---------- */
  function init() {
    incrementVisits();

    $("authToggle").addEventListener("click", function () {
      setAuthMode($("loginForm").hidden === false);
    });
    $("loginForm").addEventListener("submit", handleLogin);
    $("registerForm").addEventListener("submit", handleRegister);
    $("profileBtn").addEventListener("click", function () { showView("view-you"); });

    document.querySelectorAll(".bnav[data-view]").forEach(function (btn) {
      btn.addEventListener("click", function () { showView(btn.getAttribute("data-view")); });
    });
    $("navSearch").addEventListener("click", function () {
      showView("view-apps");
      var q = $("q");
      if (q) { q.focus(); q.scrollIntoView({ block: "center", behavior: "smooth" }); }
    });

    $("categoryChips").addEventListener("click", function (event) {
      var btn = event.target.closest(".cat-btn");
      if (!btn) return;
      state.category = btn.getAttribute("data-category");
      document.querySelectorAll(".cat-btn").forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      renderHome();
    });
    $("q").addEventListener("input", function () {
      state.query = $("q").value;
      renderHome();
    });

    // Open detail from any card / row (event delegation)
    document.addEventListener("click", function (event) {
      var installBtn = event.target.closest("[data-install]");
      if (installBtn) {
        recordDownload(installBtn.getAttribute("data-install"));
        return; // link still opens Telegram
      }
      var card = event.target.closest("[data-id]");
      if (card && card.closest("#storeView, #detailView, #chartsList")) {
        openDetail(card.getAttribute("data-id"));
      }
    });

    // Featured carousel dots
    var featTrack = $("featTrack");
    featTrack.addEventListener("scroll", function () {
      var card = featTrack.querySelector(".feat-card");
      if (!card) return;
      var i = Math.round(featTrack.scrollLeft / (card.offsetWidth + 12));
      document.querySelectorAll("#featDots i").forEach(function (dot, j) {
        dot.classList.toggle("on", j === i);
      });
    }, { passive: true });

    // Add App form (admin panel) — saves to localStorage only
    $("addAppForm").addEventListener("submit", function (event) {
      event.preventDefault();
      var name = $("newName").value.trim();
      var category = $("newCategory").value;
      var icon = $("newIcon").value.trim() || "📦";
      var description = $("newDescription").value.trim();
      var note = $("addAppNote");
      if (!name || !description) {
        note.textContent = "নাম ও বিবরণ দিন। / Please fill in name and description.";
        return;
      }
      var app = {
        id: "local-" + Date.now(), name: name, category: category, icon: icon,
        description: description, description_en: "", price: "Contact on Telegram",
        status: "Available", badge: "New", downloads: 0
      };
      var localApps = loadLocalApps();
      localApps.push(app);
      saveLocalApps(localApps);
      state.apps.push(app);
      renderAll();
      event.target.reset();
      $("newIcon").value = "📦";
      note.textContent = '✅ "' + name + '" যোগ হয়েছে — শুধু এই ব্রাউজারে। স্থায়ী করতে apps.json-এ যোগ করে GitHub-এ আপলোড করুন।';
    });
    $("clearLocalApps").addEventListener("click", function () {
      try { localStorage.removeItem(LOCAL_KEY); } catch (e) { /* ignore */ }
      state.apps = state.apps.filter(function (app) { return String(app.id).indexOf("local-") !== 0; });
      $("addAppNote").textContent = "আপনার যোগ করা অ্যাপগুলো মুছে দেওয়া হয়েছে।";
      renderAll();
    });

    // Load catalogue from apps.json, then add any local apps
    fetch("apps.json")
      .then(function (response) {
        if (!response.ok) throw new Error("Could not load apps.json");
        return response.json();
      })
      .then(function (data) {
        state.apps = Array.isArray(data) ? data.slice() : [];
        state.apps = state.apps.concat(loadLocalApps());
        renderAll();
      })
      .catch(function () {
        state.apps = loadLocalApps();
        $("appCount").textContent = "apps.json লোড হয়নি। / apps.json could not be loaded.";
        renderAll();
      });

    // Restore session
    var saved = readJSON(SESSION_KEY, null);
    if (saved && saved.username) {
      state.session = saved;
      showStore();
    } else {
      showAuth(false);
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
