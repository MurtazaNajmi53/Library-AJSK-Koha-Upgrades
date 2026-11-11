/* ==========================================================================
   Maktabat Aljamea (Sindh) — OPACUserJS for Koha 25.11   (v5, 10 Nov 2026)

   Paste the comment-free copy, OPACUserJS_V5.paste.js, into:
   Administration › System preferences › OPACUserJS
   REPLACING PARTS 0 TO D ONLY. The live preference also holds the
   Click & Collect "PART E" block after Part D. Keep it where it is.

   Goes with  OPACUserCSS_V5.css        (OPACUserCSS)
              OpacMainUserBlock_V3.html (HTML customizations)

   PART 0. Early work — starts the network requests before anything else
   PART A. Header, "ITS Number" label, page loader — every page
   PART B. "My library" card      — home page, middle column
   PART C. "New in the library"   — home page, left column
   PART D. "Library information"  — home page, right column (Koha News)

   WHAT CHANGED IN v5 — the design system's loader and controls
   -----------------------------------------------------------
   1. The page loader now has two layers, as the design system's Loader
      does. A 3px progress bar starts on every page change; the rosette
      comes in only if the next page still hasn't arrived after 1.2
      seconds, draws its petals one by one and says what is happening
      ("Searching the catalogue…", "Opening the record…"). It replaces
      the spinning, pulsing rosette, which moved for its own sake.
      Everything v3 fixed still holds: the overlay is pinned to the
      visual viewport, the wait is a JavaScript timer, cancelled clicks
      and downloads never start it, Escape or a tap hides it, and it
      clears itself after 10 seconds and on back/forward.
   2. The rosette artwork is the design system's traced SVG, carried in
      this script and handed to the CSS as two variables. It no longer
      depends on an image hotlinked from the Jamea website, and because
      it is in the script (end of <body>) rather than the stylesheet
      (<head>), it adds nothing to the time before the page first paints.
      Coordinates are rounded to whole units of the 800-unit drawing,
      about 0.1px at the size it is shown, which saves 1.6 KB gzipped.
   3. The shelf arrows are 44px buttons with a drawn chevron that mirrors
      on right-to-left pages, instead of the "‹ ›" characters. They page
      by 85% of the visible width, as the Shelf component does.
   Parts 0, B, C (apart from the arrows) and D are unchanged.

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

    // How long a page may take before the rosette joins the progress bar
    loaderDelay: 1200,

    // What the rosette says. Say what is happening, in the reader's words.
    loaderText: {
      search:  "Searching the catalogue…",
      record:  "Opening the record…",
      account: "Loading your account…",
      other:   "Loading…",
      otherAr: "جارٍ التحميل…"
    },

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

  /* 4. Page loader: a progress bar, then the rosette
     ------------------------------------------------------------------------
     v5 follows the design system's Loader. Two layers:

     - The progress bar starts the moment a link or form sends the reader
       to another catalogue page. CSS holds it back 120ms, so pages that
       arrive at once never flicker. It creeps towards 90% and never claims
       to be finished: the next page replacing this one is the finish.
     - The rosette joins it only when the wait passes AJ.loaderDelay
       (1.2s), and says what is happening.

     Two v3 fixes are kept, because both faults would come straight back:

     (a) The overlay is pinned to window.visualViewport, literally what the
         reader can see. "position: fixed; inset: 0" measures the layout
         viewport, which on a pinch-zoomed phone is larger than the screen,
         and the rosette ended up centred somewhere off it.
     (b) The wait is a JavaScript timer, not a CSS transition delay. A
         browser busy starting the next page may never run a CSS delay.
     ------------------------------------------------------------------------ */
  safely(function () {
    /* The rosette, traced from rosette-motif.png by the design system
       (design-system/components/bundle.css, --aj-ros-line / --aj-ros-fill).
       "line" is the petal outlines, "fill" the solid disc. Coordinates are
       rounded to whole units. They are CSS masks, so the colour comes from
       the tokens, and as inline data they need no other server. */
    var ROSETTE = {
      line: 'url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 800 800%22%3E%3Cpath fill-rule=%22evenodd%22 d=%22M370 795C315 790 269 777 221 753C112 698 33 593 11 472C6 446 5 431 5 400C5 369 6 354 11 328C22 264 51 203 91 152C151 78 235 28 328 11C354 6 369 5 400 5C431 5 446 6 472 11C536 22 598 51 648 91C722 151 772 235 789 328C794 354 795 369 795 400C795 431 794 446 789 472C778 536 749 598 709 648C643 730 549 781 444 794C428 795 385 796 370 795ZM428 791C539 782 637 731 706 644C773 562 803 453 788 348C769 200 666 76 525 28C450 3 368 1 292 23C253 34 217 51 182 75C96 132 36 221 16 323C6 373 6 427 16 477C39 590 109 687 211 743C260 771 318 788 376 791C387 792 416 792 428 791ZM372 767C370 767 364 767 358 766C312 761 264 746 222 723C208 715 183 698 170 687C155 676 124 645 113 631C70 577 44 517 34 447C32 431 31 387 33 369C40 287 74 210 129 151C170 107 215 76 269 56C300 44 334 36 367 33C382 32 418 32 433 33C486 38 538 55 584 81C612 97 634 114 659 139C680 160 691 173 705 194C738 242 757 292 766 354C768 372 768 428 766 446C756 517 730 577 687 631C676 645 645 676 631 687C577 730 517 756 447 766C436 767 379 769 372 767ZM391 751C391 750 386 744 380 736C359 709 341 681 329 659L326 654L322 662C310 686 282 697 257 688C250 685 238 677 236 674C235 672 235 672 229 674C203 683 175 668 167 641L165 635L159 633C141 628 128 614 124 596C123 588 123 577 126 570C128 565 128 565 126 564C123 562 115 550 112 543C103 518 114 490 138 478C147 474 148 475 134 467C116 458 90 440 64 420C56 414 50 409 49 409C48 409 50 434 52 446C55 472 62 499 71 523C77 540 92 571 102 586C159 678 254 737 361 749C372 751 391 751 391 751ZM446 749C472 745 499 738 523 729C540 723 571 708 586 698C678 641 738 546 750 438C751 425 752 409 750 409C750 409 747 411 743 414C714 437 684 458 659 471L654 474L662 478C681 487 692 507 691 528C690 541 685 553 676 562L673 566L674 571C683 597 668 625 641 633L635 635L633 641C631 650 626 657 620 663C607 676 588 680 571 674L566 673L562 676C547 692 522 695 501 685C492 681 483 671 478 662L474 654L471 659C459 681 441 709 420 736C414 744 409 750 409 751C409 752 434 750 446 749ZM414 716C456 660 476 618 482 575C484 563 484 544 482 536C476 504 449 477 417 470C409 468 391 468 384 470C363 474 343 488 331 505C319 523 315 540 317 564C320 604 335 641 365 687C373 698 399 734 400 734C400 734 407 726 414 716ZM290 671C306 664 314 645 310 629C309 625 307 622 306 621C305 618 305 613 306 610C308 609 308 608 307 603C302 585 301 576 301 555C301 535 301 533 303 525C309 507 317 493 331 480C340 471 345 468 355 463C369 455 383 452 400 452C427 452 449 461 468 479C486 495 495 514 499 536C502 553 499 585 493 605C492 608 492 609 494 610C495 613 495 618 494 621C493 622 491 625 491 629C486 645 494 663 510 671C515 673 517 674 525 674C539 674 545 670 557 657C561 652 564 652 572 656C583 663 597 661 607 652C614 647 617 639 618 630C619 620 620 619 630 618C639 617 647 614 652 607C661 597 663 583 656 572C652 564 652 561 657 557C664 550 668 546 671 540C673 535 674 533 674 525C674 517 673 515 671 510C663 494 645 486 629 491C625 491 622 493 621 494C618 495 613 495 610 494C609 492 608 492 605 493C585 499 553 502 536 499C522 497 507 491 495 483C488 478 475 465 471 459C457 440 451 420 452 395C453 368 463 346 484 327C498 314 513 306 532 302C550 298 583 301 605 307C608 308 609 308 610 307C613 305 618 305 621 306C622 307 625 309 629 310C645 314 664 306 671 290C673 285 674 283 674 275C674 261 670 255 657 243C652 240 652 236 656 229C663 217 661 203 652 193C647 187 639 183 630 182C620 181 619 180 618 170C617 161 614 154 607 148C597 139 583 138 572 144C562 149 561 149 552 138C549 135 546 132 541 130C535 127 534 127 525 127C517 127 515 127 510 129C494 137 486 155 491 172C491 175 493 178 494 179C495 182 495 187 494 190C492 191 492 192 494 197C498 215 500 224 499 245C499 269 498 275 490 291C484 304 479 311 468 321C450 339 430 347 404 348C380 349 359 342 340 329C334 324 321 311 317 305C309 293 303 278 301 264C298 247 301 215 307 195C308 193 308 191 307 190C305 187 305 182 306 179C307 178 309 175 310 172C314 155 306 137 290 129C285 127 283 127 275 127C261 127 255 130 243 143C240 148 236 148 229 144C217 138 203 139 193 148C187 154 183 161 182 170C181 180 180 181 170 182C161 183 154 187 148 193C139 203 138 217 144 229C148 236 148 240 143 243C136 250 132 255 129 260C127 265 127 267 127 275C127 283 127 285 129 290C137 306 155 314 172 310C175 309 178 307 179 306C182 305 187 305 190 307C191 308 193 308 195 307C208 303 224 301 239 300C263 300 276 302 292 310C303 316 308 319 317 328C339 349 349 374 348 405C347 420 345 430 338 443C333 455 327 463 317 472C308 481 303 485 291 491C275 498 269 499 245 499C224 500 215 498 197 494C192 492 191 492 190 494C187 495 182 495 179 494C178 493 175 491 172 491C155 486 137 494 129 510C127 515 127 517 127 525C127 539 130 545 143 557C148 561 148 564 144 572C138 583 139 597 148 607C154 614 161 617 170 618C180 619 181 620 182 630C183 639 187 647 193 652C203 661 217 663 229 656C238 651 240 652 246 659C250 665 256 670 263 672C271 675 283 674 290 671ZM265 482C273 480 285 476 293 470C338 441 345 379 307 341C288 322 265 315 236 317C187 321 145 340 82 387C73 394 66 400 66 400C66 401 98 424 111 433C156 464 195 480 234 483C244 484 255 484 265 482ZM576 482C608 478 644 463 685 436C697 428 734 401 734 400C734 399 698 373 687 365C649 340 616 325 585 320C571 317 553 316 543 317C518 320 496 333 482 354C473 369 469 383 469 400C469 406 469 413 470 417C475 438 488 458 507 470C518 478 529 481 546 483C550 484 566 483 576 482ZM390 438C378 434 370 428 365 417C362 410 362 409 362 400C362 391 362 390 365 384C369 375 374 370 383 365C396 359 409 360 422 367C428 371 432 377 436 385C438 390 439 392 439 400C439 408 438 410 436 415C432 423 428 428 422 432C412 439 399 441 390 438ZM407 424C413 422 418 418 422 412C430 397 421 380 405 376C388 372 372 388 376 405C379 419 393 428 407 424ZM64 380C90 360 116 342 134 333C148 325 147 327 138 322C114 310 103 282 112 257C115 250 123 238 126 236C128 235 128 235 126 229C117 203 132 175 159 167L165 165L167 159C170 150 174 143 180 137C193 124 212 120 229 126C235 128 235 128 236 126C238 123 250 115 257 112C282 103 310 114 322 138L326 146L328 143C329 141 331 136 334 133C343 115 360 90 380 64C386 56 391 50 391 49C391 49 375 49 362 51C282 59 209 95 152 151C97 206 62 277 52 354C50 367 48 391 49 391C50 391 56 386 64 380ZM751 378C747 297 710 214 651 154C622 125 592 103 555 85C519 67 485 57 446 52C434 50 409 48 409 49C409 50 414 56 420 64C441 91 459 119 471 141L474 146L478 138C490 114 518 103 543 112C550 115 562 123 564 126C565 128 565 128 571 126C597 117 625 132 633 159L635 165L641 167C650 170 657 174 663 180C676 193 680 212 674 229C672 235 672 235 674 236C677 238 685 250 688 257C697 282 686 310 662 322L654 326L659 329C670 335 691 348 702 355C714 363 748 389 749 390C749 391 750 391 750 391C751 391 751 387 751 378ZM417 330C436 327 457 313 469 295C481 278 485 260 483 236C480 196 465 159 435 113C427 102 401 66 400 66C400 66 393 74 386 84C340 145 321 188 317 236C315 266 322 288 341 307C355 321 370 328 394 331C397 332 409 331 417 330Z%22/%3E%3C/svg%3E")',
      fill: 'url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 800 800%22%3E%3Cpath fill-rule=%22evenodd%22 d=%22M376 791C318 788 260 771 211 743C109 687 39 590 16 477C4 420 6 359 21 301C25 285 34 257 42 242C94 122 203 37 332 14C370 7 414 6 453 12C552 25 644 77 707 156C783 251 810 377 780 496C741 651 610 768 452 789C428 792 397 793 376 791ZM447 766C517 756 577 730 631 687C645 676 676 645 687 631C730 577 756 517 766 446C768 428 768 372 766 354C757 292 738 242 705 194C691 173 680 160 659 139C634 114 612 97 584 81C538 55 486 38 433 33C418 32 382 32 367 33C325 37 281 49 244 67C184 94 132 139 95 194C59 246 38 306 33 369C31 387 32 431 34 447C44 517 70 577 113 631C124 645 155 676 170 687C183 698 208 715 222 723C264 746 312 761 358 766C364 767 370 767 372 767C379 769 436 767 447 766ZM361 749C254 737 159 678 102 586C92 571 77 540 71 523C62 499 55 472 52 446C50 434 48 409 49 409C50 409 56 414 64 420C90 440 116 458 134 467C148 475 147 474 138 478C114 490 103 518 112 543C115 550 123 562 126 564C128 565 128 565 126 570C123 577 123 588 124 596C128 614 141 628 159 633L165 635L167 641C170 650 174 657 180 663C193 676 212 680 229 674C235 672 235 672 236 674C238 677 250 685 257 688C282 697 310 686 322 662L326 654L329 659C341 681 359 709 380 736C386 744 391 750 391 751C391 751 372 751 361 749ZM409 751C409 750 414 744 420 736C441 709 459 681 471 659L474 654L478 662C487 681 507 692 528 691C541 690 553 685 562 676L566 673L571 674C597 683 625 668 633 641L635 635L641 633C650 631 657 626 663 620C676 607 680 588 674 571L673 566L676 562C692 547 695 522 685 501C681 492 671 483 662 478L654 474L659 471C684 458 714 437 743 414C747 411 750 409 750 409C752 409 751 425 750 438C743 501 719 561 682 610C647 656 606 690 555 716C519 733 485 743 446 749C434 750 409 752 409 751ZM386 716C340 654 321 612 317 564C315 540 319 523 331 505C343 488 363 474 384 470C391 468 409 468 417 470C444 476 468 496 478 522C482 533 483 541 483 555C483 595 469 635 436 685C428 697 401 734 400 734C400 734 393 726 386 716ZM263 672C256 670 250 665 246 659C240 652 238 651 229 656C217 663 203 661 193 652C187 647 183 639 182 630C181 620 180 619 170 618C161 617 154 614 148 607C139 597 138 583 144 572C148 564 148 561 143 557C136 550 132 546 129 540C127 535 127 533 127 525C127 517 127 515 129 510C137 494 155 486 172 491C175 491 178 493 179 494C182 495 187 495 190 494C191 492 192 492 197 494C215 498 224 500 245 499C269 499 275 498 291 491C303 485 308 481 317 472C327 463 333 455 338 443C345 430 347 420 348 405C349 374 339 349 317 328C308 319 303 316 292 310C276 302 263 300 239 300C224 301 208 303 195 307C193 308 191 308 190 307C187 305 182 305 179 306C178 307 175 309 172 310C155 314 137 306 129 290C127 285 127 283 127 275C127 261 130 255 143 243C148 240 148 236 144 229C138 217 139 203 148 193C154 187 161 183 170 182C180 181 181 180 182 170C183 161 187 154 193 148C203 139 217 138 229 144C236 148 240 148 243 143C250 136 255 132 260 129C265 127 267 127 275 127C283 127 285 127 290 129C306 137 314 155 310 172C309 175 307 178 306 179C305 182 305 187 307 190C308 191 308 193 307 195C301 215 298 247 301 264C303 278 309 293 317 305C321 311 334 324 340 329C359 342 380 349 404 348C430 347 450 339 468 321C479 311 484 304 490 291C498 275 499 269 499 245C500 224 498 215 494 197C492 192 492 191 494 190C495 187 495 182 494 179C493 178 491 175 491 172C486 155 494 137 510 129C515 127 517 127 525 127C534 127 535 127 541 130C546 132 549 135 552 138C561 149 562 149 572 144C583 138 597 139 607 148C614 154 617 161 618 170C619 180 620 181 630 182C639 183 647 187 652 193C661 203 663 217 656 229C652 236 652 240 657 243C664 250 668 255 671 260C673 265 674 267 674 275C674 283 673 285 671 290C664 306 645 314 629 310C625 309 622 307 621 306C618 305 613 305 610 307C609 308 608 308 605 307C583 301 550 298 532 302C513 306 498 314 484 327C469 341 461 354 456 373C452 384 451 404 453 416C457 438 466 456 483 472C492 481 497 484 508 490C524 498 537 501 561 500C576 499 592 497 605 493C608 492 609 492 610 494C613 495 618 495 621 494C622 493 625 491 629 491C645 486 663 494 671 510C673 515 674 517 674 525C674 539 670 545 657 557C652 561 652 564 656 572C663 583 661 597 652 607C647 614 639 617 630 618C620 619 619 620 618 630C617 639 614 647 607 652C597 661 583 663 572 656C564 652 561 652 557 657C550 664 546 668 540 671C535 673 533 674 525 674C517 674 515 673 510 671C494 663 486 645 491 629C491 625 493 622 494 621C495 618 495 613 494 610C492 609 492 608 493 605C499 585 502 553 499 536C497 521 491 506 482 494C471 479 453 465 437 459C416 451 388 450 368 457C354 462 342 469 331 480C317 493 309 507 303 525C301 533 301 535 301 555C301 576 302 585 307 603C308 608 308 609 306 610C305 613 305 618 306 621C307 622 309 625 310 629C314 645 306 664 290 671C283 674 271 675 263 672ZM234 483C195 480 156 464 111 433C98 424 66 401 66 400C66 400 73 394 82 387C145 340 187 321 236 317C265 315 288 322 307 341C345 379 338 441 293 470C277 481 258 485 234 483ZM546 483C529 481 518 478 507 470C488 458 475 438 470 417C469 413 469 406 469 400C469 383 473 369 482 354C496 333 518 320 543 317C553 316 571 317 585 320C616 325 649 340 687 365C698 373 734 399 734 400C734 401 697 428 685 436C637 468 600 481 558 483C553 484 547 484 546 483ZM411 437C422 434 431 427 436 415C438 410 439 408 439 400C439 392 438 390 436 385C432 377 428 371 422 367C409 360 396 359 383 365C374 370 369 375 365 384C362 390 362 391 362 400C362 409 362 410 365 417C374 434 393 443 411 437ZM393 424C381 420 373 407 376 395C381 373 410 368 422 388C429 402 422 420 407 424C402 425 398 425 393 424ZM49 378C53 295 91 212 152 151C209 95 282 59 362 51C375 49 391 49 391 49C391 50 386 56 380 64C360 90 343 115 334 133C331 136 329 141 328 143L326 146L322 138C310 114 282 103 257 112C250 115 238 123 236 126C235 128 235 128 229 126C203 117 175 132 167 159L165 165L159 167C150 170 143 174 137 180C124 193 120 212 126 229C128 235 128 235 126 236C123 238 115 250 112 257C103 282 114 310 138 322C147 327 148 325 134 333C116 342 90 360 64 380C56 386 50 391 49 391C49 391 49 385 49 378ZM749 390C748 389 714 363 702 355C691 348 670 335 659 329L654 326L662 322C686 310 697 282 688 257C685 250 677 238 674 236C672 235 672 235 674 229C683 203 668 175 641 167L635 165L633 159C631 150 626 143 620 137C607 124 588 120 571 126C565 128 565 128 564 126C562 123 550 115 543 112C518 103 490 114 478 138L474 146L471 141C459 119 441 91 420 64C414 56 409 50 409 49C409 48 434 50 446 52C485 57 519 67 555 85C592 103 622 125 651 154C704 208 739 279 749 354C751 370 752 391 750 391C750 391 749 391 749 390ZM394 331C370 328 355 321 341 307C322 288 315 266 317 236C321 188 340 145 386 84C393 74 400 66 400 66C401 66 427 102 435 113C465 159 480 196 483 236C485 260 481 278 469 295C457 313 436 327 417 330C409 331 397 332 394 331Z%22/%3E%3C/svg%3E")'
    };

    var bar = document.createElement("div");
    bar.className = "aj-progress";
    bar.setAttribute("aria-hidden", "true");
    bar.innerHTML = '<span class="aj-progress__bar"></span>';
    document.body.appendChild(bar);

    var loader = document.createElement("div");
    loader.id = "aj-loader";
    loader.className = "aj-loader";
    loader.setAttribute("role", "status");
    loader.setAttribute("aria-live", "polite");
    loader.innerHTML =
      '<span class="aj-loader__mark" aria-hidden="true">' +
        '<span class="aj-loader__ghost"></span>' +
        '<span class="aj-loader__gold"></span>' +
        '<span class="aj-loader__lines"></span>' +
      '</span>' +
      '<p class="aj-loader__label"></p>';
    loader.style.setProperty("--aj-ros-line", ROSETTE.line);
    loader.style.setProperty("--aj-ros-fill", ROSETTE.fill);
    document.body.appendChild(loader);

    var label = loader.querySelector(".aj-loader__label");
    var stopTimer, showTimer, creep, fadeTimer, progress = 0;

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

    /* The bar's width is a CSS variable from 0 to 1 */
    function setBar(v) {
      progress = v;
      bar.style.setProperty("--aj-progress", v);
    }

    // Say what is happening, judged from where the reader is going
    function labelFor(where) {
      var t = AJ.loaderText;
      if (root.dir === "rtl") { return t.otherAr; }
      where = where || "";
      if (/opac-search\.pl/.test(where)) { return t.search; }
      if (/opac-(detail|MARCdetail|ISBDdetail)\.pl/.test(where)) { return t.record; }
      if (/opac-(user|account|readingrecord|memberentry|passwd|holdshistory|messaging)\.pl/.test(where)) {
        return t.account;
      }
      return t.other;
    }

    function start(where) {
      clearTimeout(stopTimer);
      clearTimeout(showTimer);
      clearTimeout(fadeTimer);
      clearInterval(creep);
      fitToView();

      bar.classList.add("is-active");
      setBar(0.08);
      creep = setInterval(function () { setBar(progress + (0.9 - progress) * 0.1); }, 280);

      showTimer = setTimeout(function () {
        fitToView();
        label.textContent = labelFor(where);   // a live region: read out once
        loader.classList.add("is-active");
        root.classList.add("aj-loading");
      }, AJ.loaderDelay);
      stopTimer = setTimeout(stop, AJ.loaderTimeout);
    }

    function stop() {
      clearTimeout(stopTimer);
      clearTimeout(showTimer);
      clearTimeout(fadeTimer);
      clearInterval(creep);
      loader.classList.remove("is-active");
      root.classList.remove("aj-loading");
      label.textContent = "";
      bar.classList.remove("is-active");
      fadeTimer = setTimeout(function () { setBar(0); }, 250);
    }

    // Start only if nothing else on the page cancelled the click or submit
    // (Koha cancels them for Cart, Add to list, pop-ups and so on)
    function startUnlessCancelled(event, where) {
      setTimeout(function () {
        if (!event.defaultPrevented) { start(where); }
      }, 0);
    }

    function opensCataloguePage(link, event) {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) { return null; }
      if (link.target && link.target !== "_self") { return null; }
      if (link.hasAttribute("download") || link.hasAttribute("data-bs-toggle")) { return null; }
      var href = link.getAttribute("href");
      if (!href || href.charAt(0) === "#") { return null; }
      var url;
      try { url = new URL(link.href, location.href); }
      catch (err) { return null; }
      if (url.origin !== location.origin) { return null; } // other sites, mailto:
      if (url.pathname === location.pathname && url.search === location.search && url.hash) { return null; }
      var where = url.pathname + url.search;
      return AJ.noLoader.test(where) ? null : where;
    }

    document.addEventListener("click", function (event) {
      var link = event.target.closest ? event.target.closest("a[href]") : null;
      var where = link && opensCataloguePage(link, event);
      if (where) { startUnlessCancelled(event, where); }
    });

    document.addEventListener("submit", function (event) {
      var form = event.target;
      if (form.target && form.target !== "_self") { return; }
      var where = form.getAttribute("action") || location.pathname;
      if (AJ.noLoader.test(where)) { return; }
      startUnlessCancelled(event, where);
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
    /* 20px chevrons with a 2px stroke in currentColor, the system's icon
       style. .aj-flip mirrors them on right-to-left pages. */
    var CHEVRON = '<svg class="aj-flip" viewBox="0 0 20 20" aria-hidden="true" focusable="false">' +
                  '<path d="M12.5 4.5 7 10l5.5 5.5" fill="none" stroke="currentColor" stroke-width="2" ' +
                  'stroke-linecap="round" stroke-linejoin="round"/></svg>';
    prev.innerHTML = CHEVRON;
    next.innerHTML = CHEVRON.replace("M12.5 4.5 7 10l5.5 5.5", "M7.5 4.5 13 10l-5.5 5.5");

    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function page(dir) {
      var rtl = getComputedStyle(track).direction === "rtl" ? -1 : 1;  // RTL scrolls the other way
      track.scrollBy({ left: dir * rtl * track.clientWidth * 0.85, behavior: reduce ? "auto" : "smooth" });
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
