/* Preview unpublished OPAC CSS/JS on the live catalogue, without touching
   Koha's settings. See the README ("Previewing on the live OPAC").

   1. Serve the repository on 127.0.0.1:8765 with CORS and
      Access-Control-Allow-Private-Network headers.
   2. On any OPAC page, in the browser console:
        eval(await (await fetch("http://127.0.0.1:8765/tests/opac-harness/live-swap.js")).text());
        await ajLiveSwap({ partE: true });
   It re-fetches the page, swaps in the masters from opac/current (and,
   with partE, Part E from click-and-collect/), and rewrites the document.
   Options: version ("V8"), partE (bool), rtl (bool), probe (bool: times
   the Click & Collect buttons into window.__ccFirst / __ccAll, in ms). */
window.ajLiveSwap = async function (opt) {
  opt = opt || {};
  var B = "http://127.0.0.1:8765/";
  var v = opt.version || "V8";
  var get = function (u) { return fetch(u, { cache: "no-store" }).then(function (r) { return r.text(); }); };
  var parts = await Promise.all([
    get(location.href),
    get(B + "opac/current/OPACUserCSS_" + v + ".css"),
    get(B + "opac/current/OPACUserJS_" + v + ".js"),
    get(B + "click-and-collect/02-opac-userjs-click-and-collect-buttons-and-dialog.js")
  ]);
  var doc = new DOMParser().parseFromString(parts[0], "text/html");
  var style = Array.from(doc.querySelectorAll("style")).find(function (s) { return /generated from OPACUserCSS_V/.test(s.textContent); });
  if (!style) { throw new Error("OPACUserCSS <style> not found"); }
  style.textContent = parts[1];
  var script = Array.from(doc.querySelectorAll("script")).find(function (s) { return /PART E/.test(s.textContent); });
  if (!script) { throw new Error("OPACUserJS <script> not found"); }
  var t = script.textContent;
  script.textContent = parts[2] + "\n" + (opt.partE ? parts[3] : t.slice(t.indexOf("/* ==== PART E")));
  if (opt.rtl) { doc.documentElement.setAttribute("dir", "rtl"); doc.documentElement.setAttribute("lang", "ar"); }
  if (opt.probe) {
    var p = doc.createElement("script");
    p.textContent = "window.__t0=performance.now();window.__ccFirst=0;window.__ccAll=0;" +
      "new MutationObserver(function(){var s=document.querySelectorAll('.ajCCSlot');if(!s.length)return;" +
      "var f=Array.from(s).filter(function(x){return x.children.length}).length;" +
      "if(f&&!__ccFirst)__ccFirst=Math.round(performance.now()-__t0);" +
      "if(f===s.length&&!__ccAll)__ccAll=Math.round(performance.now()-__t0);})" +
      ".observe(document.documentElement,{subtree:true,childList:true});";
    doc.head.prepend(p);
  }
  var html = "<!DOCTYPE html>" + doc.documentElement.outerHTML;
  if (opt.returnHtml) { return html; }
  document.open(); document.write(html); document.close();
  return "swapped";
};
