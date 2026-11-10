/* ==========================================================================
   Maktabat Aljamea (Sindh) — OPACUserJS for Koha 25.11  (FINAL, consolidated)
   Paste this whole file into:
   Administration › System preferences › OPACUserJS
   Works with FINAL_OPACUserCSS.css and FINAL_OpacMainUserBlock.html.

   PART A. Header (first name, Lists in account menu, Cart), "ITS Number"
           label, page loader — every page
   PART B. "My library" card — home page
   PART C. "New in the library" and "Most borrowed" — home page

   Each part is fenced off, so if one fails the others still run.
   Settings for each part are at the top of that part.
   ========================================================================== */

// Shared between parts (part A fills it in, part B reads it)
window.ajOpac = window.ajOpac || {};

/* PART A. Header, login label and page loader
   ========================================================================== */
try { (function () {
  "use strict";

  /* 1. Settings — change values here, not further down
     ------------------------------------------------------------------------ */
  var AJ = {
    // Login label, in place of Koha's "Card number"
    loginLabel: "ITS Number",

    // Words skipped at the start of a name in the account menu.
    // Lower case; full stops are ignored ("Dr." matches "dr").
    honorifics: [
      "mulla", "shaikh", "sheikh", "shk", "syedi", "sayedi",
      "janab", "dr", "bhai", "bhaisaheb", "mr", "mrs", "ms", "miss"
    ],

    // Shown if nothing is left of the name after trimming
    nameFallback: "Your account",

    // Hide the loader if the page still hasn't changed after this long
    // (for example, a link that downloaded a file instead of opening a page)
    loaderTimeout: 10000,

    // Links and forms that download files or open pop-ups: no loader
    noLoader: /opac-export\.pl|opac-download|opac-sendbasket|opac-sendshelf|opac-basket\.pl|[?&]format=|\.(pdf|mrc|xml|ris|bib|txt|csv|zip)(\?|$)/i
  };

  var root = document.documentElement;

  function safely(fn) {
    try {
      fn();
    } catch (err) {
      if (window.console) console.warn("OPACUserJS:", err);
    }
  }


  /* 2. Account menu: first name only
     "Welcome, 30454007-Mulla Murtaza Shaikh Mustafa Najmi" → "Welcome, Murtaza"
     ------------------------------------------------------------------------ */
  function firstName(fullName) {
    // Drop ITS numbers (5 or more digits), with any dash after them
    var words = fullName.replace(/\b\d{5,}\b\s*[-–—]?\s*/g, " ").split(/\s+/);
    for (var i = 0; i < words.length; i++) {
      var word = words[i].replace(/[.,]+/g, "");
      if (!word) continue;
      if (AJ.honorifics.indexOf(word.toLowerCase()) !== -1) continue;
      return word;
    }
    return "";
  }

  safely(function () {
    var label = document.querySelector("#user-menu .userlabel");
    if (!label) return;
    var text = label.textContent.replace(/\s+/g, " ").trim();
    var match = text.match(/^(Welcome,?)\s*(.*)$/i);
    var prefix = match ? match[1].replace(/,?$/, ", ") : "";
    var name = firstName(match ? match[2] : text);
    window.ajOpac.firstName = name;   // the "My library" card uses this too
    label.textContent = name ? prefix + name : AJ.nameFallback;
  });


  /* 3. Login forms: "ITS Number" instead of "Card number"
     (the login page and the pop-up login box)
     ------------------------------------------------------------------------ */
  safely(function () {
    ["userid", "muserid"].forEach(function (id) {
      var label = document.querySelector('label[for="' + id + '"]');
      if (label && /card number/i.test(label.textContent)) {
        label.textContent = AJ.loginLabel + ":";
      }
    });
  });


  /* 4. Lists move into the account menu; Cart moves after it
     ------------------------------------------------------------------------ */
  safely(function () {
    var members = document.getElementById("members");
    var userMenu = document.getElementById("loggedinuser-menu");
    var accountItem = document.getElementById("user-menu");
    if (!members || !userMenu || !accountItem) return; // not logged in
    accountItem = accountItem.closest("li");

    // Koha's own account links get the menu style (and arrow-key support)
    userMenu.querySelectorAll("a").forEach(function (a) {
      a.classList.add("dropdown-item");
    });

    // Lists: take everything out of the old Lists menu
    var listsLink = document.getElementById("listsmenu");
    if (listsLink) {
      var listsItem = listsLink.closest("li");
      var listsMenu = listsItem.querySelector(".dropdown-menu");
      var group = document.createElement("div");
      group.className = "aj-menu-lists";
      group.setAttribute("role", "group");
      group.setAttribute("aria-label", "Lists");
      while (listsMenu && listsMenu.firstChild) {
        group.appendChild(listsMenu.firstChild);
      }
      // Before "Log out" (or at the end if Koha ever drops that link)
      var logout = document.getElementById("logout");
      userMenu.insertBefore(group, logout && logout.parentNode === userMenu ? logout : null);
      listsItem.remove();
    }

    // Cart: right of the account menu
    var cartLink = document.getElementById("cartmenulink");
    if (cartLink) {
      var cartItem = cartLink.closest("li");
      cartItem.classList.add("aj-cart-item");
      accountItem.after(cartItem);
    }

    // Remove the old bar if nothing is left in it
    var oldBar = document.getElementById("cart-list-nav");
    if (oldBar && !oldBar.querySelector(".nav-item")) oldBar.remove();
  });


  /* 5. Page loader: rosette in a copper ring
     Shown when a link or form opens another catalogue page. CSS waits
     0.4 seconds before showing it, so quick pages never flash it.
     ------------------------------------------------------------------------ */
  safely(function () {
    var loader = document.createElement("div");
    loader.id = "aj-loader";
    loader.setAttribute("role", "status");
    loader.innerHTML =
      '<span class="aj-loader-mark" aria-hidden="true"></span>' +
      '<span class="visually-hidden aj-loader-text"></span>';
    document.body.appendChild(loader);

    var message = loader.querySelector(".aj-loader-text");
    var stopTimer, speakTimer;

    function start() {
      root.classList.add("aj-loading");
      clearTimeout(stopTimer);
      clearTimeout(speakTimer);
      stopTimer = setTimeout(stop, AJ.loaderTimeout);
      // Screen readers hear this only when the wait is noticeable
      speakTimer = setTimeout(function () {
        message.textContent = "Loading page";
      }, 400);
    }

    function stop() {
      root.classList.remove("aj-loading");
      clearTimeout(stopTimer);
      clearTimeout(speakTimer);
      message.textContent = "";
    }

    // Start only if nothing else on the page cancelled the click or submit
    // (Koha cancels them for Cart, Add to list, pop-ups and so on)
    function startUnlessCancelled(event) {
      setTimeout(function () {
        if (!event.defaultPrevented) start();
      }, 0);
    }

    function opensCataloguePage(link, event) {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
      if (link.target && link.target !== "_self") return false;
      if (link.hasAttribute("download") || link.hasAttribute("data-bs-toggle")) return false;
      var href = link.getAttribute("href");
      if (!href || href.charAt(0) === "#") return false;
      var url;
      try {
        url = new URL(link.href, location.href);
      } catch (err) {
        return false;
      }
      if (url.origin !== location.origin) return false; // other sites, mailto:
      if (url.pathname === location.pathname && url.search === location.search && url.hash) return false;
      return !AJ.noLoader.test(url.pathname + url.search);
    }

    document.addEventListener("click", function (event) {
      var link = event.target.closest ? event.target.closest("a[href]") : null;
      if (link && opensCataloguePage(link, event)) startUnlessCancelled(event);
    });

    document.addEventListener("submit", function (event) {
      var form = event.target;
      if (form.target && form.target !== "_self") return;
      if (AJ.noLoader.test(form.getAttribute("action") || "")) return;
      startUnlessCancelled(event);
    });

    // Back/forward can show a saved copy of the page with the loader still on
    window.addEventListener("pageshow", stop);

    // Escape or a click hides it
    loader.addEventListener("click", stop);
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") stop();
    });
  });

  // Tell the CSS the changes are done (ends the anti-flash hiding)
  root.classList.add("aj-ready");
})(); } catch (err) { if (window.console) console.warn("OPACUserJS part A:", err); }


