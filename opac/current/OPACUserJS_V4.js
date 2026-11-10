/* ==========================================================================
   Maktabat Aljamea (Sindh) — OPACUserJS for Koha 25.11   (v4, 20 Sep 2026)

   Paste this whole file into:
   Administration › System preferences › OPACUserJS

   Goes with  OPACUserCSS_V3.css        (OPACUserCSS)
              OpacMainUserBlock_V3.html (HTML customizations)

   PART 0. Early work — starts the network requests before anything else
   PART A. Header, "ITS Number" label, page-loading rosette — every page
   PART B. "My library" card      — home page, middle column
   PART C. "New in the library"   — home page, left column
   PART D. "Library information"  — home page, right column (Koha News)

   WHAT CHANGED IN v4 — three fixes found against the live catalogue
   -----------------------------------------------------------------
   1. THE BUG THAT BROKE BOTH WIDGETS. isLoginPage() decided whether a
      fetched page was the login screen by searching the raw HTML for the
      text  id="opac-auth" .  Koha inlines OPACUserJS into EVERY OPAC page
      (opac-bottom.inc), so every page this script fetched contained this
      script — including that very string, sitting in isLoginPage's own
      source. The test was therefore true for every page, always. The
      account card said "Your session has ended" and the shelf said "This
      list could not be loaded", while the reader was plainly logged in.
      v3 introduced this: v1.2 asked a parsed document for the element,
      which never matched text inside a <script>. It now reads the id off
      the <body> tag instead — which Koha writes in UPPERCASE ("ID="),
      so the match is case-insensitive.

   2. The search results container has no id. Real Koha markup is
      <div class="searchresults"> ... <table class="table table-striped">.
      v3 looked for a table with id="searchresults", never found one, and
      fell back to parsing the whole ~1 MB results page twice. Slicing now
      takes any attribute as its marker, so it targets the class.

   3. Account counts now come from the tab labels — "Checked out (3)",
      "Overdue (1)", "Holds (2)", "Charges (Rs 120.00)". Koha prints the
      count there whether or not the matching table exists; a patron with
      nothing on loan gets a label and no table at all. Counting table
      rows alone reported zero for everyone with an empty tab. Row
      counting is kept as a fallback.

   WHAT CHANGED IN v3
   ------------------
   * This file now stops immediately on the self-checkout screen. Koha
     includes OPACUserJS on sco-main.pl as well, so until now the kiosk
     was running the header rewriting and the page loader for nothing.
     The kiosk is handled by SCOUserJS instead.
   * The three page requests the home page needs now start at the top of
     this file instead of after DOMContentLoaded, and they run together.
   * The "My library" card draws as soon as the account page arrives.
     The yearly count fills in afterwards, so a slow reading history no
     longer holds up the whole card.
   * Only the parts of each fetched page that are actually needed are
     handed to the HTML parser, instead of the whole page.
   * The new-books list is kept in localStorage for six hours. It is the
     same list for everyone, so only the first reader of the day waits.
     Anything personal still uses sessionStorage, which the browser
     clears when the tab closes — important on shared machines.
   * The rosette is positioned against the *visual* viewport, so it is
     centred on what the reader can actually see. This is the fix for
     the rosette going missing on phones.
   ========================================================================== */

window.ajOpac = window.ajOpac || {};

/* The "New in the library" search, built here so PART 0 can start the
   request before PART C has run.

   Two shapes, chosen by CFG.newBooksHideMode (see PART 0):

   "any-copy"   — Zebra is asked to leave the unwanted records out:
                  ...AlwaysMatches='' not notforloan=3
                  Exact, because it matches the authorised value CODE, and
                  fastest, because the records never travel. Koha indexes
                  952$7 into the numeric "notforloan" index
                  (etc/zebradb/ccl.properties: notforloan 1=8008 4=109).
                  Only a handful of extra records need fetching, since
                  nothing has to be thrown away afterwards.

   "all-copies" — the plain search, filtered here afterwards. Needed
                  because the Zebra index is record-level: it cannot say
                  "this record has at least one copy that is NOT code 3".
                  Costs a bigger page, because records are fetched and
                  then discarded.

   plain:true forces the second shape. PART C uses it as a fallback if
   the CCL query ever errors or comes back empty. */
window.ajOpac.newBooksSearchUrl = function (opts) {
  var cfg = window.ajOpac.CFG || {};
  var codes = (cfg.newBooksHideNotForLoan || []).filter(function (c) {
    return c !== null && c !== "" && isFinite(c);
  });
  var byCode = !(opts && opts.plain) && cfg.newBooksHideMode === "any-copy" && codes.length > 0;

  var q = "ccl=allrecords,AlwaysMatches=''";
  if (byCode) {
    q += codes.map(function (c) { return " not notforloan=" + Number(c); }).join("");
  }
  return "/cgi-bin/koha/opac-search.pl" +
         "?q=" + encodeURIComponent(q) +
         "&sort_by=acqdate_dsc" +
         "&count=" + (byCode ? (cfg.newBooks || 12) + 4 : (cfg.newBooksFetch || 40));
};
window.ajOpac.newBooksByCode = function () {
  var cfg = window.ajOpac.CFG || {};
  return cfg.newBooksHideMode === "any-copy" &&
         (cfg.newBooksHideNotForLoan || []).length > 0;
};

/* PART 0. Early work
   ==========================================================================
   Koha puts OPACUserJS at the end of <body>, so the page's own HTML has
   already arrived. Starting the fetches here — rather than waiting for
   DOMContentLoaded — buys back a few hundred milliseconds, and lets all
   three run at the same time instead of one after another.
   ========================================================================== */
