/* ==========================================================================
   Maktabat Aljamea (Sindh) — OPACUserJS for Koha 25.11 (v8.2, 13 Nov 2026)

   Paste the comment-free copy, OPACUserJS_V8.2.paste.js, into:
   Administration › System preferences › OPACUserJS
   REPLACING THE WHOLE VALUE. From v8.1 this one file is all of
   OPACUserJS: Click & Collect (Part E) is inside it, at the end, so
   there is no separate block to keep or add.

   Goes with every other file of OPAC release v8.2 (opac/current/, see
   INSTALL.md), including reports/new-arrivals_V8.2.sql: report 37,
   whose number is CFG.newArrivalsReportId.

   PART 0. Early work — starts the network requests before anything else
   PART A. Header, sticky bar, "ITS Number" label, page loader — every page
   PART B. "My library" card      — home page
   PART D. "Library information"  — home page (Koha News)
   PART F. Search results         — Filters pull-out, quick filters, Sort
   PART F2. Result rows           — author and year, status, ⋯ menu,
                                    "Select titles" (new)
   PART J. Record page            — two actions, More options, details,
                                    holdings (new)
   PART K. Everywhere else        — header links, back to top, ratings,
                                    account pages, Most popular (new)
   PART H. Cart                   — one button that adds and removes (new)
   PART I. Pull-outs              — the cart and advanced search (new)
   PART G. New arrivals           — the popup after login, its header
                                    button and the home page band
   PART E. Click & Collect        — stays last (was a separate file)

   WHAT CHANGED IN v8.2
   --------------------
   Students see what they need on each screen; the rest is one press
   away. Audits: opac/current/audits/v8.2-*.md.
   1. "More options" menu (new, after the shared el() helper): the
      design system's Menu, placed against the window. Koha's own links
      are moved into it, so their handlers keep working.
   2. Result rows (Part F2, new): author and year, one status line, Click
      & Collect, Add to cart and a ⋯ menu (Save to lists). The checkboxes
      and Koha's selection toolbar wait behind "Select titles".
   3. Record page (Part J, new): a "Get this title" strip under the title
      says where the book is and holds Click & Collect, Add to cart and
      More options (Save to your lists, Print, Cite, Download record as,
      Search for this title in, Librarian views). Koha's right-hand column
      goes, so the record uses the full width. "More about this title" holds the rest of the
      details. Holdings: "Where to find it", table roles, labelled cards
      on phones, "Holdings (1)".
   4. Everywhere else (Part K, new): Advanced search beside the search
      field, Most popular in the account menu, one back-to-top button,
      0-vote ratings hidden, an "Account settings" group, export menus,
      empty states, and Most popular tidied.
   5. Cart (Part I): Send, Download and Print in one menu; a skeleton
      while the list loads. Advanced search: "e.g. 1990" placeholders.
   6. Click & Collect (Part E): a new order dialog. It is a native
      <dialog> that opens at once with a skeleton; dates are cards, the
      Confirm and Cancel buttons are pills, and the done screen has a
      rosette tick and "Done". It sits above the New arrivals popup and
      the cart, which no longer step aside (Parts G and I). ajCC.where()
      gives the shelf of the copy that would be ordered.
   7. New arrivals (Part G): the "New this month" line is gone, and the
      stage shows the real shelving location, not "Main hall".
   8. Home (Parts B, D): no "Library information" card when there are no
      notices; My library lists only the rows above 0.

   WHAT CHANGED IN v8.1
   --------------------
   1. One file. Click & Collect (Part E, v2.4 code plus orderMany) moves
      in from click-and-collect/02-…js, which is now in
      opac/click-and-collect/legacy/.
   2. New arrivals covers (Part G). Amazon's cover service only knows the
      10-digit ISBN; the report gives 13 digits, so many covers never
      loaded. 978- ISBNs now convert (aj.isbn10); others go to Open
      Library.
   3. New arrivals buttons (Part G). A filmstrip card has one button,
      "Add to cart" / "Remove", and an "In cart" tag on its cover. The
      stage has Click & Collect and "Add to cart" / "Remove from cart".
      No "New" badges: everything in the popup is new.
   4. New arrivals launchers (Part G). A header button with a count badge
      replaces the account-menu item, and a band across the top of the
      home page (#aj-arrivals-band) replaces the button at the foot of
      the My library card (Part B no longer makes room for it).
   5. Cart (Part H, new). "Add to cart" turns into "Remove from cart"
      once a title is in the cart, and back; Koha's "(remove)" link goes.
   6. Pull-outs (Part I, new). The header's Cart link opens a cart
      pull-out instead of Koha's pop-up window, and "Advanced search"
      opens a search pull-out after UCL's Primo.

   WHAT CHANGED IN v8
   ------------------
   1. New arrivals (Part G, new; Part C removed). The home page shelf is
      now a full-screen popup that opens once after login, when there
      are titles this reader hasn't been shown. A stage spotlights one
      title with its Click & Collect or Reserve button; a filmstrip
      brings any other onto the stage. "New arrivals" in the account
      menu and on the My library card open it at any time.
   2. The list comes from a public SQL report (reports/new-arrivals.sql)
      in well under a second, instead of the 8-second Zebra search. The
      search stays as the fallback when no report number is set.
   3. Part 0 fetches the list on every eligible logged-in page (once an
      hour per browser), not just the home page, since login can land
      on any page.
   4. Part B leaves a spot (#aj-ml-arrivals) at the foot of the card for
      the "New arrivals" button.

   WHAT CHANGED IN v7
   ------------------
   1. Sticky header (Part A, 3b). Scrolling back up slowly made the bar
      flip between its two sizes. Each change moved the page by 24px
      (scroll anchoring), straight back across the single 24px trigger.
      Now it shrinks after 56px and grows only within 8px of the top.
      On the results and record pages the search band sticks instead
      (CSS 10d), so 3b only measures it.
   2. Loader (Part A). Signing in from a search said "Searching the
      catalogue…", because Koha's login form posts back to the page that
      asked for it. Login forms now say "Signing you in…".
   3. Results (Part F). The bar goes into the sticky search band, and
      Koha's sort row becomes one Sort pull-out (sort order, then results
      per page). Its menus are placed against the window, so the bar can
      scroll sideways on narrow screens without cutting them off.

   WHAT CHANGED IN v6 — the design system's header, footer and results
   -------------------------------------------------------------------
   1. Sticky header (Part A, 3b). The bar stays at the top. When the page
      scrolls, the large logo minimises and the small one writes itself
      in from right to left; the CSS animates, this only sets html.aj-stuck
      from an IntersectionObserver. It also keeps --aj-header-h current,
      so Koha's sticky results toolbar sits under the bar.
   2. Account pages (Part A, 3c). The breadcrumb reads "Your account" and
      Your summary says "Hello, Murtaza." instead of the full name with
      the ITS number; the account menu marks its current page for screen
      readers (aria-current).
   3. The rosette artwork is now set on <html> (html.aj-ros), so the new
      footer's watermark uses the same outline as the loader.
   4. Results (Part F, new). Koha's facets move into a Filters drawer, the
      results take the full width, and large buttons above them give
      one-press access to Available now, Item type and Collection.

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
   request before PART G has run.

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

   plain:true forces the second shape. PART G uses it as a fallback if
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
    // "New arrivals" popup (Part G)
    /* The number Koha gave the public report reports/new-arrivals.sql
       (Reports › Saved reports, the "ID" column). null = not set up yet:
       the popup falls back to the slow Zebra search below. */
    newArrivalsReportId: 37,
    newArrivals:      24,  // titles in the popup
    arrivalsCacheMin: 60,  // how long to keep the report's list in localStorage
    arrivalsWaitMs: 3000,  // after this, the popup skips opening by itself this time

    // The Zebra fallback ("New in the library" before v8)
    newBooks:        24,   // how many titles to take from the search
    newBooksCacheHrs: 6,   // how long to keep a searched list in localStorage

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
       PART G. Koha's search results print a not-for-loan status as the
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

  }

  /* New arrivals (Part G). Login can land on any page, so the list is
     fetched on every page where the popup may open, unless the cached
     copy is still fresh (an hour for the report). */
  aj.arrivalsEligible = aj.isLoggedIn && window.top === window.self &&
    !/opac-reserve\.pl|opac-export\.pl|opac-download|opac-send(basket|shelf)|opac-basket\.pl|[?&](format|print)=/i
      .test(location.pathname + location.search);
  aj.arrivalsAuto = aj.arrivalsEligible &&
    !(/opac-detail\.pl/.test(location.pathname) && /[?&]cc=1/.test(location.search));

  if (aj.arrivalsEligible) {
    try { localStorage.removeItem("ajNewBooks:v3"); } catch (e) { /* v7's shelf cache */ }
    aj.arrivalsCached = (function () {
      try {
        var saved = JSON.parse(localStorage.getItem("ajNewArrivals:v1") || "null");
        if (!saved || !saved.d || !saved.d.length) { return null; }
        var maxAge = saved.src === "report" ? aj.CFG.arrivalsCacheMin * 60000
                                            : aj.CFG.newBooksCacheHrs * 3600000;
        return Date.now() - saved.t > maxAge ? null : saved.d;
      } catch (e) { return null; }
    })();
    if (!aj.arrivalsCached && aj.CFG.newArrivalsReportId) {
      aj.pending.arrivals = fetch("/cgi-bin/koha/svc/report?id=" +
          encodeURIComponent(aj.CFG.newArrivalsReportId) + "&annotated=1",
          { credentials: "same-origin" })
        .then(function (r) {
          if (!r.ok) { throw new Error("report " + r.status); }
          return r.json();
        });
      aj.pending.arrivals.catch(function () { /* Part G falls back */ });
    }
  }

  /* --- Warm up the connections the covers will need ---------------------
     Three DNS lookups and TLS handshakes that would otherwise happen
     one at a time, at the moment the first cover image is requested. */
  if (aj.arrivalsEligible) {
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

    // Account pages (3c). {name} is the first name.
    accountCrumb: "Your account",
    hello: "Hello, {name}.",
    notYou: "Not {name}? Log out",

    // How far the page scrolls before the header minimises, and how close
    // to the top it must come back before it grows again, in px. The gap
    // between the two must be wider than the bar's change in height (24px)
    // or the bar flickers: see 3b.
    stickAfter: 56,
    unstickBefore: 8,

    // Hide the loader if the page still hasn't changed after this long
    loaderTimeout: 10000,

    // How long a page may take before the rosette joins the progress bar
    loaderDelay: 1200,

    // What the rosette says. Say what is happening, in the reader's words.
    loaderText: {
      search:  "Searching the catalogue…",
      record:  "Opening the record…",
      account: "Loading your account…",
      signin:  "Signing you in…",
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

  /* 3b. Sticky header: the logo minimises and writes itself in
     ------------------------------------------------------------------------
     The CSS does the animating (section 3). This only says when. Two
     invisible markers sit at the top of the page, and an
     IntersectionObserver reports when they leave or come back on screen.
     Nothing runs while scrolling.

       html.aj-stuck      the page has scrolled past the far marker
       html.aj-unstuck    it has come back to the near one (plays the reverse, once)
       html.aj-stuck-now  it opened already scrolled: no animation

     Why two markers (v7). The bar is 24px shorter once stuck, and the
     browser's scroll anchoring moves the page by that much each time it
     changes, to keep the text in place. With one 24px threshold, every
     change pushed the page back across it: scrolling up slowly near the
     top, the bar flipped between its two sizes and the animations
     replayed. Now it shrinks after 56px and grows only above 8px, a gap
     wider than the 24px jump, so the jump can never undo the change.

     --aj-header-h keeps anchor jumps below whichever bar sticks,
     whatever height it is. */
  safely(function () {
    var header = document.getElementById("header-region");
    if (!header) { return; }

    /* v7: on the results and record pages the search band is the bar that
       sticks, and the header scrolls away (CSS section 10d) */
    var band = document.getElementById("opac-main-search");
    var bandSticks = !!band && (document.body.id === "results" || document.body.id === "opac-detail");
    var sticky = bandSticks ? band : header;

    function measure() {
      root.style.setProperty("--aj-header-h", sticky.offsetHeight + "px");
    }
    measure();
    if ("ResizeObserver" in window) {
      new ResizeObserver(measure).observe(sticky);
    } else {
      window.addEventListener("resize", measure);
    }

    if (bandSticks || !("IntersectionObserver" in window)) { return; }
    function marker(height) {
      var m = document.createElement("div");
      m.className = "aj-scroll-marker";
      m.setAttribute("aria-hidden", "true");
      m.style.cssText =
        "position:absolute;top:0;left:0;width:1px;height:" + height + "px;pointer-events:none;visibility:hidden";
      document.body.prepend(m);
      return m;
    }
    var far = marker(AJ.stickAfter);
    var near = marker(AJ.unstickBefore);
    var cls = root.classList;
    var first = true;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (first) { return; }
        if (entry.target === far && !entry.isIntersecting && !cls.contains("aj-stuck")) {
          cls.remove("aj-unstuck", "aj-stuck-now");
          cls.add("aj-stuck");
        } else if (entry.target === near && entry.isIntersecting && cls.contains("aj-stuck")) {
          cls.remove("aj-stuck", "aj-stuck-now");
          cls.add("aj-unstuck");
        }
      });
      if (first) {
        first = false;
        var farEntry = entries.filter(function (e) { return e.target === far; })[0];
        if (farEntry && !farEntry.isIntersecting) { cls.add("aj-stuck", "aj-stuck-now"); }
      }
    });
    io.observe(far);
    io.observe(near);
  });

  /* 3c. Account pages: the reader's name, shortened
     ------------------------------------------------------------------------
     Koha prints the full name with the ITS number in the breadcrumbs and
     twice on Your summary ("Hello, 30454007-Mulla ..."). The account menu
     already uses the first name; these follow it. The menu's current
     page is also marked for screen readers. */
  safely(function () {
    var name = window.ajOpac.firstName;

    var crumb = document.querySelector('#breadcrumbs a[href*="opac-user.pl"]');
    if (crumb && crumb.querySelector(".surname")) {
      crumb.textContent = AJ.accountCrumb;
    }

    var active = document.querySelector("#menu li.active > a");
    if (active) { active.setAttribute("aria-current", "page"); }

    if (!name || document.body.id !== "opac-user") { return; }
    var hello = document.querySelector(".maincontent > h1 + p");
    if (!hello || !hello.querySelector(".surname")) { return; }
    var notYou = hello.querySelector("a");
    hello.textContent = AJ.hello.replace("{name}", name) + " ";
    if (notYou) {
      notYou.textContent = AJ.notYou.replace("{name}", name);
      hello.appendChild(notYou);
    }
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
    // On <html>, so the footer's rosette watermark can use the outline too
    root.style.setProperty("--aj-ros-line", ROSETTE.line);
    root.style.setProperty("--aj-ros-fill", ROSETTE.fill);
    root.classList.add("aj-ros");
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
      if (where === "signin") { return t.signin; }
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
      // v7: Koha's login form posts back to the page that asked for it, so
      // after a search it said "Searching the catalogue…". Koha's login
      // forms (the page and the pop-up) are a sign-in, whatever their address.
      if (form.querySelector('input[name="koha_login_context"]') || /^(auth|modalAuth)$/.test(form.id)) {
        where = "signin";
      }
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


/* "More options" menu (v8.2, new) — used by Parts F, I, J and K
   ==========================================================================
   Options students rarely need (Print, Cite, Save record, More searches,
   the librarian views, Send, Download…) go in here instead of on screen.
   They stay one press away. Koha's own links and buttons are MOVED in, not
   copied, so Koha's handlers (the Cite and Lists pop-ups, the export
   links, DataTables' CSV button) keep working.

   It is the design system's Menu (components/Menu/README.md): a
   disclosure of links and buttons, not role="menu". It opens on a press,
   Enter, Space or ArrowDown (which focuses the first item); ArrowUp,
   ArrowDown, Home and End move; Escape closes it and puts focus back on
   the trigger; Tab or a press outside closes it.

   It is placed against the window (position: fixed), so it is never cut
   off by a card that clips its corners or by a scrolling pull-out. It
   opens below its trigger, or above when there is no room below, and
   lines up with the trigger's reading-end edge.

     var m = ajOpac.moreMenu({ label: "More options" });
     m.header("Download record as");
     m.add(someLink);            // a Koha <a> or <button>, moved in
     container.appendChild(m.el);

   iconOnly: true gives a 44px round trigger with the label read out only
   (results rows); name is then its accessible name ("More options for …").
   ========================================================================== */
(function () {
  var count = 0;
  var DOTS = '<svg class="aj-more__dots" viewBox="0 0 20 20" aria-hidden="true" focusable="false">' +
    '<circle cx="4" cy="10" r="1.75"/><circle cx="10" cy="10" r="1.75"/><circle cx="16" cy="10" r="1.75"/></svg>';
  var openNow = null;

  window.ajOpac.moreMenu = function (opts) {
    opts = opts || {};
    var el = window.ajOpac.el;
    var id = "aj-more-" + (++count);
    var wrap = el("div", "aj-more" + (opts.cls ? " " + opts.cls : ""));
    var btn = el("button", "aj-more__btn" + (opts.iconOnly ? " aj-more__btn--icon" : ""));
    btn.type = "button";
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-controls", id);
    btn.innerHTML = DOTS;
    if (opts.iconOnly) { btn.setAttribute("aria-label", opts.name || opts.label || "More options"); }
    else { btn.appendChild(el("span", null, opts.label || "More options")); }
    var menu = el("ul", "aj-more__menu");
    menu.id = id;
    menu.hidden = true;
    wrap.appendChild(btn);
    wrap.appendChild(menu);
    var hideTimer = null;

    function items() {
      return Array.prototype.filter.call(menu.querySelectorAll(".aj-more__item"), function (i) {
        return !i.disabled && !i.classList.contains("disabled") && i.offsetParent !== null;
      });
    }

    /* Below the trigger, its reading-end edges lined up; above it when the
       window has no room below. Measured once shown, then corrected, so a
       transformed parent (a pull-out mid-animation) can't throw it off. */
    function place() {
      var gap = 6, pad = 8;
      var b = btn.getBoundingClientRect();
      var rtl = getComputedStyle(wrap).direction === "rtl";
      menu.style.top = "0px";
      menu.style.left = "0px";
      var r = menu.getBoundingClientRect();
      var w = r.width, h = r.height;
      var vw = document.documentElement.clientWidth, vh = window.innerHeight;
      var up = opts.up || (b.bottom + gap + h > vh - pad && b.top - gap - h > pad);
      var top = up ? b.top - gap - h : b.bottom + gap;
      // opts.align "start": open from the trigger's reading-start edge
      var left = opts.align === "start" ? (rtl ? b.right - w : b.left) : (rtl ? b.left : b.right - w);
      left = Math.max(pad, Math.min(left, vw - w - pad));
      top = Math.max(pad, top);
      // r is where (0,0) actually landed: correct for any containing block
      menu.style.top = (top - r.top) + "px";
      menu.style.left = (left - r.left) + "px";
      menu.classList.toggle("is-up", !!up);
    }

    function onScroll() { if (!menu.hidden) { place(); } }
    function outside(e) {
      if (!wrap.contains(e.target)) { close(false); }
    }

    function open(focusFirst) {
      if (openNow && openNow !== api) { openNow.close(false); }
      clearTimeout(hideTimer);
      menu.classList.remove("is-closing");
      menu.hidden = false;
      place();
      wrap.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
      openNow = api;
      document.addEventListener("pointerdown", outside, true);
      window.addEventListener("scroll", onScroll, true);
      window.addEventListener("resize", onScroll);
      if (focusFirst) { var f = items()[0]; if (f) { f.focus(); } }
    }

    function close(returnFocus) {
      if (menu.hidden) { return; }
      wrap.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
      menu.classList.add("is-closing");
      hideTimer = setTimeout(function () { menu.hidden = true; menu.classList.remove("is-closing"); }, 150);
      if (openNow === api) { openNow = null; }
      document.removeEventListener("pointerdown", outside, true);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
      if (returnFocus) { btn.focus(); }
    }

    btn.addEventListener("click", function () {
      if (menu.hidden || menu.classList.contains("is-closing")) { open(false); } else { close(false); }
    });
    btn.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); open(true); }
      else if (e.key === "Escape" && !menu.hidden) { e.preventDefault(); e.stopPropagation(); close(true); }
    });
    menu.addEventListener("keydown", function (e) {
      var list = items(), i = list.indexOf(document.activeElement);
      if (e.key === "ArrowDown") { e.preventDefault(); (list[i + 1] || list[0]).focus(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); (list[i - 1] || list[list.length - 1]).focus(); }
      else if (e.key === "Home") { e.preventDefault(); list[0].focus(); }
      else if (e.key === "End") { e.preventDefault(); list[list.length - 1].focus(); }
      else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(true); }
      else if (e.key === "Tab") { close(false); }
    });
    // An item was chosen: its own action runs first, then the menu goes
    menu.addEventListener("click", function (e) {
      if (e.target.closest(".aj-more__item")) { setTimeout(function () { close(false); }, 0); }
    });

    var api = {
      el: wrap, button: btn, menu: menu, open: open, close: close,
      add: function (node) {
        var li = el("li");
        node.classList.add("aj-more__item");
        node.classList.remove("btn", "btn-link", "btn-lg", "btn-sm", "btn-xs", "dropdown-item", "dropdown-toggle", "dt-button");
        li.appendChild(node);
        menu.appendChild(li);
        return node;
      },
      header: function (text) {
        var li = el("li", "aj-more__header", text);
        li.setAttribute("role", "presentation");
        menu.appendChild(li);
      },
      divider: function () {
        var li = el("li", "aj-more__divider");
        li.setAttribute("role", "presentation");
        menu.appendChild(li);
      },
      isEmpty: function () { return !menu.querySelector(".aj-more__item"); }
    };
    return api;
  };
})();