/* PART B. "My library" card on the home page
   Needs: the box with id="aj-my-library" (FINAL_OpacMainUserBlock.html),
          opacreadinghistory = Allow, OPACUserSummary = Don't show.
   ========================================================================== */
try { (function () {
  "use strict";

  /* ---------- Settings (the only part you should need to edit) ---------- */
  var SETTINGS = {
    // Academic year in the Misri calendar: 5 Shawwal (month 10) to 29 Rajab (month 7) of the next year
    startMonth: 10, startDay: 5,
    endMonth: 7, endDay: 29,
    dueSoonDays: 7,      // "Due soon" window
    cacheMinutes: 10     // how long to reuse data within one browser tab
  };

  var TEXT = {
    loading: "Loading your account…",
    welcome: "Welcome, ",
    booksOne: "book borrowed",
    booksMany: "books borrowed",
    thisYear: "This academic year",
    lastYear: "Last academic year (the new year starts on 5 Shawwal)",
    countNote: "Counts books returned this year plus books you have now.",
    checkedOut: "Checked out",
    dueSoon: "Due in the next " + SETTINGS.dueSoonDays + " days",
    overdue: "Overdue",
    ready: "Ready to collect",
    holds: "Holds",
    historyOff: "Reading history is turned off, so the yearly count is not available.",
    loggedOut: "Your session has ended. Log in again to see your account.",
    failed: "Your account details could not be loaded. Open Your summary to see them.",
    summaryLink: "Your summary"
  };

  var MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var MONTHS_HIJRI = ["Muharram", "Safar", "Rabi al-Awwal", "Rabi al-Akhar", "Jumada al-Ula", "Jumada al-Ukhra",
                      "Rajab", "Shaban", "Ramadan", "Shawwal", "Zul Qadah", "Zul Hijjah"];

  /* ---------- Misri (Dawoodi Bohra) tabular calendar ---------- */
  var EPOCH = 1948084, YEAR_DAYS = 10631 / 30, SHIFT = 8.01 / 60;

  function toJD(y, m, d) {
    if (m < 3) { y -= 1; m += 12; }
    var a = Math.floor(y / 100), b = 2 - a + Math.floor(a / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + b - 1524;
  }
  function jdToISO(jd) {                      // JD 2440588 = 1970-01-01
    return new Date((jd - 2440588) * 86400000).toISOString().slice(0, 10);
  }
  function misriFromJD(jd) {
    var z = jd - EPOCH, cyc = Math.floor(z / 10631);
    z -= 10631 * cyc;
    var j = Math.floor((z - SHIFT) / YEAR_DAYS);
    var hy = 30 * cyc + j;
    z -= Math.floor(j * YEAR_DAYS + SHIFT);
    var hm = Math.floor((z + 28.5001) / 29.5);
    if (hm === 13) { hm = 12; }
    return { y: hy, m: hm, d: z - Math.floor(29.5001 * hm - 29) };
  }
  function misriToJD(hy, hm, hd) {             // exact inverse of misriFromJD
    return EPOCH + Math.floor(hy * YEAR_DAYS + SHIFT) + Math.floor(29.5001 * hm - 29) + hd;
  }

  function todayISO() {
    var n = new Date();
    return n.getFullYear() + "-" + String(n.getMonth() + 1).padStart(2, "0") + "-" + String(n.getDate()).padStart(2, "0");
  }
  function isoToJD(iso) {
    var p = iso.split("-");
    return toJD(+p[0], +p[1], +p[2]);
  }

  // The academic year that contains today; in the holiday gap, the year that just ended.
  function academicYear(iso) {
    var h = misriFromJD(isoToJD(iso));
    var startY = (h.m * 100 + h.d >= SETTINGS.startMonth * 100 + SETTINGS.startDay) ? h.y : h.y - 1;
    var start = jdToISO(misriToJD(startY, SETTINGS.startMonth, SETTINGS.startDay));
    var end = jdToISO(misriToJD(startY + 1, SETTINGS.endMonth, SETTINGS.endDay));
    return { hijriStart: startY, start: start, end: end, ended: iso > end };
  }

  function prettyDate(iso) {
    var p = iso.split("-");
    return +p[2] + " " + MONTHS_EN[+p[1] - 1] + " " + p[0];
  }
  function prettyHijri(iso) {
    var h = misriFromJD(isoToJD(iso));
    return h.d + " " + MONTHS_HIJRI[h.m - 1] + " " + h.y;
  }

  /* ---------- Reading data from Koha pages ---------- */
  function getPage(url) {
    return fetch(url, { credentials: "same-origin" }).then(function (r) {
      if (!r.ok) { return { status: r.status, doc: null, url: r.url }; }
      return r.text().then(function (html) {
        return { status: r.status, doc: new DOMParser().parseFromString(html, "text/html"), url: r.url };
      });
    });
  }
  function isLoginPage(doc) {
    return !!(doc && (doc.getElementById("opac-auth") || doc.getElementById("opac-login-page")));
  }

  function readSummary(doc, today) {
    var soonLimit = jdToISO(isoToJD(today) + SETTINGS.dueSoonDays);
    var out = { checkedOut: 0, dueSoon: 0, overdue: 0, holds: 0, ready: 0, charges: null };

    doc.querySelectorAll("#checkoutst tbody tr").forEach(function (tr) {
      out.checkedOut += 1;
      var cell = tr.querySelector("td.date_due");
      if (!cell) { return; }
      var due = (cell.getAttribute("data-order") || "").slice(0, 10);
      if (cell.classList.contains("overdue")) { out.overdue += 1; }
      else if (due && due <= soonLimit) { out.dueSoon += 1; }
    });

    doc.querySelectorAll("#holdst tbody tr").forEach(function (tr) {
      out.holds += 1;
      // "Item waiting at <strong>Library</strong>" is the only status with <strong> inside a <span>
      if (tr.querySelector("td.status > span > strong")) { out.ready += 1; }
    });

    var fines = doc.getElementById("opac-user-fines_panel");
    if (fines) {
      var cap = fines.querySelector("caption");
      var amt = fines.querySelector("a[href*='opac-account.pl']");
      if (amt) {
        out.charges = {
          label: cap ? cap.textContent.trim() : "Charges",
          amount: amt.textContent.trim(),
          isCredit: !!(cap && /credit/i.test(cap.textContent))
        };
      }
    }
    return out;
  }

  function countYear(doc, year) {
    var n = 0;
    doc.querySelectorAll("#readingrec tbody tr").forEach(function (tr) {
      var cells = tr.querySelectorAll("td[data-order]");
      if (!cells.length) { return; }
      var v = cells[cells.length - 1].getAttribute("data-order") || "";
      var d = v.slice(0, 10);
      if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
        if (d >= year.start && d <= year.end) { n += 1; }
      } else if (!year.ended) {
        n += 1;   // still checked out, counts for a running year
      }
    });
    return n;
  }

  function load(userId, today) {
    var key = "ajMyLibrary:" + userId + ":" + today;
    try {
      var saved = JSON.parse(sessionStorage.getItem(key) || "null");
      if (saved && Date.now() - saved.t < SETTINGS.cacheMinutes * 60000) { return Promise.resolve(saved.data); }
    } catch (e) { /* storage unavailable: just fetch */ }

    var year = academicYear(today);
    return Promise.all([
      getPage("/cgi-bin/koha/opac-user.pl"),
      getPage("/cgi-bin/koha/opac-readingrecord.pl?limit=full")
    ]).then(function (res) {
      var user = res[0], hist = res[1];
      if (!user.doc || isLoginPage(user.doc)) {
        return { state: user.doc ? "loggedOut" : "failed" };
      }
      var data = { state: "ok", year: year, summary: readSummary(user.doc, today), count: null };
      var histOff = !hist.doc || /404/.test(hist.url) || !hist.doc.getElementById("userreadingrecord");
      if (!histOff) { data.count = countYear(hist.doc, year); }
      try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), data: data })); } catch (e) { /* ignore */ }
      return data;
    });
  }

  /* ---------- Drawing the card ---------- */
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) { e.className = cls; }
    if (text !== undefined && text !== null) { e.textContent = text; }
    return e;
  }

  function statusRow(list, label, value, href, tone) {
    var li = el("li", "aj-ml__row" + (value ? "" : " is-zero") + (tone && value ? " is-" + tone : ""));
    var a = el("a", "aj-ml__link");
    a.href = href;
    a.appendChild(el("span", "aj-ml__label", label));
    a.appendChild(el("span", "aj-ml__value", String(value)));
    li.appendChild(a);
    list.appendChild(li);
  }

  function message(box, text) {
    box.textContent = "";
    var p = el("p", "aj-ml__message", text + " ");
    var a = el("a", null, TEXT.summaryLink);
    a.href = "/cgi-bin/koha/opac-user.pl";
    p.appendChild(a);
    box.appendChild(p);
  }

  function draw(box, name, data) {
    if (data.state === "loggedOut") { return message(box, TEXT.loggedOut); }
    if (data.state !== "ok") { return message(box, TEXT.failed); }

    var s = data.summary, y = data.year;
    box.textContent = "";

    if (name) {
      var hello = el("p", "aj-ml__hello", TEXT.welcome);
      var who = el("a", null, name);
      who.href = "/cgi-bin/koha/opac-user.pl";
      hello.appendChild(who);
      box.appendChild(hello);
    }

    var yearBox = el("div", "aj-ml__year");
    if (data.count === null) {
      yearBox.appendChild(el("p", "aj-ml__note", TEXT.historyOff));
    } else {
      var count = el("p", "aj-ml__count");
      count.appendChild(el("span", "aj-ml__num", String(data.count)));
      count.appendChild(el("span", "aj-ml__unit", data.count === 1 ? TEXT.booksOne : TEXT.booksMany));
      yearBox.appendChild(count);

      var term = el("p", "aj-ml__term");
      term.appendChild(el("span", "aj-ml__term-name", y.ended ? TEXT.lastYear : TEXT.thisYear));
      term.appendChild(el("span", "aj-ml__term-dates", prettyHijri(y.start) + " to " + prettyHijri(y.end)));
      term.appendChild(el("span", "aj-ml__term-dates", prettyDate(y.start) + " to " + prettyDate(y.end)));
      yearBox.appendChild(term);
      yearBox.appendChild(el("p", "aj-ml__note", TEXT.countNote));
    }
    box.appendChild(yearBox);

    var list = el("ul", "aj-ml__status");
    statusRow(list, TEXT.checkedOut, s.checkedOut, "/cgi-bin/koha/opac-user.pl?tab=opac-user-checkouts");
    statusRow(list, TEXT.dueSoon, s.dueSoon, "/cgi-bin/koha/opac-user.pl?tab=opac-user-checkouts", "soon");
    statusRow(list, TEXT.overdue, s.overdue, "/cgi-bin/koha/opac-user.pl?tab=opac-user-overdues", "alert");
    statusRow(list, TEXT.ready, s.ready, "/cgi-bin/koha/opac-user.pl?tab=opac-user-holds", "good");
    statusRow(list, TEXT.holds, s.holds, "/cgi-bin/koha/opac-user.pl?tab=opac-user-holds");
    if (s.charges) {
      var li = el("li", "aj-ml__row " + (s.charges.isCredit ? "is-good" : "is-alert"));
      var a = el("a", "aj-ml__link");
      a.href = "/cgi-bin/koha/opac-account.pl";
      a.appendChild(el("span", "aj-ml__label", s.charges.label));
      a.appendChild(el("span", "aj-ml__value", s.charges.amount));
      li.appendChild(a);
      list.appendChild(li);
    }
    box.appendChild(list);
  }

  /* ---------- Start ---------- */
  function start() {
    if (!document.body || document.body.id !== "opac-main") { return; }
    var box = document.getElementById("aj-my-library");
    if (!box) { return; }

    // Koha's .loggedinusername only says "Your account", so it is used for
    // the borrower number only; the first name comes from part A
    var nameEl = document.querySelector(".loggedinusername[data-borrowernumber]");
    var userId = (typeof logged_in_user_id !== "undefined" && logged_in_user_id) ||
                 (nameEl && nameEl.getAttribute("data-borrowernumber"));
    if (!userId) { box.hidden = true; return; }

    box.setAttribute("aria-busy", "true");
    var today = todayISO();
    load(userId, today)
      .then(function (data) { draw(box, window.ajOpac.firstName || "", data); })
      .catch(function () { message(box, TEXT.failed); })
      .then(function () { box.removeAttribute("aria-busy"); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

  // Exposed only so the logic can be tested; harmless on the live site.
  window.ajMyLibraryTest = { misriFromJD: misriFromJD, misriToJD: misriToJD, toJD: toJD, jdToISO: jdToISO,
                             academicYear: academicYear, readSummary: readSummary, countYear: countYear };
})(); } catch (err) { if (window.console) console.warn("OPACUserJS part B:", err); }