try { (function () {
  "use strict";

  var aj = window.ajOpac;

  /* --- Stop here on the self-checkout screen -----------------------------
     sco-main.tt includes opac-bottom.inc, which runs OPACUserJS on the
     kiosk too. Nothing below this line belongs there. */
  aj.isSco = !!document.getElementById("sco_main") ||
             (document.body && document.body.id === "sco_main");
  if (aj.isSco) { aj.stop = true; return; }

  aj.isHome     = !!(document.body && document.body.id === "opac-main");
  aj.isLoggedIn = !!document.querySelector(".loggedinusername");

  /* --- Shared settings for the home page widgets ----------------------- */
  aj.CFG = {
    // "New in the library"
    newBooks:        12,   // how many covers to show
    newBooksCacheHrs: 6,   // how long to keep the list in localStorage

    /* LEAVING "In-Stock" BOOKS OFF THE SHELF
       ---------------------------------------------------------------
       "In-Stock" is authorised value 3 in the NOT_LOAN list: the book is
       held but is not out on the shelves to be browsed, so it has no
       business in a "New in the library" display.

       newBooksHideNotForLoan — the authorised value CODES to leave out.
       Used in the search itself: Koha indexes item subfield 952$7 into
       Zebra's numeric "notforloan" index, so the query can simply say
       "not notforloan=3" and the records never even travel. Matching on
       the code means renaming the status in Koha cannot break this. */
    newBooksHideNotForLoan: [3],

    /* newBooksHideMode
       "any-copy"   (default) leave the record out if ANY copy carries the
                    code. Exact and fastest — Zebra does the work.
       "all-copies" leave it out only when NO copy is available to a
                    reader, so a title with three In-Stock copies and one
                    on the open shelves still appears. Zebra's index is
                    record-level and cannot express this, so the filtering
                    happens here instead, on a larger page of results. */
    newBooksHideMode: "any-copy",

    // How many results to ask for in "all-copies" mode, before filtering
    newBooksFetch:   40,

    /* Only used by "all-copies" mode, and by the fallback described in
       PART C. Koha's search results print a not-for-loan status as the
       authorised value's OPAC DESCRIPTION, never its code (see
       C4/XSLT.pm), so text is all there is to match on here. Matching
       ignores case, spaces, hyphens and underscores, so "In-Stock",
       "In Stock" and "in_stock" are all the same entry.
       Keep this in step with the description of code 3 in Koha. */
    newBooksHideStatusText: ["In-Stock"],

    // "My library"
    dueSoonDays:     7,
    accountCacheMin: 10,

    // "Library information"
    newsItems:       6     // most recent Koha news items to show
  };

  /* --- Small fetch helper ----------------------------------------------
     Returns the raw HTML text. Nothing is parsed here; parsing happens
     later, on the small slice of the page that is actually wanted. */
  function grab(url, opts) {
    var init = { credentials: "same-origin" };
    if (opts && opts.low) {
      // Tells the browser this one may wait behind more important work.
      // Ignored by browsers that don't know the option.
      try { init.priority = "low"; } catch (e) { /* ignore */ }
    }
    return fetch(url, init).then(function (r) {
      return r.text().then(function (html) {
        return { ok: r.ok, status: r.status, url: r.url, html: html };
      });
    });
  }
  aj.grab = grab;

  /* --- Cache helpers ----------------------------------------------------
     sessionStorage  — anything about this reader. Cleared when the tab
                       closes, which matters on shared library machines.
     localStorage    — library-wide lists only. Never anything personal.
     Every call is wrapped: private browsing makes these throw. */
  function readCache(store, key, maxAgeMs) {
    try {
      var raw = window[store].getItem(key);
      if (!raw) { return null; }
      var saved = JSON.parse(raw);
      if (!saved || Date.now() - saved.t > maxAgeMs) { return null; }
      return saved.d;
    } catch (e) { return null; }
  }
  function writeCache(store, key, data) {
    try { window[store].setItem(key, JSON.stringify({ t: Date.now(), d: data })); }
    catch (e) { /* full, or unavailable */ }
  }
  aj.readCache = readCache;
  aj.writeCache = writeCache;

  /* --- Take one element out of a page, without parsing the whole page ---
     Koha's account page and search results run to several hundred
     kilobytes. Handing all of that to DOMParser costs real time on a
     phone. These find the one element that is wanted and parse only it.

     Falls back to parsing the whole document if the slice looks wrong,
     so a change in Koha's markup can slow this down but cannot break it. */
  function sliceElement(html, tag, marker) {
    /* marker is the attribute text that identifies the element, e.g.
       'id="readingrec"' or 'class="searchresults"'. It is not always an
       id: Koha's search results table carries no id at all.

       html.indexOf finds the FIRST occurrence, which is always the real
       element — Koha inlines this very script at the end of <body>, so
       any copy of the marker inside the script source comes later. */
    var at = html.indexOf(marker);
    if (at === -1) { return null; }

    // Walk back to the "<" that opens this element's start tag
    var open = html.lastIndexOf("<" + tag, at);
    if (open === -1) { return null; }

    // Walk forward, counting nested elements of the same name
    var openTag  = "<" + tag;
    var closeTag = "</" + tag;
    var depth = 0, i = open;
    while (i < html.length) {
      var nextOpen  = html.indexOf(openTag, i);
      var nextClose = html.indexOf(closeTag, i);
      if (nextClose === -1) { return null; }
      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth += 1;
        i = nextOpen + openTag.length;
      } else {
        depth -= 1;
        i = nextClose + closeTag.length;
        if (depth === 0) {
          return html.slice(open, html.indexOf(">", i - 1) + 1 || i);
        }
      }
    }
    return null;
  }

  var parser = new DOMParser();

  /* Parse one element out of a page.
       tag      — the element's tag name, used to find its bounds
       marker   — attribute text that identifies it, e.g. 'id="readingrec"'
       selector — how to pick it out once parsed, e.g. '#readingrec'
     Wrapping matters for table parts: a bare <tbody> is thrown away
     unless it sits inside a <table>. */
  function parsePart(html, tag, marker, selector) {
    var part = sliceElement(html, tag, marker);
    if (part) {
      var frag = parser.parseFromString(
        tag === "table" ? part : "<div>" + part + "</div>", "text/html");
      var found = frag.querySelector(selector);
      if (found) { return found; }
    }
    // Slicing didn't work — parse the whole page instead.
    return parser.parseFromString(html, "text/html").querySelector(selector);
  }
  aj.parsePart = parsePart;

  /* Is this fetched page Koha's login screen?

     THIS IS THE v4 FIX. v3 searched the raw HTML for the text
     id="opac-auth" — but Koha inlines OPACUserJS into every OPAC page,
     so every page this script fetches contains this script, and that
     string sat in this very function's source. The answer was therefore
     always yes, and both widgets reported a dead session.

     The body tag is the reliable signal: Koha's bodytag.inc gives the
     login screen ID="opac-login-page" and nothing else does. Two details
     matter — bodytag.inc writes the attribute in UPPERCASE, hence the
     /i flag; and the first <body in a document is the real one, so a
     later copy of this pattern inside the inlined script cannot win. */
  function bodyId(html) {
    var m = /<body\s[^>]*?\bid\s*=\s*["']([^"']*)["']/i.exec(html);
    return m ? m[1].toLowerCase() : "";
  }
  function isLoginPage(html) {
    var id = bodyId(html);
    return id === "opac-login-page" || id === "opac-auth";
  }
  aj.bodyId = bodyId;
  aj.isLoginPage = isLoginPage;

  /* --- Start the requests ----------------------------------------------- */
  aj.pending = {};

  if (aj.isHome && aj.isLoggedIn) {
    // The reader's own account: needed for the card's status rows.
    aj.pending.account = grab("/cgi-bin/koha/opac-user.pl");

    // The reading history: only needed for the yearly count, and it is
    // by far the heaviest page of the three, so it goes at low priority
    // and the card no longer waits for it.
    aj.pending.history = grab("/cgi-bin/koha/opac-readingrecord.pl?limit=full",
                              { low: true });

    // New books: skip the request altogether if the cached list is fresh.
    var booksKey = "ajNewBooks:v3";
    var booksHit = readCache("localStorage", booksKey,
                             aj.CFG.newBooksCacheHrs * 3600000);
    aj.newBooksKey = booksKey;
    aj.newBooksCached = booksHit;
    aj.newBooksExcludedByCode = aj.newBooksByCode();
    if (!booksHit) {
      aj.pending.books = grab(aj.newBooksSearchUrl());
    }
  }

  /* --- Warm up the connections the covers will need ---------------------
     Three DNS lookups and TLS handshakes that would otherwise happen
     one at a time, at the moment the first cover image is requested. */
  if (aj.isHome && aj.isLoggedIn) {
    ["https://images-na.ssl-images-amazon.com", "https://covers.openlibrary.org"]
      .forEach(function (host) {
        var link = document.createElement("link");
        link.rel = "preconnect";
        link.href = host;
        link.crossOrigin = "";
        document.head.appendChild(link);
      });
  }
})(); } catch (err) { if (window.console) console.warn("OPACUserJS part 0:", err); }


