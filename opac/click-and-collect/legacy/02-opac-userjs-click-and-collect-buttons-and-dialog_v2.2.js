
/* ==== PART E: CLICK & COLLECT (v2.2, 2026-10-29) ====
   Replaces v1 "PICKUP ORDERS". To roll back: delete from this line to "END PART E".
   - Dynamic Click & Collect / Reserve buttons (search results, record page, lists, cart)
   - Own order dialog: patron picks a delivery date only; copy is chosen automatically
   - Orders are placed through Koha's normal hold form in a hidden frame
   - Desk is decided by shelf: "First Floor Z-..." -> Zawaya attendant's desk, else Pickup Counter
   - v2.2: button styling fixed; copies already ordered/waiting for another reader
     are detected (page status + a live check of Koha's hold form on click) and
     offered as "Reserve" instead of Click & Collect
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
    frameTimeoutMs: 60000
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
    opts.push({ key: "asap", start: today.iso, label: T.asap, ready: dayWord(a.add, a.day) + " " + T.at + " " + (a.slot === "pm" ? T.pm630 : T.am1030) + " · " + dateText(a.day) });
    for (var i = a.add + 1; i <= CFG.daysAhead; i++) {
      var d = dayFrom(n, i);
      if (d.wd === 0) continue;
      opts.push({ key: d.iso, start: d.iso, label: (i === 1 ? T.tomorrow.charAt(0).toUpperCase() + T.tomorrow.slice(1) + " · " : "") + dateText(d), ready: T.am1030 });
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
  function liveCheck(bibs) {
    var url = "/cgi-bin/koha/opac-reserve.pl?" + (bibs.length === 1 ? "biblionumber=" + bibs[0] : "biblionumbers=" + bibs.join("/") + "/") + "&manual=1";
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

  /* ---------- dialog ---------- */
  /* Bootstrap leaves its dark backdrop behind if a dialog is removed while open.
     Always dispose the old one and clear any leftover overlay. */
  function clearBackdrop() {
    if ($(".modal.show").length) return;
    $(".modal-backdrop").remove();
    $("body").removeClass("modal-open").css({ overflow: "", paddingRight: "" });
  }
  function modal(title, bodyHtml, footHtml) {
    var old = $("#ajCCModal");
    if (old.length) {
      var oi = old.data("inst");
      old.removeClass("show").hide();
      if (oi && oi.dispose) { try { oi.dispose(); } catch (e) {} }
      old.remove();
    }
    $(".modal-backdrop").remove();
    $("body").removeClass("modal-open").css({ overflow: "", paddingRight: "" });
    var m = $('<div class="modal fade" id="ajCCModal" tabindex="-1" aria-labelledby="ajCCTitle" aria-hidden="true"' + (AR ? ' dir="rtl"' : "") + '>' +
      '<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable"><div class="modal-content">' +
      '<div class="modal-header"><h2 class="modal-title fs-5" id="ajCCTitle">' + esc(title) + '</h2>' +
      '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="' + esc(T.close) + '"></button></div>' +
      '<div class="modal-body">' + bodyHtml + '</div><div class="modal-footer">' + footHtml + '</div></div></div></div>');
    $("body").append(m);
    var inst = window.bootstrap && window.bootstrap.Modal ? new window.bootstrap.Modal(m[0]) : null;
    if (inst) inst.show(); else m.addClass("show").css("display", "block");
    m.data("inst", inst);
    m.on("hidden.bs.modal", function () {
      var i = m.data("inst");
      if (i && i.dispose) { try { i.dispose(); } catch (e) {} }
      m.remove();
      clearBackdrop();
    });
    m.on("click", "[data-bs-dismiss='modal']", function () { if (!inst) { m.remove(); clearBackdrop(); } });
    return m;
  }
  function closeModal() { var m = $("#ajCCModal"), i = m.data("inst"); if (i) i.hide(); else m.remove(); }

  function deskName(d) { return d === "z" ? T.deskZ : T.deskMain; }

  /* lines: [{bib,title,a(avail)}]; mode "collect" | "reserve" | "cart" */
  function openOrderDialog(lines, mode) {
    var anyCollect = lines.some(function (l) { return l.a.state === "shelf"; });
    var opts = dateOptions(Date.now());
    var body = "";
    var allHeld = lines.length && lines.every(function (l) { return l.a.held; });
    if (mode === "reserve") body += '<p>' + esc(allHeld ? T.resHeld : T.resText) + '</p>';
    body += '<ul class="list-unstyled mb-3" id="ajCCLines">';
    lines.forEach(function (l, i) {
      var st = l.a.state, dis = (st !== "shelf" && st !== "onloan"), chk = (st === "shelf" || mode === "reserve");
      body += '<li class="mb-2 d-flex gap-2 align-items-start">';
      if (mode === "cart") body += '<input type="checkbox" class="form-check-input mt-1 ajCCLine" data-i="' + i + '"' + (chk && !dis ? " checked" : "") + (dis ? " disabled" : "") + ' aria-label="' + esc(l.title) + '">';
      body += '<div><strong>' + esc(l.title) + '</strong>';
      if (st === "shelf") body += '<div class="small">' + esc(T.collectFrom) + ': ' + esc(deskName(l.a.desk)) + '</div>' + (l.a.readOnly ? '<div class="small text-danger fw-bold">' + esc(T.readOnly) + '</div>' : "");
      else if (st === "onloan") body += '<div class="small text-muted">' + esc(mode === "cart" ? (l.a.held ? T.reserveHeld : T.reserveIt) : (l.a.held ? T.onHold : T.onLoan)) + '</div>';
      else body += '<div class="small text-muted">' + esc(T.notOrderable) + '</div>';
      body += '</div></li>';
    });
    body += '</ul>';
    if (anyCollect && mode !== "reserve") {
      body += '<fieldset><legend class="fs-6 fw-bold">' + esc(T.when) + '</legend>';
      opts.forEach(function (o, i) {
        body += '<div class="form-check"><input class="form-check-input" type="radio" name="ajCCDate" id="ajCCd' + i + '" value="' + i + '"' + (i === 0 ? " checked" : "") + '>' +
          '<label class="form-check-label" for="ajCCd' + i + '">' + esc(o.label) + ' <span class="text-muted">(' + esc(T.readyAt) + ' ' + esc(o.ready) + ')</span></label></div>';
      });
      body += '</fieldset>';
    }
    body += '<div id="ajCCMsg" class="mt-3" role="status" aria-live="polite"></div>';
    var foot = '<button type="button" class="btn btn-link" data-bs-dismiss="modal">' + esc(T.cancel) + '</button>' +
      '<button type="button" class="btn btn-primary" id="ajCCGo">' + esc(mode === "reserve" ? T.confirmRes : T.confirm) + '</button>';
    var m = modal(mode === "reserve" ? (allHeld ? T.resTitleHeld : T.resTitle) : T.dlgTitle, body, foot);
    m.find("#ajCCGo").on("click", function () {
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
                 ready: l.a.state === "shelf" ? (opt.label + " · " + opt.ready) : null };
      });
      $(this).prop("disabled", true).html('<span class="spinner-border spinner-border-sm" aria-hidden="true"></span> ' + esc(T.working));
      placeOrders(plan).then(function (res) { showResult(res); }, function (err) {
        m.find("#ajCCMsg").html('<div class="alert alert-warning">' + esc(err || T.slow) + '</div>');
        m.find("#ajCCGo").prop("disabled", false).text(mode === "reserve" ? T.confirmRes : T.confirm);
      });
    });
  }

  function showResult(res) {
    var html = "";
    if (res.ok.length) {
      html += '<ul class="list-unstyled">';
      res.ok.forEach(function (p) {
        html += '<li class="mb-3"><strong>' + esc(p.title) + '</strong><br>';
        if (p.kind === "collect") {
          html += '<span class="fs-5">' + esc(T.readyAt.charAt(0).toUpperCase() + T.readyAt.slice(1)) + ': ' + esc(p.ready) + '</span><br>' +
            '<span>' + esc(T.collectFrom) + ': ' + esc(deskName(p.desk)) + '</span>' +
            (p.readOnly ? '<br><span class="text-danger fw-bold">' + esc(T.readOnly) + '</span>' : "");
        } else html += esc(p.held ? T.doneResHeld : T.doneRes);
        html += '</li>';
      });
      html += '</ul>';
      if (res.ok.some(function (p) { return p.kind === "collect"; })) html += '<p>' + esc(T.doneCollect) + '</p>';
    }
    if (res.failed.length) {
      html += '<p class="mb-1 fw-bold">' + esc(T.failed) + '</p><ul>' + res.failed.map(function (f) {
        return '<li>' + esc(f.title ? f.title + ": " : "") + esc(f.reason) + '</li>'; }).join("") + '</ul>';
    }
    modal(T.doneTitle, html, '<button type="button" class="btn btn-primary" data-bs-dismiss="modal">OK</button>');
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
    availability(bib, slot).then(function (a) { slot.data("a", a); slot.html(btnHtml(a.state, bib, a)); });
  }
  function refreshButtons(force) {
    if (force) availCache = {};
    myOrders(force).then(function (mine) {
      var slots = $(".ajCCSlot").toArray();
      (function next() {
        var batch = slots.splice(0, 4);
        if (!batch.length) return;
        batch.forEach(function (x) { fillSlot($(x), mine); });
        $.when.apply($, batch.map(function (x) { return itemLists(String($(x).data("bib"))); })).always(next);
      })();
    });
  }

  /* click: check live which copies are free, then open the right dialog */
  function openFor(bib, slot, title, btn) {
    var old = btn ? btn.html() : null;
    if (btn) btn.prop("disabled", true).html('<span class="spinner-border spinner-border-sm" aria-hidden="true"></span><span>' + esc(T.checking) + '</span>');
    resolveLines([{ bib: bib, title: title, slot: slot }]).then(function (lines) {
      var a = lines[0].a;
      if (slot && slot.length) { slot.data("a", a); slot.html(btnHtml(a.state, bib, a)); }
      else if (btn) btn.prop("disabled", false).html(old);
      if (a.state === "shelf" || a.state === "onloan") openOrderDialog(lines, a.state === "shelf" ? "collect" : "reserve");
    });
  }
  $(document).on("click", "button.ajCC", function () {
    var b = $(this), slot = b.closest(".ajCCSlot"), bib = String(b.data("bib"));
    openFor(bib, slot, slot.data("title") || document.title, b);
  });

  function titleNear(el) {
    var t = $(el).closest(".bibliocol, .record, tr, .searchresults li").find("a.title, .title").first().text();
    return $.trim(t) || $.trim($("h1.title, h2.title").first().text()) || "";
  }

  var path = location.pathname, params = new URLSearchParams(location.search);

  $(function () {
    /* Search results, lists, other pages: replace Koha's hold links with a dynamic slot */
    $('a[href*="opac-reserve.pl?biblionumber="]').each(function () {
      var a = $(this), href = a.attr("href");
      if (/manual=1/.test(href)) return;
      var m = /biblionumber=(\d+)/.exec(href); if (!m) return;
      var holder = a.closest("li").length && a.closest(".actions-menu, .nav, #action, ul").length ? a.closest("li") : a;
      var slot = slotFor(m[1], path.indexOf("opac-detail.pl") >= 0 ? $.trim($("h1.title").first().text()) : titleNear(a));
      holder.replaceWith(holder.is("li") ? $("<li>").append(slot) : slot);
    });
    if ($(".ajCCSlot").length) refreshButtons(false);

    /* Several titles at once (cart, or ticked search results) */
    function multiOrder(ids, btn) {
      btn.prop("disabled", true);
      myOrders(true).then(function (mine) {
        var lines = ids.map(function (bib) {
          var t = $.trim($("#bib" + bib).closest("tr, li, .detailrecord, .record, .bibliocol").find("a.title, .title, h3").first().text()) || ("#" + bib);
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

  window.ajCC = { asap: asap, dateOptions: dateOptions, classifyItem: classifyItem, decide: decide, CFG: CFG };
})();
} catch (err) { if (window.console) console.warn("OPACUserJS part E (Click & Collect):", err); }
/* ==== END PART E: CLICK & COLLECT ==== */