/* PART B. "My library" card — middle column of the home page
   Needs: the box with id="aj-my-library" (OpacMainUserBlock_V4.html),
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
    nothing: "Nothing on loan right now",
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
    /* v8.2: only the rows with something in them. Five rows of 0 said
       nothing; when every one is 0 a single line says so. */
    var rows = [
      [TEXT.checkedOut, summary.checkedOut, "/cgi-bin/koha/opac-user.pl?tab=opac-user-checkouts"],
      [TEXT.dueSoon, summary.dueSoon, "/cgi-bin/koha/opac-user.pl?tab=opac-user-checkouts", "soon"],
      [TEXT.overdue, summary.overdue, "/cgi-bin/koha/opac-user.pl?tab=opac-user-overdues", "alert"],
      [TEXT.ready, summary.ready, "/cgi-bin/koha/opac-user.pl?tab=opac-user-holds", "good"],
      [TEXT.holds, summary.holds, "/cgi-bin/koha/opac-user.pl?tab=opac-user-holds"]
    ].filter(function (r) { return r[1]; });
    rows.forEach(function (r) { statusRow(list, r[0], r[1], r[2], r[3]); });
    if (!rows.length && !summary.charges) {
      var none = el("li", "aj-ml__row aj-ml__row--none");
      var na = el("a", "aj-ml__link");
      na.href = "/cgi-bin/koha/opac-user.pl";
      na.appendChild(el("span", "aj-ml__label", TEXT.nothing));
      none.appendChild(na);
      list.appendChild(none);
    }
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

    /* v8.2: with no notices the card goes, and My library takes the
       row (CSS 20f), instead of half the page saying "no notices". */
    function noNews() {
      box.appendChild(el("p", "aj-news__empty", TEXT.none));
      box.hidden = true;
      var home = document.getElementById("aj-home");
      if (home) { home.classList.add("aj-home--no-news"); }
    }

    if (!items.length) {
      noNews();
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
      noNews();
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


/* PART F. Search results: full-width list, Filters pull-out, quick filters
   Design system: ResultsPage and FilterDrawer. Runs on opac-search.pl
   results only (Koha gives that page <body id="results">).

   1. Koha's "Refine your search" block moves, as it is, into a
      <dialog class="aj-drawer">. Moving it rather than copying it keeps
      Koha's own "Show more" links working.
   2. The facet column is hidden and the results take the full width
      (html.aj-results-ready; CSS section 10b).
   3. Above the results: a Filters button that opens the drawer (with a
      count of filters applied), then large buttons for the three filters
      readers use most. Available now is a one-press toggle; the other two
      open a short menu of their values.

   Every filter is still one of Koha's own facet links (limit=...), so
   choosing one reloads the page, and the page transition animates it.
   (The quick filter menus are Bootstrap dropdowns; part F does not
   leave Koha's search behaviour.)
   ========================================================================== */
try { (function () {
  "use strict";
  var aj = window.ajOpac;
  if (aj.stop || !document.body || document.body.id !== "results") { return; }

  var facets = document.getElementById("search-facets");
  var main = document.querySelector(".maincontent");
  if (!facets || !main) { return; }

  var el = aj.el;
  var root = document.documentElement;

  /* The three quick filters: the first three of these that the page has.
     Change the order to change which three show. id is the facet's <li>
     id in Koha's markup; toggle means a single on/off link. */
  var QUICK = [
    { id: "availability_facet", label: "Available now", toggle: true },
    { id: "itype_id",           label: "Item type" },
    { id: "ccode_id",           label: "Collection" },
    { id: "location_id",        label: "Location" },
    { id: "au_id",              label: "Author" }
  ];
  var QUICK_COUNT = 3;

  var TEXT = {
    filters: "Filters",
    applied: " applied",
    title: "Refine results",
    close: "Close filters",
    showOne: "Show 1 result",
    showMany: "Show {n} results",
    showAny: "Show results",
    clear: "Clear all",
    quick: "Quick filters",
    on: ", on",
    remove: "Remove",
    removeFilter: "Remove filter: ",
    more: "All filters",
    selected: " (chosen)",
    sort: "Sort: ",
    sortBy: "Sort by",
    perPage: "{n} per page",
    perPageMenu: "Results per page"
  };

  var SVG = {
    sliders: '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M3 6h8M15 6h2M3 14h2M9 14h8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="13" cy="6" r="2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="7" cy="14" r="2" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    check: '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    caret: '<svg class="aj-qf__caret" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M5 8l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    close: '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M5 5l10 10M15 5L5 15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
  };

  /* Filters in force, read from the address: Koha writes each as limit= */
  var params = new URLSearchParams(location.search);
  var limits = params.getAll("limit").filter(function (l) { return l; });
  var availableOn = limits.indexOf("available") !== -1;

  // The address without any filters, for Clear all
  function clearedUrl() {
    var p = new URLSearchParams(location.search);
    p.delete("limit");
    return location.pathname + "?" + p.toString();
  }

  // "Your search returned 16836 results." → 16836
  function resultCount() {
    var h = document.getElementById("numresults");
    var m = h && h.textContent.replace(/[,\s]/g, "").match(/(\d+)result/i);
    return m ? parseInt(m[1], 10) : null;
  }

  /* Koha marks a chosen value as
       <span class="facet-label">Book</span> [<a title="Remove facet Book">x</a>]
     Turn the "[x]" into a labelled Remove link. */
  function tidySelected(scope) {
    scope.querySelectorAll('a[title^="Remove facet"]').forEach(function (a) {
      var li = a.closest("li");
      if (!li || li.classList.contains("is-selected")) { return; }
      li.classList.add("is-selected");
      Array.prototype.forEach.call(li.childNodes, function (n) {
        if (n.nodeType === 3) { n.textContent = n.textContent.replace(/[\[\]]/g, "").trim(); }
      });
      var label = li.querySelector(".facet-label");
      var name = label ? label.textContent.trim() : "";
      a.textContent = TEXT.remove;
      a.setAttribute("aria-label", TEXT.removeFilter + name);
      a.removeAttribute("title");
      a.classList.add("aj-facet-remove");
    });
  }

  /* The values of one facet group, as { name, href, on } */
  function valuesOf(group) {
    var out = [];
    group.querySelectorAll(":scope > ul > li").forEach(function (li) {
      var label = li.querySelector(".facet-label");
      if (!label) { return; }
      var remove = li.querySelector(".aj-facet-remove, a[title^='Remove facet']");
      var link = label.querySelector("a");
      var name = label.textContent.trim();
      if (remove) { out.push({ name: name, href: remove.href, on: true }); }
      else if (link) { out.push({ name: name, href: link.href, on: false }); }
    });
    return out;
  }

  /* ---------- 1. The drawer ---------- */
  var drawer = document.createElement("dialog");
  drawer.className = "aj-drawer";
  drawer.id = "aj-filters";
  drawer.setAttribute("aria-labelledby", "aj-filters-title");

  var head = el("div", "aj-drawer__head");
  head.appendChild(el("h2", null, TEXT.title)).id = "aj-filters-title";
  var closeBtn = el("button", "aj-drawer__close");
  closeBtn.type = "button";
  closeBtn.setAttribute("aria-label", TEXT.close);
  closeBtn.setAttribute("data-aj-close", "");
  closeBtn.innerHTML = SVG.close;
  head.appendChild(closeBtn);

  var body = el("div", "aj-drawer__body");
  var facetCol = facets.closest('[class*="col-"]');
  body.appendChild(facets);
  tidySelected(facets);

  var foot = el("div", "aj-drawer__foot");
  if (limits.length) {
    var clear = el("a", "btn btn-default", TEXT.clear);
    clear.href = clearedUrl();
    foot.appendChild(clear);
  }
  var n = resultCount();
  var show = el("button", "btn btn-primary",
    n === null ? TEXT.showAny :
    n === 1 ? TEXT.showOne : TEXT.showMany.replace("{n}", n.toLocaleString("en")));
  show.type = "button";
  show.setAttribute("data-aj-close", "");
  foot.appendChild(show);

  drawer.appendChild(head);
  drawer.appendChild(body);
  drawer.appendChild(foot);
  document.body.appendChild(drawer);

  var opener = null;
  function openDrawer(trigger, groupId) {
    if (!drawer.showModal) { return; }
    opener = trigger || null;
    drawer.showModal();
    filtersBtn.setAttribute("aria-expanded", "true");
    // Always open at the top: the browser otherwise keeps whatever
    // scroll position the facets block had
    body.scrollTop = 0;
    closeBtn.focus({ preventScroll: true });
    if (groupId) {
      var heading = document.querySelector("#" + groupId + " h3");
      if (heading) {
        heading.scrollIntoView({ block: "start" });
        heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: true });
      }
    }
  }
  drawer.addEventListener("click", function (event) {
    // A click on the dimmed page lands on the dialog itself
    if (event.target === drawer || event.target.closest("[data-aj-close]")) {
      drawer.close();
      return;
    }
    // A filter was chosen: get out of the way of the page loader
    if (event.target.closest("a[href]") && !event.defaultPrevented) {
      setTimeout(function () { if (drawer.open) { drawer.close(); } }, 0);
    }
  });
  drawer.addEventListener("close", function () {
    filtersBtn.setAttribute("aria-expanded", "false");
    (opener || filtersBtn).focus();
    opener = null;
  });

  /* ---------- 2. Results take the full width ---------- */
  if (facetCol && facetCol !== main && !facetCol.contains(main)) {
    facetCol.classList.add("aj-facets-col");
  }
  root.classList.add("aj-results-ready");

  /* ---------- 3. The bar ---------- */
  var bar = el("div", "aj-rbar");

  var filtersBtn = el("button", "aj-filter-btn");
  filtersBtn.type = "button";
  filtersBtn.setAttribute("aria-haspopup", "dialog");
  filtersBtn.setAttribute("aria-controls", drawer.id);
  filtersBtn.setAttribute("aria-expanded", "false");
  filtersBtn.innerHTML = SVG.sliders;
  filtersBtn.appendChild(el("span", null, TEXT.filters));
  if (limits.length) {
    var badge = el("span", "aj-filter-btn__count", String(limits.length));
    badge.appendChild(el("span", "sr-only", TEXT.applied));
    filtersBtn.appendChild(badge);
  }
  filtersBtn.addEventListener("click", function () { openDrawer(filtersBtn); });
  bar.appendChild(filtersBtn);

  var quick = el("div", "aj-rbar__quick");
  quick.setAttribute("role", "group");
  quick.setAttribute("aria-label", TEXT.quick);
  var hasDropdown = !!(window.bootstrap && window.bootstrap.Dropdown);

  QUICK.filter(function (q) { return document.getElementById(q.id); })
    .slice(0, QUICK_COUNT)
    .forEach(function (q) {
      var group = document.getElementById(q.id);

      if (q.toggle) {
        var link = group.querySelector("a[href]");
        if (!link) { return; }
        var chip = el("a", "aj-qf" + (availableOn ? " is-on" : ""));
        chip.href = link.href;
        chip.innerHTML = availableOn ? SVG.check : "";
        chip.appendChild(el("span", null, q.label));
        if (availableOn) { chip.appendChild(el("span", "sr-only", TEXT.on)); }
        quick.appendChild(chip);
        return;
      }

      var values = valuesOf(group);
      if (!values.length) { return; }
      var chosen = values.filter(function (v) { return v.on; });

      var wrap = el("div", "dropdown");
      var btn = el("button", "aj-qf" + (chosen.length ? " is-on" : ""));
      btn.type = "button";
      btn.setAttribute("aria-expanded", "false");
      if (chosen.length) { btn.innerHTML = SVG.check; }
      btn.appendChild(el("span", null, chosen.length ?
        q.label + ": " + chosen[0].name + (chosen.length > 1 ? " +" + (chosen.length - 1) : "") :
        q.label));
      btn.insertAdjacentHTML("beforeend", SVG.caret);
      wrap.appendChild(btn);

      if (!hasDropdown) {
        // No Bootstrap: the button opens the drawer at this group instead
        btn.setAttribute("aria-haspopup", "dialog");
        btn.addEventListener("click", function () { openDrawer(btn, q.id); });
        quick.appendChild(wrap);
        return;
      }

      btn.setAttribute("data-bs-toggle", "dropdown");
      var menu = el("ul", "dropdown-menu aj-qf-menu");
      values.forEach(function (v) {
        var li = el("li");
        var a = el("a", "dropdown-item" + (v.on ? " is-on" : ""));
        a.href = v.href;
        if (v.on) {
          a.innerHTML = SVG.check;
          a.setAttribute("aria-label", TEXT.removeFilter + v.name);
        }
        a.appendChild(el("span", null, v.name));
        li.appendChild(a);
        menu.appendChild(li);
      });
      var allLi = el("li");
      var all = el("button", "dropdown-item aj-qf-menu__all", TEXT.more);
      all.type = "button";
      all.addEventListener("click", function () { openDrawer(btn, q.id); });
      allLi.appendChild(el("hr", "dropdown-divider"));
      allLi.appendChild(all);
      menu.appendChild(allLi);
      wrap.appendChild(menu);
      quick.appendChild(wrap);
    });

  if (quick.children.length) { bar.appendChild(quick); }

  /* ---------- 4. Sort and Per page (v7) ----------
     Koha's sort row (a select, another select and Go) becomes one
     pull-out at the end of the bar, in the design system's ResultsPage
     shape: "Sort: Relevance", with the sort orders, then the page sizes,
     in two labelled groups. Each choice is a link to the same search
     with sort_by= or count= changed, as Koha's own form would send, back
     on page 1. The labels come from Koha's options, so they follow the
     page's language. */
  function withParam(name, value) {
    var p = new URLSearchParams(location.search);
    p.set(name, value);
    p.delete("offset");
    return location.pathname + "?" + p.toString();
  }

  function choices(select, param) {
    var seen = {};
    return Array.prototype.filter.call(select.options, function (o) {
      if (!o.value || seen[o.value]) { return false; }
      seen[o.value] = true;
      return true;
    }).map(function (o) {
      return { name: o.textContent.trim(), href: withParam(param, o.value), on: o.selected, value: o.value };
    });
  }

  function addGroup(menu, title, items) {
    var head = el("li");
    head.appendChild(el("h3", "dropdown-header", title));
    menu.appendChild(head);
    items.forEach(function (it) {
      var li = el("li");
      var a = el("a", "dropdown-item" + (it.on ? " is-on" : ""));
      a.href = it.href;
      if (it.on) {
        a.innerHTML = SVG.check;
        a.setAttribute("aria-current", "true");
      }
      a.appendChild(el("span", null, it.name));
      li.appendChild(a);
      menu.appendChild(li);
    });
  }

  var end = el("div", "aj-rbar__end");
  var sortSelect = document.getElementById("sort_by");
  var countSelect = document.getElementById("results_per_page");
  if (hasDropdown && sortSelect && sortSelect.options.length) {
    var sorts = choices(sortSelect, sortSelect.name || "sort_by");
    var sortOn = sorts.filter(function (o) { return o.on; })[0] || sorts[0];

    var sortWrap = el("div", "dropdown");
    var sortBtn = el("button", "aj-qf");
    sortBtn.type = "button";
    sortBtn.setAttribute("aria-expanded", "false");
    sortBtn.setAttribute("data-bs-toggle", "dropdown");
    sortBtn.appendChild(el("span", null, TEXT.sort + sortOn.name));
    sortBtn.insertAdjacentHTML("beforeend", SVG.caret);

    var sortMenu = el("ul", "dropdown-menu dropdown-menu-end aj-qf-menu aj-qf-menu--end");
    addGroup(sortMenu, TEXT.sortBy, sorts);
    if (countSelect && countSelect.options.length) {
      var counts = choices(countSelect, countSelect.name || "count").map(function (o) {
        o.name = TEXT.perPage.replace("{n}", o.value);
        return o;
      });
      var divider = el("li");
      divider.appendChild(el("hr", "dropdown-divider"));
      sortMenu.appendChild(divider);
      addGroup(sortMenu, TEXT.perPageMenu, counts);
    }
    sortWrap.appendChild(sortBtn);
    sortWrap.appendChild(sortMenu);
    end.appendChild(sortWrap);
  }
  if (end.children.length) {
    bar.appendChild(end);
  } else {
    // No pull-out could be built: Koha's own sort row comes back
    var toolbar = document.getElementById("toolbar");
    if (toolbar) { toolbar.style.display = "flex"; }
  }

  /* The bar sits in the sticky search band (CSS section 10d). The quick
     filters scroll sideways on narrower screens, and a menu inside a
     scrolling box would be cut off at its edge, so the menus are placed
     against the window instead (Popper's fixed strategy). */
  var band = document.getElementById("opac-main-search");
  if (band) {
    band.appendChild(bar);
  } else {
    var count = document.getElementById("numresults");
    if (count && count.parentNode === main) { count.after(bar); }
    else { main.prepend(bar); }
  }
  if (hasDropdown) {
    bar.querySelectorAll('[data-bs-toggle="dropdown"]').forEach(function (t) {
      window.bootstrap.Dropdown.getOrCreateInstance(t, {
        popperConfig: function (c) { c.strategy = "fixed"; return c; }
      });
    });
  }
})(); } catch (err) { if (window.console) console.warn("OPACUserJS part F:", err); }


/* PART F2. Result rows and "Select titles"                      (v8.2, new)
   ==========================================================================
   Each result now shows what a student needs to decide, and no more:
     title
     author, year                 ("Yucel Salih, 2008": no "A · B" strings)
     On the shelf / On loan       (an icon and words, not colour alone)
     [Click & Collect] [Add to cart] [⋯]
   Koha's edition, material type, format, literary form, language,
   publication details, empty "Other title:" lines and 0-vote star ratings
   are hidden (CSS 20b), and stay on the record page. Koha's availability
   line stays in the page, hidden, because Part E reads it.

   "Save to lists" moves into the row's ⋯ menu (the shared moreMenu).

   Select titles. The checkboxes and Koha's "Select titles to…" toolbar
   are hidden until the reader presses "Select titles" in the results bar
   (html.aj-selecting). Then a sticky toolbar says how many are ticked,
   its actions wake up once one is, and "Done" leaves the mode. Leaving
   clears the ticks, so no hidden selection survives.
   ========================================================================== */
try { (function () {
  "use strict";
  var aj = window.ajOpac;
  if (aj.stop || !document.body || document.body.id !== "results") { return; }
  var el = aj.el;
  var root = document.documentElement;

  var TEXT = {
    shelf: "On the shelf",
    loan: "On loan",
    read: "Read in the library only",
    notNow: "Not available now",
    more: "More options",
    moreFor: "More options for ",
    select: "Select titles",
    done: "Done",
    none: "Tick titles to act on them",
    one: "1 selected",
    many: " selected"
  };
  var ICON = {
    shelf: '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    loan: '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 6v4.5l3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    book: '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M10 5.5C8.2 4.3 5.8 4 3 4.3v10.4c2.8-.3 5.2 0 7 1.2 1.8-1.2 4.2-1.5 7-1.2V4.3c-2.8-.3-5.2 0-7 1.2zM10 5.5v10.4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    select: '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><rect x="3" y="3" width="14" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M6.5 10.2l2.4 2.4 4.6-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  /* ---------- 1. Each row ---------- */
  function yearOf(ts) {
    var pub = ts.querySelector(".results_summary.publisher, .results_summary.rda264");
    var m = pub && /\b(1[5-9]\d\d|20\d\d)\b/.exec(pub.textContent);
    return m ? m[1] : "";
  }

  function tidyRow(ts) {
    if (ts.getAttribute("data-aj-row")) { return; }
    ts.setAttribute("data-aj-row", "1");

    // Author, year
    var year = yearOf(ts);
    if (year) {
      var y = el("span", "aj-year");
      y.dir = "ltr";
      var author = ts.querySelector("ul.author");
      if (author) {
        // the year is isolated (dir=ltr); the comma is the page's own
        y.textContent = year;
        var last = author.lastElementChild || author;
        last.appendChild(document.createTextNode(/^ar/i.test(document.documentElement.lang || "") ? "، " : ", "));
        last.appendChild(y);
      } else {
        var line = el("p", "aj-year-line");
        y.textContent = year;
        line.appendChild(y);
        var title = ts.querySelector("a.title");
        if (title) { title.after(line); } else { ts.prepend(line); }
      }
    }

    // Empty lines ("Other title:" with nothing after it)
    ts.querySelectorAll(".results_summary").forEach(function (s) {
      var t = s.textContent.replace(/\s+/g, " ");
      var label = s.querySelector(".label");
      if (label) { t = t.replace(label.textContent.replace(/\s+/g, " "), ""); }
      if (!t.replace(/[\s:;,.]/g, "")) { s.classList.add("aj-empty"); }
    });

    // One status line in place of Koha's availability sentence
    var av = ts.querySelector(".results_summary.availability");
    if (av) {
      /* "Read in library only (Click & Collect)" copies are not
         unavailable: they can be ordered and read at the library */
      var state = av.querySelector(".available") ? "shelf" :
        /read in (the )?library/i.test(av.textContent) ? "read" :
        /checked out|on loan/i.test(av.textContent) ? "loan" : "other";
      var st = el("p", "aj-status is-" + state);
      st.innerHTML = state === "shelf" ? ICON.shelf : state === "read" ? ICON.book : ICON.loan;
      st.appendChild(el("span", null, state === "shelf" ? TEXT.shelf : state === "read" ? TEXT.read :
        state === "loan" ? TEXT.loan : TEXT.notNow));
      av.classList.add("aj-avail-orig");
      av.after(st);
    }

    // Save to lists (and anything else Koha adds) into the row's ⋯ menu
    var actions = ts.querySelector(".actions-menu");
    if (!actions || !aj.moreMenu) { return; }
    var spare = actions.querySelectorAll("a.addtoshelf, a.tag_add, a[href*='opac-tags']");
    if (!spare.length) { return; }
    var t = ts.querySelector("a.title");
    var m = aj.moreMenu({ iconOnly: true, name: TEXT.moreFor + (t ? t.textContent.trim() : ""), cls: "aj-more--row" });
    spare.forEach(function (a) {
      var holder = a.closest(".actions");
      m.add(a);
      if (holder && !holder.querySelector("a, button, .ajCCSlot")) { holder.remove(); }
    });
    var wrapper = el("span", "actions aj-actions-more");
    wrapper.appendChild(m.el);
    actions.appendChild(wrapper);
  }

  function tidyAll() {
    document.querySelectorAll(".searchresults .title_summary").forEach(function (ts) {
      try { tidyRow(ts); } catch (e) { /* one odd row never stops the rest */ }
    });
  }

  /* ---------- 2. Select titles ---------- */
  var toolbar = document.querySelector(".selections-toolbar");
  var boxes = function () { return document.querySelectorAll(".searchresults input.cb"); };
  var selBtn = null, countEl = null;

  function ticked() {
    return Array.prototype.filter.call(boxes(), function (b) { return b.checked; }).length;
  }
  function update() {
    if (!countEl) { return; }
    var n = ticked();
    countEl.textContent = n === 0 ? TEXT.none : n === 1 ? TEXT.one : n + TEXT.many;
    toolbar.classList.toggle("has-ticks", n > 0);
    // Part E's "Click & Collect selected" never needs its "select one first" alert now
    toolbar.querySelectorAll(".ajCCSel").forEach(function (b) { b.disabled = n === 0; });
  }
  function setMode(on) {
    root.classList.toggle("aj-selecting", on);
    if (selBtn) { selBtn.setAttribute("aria-pressed", on ? "true" : "false"); }
    if (!on) {
      var none = document.getElementById("CheckNone");
      if (none && ticked()) { none.click(); }
      boxes().forEach(function (b) { b.checked = false; });
    } else {
      var first = boxes()[0];
      if (first) { first.focus({ preventScroll: true }); }
    }
    update();
  }

  function buildSelect() {
    if (!toolbar || !boxes().length) { return; }
    toolbar.classList.add("aj-seltools");
    var status = el("p", "aj-seltools__count");
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    countEl = el("span", null, TEXT.none);
    status.appendChild(countEl);
    toolbar.prepend(status);
    var done = el("button", "aj-seltools__done", TEXT.done);
    done.type = "button";
    done.addEventListener("click", function () { setMode(false); if (selBtn) { selBtn.focus(); } });
    toolbar.appendChild(done);

    selBtn = el("button", "aj-qf aj-select-btn");
    selBtn.type = "button";
    selBtn.setAttribute("aria-pressed", "false");
    selBtn.innerHTML = ICON.select;
    selBtn.appendChild(el("span", null, TEXT.select));
    selBtn.addEventListener("click", function () { setMode(!root.classList.contains("aj-selecting")); });
    var end = document.querySelector(".aj-rbar .aj-rbar__end");
    var bar = document.querySelector(".aj-rbar");
    if (end) { end.prepend(selBtn); }
    else if (bar) { bar.appendChild(selBtn); }
    else { toolbar.before(selBtn); }

    document.addEventListener("change", function (e) {
      if (e.target.matches && e.target.matches("input.cb")) { update(); }
    });
    document.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest("#CheckAll, #CheckNone")) { setTimeout(update, 0); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && root.classList.contains("aj-selecting") && !document.querySelector("dialog[open], .modal.show, .aj-more.is-open")) {
        setMode(false);
        selBtn.focus();
      }
    });
    update();
  }

  function start() {
    tidyAll();
    buildSelect();
    // Part E adds "Click & Collect selected" when the page is ready
    setTimeout(update, 0);
    if (window.jQuery) { window.jQuery(function () { setTimeout(update, 0); }); }
  }
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", start); }
  else { start(); }
})(); } catch (err) { if (window.console) console.warn("OPACUserJS part F2:", err); }


/* PART J. Record page: two actions, the rest one press away     (v8.2, new)
   ==========================================================================
   Koha's action panel offers Place hold, Print, Cite, Save to your lists,
   Add to cart, Save record and More searches. Students use two of them.
   Now the panel shows:
     [Click & Collect]   (Part E puts it where Place hold was)
     [Add to cart]       (Part H makes it add and remove)
     [⋯ More options]    Save to your lists, Print, Cite,
                         Download record as…, Search for this title in…,
                         Librarian views (MARC, ISBD)
   The Normal / MARC / ISBD pills go into the menu too. On the MARC and
   ISBD pages a single "Back to the record" link stays on screen.

   Layout (record page audit, audits/v8.2-record-page.md): the actions
   leave Koha's right-hand column for a "Get this title" strip under the
   title and author, which first says where the book is ("On the shelf,
   Mezzanine Floor Stack, call number 268"). The emptied column goes (its
   Cite and export pop-ups move to the page first), so the record and
   its holdings use the full width. Koha's labels read "by", "Published"
   and "Subjects"; the title loses its "/ Author." statement.

   Details: author, publication and subjects stay. Material type,
   language, edition, description, classification and the star rating
   go into "More about this title". Empty separators in Koha's
   description ("; ; ; 140; Spiral") are tidied.

   Holdings: "Current library" becomes "Where to find it" (the shelf, as
   there is one library); "Total holds: 0" is hidden; on phones each copy
   is a card (CSS 20d), with labels written onto the cells here.
   ========================================================================== */