/* PART A. Header, login label and page loader
   ========================================================================== */
try { (function () {
  "use strict";
  if (window.ajOpac.stop) { return; }

  var AJ = {
    loginLabel: "ITS Number",

    // Words skipped at the start of a name in the account menu.
    // Lower case; full stops are ignored ("Dr." matches "dr").
    honorifics: [
      "mulla", "shaikh", "sheikh", "shk", "syedi", "sayedi",
      "janab", "dr", "bhai", "bhaisaheb", "mr", "mrs", "ms", "miss"
    ],
    nameFallback: "Your account",

    // Hide the loader if the page still hasn't changed after this long
    loaderTimeout: 10000,

    // How long a page may take before the rosette appears
    loaderDelay: 400,

    // Links and forms that download files or open pop-ups: no loader
    noLoader: /opac-export\.pl|opac-download|opac-sendbasket|opac-sendshelf|opac-basket\.pl|[?&]format=|\.(pdf|mrc|xml|ris|bib|txt|csv|zip)(\?|$)/i
  };

  var root = document.documentElement;

  function safely(fn) {
    try { fn(); }
    catch (err) { if (window.console) console.warn("OPACUserJS:", err); }
  }

  /* 1. Account menu: first name only
     "Welcome, 30454007-Mulla Murtaza Shaikh Mustafa Najmi" → "Welcome, Murtaza"
     ------------------------------------------------------------------------ */
  function firstName(fullName) {
    // Drop ITS numbers (5 or more digits), with any dash after them
    var words = fullName.replace(/\b\d{5,}\b\s*[-–—]?\s*/g, " ").split(/\s+/);
    for (var i = 0; i < words.length; i++) {
      var word = words[i].replace(/[.,]+/g, "");
      if (!word) { continue; }
      if (AJ.honorifics.indexOf(word.toLowerCase()) !== -1) { continue; }
      return word;
    }
    return "";
  }
  window.ajOpac.firstName_ = firstName;   // SCOUserJS-style trimming, reused below

  safely(function () {
    var label = document.querySelector("#user-menu .userlabel");
    if (!label) { return; }
    var text = label.textContent.replace(/\s+/g, " ").trim();
    var match = text.match(/^(Welcome,?)\s*(.*)$/i);
    var prefix = match ? match[1].replace(/,?$/, ", ") : "";
    var name = firstName(match ? match[2] : text);
    window.ajOpac.firstName = name;   // the "My library" card uses this too
    label.textContent = name ? prefix + name : AJ.nameFallback;
  });

  /* 2. Login forms: "ITS Number" instead of "Card number" */
  safely(function () {
    ["userid", "muserid"].forEach(function (id) {
      var label = document.querySelector('label[for="' + id + '"]');
      if (label && /card number/i.test(label.textContent)) {
        label.textContent = AJ.loginLabel + ":";
      }
    });
  });

  /* 3. Lists move into the account menu; Cart moves after it */
  safely(function () {
    var members = document.getElementById("members");
    var userMenu = document.getElementById("loggedinuser-menu");
    var accountItem = document.getElementById("user-menu");
    if (!members || !userMenu || !accountItem) { return; } // not logged in
    accountItem = accountItem.closest("li");

    userMenu.querySelectorAll("a").forEach(function (a) {
      a.classList.add("dropdown-item");
    });

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
      var logout = document.getElementById("logout");
      userMenu.insertBefore(group, logout && logout.parentNode === userMenu ? logout : null);
      listsItem.remove();
    }

    var cartLink = document.getElementById("cartmenulink");
    if (cartLink) {
      var cartItem = cartLink.closest("li");
      cartItem.classList.add("aj-cart-item");
      accountItem.after(cartItem);
    }

    var oldBar = document.getElementById("cart-list-nav");
    if (oldBar && !oldBar.querySelector(".nav-item")) { oldBar.remove(); }
  });

  /* 4. Page loader: the Jamea rosette
     ------------------------------------------------------------------------
     v3 fixes two faults:

     (a) It never appeared on phones. The overlay was sized and placed
         with "position: fixed; inset: 0", which measures the *layout*
         viewport. On a phone that is not what is on the screen: pinch
         zoom, and any page that is a few pixels wider than the display,
         both make the layout viewport larger than the visible one, and
         the rosette ends up centred somewhere off-screen. It is now
         pinned to window.visualViewport — literally what the reader can
         see — and follows it when they scroll or zoom.

     (b) The 0.4-second wait before showing it was a CSS transition
         delay. A browser that is busy starting the next page may never
         get round to running it. The wait is now a JavaScript timer, and
         the overlay is promoted to its own compositor layer in advance,
         so appearing costs no main-thread work at all.
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
    var stopTimer, showTimer, speakTimer;

    /* Cover exactly what the reader can see, not the whole document */
    var vv = window.visualViewport;
    function fitToView() {
      if (!vv) { return; }
      loader.style.width  = vv.width + "px";
      loader.style.height = vv.height + "px";
      loader.style.transform =
        "translate3d(" + vv.offsetLeft + "px," + vv.offsetTop + "px,0)";
    }
    if (vv) {
      fitToView();
      vv.addEventListener("resize", fitToView);
      vv.addEventListener("scroll", fitToView);
    }

    function start() {
      clearTimeout(stopTimer);
      clearTimeout(showTimer);
      clearTimeout(speakTimer);
      fitToView();
      showTimer = setTimeout(function () {
        fitToView();
        root.classList.add("aj-loading");
      }, AJ.loaderDelay);
      stopTimer = setTimeout(stop, AJ.loaderTimeout);
      // Screen readers hear this only when the wait is noticeable
      speakTimer = setTimeout(function () {
        message.textContent = "Loading page";
      }, AJ.loaderDelay);
    }

    function stop() {
      root.classList.remove("aj-loading");
      clearTimeout(stopTimer);
      clearTimeout(showTimer);
      clearTimeout(speakTimer);
      message.textContent = "";
    }

    // Start only if nothing else on the page cancelled the click or submit
    // (Koha cancels them for Cart, Add to list, pop-ups and so on)
    function startUnlessCancelled(event) {
      setTimeout(function () {
        if (!event.defaultPrevented) { start(); }
      }, 0);
    }

    function opensCataloguePage(link, event) {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) { return false; }
      if (link.target && link.target !== "_self") { return false; }
      if (link.hasAttribute("download") || link.hasAttribute("data-bs-toggle")) { return false; }
      var href = link.getAttribute("href");
      if (!href || href.charAt(0) === "#") { return false; }
      var url;
      try { url = new URL(link.href, location.href); }
      catch (err) { return false; }
      if (url.origin !== location.origin) { return false; } // other sites, mailto:
      if (url.pathname === location.pathname && url.search === location.search && url.hash) { return false; }
      return !AJ.noLoader.test(url.pathname + url.search);
    }

    document.addEventListener("click", function (event) {
      var link = event.target.closest ? event.target.closest("a[href]") : null;
      if (link && opensCataloguePage(link, event)) { startUnlessCancelled(event); }
    });

    document.addEventListener("submit", function (event) {
      var form = event.target;
      if (form.target && form.target !== "_self") { return; }
      if (AJ.noLoader.test(form.getAttribute("action") || "")) { return; }
      startUnlessCancelled(event);
    });

    // Back/forward can show a saved copy of the page with the loader still on
    window.addEventListener("pageshow", stop);

    // Escape or a tap hides it
    loader.addEventListener("click", stop);
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") { stop(); }
    });

    window.ajOpac.loader = { start: start, stop: stop, fit: fitToView };
  });

  // Tell the CSS the changes are done (ends the anti-flash hiding)
  root.classList.add("aj-ready");
})(); } catch (err) { if (window.console) console.warn("OPACUserJS part A:", err); }


