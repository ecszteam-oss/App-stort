/* CYBER SOHAG APP STORE — no build step, no external libraries. */
(function () {
  "use strict";

  var TELEGRAM_URL = "https://t.me/cyberkingsohag";
  var LOCAL_KEY = "cyberSohagAppStoreLocalApps";
  var state = { apps: [], category: "All", query: "", sort: "name" };

  var grid = document.getElementById("appGrid");
  var countEl = document.getElementById("appCount");
  var emptyEl = document.getElementById("emptyMessage");
  var searchInput = document.getElementById("searchInput");
  var sortSelect = document.getElementById("sortSelect");
  var modal = document.getElementById("appModal");
  var modalTitle = document.getElementById("modalTitle");
  var modalMeta = document.getElementById("modalMeta");
  var modalDesc = document.getElementById("modalDescription");
  var modalDescEn = document.getElementById("modalDescriptionEn");
  var modalPrice = document.getElementById("modalPrice");
  var modalIcon = document.getElementById("modalIcon");

  function loadLocalApps() {
    try {
      var raw = localStorage.getItem(LOCAL_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function saveLocalApps(apps) {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(apps));
    } catch (e) {
      // Storage may be unavailable in some browsers; the grid still renders.
    }
  }

  function badgeClass(badge) {
    if (badge === "Paused") return "badge paused";
    if (badge === "Coming Soon") return "badge soon";
    return "badge";
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function filteredApps() {
    var query = state.query.trim().toLowerCase();
    var list = state.apps.filter(function (app) {
      var inCategory = state.category === "All" || app.category === state.category;
      if (!inCategory) return false;
      if (!query) return true;
      var haystack = [app.name, app.category, app.description, app.description_en || ""]
        .join(" ")
        .toLowerCase();
      return haystack.indexOf(query) !== -1;
    });
    list.sort(function (a, b) {
      if (state.sort === "category") {
        var byCat = String(a.category).localeCompare(String(b.category));
        return byCat !== 0 ? byCat : String(a.name).localeCompare(String(b.name));
      }
      return String(a.name).localeCompare(String(b.name));
    });
    return list;
  }

  function render() {
    var list = filteredApps();
    countEl.textContent = list.length + " টি অ্যাপ • " + list.length + " app(s)";
    emptyEl.hidden = list.length !== 0;
    grid.innerHTML = list
      .map(function (app) {
        return (
          '<article class="app-card" tabindex="0" data-id="' +
          escapeHtml(app.id) +
          '">' +
          '<div class="app-icon" aria-hidden="true">' +
          escapeHtml(app.icon || "📦") +
          "</div>" +
          "<h3>" +
          escapeHtml(app.name) +
          "</h3>" +
          '<p class="app-cat">' +
          escapeHtml(app.category) +
          "</p>" +
          '<p class="app-desc">' +
          escapeHtml(app.description) +
          "</p>" +
          '<div class="app-foot"><span class="' +
          badgeClass(app.badge) +
          '">' +
          escapeHtml(app.badge || app.status || "New") +
          "</span>" +
          '<span class="app-price">' +
          escapeHtml(app.price || "Contact on Telegram") +
          "</span></div>" +
          "</article>"
        );
      })
      .join("");
  }

  function findApp(id) {
    for (var i = 0; i < state.apps.length; i++) {
      if (state.apps[i].id === id) return state.apps[i];
    }
    return null;
  }

  function openModal(app) {
    if (!app) return;
    modalIcon.textContent = app.icon || "📦";
    modalTitle.textContent = app.name;
    modalMeta.textContent = app.category + " • " + (app.status || app.badge || "Available");
    modalDesc.textContent = app.description || "";
    modalDescEn.textContent = app.description_en || "";
    modalPrice.textContent = "Price: " + (app.price || "Contact on Telegram") + " • Install via Telegram @cyberkingsohag";
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
  }

  function init() {
    // Category chips
    document.getElementById("categoryChips").addEventListener("click", function (event) {
      var btn = event.target.closest(".chip");
      if (!btn) return;
      state.category = btn.getAttribute("data-category");
      var chips = document.querySelectorAll(".chip");
      for (var i = 0; i < chips.length; i++) chips[i].classList.remove("active");
      btn.classList.add("active");
      render();
    });

    // Live search
    searchInput.addEventListener("input", function () {
      state.query = searchInput.value;
      render();
    });

    // Sort
    sortSelect.addEventListener("change", function () {
      state.sort = sortSelect.value;
      render();
    });

    // Open detail modal from grid cards, and from hero button
    grid.addEventListener("click", function (event) {
      var card = event.target.closest(".app-card");
      if (card) openModal(findApp(card.getAttribute("data-id")));
    });
    grid.addEventListener("keydown", function (event) {
      if (event.key !== "Enter") return;
      var card = event.target.closest(".app-card");
      if (card) openModal(findApp(card.getAttribute("data-id")));
    });
    document.querySelectorAll("[data-open-app]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        openModal(findApp(btn.getAttribute("data-open-app")));
      });
    });

    document.getElementById("modalClose").addEventListener("click", closeModal);
    document.getElementById("modalCloseBtn").addEventListener("click", closeModal);
    modal.addEventListener("click", function (event) {
      if (event.target === modal) closeModal();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeModal();
    });

    // Add App form — saves to localStorage only
    document.getElementById("addAppForm").addEventListener("submit", function (event) {
      event.preventDefault();
      var name = document.getElementById("newName").value.trim();
      var category = document.getElementById("newCategory").value;
      var icon = document.getElementById("newIcon").value.trim() || "📦";
      var description = document.getElementById("newDescription").value.trim();
      var note = document.getElementById("addAppNote");
      if (!name || !description) {
        note.textContent = "নাম ও বিবরণ দিন। / Please fill in name and description.";
        return;
      }
      var app = {
        id: "local-" + Date.now(),
        name: name,
        category: category,
        icon: icon,
        description: description,
        description_en: "",
        price: "Contact on Telegram",
        status: "Available",
        badge: "New"
      };
      var localApps = loadLocalApps();
      localApps.push(app);
      saveLocalApps(localApps);
      state.apps.push(app);
      render();
      event.target.reset();
      document.getElementById("newIcon").value = "📦";
      note.textContent =
        "✅ \"" + name + "\" যোগ হয়েছে — শুধু এই ব্রাউজারে। স্থায়ী করতে apps.json-এ যোগ করে GitHub-এ আপলোড করুন।";
    });

    document.getElementById("clearLocalApps").addEventListener("click", function () {
      try {
        localStorage.removeItem(LOCAL_KEY);
      } catch (e) {
        // Ignore storage errors.
      }
      state.apps = state.apps.filter(function (app) {
        return String(app.id).indexOf("local-") !== 0;
      });
      document.getElementById("addAppNote").textContent = "আপনার যোগ করা অ্যাপগুলো মুছে দেওয়া হয়েছে।";
      render();
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
        render();
      })
      .catch(function () {
        state.apps = loadLocalApps();
        countEl.textContent = "apps.json লোড হয়নি। / apps.json could not be loaded.";
        render();
      });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