try { (function () {
  "use strict";
  var aj = window.ajOpac;
  if (aj.stop) { return; }
  var path = location.pathname;
  var bid = (document.body && document.body.id || "").toLowerCase();
  var isRecord = /opac-detail\.pl$/.test(path) || bid === "opac-detail";
  var isLibView = /opac-(MARC|ISBD)detail\.pl$/i.test(path) || /^opac-(marc|isbd)detail$/.test(bid);
  if (!isRecord && !isLibView) { return; }
  var el = aj.el;

  var TEXT = {
    more: "More options",
    lists: "Save to your lists",
    download: "Download record as",
    searchIn: "Search for this title in",
    views: "Librarian views",
    back: "Back to the record",
    about: "More about this title",
    where: "Where to find it",
    getIt: "Get this title",
    onShelf: "On the shelf",
    someOnShelf: "{n} of {t} copies on the shelf",
    onLoan: "On loan",
    readOnly: "Read in the library only",
    dueBack: ", due back ",
    notNow: "Not available now",
    callNo: "call number ",
    by: "by",
    published: "Published",
    subjects: "Subjects",
    summary: "Summary",
    showMore: "Show more",
    showLess: "Show less",
    thisEdition: "This edition",
    catalogue: "Catalogue details"
  };
  var ICON = {
    shelf: '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    clock: '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 6v4.5l3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    book: '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M10 5.5C8.2 4.3 5.8 4 3 4.3v10.4c2.8-.3 5.2 0 7 1.2 1.8-1.2 4.2-1.5 7-1.2V4.3c-2.8-.3-5.2 0-7 1.2zM10 5.5v10.4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>'
  };

  /* ---------- 1. The action panel ---------- */
  function buildActions() {
    var ul = document.getElementById("action");
    if (!ul || !aj.moreMenu) { return; }
    var m = aj.moreMenu({ label: TEXT.more, cls: "aj-more--record" });

    var keep = function (li) {
      return li.querySelector('.ajCCSlot, a[href*="opac-reserve.pl"], a.addtocart, a.addrecord, a[class*="cart"]');
    };
    var lists = [], plain = [], exportItems = [], searchItems = [];
    Array.prototype.slice.call(ul.children).forEach(function (li) {
      if (keep(li)) { li.classList.add("aj-action-main"); return; }
      var exp = li.querySelector("#export, #format");
      var further = li.querySelector("#furthersearches");
      if (exp) {
        li.querySelectorAll(".dropdown-menu a").forEach(function (a) { exportItems.push(a); });
      } else if (further) {
        li.querySelectorAll(".dropdown-menu a").forEach(function (a) { searchItems.push(a); });
      } else {
        li.querySelectorAll("a, button").forEach(function (a) {
          (a.classList.contains("addtoshelf") ? lists : plain).push(a);
        });
      }
      li.remove();
    });

    lists.forEach(function (a) { m.add(a); });
    plain.forEach(function (a) { m.add(a); });
    if (exportItems.length) {
      m.divider();
      m.header(TEXT.download);
      exportItems.forEach(function (a) { m.add(a); });
    }
    if (searchItems.length) {
      m.divider();
      m.header(TEXT.searchIn);
      searchItems.forEach(function (a) { m.add(a); });
    }

    // Normal / MARC / ISBD
    var views = document.getElementById("views");
    if (views) {
      var other = Array.prototype.filter.call(views.querySelectorAll("a[href]"), function (a) {
        return !/opac-detail\.pl/.test(a.getAttribute("href") || "");
      });
      var normal = views.querySelector('a[href*="opac-detail.pl"]');
      if (other.length) {
        m.divider();
        m.header(TEXT.views);
        other.forEach(function (a) { m.add(a); });
      }
      if (normal) {
        var back = el("a", "aj-back-record", TEXT.back);
        back.href = normal.href;
        views.before(back);
      }
      views.classList.add("aj-views-moved");
    }

    if (!m.isEmpty()) {
      var li = el("li", "aj-action-more");
      li.appendChild(m.el);
      ul.appendChild(li);
    }
    ul.classList.add("aj-actions-ready");
  }

  /* ---------- 2. "Get it": where it is and how to get it, under the title
     (v8.2 record page layout, audits/v8.2-record-page.md). One sand
     strip joins the answer to "is it here, where?" with the actions:
       ✓ On the shelf   Mezzanine Floor Stack, call number 268
       [Click & Collect] [Add to cart] [⋯ More options]
     The action list leaves Koha's right-hand column, which then goes, so
     the record and its holdings take the page's full width. ---------- */
  function statusLine() {
    var t = document.getElementById("holdingst");
    if (!t) { return null; }
    var rows = Array.prototype.filter.call(t.querySelectorAll("tbody tr"), function (r) {
      return !r.classList.contains("child") && r.querySelector("td.status");
    });
    if (!rows.length) { return null; }
    var free = rows.filter(function (r) { return r.querySelector(".item-status.available"); });
    var READ = /read in (the )?library/i;
    var reading = rows.filter(function (r) { return READ.test((r.querySelector("td.status") || r).textContent); });
    var first = free[0] || reading[0] || rows[0];
    var txt = function (sel) {
      var n = first.querySelector(sel);
      return n ? n.textContent.replace(/\s+/g, " ").trim() : "";
    };
    var shelf = txt("td.location .shelvingloc") || txt("td.location");
    var call = txt("td.call_no");
    var state, cls;
    if (free.length) {
      state = rows.length > 1 ? TEXT.someOnShelf.replace("{n}", free.length).replace("{t}", rows.length) : TEXT.onShelf;
      cls = "is-shelf";
    } else if (reading.length) {
      state = TEXT.readOnly;
      cls = "is-read";
    } else {
      var raw = txt("td.status");
      var due = /due\s*:?\s*([0-9][0-9\/.\-]+)/i.exec(raw);
      state = /checked out|on loan/i.test(raw) ? TEXT.onLoan + (due ? TEXT.dueBack + due[1] : "") : (raw || TEXT.notNow);
      cls = "is-out";
    }
    var p = el("p", "aj-get__status " + cls);
    p.setAttribute("role", "status");
    var s = el("span", "aj-get__state");
    s.innerHTML = free.length ? ICON.shelf : cls === "is-read" ? ICON.book : ICON.clock;
    s.appendChild(el("span", null, state));
    p.appendChild(s);
    var where = [shelf, call ? TEXT.callNo + call : ""].filter(Boolean).join(", ");
    if (where) {
      var w = el("span", "aj-get__where", where);
      w.dir = "auto";
      p.appendChild(w);
    }
    return p;
  }

  function buildHero() {
    var ul = document.getElementById("action");
    var record = document.querySelector("#catalogue_detail_biblio > .record");
    if (!ul || !record) { return; }
    var anchor = record.querySelector(":scope > .results_summary.author") || record.querySelector(":scope > h1.title");
    if (!anchor) { return; }
    var panel = document.getElementById("ulactioncontainer");
    var strip = el("section", "aj-get");
    strip.setAttribute("aria-label", TEXT.getIt);
    var line = statusLine();
    if (line) { strip.appendChild(line); }
    strip.appendChild(ul);
    anchor.after(strip);

    // Koha's right-hand column, now empty, goes; the record takes the width
    var col = panel && panel.closest('[class*="col-"]');
    var main = document.getElementById("catalogue_detail_biblio").closest('[class*="col-"]');
    if (col && main && col !== main && !col.contains(main)) {
      // Koha keeps its Cite and export pop-ups in this column; a pop-up
      // inside a hidden column can't show, so they move to the page first
      col.querySelectorAll(".modal").forEach(function (m) { document.body.appendChild(m); });
      var rest = Array.prototype.some.call(col.querySelectorAll("*"), function (n) {
        return !n.closest("script, style") && n.children.length === 0 &&
          (n.textContent.trim() || /^(IMG|IFRAME|INPUT|SELECT|BUTTON|VIDEO)$/.test(n.tagName));
      });
      if (!rest) {
        col.classList.add("aj-col-hidden");
        main.classList.add("aj-col-full");
      }
    }
  }

  /* Koha's words, in plain English */
  function tidyWords() {
    var crumb = document.querySelector("#breadcrumbs .breadcrumb-item:last-child");
    if (crumb) {
      var walker = document.createTreeWalker(crumb, NodeFilter.SHOW_TEXT), n;
      while ((n = walker.nextNode())) {
        n.textContent = n.textContent.replace(/^\s*Details for:\s*/i, "").replace(/\s*[\/:;,=]\s*$/, "");
      }
    }
    // "The kite runner / Khaled Hosseini." → "The kite runner": the author
    // has its own line below, so the statement of responsibility goes
    var resp = document.querySelector("h1.title > .title_resp_stmt");
    if (resp) {
      var prev = resp.previousSibling;
      if (prev && prev.nodeType === 3) { prev.textContent = prev.textContent.replace(/\s*\/\s*$/, ""); }
      resp.hidden = true;
    }
    var LABELS = [[".results_summary.author", TEXT.by], [".results_summary.publisher", TEXT.published],
      [".results_summary.rda264", TEXT.published], [".results_summary.subjects", TEXT.subjects]];
    LABELS.forEach(function (l) {
      var lab = document.querySelector("#catalogue_detail_biblio .record > " + l[0] + " > :is(.label, .byAuthor)");
      if (lab) { lab.textContent = l[1] + " "; }
    });
  }

  /* ---------- 3. Details (record page audit, RD1-RD6) ----------
     Under the strip, in the order a reader decides:
       the summary   (a paragraph, "Show more" when long)
       Published · Genre · Subjects   (label and value rows)
       More about this title          (two groups: This edition,
                                       Catalogue details)
     Koha's spans are taken apart by their labels and their content is
     MOVED into the new rows, so links (subjects, genres) keep working.
     Values lose Koha's trailing ISBD punctuation ("140882485X (pbk.) :").
     Opening "More about this title" grows smoothly (CSS 20c) and brings
     it into view, while the cover stays beside it (sticky). */
  var RENAME = {
    "publication details": "Published", "publisher": "Published", "subject(s)": "Subjects",
    "genre/form": "Genre", "ddc classification": "Classification", "description": "Physical description",
    "material type": "Material type", "content type": "Content type", "media type": "Media type",
    "carrier type": "Carrier type"
  };
  function labelOf(node) {
    var t = node.textContent.replace(/\s+/g, " ").replace(/\s*:\s*$/, "").trim();
    return RENAME[t.toLowerCase()] || t;
  }
  /* One Koha span → [{label, nodes}], split at each of its labels */
  function rowsOf(span) {
    var rows = [], cur = null;
    // Some fields nest their label one level down (Language: span.language > .label)
    if (!span.querySelector(":scope > .label, :scope > .byAuthor")) {
      var deep = span.querySelector(".label");
      if (deep) {
        var lab = labelOf(deep);
        deep.remove();
        return [{ label: lab, nodes: Array.prototype.slice.call(span.childNodes) }];
      }
    }
    Array.prototype.slice.call(span.childNodes).forEach(function (n) {
      if (n.nodeType === 1 && n.matches(".label, .byAuthor")) {
        cur = { label: labelOf(n), nodes: [] };
        rows.push(cur);
        return;
      }
      if (!cur) { cur = { label: "", nodes: [] }; rows.push(cur); }
      cur.nodes.push(n);
    });
    return rows.filter(function (r) {
      return r.nodes.some(function (n) { return n.textContent.trim() || (n.nodeType === 1 && n.querySelector("img, a")); });
    });
  }
  function tidyValue(dd) {
    // trailing ISBD punctuation, wherever the last text sits
    var walker = document.createTreeWalker(dd, NodeFilter.SHOW_TEXT), n, last = null;
    while ((n = walker.nextNode())) { if (n.textContent.trim()) { last = n; } }
    if (last) { last.textContent = last.textContent.replace(/[\s:;,\/=]+$/, ""); }
  }
  function dlOf(rows, cls) {
    var dl = el("dl", cls);
    rows.forEach(function (r) {
      var row = el("div", "aj-dl__row");
      row.appendChild(el("dt", null, r.label));
      var dd = el("dd");
      r.nodes.forEach(function (n) { dd.appendChild(n); });
      tidyValue(dd);
      row.appendChild(dd);
      dl.appendChild(row);
    });
    return dl;
  }

  function tidyDetails() {
    var record = document.querySelector("#catalogue_detail_biblio > .record");
    if (!record) { return; }

    // "; ; ; 140; Spiral" → "140; Spiral"
    var desc = record.querySelector(".results_summary.description");
    if (desc) {
      Array.prototype.forEach.call(desc.querySelectorAll(":scope > span:not(.label)"), function (s) {
        if (!s.textContent.trim()) { s.remove(); }
      });
      var seen = false;
      Array.prototype.slice.call(desc.childNodes).forEach(function (n) {
        if (n.nodeType === 3 && /^\s*;\s*$/.test(n.textContent)) {
          var prev = n.previousSibling;
          if (!seen || !prev || (prev.nodeType === 3 && /;\s*$/.test(prev.textContent))) { n.remove(); }
          else { n.textContent = "; "; }
        } else if (n.nodeType === 1 && !n.classList.contains("label")) {
          seen = true;
        }
      });
    }

    var spans = Array.prototype.filter.call(record.children, function (c) {
      return c.classList.contains("results_summary") && !c.classList.contains("author");
    });
    var rating = document.querySelector("#catalogue_detail_biblio .results_summary.ratings");
    if (rating && spans.indexOf(rating) < 0) { spans.push(rating); }
    var has = function (c, re) { return re.test(c.className); };

    var after = record.querySelector(":scope > .aj-get") ||
                record.querySelector(":scope > .results_summary.author") ||
                record.querySelector(":scope > h1.title");

    // 1. The summary
    var sumSpan = spans.filter(function (c) { return c.classList.contains("summary"); })[0];
    if (sumSpan) {
      var rows = rowsOf(sumSpan);
      var box = el("section", "aj-summary");
      box.setAttribute("aria-label", rows[0] && rows[0].label || TEXT.summary);
      var p = el("p", "aj-summary__text");
      rows.forEach(function (r) { r.nodes.forEach(function (n) { p.appendChild(n); }); });
      p.dir = "auto";
      box.appendChild(p);
      var more = el("button", "aj-summary__more", TEXT.showMore);
      more.type = "button";
      more.hidden = true;
      more.setAttribute("aria-expanded", "false");
      more.addEventListener("click", function () {
        var open = box.classList.toggle("is-open");
        more.textContent = open ? TEXT.showLess : TEXT.showMore;
        more.setAttribute("aria-expanded", open ? "true" : "false");
      });
      box.appendChild(more);
      after.after(box);
      after = box;
      sumSpan.remove();
      spans.splice(spans.indexOf(sumSpan), 1);
      requestAnimationFrame(function () { more.hidden = p.scrollHeight <= p.clientHeight + 2; });
    }

    // 2. Published, Genre, Subjects (and Series) as rows
    var FACTS = [/\b(publisher|rda264)\b/, /\bgenre\b/, /\bsubjects?\b/, /\bseries\b/];
    var factRows = [];
    FACTS.forEach(function (re) {
      spans.filter(function (c) { return has(c, re); }).forEach(function (c) {
        factRows = factRows.concat(rowsOf(c));
        c.remove();
        spans.splice(spans.indexOf(c), 1);
      });
    });
    if (factRows.length) {
      var facts = dlOf(factRows, "aj-dl aj-facts");
      after.after(facts);
      after = facts;
    }

    // 3. The rest, in two groups
    var CATALOGUE = /\b(isbn|issn|ddc|lcc|classification|ean|upc|lccn|isbd)\b/;
    var edition = [], catalogue = [];
    spans.forEach(function (c) {
      var rows = rowsOf(c);
      var isCat = CATALOGUE.test(c.className) || rows.some(function (r) { return /type$/i.test(r.label) && !/^material/i.test(r.label); });
      if (has(c, /\bratings\b/)) { c.remove(); return; }
      (isCat ? catalogue : edition).push.apply(isCat ? catalogue : edition, rows);
      c.remove();
    });
    // identifiers first, then the RDA content, media and carrier types
    var rank = function (r) { return /isbn|issn/i.test(r.label) ? 0 : /classif/i.test(r.label) ? 1 : 2; };
    catalogue.sort(function (x, y) { return rank(x) - rank(y); });
    if (!edition.length && !catalogue.length) { return; }
    var about = el("details", "aj-about");
    about.appendChild(el("summary", "aj-about__summary", TEXT.about));
    var inner = el("div", "aj-about__body");
    [[TEXT.thisEdition, edition], [TEXT.catalogue, catalogue]].forEach(function (g) {
      if (!g[1].length) { return; }
      var sec = el("section", "aj-about__group");
      sec.appendChild(el("h3", "aj-about__title", g[0]));
      sec.appendChild(dlOf(g[1], "aj-dl"));
      inner.appendChild(sec);
    });
    about.appendChild(inner);
    after.after(about);

    // Opening brings the panel into view (the cover stays alongside)
    about.addEventListener("toggle", function () {
      if (!about.open) { return; }
      var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setTimeout(function () {
        var r = about.getBoundingClientRect();
        if (r.bottom > window.innerHeight - 24) {
          about.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
        }
      }, reduce ? 0 : 60);
    });
  }

  /* ---------- 4. Holdings ---------- */
  function tidyHoldings() {
    var t = document.getElementById("holdingst");
    if (!t) { return; }
    var cur = t.querySelector("th#item_current_location");
    var loc = cur && (cur.querySelector(".dt-column-title") || cur);
    if (loc) { loc.textContent = TEXT.where; }
    var heads = Array.prototype.map.call(t.querySelectorAll("thead th"), function (th) {
      return (th.querySelector(".dt-column-title") || th).textContent.trim();
    });
    /* The rows are CSS grids (20d), and a table drawn that way can lose
       its table semantics in some browsers: say them outright */
    t.setAttribute("role", "table");
    function label() {
      Array.prototype.forEach.call(t.querySelectorAll(":scope > thead, :scope > tbody"), function (g) { g.setAttribute("role", "rowgroup"); });
      t.querySelectorAll(":scope > * > tr").forEach(function (tr) { tr.setAttribute("role", "row"); });
      t.querySelectorAll(":scope > thead th").forEach(function (th) { th.setAttribute("role", "columnheader"); });
      t.querySelectorAll(":scope > tbody td").forEach(function (td) { td.setAttribute("role", "cell"); });
      t.querySelectorAll("tbody tr").forEach(function (tr) {
        Array.prototype.forEach.call(tr.children, function (td, i) {
          if (heads[i] && !td.hasAttribute("data-label")) { td.setAttribute("data-label", heads[i]); }
        });
      });
    }
    label();
    if (window.jQuery) { window.jQuery(t).on("draw.dt", label); }
    // One copy: nothing to sort, so no sort arrows (CSS 20d)
    t.classList.toggle("aj-one-copy", t.querySelectorAll("tbody tr:not(.child)").length < 2);

    // "Holdings( 1 )" → "Holdings (1)"
    document.querySelectorAll("#bibliodescriptions .nav-link").forEach(function (a) {
      var walker = document.createTreeWalker(a, NodeFilter.SHOW_TEXT);
      var n;
      while ((n = walker.nextNode())) {
        n.textContent = n.textContent.replace(/\(\s*(\d+)\s*\)/g, "($1)").replace(/(\S)\(/g, "$1 (");
      }
      // The tab is a flex box, which drops a plain space at the edge of a
      // text run: a no-break space keeps "Holdings (1)" apart
      var span = a.querySelector("span");
      if (span && span.nextSibling && span.nextSibling.nodeType === 3 && /^\s*\(/.test(span.nextSibling.textContent)) {
        span.nextSibling.textContent = "\u00a0" + span.nextSibling.textContent.trim();
      }
    });

    // "Read in library only (Click & Collect)" → "Read in the library only"
    t.querySelectorAll("td.status .item-status").forEach(function (st) {
      if (/read in (the )?library/i.test(st.textContent)) {
        st.classList.add("aj-read");
        st.textContent = TEXT.readOnly;
      }
    });
    var holds = document.getElementById("bib_holds");
    if (holds && /:\s*0\s*$/.test(holds.textContent.trim())) { holds.hidden = true; }
  }

  function start() {
    [tidyWords, buildActions, buildHero, tidyDetails, tidyHoldings].forEach(function (fn) {
      try { fn(); } catch (e) { if (window.console) { console.warn("OPACUserJS part J:", e); } }
    });
  }
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", start); }
  else { start(); }
})(); } catch (err) { if (window.console) console.warn("OPACUserJS part J:", err); }


/* PART K. Everywhere else: header links, back to top, ratings, account
   pages and Most popular                                       (v8.2, new)
   ==========================================================================
   From the v8.2 site audit (opac/current/audits/v8.2-site-audit.md):
   G1  The "Advanced search | Authority search | Most popular" row under
       the search bar goes (CSS 20a). Advanced search becomes a button
       beside the search field (Part I opens it as the pull-out), and Most
       popular joins the account menu. Authority search, a librarian's
       tool, stays in the footer.
   G2  One back-to-top control: Koha's round button, shown only after two
       screens of scrolling (html.aj-far). The footer's link is hidden.
   G4  The home page's hidden heading says the library's name, not
       "Koha home".
   G9  Star ratings no one has used (0.0) are hidden.
   A1  Account menu: Summary, Checkout history, Holds history and Lists
       first; the rest under "Account settings".
   A2  Checkout history: CSV, Copy and Print go in a More options menu;
       columns with nothing in them are hidden.
   A3  Holds history: "Null" authors are blanked.
   A4  Lists: an empty state with a "Create a list" button.
   A5  Your summary: an empty state that says where to go next.
   P1  Most popular: the three choices apply as soon as they change.
   P2  Most popular: titles lose Koha's trailing " /", the author line
       loses the publisher and size, and columns that say the same thing
       on every row (or nothing) are hidden.
   ========================================================================== */
try { (function () {
  "use strict";
  var aj = window.ajOpac;
  if (aj.stop) { return; }
  var el = aj.el;
  var root = document.documentElement;
  var id = document.body ? document.body.id : "";

  var TEXT = {
    advanced: "Advanced search",
    popular: "Most popular",
    homeHeading: "Maktabat Aljamea (Sindh) catalogue",
    settings: "Account settings",
    more: "More options",
    listsEmpty: "You haven't made a list yet. Lists keep titles together, for a course or a topic.",
    createList: "Create a list",
    summaryEmpty: "You have nothing borrowed at the moment.",
    search: "Search the catalogue",
    arrivals: "See new arrivals"
  };

  function safely(fn) { try { fn(); } catch (e) { if (window.console) { console.warn("OPACUserJS part K:", e); } } }

  /* G1: Advanced search beside the search field; Most popular in the account menu */
  safely(function () {
    var row = document.querySelector("#searchform > .row");
    var more = document.getElementById("moresearches");
    if (!row || !more) { return; }
    var adv = more.querySelector('a[href*="opac-search.pl"]');
    if (adv && !document.querySelector(".aj-adv-btn")) {
      var col = el("div", "col-auto order-5 aj-adv-col");
      var a = el("a", "aj-adv-btn");
      a.href = adv.getAttribute("href");
      a.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M3 6h8M15 6h2M3 14h2M9 14h8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="13" cy="6" r="2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="7" cy="14" r="2" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
      a.appendChild(el("span", "aj-adv-btn__text", TEXT.advanced));
      a.setAttribute("aria-label", TEXT.advanced);
      col.appendChild(a);
      row.appendChild(col);
    }
    var pop = more.querySelector('a[href*="opac-topissues.pl"]');
    var menu = document.getElementById("loggedinuser-menu");
    if (pop && menu && !menu.querySelector('a[href*="opac-topissues.pl"]')) {
      var item = el("a", "dropdown-item", TEXT.popular);
      item.href = pop.getAttribute("href");
      var li = menu.querySelector(".aj-menu-lists") || document.getElementById("logout");
      var holder = menu.tagName === "UL" ? el("li") : null;
      if (holder) { holder.appendChild(item); }
      menu.insertBefore(holder || item, li && li.parentNode === menu ? li : null);
    }
    root.classList.add("aj-moresearches-moved");
  });

  /* G2: back to top only once it is worth it */
  safely(function () {
    var far = false;
    function check() {
      var now = window.scrollY > window.innerHeight * 2;
      if (now !== far) { far = now; root.classList.toggle("aj-far", far); }
    }
    window.addEventListener("scroll", check, { passive: true });
    check();
  });

  /* G4 */
  safely(function () {
    if (id !== "opac-main") { return; }
    var h = document.querySelector("h1.sr-only, h1.visually-hidden");
    if (h && /koha/i.test(h.textContent)) { h.textContent = TEXT.homeHeading; }
  });

  /* G9: ratings at 0.0 */
  safely(function () {
    document.querySelectorAll(".results_summary.ratings").forEach(function (r) {
      var t = r.textContent.replace(/\s+/g, " ");
      if (/Average\s*(rating)?\s*:\s*0(\.0+)?(?![.\d])|\(0 votes?\)/i.test(t)) {
        r.classList.add("aj-no-ratings");
      }
    });
  });

  /* A1: account menu */
  safely(function () {
    var menu = document.querySelector("#menu > ul");
    if (!menu) { return; }
    var MAIN = /opac-user\.pl$|opac-readingrecord\.pl|opac-holdshistory\.pl|opac-shelves\.pl/;
    var rest = Array.prototype.filter.call(menu.children, function (li) {
      var a = li.querySelector("a[href]");
      return a && !MAIN.test(a.getAttribute("href").split("?")[0]);
    });
    if (rest.length < 2) { return; }
    var box = el("details", "aj-acct-more");
    if (rest.some(function (li) { return li.classList.contains("active"); })) { box.open = true; }
    box.appendChild(el("summary", null, TEXT.settings));
    var ul = el("ul");
    rest.forEach(function (li) { ul.appendChild(li); });
    box.appendChild(ul);
    var li = el("li", "aj-acct-more-item");
    li.appendChild(box);
    menu.appendChild(li);
  });

  /* A2: Checkout history (and any account table with DataTables buttons) */
  function tidyExports() {
    document.querySelectorAll(".dt-buttons").forEach(function (bar) {
      if (bar.getAttribute("data-aj") || !aj.moreMenu) { return; }
      var exp = bar.querySelectorAll(".buttons-csv, .buttons-copy, .buttons-print, .buttons-excel");
      if (!exp.length) { return; }
      bar.setAttribute("data-aj", "1");
      var m = aj.moreMenu({ label: TEXT.more, cls: "aj-more--table" });
      exp.forEach(function (b) { m.add(b); });
      bar.appendChild(m.el);
    });
  }
  function hideEmptyColumns(table, alsoSame) {
    var rows = table.querySelectorAll("tbody tr");
    if (rows.length < 1) { return; }
    var heads = table.querySelectorAll("thead th");
    var css = "";
    // With DataTables running, hide through it, so the other columns
    // take the room (CSS alone leaves its fixed column widths behind)
    var $ = window.jQuery;
    var dt = $ && $.fn.dataTable && $.fn.dataTable.isDataTable(table) ? $(table).DataTable() : null;
    var hideNodes = [];
    Array.prototype.forEach.call(heads, function (th, i) {
      if (!th.textContent.trim()) { return; }
      var vals = Array.prototype.map.call(rows, function (r) {
        var c = r.children[i];
        return c ? c.textContent.replace(/\s+/g, " ").trim() : "";
      });
      var empty = vals.every(function (v) { return !v; });
      var same = alsoSame && rows.length > 2 && vals.every(function (v) { return v === vals[0]; });
      if (empty || same) {
        if (dt) { hideNodes.push(th); }
        else { css += "#" + table.id + " tr > :nth-child(" + (i + 1) + "){display:none}"; }
      }
    });
    if (dt && hideNodes.length) {
      try {
        hideNodes.forEach(function (th) { dt.column(th).visible(false, false); });
        dt.columns.adjust().draw(false);
      } catch (e) { /* leave the table as Koha drew it */ }
    }
    if (css && table.id) {
      var s = document.getElementById("aj-cols-" + table.id) || el("style");
      s.id = "aj-cols-" + table.id;
      s.textContent = css;
      document.head.appendChild(s);
    }
  }
  /* Koha's table script drops hidden columns when it starts, so this
     waits for it (see late() below) and reads the columns as they are */
  function tidyReadingRecord() {
    var t = document.getElementById("readingrec");
    if (t) { hideEmptyColumns(t, false); }
  }

  /* A3 */
  safely(function () {
    var t = document.querySelector("#opac-holdshistory table, table#table_holdshistory");
    if (!t) { return; }
    t.querySelectorAll("tbody td").forEach(function (td) {
      if (td.textContent.trim() === "Null") { td.textContent = ""; }
    });
  });

  /* A4: Lists */
  safely(function () {
    if (!/opac-shelves\.pl$/.test(location.pathname) && id !== "opac-shelves") { return; }
    var shelves = document.getElementById("usershelves");
    if (!shelves) { return; }
    Array.prototype.forEach.call(shelves.querySelectorAll("p"), function (p) {
      if (!/^No private lists\.?$/i.test(p.textContent.trim())) { return; }
      var box = el("div", "aj-empty-state");
      box.appendChild(el("p", null, TEXT.listsEmpty));
      var a = el("a", "btn btn-primary", TEXT.createList);
      a.href = "/cgi-bin/koha/opac-shelves.pl?op=add_form";
      box.appendChild(a);
      p.replaceWith(box);
    });
  });

  /* A5: Your summary */
  safely(function () {
    if (id !== "opac-user") { return; }
    document.querySelectorAll("#opac-user-checkouts .dataTables_empty, #opac-user-checkouts td.dt-empty, #opac-user-views .tab-pane p, .maincontent .alert-info, .maincontent .tab-pane > p").forEach(function (n) {
      if (!/nothing checked out/i.test(n.textContent) || n.getAttribute("data-aj")) { return; }
      n.setAttribute("data-aj", "1");
      n.textContent = TEXT.summaryEmpty + " ";
      var s = el("a", null, TEXT.search);
      s.href = "/cgi-bin/koha/opac-search.pl";
      n.appendChild(s);
      if (document.querySelector(".aj-arr-launch, #aj-arrivals-btn")) {
        n.appendChild(document.createTextNode(" or "));
        var na = el("a", "aj-open-arrivals", TEXT.arrivals.toLowerCase());
        na.href = "#";
        na.addEventListener("click", function (e) {
          e.preventDefault();
          var b = document.querySelector(".aj-arr-launch, #aj-arrivals-btn");
          if (b) { b.click(); }
        });
        n.appendChild(na);
      }
      n.appendChild(document.createTextNode("."));
    });
  });

  /* P1, P2: Most popular */
  safely(function () {
    if (!/opac-topissues\.pl$/.test(location.pathname) && id !== "opac-topissues") { return; }
    var form = document.querySelector('form[action*="opac-topissues.pl"]');
    if (form) {
      form.classList.add("aj-popular-form");
      form.querySelectorAll("select").forEach(function (s) {
        s.addEventListener("change", function () {
          if (aj.loader) { aj.loader.start(location.pathname); }
          form.submit();
        });
      });
      var go = form.querySelector('input[type="submit"]');
      if (go) { go.closest("li").classList.add("aj-popular-go"); }
      // One row above the list, instead of a sidebar card with a Submit button
      var main = document.querySelector(".maincontent");
      var side = form.closest('[class*="col-"]');
      var h1 = main && main.querySelector("h1");
      if (main && side && !side.contains(main) && h1) {
        var intro = h1.nextElementSibling && h1.nextElementSibling.tagName === "P" ? h1.nextElementSibling : h1;
        intro.after(form);
        if (!side.querySelector("a, input, select, button")) {
          side.classList.add("aj-col-hidden");
          var col = main.closest('[class*="col-"]');
          if (col) { col.classList.add("aj-col-full"); }
        }
      }
    }
    var table = document.querySelector("#topissuest, .maincontent table, table.table");
    if (!table) { return; }
    if (!table.id) { table.id = "aj-popular-table"; }
    table.querySelectorAll("tbody tr").forEach(function (tr) {
      var t = tr.querySelector("a.title");
      if (t) {
        t.childNodes.forEach(function (n) {
          if (n.nodeType === 3) { n.textContent = n.textContent.replace(/\s*[\/:;,.=]\s*$/, ""); }
        });
      }
      var p = t && t.parentNode.querySelector("p");
      if (p) {
        var raw = p.textContent.replace(/\s+/g, " ").trim();
        var who = raw.split(/\s+[-–]\s+/)[0].replace(/[,;.\s]+$/, "");
        var year = (/\b(1[5-9]\d\d|20\d\d)\b/.exec(raw) || [])[1];
        p.textContent = who + (year ? ", " + year : "");
        p.classList.add("aj-popular-by");
      }
    });
    var popular = function () { hideEmptyColumns(table, true); };
    if (document.readyState === "complete") { setTimeout(popular, 0); }
    else { window.addEventListener("load", function () { setTimeout(popular, 0); }); }
  });

  function late() { safely(tidyExports); safely(tidyReadingRecord); }
  if (document.readyState === "complete") { setTimeout(late, 0); }
  else { window.addEventListener("load", function () { setTimeout(late, 0); }); }
})(); } catch (err) { if (window.console) console.warn("OPACUserJS part K:", err); }


/* PART H. Cart — one button that adds and removes              (v8.1, new)
   ==========================================================================
   Koha's cart lives in the browser (the bib_list value that its basket.js
   reads and writes). Its own buttons say "Add to cart", then "In your cart"
   with a separate "(remove)" link beside it. From v8.1 there is one button:
   "Add to cart" until pressed, then "Remove from cart", which takes it out
   again. Koha's own functions do the work (addRecord, delSingleRecord), so
   the cart count in the header and Koha's "added" and "removed" messages
   behave exactly as before.

   How: Koha calls updateLink() whenever a title goes in or out. This wraps
   it to relabel the button, and a click listener (capture phase, so it runs
   before Koha's own) turns a press on a title already in the cart into a
   removal. The "(remove)" link is hidden in CSS (section 10e).

   aj.cart (has, add, remove, onChange) is shared with Part G, so the New
   arrivals popup uses the same cart and stays in step with the page.
   ========================================================================== */
try { (function () {
  "use strict";
  var aj = window.ajOpac;
  if (aj.stop) { return; }

  var TEXT = { add: "Add to cart", remove: "Remove from cart" };
  var ICON_ADD = '<i class="fa fa-fw fa-shopping-cart" aria-hidden="true"></i> ';
  var ICON_REMOVE = '<i class="fa fa-fw fa-xmark" aria-hidden="true"></i> ';

  function list() {
    try {
      var raw = typeof window.readCookie === "function" ? window.readCookie("bib_list") : "";
      return (raw || "").split("/").filter(Boolean);
    } catch (e) { return []; }
  }
  var listeners = [];
  aj.cart = {
    ready: function () { return typeof window.addRecord === "function"; },
    has: function (bib) { return list().indexOf(String(bib)) >= 0; },
    add: function (bib) { if (this.ready() && !this.has(bib)) { window.addRecord(String(bib)); } },
    remove: function (bib) { if (this.ready() && this.has(bib)) { window.delSingleRecord(String(bib)); } },
    onChange: function (fn) { listeners.push(fn); }
  };

  /* Koha's cart buttons carry the class cart<biblionumber>. */
  function label(a, inCart) {
    a.innerHTML = (inCart ? ICON_REMOVE : ICON_ADD) + (inCart ? TEXT.remove : TEXT.add);
    a.classList.toggle("aj-cart-remove", inCart);
  }
  function relabel(bib) {
    var inCart = aj.cart.has(bib);
    document.querySelectorAll("a.cart" + bib).forEach(function (a) { label(a, inCart); });
  }
  function relabelAll() {
    document.querySelectorAll('a[class*="addtocart"], a.incart').forEach(function (a) {
      var bib = a.getAttribute("data-biblionumber") ||
                ((/\bcart(\d+)\b/.exec(a.className) || [])[1]);
      if (bib) { label(a, a.classList.contains("incart") || aj.cart.has(bib)); }
    });
  }

  function wrap() {
    if (typeof window.updateLink !== "function" || window.updateLink.ajWrapped) { return; }
    var original = window.updateLink;
    window.updateLink = function (val, op, target) {
      var r = original.apply(this, arguments);
      try {
        if (!target) { relabel(val); }
        listeners.forEach(function (fn) { fn(String(val), op === "add"); });
      } catch (e) { /* never break Koha's own cart */ }
      return r;
    };
    window.updateLink.ajWrapped = true;
  }
  wrap();

  // A press on a title already in the cart removes it
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a.incart, a.aj-cart-remove");
    if (!a || a.closest(".aj-arrivals")) { return; }
    var bib = a.getAttribute("data-biblionumber") || ((/\bcart(\d+)\b/.exec(a.className) || [])[1]);
    if (!bib || !aj.cart.has(bib)) { return; }
    e.preventDefault();
    e.stopImmediatePropagation();
    aj.cart.remove(bib);
  }, true);

  // Koha marks titles already in the cart once the page is ready
  function start() { wrap(); relabelAll(); setTimeout(relabelAll, 300); }
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", start); }
  else { start(); }
})(); } catch (err) { if (window.console) console.warn("OPACUserJS part H:", err); }