/* PART C. "New in the library" shelf and "Most borrowed" list
   Needs: the boxes with id="aj-new-books" and id="aj-popular"
          (FINAL_OpacMainUserBlock.html), and OpacTopissue = Allow.
   Search engine: Zebra.
   ========================================================================== */
try { (function () {
  "use strict";

  /* ---------- Settings ---------- */
  var SETTINGS = {
    newBooks: 15,          // books on the shelf
    popular: 10,           // titles in the list
    cacheMinutes: 30,      // library-wide data changes slowly
    // Zebra: match every record, newest acquisition (952$d) first
    newBooksQuery: "ccl=allrecords,AlwaysMatches=''",
    newBooksSort: "acqdate_dsc"
  };

  var TEXT = {
    newTitle: "New in the library",
    newAll: "See all new books",
    popTitle: "Most borrowed",
    popAll: "See the full list",
    loans1: "loan",
    loansN: "loans",
    prev: "Show earlier books",
    next: "Show more books",
    none: "Nothing to show yet.",
    failed: "This list could not be loaded. Refresh the page to try again."
  };

  /* ---------- Helpers ---------- */
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) { e.className = cls; }
    if (text !== undefined && text !== null) { e.textContent = text; }
    return e;
  }

  function getDoc(url) {
    return fetch(url, { credentials: "same-origin" }).then(function (r) {
      if (!r.ok) { throw new Error("HTTP " + r.status); }
      return r.text();
    }).then(function (html) {
      var doc = new DOMParser().parseFromString(html, "text/html");
      if (doc.getElementById("opac-auth") || doc.getElementById("opac-login-page")) {
        throw new Error("logged out");
      }
      return doc;
    });
  }

  function cached(key, loader) {
    try {
      var saved = JSON.parse(sessionStorage.getItem(key) || "null");
      if (saved && Date.now() - saved.t < SETTINGS.cacheMinutes * 60000) { return Promise.resolve(saved.data); }
    } catch (e) { /* no storage: just load */ }
    return loader().then(function (data) {
      try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), data: data })); } catch (e) { /* ignore */ }
      return data;
    });
  }

  // MARC titles often end with " /", " :" or " ="
  function tidy(s) {
    return (s || "").replace(/\s+/g, " ").replace(/[\s\/:;,=.]+$/, "").trim();
  }

  function detailUrl(bib) {
    return "/cgi-bin/koha/opac-detail.pl?biblionumber=" + encodeURIComponent(bib);
  }

  function heading(box, title, linkText, href) {
    var head = el("div", "aj-shelf__head");
    head.appendChild(el("h2", "aj-shelf__title", title));
    var more = el("a", "aj-shelf__more", linkText);
    more.href = href;
    head.appendChild(more);
    box.appendChild(head);
  }

  function fail(box, text) {
    var p = box.querySelector(".aj-shelf__status") || el("p", "aj-shelf__status");
    p.textContent = text;
    if (!p.parentNode) { box.appendChild(p); }
  }

  /* ---------- New books ---------- */
  var searchUrl = "/cgi-bin/koha/opac-search.pl?q=" + encodeURIComponent(SETTINGS.newBooksQuery) +
                  "&sort_by=" + SETTINGS.newBooksSort;

  function readNewBooks(doc) {
    var seen = {}, list = [];
    doc.querySelectorAll(".searchresults .bookcover[data-biblionumber]").forEach(function (c) {
      var bib = c.getAttribute("data-biblionumber");
      if (!bib || seen[bib] || list.length >= SETTINGS.newBooks) { return; }
      seen[bib] = true;
      list.push({
        bib: bib,
        title: tidy(c.getAttribute("data-title")),
        author: tidy(c.getAttribute("data-author")),
        isbn: (c.getAttribute("data-isbn") || "").trim()
      });
    });
    return list;
  }

  // Try Amazon (as the results page does), then Open Library.
  // If neither has a cover, remove the image so the bookplate shows.
  function addCover(frame, isbn) {
    if (!isbn) { return; }
    var sources = [
      "https://images-na.ssl-images-amazon.com/images/P/" + encodeURIComponent(isbn) + ".01.MZZZZZZZ.jpg",
      "https://covers.openlibrary.org/b/isbn/" + encodeURIComponent(isbn) + "-M.jpg?default=false"
    ];
    var img = el("img", "aj-shelf__img");
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
    var i = 0;
    function next() {
      i += 1;
      if (i < sources.length) { img.src = sources[i]; } else { img.remove(); }
    }
    img.addEventListener("error", next);
    img.addEventListener("load", function () {
      if (img.naturalWidth <= 1) { next(); }   // Amazon's "no cover" is a 1×1 pixel
    });
    img.src = sources[0];
    frame.appendChild(img);
  }

  function drawNewBooks(box, books) {
    box.textContent = "";
    heading(box, TEXT.newTitle, TEXT.newAll, searchUrl);
    if (!books.length) { return fail(box, TEXT.none); }

    var wrap = el("div", "aj-shelf__wrap");
    var track = el("ul", "aj-shelf__track");
    track.tabIndex = 0;
    track.setAttribute("aria-label", TEXT.newTitle);

    books.forEach(function (b) {
      var li = el("li", "aj-shelf__item");
      var a = el("a", "aj-shelf__link");
      a.href = detailUrl(b.bib);

      // Same element and data attributes as the search results,
      // so your bookplate styling draws the placeholder
      var plate = el("div", "bookcover aj-shelf__cover");
      plate.setAttribute("data-title", b.title);
      if (b.author) { plate.setAttribute("data-author", b.author); }
      addCover(plate, b.isbn);
      a.appendChild(plate);

      var cap = el("span", "aj-shelf__caption", b.title);
      cap.dir = "auto";
      a.appendChild(cap);
      if (b.author) {
        var by = el("span", "aj-shelf__byline", b.author);
        by.dir = "auto";
        a.appendChild(by);
      }
      li.appendChild(a);
      track.appendChild(li);
    });

    var prev = el("button", "aj-shelf__btn aj-shelf__btn--prev");
    var next = el("button", "aj-shelf__btn aj-shelf__btn--next");
    prev.type = next.type = "button";
    prev.setAttribute("aria-label", TEXT.prev);
    next.setAttribute("aria-label", TEXT.next);
    prev.appendChild(el("span", null, "‹")).setAttribute("aria-hidden", "true");
    next.appendChild(el("span", null, "›")).setAttribute("aria-hidden", "true");

    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function page(dir) {
      // RTL pages scroll the other way
      var rtl = getComputedStyle(track).direction === "rtl" ? -1 : 1;
      track.scrollBy({ left: dir * rtl * track.clientWidth * 0.9, behavior: reduce ? "auto" : "smooth" });
    }
    function update() {
      var max = track.scrollWidth - track.clientWidth - 8;
      var pos = Math.abs(track.scrollLeft);
      prev.disabled = pos <= 8;
      next.disabled = pos >= max;
    }
    prev.addEventListener("click", function () { page(-1); });
    next.addEventListener("click", function () { page(1); });
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    wrap.appendChild(prev);
    wrap.appendChild(track);
    wrap.appendChild(next);
    box.appendChild(wrap);
    update();
  }

  /* ---------- Most borrowed ---------- */
  var popularUrl = "/cgi-bin/koha/opac-topissues.pl?do_it=1&timeLimit=999&limit=" + (SETTINGS.popular * 2);

  // Koha lists a title once per collection code, so the same book can
  // appear twice. Add those rows together.
  function readPopular(doc) {
    var byBib = {}, order = [];
    doc.querySelectorAll("#topissuest tbody tr").forEach(function (tr) {
      var link = tr.querySelector("a.title");
      var countCell = tr.querySelector("td[data-order]");
      if (!link || !countCell) { return; }
      var m = /biblionumber=(\d+)/.exec(link.getAttribute("href") || "");
      if (!m) { return; }
      var count = parseInt(countCell.getAttribute("data-order"), 10) || 0;
      var p = link.parentNode.querySelector("p");
      // The line under the title starts with the author, then " - publisher"
      var author = p ? tidy(p.textContent.split(" - ")[0]) : "";
      if (byBib[m[1]]) { byBib[m[1]].count += count; return; }
      byBib[m[1]] = { bib: m[1], title: tidy(link.textContent), author: author, count: count };
      order.push(m[1]);
    });
    return order.map(function (k) { return byBib[k]; })
      .sort(function (a, b) { return b.count - a.count; })
      .slice(0, SETTINGS.popular);
  }

  function drawPopular(box, rows) {
    box.textContent = "";
    heading(box, TEXT.popTitle, TEXT.popAll, "/cgi-bin/koha/opac-topissues.pl");
    if (!rows.length) { return fail(box, TEXT.none); }
    var ol = el("ol", "aj-pop__list");
    rows.forEach(function (r) {
      var li = el("li", "aj-pop__item");
      var a = el("a", "aj-pop__link");
      a.href = detailUrl(r.bib);
      var t = el("span", "aj-pop__title", r.title);
      t.dir = "auto";
      a.appendChild(t);
      if (r.author) {
        var au = el("span", "aj-pop__author", r.author);
        au.dir = "auto";
        a.appendChild(au);
      }
      li.appendChild(a);
      li.appendChild(el("span", "aj-pop__count", r.count + " " + (r.count === 1 ? TEXT.loans1 : TEXT.loansN)));
      ol.appendChild(li);
    });
    box.appendChild(ol);
  }

  /* ---------- Start ---------- */
  function run(id, key, url, reader, drawer) {
    var box = document.getElementById(id);
    if (!box) { return; }
    box.setAttribute("aria-busy", "true");
    cached(key, function () { return getDoc(url).then(reader); })
      .then(function (data) { drawer(box, data); })
      .catch(function () { fail(box, TEXT.failed); })
      .then(function () { box.removeAttribute("aria-busy"); });
  }

  // If the right-hand column has nothing in it, let the main column use its space
  function widenMain() {
    var main = document.querySelector("#opac-main .maincontent");
    var row = main && main.parentNode;
    if (!row) { return; }
    Array.prototype.forEach.call(row.children, function (col) {
      if (col !== main && /\bcol-lg-3\b/.test(col.className) && !col.children.length) {
        col.classList.add("aj-right-col");
        row.classList.add("aj-no-right");
      }
    });
  }

  function start() {
    if (!document.body || document.body.id !== "opac-main") { return; }
    if (!document.querySelector(".loggedinusername")) { return; }
    widenMain();
    run("aj-new-books", "ajNewBooks:v1", searchUrl, readNewBooks, drawNewBooks);
    run("aj-popular", "ajPopular:v1", popularUrl, readPopular, drawPopular);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

  window.ajShelvesTest = { readNewBooks: readNewBooks, readPopular: readPopular, tidy: tidy,
                           searchUrl: searchUrl, popularUrl: popularUrl };
})(); } catch (err) { if (window.console) console.warn("OPACUserJS part C:", err); }
