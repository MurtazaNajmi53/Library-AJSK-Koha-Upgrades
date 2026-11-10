/* Maktabat Aljamea: behaviour helpers. Plain script, no dependencies, no network.
   Call Aljamea.init() once after the page loads (in Koha: OPACUserJS). Each helper also works alone. */
(function () {
  "use strict";
  var doc = document;
  var reduce = function () { return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; };
  var isRtl = function (el) { return getComputedStyle(el).direction === "rtl"; };
  var all = function (root, sel) { return Array.prototype.slice.call((root || doc).querySelectorAll(sel)); };
  var after = function (el, ms, fn) {
    var done = false;
    var finish = function () { if (!done) { done = true; fn(); } };
    el.addEventListener("transitionend", finish, { once: true });
    setTimeout(finish, ms + 50);
  };

  /* Menus: <button data-aj-menu aria-controls="id" aria-expanded="false"> + <ul class="aj-menu" id="id">.
     Opens on click, Enter, Space or ArrowDown; Escape and outside click close and return focus. */
  function menu(trigger) {
    var list = doc.getElementById(trigger.getAttribute("aria-controls"));
    if (!list || trigger.ajMenu) return;
    trigger.ajMenu = true;
    var items = function () { return all(list, "a, button:not(:disabled)"); };
    var open = function (focusFirst) {
      list.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
      if (focusFirst) { var first = items()[0]; if (first) requestAnimationFrame(function () { first.focus(); }); }
    };
    var close = function (returnFocus) {
      if (!list.classList.contains("is-open")) return;
      list.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
      if (returnFocus) trigger.focus();
    };
    trigger.addEventListener("click", function () {
      list.classList.contains("is-open") ? close(false) : open(false);
    });
    /* Sort-style menus: role="menuitemradio" items keep one checked, update [data-aj-menu-label]
       inside the trigger, and fire "aj:select" on the trigger with the item's data-value. */
    list.addEventListener("click", function (e) {
      var item = e.target.closest && e.target.closest('[role="menuitemradio"]');
      if (!item) return;
      all(list, '[role="menuitemradio"]').forEach(function (x) { x.setAttribute("aria-checked", x === item ? "true" : "false"); });
      var label = trigger.querySelector("[data-aj-menu-label]");
      if (label) label.textContent = item.textContent.trim();
      trigger.dispatchEvent(new CustomEvent("aj:select", { bubbles: true, detail: { value: item.getAttribute("data-value") } }));
      close(true);
    });
    trigger.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); open(true); }
    });
    list.addEventListener("keydown", function (e) {
      var list_ = items(), i = list_.indexOf(doc.activeElement);
      if (e.key === "Escape") { e.preventDefault(); close(true); }
      else if (e.key === "ArrowDown") { e.preventDefault(); list_[(i + 1) % list_.length].focus(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); list_[(i - 1 + list_.length) % list_.length].focus(); }
      else if (e.key === "Home") { e.preventDefault(); list_[0].focus(); }
      else if (e.key === "End") { e.preventDefault(); list_[list_.length - 1].focus(); }
      else if (e.key === "Tab") { close(false); }
    });
    doc.addEventListener("click", function (e) {
      if (!list.contains(e.target) && !trigger.contains(e.target)) close(false);
    });
  }

  /* Toasts: Aljamea.toast("Added to your cart", { action: "View cart", href: "/cgi-bin/koha/opac-basket.pl" }).
     Announced politely, stays 5s (paused while hovered or focused), leaves with a short fade. */
  function toast(text, opts) {
    opts = opts || {};
    var host = doc.querySelector(".aj-toasts"), fresh = false;
    if (!host) {
      fresh = true; /* a live region must exist before its content arrives, so the first toast waits a frame */
      host = doc.createElement("div");
      host.className = "aj-toasts aj";
      host.setAttribute("role", "status");
      host.setAttribute("aria-live", "polite");
      doc.body.appendChild(host);
    }
    var el = doc.createElement("div");
    el.className = "aj-toast";
    var span = doc.createElement("span");
    span.className = "aj-toast__text";
    span.textContent = text;
    el.appendChild(span);
    if (opts.action) {
      var a = doc.createElement(opts.href ? "a" : "button");
      a.textContent = opts.action;
      if (opts.href) a.href = opts.href; else { a.type = "button"; a.addEventListener("click", function () { if (opts.onAction) opts.onAction(); dismiss(); }); }
      el.appendChild(a);
    }
    var timer, ms = opts.duration || 5000;
    var dismiss = function () {
      clearTimeout(timer);
      el.classList.add("is-leaving");
      after(el, 200, function () { el.remove(); });
    };
    var arm = function () { clearTimeout(timer); timer = setTimeout(dismiss, ms); };
    el.addEventListener("mouseenter", function () { clearTimeout(timer); });
    el.addEventListener("mouseleave", arm);
    el.addEventListener("focusin", function () { clearTimeout(timer); });
    el.addEventListener("focusout", arm);
    var show = function () { host.appendChild(el); arm(); };
    fresh ? setTimeout(show, 100) : show();
    return { dismiss: dismiss };
  }

  /* Loading. Two layers that work together:
     progress  - the 3px bar. start() on every navigation; done() when the work finishes.
     loader    - the rosette overlay for long waits. show(label) / hide().
     loader.bind() wires both to same-origin links and form submits: the bar starts at once,
     and if the next page has not arrived after 1.2s the rosette appears with a label taken from
     data-aj-loading on the link or form ("Searching the catalogue..." for search forms). */
  var rtlDoc = function () { return doc.documentElement.dir === "rtl"; };
  var progress = {
    el: null, value: 0, timer: null, hideTimer: null,
    mount: function () {
      if (progress.el && doc.contains(progress.el)) return progress.el;
      var host = doc.querySelector(".aj-masthead, .aj-header");
      var bar = doc.createElement("div");
      bar.className = "aj-progress";
      bar.setAttribute("aria-hidden", "true");
      bar.innerHTML = '<span class="aj-progress__bar"></span>';
      (host || doc.body).appendChild(bar);
      progress.el = bar;
      return bar;
    },
    set: function (v) { progress.value = v; progress.mount().style.setProperty("--aj-progress", v); },
    start: function () {
      var el = progress.mount();
      clearInterval(progress.timer); clearTimeout(progress.hideTimer);
      el.classList.add("is-active");
      progress.set(0.08);
      /* creeps towards 90% and never claims to be finished before it is */
      progress.timer = setInterval(function () { progress.set(progress.value + (0.9 - progress.value) * 0.1); }, 280);
    },
    done: function () {
      if (!progress.el) return;
      clearInterval(progress.timer);
      progress.set(1);
      progress.hideTimer = setTimeout(function () {
        progress.el.classList.remove("is-active");
        setTimeout(function () { progress.el.style.transition = "none"; progress.set(0); requestAnimationFrame(function () { progress.el.style.transition = ""; }); }, 250);
      }, 260);
    }
  };

  var loader = {
    escalate: null,
    el: function () {
      var l = doc.querySelector(".aj-loader:not(.aj-loader--inline)");
      if (!l) {
        l = doc.createElement("div");
        l.className = "aj-loader aj";
        l.setAttribute("role", "status");
        l.setAttribute("aria-live", "polite");
        l.setAttribute("aria-hidden", "true");
        l.innerHTML = '<span class="aj-loader__mark" aria-hidden="true"><span class="aj-loader__ghost"></span><span class="aj-loader__gold"></span><span class="aj-loader__lines"></span></span><p class="aj-loader__label"></p>';
        doc.body.appendChild(l);
      }
      return l;
    },
    show: function (label) {
      var l = loader.el(), p = l.querySelector(".aj-loader__label");
      if (p) p.textContent = label || (rtlDoc() ? "\u062c\u0627\u0631\u064d \u0627\u0644\u062a\u062d\u0645\u064a\u0644\u2026" : "Loading\u2026");
      l.setAttribute("aria-hidden", "false");
      l.classList.add("is-active");
    },
    hide: function () {
      clearTimeout(loader.escalate);
      var l = doc.querySelector(".aj-loader:not(.aj-loader--inline)");
      if (l) { l.classList.remove("is-active"); l.setAttribute("aria-hidden", "true"); }
      progress.done();
    },
    /* Start the bar now; bring in the rosette only if the wait runs long. */
    begin: function (label, after) {
      progress.start();
      clearTimeout(loader.escalate);
      loader.escalate = setTimeout(function () { loader.show(label); }, after === undefined ? 1200 : after);
    },
    bind: function () {
      doc.addEventListener("click", function (e) {
        var a = e.target.closest && e.target.closest("a[href]");
        if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (a.target && a.target !== "_self") return;
        if (a.hasAttribute("download") || a.origin !== location.origin) return;
        if (a.pathname === location.pathname && a.search === location.search && a.hash) return;
        loader.begin(a.getAttribute("data-aj-loading"));
      });
      doc.addEventListener("submit", function (e) {
        if (e.defaultPrevented) return;
        var f = e.target;
        var label = f.getAttribute("data-aj-loading") || (f.getAttribute("role") === "search" ? (rtlDoc() ? "\u062c\u0627\u0631\u064d \u0627\u0644\u0628\u062d\u062b \u0641\u064a \u0627\u0644\u0641\u0647\u0631\u0633\u2026" : "Searching the catalogue\u2026") : null);
        loader.begin(label);
      });
      window.addEventListener("pageshow", loader.hide); /* back/forward cache: never come back to a spinner */
    }
  };

  /* Busy button: Aljamea.busy(button, promise). Keeps the width, shows a spinner, blocks repeat presses. */
  function busy(btn, promise) {
    btn.classList.add("is-loading");
    btn.setAttribute("aria-busy", "true");
    btn.setAttribute("aria-disabled", "true");
    var clear = function () {
      btn.classList.remove("is-loading");
      btn.removeAttribute("aria-busy");
      btn.removeAttribute("aria-disabled");
    };
    return Promise.resolve(promise).then(function (v) { clear(); return v; }, function (err) { clear(); throw err; });
  }

  /* Tabs: <div class="aj-tabs" data-aj-tabs> with role="tablist" buttons and role="tabpanel" panels.
     Arrow keys follow reading direction; the indicator slides to the selected tab. */
  function tabs(root) {
    if (root.ajTabs) return;
    root.ajTabs = true;
    var list = root.querySelector('[role="tablist"]');
    var ts = all(list, '[role="tab"]');
    var ind = doc.createElement("span");
    ind.className = "aj-tabs__indicator";
    ind.setAttribute("aria-hidden", "true");
    list.appendChild(ind);
    var place = function (t) {
      var rtl = isRtl(list);
      var start = rtl ? list.scrollWidth - (t.offsetLeft + t.offsetWidth) : t.offsetLeft;
      ind.style.insetInlineStart = start + "px";
      ind.style.width = t.offsetWidth + "px";
    };
    var select = function (t, focus) {
      ts.forEach(function (x) {
        var on = x === t;
        x.setAttribute("aria-selected", on ? "true" : "false");
        x.tabIndex = on ? 0 : -1;
        var p = doc.getElementById(x.getAttribute("aria-controls"));
        if (p) p.hidden = !on;
      });
      place(t);
      if (focus) t.focus();
    };
    ts.forEach(function (t) {
      t.addEventListener("click", function () { select(t, false); });
      t.addEventListener("keydown", function (e) {
        var i = ts.indexOf(t), fwd = isRtl(list) ? "ArrowLeft" : "ArrowRight", back = isRtl(list) ? "ArrowRight" : "ArrowLeft";
        if (e.key === fwd) { e.preventDefault(); select(ts[(i + 1) % ts.length], true); }
        else if (e.key === back) { e.preventDefault(); select(ts[(i - 1 + ts.length) % ts.length], true); }
        else if (e.key === "Home") { e.preventDefault(); select(ts[0], true); }
        else if (e.key === "End") { e.preventDefault(); select(ts[ts.length - 1], true); }
      });
    });
    var current = ts.filter(function (t) { return t.getAttribute("aria-selected") === "true"; })[0] || ts[0];
    ind.style.transition = "none";
    select(current, false);
    requestAnimationFrame(function () { ind.style.transition = ""; }); /* no slide on first paint */
    window.addEventListener("resize", function () { place(ts.filter(function (t) { return t.tabIndex === 0; })[0]); });
  }

  /* Shelf: horizontal list of covers with previous/next buttons that page by the visible width. */
  function shelf(root) {
    if (root.ajShelf) return;
    root.ajShelf = true;
    var track = root.querySelector(".aj-shelf__track");
    var prev = root.querySelector(".aj-shelf__btn--prev");
    var next = root.querySelector(".aj-shelf__btn--next");
    if (!track) return;
    var sync = function () {
      var max = track.scrollWidth - track.clientWidth - 2;
      var pos = Math.abs(track.scrollLeft); /* RTL scrollLeft runs negative */
      if (prev) prev.disabled = pos <= 2;
      if (next) next.disabled = pos >= max;
    };
    var go = function (dir) {
      var step = track.clientWidth * 0.85 * dir * (isRtl(track) ? -1 : 1);
      track.scrollBy({ left: step, behavior: reduce() ? "auto" : "smooth" });
    };
    if (prev) prev.addEventListener("click", function () { go(-1); });
    if (next) next.addEventListener("click", function () { go(1); });
    track.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    sync();
  }

  /* Same-page view transition: Aljamea.transition(function () { swap content here }). */
  function transition(update) {
    if (!doc.startViewTransition || reduce()) { update(); return Promise.resolve(); }
    return doc.startViewTransition(update).finished;
  }

  /* Entrance: numbers the children of .aj-stagger and plays the rise once per visit. */
  function stagger(root) {
    var seen = false;
    try { seen = sessionStorage.getItem("aj-entered") === "1"; sessionStorage.setItem("aj-entered", "1"); } catch (e) { /* storage blocked: play it */ }
    if (seen) doc.documentElement.classList.add("aj-entered");
    all(root, ".aj-stagger").forEach(function (g) {
      Array.prototype.forEach.call(g.children, function (c, i) { c.style.setProperty("--i", i); });
    });
  }

  /* Masthead: marks the sticky bar .is-stuck once the top tier has scrolled out of view, which
     reveals the small logo. Uses an IntersectionObserver, so nothing runs while scrolling.
     A page that opens already scrolled (reload, back) gets the stuck state without animating. */
  function masthead(bar) {
    if (bar.ajMasthead) return;
    bar.ajMasthead = true;
    var top = bar.previousElementSibling;
    if (!top || !top.classList.contains("aj-masthead-top")) { bar.classList.add("is-stuck"); return; }
    if (!("IntersectionObserver" in window)) { bar.classList.add("is-stuck"); return; }
    var first = true;
    new IntersectionObserver(function (entries) {
      var stuck = !entries[0].isIntersecting;
      if (first) {
        first = false;
        if (stuck) {
          bar.classList.add("no-anim", "is-stuck");
          requestAnimationFrame(function () { requestAnimationFrame(function () { bar.classList.remove("no-anim"); }); });
          return;
        }
      }
      bar.classList.toggle("is-stuck", stuck);
    }, { threshold: 0 }).observe(top);
  }

  /* Language toggle: <div class="aj-lang" data-aj-lang> with two links (English, العربية) and a
     <span class="aj-lang__thumb">. The current one has aria-current="true".
     Pages (Koha): the links go to the other language's URL (?language=ar). The thumb slides, then the page
     navigates; the next page is revealed with a wipe in its reading direction. For that, load bundle.js in the
     <head> without defer, so it can tag the page transition.
     In-page (a single-page app, or this card's demo): pass onChange(lang) and it runs inside a view transition. */
  var LANG_KEY = "aj-lang-switch";
  window.addEventListener("pageswap", function (e) {
    var t = null;
    try { t = sessionStorage.getItem(LANG_KEY); } catch (err) { /* storage blocked */ }
    if (t && e.viewTransition && e.viewTransition.types) e.viewTransition.types.add(t);
  });
  window.addEventListener("pagereveal", function (e) {
    var t = null;
    try { t = sessionStorage.getItem(LANG_KEY); sessionStorage.removeItem(LANG_KEY); } catch (err) { /* storage blocked */ }
    if (t && e.viewTransition && e.viewTransition.types) e.viewTransition.types.add(t);
  });
  function lang(root, opts) {
    if (root.ajLang) return;
    root.ajLang = true;
    opts = opts || {};
    var links = all(root, "a");
    links.forEach(function (a) {
      a.addEventListener("click", function (e) {
        if (a.getAttribute("aria-current") === "true") { e.preventDefault(); return; }
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        var code = a.getAttribute("hreflang") || a.getAttribute("lang") || "en";
        var type = /^(ar|fa|ur|he)/.test(code) ? "aj-to-rtl" : "aj-to-ltr";
        links.forEach(function (x) { x.setAttribute("aria-current", x === a ? "true" : "false"); });
        var wait = reduce() ? 0 : 260; /* let the thumb arrive first */
        setTimeout(function () {
          if (opts.onChange) {
            var update = function () { opts.onChange(code); };
            if (doc.startViewTransition && !reduce()) {
              try { doc.startViewTransition({ update: update, types: [type] }); }
              catch (err) { doc.startViewTransition(update); }
            } else update();
          } else {
            try { sessionStorage.setItem(LANG_KEY, type); } catch (err) { /* storage blocked */ }
            location.href = a.href;
          }
        }, wait);
      });
    });
  }

  /* Drawer: <button data-aj-drawer aria-controls="id"> opens <dialog class="aj-drawer" id="id"> as a modal.
     The dialog keeps focus inside and closes on Escape (both native); [data-aj-close] buttons and a click on
     the dimmed page close it too, and focus returns to the trigger. */
  function drawer(trigger) {
    var d = doc.getElementById(trigger.getAttribute("aria-controls"));
    if (!d || trigger.ajDrawer || !d.showModal) return;
    trigger.ajDrawer = true;
    trigger.setAttribute("aria-expanded", "false");
    trigger.addEventListener("click", function () { d.showModal(); trigger.setAttribute("aria-expanded", "true"); });
    if (!d.ajDrawer) {
      d.ajDrawer = true;
      d.addEventListener("click", function (e) {
        if (e.target === d) d.close();
        if (e.target.closest && e.target.closest("[data-aj-close]")) d.close();
      });
      d.addEventListener("close", function () {
        all(doc, '[aria-controls="' + d.id + '"]').forEach(function (t) { t.setAttribute("aria-expanded", "false"); });
        trigger.focus();
      });
    }
  }

  /* Toggle chips: .aj-chip-toggle buttons flip aria-pressed and fire "aj:toggle" with data-value. */
  function chip(btn) {
    if (btn.ajChip) return;
    btn.ajChip = true;
    if (!btn.hasAttribute("aria-pressed")) btn.setAttribute("aria-pressed", "false");
    btn.addEventListener("click", function () {
      var on = btn.getAttribute("aria-pressed") !== "true";
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.dispatchEvent(new CustomEvent("aj:toggle", { bubbles: true, detail: { value: btn.getAttribute("data-value"), pressed: on } }));
    });
  }

  function init(root) {
    root = root || doc;
    all(root, "[data-aj-menu]").forEach(menu);
    all(root, "[data-aj-tabs]").forEach(tabs);
    all(root, "[data-aj-shelf]").forEach(shelf);
    all(root, ".aj-masthead").forEach(masthead);
    all(root, "[data-aj-lang]").forEach(function (el) { lang(el); });
    all(root, "[data-aj-drawer]").forEach(drawer);
    all(root, ".aj-chip-toggle").forEach(chip);
    stagger(root);
  }

  window.Aljamea = { init: init, menu: menu, toast: toast, loader: loader, progress: progress, masthead: masthead, lang: lang, drawer: drawer, chip: chip, busy: busy, tabs: tabs, shelf: shelf, transition: transition, stagger: stagger };
})();