/* PART I. Pull-outs from the reading end: the cart and advanced search
   ==========================================================================                        (v8.1, new)
   Both use the design system's drawer (the .aj-drawer of the Filters
   pull-out, Part F), opened from the reading-end edge (.aj-drawer--end)
   as a native modal <dialog>: focus stays inside, Esc and the dimmed
   page close it, and focus goes back to the link that opened it.

   1. CART. The header's Cart link opened Koha's cart page in a small
      pop-up window. It now opens a pull-out: each title with its cover,
      author and whether it's on the shelf, a Remove button for each,
      "Click & Collect all" (Part E), Send and Download (Koha's own),
      Print, and Empty cart (with a confirmation in place). Koha's cart
      page is still there, restyled (section 13c), for anyone who opens it
      directly; "Open the full cart page" links to it.
      The list comes from Koha's own cart page, fetched in the background,
      so titles, authors, ISBNs and copy status match what Koha shows.

   2. ADVANCED SEARCH. The header's "Advanced search" link opens a
      pull-out after UCL's Primo: lines of field, match and search term
      joined by And, Or or Not; item type, language, publication years,
      "available now" and sort; and a Barcode tab. The item types and
      languages are read from Koha's own advanced search page the first
      time, so they stay in step with the catalogue. Searching builds the
      same address Koha's own form would. The full page is still a link
      away ("Open the full advanced search page").

   Modifier-clicks (open in a new tab) and both links on their own pages
   are left alone. Without JavaScript the links work as before.
   ========================================================================== */
try { (function () {
  "use strict";
  var aj = window.ajOpac;
  if (aj.stop || window.top !== window.self) { return; }
  if (!document.createElement("dialog").showModal) { return; }

  var el = aj.el;
  var path = location.pathname;

  var CLOSE_SVG = '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M5 5l10 10M15 5 5 15" ' +
                  'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

  /* ---------- A shared drawer ------------------------------------------ */
  function drawer(id, title, cls) {
    var d = el("dialog", "aj-drawer aj-drawer--end " + cls);
    d.id = id;
    d.setAttribute("aria-labelledby", id + "-title");
    var head = el("div", "aj-drawer__head");
    var h = el("h2", null, title);
    h.id = id + "-title";
    head.appendChild(h);
    var extra = el("span", "aj-drawer__count");
    head.appendChild(extra);
    var x = el("button", "aj-drawer__close");
    x.type = "button";
    x.setAttribute("aria-label", "Close " + title.toLowerCase());
    x.innerHTML = CLOSE_SVG;
    head.appendChild(x);
    var body = el("div", "aj-drawer__body");
    var foot = el("div", "aj-drawer__foot");
    d.appendChild(head);
    d.appendChild(body);
    d.appendChild(foot);
    document.body.appendChild(d);
    x.addEventListener("click", function () { d.close(); });
    d.addEventListener("click", function (e) { if (e.target === d) { d.close(); } });
    var opener = null;
    d.addEventListener("close", function () {
      if (opener && opener.focus && !d.ajHandingOver) { opener.focus(); }
    });
    return {
      el: d, body: body, foot: foot, count: extra, close: x,
      open: function (from) { opener = from || null; if (!d.open) { d.showModal(); } x.focus(); }
    };
  }

  function plainClick(e) {
    return !(e.button > 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey);
  }

  /* ======================================================================
     1. Cart
     ====================================================================== */
  var CART = {
    title: "Your cart",
    one: "1 title", many: function (n) { return n + " titles"; },
    loading: "Loading your cart…",
    empty: "Your cart is empty. Press Add to cart on any title to keep it here.",
    failed: "Your cart could not be loaded. Open the full cart page instead.",
    remove: "Remove", removeLabel: function (t) { return "Remove " + t + " from your cart"; },
    shelf: "On the shelf", read: "Read in the library only", loan: "On loan: you can reserve it", other: "Not available to order",
    ccAll: "Click & Collect all", checking: "Checking…",
    send: "Send by email", download: "Download as", print: "Print", more: "More options",
    emptyCart: "Empty cart", sure: "Empty your cart?", yes: "Yes, empty it", no: "Keep it",
    emptied: "Your cart is now empty.",
    fullPage: "Open the full cart page",
    formats: [["bibtex", "BibTeX"], ["isbd", "ISBD"], ["iso2709", "MARC"], ["ris", "RIS (Zotero, EndNote and others)"]]
  };

  function bibList() {
    try { return (window.readCookie ? window.readCookie("bib_list") || "" : "").split("/").filter(Boolean); }
    catch (e) { return []; }
  }

  var cart = null, cartItems = [], handingOver = false;

  function readCartPage(html) {
    var doc = new DOMParser().parseFromString(html, "text/html");
    var rows = doc.querySelectorAll("#itemst tbody tr");
    var out = [];
    rows.forEach(function (tr) {
      var cb = tr.querySelector("input.cb");
      var t = tr.querySelector(".biblio-title");
      if (!cb || !t) { return; }
      var tds = tr.querySelectorAll("td");
      var coins = (tr.querySelector(".Z3988") || {}).title || "";
      var isbn = (/rft\.isbn=([^&]*)/.exec(coins) || [])[1] || "";
      var st = tr.querySelector(".item-status.available") ? "shelf"
             : /read in (the )?library/i.test(tr.textContent) ? "read"
             : /checked out|on loan|due/i.test(tr.textContent) ? "loan" : "other";
      out.push({
        bib: cb.value,
        title: (t.textContent || "").replace(/\s+/g, " ").replace(/[\s\/:;,=.]+$/, "").trim(),
        author: tds[2] ? tds[2].textContent.replace(/\s+/g, " ").trim() : "",
        isbn: decodeURIComponent(isbn).trim(),
        state: st
      });
    });
    return out;
  }

  function buildCart() {
    cart = drawer("aj-cart", CART.title, "aj-drawer--cart");
    cart.el.addEventListener("close", function () { if (!handingOver) { cart.body.scrollTop = 0; } });
  }

  function cartCount(n) {
    cart.count.textContent = n === 1 ? CART.one : CART.many(n);
    cart.count.hidden = n === 0;
  }

  function drawCartItems() {
    var body = cart.body;
    body.textContent = "";
    cartCount(cartItems.length);
    if (!cartItems.length) {
      body.appendChild(el("p", "aj-cart__empty", CART.empty));
      drawCartFoot();
      return;
    }
    var ul = el("ul", "aj-cart__list");
    cartItems.forEach(function (b) {
      var li = el("li", "aj-cart__item");
      li.setAttribute("data-bib", b.bib);
      var cover = el("div", "bookcover aj-cart__cover");
      cover.setAttribute("data-title", b.title);
      if (aj.addCover) { aj.addCover(cover, b.isbn, true); }
      var a = el("a", "aj-cart__cover-link");
      a.href = "/cgi-bin/koha/opac-detail.pl?biblionumber=" + encodeURIComponent(b.bib);
      a.setAttribute("aria-hidden", "true");
      a.tabIndex = -1;
      a.appendChild(cover);
      var text = el("div", "aj-cart__text");
      var t = el("a", "aj-cart__title", b.title);
      t.href = a.href;
      t.dir = "auto";
      text.appendChild(t);
      if (b.author) { var au = el("p", "aj-cart__author", b.author); au.dir = "auto"; text.appendChild(au); }
      var st = el("p", "aj-cart__status is-" + b.state);
      var ic = el("i", "fa fa-fw " + (b.state === "shelf" ? "fa-check" : b.state === "read" ? "fa-book-open" : b.state === "loan" ? "fa-clock" : "fa-ban"));
      ic.setAttribute("aria-hidden", "true");
      st.appendChild(ic);
      st.appendChild(el("span", null, b.state === "shelf" ? CART.shelf : b.state === "read" ? CART.read : b.state === "loan" ? CART.loan : CART.other));
      text.appendChild(st);
      var rm = el("button", "aj-cart__remove");
      rm.type = "button";
      rm.setAttribute("aria-label", CART.removeLabel(b.title));
      rm.innerHTML = '<i class="fa fa-fw fa-xmark" aria-hidden="true"></i>';
      rm.appendChild(el("span", null, CART.remove));
      rm.addEventListener("click", function () {
        var next = li.nextElementSibling || li.previousElementSibling;
        if (aj.cart) { aj.cart.remove(b.bib); }
        cartItems = cartItems.filter(function (x) { return x.bib !== b.bib; });
        li.remove();
        cartCount(cartItems.length);
        if (!cartItems.length) { drawCartItems(); cart.close.focus(); return; }
        var f = next && next.querySelector(".aj-cart__remove");
        (f || cart.close).focus();
        drawCartFoot();
      });
      li.appendChild(a);
      li.appendChild(text);
      li.appendChild(rm);
      ul.appendChild(li);
    });
    body.appendChild(ul);
    drawCartFoot();
  }

  function drawCartFoot() {
    var foot = cart.foot;
    foot.textContent = "";
    var list = cartItems.map(function (b) { return b.bib; }).join("/") + "/";
    var emptyBtn = null;
    if (cartItems.length) {
      var cc = el("button", "btn btn-primary aj-cart__cc");
      cc.type = "button";
      cc.innerHTML = '<i class="fa fa-shopping-basket" aria-hidden="true"></i>';
      cc.appendChild(el("span", null, CART.ccAll));
      cc.disabled = !cartItems.some(function (b) { return b.state !== "other"; });
      cc.addEventListener("click", function () {
        if (!window.ajCC || !window.ajCC.orderMany) { return; }
        cc.disabled = true;
        cc.lastChild.textContent = CART.checking;
        window.ajCC.orderMany(cartItems.map(function (b) { return { bib: b.bib, title: b.title }; }), function () {
          cc.disabled = false;
          cc.lastChild.textContent = CART.ccAll;
        });
      });
      foot.appendChild(cc);

      /* v8.2: Send, Download and Print in one More options menu, beside
         Empty cart, so Click & Collect all is the one thing that stands out */
      var m = aj.moreMenu({ label: CART.more, up: true, align: "start", cls: "aj-more--cart" });
      var send = el("button", null);
      send.type = "button";
      send.innerHTML = '<i class="fa fa-fw fa-envelope" aria-hidden="true"></i>';
      send.appendChild(el("span", null, CART.send));
      send.addEventListener("click", function () { if (window.sendBasket) { window.sendBasket(); } });
      m.add(send);
      var pr = el("a", null);
      pr.href = "/cgi-bin/koha/opac-basket.pl?print=1&bib_list=" + encodeURIComponent(list);
      pr.target = "_blank";
      pr.rel = "noopener";
      pr.innerHTML = '<i class="fa fa-fw fa-print" aria-hidden="true"></i>';
      pr.appendChild(el("span", null, CART.print));
      m.add(pr);
      m.divider();
      m.header(CART.download);
      CART.formats.forEach(function (f) {
        var a = el("a", null, f[1]);
        a.href = "/cgi-bin/koha/opac-downloadcart.pl?format=" + f[0] + "&bib_list=" + encodeURIComponent(list);
        a.setAttribute("download", "");
        m.add(a);
      });

      emptyBtn = el("button", "aj-cart__tool aj-cart__tool--quiet");
      emptyBtn.type = "button";
      emptyBtn.innerHTML = '<i class="fa fa-fw fa-trash-can" aria-hidden="true"></i>';
      emptyBtn.appendChild(el("span", null, CART.emptyCart));
    }
    // Bottom row: the full page at the start, Empty cart at the end
    var bottom = el("div", "aj-cart__bottom");
    var full = el("a", "aj-cart__full", CART.fullPage);
    full.href = "/cgi-bin/koha/opac-basket.pl?bib_list=" + encodeURIComponent(list);
    bottom.appendChild(full);
    if (cartItems.length) {
      var ends = el("div", "aj-cart__ends");
      ends.appendChild(m.el);
      emptyBtn.addEventListener("click", function () { confirmEmpty(bottom, emptyBtn); });
      ends.appendChild(emptyBtn);
      bottom.appendChild(ends);
    }
    foot.appendChild(bottom);
  }

  /* Empty cart: asks in place (no browser confirm box), then clears the
     cart the way Koha's delBasket does, without closing any window. */
  function confirmEmpty(row, trigger) {
    var box = el("div", "aj-cart__confirm");
    box.setAttribute("role", "group");
    box.setAttribute("aria-label", CART.sure);
    box.appendChild(el("p", null, CART.sure));
    var yes = el("button", "btn btn-primary", CART.yes);
    var no = el("button", "btn btn-default", CART.no);
    yes.type = no.type = "button";
    box.appendChild(yes);
    box.appendChild(no);
    row.hidden = true;
    row.after(box);
    no.focus();
    no.addEventListener("click", function () { box.remove(); row.hidden = false; trigger.focus(); });
    yes.addEventListener("click", function () {
      var gone = cartItems.map(function (b) { return b.bib; });
      try {
        if (window.delCookie) { window.delCookie("bib_list"); }
        else { gone.forEach(function (b) { window.delSingleRecord(b); }); }
        if (window.updateBasket) { window.updateBasket(0); }
        gone.forEach(function (b) { if (window.updateLink) { window.updateLink(b, "del"); } });
        if (window.showCartUpdate) { window.showCartUpdate(CART.emptied); }
      } catch (e) { /* the list below is redrawn from the cart either way */ }
      cartItems = [];
      drawCartItems();
      cart.close.focus();
    });
  }

  function openCart(from) {
    if (!cart) { buildCart(); }
    var list = bibList();
    cart.body.textContent = "";
    cart.foot.textContent = "";
    cartCount(list.length);
    if (!list.length) { cartItems = []; drawCartItems(); cart.open(from); return; }
    /* v8.2: a skeleton of the list while it loads, one row per title
       (up to four), instead of a line of text */
    var wait = el("ul", "aj-cart__list aj-cart__skeleton");
    wait.setAttribute("aria-hidden", "true");
    for (var k = 0; k < Math.min(list.length, 4); k++) {
      var sk = el("li", "aj-cart__item");
      sk.appendChild(el("span", "aj-sk aj-sk--cover"));
      var lines = el("span", "aj-sk__lines");
      lines.appendChild(el("span", "aj-sk aj-sk--line"));
      lines.appendChild(el("span", "aj-sk aj-sk--line aj-sk--short"));
      sk.appendChild(lines);
      wait.appendChild(sk);
    }
    cart.body.appendChild(wait);
    cart.body.appendChild(el("p", "sr-only", CART.loading));
    cart.el.setAttribute("aria-busy", "true");
    cart.open(from);
    aj.grab("/cgi-bin/koha/opac-basket.pl?bib_list=" + encodeURIComponent(list.join("/") + "/"))
      .then(function (res) {
        if (!res.ok || aj.isLoginPage(res.html)) { throw new Error("cart page"); }
        cartItems = readCartPage(res.html);
        drawCartItems();
      })
      .catch(function () {
        cart.body.textContent = "";
        cart.body.appendChild(el("p", "aj-cart__empty", CART.failed));
        cartItems = [];
        drawCartFoot();
      })
      .then(function () { cart.el.removeAttribute("aria-busy"); });
  }

  // The header's Cart link (and Koha's cart count beside it)
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("#cartmenulink, #cartmenuitem a, a.cartmenulink");
    if (!a || !plainClick(e) || /opac-basket\.pl$/.test(path)) { return; }
    e.preventDefault();
    e.stopImmediatePropagation();
    openCart(a);
  }, true);

  /* v8.2: Part E's order dialog is a native modal <dialog> now, so it
     opens above the cart and the cart stays open underneath (until v8.1
     the cart stepped aside for Part E's Bootstrap modal). */

  /* ======================================================================
     2. Advanced search
     ====================================================================== */
  var ADV = {
    title: "Advanced search",
    tabSearch: "Search", tabBarcode: "Barcode",
    searchFor: "Search for", filters: "Filters", published: "Published",
    field: "Field", match: "Match", term: "Search term", operator: "Operator",
    addLine: "Add a line", removeLine: "Remove this line",
    itemType: "Item type", anyType: "All item types",
    language: "Language", anyLanguage: "Any language", common: "Common", allLanguages: "All languages",
    from: "From (year)", to: "To (year)",
    available: "Only titles available now",
    sort: "Sort by",
    barcode: "Barcode", barcodeHint: "Scan or type the barcode on the book",
    clear: "Clear", search: "Search",
    loading: "Loading the item types and languages…",
    needSomething: "Type something to search for, or choose a filter.",
    needYear: "Years have four digits, like 1990.",
    needBarcode: "Scan or type a barcode first.",
    fullPage: "Open the full advanced search page"
  };
  var FIELDS = [
    ["kw", "Any field"], ["ti", "Title"], ["au", "Author"], ["su", "Subject"], ["se", "Series"],
    ["pb", "Publisher"], ["callnum", "Call number"], ["nb", "ISBN"], ["ns", "ISSN"]
  ];
  var MATCHES = [["", "Contains"], ["phr", "Exact phrase"], ["rtrn", "Starts with"]];
  var NO_MATCH = { nb: 1, ns: 1 };
  // Koha's index for each field and match (the same values its own form sends)
  function index(field, match) {
    if (NO_MATCH[field]) { return field; }
    var words = { kw: "kw", ti: "ti", au: "au,wrdl", su: "su,wrdl", se: "se,wrdl", pb: "pb,wrdl", callnum: "callnum" };
    if (!match) { return words[field] || field; }
    return field + "," + match;
  }
  var SORTS = [["relevance", "Relevance"], ["acqdate_dsc", "Newest in the library"], ["pubdate_dsc", "Newest published"],
               ["title_az", "Title (A to Z)"], ["author_az", "Author (A to Z)"], ["call_number_asc", "Call number"]];
  var COMMON_LANGS = ["ara", "eng", "urd", "guj", "per"];

  var adv = null, advOptions = null, rowCount = 0;

  function loadOptions() {
    if (advOptions) { return Promise.resolve(advOptions); }
    try {
      var saved = JSON.parse(localStorage.getItem("ajAdvOptions:v1") || "null");
      if (saved && Date.now() - saved.t < 86400000) { advOptions = saved.d; return Promise.resolve(advOptions); }
    } catch (e) { /* unavailable */ }
    return aj.grab("/cgi-bin/koha/opac-search.pl").then(function (res) {
      var doc = new DOMParser().parseFromString(res.html, "text/html");
      var types = [];
      doc.querySelectorAll('input[name="limit"][value^="mc-itype"]').forEach(function (i) {
        var lab = doc.querySelector('label[for="' + i.id + '"]');
        types.push([i.value, (lab ? lab.textContent : i.value).trim()]);
      });
      var langs = [];
      doc.querySelectorAll('select[name="limit"] option').forEach(function (o) {
        if (/^ln,rtrn:/.test(o.value)) { langs.push([o.value, o.textContent.trim()]); }
      });
      advOptions = { types: types, langs: langs };
      try { localStorage.setItem("ajAdvOptions:v1", JSON.stringify({ t: Date.now(), d: advOptions })); }
      catch (e) { /* unavailable */ }
      return advOptions;
    });
  }

  function select(name, options, labelText, id) {
    var wrap = el("div", "aj-field");
    var lab = el("label", null, labelText);
    lab.htmlFor = id;
    var s = el("select", "form-select");
    s.id = id;
    if (name) { s.name = name; }
    options.forEach(function (o) {
      if (o.group) {
        var g = el("optgroup");
        g.label = o.group;
        o.items.forEach(function (x) { var op = el("option", null, x[1]); op.value = x[0]; g.appendChild(op); });
        s.appendChild(g);
      } else {
        var op = el("option", null, o[1]);
        op.value = o[0];
        s.appendChild(op);
      }
    });
    wrap.appendChild(lab);
    wrap.appendChild(s);
    return wrap;
  }
  function input(labelText, id, attrs) {
    var wrap = el("div", "aj-field");
    var lab = el("label", null, labelText);
    lab.htmlFor = id;
    var i = el("input", "form-control");
    i.id = id;
    Object.keys(attrs || {}).forEach(function (k) { i.setAttribute(k, attrs[k]); });
    wrap.appendChild(lab);
    wrap.appendChild(i);
    return wrap;
  }

  function queryLine(first, term) {
    rowCount += 1;
    var n = rowCount;
    var row = el("div", "aj-adv__line" + (first ? " is-first" : ""));
    if (!first) {
      row.appendChild(select(null, [["and", "And"], ["or", "Or"], ["not", "Not"]], ADV.operator, "aj-adv-op-" + n));
    }
    var f = select(null, FIELDS, ADV.field, "aj-adv-field-" + n);
    var m = select(null, MATCHES, ADV.match, "aj-adv-match-" + n);
    var t = input(ADV.term, "aj-adv-term-" + n, { type: "search", autocomplete: "off" });
    if (term) { t.querySelector("input").value = term; }
    row.appendChild(f);
    row.appendChild(m);
    row.appendChild(t);
    f.querySelector("select").addEventListener("change", function () {
      m.querySelector("select").disabled = !!NO_MATCH[this.value];
    });
    if (!first) {
      var del = el("button", "aj-adv__remove");
      del.type = "button";
      del.setAttribute("aria-label", ADV.removeLine);
      del.innerHTML = '<i class="fa fa-fw fa-trash-can" aria-hidden="true"></i>';
      del.addEventListener("click", function () {
        var prev = row.previousElementSibling;
        row.remove();
        var focusTo = prev && prev.querySelector("input");
        (focusTo || adv.addBtn).focus();
      });
      row.appendChild(del);
    }
    return row;
  }

  function buildAdv() {
    adv = drawer("aj-adv", ADV.title, "aj-drawer--search");
    var form = el("form", "aj-adv");
    form.method = "get";
    form.action = "/cgi-bin/koha/opac-search.pl";
    form.noValidate = true;
    form.setAttribute("role", "search");

    // Tabs: Search and Barcode
    var tabs = el("div", "aj-adv__tabs");
    tabs.setAttribute("role", "tablist");
    var panels = [];
    [ADV.tabSearch, ADV.tabBarcode].forEach(function (name, i) {
      var t = el("button", "aj-adv__tab", name);
      t.type = "button";
      t.id = "aj-adv-tab-" + i;
      t.setAttribute("role", "tab");
      t.setAttribute("aria-controls", "aj-adv-panel-" + i);
      t.setAttribute("aria-selected", i === 0 ? "true" : "false");
      t.tabIndex = i === 0 ? 0 : -1;
      tabs.appendChild(t);
    });
    tabs.addEventListener("click", function (e) {
      var t = e.target.closest(".aj-adv__tab");
      if (t) { selectTab(+t.id.slice(-1)); }
    });
    tabs.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") { return; }
      var cur = tabs.querySelector('[aria-selected="true"]');
      var i = +cur.id.slice(-1) === 0 ? 1 : 0;
      selectTab(i);
      tabs.children[i].focus();
      e.preventDefault();
    });
    function selectTab(i) {
      Array.prototype.forEach.call(tabs.children, function (t, k) {
        t.setAttribute("aria-selected", k === i ? "true" : "false");
        t.tabIndex = k === i ? 0 : -1;
      });
      panels.forEach(function (p, k) { p.hidden = k !== i; });
      adv.tab = i;
      error("");
    }

    // Panel 1: search
    var p1 = el("div", "aj-adv__panel");
    p1.id = "aj-adv-panel-0";
    p1.setAttribute("role", "tabpanel");
    p1.setAttribute("aria-labelledby", "aj-adv-tab-0");
    var g1 = el("fieldset", "aj-adv__group");
    g1.appendChild(el("legend", null, ADV.searchFor));
    var lines = el("div", "aj-adv__lines");
    var current = document.querySelector("#translControl1, #masthead_search input[name=q], input[name=q]");
    lines.appendChild(queryLine(true, current && current.value ? current.value : ""));
    g1.appendChild(lines);
    var add = el("button", "aj-adv__add");
    add.type = "button";
    add.innerHTML = '<i class="fa fa-fw fa-plus" aria-hidden="true"></i>';
    add.appendChild(el("span", null, ADV.addLine));
    add.addEventListener("click", function () {
      var row = queryLine(false);
      lines.appendChild(row);
      row.querySelector("select").focus();
    });
    g1.appendChild(add);
    p1.appendChild(g1);

    var g2 = el("fieldset", "aj-adv__group");
    g2.appendChild(el("legend", null, ADV.filters));
    var filters = el("div", "aj-adv__grid");
    filters.appendChild(select(null, [["", ADV.anyType]], ADV.itemType, "aj-adv-itype"));
    filters.appendChild(select(null, [["", ADV.anyLanguage]], ADV.language, "aj-adv-lang"));
    g2.appendChild(filters);
    var years = el("div", "aj-adv__grid");
    years.appendChild(input(ADV.from, "aj-adv-from", { inputmode: "numeric", maxlength: "4", placeholder: "e.g. 1990" }));
    years.appendChild(input(ADV.to, "aj-adv-to", { inputmode: "numeric", maxlength: "4", placeholder: "e.g. " + new Date().getFullYear() }));
    g2.appendChild(years);
    var avail = el("label", "aj-adv__check");
    var cb = el("input");
    cb.type = "checkbox";
    cb.id = "aj-adv-avail";
    avail.appendChild(cb);
    avail.appendChild(el("span", null, ADV.available));
    g2.appendChild(avail);
    var sortGrid = el("div", "aj-adv__grid");
    sortGrid.appendChild(select(null, SORTS, ADV.sort, "aj-adv-sort"));
    g2.appendChild(sortGrid);
    p1.appendChild(g2);

    // Panel 2: barcode
    var p2 = el("div", "aj-adv__panel");
    p2.id = "aj-adv-panel-1";
    p2.setAttribute("role", "tabpanel");
    p2.setAttribute("aria-labelledby", "aj-adv-tab-1");
    p2.hidden = true;
    var g3 = el("div", "aj-adv__group");
    g3.appendChild(input(ADV.barcodeHint, "aj-adv-barcode", { autocomplete: "off", inputmode: "text" }));
    p2.appendChild(g3);
    panels = [p1, p2];

    var err = el("p", "aj-adv__error");
    err.id = "aj-adv-error";
    err.setAttribute("role", "alert");
    err.hidden = true;
    function error(text) {
      err.textContent = text;
      err.hidden = !text;
      form.querySelectorAll("[aria-describedby='aj-adv-error']").forEach(function (n) {
        n.removeAttribute("aria-describedby");
        n.removeAttribute("aria-invalid");
      });
    }
    adv.error = error;

    form.appendChild(tabs);
    form.appendChild(p1);
    form.appendChild(p2);
    form.appendChild(err);
    adv.body.appendChild(form);

    var clear = el("button", "aj-adv__clear");
    clear.type = "button";
    clear.innerHTML = '<i class="fa fa-fw fa-circle-xmark" aria-hidden="true"></i>';
    clear.appendChild(el("span", null, ADV.clear));
    clear.addEventListener("click", function () {
      lines.textContent = "";
      lines.appendChild(queryLine(true, ""));
      form.querySelectorAll("input").forEach(function (i) { if (i.type === "checkbox") { i.checked = false; } else { i.value = ""; } });
      form.querySelectorAll("select").forEach(function (s) { s.selectedIndex = 0; s.disabled = false; });
      error("");
      lines.querySelector("input").focus();
    });
    var go = el("button", "btn btn-primary aj-adv__go", ADV.search);
    go.type = "submit";
    go.setAttribute("form", "aj-adv-form");
    form.id = "aj-adv-form";
    var full = el("a", "aj-adv__full", ADV.fullPage);
    full.href = "/cgi-bin/koha/opac-search.pl";
    adv.foot.appendChild(full);
    adv.foot.appendChild(clear);
    adv.foot.appendChild(go);
    adv.addBtn = add;
    adv.form = form;
    adv.tab = 0;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var url = buildUrl(form, lines);
      if (url) { location.assign(url); }
    });

    loadOptions().then(function (o) { fillOptions(o); }, function () { /* the defaults still search */ });
  }

  function fillOptions(o) {
    var it = document.getElementById("aj-adv-itype");
    var ln = document.getElementById("aj-adv-lang");
    if (!it || it.options.length > 1) { return; }
    o.types.forEach(function (t) { var op = el("option", null, t[1]); op.value = t[0]; it.appendChild(op); });
    var common = el("optgroup"), all = el("optgroup");
    common.label = ADV.common;
    all.label = ADV.allLanguages;
    COMMON_LANGS.forEach(function (code) {
      var hit = o.langs.filter(function (l) { return l[0] === "ln,rtrn:" + code; })[0];
      if (hit) { var op = el("option", null, hit[1]); op.value = hit[0]; common.appendChild(op); }
    });
    o.langs.forEach(function (l) { var op = el("option", null, l[1]); op.value = l[0]; all.appendChild(op); });
    ln.appendChild(common);
    ln.appendChild(all);
  }

  function buildUrl(form, lines) {
    var q = new URLSearchParams();
    if (adv.tab === 1) {
      var bc = document.getElementById("aj-adv-barcode");
      if (!bc.value.trim()) { flag(bc, ADV.needBarcode); return ""; }
      q.append("idx", "bc");
      q.append("q", bc.value.trim());
      return "/cgi-bin/koha/opac-search.pl?" + q.toString();
    }
    q.append("advsearch", "1");
    var any = false;
    Array.prototype.forEach.call(lines.children, function (row, i) {
      var sels = row.querySelectorAll("select");
      var term = row.querySelector("input").value.trim();
      var op = i > 0 ? sels[0].value : "";
      var field = sels[i > 0 ? 1 : 0].value;
      var match = sels[i > 0 ? 2 : 1].value;
      // Koha pairs each operator with the line after it, so every line
      // after the first sends one, even when its term is empty
      if (i > 0) { q.append("op", op); }
      q.append("idx", index(field, match));
      q.append("q", term);
      if (term) { any = true; }
    });
    var itype = document.getElementById("aj-adv-itype").value;
    var lang = document.getElementById("aj-adv-lang").value;
    if (itype) { q.append("limit", itype); any = true; }
    if (lang) { q.append("limit", lang); any = true; }
    var from = document.getElementById("aj-adv-from"), to = document.getElementById("aj-adv-to");
    var y1 = from.value.trim(), y2 = to.value.trim();
    if (y1 && !/^\d{4}$/.test(y1)) { flag(from, ADV.needYear); return ""; }
    if (y2 && !/^\d{4}$/.test(y2)) { flag(to, ADV.needYear); return ""; }
    if (y1 || y2) { q.append("limit-yr", y1 + "-" + y2); any = true; }
    if (document.getElementById("aj-adv-avail").checked) { q.append("limit", "available"); }
    var sort = document.getElementById("aj-adv-sort").value;
    if (sort && sort !== "relevance") { q.append("sort_by", sort); }
    if (!any) { flag(lines.querySelector("input"), ADV.needSomething); return ""; }
    q.append("do", "Search");
    return "/cgi-bin/koha/opac-search.pl?" + q.toString();
  }
  function flag(field, text) {
    adv.error(text);
    field.setAttribute("aria-invalid", "true");
    field.setAttribute("aria-describedby", "aj-adv-error");
    field.focus();
  }

  function openAdv(from) {
    if (!adv) { buildAdv(); }
    adv.open(from);
    var first = adv.form.querySelector(".aj-adv__panel:not([hidden]) input");
    if (first) { first.focus(); }
  }

  // Warm the item types and languages when the link is about to be used
  function isAdvLink(a) {
    return a && /\/opac-search\.pl$/.test(a.pathname || "") && !a.search &&
           /advanced/i.test(a.textContent || "");
  }
  document.addEventListener("pointerover", function (e) {
    var a = e.target.closest && e.target.closest("a");
    if (isAdvLink(a)) { loadOptions().catch(function () {}); }
  }, { passive: true });
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a");
    if (!isAdvLink(a) || !plainClick(e) || document.body.id === "advsearch") { return; }
    if (a.closest(".aj-drawer")) { return; }   // "Open the full advanced search page"
    e.preventDefault();
    e.stopImmediatePropagation();
    openAdv(a);
  }, true);
})(); } catch (err) { if (window.console) console.warn("OPACUserJS part I:", err); }