/* Shared drawing helper for parts B, C and D
   ========================================================================== */
window.ajOpac.el = function (tag, cls, text) {
  var e = document.createElement(tag);
  if (cls) { e.className = cls; }
  if (text !== undefined && text !== null) { e.textContent = text; }
  return e;
};


/* PART B. "My library" card — middle column of the home page
   Needs: the box with id="aj-my-library" (OpacMainUserBlock_V3.html),
          opacreadinghistory = Allow, OPACUserSummary = Don't show.
   ========================================================================== */
try { (function () {
  "use strict";
  var aj = window.ajOpac;
  if (aj.stop || !aj.isHome || !aj.isLoggedIn) { return; }

  var el = aj.el;

  var SETTINGS = {
    // Academic year in the Misri calendar:
    // 5 Shawwal (month 10) to 29 Rajab (month 7) of the next year
    startMonth: 10, startDay: 5,
    endMonth: 7, endDay: 29,
    dueSoonDays:  aj.CFG.dueSoonDays,
    cacheMinutes: aj.CFG.accountCacheMin
  };

  var TEXT = {
    welcome: "Welcome, ",
    booksOne: "book borrowed",
    booksMany: "books borrowed",
    thisYear: "This academic year",
    lastYear: "Last academic year (the new year starts on 5 Shawwal)",
    countNote: "Counts books returned this year plus books you have now.",
    countWait: "Counting your books for this year…",
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
    return n.getFullYear() + "-" + String(n.getMonth() + 1).padStart(2, "0") +
           "-" + String(n.getDate()).padStart(2, "0");
  }
  function isoToJD(iso) {
    var p = iso.split("-");
    return toJD(+p[0], +p[1], +p[2]);
  }

  // The academic year that contains today;
  // in the holiday gap, the year that just ended.
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

  /* ---------- Reading the account page ----------

     Koha 25.11 prints each count in the tab label — "Checked out (3)",
     "Overdue (1)", "Holds (2)", "Charges (Rs 120.00)" — and prints it
     whether or not the matching table is on the page. A patron with
     nothing on loan gets the label "Checked out (0)" and NO table at
     all, so counting table rows alone reports zero for everyone whose
     tab is empty, and cannot tell "none" apart from "not rendered".

     So the labels are read first. The tables are still needed for the
     two things no label carries: how many loans fall due soon, and how
     many holds are waiting to be collected. Row counting also stands in
     if a label is missing entirely. */
  function readSummary(html, today) {
    var soonLimit = jdToISO(isoToJD(today) + SETTINGS.dueSoonDays);
    var out = { checkedOut: 0, dueSoon: 0, overdue: 0, holds: 0, ready: 0, charges: null };

    var tabs = aj.parsePart(html, "div", 'id="opac-user-views"', "#opac-user-views");

    /* The text inside the last brackets of a tab label, or null if that
       tab is not on the page at all. */
    function label(name) {
      var a = tabs && tabs.querySelector("#" + name + "-tab");
      if (!a) { return null; }
      var m = a.textContent.replace(/\s+/g, " ").match(/\(([^)]*)\)\s*$/);
      return m ? m[1].trim() : null;
    }
    function count(text) {
      var n = parseInt(String(text).replace(/[^0-9-]/g, ""), 10);
      return isFinite(n) ? n : 0;
    }

    var checkoutsTab = label("opac-user-checkouts");
    var overduesTab  = label("opac-user-overdues");
    var holdsTab     = label("opac-user-holds");
    var finesTab     = label("opac-user-fines");

    /* Rows live inside the tab panels. Koha names them after the tab. */
    var checkouts = aj.parsePart(html, "div", 'id="opac-user-checkouts_panel"',
                                 "#opac-user-checkouts_panel");
    var holds     = aj.parsePart(html, "div", 'id="opac-user-holds_panel"',
                                 "#opac-user-holds_panel");

    /* Only rows that carry a due date are real loans — an empty panel
       holds a single "You have nothing checked out" row. */
    var loanRows = checkouts ? checkouts.querySelectorAll("td.date_due") : [];
    out.checkedOut = checkoutsTab === null ? loanRows.length : count(checkoutsTab);

    var overdueRows = 0;
    Array.prototype.forEach.call(loanRows, function (cell) {
      if (cell.classList.contains("overdue")) { overdueRows += 1; return; }
      var due = (cell.getAttribute("data-order") || "").slice(0, 10);
      if (due && due <= soonLimit) { out.dueSoon += 1; }
    });
    out.overdue = overduesTab === null ? overdueRows : count(overduesTab);

    var holdRows = holds ? holds.querySelectorAll("tbody tr td.status") : [];
    Array.prototype.forEach.call(holdRows, function (cell) {
      // "Item waiting at <strong>Library</strong>" is the only status
      // with <strong> inside a <span>
      if (cell.querySelector("span > strong")) { out.ready += 1; }
    });
    out.holds = holdsTab === null ? holdRows.length : count(holdsTab);

    if (finesTab) {
      out.charges = {
        label: "Charges",
        amount: finesTab,
        isCredit: /^\s*-/.test(finesTab)
      };
    } else {
      // Older layouts put the amount in a panel of its own
      var fines = aj.parsePart(html, "div", 'id="opac-user-fines_panel"',
                               "#opac-user-fines_panel");
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
    }
    return out;
  }

  function countYear(html, year) {
    var rec = aj.parsePart(html, "table", 'id="readingrec"', "#readingrec");
    if (!rec) { return null; }
    var n = 0;
    rec.querySelectorAll("tbody tr").forEach(function (tr) {
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

  /* ---------- Drawing ---------- */
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

  /* The card is drawn in two passes. Pass one runs the moment the
     account page arrives and leaves a quiet placeholder where the
     yearly count goes; pass two fills it in when the reading history
     turns up. Before v3 the whole card waited for both. */
  function drawCard(box, name, summary, year) {
    box.textContent = "";

    if (name) {
      var hello = el("p", "aj-ml__hello", TEXT.welcome);
      var who = el("a", null, name);
      who.href = "/cgi-bin/koha/opac-user.pl";
      hello.appendChild(who);
      box.appendChild(hello);
    }

    var yearBox = el("div", "aj-ml__year is-waiting");
    yearBox.id = "aj-ml-year";
    yearBox.appendChild(el("p", "aj-ml__note", TEXT.countWait));
    box.appendChild(yearBox);

    var list = el("ul", "aj-ml__status");
    statusRow(list, TEXT.checkedOut, summary.checkedOut, "/cgi-bin/koha/opac-user.pl?tab=opac-user-checkouts");
    statusRow(list, TEXT.dueSoon, summary.dueSoon, "/cgi-bin/koha/opac-user.pl?tab=opac-user-checkouts", "soon");
    statusRow(list, TEXT.overdue, summary.overdue, "/cgi-bin/koha/opac-user.pl?tab=opac-user-overdues", "alert");
    statusRow(list, TEXT.ready, summary.ready, "/cgi-bin/koha/opac-user.pl?tab=opac-user-holds", "good");
    statusRow(list, TEXT.holds, summary.holds, "/cgi-bin/koha/opac-user.pl?tab=opac-user-holds");
    if (summary.charges) {
      var li = el("li", "aj-ml__row " + (summary.charges.isCredit ? "is-good" : "is-alert"));
      var a = el("a", "aj-ml__link");
      a.href = "/cgi-bin/koha/opac-account.pl";
      a.appendChild(el("span", "aj-ml__label", summary.charges.label));
      a.appendChild(el("span", "aj-ml__value", summary.charges.amount));
      li.appendChild(a);
      list.appendChild(li);
    }
    box.appendChild(list);
    return yearBox;
  }

  function fillYear(yearBox, count, year) {
    if (!yearBox) { return; }
    yearBox.textContent = "";
    yearBox.classList.remove("is-waiting");

    if (count === null) {
      yearBox.appendChild(el("p", "aj-ml__note", TEXT.historyOff));
      return;
    }
    var countLine = el("p", "aj-ml__count");
    countLine.appendChild(el("span", "aj-ml__num", String(count)));
    countLine.appendChild(el("span", "aj-ml__unit", count === 1 ? TEXT.booksOne : TEXT.booksMany));
    yearBox.appendChild(countLine);

    var term = el("p", "aj-ml__term");
    term.appendChild(el("span", "aj-ml__term-name", year.ended ? TEXT.lastYear : TEXT.thisYear));
    term.appendChild(el("span", "aj-ml__term-dates", prettyHijri(year.start) + " to " + prettyHijri(year.end)));
    term.appendChild(el("span", "aj-ml__term-dates", prettyDate(year.start) + " to " + prettyDate(year.end)));
    yearBox.appendChild(term);
    yearBox.appendChild(el("p", "aj-ml__note", TEXT.countNote));
  }

  /* ---------- Start ---------- */
  function start() {
    var box = document.getElementById("aj-my-library");
    if (!box) { return; }

    var nameEl = document.querySelector(".loggedinusername[data-borrowernumber]");
    var userId = (typeof logged_in_user_id !== "undefined" && logged_in_user_id) ||
                 (nameEl && nameEl.getAttribute("data-borrowernumber"));
    if (!userId) { box.hidden = true; return; }

    var today = todayISO();
    var year  = academicYear(today);
    var name  = aj.firstName || "";
    var cacheKey = "ajMyLibrary:v3:" + userId + ":" + today;

    box.setAttribute("aria-busy", "true");

    /* If this tab already has the numbers, draw them straight away.
       The fetches still run underneath and replace them a moment later. */
    var hit = aj.readCache("sessionStorage", cacheKey, SETTINGS.cacheMinutes * 60000);
    var yearBox = null;
    if (hit && hit.summary) {
      yearBox = drawCard(box, name, hit.summary, year);
      if (hit.count !== undefined) { fillYear(yearBox, hit.count, year); }
      box.removeAttribute("aria-busy");
    }

    var store = { summary: null, count: undefined };
    function remember() { aj.writeCache("sessionStorage", cacheKey, store); }

    /* Pass one — the account page */
    var accountDone = aj.pending.account.then(function (res) {
      if (!res.ok || aj.isLoginPage(res.html)) {
        if (!hit) { message(box, res.ok ? TEXT.loggedOut : TEXT.failed); }
        return false;
      }
      store.summary = readSummary(res.html, today);
      yearBox = drawCard(box, name, store.summary, year);
      remember();
      return true;
    }).catch(function () {
      if (!hit) { message(box, TEXT.failed); }
      return false;
    }).then(function (ok) {
      box.removeAttribute("aria-busy");
      return ok;
    });

    /* Pass two — the reading history, whenever it turns up */
    Promise.all([accountDone, aj.pending.history]).then(function (r) {
      if (!r[0]) { return; }                  // the card isn't on screen
      var res = r[1];
      var count = (!res.ok || aj.isLoginPage(res.html)) ? null : countYear(res.html, year);
      store.count = count;
      remember();
      fillYear(yearBox, count, year);
    }).catch(function () {
      fillYear(yearBox, null, year);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

  // Exposed only so the logic can be tested; harmless on the live site.
  window.ajMyLibraryTest = {
    misriFromJD: misriFromJD, misriToJD: misriToJD, toJD: toJD, jdToISO: jdToISO,
    academicYear: academicYear, readSummary: readSummary, countYear: countYear
  };
})(); } catch (err) { if (window.console) console.warn("OPACUserJS part B:", err); }


/* PART C. "New in the library" — left column of the home page
   Needs: the box with id="aj-new-books" (OpacMainUserBlock_V3.html).
   Search engine: Zebra.
   ========================================================================== */
try { (function () {
  "use strict";
  var aj = window.ajOpac;
  if (aj.stop || !aj.isHome || !aj.isLoggedIn) { return; }

  var el = aj.el;
  var CFG = aj.CFG;

  var TEXT = {
    newTitle: "New in the library",
    newAll: "See all",
    prev: "Show earlier books",
    next: "Show more books",
    none: "Nothing to show yet.",
    failed: "This list could not be loaded. Refresh the page to try again."
  };

  var searchUrl = aj.newBooksSearchUrl();
  // Where "See all" sends the reader: the same search Koha would run,
  // at its normal page size, with the same records left out.
  var browseUrl = aj.newBooksSearchUrl().replace(/&count=\d+$/, "");

  // MARC titles often end with " /", " :" or " ="
  function tidy(s) {
    return (s || "").replace(/\s+/g, " ").replace(/[\s\/:;,=.]+$/, "").trim();
  }

  /* Status matching ignores case, spaces, hyphens and underscores, so a
     status typed as "In-Stock", "In Stock" or "in_stock" all match. */
  function flatten(s) {
    return (s || "").toLowerCase().replace(/[\s\-_]+/g, "");
  }
  var HIDDEN = (CFG.newBooksHideStatusText || []).map(flatten).filter(Boolean);

  /* Should this search result be left out, judging by the page alone?

     Used in "all-copies" mode, and by the fallback below. It has to work
     on the status DESCRIPTION, because that is the only form the code
     reaches the browser in: C4/XSLT.pm sets a not-for-loan item's
     substatus to the authorised value's opac_description, so the results
     page says "In-Stock" and never "3".

     A record is dropped only when the status appears AND no copy is
     available to a reader — copies that can be borrowed are listed
     inside <span class="available">. Koha also tags each unavailable
     group with a class built from the description
     (class="unavailable_In-Stock"), which is checked first because it is
     a sturdier hook than loose words in a sentence. */
  function isHidden(row) {
    if (!HIDDEN.length || !row) { return false; }
    var avail = row.querySelector(".results_summary.availability") || row;

    var matched = HIDDEN.some(function (want) {
      // Koha's own grouping class, e.g. unavailable_In-Stock
      var byClass = Array.prototype.some.call(
        avail.querySelectorAll('[class*="unavailable_"], [class*="notforloandesc_"]'),
        function (el) { return flatten(el.className).indexOf(want) !== -1; });
      return byClass || flatten(avail.textContent).indexOf(want) !== -1;
    });
    if (!matched) { return false; }
    return !avail.querySelector(".available, .item-status.available");
  }

  /* filterHere: false when Zebra has already left the records out. */
  function readNewBooks(html, filterHere) {
    /* Koha's results table carries no id — the real markup is
       <div class="searchresults"><form ...><table class="table ...">.
       v3 looked for id="searchresults", never found it, and parsed the
       whole results page twice as a fallback. */
    var results = aj.parsePart(html, "div", 'class="searchresults"', ".searchresults");
    if (!results) { return []; }

    var seen = {}, list = [];
    results.querySelectorAll(".bookcover[data-biblionumber]").forEach(function (c) {
      if (list.length >= CFG.newBooks) { return; }
      var bib = c.getAttribute("data-biblionumber");
      if (!bib || seen[bib]) { return; }
      if (filterHere) {
        var row = c.closest("tr") || c.closest(".searchresults > *");
        if (isHidden(row)) { seen[bib] = true; return; }
      }
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

  /* Try Amazon (as the results page does), then Open Library.
     A real cover marks the plate .has-cover (CSS then hides the bookplate).
     If neither has a cover, remove the image so the bookplate shows.

     v3: only the first few covers load straight away. The rest wait until
     they are scrolled into view, which keeps 12 cross-origin image
     requests from competing with the page's own. */
  function addCover(frame, isbn, eager) {
    if (!isbn) { return; }
    var sources = [
      "https://images-na.ssl-images-amazon.com/images/P/" + encodeURIComponent(isbn) + ".01.MZZZZZZZ.jpg",
      "https://covers.openlibrary.org/b/isbn/" + encodeURIComponent(isbn) + "-M.jpg?default=false"
    ];
    var img = el("img", "aj-shelf__img");
    img.alt = "";
    img.loading = eager ? "eager" : "lazy";
    img.decoding = "async";
    if (!eager) { img.fetchPriority = "low"; }
    var i = 0;
    function next() {
      frame.classList.remove("has-cover");
      i += 1;
      if (i < sources.length) { img.src = sources[i]; } else { img.remove(); }
    }
    img.addEventListener("error", next);
    img.addEventListener("load", function () {
      if (img.naturalWidth <= 1) { next(); return; }   // Amazon's "no cover" is a 1x1 pixel
      frame.classList.add("has-cover");
    });
    img.src = sources[0];
    frame.appendChild(img);
  }

  function drawNewBooks(box, books) {
    box.textContent = "";
    heading(box, TEXT.newTitle, TEXT.newAll, browseUrl);
    if (!books.length) { return fail(box, TEXT.none); }

    var wrap = el("div", "aj-shelf__wrap");
    var track = el("ul", "aj-shelf__track");
    track.tabIndex = 0;
    track.setAttribute("aria-label", TEXT.newTitle);

    books.forEach(function (b, index) {
      var li = el("li", "aj-shelf__item");
      var a = el("a", "aj-shelf__link");
      a.href = "/cgi-bin/koha/opac-detail.pl?biblionumber=" + encodeURIComponent(b.bib);

      // Same element and data attributes as the search results,
      // so the bookplate styling draws the placeholder
      var plate = el("div", "bookcover aj-shelf__cover");
      plate.setAttribute("data-title", b.title);
      if (b.author) { plate.setAttribute("data-author", b.author); }
      addCover(plate, b.isbn, index < 4);
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
      var rtl = getComputedStyle(track).direction === "rtl" ? -1 : 1;  // RTL scrolls the other way
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
    window.addEventListener("resize", update, { passive: true });

    wrap.appendChild(prev);
    wrap.appendChild(track);
    wrap.appendChild(next);
    box.appendChild(wrap);
    update();
  }

  function start() {
    var box = document.getElementById("aj-new-books");
    if (!box) { return; }

    // Cached from an earlier visit: nothing to wait for at all
    if (aj.newBooksCached) {
      drawNewBooks(box, aj.newBooksCached);
      return;
    }

    box.setAttribute("aria-busy", "true");
    resolveBooks().then(function (books) {
      aj.writeCache("localStorage", aj.newBooksKey, books);
      drawNewBooks(box, books);
    }).catch(function () {
      fail(box, TEXT.failed);
    }).then(function () {
      box.removeAttribute("aria-busy");
    });
  }

  /* Gets the list, with one safety net.

     In "any-copy" mode the work is done by a CCL term — "not
     notforloan=3" — which this code cannot test against a live Zebra. If
     that query ever errors, or a Zebra upgrade stops understanding it,
     the result would be an empty shelf on the home page. So: if the
     code-based search fails or returns nothing, it is tried once more
     without the exclusion, and filtered here instead. Worst case the
     shelf is a little slower; it does not go blank. */
  function resolveBooks() {
    var byCode = aj.newBooksExcludedByCode;

    return aj.pending.books.then(function (res) {
      if (!res.ok || aj.isLoginPage(res.html)) { throw new Error("search unavailable"); }
      var books = readNewBooks(res.html, !byCode);
      if (!books.length && byCode) { throw new Error("no records matched"); }
      return books;
    }, function () {
      /* The request never completed — the reader navigated away, or the
         connection dropped. Retrying would fail the same way, and warning
         about the search term would be misleading, so this is tagged and
         passed straight through. */
      var e = new Error("request did not complete");
      e.ajNetwork = true;
      throw e;
    }).catch(function (err) {
      if (!byCode || err.ajNetwork) { throw err; }

      /* The search DID run and gave nothing usable. In "any-copy" mode
         that points at the CCL term, which cannot be tested here against
         a live Zebra — so say so once, plainly, and fetch again without
         it. The shelf ends up a little slower rather than empty. */
      if (window.console) {
        console.warn('OPACUserJS: the search "not notforloan=' +
                     (CFG.newBooksHideNotForLoan || []).join(",") +
                     '" returned nothing (' + err.message +
                     '). Falling back to filtering by status description. ' +
                     'If this keeps happening, set newBooksHideMode to "all-copies".');
      }
      return aj.grab(aj.newBooksSearchUrl({ plain: true })).then(function (res) {
        if (!res.ok || aj.isLoginPage(res.html)) { throw new Error("search unavailable"); }
        return readNewBooks(res.html, true);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

  window.ajShelvesTest = { readNewBooks: readNewBooks, tidy: tidy, isHidden: isHidden,
                           searchUrl: searchUrl, plainUrl: aj.newBooksSearchUrl({ plain: true }),
                           byCode: aj.newBooksExcludedByCode };
})(); } catch (err) { if (window.console) console.warn("OPACUserJS part C:", err); }


/* PART D. "Library information" — right column of the home page
   ==========================================================================
   HOW STAFF KEEP THIS UP TO DATE
   ------------------------------
   Everything in this widget comes from Koha's own News tool. A member of
   staff with the "edit_news" permission maintains it entirely from the
   staff interface — no files, no code, no help needed from you:

       Staff interface › Tools › Additional tools › News › New entry

   Each entry has a title, a rich-text body, a publication date and an
   expiration date. Set "Display location" to "OPAC" (or "All"). An entry
   with an expiration date disappears by itself on that date, so a holiday
   notice or a one-off programme cleans itself up.

   Koha already prints these entries on the home page, above the widgets,
   inside <div id="news">. This part simply moves them into the third
   column and restyles them. Nothing is fetched, so the widget costs
   nothing to load.

   Suggested entries to start with:
     * "Library timings"        — no expiration date (it is permanent)
     * "Computer lab timings"   — no expiration date
     * a holiday notice         — expires the day the library reopens
     * an upcoming programme    — expires the day after the event
   ========================================================================== */
try { (function () {
  "use strict";
  var aj = window.ajOpac;
  if (aj.stop || !aj.isHome) { return; }

  var el = aj.el;

  var TEXT = {
    title: "Library information",
    none: "There are no notices at the moment.",
    all: "All news",
    published: "Updated "
  };

  function start() {
    var box = document.getElementById("aj-news");
    if (!box) { return; }

    var source = document.getElementById("news");
    var items = source ? source.querySelectorAll(".newsitem") : [];

    box.textContent = "";

    var head = el("div", "aj-news__head");
    head.appendChild(el("h2", "aj-news__title", TEXT.title));
    box.appendChild(head);

    if (!items.length) {
      box.appendChild(el("p", "aj-news__empty", TEXT.none));
      if (source) { source.hidden = true; }
      return;
    }

    var list = el("ul", "aj-news__list");
    var shown = 0;

    Array.prototype.forEach.call(items, function (item) {
      if (shown >= (aj.CFG.newsItems || 6)) { return; }

      var headingEl = item.querySelector(".newsheader");
      var bodyEl    = item.querySelector(".newsbody");
      var footEl    = item.querySelector(".newsfooter");
      // An empty "No news to display." placeholder from Koha
      if (!headingEl && bodyEl && /^\s*No news to display\.?\s*$/i.test(bodyEl.textContent)) { return; }

      shown += 1;
      var li = el("li", "aj-news__item");

      if (headingEl) {
        var h3 = el("h3", "aj-news__item-title");
        var link = headingEl.querySelector("a");
        if (link) {
          var a = el("a", null, link.textContent.trim());
          a.href = link.getAttribute("href");
          h3.appendChild(a);
        } else {
          h3.textContent = headingEl.textContent.trim();
        }
        li.appendChild(h3);
      }

      if (bodyEl) {
        var body = el("div", "aj-news__body");
        // Moved, not copied as text: staff formatting, links and lists
        // from the News editor are kept exactly as entered.
        while (bodyEl.firstChild) { body.appendChild(bodyEl.firstChild); }
        li.appendChild(body);
      }

      if (footEl) {
        var when = footEl.textContent.replace(/\s+/g, " ")
                        .replace(/^\s*Published on\s*/i, "").trim();
        // Drop the author part if Koha added one
        when = when.split(/\s+by\s+/i)[0].trim();
        if (when) { li.appendChild(el("p", "aj-news__when", TEXT.published + when)); }
      }

      list.appendChild(li);
    });

    if (!shown) {
      box.appendChild(el("p", "aj-news__empty", TEXT.none));
    } else {
      box.appendChild(list);

      /* The list fades out at the bottom when there is more to scroll to,
         so a part-visible notice reads as "there is more" rather than as
         a sentence that has been cut in half. Take the fade away once
         everything fits, or once the reader has reached the end. */
      var markEnd = function () {
        var fits = list.scrollHeight <= list.clientHeight + 1;
        var atEnd = list.scrollTop + list.clientHeight >= list.scrollHeight - 2;
        list.classList.toggle("is-short", fits);
        list.classList.toggle("is-at-end", atEnd);
      };
      list.addEventListener("scroll", markEnd, { passive: true });
      window.addEventListener("resize", markEnd, { passive: true });
      markEnd();
    }

    // The originals have been emptied out; hide what is left behind
    // (the container, the RSS link and the now-blank items).
    source.hidden = true;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})(); } catch (err) { if (window.console) console.warn("OPACUserJS part D:", err); }
