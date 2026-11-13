
/* ==== CLICK & COLLECT: STAFF (added 2026-10-29; OPAC release v8.2, unchanged) ====
   Adds "Print pull list (PDF)" to report 34 (Pickup orders to pull).
   To roll back: delete from this line to "END CLICK & COLLECT: STAFF". */
try {
(function () {
  var REPORT_ID = "34";
  var PARAM = "Card number (leave blank for everyone)";
  var $ = window.jQuery;
  if (!$) return;

  function esc(s) { return $("<div>").text(s == null ? "" : String(s)).html(); }

  function printPullList(btn) {
    var old = btn.html();
    btn.prop("disabled", true).text("Preparing…");
    $.ajax({
      url: "/cgi-bin/koha/svc/report",
      data: { id: REPORT_ID, sql_params: "", param_names: PARAM, annotated: 1, _: Date.now() },
      dataType: "json", timeout: 60000
    }).done(function (rows) {
      var w = window.open("", "_blank");
      if (!w) { alert("Please allow pop-ups for this site to print the pull list."); return; }
      var now = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Karachi", weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date());
      var desks = {};
      (rows || []).forEach(function (r) { (desks[r.Desk] = desks[r.Desk] || []).push(r); });
      var html = '<!doctype html><html><head><meta charset="utf-8"><title>Pull list ' + esc(now) + '</title><style>' +
        'body{font-family:Arial,"Noto Naskh Arabic",sans-serif;font-size:11pt;margin:14mm;color:#000}' +
        'h1{font-size:16pt;margin:0 0 2mm}h2{font-size:13pt;margin:7mm 0 2mm;border-bottom:2px solid #000;padding-bottom:1mm}' +
        '.meta{font-size:9pt;margin-bottom:4mm}table{width:100%;border-collapse:collapse}th,td{border:1px solid #999;padding:2mm;text-align:left;vertical-align:top}' +
        'th{background:#eee;font-size:9pt}td.tick{width:8mm}td.bc{font-family:monospace;white-space:nowrap}.ro{font-weight:bold;font-size:8.5pt}' +
        '.empty{font-size:12pt;margin-top:10mm}@media print{.noprint{display:none}h2{break-after:avoid}tr{break-inside:avoid}}' +
        '</style></head><body>' +
        '<p class="noprint"><button onclick="window.print()">Print / Save as PDF</button></p>' +
        '<h1>Click &amp; Collect: pull list</h1><div class="meta">Printed ' + esc(now) + ' · ' + (rows || []).length + ' book(s). Pull each book, then check it in and confirm the hold.</div>';
      var names = Object.keys(desks).sort();
      if (!names.length) html += '<p class="empty">No orders to pull right now.</p>';
      names.forEach(function (d) {
        html += '<h2>' + esc(d) + ' (' + desks[d].length + ')</h2><table><thead><tr><th></th><th>Shelf</th><th>Call no.</th><th>Barcode</th><th>Title</th><th>Patron</th><th>Ready by</th></tr></thead><tbody>';
        desks[d].forEach(function (r) {
          html += '<tr><td class="tick">☐</td><td>' + esc(r.Shelf) + '</td><td>' + esc(r["Call number"]) + '</td><td class="bc">' + esc(r.Barcode) + '</td>' +
            '<td dir="auto">' + esc(r.Title) + (r.Note === "Read in library only" ? '<div class="ro">READ IN LIBRARY ONLY</div>' : "") + '</td>' +
            '<td dir="auto">' + esc(r.Patron) + '<br><small>' + esc(r.Card) + '</small></td><td>' + esc(r["Ready by"]) + '</td></tr>';
        });
        html += '</tbody></table>';
      });
      html += '<script>window.onload=function(){setTimeout(function(){window.print()},300)}<\/script></body></html>';
      w.document.open(); w.document.write(html); w.document.close();
    }).fail(function (x) {
      alert("Couldn't load the pull list (" + (x.status || "network") + "). Please try again.");
    }).always(function () { btn.prop("disabled", false).html(old); });
  }

  $(function () {
    var p = new URLSearchParams(location.search);
    var onReport = /reports\/guided_reports\.pl$/.test(location.pathname) && p.get("id") === REPORT_ID && /run/.test(p.get("op") || p.get("phase") || "");
    if (!onReport) return;
    var btn = $('<button type="button" class="btn btn-primary" id="ajPullListPdf"><i class="fa fa-print" aria-hidden="true"></i> Print pull list (PDF)</button>');
    btn.on("click", function () { printPullList(btn); });
    var bar = $("#toolbar").first();
    if (bar.length) bar.append($('<div class="btn-group ms-2"></div>').append(btn));
    else $("main, #doc3, .main").first().prepend($('<p></p>').append(btn));
  });
})();
} catch (err) { if (window.console) console.warn("IntranetUserJS Click & Collect:", err); }
/* ==== END CLICK & COLLECT: STAFF ==== */