/* PART G. New arrivals — the popup that opens after login        (v8, new)
   ==========================================================================
   Replaces PART C, the "New in the library" shelf on the home page.

   WHAT IT DOES
   A full-screen dialog. A navy stage spotlights one new title: a large
   cover, its title and author, where it is and when it came in, and a
   Click & Collect or Reserve button. A filmstrip below holds every new
   title; pressing one brings it onto the stage. Arrows, the arrow keys
   and a swipe step through them too.

   WHEN IT OPENS BY ITSELF
   Once per tab, on the first eligible page after login, and only when the
   list holds titles this reader hasn't been shown before. It never opens
   on the self-checkout kiosk, inside Click & Collect's hidden frame, on
   Koha's hold screen, on print or export pages, or over another dialog.
   It waits for the page to paint, then for the list (at most
   CFG.arrivalsWaitMs) and the first cover (at most 600 ms). If the list
   is late it skips this time rather than interrupting later.
   "New arrivals" in the account menu, and on the home page's My library
   card, open it at any time.

   WHERE THE LIST COMES FROM
   A public SQL report (opac/current/reports/new-arrivals.sql), read
   through /cgi-bin/koha/svc/report and kept in localStorage for
   CFG.arrivalsCacheMin minutes. It answers in well under a second and
   says which copies are on the shelf. With CFG.newArrivalsReportId unset,
   or if the report fails, the old Zebra search is used instead (slow,
   about 8 s, so that list is kept for CFG.newBooksCacheHrs hours).

   ORDERING
   Each title carries a Click & Collect slot (.ajCCSlot). Part E's click
   handler is delegated on the document, so its own dialog does the
   ordering. That dialog is a Bootstrap modal, which can't sit above a
   native modal <dialog>, so this one steps aside when Part E's opens
   (show.bs.modal) and comes back, without its entrance, when Part E's
   closes (hidden.bs.modal). window.ajCC.fill (Part E v2.4) then redraws
   the buttons, so an order placed shows as "Ordered".

   WHAT IT REMEMBERS
   localStorage "ajNewArrivals:v1"  the list. Library-wide, nothing personal.
   localStorage "ajNewSeen"         per reader, the biblionumbers already
                                    shown. Keyed by a SHA-256 hash of the
                                    borrowernumber, never the number itself,
                                    and holding no reading or loan data. The
                                    one per-reader value kept beyond the tab,
                                    because "already seen" has to survive
                                    the next login. Ten readers at most.
   sessionStorage "ajNewShown"      set once the popup has opened by itself
                                    in this tab, so it doesn't open again.
   ========================================================================== */
