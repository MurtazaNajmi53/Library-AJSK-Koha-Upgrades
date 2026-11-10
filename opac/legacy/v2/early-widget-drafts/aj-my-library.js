/* =====================================================================
   Maktabat Aljamea (Sindh) — "My library" card on the OPAC home page
   Paste into: Administration > System preferences > OPACUserJS
   Needs: an element with id="aj-my-library" (see the HTML block),
          opacreadinghistory = Allow, OPACUserSummary = Don't show.
   Tested against Koha 25.11 page markup.
   ===================================================================== */
(function () {
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

    var nameEl = document.querySelector(".loggedinusername[data-borrowernumber]");
    var userId = (typeof logged_in_user_id !== "undefined" && logged_in_user_id) ||
                 (nameEl && nameEl.getAttribute("data-borrowernumber"));
    if (!userId) { box.hidden = true; return; }

    box.setAttribute("aria-busy", "true");
    var today = todayISO();
    load(userId, today)
      .then(function (data) { draw(box, nameEl ? nameEl.textContent.trim() : "", data); })
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
})();
