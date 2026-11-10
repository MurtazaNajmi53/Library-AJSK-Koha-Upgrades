/* =====================================================================
   Maktabat Aljamea (Sindh) — "New in the library" shelf and
   "Most borrowed" list on the OPAC home page
   Paste into OPACUserJS, below the "My library" code.
   Needs: elements with id="aj-new-books" and id="aj-popular"
          (see the HTML block), and OpacTopissue = Allow.
   Search engine: Zebra. Tested against Koha 25.11 page markup.
   ===================================================================== */
(function () {
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
})();