try { (function () {
  "use strict";
  var aj = window.ajOpac;
  if (aj.stop || !aj.arrivalsEligible) { return; }

  var el = aj.el;
  var CFG = aj.CFG;
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var TEXT = {
    dialog: "New arrivals",
    title: "New arrivals",
    of: " of ",
    close: "Close",
    closeLabel: "Close new arrivals",
    prev: "Previous title",
    next: "Next title",
    stripTitle: "All new arrivals",
    seeAll: "See all new books",
    scrollBack: "Show earlier titles",
    scrollOn: "Show more titles",
    onStage: "On stage",
    added: "Added ",
    openRecord: "Open the record",
    shelf: "On the shelf",
    readOnly: "Read in the library only",
    onLoan: "On loan",
    held: "Ordered by another reader",
    mine: "In your orders",
    unknown: "Checking availability",
    none: "Not available to order",
    collect: "Click & Collect",
    reserve: "Reserve",
    addCart: "Add to cart",
    removeCart: "Remove",
    removeCartLong: "Remove from cart",
    inCart: "In cart",
    launcher: "New arrivals",
    launcherNew: function (n) { return "New arrivals, " + n + " new"; },
    bandNew: function (n) { return n === 1 ? "1 new title since your last visit" : n + " new titles since your last visit"; },
    bandSeen: "New in the library",
    andMore: function (n) { return " and " + n + " more"; },
    bandButton: "See new arrivals",
    hint: "Swipe the cover, or press any book to see it here"
  };

  var DATA_KEY = "ajNewArrivals:v1";
  var SEEN_KEY = "ajNewSeen";
  var SHOWN_KEY = "ajNewShown";

  var CHEVRON = '<svg class="aj-flip" viewBox="0 0 20 20" aria-hidden="true" focusable="false">' +
                '<path d="M12.5 4.5 7 10l5.5 5.5" fill="none" stroke="currentColor" stroke-width="2" ' +
                'stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var CHEVRON_NEXT = CHEVRON.replace("M12.5 4.5 7 10l5.5 5.5", "M7.5 4.5 13 10l-5.5 5.5");
  var BOOKS_ICON = '<svg class="aj-arr-launch__icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">' +
    '<path d="M3.5 3.5h3v13h-3zM8 3.5h3v13H8zM12.6 4.3l2.9-.8 3 12.6-2.9.7z" fill="none" stroke="currentColor" ' +
    'stroke-width="1.6" stroke-linejoin="round"/></svg>';
  var CROSS = '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M5 5l10 10M15 5 5 15" ' +
              'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

  // MARC titles often end with " /", " :" or " ="
  function tidy(s) {
    return (s || "").replace(/\s+/g, " ").replace(/[\s\/:;,=.]+$/, "").trim();
  }

  /* ---------- 1. The list -------------------------------------------- */

  /* One shape for both sources:
     { bib, title, author, isbn, added, state, readOnly, desk }
     state: "shelf" | "onloan" | "held" | null (unknown: Part E decides) */
  /* The OPAC's svc/report ignores annotated=1 and sends each row as a
     plain list, in the report's column order. Name them here. Keep this
     in step with reports/new-arrivals.sql. */
  var COLUMNS = ["biblionumber", "title", "author", "isbn", "added",
                 "on_shelf", "on_loan", "read_only", "held", "desk"];
  function fromReport(rows) {
    return (rows || []).map(function (row) {
      var r = row;
      if (Array.isArray(row)) {
        r = {};
        COLUMNS.forEach(function (name, i) { r[name] = row[i]; });
      }
      var shelf = +r.on_shelf || 0, loan = +r.on_loan || 0, held = +r.held || 0;
      var state = shelf > held ? "shelf" : shelf > 0 ? "held" : loan > 0 ? "onloan" : null;
      return {
        bib: String(r.biblionumber),
        title: tidy(r.title),
        author: tidy(r.author),
        isbn: String(r.isbn || "").trim(),
        added: r.added || "",
        state: state,
        readOnly: +r.read_only === 1,
        desk: r.desk === "z" ? "z" : "main"
      };
    }).filter(function (b) { return b.bib && b.title; });
  }

  /* The fallback: Koha's search results, as PART C (v7) read them. */
  var HIDDEN = (CFG.newBooksHideStatusText || []).map(function (s) {
    return (s || "").toLowerCase().replace(/[\s\-_]+/g, "");
  }).filter(Boolean);
  function flatten(s) { return (s || "").toLowerCase().replace(/[\s\-_]+/g, ""); }
  function isHidden(row) {
    if (!HIDDEN.length || !row) { return false; }
    var avail = row.querySelector(".results_summary.availability") || row;
    var matched = HIDDEN.some(function (want) {
      var byClass = Array.prototype.some.call(
        avail.querySelectorAll('[class*="unavailable_"], [class*="notforloandesc_"]'),
        function (e) { return flatten(e.className).indexOf(want) !== -1; });
      return byClass || flatten(avail.textContent).indexOf(want) !== -1;
    });
    return matched && !avail.querySelector(".available, .item-status.available");
  }
  function fromSearch(html, filterHere) {
    var results = aj.parsePart(html, "div", 'class="searchresults"', ".searchresults");
    if (!results) { return []; }
    var seen = {}, list = [];
    results.querySelectorAll(".bookcover[data-biblionumber]").forEach(function (c) {
      if (list.length >= CFG.newArrivals) { return; }
      var bib = c.getAttribute("data-biblionumber");
      if (!bib || seen[bib]) { return; }
      seen[bib] = true;
      if (filterHere && isHidden(c.closest("tr") || c.closest(".searchresults > *"))) { return; }
      list.push({ bib: bib, title: tidy(c.getAttribute("data-title")),
                  author: tidy(c.getAttribute("data-author")),
                  isbn: (c.getAttribute("data-isbn") || "").trim(),
                  added: "", state: null, readOnly: false, desk: "main" });
    });
    return list;
  }
  function searchList() {
    var byCode = aj.newBooksByCode();
    function run(plain) {
      return aj.grab(aj.newBooksSearchUrl({ plain: plain })).then(function (res) {
        if (!res.ok || aj.isLoginPage(res.html)) { throw new Error("search unavailable"); }
        return fromSearch(res.html, plain || !byCode);
      });
    }
    return run(false).then(function (list) {
      // An empty answer in "any-copy" mode points at the CCL term: try once without it
      return list.length || !byCode ? list : run(true);
    });
  }

  function readList() {
    try {
      var saved = JSON.parse(localStorage.getItem(DATA_KEY) || "null");
      if (!saved || !saved.d || !saved.d.length) { return null; }
      var maxAge = saved.src === "report" ? CFG.arrivalsCacheMin * 60000
                                          : CFG.newBooksCacheHrs * 3600000;
      return Date.now() - saved.t > maxAge ? null : saved.d;
    } catch (e) { return null; }
  }
  function saveList(list, src) {
    try { localStorage.setItem(DATA_KEY, JSON.stringify({ t: Date.now(), src: src, d: list })); }
    catch (e) { /* full, or unavailable */ }
  }

  var listPromise = null;
  function getList() {
    if (listPromise) { return listPromise; }
    if (aj.arrivalsCached) {
      listPromise = Promise.resolve(aj.arrivalsCached);
      return listPromise;
    }
    var report = aj.pending.arrivals || Promise.reject(new Error("no report"));
    listPromise = report.then(function (rows) {
      var list = fromReport(rows).slice(0, CFG.newArrivals);
      if (!list.length) { throw new Error("report empty"); }
      saveList(list, "report");
      return list;
    }).catch(function () {
      return searchList().then(function (list) {
        if (list.length) { saveList(list, "search"); }
        return list;
      });
    });
    listPromise.catch(function () { listPromise = null; });   // let a later press retry
    return listPromise;
  }

  /* ---------- 2. Who has seen what ----------------------------------- */
  var nameEl = document.querySelector(".loggedinusername[data-borrowernumber]");
  var userId = (typeof logged_in_user_id !== "undefined" && logged_in_user_id) ||
               (nameEl && nameEl.getAttribute("data-borrowernumber")) || "";

  var seenKey = (function () {
    if (!userId || !window.crypto || !crypto.subtle || !window.TextEncoder) { return Promise.resolve(null); }
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode("ajSeen:" + userId))
      .then(function (buf) {
        return Array.prototype.map.call(new Uint8Array(buf).slice(0, 12), function (b) {
          return ("0" + b.toString(16)).slice(-2);
        }).join("");
      }, function () { return null; });
  })();

  function readSeen(key) {
    try {
      var all = JSON.parse(localStorage.getItem(SEEN_KEY) || "{}");
      return (all && all[key] && all[key].b) || [];
    } catch (e) { return []; }
  }
  function markSeen(key, bibs) {
    if (!key) { return; }
    try {
      var all = JSON.parse(localStorage.getItem(SEEN_KEY) || "{}") || {};
      var had = (all[key] && all[key].b) || [];
      var keep = bibs.concat(had.filter(function (b) { return bibs.indexOf(b) < 0; })).slice(0, 60);
      all[key] = { t: Date.now(), b: keep };
      var keys = Object.keys(all).sort(function (a, b) { return all[b].t - all[a].t; });
      keys.slice(10).forEach(function (k) { delete all[k]; });
      localStorage.setItem(SEEN_KEY, JSON.stringify(all));
    } catch (e) { /* unavailable */ }
  }

  /* ---------- 3. Covers (moved from PART C) --------------------------- */
  /* Amazon first, as the results page does, then Open Library. A real
     cover marks the plate .has-cover and the bookplate underneath goes. */
  /* v8.1: Amazon's image service only knows the 10-digit ISBN, which is
     what Koha sends it on the results page. The report (and many MARC
     records) give the 13-digit form, so those covers never loaded. A
     978- ISBN-13 converts to an ISBN-10; 979- ones have none, so they go
     straight to Open Library, which takes either. */
  function isbn10(raw) {
    var d = String(raw || "").toUpperCase().replace(/[^0-9X]/g, "");
    if (d.length === 10) { return d; }
    if (d.length !== 13 || d.slice(0, 3) !== "978") { return ""; }
    var core = d.slice(3, 12), sum = 0;
    for (var k = 0; k < 9; k++) { sum += (10 - k) * +core[k]; }
    var check = (11 - sum % 11) % 11;
    return core + (check === 10 ? "X" : String(check));
  }
  aj.isbn10 = isbn10;
  function addCover(frame, isbn, eager, onDone) {
    var clean = String(isbn || "").toUpperCase().replace(/[^0-9X]/g, "");
    if (!clean) { if (onDone) { onDone(false); } return; }
    var ten = isbn10(clean);
    var sources = [];
    if (ten) { sources.push("https://images-na.ssl-images-amazon.com/images/P/" + ten + ".01.LZZZZZZZ.jpg"); }
    sources.push("https://covers.openlibrary.org/b/isbn/" + clean + "-L.jpg?default=false");
    var img = el("img", "aj-arr__img");
    img.alt = "";
    img.loading = eager ? "eager" : "lazy";
    img.decoding = "async";
    if (!eager) { img.fetchPriority = "low"; }
    var i = 0;
    function next() {
      frame.classList.remove("has-cover");
      i += 1;
      if (i < sources.length) { img.src = sources[i]; }
      else { img.remove(); if (onDone) { onDone(false); onDone = null; } }
    }
    img.addEventListener("error", next);
    img.addEventListener("load", function () {
      if (img.naturalWidth <= 1) { next(); return; }   // Amazon's "no cover" is a 1x1 pixel
      frame.classList.add("has-cover");
      if (onDone) { onDone(true); onDone = null; }
    });
    img.src = sources[0];
    frame.appendChild(img);
  }
  aj.addCover = addCover;

  /* ---------- Cart toggle (v8.1): one button, uses Part H's aj.cart ---- */
  function cartButton(b, long) {
    var btn = el("button", "aj-arr__cart");
    btn.type = "button";
    btn.setAttribute("data-bib", b.bib);
    paintCart(btn, b, long);
    btn.addEventListener("click", function () {
      if (!aj.cart || !aj.cart.ready()) { return; }
      if (aj.cart.has(b.bib)) { aj.cart.remove(b.bib); } else { aj.cart.add(b.bib); }
      // Koha's updateLink tells Part H, which tells syncCart below
    });
    return btn;
  }
  function paintCart(btn, b, long) {
    var on = !!(aj.cart && aj.cart.has(b.bib));
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.setAttribute("aria-label", (on ? TEXT.removeCartLong : TEXT.addCart) + ": " + b.title);
    btn.innerHTML = '<i class="fa fa-fw ' + (on ? "fa-xmark" : "fa-shopping-cart") + '" aria-hidden="true"></i>';
    btn.appendChild(el("span", null, on ? (long ? TEXT.removeCartLong : TEXT.removeCart) : TEXT.addCart));
    btn.classList.toggle("is-in", on);
  }
  function syncCart(bib) {
    if (!dlg) { return; }
    var b = books.filter(function (x) { return x.bib === bib; })[0];
    if (!b) { return; }
    dlg.querySelectorAll('.aj-arr__cart[data-bib="' + bib + '"]').forEach(function (btn) {
      paintCart(btn, b, !!btn.closest(".aj-arr__text"));
    });
    dlg.querySelectorAll('.aj-arr__incart[data-bib="' + bib + '"]').forEach(function (t) {
      t.hidden = !(aj.cart && aj.cart.has(bib));
    });
  }
  if (aj.cart) { aj.cart.onChange(function (bib) { syncCart(bib); }); }

  function plate(b, eager) {
    var p = el("div", "bookcover aj-arr__plate");
    p.setAttribute("data-title", b.title);
    if (b.author) { p.setAttribute("data-author", b.author); }
    addCover(p, b.isbn, eager);
    return p;
  }

  /* ---------- 4. Status and the order button -------------------------- */
  var ICON = { shelf: "fa-check", onloan: "fa-clock", held: "fa-user-check",
               mine: "fa-check", read: "fa-book-open", unknown: "fa-circle-notch",
               none: "fa-ban" };

  function statusOf(b) {
    if (b.mine) { return ["mine", TEXT.mine]; }
    if (b.state === "shelf") { return b.readOnly ? ["read", TEXT.readOnly] : ["shelf", TEXT.shelf]; }
    if (b.state === "held") { return ["held", TEXT.held]; }
    if (b.state === "onloan") { return ["onloan", TEXT.onLoan]; }
    if (b.state === "none") { return ["none", TEXT.none]; }
    return ["unknown", TEXT.unknown];
  }
  function fillStatus(node, b) {
    var s = statusOf(b);
    node.textContent = "";
    node.className = node.className.replace(/\bis-\w+\b/g, "").trim() + " is-" + s[0];
    var i = el("i", "fa " + ICON[s[0]]);
    i.setAttribute("aria-hidden", "true");
    node.appendChild(i);
    node.appendChild(el("span", null, s[1]));
  }

  /* The slot Part E fills. Drawn with a button already in it, from the
     report's counts, so nothing waits on Part E's item lookups; Part E
     then confirms or corrects it. Same markup as Part E's btnHtml(). */
  function slot(b) {
    var s = el("span", "ajCCSlot");
    s.setAttribute("data-bib", b.bib);
    s.setAttribute("data-title", b.title);
    if (b.state === "shelf" || b.state === "onloan" || b.state === "held") {
      var shelf = b.state === "shelf";
      var btn = el("button", "btn btn-sm ajCC ajCCBtn " + (shelf ? "btn-primary" : "btn-outline-primary"));
      btn.type = "button";
      btn.setAttribute("data-bib", b.bib);
      if (!shelf) { btn.setAttribute("data-reserve", "1"); }
      var i = el("i", "fa " + (shelf ? "fa-shopping-basket" : "fa-clock"));
      i.setAttribute("aria-hidden", "true");
      btn.appendChild(i);
      btn.appendChild(el("span", null, shelf ? TEXT.collect : TEXT.reserve));
      s.appendChild(btn);
    }
    return s;
  }

  /* ---------- 5. The dialog ------------------------------------------- */
  var books = [], cur = 0, fresh = {}, dlg, parts = {}, handingOver = false, seenId = null;

  function build() {
    dlg = el("dialog", "aj-arrivals");
    dlg.setAttribute("aria-labelledby", "aj-arr-title");
    if (root.getAttribute("dir") === "rtl") { dlg.dir = "rtl"; }

    var sheet = el("div", "aj-arr__sheet");

    // Stage
    var stage = el("section", "aj-arr__stage");
    var top = el("div", "aj-arr__top");
    var h = el("h2", "aj-arr__title", TEXT.title);
    h.id = "aj-arr-title";
    var count = el("span", "aj-arr__count");
    count.dir = "auto";   // "1 of 10" keeps its order on right-to-left pages
    var close = el("button", "aj-arr__close");
    close.type = "button";
    close.setAttribute("aria-label", TEXT.closeLabel);
    close.innerHTML = CROSS;
    close.appendChild(el("span", "aj-arr__close-label", TEXT.close));
    top.appendChild(h);
    top.appendChild(count);
    top.appendChild(close);

    var prev = el("button", "aj-arr__nav aj-arr__nav--prev");
    var next = el("button", "aj-arr__nav aj-arr__nav--next");
    prev.type = next.type = "button";
    prev.setAttribute("aria-label", TEXT.prev);
    next.setAttribute("aria-label", TEXT.next);
    prev.innerHTML = CHEVRON;
    next.innerHTML = CHEVRON_NEXT;

    var show = el("div", "aj-arr__show");
    var cover = el("div", "aj-arr__cover");
    var text = el("div", "aj-arr__text");
    show.appendChild(cover);
    show.appendChild(text);

    stage.appendChild(top);
    stage.appendChild(prev);
    stage.appendChild(show);
    stage.appendChild(next);

    // Filmstrip
    var strip = el("section", "aj-arr__strip");
    strip.setAttribute("aria-labelledby", "aj-arr-strip");
    var head = el("div", "aj-arr__strip-head");
    var sh = el("h3", "aj-arr__strip-title", TEXT.stripTitle);
    sh.id = "aj-arr-strip";
    var more = el("a", "aj-arr__all", TEXT.seeAll);
    more.href = aj.newBooksSearchUrl().replace(/&count=\d+$/, "");
    var pager = el("div", "aj-arr__pager");
    var back = el("button", "aj-arr__page");
    var on = el("button", "aj-arr__page");
    back.type = on.type = "button";
    back.setAttribute("aria-label", TEXT.scrollBack);
    on.setAttribute("aria-label", TEXT.scrollOn);
    back.innerHTML = CHEVRON;
    on.innerHTML = CHEVRON_NEXT;
    pager.appendChild(back);
    pager.appendChild(on);
    head.appendChild(sh);
    head.appendChild(more);
    head.appendChild(pager);
    var track = el("ul", "aj-arr__track");
    var hint = el("p", "aj-arr__hint", TEXT.hint);
    strip.appendChild(head);
    strip.appendChild(track);
    strip.appendChild(hint);

    sheet.appendChild(stage);
    sheet.appendChild(strip);
    dlg.appendChild(sheet);
    document.body.appendChild(dlg);

    parts = { stage: stage, show: show, cover: cover, text: text, count: count, track: track };

    close.addEventListener("click", function () { hide(); });
    prev.addEventListener("click", function () { step(-1); });
    next.addEventListener("click", function () { step(1); });
    back.addEventListener("click", function () { page(-1); });
    on.addEventListener("click", function () { page(1); });

    // The dimmed margin around the sheet is the dialog itself: a press there closes
    dlg.addEventListener("click", function (e) { if (e.target === dlg) { hide(); } });
    dlg.addEventListener("cancel", function (e) { e.preventDefault(); hide(); });   // Esc
    dlg.addEventListener("close", function () {
      root.classList.remove("aj-arrivals-open");
    });

    // Arrow keys step through the titles, mirrored on right-to-left pages
    dlg.addEventListener("keydown", function (e) {
      if (e.altKey || e.ctrlKey || e.metaKey) { return; }
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") { return; }
      var rtl = getComputedStyle(dlg).direction === "rtl" ? -1 : 1;
      step((e.key === "ArrowRight" ? 1 : -1) * rtl);
      e.preventDefault();
    });

    // Swipe the stage. Vertical drags still scroll (touch-action: pan-y)
    var sx = null, sy = 0;
    stage.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse") { return; }
      sx = e.clientX; sy = e.clientY;
    });
    stage.addEventListener("pointerup", function (e) {
      if (sx === null) { return; }
      var dx = e.clientX - sx, dy = e.clientY - sy;
      sx = null;
      if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.5) { return; }
      var rtl = getComputedStyle(dlg).direction === "rtl" ? -1 : 1;
      step((dx < 0 ? 1 : -1) * rtl);
    });
    stage.addEventListener("pointercancel", function () { sx = null; });

    // Pressing a filmstrip card brings it onto the stage
    track.addEventListener("click", function (e) {
      var pick = e.target.closest(".aj-arr__pick");
      if (pick) { show_(+pick.getAttribute("data-i")); }
    });

    // Part E redraws a slot when it knows more: keep the status line in step
    if (window.MutationObserver) {
      new MutationObserver(function (records) {
        records.forEach(function (r) {
          var s = r.target.closest && r.target.closest(".ajCCSlot");
          if (s) { syncFromSlot(s); }
        });
      }).observe(sheet, { childList: true, subtree: true });
    }
  }

  /* After the hand-back, Part E redraws the slots; keep focus on the
     button the reader pressed when its slot is redrawn. */
  var refocus = null;
  function syncFromSlot(s) {
    var bib = s.getAttribute("data-bib");
    if (refocus && refocus.bib === bib && !!s.closest(".aj-arr__text") === refocus.onStage &&
        (!document.activeElement || !dlg.contains(document.activeElement) ||
         document.activeElement.classList.contains("aj-arr__close"))) {
      var f = s.querySelector(".ajCC");
      if (f && f.focus) { f.focus(); }
    }
    var b = books.filter(function (x) { return x.bib === bib; })[0];
    if (!b) { return; }
    var a = window.jQuery ? window.jQuery(s).data("a") : null;
    if (s.querySelector(".disabled.ajCC")) { b.mine = true; }
    else if (a && a.state) {
      b.mine = false;
      b.state = a.state === "shelf" ? "shelf" : a.state === "onloan" ? (a.held ? "held" : "onloan") : "none";
    }
    dlg.querySelectorAll('.aj-arr__status[data-bib="' + bib + '"]').forEach(function (n) { fillStatus(n, b); });
  }

  function drawStrip() {
    var t = parts.track;
    t.textContent = "";
    books.forEach(function (b, i) {
      var li = el("li", "aj-arr__card");
      li.style.setProperty("--aj-i", Math.min(i, 8));
      var pick = el("button", "aj-arr__pick");
      pick.type = "button";
      pick.setAttribute("data-i", i);
      pick.setAttribute("aria-pressed", i === cur ? "true" : "false");
      var cv = el("span", "aj-arr__cv");
      // v8.1: no "New" badge; everything in the popup is new
      cv.appendChild(plate(b, i < 6));
      cv.appendChild(el("span", "aj-arr__tag", TEXT.onStage));
      var tagCart = el("span", "aj-arr__incart", TEXT.inCart);
      tagCart.setAttribute("data-bib", b.bib);
      tagCart.hidden = !(aj.cart && aj.cart.has(b.bib));
      cv.appendChild(tagCart);
      pick.appendChild(cv);
      var ct = el("span", "aj-arr__ct", b.title);
      ct.dir = "auto";
      var ca = el("span", "aj-arr__ca", b.author);
      ca.dir = "auto";
      var st = el("span", "aj-arr__status");
      st.setAttribute("data-bib", b.bib);
      fillStatus(st, b);
      pick.appendChild(ct);
      pick.appendChild(ca);
      pick.appendChild(st);
      li.appendChild(pick);
      li.appendChild(cartButton(b, false));   // v8.1: the card's one button
      t.appendChild(li);
    });
  }

  function prettyDate(iso) {
    if (!/^\d{4}-\d{2}-\d{2}/.test(iso || "")) { return ""; }
    var p = iso.slice(0, 10).split("-");
    try {
      return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })
        .format(new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])));
    } catch (e) { return iso.slice(0, 10); }
  }

  function drawStage(i) {
    var b = books[i];
    parts.cover.textContent = "";
    parts.cover.appendChild(plate(b, true));

    var t = parts.text;
    t.textContent = "";
    /* v8.2: no "New this month" / "Just arrived" line: it said "this
       month" of titles added months ago. The "Added …" date below says
       when, exactly. */
    var title = el("p", "aj-arr__name", b.title);
    title.dir = "auto";
    t.appendChild(title);
    if (b.author) {
      var by = el("p", "aj-arr__by", b.author);
      by.dir = "auto";
      t.appendChild(by);
    }
    var meta = el("ul", "aj-arr__meta");
    var st = el("li", "aj-arr__status");
    st.setAttribute("data-bib", b.bib);
    fillStatus(st, b);
    meta.appendChild(st);
    /* v8.2: the shelf it is on, from the copy Click & Collect would pick
       (Part E's item lookup), not "Main hall" / "Zawaya" guessed from the
       desk. It fills in when known, and wraps if the name is long. */
    if (b.state === "shelf") {
      var whereRow = metaRow("fa-location-dot", "");
      whereRow.classList.add("aj-arr__where", "is-waiting");
      meta.appendChild(whereRow);
      if (window.ajCC && window.ajCC.where) {
        window.ajCC.where(b.bib).then(function (w) {
          if (!w || !w.location) { whereRow.remove(); return; }
          whereRow.lastChild.textContent = w.location;
          whereRow.lastChild.dir = "auto";
          whereRow.classList.remove("is-waiting");
        }, function () { whereRow.remove(); });
      } else { whereRow.remove(); }
    }
    var when = prettyDate(b.added);
    if (when) { meta.appendChild(metaRow("fa-calendar", TEXT.added + when)); }
    t.appendChild(meta);

    var acts = el("div", "aj-arr__acts");
    acts.appendChild(slot(b));
    acts.appendChild(cartButton(b, true));
    var rec = el("a", "aj-arr__record", TEXT.openRecord);
    rec.href = "/cgi-bin/koha/opac-detail.pl?biblionumber=" + encodeURIComponent(b.bib);
    acts.appendChild(rec);
    t.appendChild(acts);

    parts.count.textContent = (i + 1) + TEXT.of + books.length;
    fillSlots(parts.text, false);
  }
  function metaRow(icon, text) {
    var li = el("li");
    var i = el("i", "fa " + icon);
    i.setAttribute("aria-hidden", "true");
    li.appendChild(i);
    li.appendChild(el("span", null, text));
    return li;
  }

  function fillSlots(scope, force) {
    if (window.ajCC && window.ajCC.fill) {
      try { window.ajCC.fill(scope, force); } catch (e) { /* Part E missing or older */ }
    }
  }

  /* Change what's on the stage. The outgoing title leaves towards the
     side it came from in duration-fast with ease-in; the new one arrives
     from the other side in about half a second with ease-out. */
  var swapTimer = null;
  function show_(i) {
    if (i === cur || !books[i]) { return; }
    var dir = i > cur ? 1 : -1;
    if (i === 0 && cur === books.length - 1) { dir = 1; }
    if (i === books.length - 1 && cur === 0) { dir = -1; }
    cur = i;
    parts.show.style.setProperty("--aj-d", dir);
    dlg.classList.remove("is-intro");
    parts.track.querySelectorAll(".aj-arr__pick").forEach(function (p) {
      p.setAttribute("aria-pressed", p.getAttribute("data-i") === String(i) ? "true" : "false");
    });
    centre(i);
    clearTimeout(swapTimer);
    parts.show.classList.remove("is-arriving");
    parts.show.classList.add("is-leaving");
    swapTimer = setTimeout(function () {
      drawStage(i);
      parts.show.classList.remove("is-leaving");
      void parts.show.offsetWidth;   // restart the arrival animation
      parts.show.classList.add("is-arriving");
    }, reduce ? 0 : 160);
  }
  function step(d) { show_((cur + d + books.length) % books.length); }

  function centre(i) {
    var card = parts.track.children[i];
    if (!card) { return; }
    var t = parts.track;
    var left = card.offsetLeft - (t.clientWidth - card.clientWidth) / 2;
    t.scrollTo({ left: left, behavior: reduce ? "auto" : "smooth" });
  }
  function page(d) {
    var t = parts.track;
    var rtl = getComputedStyle(t).direction === "rtl" ? -1 : 1;
    t.scrollBy({ left: d * rtl * t.clientWidth * 0.85, behavior: reduce ? "auto" : "smooth" });
  }

  function open(opts) {
    if (!dlg) { build(); }
    if (!dlg.open) {
      cur = 0;
      drawStrip();
      drawStage(0);
      dlg.classList.toggle("is-intro", !(opts && opts.quiet));
      dlg.classList.remove("is-closing");
      root.classList.add("aj-arrivals-open");
      dlg.showModal();
      // Start on Close: the sheet scrolls on short screens, and the browser
      // would otherwise put focus on the scroller
      dlg.querySelector(".aj-arr__close").focus();
      parts.text.setAttribute("aria-live", "polite");
      fillSlots(parts.track, false);
    }
    // Everything on show is now seen
    seenKey.then(function (k) {
      markSeen(k, books.map(function (b) { return b.bib; }));
      updateLaunchers(0);
    });
  }

  /* Leave quicker than arriving: the sheet fades and settles in 170 ms */
  function hide() {
    if (!dlg || !dlg.open || dlg.classList.contains("is-closing")) { return; }
    if (reduce) { dlg.close(); return; }
    dlg.classList.remove("is-intro");
    dlg.classList.add("is-closing");
    setTimeout(function () {
      dlg.classList.remove("is-closing");
      if (dlg.open) { dlg.close(); }
    }, 170);
  }

  /* Part E's order dialog is a Bootstrap modal. Step aside while it is
     open, then come back where the reader was, without the entrance. */
  /* v8.2: Part E's order dialog is a native modal <dialog> now. It opens
     above the popup, which stays open underneath, and Part E puts focus
     back on the button that opened it. When it closes, the popup's
     buttons are redrawn, so a title just ordered reads "Ordered". */
  document.addEventListener("ajcc:closed", function () {
    if (dlg && dlg.open) { fillSlots(dlg, true); }
  });

  /* ---------- 6. Launchers (v8.1): the header and the home page band --
     v8 put a button in the account menu and at the foot of the My library
     card; neither was easy to find. Now:
       * a "New arrivals" button in the header, beside the account menu,
         with a count badge while there are titles the reader hasn't seen
         (icon and badge only on phones);
       * on the home page, a band across the top (#aj-arrivals-band in
         OpacMainUserBlock_V8.1.html): a fan of covers, how many are new,
         three titles by name, and "See new arrivals". */
  var launchers = [];
  function launch(b) {
    b.setAttribute("aria-busy", "true");
    prepare(false).then(function (ok) {
      b.removeAttribute("aria-busy");
      if (ok) { open(); }
    });
  }
  (function () {
    var members = document.getElementById("members");
    var account = document.getElementById("user-menu");
    if (!members || members.querySelector(".aj-arr-nav")) { return; }
    var li = el("li", "nav-item aj-arr-nav");
    var b = el("button", "aj-arr-launch aj-arr-launch--nav");
    b.type = "button";
    b.setAttribute("aria-haspopup", "dialog");
    b.innerHTML = BOOKS_ICON;
    b.appendChild(el("span", "aj-arr-launch__label", TEXT.launcher));
    var badge = el("span", "aj-arr-launch__badge");
    badge.hidden = true;
    b.appendChild(badge);
    b.addEventListener("click", function () { launch(b); });
    li.appendChild(b);
    var before = account && account.closest("li");
    members.insertBefore(li, before && before.parentNode === members ? before : members.firstChild);
    launchers.push({ kind: "nav", el: b });
  })();

  var band = document.getElementById("aj-arrivals-band");
  function drawBand(n) {
    if (!band || !books.length) { return; }
    band.textContent = "";
    var fan = el("div", "aj-arr-band__fan");
    fan.setAttribute("aria-hidden", "true");
    /* Up to eight titles with an ISBN; any whose cover doesn't load is
       dropped, and the CSS shows the first five that remain. Bookplates
       only fill in when too few real covers arrive. */
    var withIsbn = books.filter(function (b) { return b.isbn; }).slice(0, 8);
    withIsbn.forEach(function (b) {
      var p = el("div", "bookcover");
      fan.appendChild(p);
      addCover(p, b.isbn, true, function (ok) {
        if (!ok && fan.children.length > 3) { p.remove(); }
      });
    });
    books.filter(function (b) { return !b.isbn; }).slice(0, Math.max(0, 5 - withIsbn.length))
      .forEach(function () { fan.appendChild(el("div", "bookcover")); });
    var text = el("div", "aj-arr-band__text");
    var h = el("h2", "aj-arr-band__title", n > 0 ? TEXT.bandNew(n) : TEXT.bandSeen);
    text.appendChild(h);
    var names = books.slice(0, 3).map(function (b) { return b.title; });
    text.appendChild(el("p", "aj-arr-band__line",
      names.join(", ") + (books.length > 3 ? TEXT.andMore(books.length - 3) : "") + "."));
    var go = el("button", "aj-arr-band__go");
    go.type = "button";
    go.setAttribute("aria-haspopup", "dialog");
    go.innerHTML = BOOKS_ICON;
    go.appendChild(el("span", null, TEXT.bandButton));
    go.addEventListener("click", function () { launch(go); });
    band.appendChild(fan);
    band.appendChild(text);
    band.appendChild(go);
    band.hidden = false;
  }

  function updateLaunchers(n) {
    launchers.forEach(function (l) {
      var badge = l.el.querySelector(".aj-arr-launch__badge");
      badge.textContent = n > 0 ? String(n) : "";
      badge.hidden = !(n > 0);
      l.el.setAttribute("aria-label", n > 0 ? TEXT.launcherNew(n) : TEXT.launcher);
    });
    drawBand(n);
  }

  /* ---------- 7. Getting ready, and the first opening ---------------- */
  function prepare(needFresh) {
    return Promise.all([getList(), seenKey]).then(function (r) {
      books = r[0] || [];
      if (!books.length) { return false; }
      seenId = r[1];
      var seen = seenId ? readSeen(seenId) : [];
      fresh = {};
      books.forEach(function (b) { if (seen.indexOf(b.bib) < 0) { fresh[b.bib] = true; } });
      var n = Object.keys(fresh).length;
      updateLaunchers(n);
      return needFresh ? n > 0 : true;
    }, function () { return false; });
  }

  function shownHere() {
    try { return !!sessionStorage.getItem(SHOWN_KEY); } catch (e) { return true; }
  }
  function markShown() {
    try { sessionStorage.setItem(SHOWN_KEY, "1"); } catch (e) { /* unavailable */ }
  }

  function firstCover() {
    return new Promise(function (resolve) {
      var b = books[0];
      if (!b || !b.isbn) { resolve(); return; }
      var probe = el("div");
      addCover(probe, b.isbn, true, resolve);
      setTimeout(resolve, 600);
    });
  }

  function idle() {
    return new Promise(function (resolve) {
      function go() {
        if (window.requestIdleCallback) { requestIdleCallback(resolve, { timeout: 800 }); }
        else { setTimeout(resolve, 200); }
      }
      if (document.readyState === "complete") { go(); }
      else { window.addEventListener("load", go, { once: true }); }
    });
  }

  if (aj.arrivalsAuto && !shownHere()) {
    var started = Date.now();
    var late = new Promise(function (resolve) {
      setTimeout(function () { resolve("late"); }, CFG.arrivalsWaitMs);
    });
    Promise.race([idle().then(function () { return prepare(true); }), late]).then(function (ok) {
      if (ok !== true) { return; }   // nothing new, or too slow this time
      return firstCover().then(function () {
        // Something else took the screen meanwhile (a Koha dialog, the loader)
        if (document.querySelector(".modal.show, dialog[open], .aj-loader.is-active")) { return; }
        if (Date.now() - started > CFG.arrivalsWaitMs + 1000) { return; }
        markShown();
        open();
      });
    });
  } else {
    // Still worth knowing how many are new, for the header badge and the band
    if (launchers.length || band) { idle().then(function () { prepare(false); }); }
  }
})(); } catch (err) { if (window.console) console.warn("OPACUserJS part G:", err); }


/* ==== PART E: CLICK & COLLECT ====
   Part of OPACUserJS from OPAC v8.1. Until v8 it was a separate file
   (click-and-collect/02-…js, v2.4, now in opac/click-and-collect/legacy/)
   pasted after the other parts; it is now in this file, so OPACUserJS is
   one paste. It stays LAST: Part G's buttons are filled by it.
   Its history, kept for reference:
   Replaced v1 "PICKUP ORDERS".
   - Dynamic Click & Collect / Reserve buttons (search results, record page, lists, cart)
   - Own order dialog: patron picks a delivery date only; copy is chosen automatically
   - Orders are placed through Koha's normal hold form in a hidden frame
   - Desk is decided by shelf: "First Floor Z-..." -> Zawaya attendant's desk, else Pickup Counter
   - v2.2: button styling fixed; copies already ordered/waiting for another reader
     are detected (page status + a live check of Koha's hold form on click) and
     offered as "Reserve" instead of Click & Collect
   - v2.3: buttons arrive sooner. Each title's copies are looked up 8 at a
     time and its button shows as soon as they are known, without waiting
     for the reader's orders (about 2s); those switch to "Ordered" when the
     orders arrive, and a click checks them first. Until a button shows,
     OPACUserCSS v7 holds its place with a placeholder.
   - OPAC v8.1: window.ajCC.orderMany(lines, done) for the cart pull-out.
   - v2.4: window.ajCC.fill(root, force) fills the slots inside root only.
     OPACUserJS v8 Part G (the New arrivals popup) draws its slots after
     the page has loaded and calls it; force=true re-reads the reader's
     orders and the copies, so a title just ordered shows "Ordered".
     Nothing else changed.
   Koha's own hold screen stays reachable for staff/testing with &manual=1 */
try {
(function () {
  if (window.top !== window.self) return;           /* never run inside our hidden frame */
  var $ = window.jQuery;
  if (!$) return;

  /* ---------- configuration ---------- */
  var CFG = {
    zawayaRe: /^\s*First Floor Z-/i,
    notOrderableLocRe: /Rarities|Store|Back Office|Damaged/i,
    orderableNotForLoan: [0, -2],      /* 0 = loanable, -2 = collect & read in library */
    readOnlyNotForLoan: -2,
    daysAhead: 7,
    collectDays: 3,
    frameTimeoutMs: 60000,
    parallel: 8                        /* titles whose copies are looked up at once */
  };

  var AR = /^ar/i.test(document.documentElement.lang || "");
  var T = AR ? {
    cc: "اطلب واستلم", ccAll: "اطلب الكل واستلم", ccSel: "اطلب المحدد واستلم", pickSome: "حدد كتابًا واحدًا على الأقل.", reserve: "احجز", ordered: "تم الطلب",
    onLoan: "معار حاليًا", dlgTitle: "اطلب واستلم", resTitle: "حجز كتاب معار",
    when: "متى تريد استلامه؟", asap: "في أقرب وقت", readyAt: "جاهز", confirm: "تأكيد الطلب", confirmRes: "تأكيد الحجز",
    cancel: "إلغاء", close: "إغلاق", working: "جارٍ تسجيل طلبك…",
    deskMain: "منضدة الاستلام، القاعة الرئيسية للمكتبة", deskZ: "منضدة مشرف الزوايا",
    collectFrom: "الاستلام من", readOnly: "للقراءة داخل المكتبة فقط. لا يمكن إعارة هذا الكتاب.",
    resText: "كل النسخ معارة الآن. احجزه وسنرسل لك بريدًا إلكترونيًا عندما يعود ويوضع على رف الطلبات باسمك.",
    doneTitle: "تم استلام طلبك", doneCollect: "لديك ٣ أيام لاستلامه بعد تجهيزه.",
    doneRes: "تم الحجز. سنرسل لك بريدًا إلكترونيًا عند إعادته.",
    failed: "تعذّر طلب:", notAvail: "لم يعد متاحًا", slow: "الاتصال بطيء. تحقق من صفحة حسابك قبل المحاولة مرة أخرى.",
    pick: "اختر", reserveIt: "احجز (معار)", notOrderable: "غير متاح للطلب",
    onHold: "طلبه قارئ آخر", reserveHeld: "احجز (طلبه قارئ آخر)", resTitleHeld: "حجز كتاب",
    resHeld: "طلب قارئ آخر هذا الكتاب بالفعل. احجزه لتكون التالي في الدور. إذا لم يستلمه خلال ٣ أيام، سنرسل لك بريدًا إلكترونيًا عندما يكون جاهزًا على رف الطلبات باسمك.",
    doneResHeld: "تم الحجز. سنرسل لك بريدًا إلكترونيًا عندما يصبح جاهزًا لك.", checking: "جارٍ التحقق…",
    takenNow: "طلبه قارئ آخر قبلك بلحظات. حدّث الصفحة لحجزه.",
    tryAgain: "حاول مرة أخرى", notPlaced: "لم يتم الطلب", done: "تم",
    today: "اليوم", tomorrow: "غدًا", at: "الساعة", am1030: "١٠:٣٠ صباحًا", pm630: "٦:٣٠ مساءً",
    days: ["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"],
    reasons: { tooManyReserves: "بلغت الحد الأقصى لعدد الطلبات.", tooManyReservesToday: "بلغت الحد اليومي للطلبات.",
      tooManyHoldsForThisRecord: "لديك طلب قائم على هذا الكتاب.", alreadypossession: "هذا الكتاب معار لك حاليًا.",
      itemAlreadyOnHold: "لديك طلب قائم على هذه النسخة.", _default: "رفض النظام الطلب. يرجى مراجعة المكتبة." }
  } : {
    cc: "Click & Collect", ccAll: "Click & Collect all", ccSel: "Click & Collect selected", pickSome: "Select at least one title first.", reserve: "Reserve", ordered: "Ordered",
    onLoan: "On loan", dlgTitle: "Click & Collect", resTitle: "Reserve a book on loan",
    when: "When do you want it?", asap: "As soon as possible", readyAt: "ready", confirm: "Confirm order", confirmRes: "Confirm reservation",
    cancel: "Cancel", close: "Close", working: "Placing your order…",
    deskMain: "Pickup Counter, main library hall", deskZ: "Zawaya attendant's desk",
    collectFrom: "Collect from", readOnly: "Read in the library only. This book can't be borrowed.",
    resText: "All copies are on loan right now. Reserve it and we'll email you when it's back and waiting on the pickup shelf for you.",
    doneTitle: "Order received", doneCollect: "You'll have 3 days to collect it once it's ready.",
    doneRes: "Reserved. We'll email you when it's back.",
    failed: "Couldn't order:", notAvail: "no longer available", slow: "The connection is slow. Check your account page before trying again.",
    pick: "Order", reserveIt: "Reserve (on loan)", notOrderable: "Not available to order",
    onHold: "Ordered by another reader", reserveHeld: "Reserve (ordered by another reader)", resTitleHeld: "Reserve this book",
    resHeld: "Another reader has already ordered this book. Reserve it and you're next in line. If they don't collect it within 3 days, we'll email you when it's waiting on the pickup shelf for you.",
    doneResHeld: "Reserved. We'll email you when it's waiting for you.", checking: "Checking…",
    takenNow: "another reader ordered it moments before you. Reload the page to reserve it.",
    tryAgain: "Try again", notPlaced: "Order not placed", done: "Done",
    today: "today", tomorrow: "tomorrow", at: "at", am1030: "10:30 AM", pm630: "6:30 PM",
    days: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
    reasons: { tooManyReserves: "You've reached your limit of orders.", tooManyReservesToday: "You've reached today's order limit.",
      tooManyHoldsForThisRecord: "You already have an order on this title.", alreadypossession: "You already have this title on loan.",
      itemAlreadyOnHold: "You already have an order on this copy.", _default: "The system refused the order. Please ask at the library desk." }
  };

  function esc(s) { return $("<div>").text(s == null ? "" : String(s)).html(); }
  function ss(k, v) { try { if (v === undefined) return JSON.parse(sessionStorage.getItem(k) || "null"); if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }

  /* ---------- time rules (Asia/Karachi) ---------- */
  function kNow(ms) {
    var p = {};
    new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Karachi", weekday: "short", hour: "2-digit", minute: "2-digit",
      hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit" })
      .formatToParts(new Date(ms)).forEach(function (x) { p[x.type] = x.value; });
    return { wd: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].indexOf(p.weekday), min: (+p.hour) * 60 + (+p.minute), y: +p.year, m: +p.month, d: +p.day };
  }
  function dayFrom(n, add) { var dt = new Date(Date.UTC(n.y, n.m - 1, n.d + add)); return { iso: dt.toISOString().slice(0, 10), wd: dt.getUTCDay(), dt: dt }; }
  /* ASAP rule: Mon-Sat 08:30-17:00 -> 18:30 same day; 17:00-08:30 -> 10:30 next morning; Sat 17:00 to Sun -> Mon 10:30 */
  function asap(ms) {
    var n = kNow(ms), add, slot;
    if (n.wd === 0) { add = 1; slot = "am"; }
    else if (n.wd === 6 && n.min >= 1020) { add = 2; slot = "am"; }
    else if (n.min >= 510 && n.min < 1020) { add = 0; slot = "pm"; }
    else if (n.min >= 1020) { add = 1; slot = "am"; }
    else { add = 0; slot = "am"; }
    return { add: add, day: dayFrom(n, add), slot: slot };
  }
  function dayWord(add, day) { return add === 0 ? T.today : add === 1 ? T.tomorrow : T.days[day.wd]; }
  function dateText(day) { return new Intl.DateTimeFormat(AR ? "ar" : "en-GB", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" }).format(day.dt); }
  /* options: ASAP first, then later non-Sunday dates (ready 10:30 AM) up to daysAhead */
  function dateOptions(ms) {
    var n = kNow(ms), a = asap(ms), today = dayFrom(n, 0), opts = [];
    /* v8.2: day and when are the two lines of a date card; summary is the
       "ready" line on the confirmation. label/ready are kept as before. */
    var cap = function (w) { return w.charAt(0).toUpperCase() + w.slice(1); };
    var t0 = a.slot === "pm" ? T.pm630 : T.am1030;
    opts.push({ key: "asap", start: today.iso, label: T.asap, ready: dayWord(a.add, a.day) + " " + T.at + " " + t0 + " · " + dateText(a.day),
      day: T.asap, when: cap(dayWord(a.add, a.day)) + " " + T.at + " " + t0,
      summary: dayWord(a.add, a.day) + " " + T.at + " " + t0 + ", " + dateText(a.day) });
    for (var i = a.add + 1; i <= CFG.daysAhead; i++) {
      var d = dayFrom(n, i);
      if (d.wd === 0) continue;
      opts.push({ key: d.iso, start: d.iso, label: (i === 1 ? T.tomorrow.charAt(0).toUpperCase() + T.tomorrow.slice(1) + " · " : "") + dateText(d), ready: T.am1030,
        day: i === 1 ? cap(T.tomorrow) : dateText(d), when: (i === 1 ? dateText(d) + ", " : "") + cap(T.readyAt) + " " + T.am1030,
        summary: (i === 1 ? T.tomorrow + ", " : "") + dateText(d) + " " + T.at + " " + T.am1030 });
    }
    return opts;
  }

  /* ---------- availability (public API) ---------- */
  var availCache = {};
  function classifyItem(it) {
    var nfl = +it.not_for_loan_status || 0;
    if (it.withdrawn || it.lost_status || it.damaged_status) return "none";
    if (CFG.orderableNotForLoan.indexOf(nfl) < 0) return "none";
    if (CFG.notOrderableLocRe.test(it.location || "")) return "none";
    return it.checked_out_date ? "onloan" : "shelf";
  }
  /* raw item lists from the public API (it says nothing about holds) */
  function itemLists(bib) {
    if (availCache[bib]) return availCache[bib];
    availCache[bib] = $.ajax({ url: "/api/v1/public/biblios/" + encodeURIComponent(bib) + "/items?_per_page=100", dataType: "json", timeout: 20000 })
      .then(function (items) {
        var shelf = [], onloan = [];
        (items || []).forEach(function (it) {
          var c = classifyItem(it);
          if (c === "shelf") shelf.push(it); else if (c === "onloan" && (+it.not_for_loan_status || 0) === 0) onloan.push(it);
        });
        /* prefer the main hall over Zawaya, loanable over read-only */
        shelf.sort(function (a, b) {
          var za = CFG.zawayaRe.test(a.location || "") ? 1 : 0, zb = CFG.zawayaRe.test(b.location || "") ? 1 : 0;
          return za - zb || ((+a.not_for_loan_status || 0) === 0 ? -1 : 1);
        });
        return { shelf: shelf, onloan: onloan };
      }, function () { return null; });
    return availCache[bib];
  }
  function pickInfo(state, pick, extra) {
    var r = { state: state, item: pick || null,
      desk: pick && CFG.zawayaRe.test(pick.location || "") ? "z" : "main",
      readOnly: !!(pick && (+pick.not_for_loan_status || 0) === CFG.readOnlyNotForLoan) };
    return $.extend(r, extra || {});
  }
  /* decide the button state.
     heldCount: copies the page itself shows as on hold (no item ids);
     live: {itemId: {ok, held}} from Koha's hold form, or null if unknown */
  function decide(L, heldCount, live) {
    if (!L) return { state: "error" };
    var shelf = L.shelf, onloan = L.onloan, free, held = [];
    if (live) {
      free = shelf.filter(function (it) { var x = live[it.item_id]; return x && x.ok && !x.held; });
      held = shelf.filter(function (it) { var x = live[it.item_id]; return x && x.ok && x.held; });
      onloan = onloan.filter(function (it) { var x = live[it.item_id]; return x && x.ok; });
    } else {
      var n = Math.min(heldCount || 0, shelf.length);
      free = n ? shelf.slice(0, shelf.length - n) : shelf;
      held = n ? shelf.slice(shelf.length - n) : [];
    }
    if (free.length) {
      var deskOf = function (it) { return CFG.zawayaRe.test(it.location || "") ? "z" : "main"; };
      return pickInfo("shelf", free[0], { alts: free.slice(1).filter(function (it) { return deskOf(it) === deskOf(free[0]); }).map(function (it) { return String(it.item_id); }) });
    }
    if (onloan.length) return pickInfo("onloan", onloan[0]);
    if (held.length) return pickInfo("onloan", held[0], { held: true });
    return { state: "none" };
  }
  /* copies shown as "On hold" / with holds on the current page for this title */
  function pageHeldCount(bib, slot) {
    var n = 0;
    try {
      if (/opac-detail\.pl$/.test(location.pathname) && new URLSearchParams(location.search).get("biblionumber") === String(bib)) {
        var t = $("#holdingst"), rows = (t.length && $.fn.DataTable && $.fn.DataTable.isDataTable(t[0])) ? $(t.DataTable().rows().nodes()) : t.find("tbody tr");
        rows.each(function () {
          var r = $(this), hc = parseInt($.trim(r.find("td.holds_count").text()), 10) || 0;
          if (r.find(".item-status.checkedout").length) return;   /* on loan: not a shelf copy */
          if (hc > 0 || r.find(".item-status.onhold, .item-status.pendinghold").length) n++;
        });
      } else if (slot && slot.length) {
        slot.closest("tr, .searchresults li, .bibliocol, .record").find(".unavailable_Hold").each(function () {
          var m = /\((\d+)\)/.exec($(this).text()); n += m ? +m[1] : 1;
        });
      }
    } catch (e) {}
    return n;
  }
  function availability(bib, slot) {
    return itemLists(bib).then(function (L) { return decide(L, pageHeldCount(bib, slot), null); });
  }
  /* live check on click: Koha's own hold form says which copies are free.
     Returns {bib: {itemId: {ok, held}}}; a title missing from the map = unknown */
  var liveCache = {};
  function liveCheck(bibs) {
    var url = "/cgi-bin/koha/opac-reserve.pl?" + (bibs.length === 1 ? "biblionumber=" + bibs[0] : "biblionumbers=" + bibs.join("/") + "/") + "&manual=1";
    /* v8.2: a check from the last 30 s is reused (warmed on hover/focus) */
    var hit = liveCache[url];
    if (hit && Date.now() - hit.t < 30000) return hit.p;
    var p = liveCheckFetch(url, bibs);
    liveCache[url] = { t: Date.now(), p: p };
    return p;
  }
  function liveCheckFetch(url, bibs) {
    return $.ajax({ url: url, dataType: "html", timeout: 15000 }).then(function (html) {
      var out = {}, doc = $("<div>").append($.parseHTML(html));
      bibs.forEach(function (bib) {
        var row = doc.find("input.single_bib[value='" + bib + "']").closest(".holdrow"), map = {}, any = false;
        row.find("input.checkitem, input[class*='checkitem_']").each(function () {
          var tr = $(this).closest("tr");
          map[this.value] = { ok: !this.disabled, held: tr.find(".waiting").length > 0 };
          any = true;
        });
        if (any) out[bib] = map;
      });
      return out;
    }, function () { return {}; });
  }
  /* lines [{bib,title,slot?}] -> adds .a using the live check, falling back to page hints */
  function resolveLines(lines) {
    var bibs = lines.map(function (l) { return String(l.bib); });
    return $.when(liveCheck(bibs), $.when.apply($, bibs.map(function (b) { return itemLists(b); })).then(function () { return Array.prototype.slice.call(arguments); }))
      .then(function (live, lists) {
        if (bibs.length === 1) lists = [lists[0] === undefined ? lists : lists[0]];
        lines.forEach(function (l, i) { l.a = l.a && l.a.state === "none" ? l.a : decide(lists[i], pageHeldCount(l.bib, l.slot), live[String(l.bib)] || null); });
        return lines;
      });
  }

  /* ---------- patron's existing orders (from the holds tab) ---------- */
  var mineP = null;
  function myOrders(force) {
    var c = ss("ajCCmine");
    if (!force && c && Date.now() - c.t < 60000) return $.Deferred().resolve(c.ids).promise();
    if (mineP && !force) return mineP;
    mineP = $.ajax({ url: "/cgi-bin/koha/opac-user.pl", dataType: "html", timeout: 20000 }).then(function (html) {
      var ids = [];
      $("<div>").append($.parseHTML(html)).find("#opac-user-holds_panel a[href*='biblionumber=']").each(function () {
        var m = /biblionumber=(\d+)/.exec(this.getAttribute("href")); if (m && ids.indexOf(m[1]) < 0) ids.push(m[1]);
      });
      ss("ajCCmine", { t: Date.now(), ids: ids });
      return ids;
    }, function () { return []; });
    return mineP;
  }

  /* ---------- dialog (OPAC v8.2: redesigned) ----------
     A native <dialog class="aj-cc"> on the design system, instead of a
     Bootstrap modal. It opens the moment Click & Collect is pressed, with
     a skeleton while the copies are checked, then the same card changes
     step: choose a date, placing the order, done. Each step fades in
     place; the card itself scales in from 0.96 (a sheet rises from the
     bottom edge on phones) and leaves faster than it came. Under reduced
     motion it only fades.
     A modal <dialog> sits above the New arrivals popup and the cart
     pull-out (both are modal dialogs too), so they no longer step aside:
     they stay open underneath, and focus goes back to the button that
     opened the order. "ajcc:closed" tells them an order may have been
     placed, so their buttons can redraw. */
  var sheetEl = null, opener = null, busy = false;
  var REDUCE = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var CROSS = '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M5 5l10 10M15 5 5 15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  var TICK = '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M4.5 10.5l3.5 3.5 7.5-8" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var PIN = '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M10 18s5.5-5.2 5.5-9.5a5.5 5.5 0 1 0-11 0C4.5 12.8 10 18 10 18z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="10" cy="8.5" r="2" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>';
  var CLOCK = '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M10 6v4.5l3 2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function sheet() {
    if (sheetEl) return sheetEl;
    var d = document.createElement("dialog");
    d.className = "aj-cc";
    d.id = "ajCCDialog";
    if (AR) d.dir = "rtl";
    d.setAttribute("aria-labelledby", "ajCCTitle");
    d.innerHTML = '<div class="aj-cc__card"><div class="aj-cc__head"><h2 class="aj-cc__title" id="ajCCTitle"></h2>' +
      '<button type="button" class="aj-cc__close" aria-label="' + esc(T.close) + '">' + CROSS + '</button></div>' +
      '<div class="aj-cc__body"></div><div class="aj-cc__foot"></div></div>';
    document.body.appendChild(d);
    d.querySelector(".aj-cc__close").addEventListener("click", function () { closeSheet(); });
    d.addEventListener("click", function (e) {
      if (e.target === d) { closeSheet(); return; }            /* the dimmed page */
      if (e.target.closest && e.target.closest("[data-aj-dismiss]")) closeSheet();
    });
    d.addEventListener("cancel", function (e) { e.preventDefault(); closeSheet(); });   /* Escape */
    d.addEventListener("close", function () {
      d.classList.remove("is-closing");
      var o = opener; opener = null;
      if (o && o.isConnected) {
        /* a slot: its button is redrawn while the dialog is open */
        var b = o.classList && o.classList.contains("ajCCSlot") ? o.querySelector("button, .ajCC") : o;
        if (b && b.focus) b.focus();
      }
      document.dispatchEvent(new CustomEvent("ajcc:closed"));
    });
    sheetEl = d;
    return d;
  }
  function closeSheet() {
    if (!sheetEl || !sheetEl.open || busy) return;
    if (REDUCE) { sheetEl.close(); return; }
    sheetEl.classList.add("is-closing");
    setTimeout(function () { if (sheetEl.open) sheetEl.close(); }, 170);
  }
  function closeModal() { closeSheet(); }
  /* Show one step: title, body and footer. The first step opens the
     sheet; later steps fade in inside the same card. */
  function step(title, bodyHtml, footHtml, kind) {
    var d = sheet(), card = d.querySelector(".aj-cc__card");
    d.querySelector(".aj-cc__title").textContent = title;
    d.querySelector(".aj-cc__body").innerHTML = bodyHtml;
    d.querySelector(".aj-cc__foot").innerHTML = footHtml;
    card.className = "aj-cc__card" + (kind ? " is-" + kind : "");
    d.setAttribute("aria-busy", kind === "loading" ? "true" : "false");
    if (!d.open) {
      if (!opener) opener = document.activeElement;
      d.classList.remove("is-closing");
      d.showModal();
    } else {
      card.classList.remove("is-step");
      void card.offsetWidth;            /* restart the fade */
      card.classList.add("is-step");
    }
    var f = d.querySelector(".aj-cc__body input:checked, .aj-cc__foot .aj-cc__primary:not(:disabled)") || d.querySelector(".aj-cc__close");
    if (f && f.focus) f.focus({ preventScroll: true });
    return $(d);
  }

  function coverFor(bib) {
    var img = document.querySelector('.aj-arrivals .ajCCSlot[data-bib="' + bib + '"]');
    img = img && img.closest("li, .aj-arr__stage, .aj-arr__text") ? img.closest("li, .aj-arr__stage").querySelector("img") : null;
    if (!img) {
      var row = document.querySelector('input.cb[value="' + bib + '"], .ajCCSlot[data-bib="' + bib + '"]');
      row = row && row.closest("tr, li, .aj-cart__item");
      img = row ? row.querySelector(".bookcover img, .aj-cart__cover img, img.thumbnail") : null;
    }
    if (!img && new URLSearchParams(location.search).get("biblionumber") === String(bib)) {
      img = document.querySelector("#catalogue_detail_biblio .bookcover img");
    }
    var src = img && img.naturalWidth > 2 ? img.currentSrc || img.src : "";
    return src ? '<span class="aj-cc__cover"><img src="' + esc(src) + '" alt=""></span>' : '<span class="aj-cc__cover aj-cc__cover--plate" aria-hidden="true"></span>';
  }
  function deskName(d) { return d === "z" ? T.deskZ : T.deskMain; }
  function bookLine(l, sub) {
    return '<li class="aj-cc__book">' + coverFor(l.bib) + '<div class="aj-cc__book-text"><p class="aj-cc__book-title" dir="auto">' + esc(l.title) + '</p>' + (sub || "") + '</div></li>';
  }
  function meta(icon, text, cls) { return '<p class="aj-cc__meta' + (cls ? " " + cls : "") + '">' + icon + '<span>' + esc(text) + '</span></p>'; }

  /* Step 0: open at once, with a skeleton, while the copies are checked */
  function showChecking(title) {
    var b = '<ul class="aj-cc__books"><li class="aj-cc__book"><span class="aj-cc__cover aj-sk"></span><div class="aj-cc__book-text"><p class="aj-cc__book-title" dir="auto">' + esc(title || "") + '</p><span class="aj-sk aj-sk--line aj-sk--short"></span></div></li></ul>' +
      '<div class="aj-cc__dates is-loading" aria-hidden="true"><span class="aj-sk aj-sk--date"></span><span class="aj-sk aj-sk--date"></span><span class="aj-sk aj-sk--date"></span></div>' +
      '<p class="sr-only" role="status">' + esc(T.checking) + '</p>';
    var f = '<button type="button" class="aj-cc__secondary" data-aj-dismiss>' + esc(T.cancel) + '</button>' +
      '<button type="button" class="aj-cc__primary" disabled><span class="aj-cc__spin" aria-hidden="true"></span><span>' + esc(T.checking) + '</span></button>';
    step(T.dlgTitle, b, f, "loading");
  }

  /* lines: [{bib,title,a(avail)}]; mode "collect" | "reserve" | "cart" */
  function openOrderDialog(lines, mode) {
    var anyCollect = lines.some(function (l) { return l.a.state === "shelf"; });
    var opts = dateOptions(Date.now());
    var allHeld = lines.length && lines.every(function (l) { return l.a.held; });
    var body = "";
    if (mode === "reserve") body += '<p class="aj-cc__lead">' + esc(allHeld ? T.resHeld : T.resText) + '</p>';
    body += '<ul class="aj-cc__books" id="ajCCLines">';
    lines.forEach(function (l, i) {
      var st = l.a.state, dis = (st !== "shelf" && st !== "onloan"), chk = (st === "shelf" || mode === "reserve");
      var sub = "";
      if (st === "shelf") sub = meta(PIN, T.collectFrom + " " + deskName(l.a.desk)) + (l.a.readOnly ? meta(CLOCK, T.readOnly, "is-warn") : "");
      else if (st === "onloan") sub = meta(CLOCK, mode === "cart" ? (l.a.held ? T.reserveHeld : T.reserveIt) : (l.a.held ? T.onHold : T.onLoan), "is-muted");
      else sub = meta(CLOCK, T.notOrderable, "is-muted");
      if (mode === "cart") {
        body += '<li class="aj-cc__book aj-cc__book--pick' + (dis ? " is-off" : "") + '"><label class="aj-cc__pick">' +
          '<input type="checkbox" class="aj-cc__check ajCCLine" data-i="' + i + '"' + (chk && !dis ? " checked" : "") + (dis ? " disabled" : "") + '>' +
          '<span class="aj-cc__tick" aria-hidden="true">' + TICK + '</span>' + coverFor(l.bib) +
          '<span class="aj-cc__book-text"><span class="aj-cc__book-title" dir="auto">' + esc(l.title) + '</span>' + sub.replace(/<p /g, "<span ").replace(/<\/p>/g, "</span>") + '</span></label></li>';
      } else {
        body += bookLine(l, sub);
      }
    });
    body += '</ul>';
    if (anyCollect && mode !== "reserve") {
      body += '<fieldset class="aj-cc__when"><legend class="aj-cc__legend">' + esc(T.when) + '</legend><div class="aj-cc__dates">';
      opts.forEach(function (o, i) {
        body += '<label class="aj-cc__date"><input class="aj-cc__radio" type="radio" name="ajCCDate" value="' + i + '"' + (i === 0 ? " checked" : "") + '>' +
          '<span class="aj-cc__day">' + esc(o.day) + '</span><span class="aj-cc__ready">' + esc(o.when) + '</span>' +
          '<span class="aj-cc__mark" aria-hidden="true">' + TICK + '</span></label>';
      });
      body += '</div></fieldset>';
    }
    body += '<div id="ajCCMsg" class="aj-cc__msg" role="status" aria-live="polite"></div>';
    var go = mode === "reserve" ? T.confirmRes : T.confirm;
    var foot = '<button type="button" class="aj-cc__secondary" data-aj-dismiss>' + esc(T.cancel) + '</button>' +
      '<button type="button" class="aj-cc__primary" id="ajCCGo"><span>' + esc(go) + '</span></button>';
    var m = step(mode === "reserve" ? (allHeld ? T.resTitleHeld : T.resTitle) : T.dlgTitle, body, foot, "choose");
    var goBtn = m.find("#ajCCGo");
    function syncGo() {
      if (mode !== "cart") return;
      goBtn.prop("disabled", !m.find(".ajCCLine:checked").length);
    }
    m.find(".ajCCLine").on("change", syncGo);
    syncGo();
    goBtn.on("click", function () {
      var chosen = lines.filter(function (l, i) {
        if (mode === "cart") return m.find('.ajCCLine[data-i="' + i + '"]').prop("checked");
        return l.a.state === "shelf" || l.a.state === "onloan";
      });
      if (!chosen.length) return;
      var opt = opts[+(m.find('input[name="ajCCDate"]:checked').val() || 0)];
      var plan = chosen.map(function (l) {
        return { bib: String(l.bib), title: l.title, item: String(l.a.item.item_id), alts: l.a.alts || [], held: !!l.a.held, desk: l.a.desk, readOnly: l.a.readOnly,
                 kind: l.a.state === "shelf" ? "collect" : "reserve",
                 start: l.a.state === "shelf" ? opt.start : opts[0].start,
                 ready: l.a.state === "shelf" ? opt.summary : null };
      });
      var w = goBtn.outerWidth();
      goBtn.prop("disabled", true).css("min-width", w + "px").html('<span class="aj-cc__spin" aria-hidden="true"></span><span>' + esc(T.working) + '</span>');
      m.find(".aj-cc__secondary, .aj-cc__close").prop("disabled", true);
      m.find("input").prop("disabled", true);
      busy = true;
      placeOrders(plan).then(function (res) { busy = false; showResult(res); }, function (err) {
        busy = false;
        m.find(".aj-cc__secondary, .aj-cc__close, input:not([data-off])").prop("disabled", false);
        m.find("#ajCCMsg").html('<p class="aj-cc__alert">' + esc(err || T.slow) + '</p>');
        goBtn.prop("disabled", false).html('<span>' + esc(T.tryAgain) + '</span>');
      });
    });
  }

  function showResult(res) {
    var html = "";
    if (res.ok.length) {
      html += '<div class="aj-cc__done-mark" aria-hidden="true"><span class="aj-cc__ring"></span>' + TICK + '</div>';
      html += '<ul class="aj-cc__books aj-cc__books--done">';
      res.ok.forEach(function (p) {
        var sub = p.kind === "collect"
          ? meta(CLOCK, T.readyAt.charAt(0).toUpperCase() + T.readyAt.slice(1) + " " + p.ready, "is-strong") + meta(PIN, T.collectFrom + " " + deskName(p.desk)) + (p.readOnly ? meta(CLOCK, T.readOnly, "is-warn") : "")
          : meta(CLOCK, p.held ? T.doneResHeld : T.doneRes);
        html += bookLine(p, sub);
      });
      html += '</ul>';
      if (res.ok.some(function (p) { return p.kind === "collect"; })) html += '<p class="aj-cc__note">' + esc(T.doneCollect) + '</p>';
    }
    if (res.failed.length) {
      html += '<div class="aj-cc__alert"><p class="aj-cc__alert-title">' + esc(T.failed) + '</p><ul>' + res.failed.map(function (f) {
        return '<li>' + esc(f.title ? f.title + ": " : "") + esc(f.reason) + '</li>'; }).join("") + '</ul></div>';
    }
    step(res.ok.length ? T.doneTitle : T.notPlaced, html, '<button type="button" class="aj-cc__primary aj-cc__primary--wide" data-aj-dismiss><span>' + esc(T.done) + '</span></button>', res.ok.length ? "done" : "failed");
    ss("ajCCmine", null);
    refreshButtons(true);
  }

  /* ---------- place orders via Koha's own form in a hidden frame ----------
     The connection can drop (HTTP/3 errors). After submitting we never trust a
     failed page load: we confirm against the patron's real holds list instead. */
  function placeOrders(planIn) {
    var d = $.Deferred(), done = false, stage = "form", preFailed = [], plan = planIn.slice(), formTries = 0, failCodes = [];
    var bibs = plan.map(function (p) { return p.bib; });
    var url = "/cgi-bin/koha/opac-reserve.pl?" + (bibs.length === 1 ? "biblionumber=" + bibs[0] : "biblionumbers=" + bibs.join("/") + "/");
    var fr = $('<iframe title="" aria-hidden="true" tabindex="-1" style="position:absolute;width:1px;height:1px;left:-9999px;border:0">').attr("src", url).appendTo("body");
    var timer = setTimeout(function () { if (stage === "sent") verify(); else finish(null, T.slow); }, CFG.frameTimeoutMs);
    var orderedText = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Karachi", weekday: "short", day: "numeric", month: "short",
      year: "numeric", hour: "numeric", minute: "2-digit", hour12: true }).format(new Date());
    function finish(res, err) {
      if (done) return; done = true; clearTimeout(timer);
      setTimeout(function () { fr.remove(); }, 500);
      if (res) { res.failed = preFailed.concat(res.failed); d.resolve(res); } else d.reject(err);
    }
    var verifying = false;
    function verify() {
      if (verifying || done) return; verifying = true; clearTimeout(timer);
      var tries = 0;
      (function poll() {
        myOrders(true).then(function (ids) {
          var ok = plan.filter(function (p) { return ids.indexOf(p.bib) >= 0; });
          if (ok.length === plan.length || ++tries >= 6) {
            if (!ok.length && !failCodes.length) return finish(null, T.slow);
            var reason = T.reasons[failCodes[0]] || T.reasons._default;
            finish({ ok: ok, failed: plan.filter(function (p) { return ids.indexOf(p.bib) < 0; }).map(function (p) { return { title: p.title, reason: reason }; }) });
          } else setTimeout(poll, 2500);
        });
      })();
    }
    fr.on("load", function () {
      var w = fr[0].contentWindow, doc, path;
      try { doc = w.document; path = w.location.pathname; } catch (e) { doc = null; }
      var isKoha = doc && /\/cgi-bin\/koha\//.test(path || "");

      if (stage === "sent") {
        if (isKoha && /opac-user\.pl$/.test(path)) {
          try { failCodes = (new URLSearchParams(w.location.search).get("failed_holds") || "").split("|").filter(Boolean); } catch (e) {}
        }
        return verify();
      }
      if (!isKoha) {                       /* network error page: try the form again */
        if (++formTries <= 2) { setTimeout(function () { fr.attr("src", url + "&r=" + formTries); }, 1500); return; }
        return finish(null, T.slow);
      }
      if (!/opac-reserve\.pl$/.test(path)) return finish(null, T.reasons._default);

      var tries = 0;
      (function ready() {
        var $$ = w.jQuery;
        if (!$$ || !doc.querySelector(".confirmjs, #holdmessages, #none_available, .holdrow")) {
          if (++tries < 60) return setTimeout(ready, 250);
          return finish(null, T.slow);
        }
        if (doc.getElementById("holdmessages")) {
          return finish(null, $.trim($(doc.getElementById("holdmessages")).find("li").first().text()) || T.reasons._default);
        }
        var keep = [];
        plan.forEach(function (p) {
          var row = $$(doc).find("input.single_bib[value='" + p.bib + "']").closest(".holdrow");
          var free = function (id) {
            var r = row.find("input.checkitem_" + p.bib + "[value='" + id + "']:not(:disabled)");
            return r.length && !r.closest("tr").find(".waiting").length ? r : null;
          };
          var radio = row.find("input.checkitem_" + p.bib + "[value='" + p.item + "']:not(:disabled)");
          var takenByOther = radio.closest("tr").find(".waiting").length > 0;
          if (p.kind === "collect" && radio.length && takenByOther) {
            /* our copy was just ordered by someone else: use another free copy at the same desk */
            for (var k = 0; k < (p.alts || []).length; k++) { var alt = free(p.alts[k]); if (alt) { radio = alt; p.item = p.alts[k]; takenByOther = false; break; } }
          }
          if (!row.length) {
            var why = $.trim($$(doc).find("a[href*='biblionumber=" + p.bib + "']").first().closest(".holdrow").find(".alert").first().text());
            preFailed.push({ title: p.title, reason: why || T.notAvail });
          } else if (p.kind === "collect" && radio.length && takenByOther) {
            preFailed.push({ title: p.title, reason: T.takenNow });
          } else if (!radio.length) {
            preFailed.push({ title: p.title, reason: T.notAvail });
          } else {
            $$("#reqspecific_" + p.bib).prop("checked", true);
            radio.prop("checked", true);
            var from = doc.getElementById("from" + p.bib);
            if (from) { if (from._flatpickr) from._flatpickr.setDate(p.start, true, "Y-m-d"); else from.value = p.start; }
            var note = doc.getElementById("holdnotes_" + p.bib);
            if (note) note.value = "Ordered: " + orderedText + (p.kind === "collect" ? " (Click & Collect)" : p.held ? " (Reserve, ordered by another reader)" : " (Reserve, on loan)");
            keep.push(p);
          }
        });
        $$(doc).find("input.confirmjs").each(function () {
          var el = this, on = keep.some(function (p) { return p.bib === el.value; });
          if (el.checked !== on) { el.checked = on; $$(el).trigger("change"); }
        });
        if (!keep.length) return finish({ ok: [], failed: [] });
        plan = keep;
        var alertMsg = null;
        w.alert = function (m) { alertMsg = String(m); };
        stage = "sent";
        timer = setTimeout(verify, 20000);   /* no response at all: check the holds list */
        $$(doc).find(".placehold").first().trigger("click");
        setTimeout(function () { if (alertMsg) { stage = "form"; finish(null, alertMsg); } }, 600);
      })();
    });
    return d.promise();
  }

  /* ---------- buttons ---------- */
  /* own styling: the theme's #action link rules (copper icons, navy text) must not reach these buttons */
  $("<style id='ajCCStyle'>" +
    ".ajCCBtn.btn{display:inline-flex;align-items:center;justify-content:center;gap:.45em;line-height:1.25;white-space:nowrap;transition:background-color .15s ease,border-color .15s ease,color .15s ease}" +
    ".ajCCBtn.btn i,#action .ajCCBtn.btn i,#action .ajCCBtn.btn:hover i{color:inherit!important;width:auto;margin:0}" +
    ".ajCCBtn.btn-primary,#action .ajCCBtn.btn-primary{background:var(--aj-copper-deep,#7a4e1c);border:1px solid var(--aj-copper-deep,#7a4e1c);color:#fff!important}" +
    ".ajCCBtn.btn-primary:hover,.ajCCBtn.btn-primary:focus-visible,.ajCCBtn.btn-primary:active,#action .ajCCBtn.btn-primary:hover{background:var(--aj-copper-dark,#5f3c15);border-color:var(--aj-copper-dark,#5f3c15);color:#fff!important;box-shadow:none}" +
    ".ajCCBtn.btn-outline-primary,#action .ajCCBtn.btn-outline-primary{background:#fff;border:1px solid var(--aj-copper-deep,#7a4e1c);color:var(--aj-copper-deep,#7a4e1c)!important}" +
    ".ajCCBtn.btn-outline-primary:hover,.ajCCBtn.btn-outline-primary:focus-visible,#action .ajCCBtn.btn-outline-primary:hover{background:var(--aj-copper-deep,#7a4e1c);color:#fff!important}" +
    ".ajCCBtn.btn:focus-visible{outline:2px solid var(--aj-copper-dark,#5f3c15);outline-offset:2px}" +
    ".ajCCBtn.btn:disabled{opacity:.75}" +
    ".ajCCSel i{color:inherit!important}" +
    "</style>").appendTo("head");

  function btnHtml(state, bib, a) {
    if (state === "mine") return '<span class="btn btn-sm btn-outline-secondary disabled ajCC ajCCBtn" aria-disabled="true"><i class="fa fa-check" aria-hidden="true"></i><span>' + esc(T.ordered) + '</span></span>';
    if (state === "shelf") return '<button type="button" class="btn btn-sm btn-primary ajCC ajCCBtn" data-bib="' + esc(bib) + '"><i class="fa fa-shopping-basket" aria-hidden="true"></i><span>' + esc(T.cc) + '</span></button>';
    if (state === "onloan") return '<button type="button" class="btn btn-sm btn-outline-primary ajCC ajCCBtn" data-bib="' + esc(bib) + '" data-reserve="1"><i class="fa fa-clock" aria-hidden="true"></i><span>' + esc(T.reserve) + '</span></button> <span class="small text-muted">' + esc(a && a.held ? T.onHold : T.onLoan) + '</span>';
    return "";
  }
  function slotFor(bib, title) { return $('<span class="ajCCSlot d-inline-block my-1" data-bib="' + esc(bib) + '"></span>').data("title", title); }

  function fillSlot(slot, mine) {
    var bib = String(slot.data("bib"));
    if (mine.indexOf(bib) >= 0) { slot.html(btnHtml("mine", bib)); return; }
    availability(bib, slot).then(function (a) {
      slot.data("a", a);
      if (!slot.find(".disabled.ajCC").length) slot.html(btnHtml(a.state, bib, a));   /* "Ordered" wins */
    });
  }
  /* v2.3: each title's button shows as soon as its copies are known,
     up to CFG.parallel titles at a time. The reader's own orders (from
     opac-user.pl, about 2 seconds) load alongside; when they arrive,
     titles already ordered switch to "Ordered". v2.2 waited for the
     orders before starting, then went 4 titles at a time. */
  function refreshButtons(force, root) {
    if (force) availCache = {};
    var all = root ? $(root).find(".ajCCSlot") : $(".ajCCSlot");
    var queue = all.toArray(), busy = 0;
    (function pump() {
      while (busy < CFG.parallel && queue.length) {
        var slot = $(queue.shift());
        busy++;
        itemLists(String(slot.data("bib"))).always(function () { busy--; pump(); });
        fillSlot(slot, []);
      }
    })();
    myOrders(force).then(function (mine) {
      all.each(function () {
        var s = $(this);
        if (mine.indexOf(String(s.data("bib"))) >= 0) s.html(btnHtml("mine", String(s.data("bib"))));
      });
    });
  }

  /* click: check live which copies are free, then open the right dialog */
  /* v8.2: open with what the button already knows. The slot was drawn
     from the title's copies (the public items API), so the dialog can
     show its dates at once; the reader's orders and Koha's hold form are
     then checked in the background (they took 5-8 s one after the
     other). If they change the picture — already ordered, a copy just
     taken — the dialog updates or closes before anything is confirmed,
     and placeOrders checks the copy again in Koha's own form anyway. */
  var verifyToken = 0;
  function openFor(bib, slot, title, btn) {
    title = title || (slot && slot.data("title")) || "";
    var known = slot && slot.length ? slot.data("a") : null;
    opener = slot && slot.length ? slot[0] : (btn && btn[0] ? btn[0] : document.activeElement);
    if (known && (known.state === "shelf" || known.state === "onloan") && known.item) {
      var lines = [{ bib: String(bib), title: title, slot: slot, a: known }];
      openOrderDialog(lines, known.state === "shelf" ? "collect" : "reserve");
      verifyInBackground(lines, slot);
      return;
    }
    openSlow(bib, slot, title, btn);
  }
  function verifyInBackground(lines, slot) {
    var token = ++verifyToken, l = lines[0], was = l.a;
    $.when(myOrders(false), resolveLines([{ bib: l.bib, title: l.title, slot: slot }])).then(function (mine, fresh) {
      if (token !== verifyToken || !sheetEl || !sheetEl.open || busy) return;
      if ($.inArray(l.bib, mine || []) >= 0) {
        closeSheet();
        if (slot && slot.length) slot.html(btnHtml("mine", l.bib));
        return;
      }
      var a = fresh && fresh[0] && fresh[0].a;
      if (!a || a.state === "error") return;                 /* keep what we have */
      if (slot && slot.length) slot.data("a", a);
      if (a.state === was.state && !!a.held === !!was.held) {
        l.a = a;                                             /* same choice, live copy */
        return;
      }
      if (slot && slot.length) slot.html(btnHtml(a.state, l.bib, a));
      if (a.state === "shelf" || a.state === "onloan") {
        openOrderDialog([{ bib: l.bib, title: l.title, slot: slot, a: a }], a.state === "shelf" ? "collect" : "reserve");
      } else {
        closeSheet();
      }
    });
  }
  function openSlow(bib, slot, title, btn) {
    var old = btn ? btn.html() : null;
    showChecking(title);
    if (btn) btn.prop("disabled", true);
    /* v2.3: the button may show before the reader's orders have loaded, so
       check them first: a title already ordered is never ordered twice */
    myOrders(false).then(function (mine) {
      if (mine.indexOf(String(bib)) >= 0) {
        closeSheet();
        if (slot && slot.length) slot.html(btnHtml("mine", bib));
        else if (btn) btn.prop("disabled", false).html(old);
        return;
      }
      openChecked(bib, slot, title, btn, old);
    });
  }
  function openChecked(bib, slot, title, btn, old) {
    resolveLines([{ bib: bib, title: title, slot: slot }]).then(function (lines) {
      var a = lines[0].a;
      if (slot && slot.length) { slot.data("a", a); slot.html(btnHtml(a.state, bib, a)); }
      else if (btn) btn.prop("disabled", false).html(old);
      if (a.state === "shelf" || a.state === "onloan") openOrderDialog(lines, a.state === "shelf" ? "collect" : "reserve");
      else closeSheet();
    }, function () { closeSheet(); if (btn) btn.prop("disabled", false).html(old); });
  }
  /* v8.2: start the reader's orders and the hold-form check while the
     pointer is on its way, so the background check is usually done
     before the dialog has finished opening */
  $(document).on("pointerenter focusin", "button.ajCC", function () {
    var bib = String($(this).data("bib") || "");
    if (!bib || $(this).data("warm")) return;
    $(this).data("warm", 1);
    myOrders(false);
    liveCheck([bib]);
  });
  $(document).on("click", "button.ajCC", function () {
    var b = $(this), slot = b.closest(".ajCCSlot"), bib = String(b.data("bib"));
    openFor(bib, slot, slot.data("title") || document.title, b);
  });

  /* v8.2: a title as a reader says it. Koha prints "The kite runner /"
     with the statement of responsibility ("Khaled Hosseini.") in a span
     after it, and ISBD punctuation at the end. Take the span out (it may
     already be hidden, but its text is still there), close up the white
     space, and drop the trailing " /", " :" or " ;". Works the same for
     Arabic and LSD titles (the punctuation sits at the logical end). */
  function cleanTitle(node) {
    if (!node) return "";
    var c = node.cloneNode(true);
    $(c).find(".title_resp_stmt, .sr-only, .visually-hidden, .aj-year").remove();
    return $.trim($(c).text().replace(/\s+/g, " ")).replace(/\s*[\/:;,=]+\s*$/, "");
  }
  function titleNear(el) {
    var t = cleanTitle($(el).closest(".bibliocol, .record, tr, .searchresults li").find("a.title, .title").first()[0]);
    return t || cleanTitle($("h1.title, h2.title").first()[0]) || "";
  }

  var path = location.pathname, params = new URLSearchParams(location.search);

  $(function () {
    /* Search results, lists, other pages: replace Koha's hold links with a dynamic slot */
    $('a[href*="opac-reserve.pl?biblionumber="]').each(function () {
      var a = $(this), href = a.attr("href");
      if (/manual=1/.test(href)) return;
      var m = /biblionumber=(\d+)/.exec(href); if (!m) return;
      var holder = a.closest("li").length && a.closest(".actions-menu, .nav, #action, ul").length ? a.closest("li") : a;
      var slot = slotFor(m[1], path.indexOf("opac-detail.pl") >= 0 ? cleanTitle($("h1.title")[0]) : titleNear(a));
      holder.replaceWith(holder.is("li") ? $("<li>").append(slot) : slot);
    });
    if ($(".ajCCSlot").length) refreshButtons(false);

    /* Several titles at once (cart, or ticked search results) */
    function multiOrder(ids, btn) {
      opener = btn[0];
      showChecking("");
      btn.prop("disabled", true);
      myOrders(true).then(function (mine) {
        var lines = ids.map(function (bib) {
          var t = cleanTitle($("#bib" + bib).closest("tr, li, .detailrecord, .record, .bibliocol").find("a.title, .title, h3").first()[0]) || ("#" + bib);
          return { bib: String(bib), title: t };
        });
        lines.forEach(function (l) { if (mine.indexOf(l.bib) >= 0) l.a = { state: "none" }; });
        resolveLines(lines).always(function () { btn.prop("disabled", false); openOrderDialog(lines, "cart"); });
      });
    }

    /* Cart: one button for the whole cart */
    if (/opac-basket\.pl$/.test(path)) {
      $(".hold").closest("li, span").hide();
      var ids = $(".cb").map(function () { return this.value; }).get();
      if (ids.length) {
        var all = $('<div class="my-2"><button type="button" class="btn btn-primary ajCCBtn" id="ajCCAll"><i class="fa fa-shopping-basket" aria-hidden="true"></i><span>' + esc(T.ccAll) + '</span></button></div>');
        var bar = $(".selections-toolbar").first();
        if (bar.length) bar.before(all); else $("#userbasket, .maincontent").first().prepend(all);
        all.find("button").on("click", function () { multiOrder(ids, $(this)); });
      }
    } else {
      /* Search results / lists toolbar: replace "Place hold" for selected titles */
      $(".selections-toolbar .hold").each(function () {
        var kh = $(this);
        var sel = $('<button type="button" class="btn btn-link btn-sm ajCCSel"><i class="fa fa-fw fa-shopping-basket" aria-hidden="true"></i> ' + esc(T.ccSel) + '</button>');
        sel.on("click", function (e) {
          e.preventDefault();
          var chosen = $("input.cb:checked").map(function () { return this.value; }).get().filter(function (v) { return /^\d+$/.test(v); });
          if (!chosen.length) { alert(T.pickSome); return; }
          multiOrder(chosen, sel);
        });
        kh.after(sel).hide();
      });
    }

    /* Koha's own hold screen: send single-title visits to the record page dialog; tidy the rest */
    if (/opac-reserve\.pl$/.test(path) && !params.get("manual")) {
      var one = params.get("biblionumber");
      if (one) { location.replace("/cgi-bin/koha/opac-detail.pl?biblionumber=" + encodeURIComponent(one) + "&cc=1"); return; }
      $("#holds").addClass("ajCCTidy");
      $("<style>.ajCCTidy .holds-count,.ajCCTidy .priority,.ajCCTidy .toggle-hold-options,.ajCCTidy #hold_group,.ajCCTidy .notesrow,.ajCCTidy li:has(> .futuredate),.ajCCTidy .copiesrow caption{display:none!important}</style>").appendTo("head");
    }

    /* Record page opened from an old hold link: open the dialog straight away */
    if (/opac-detail\.pl$/.test(path) && params.get("cc")) {
      var s = $(".ajCCSlot").first();
      if (s.length) openFor(String(s.data("bib")), s, s.data("title"), null);
    }
  });

  window.ajCC = { asap: asap, dateOptions: dateOptions, classifyItem: classifyItem, decide: decide, CFG: CFG,
    fill: function (root, force) { if (root) refreshButtons(!!force, root); },
    /* v8.2: the shelving location (and call number) of the copy that
       would be ordered, for Part G's popup: { location, callnumber } */
    where: function (bib) {
      return itemLists(String(bib)).then(function (L) {
        var it = L && (L.shelf[0] || L.onloan[0]);
        return it ? { location: $.trim(it.location || ""), callnumber: $.trim(it.callnumber || "") } : null;
      });
    },
    /* v8.1: the cart pull-out (Part I) orders several titles at once.
       lines: [{ bib, title }]. Same as the cart page's "Click & Collect
       all": titles already ordered are left out, the rest checked live. */
    orderMany: function (lines, done) {
      opener = document.activeElement;
      showChecking("");
      myOrders(true).then(function (mine) {
        lines = lines.map(function (l) {
          var x = { bib: String(l.bib), title: l.title };
          if (mine.indexOf(x.bib) >= 0) x.a = { state: "none" };
          return x;
        });
        resolveLines(lines).always(function () {
          if (done) done();
          openOrderDialog(lines, "cart");
        });
      });
    } };
})();
} catch (err) { if (window.console) console.warn("OPACUserJS part E (Click & Collect):", err); }
/* ==== END PART E: CLICK & COLLECT ==== */
