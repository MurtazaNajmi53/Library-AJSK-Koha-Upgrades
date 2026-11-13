#!/usr/bin/env python3
"""Stand-in for the Koha OPAC, so the real files can be exercised in a browser.

Serves the same URLs OPACUserJS asks for, with latency that roughly matches a
Zebra-backed Koha over a slow link: the search and the full reading history are
the slow ones, which is the whole point of the exercise.
"""
import http.server, socketserver, time, sys, os, threading, urllib.parse

ROOT = os.path.dirname(os.path.abspath(__file__))
VARIANT = sys.argv[2] if len(sys.argv) > 2 else "v3"
# When true, the stand-in Zebra refuses the "not notforloan=3" term,
# so the fallback path in OPACUserJS can be exercised.
BROKEN_CCL = len(sys.argv) > 3 and sys.argv[3] == "brokenccl"
# A patron with nothing on loan: Koha renders the tab label but no table.
EMPTY_ACCOUNT = len(sys.argv) > 3 and sys.argv[3] == "empty"
# v8: give Part G a report number, so the New arrivals list comes from the
# stand-in public report (fixtures/new-arrivals.json) instead of Zebra.
REPORT = len(sys.argv) > 3 and sys.argv[3] == "report"

# Server-side latency, seconds. Tuned to the shape Murtaza described:
# widgets taking 5-6 seconds on the current build.
LAT = {
    "/cgi-bin/koha/opac-user.pl": 0.45,
    "/cgi-bin/koha/opac-readingrecord.pl": 2.60,   # heaviest: full history
    "/cgi-bin/koha/opac-search.pl": 1.90,          # Zebra sort over all records
}

HITS = []


# The harness originally read "out/" (current builds) and "src/" (v2) folders.
# In this repository those files live under opac/, so look them up there.
REPO = os.path.abspath(os.path.join(ROOT, "..", ".."))
SEARCH = [os.path.join(REPO, d) for d in ("sco/current",)] + [os.path.join(REPO, "opac", d) for d in ("current", "legacy/v8", "legacy/v7", "legacy/v6", "legacy/v5", "legacy/v4", "legacy/v3", "legacy/v2")]


def read(name):
    if name.startswith(("out/", "src/")):
        base = name.split("/", 1)[1]
        name = next((os.path.join(d, base) for d in SEARCH
                     if os.path.exists(os.path.join(d, base))), name)
    with open(os.path.join(ROOT, name), encoding="utf-8") as f:
        return f.read()


def build(tpl):
    html = read("fixtures/" + tpl)
    if VARIANT == "v8.1paste":
        css, js = read("out/OPACUserCSS_V8.1.paste.css"), read("out/OPACUserJS_V8.1.paste.js")
    elif VARIANT == "v8.1":
        css, js = read("out/OPACUserCSS_V8.1.css"), read("out/OPACUserJS_V8.1.js")
    elif VARIANT == "v8paste":
        css, js = read("out/OPACUserCSS_V8.paste.css"), read("out/OPACUserJS_V8.paste.js")
    elif VARIANT == "v8":
        css, js = read("out/OPACUserCSS_V8.css"), read("out/OPACUserJS_V8.js")
    elif VARIANT == "v7paste":
        css, js = read("out/OPACUserCSS_V7.paste.css"), read("out/OPACUserJS_V7.paste.js")
    elif VARIANT == "v7":
        css, js = read("out/OPACUserCSS_V7.css"), read("out/OPACUserJS_V7.js")
    elif VARIANT == "v6paste":
        css, js = read("out/OPACUserCSS_V6.paste.css"), read("out/OPACUserJS_V6.paste.js")
    elif VARIANT == "v6":
        css, js = read("out/OPACUserCSS_V6.css"), read("out/OPACUserJS_V6.js")
    elif VARIANT == "v5paste":
        css, js = read("out/OPACUserCSS_V5.paste.css"), read("out/OPACUserJS_V5.paste.js")
    elif VARIANT == "v5":
        css, js = read("out/OPACUserCSS_V5.css"), read("out/OPACUserJS_V5.js")
    elif VARIANT == "v4paste":
        css, js = read("out/OPACUserCSS_V4.paste.css"), read("out/OPACUserJS_V4.paste.js")
    elif VARIANT == "v4":
        css, js = read("out/OPACUserCSS_V4.css"), read("out/OPACUserJS_V4.js")
    elif VARIANT == "v3paste":
        css, js = read("out/OPACUserCSS_V3.paste.css"), read("out/OPACUserJS_V3.paste.js")
    elif VARIANT == "v3":
        css, js = read("out/OPACUserCSS_V3.css"), read("out/OPACUserJS_V3.js")
    else:
        css, js = read("src/OPACUserCSS_New_V2.1.css"), read("src/FINAL_OPACUserJS_v1.2.js")
    if REPORT:
        js = __import__("re").sub(r"newArrivalsReportId: \w+", "newArrivalsReportId: 99", js)
    html = html.replace("__CSS__", css).replace("__JS__", js)
    if "__SCOCSS__" in html:
        html = (html.replace("__OPACCSS__", css)
                    .replace("__SCOCSS__", read("out/SCOUserCSS_V1.paste.css" if "paste" in VARIANT else "out/SCOUserCSS_V1.css"))
                    .replace("__OPACJS__", js)
                    .replace("__SCOJS__", read("out/SCOUserJS_V1.paste.js" if "paste" in VARIANT else "out/SCOUserJS_V1.js")))
    return html


def inline_js(html):
    """Koha's opac-bottom.inc injects OPACUserJS into every OPAC page —
    including opac-user.pl, opac-search.pl and opac-readingrecord.pl.
    Reproducing that here is the whole point: v3's isLoginPage() matched
    its own source text inside that inlined copy."""
    if "__INLINE_JS__" not in html:
        return html
    if VARIANT == "v8.1paste":
        js = read("out/OPACUserJS_V8.1.paste.js")
    elif VARIANT == "v8.1":
        js = read("out/OPACUserJS_V8.1.js")
    elif VARIANT == "v8paste":
        js = read("out/OPACUserJS_V8.paste.js")
    elif VARIANT == "v8":
        js = read("out/OPACUserJS_V8.js")
    elif VARIANT == "v7paste":
        js = read("out/OPACUserJS_V7.paste.js")
    elif VARIANT == "v7":
        js = read("out/OPACUserJS_V7.js")
    elif VARIANT == "v6paste":
        js = read("out/OPACUserJS_V6.paste.js")
    elif VARIANT == "v6":
        js = read("out/OPACUserJS_V6.js")
    elif VARIANT == "v5paste":
        js = read("out/OPACUserJS_V5.paste.js")
    elif VARIANT == "v5":
        js = read("out/OPACUserJS_V5.js")
    elif VARIANT == "v3paste":
        js = read("out/OPACUserJS_V3.paste.js")
    elif VARIANT == "v4paste":
        js = read("out/OPACUserJS_V4.paste.js")
    elif VARIANT == "v4":
        js = read("out/OPACUserJS_V4.js")
    elif VARIANT == "v3":
        js = read("out/OPACUserJS_V3.js")
    else:
        js = read("src/FINAL_OPACUserJS_v1.2.js")
    return html.replace("__INLINE_JS__", "<script>" + js + "</script>")


ROUTES = {
    "/": "_home.tpl",
    "/home": "_home.tpl",
    "/login": "_login.tpl",
    "/sco/login": "_sco_login.tpl",
    "/sco/main": "_sco_main.tpl",
}


class H(http.server.BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def do_GET(self):
        path = urllib.parse.urlparse(self.path).path
        HITS.append((time.time(), path))

        query = urllib.parse.urlparse(self.path).query
        for prefix, delay in LAT.items():
            if path.startswith(prefix):
                time.sleep(delay)
                name = prefix.rstrip(".pl").split("/")[-1]
                fn = {"opac-user": "opac-user.html",
                      "opac-readingrecord": "opac-readingrecord.html",
                      "opac-search": "opac-search.html"}[name]
                if name == "opac-search":
                    wants_nfl = "notforloan%3D3" in query or "notforloan=3" in query
                    if wants_nfl and BROKEN_CCL:
                        # Stand in for a Zebra that does not understand the term:
                        # Koha renders a results page with nothing in it.
                        return self.send("<html><body id='results'><div class='searchresults'>"
                                         "<table id='searchresults'></table></div></body></html>")
                    if wants_nfl:
                        fn = "opac-search-nfl3.html"
                if name == "opac-user" and EMPTY_ACCOUNT:
                    fn = "opac-user-empty.html"
                return self.send(inline_js(read("fixtures/" + fn)))

        if path == "/cgi-bin/koha/svc/report":
            time.sleep(0.25)   # a public report, cached by Koha for 5 minutes
            return self.send(read("fixtures/new-arrivals.json"), "application/json")

        if path in ROUTES:
            return self.send(build(ROUTES[path]))
        if path == "/login-page-raw":
            return self.send(inline_js(read("fixtures/opac-login.html")))
        if path == "/__hits":
            import json
            t0 = HITS[0][0] if HITS else 0
            return self.send(json.dumps([[round(t - t0, 3), p] for t, p in HITS]),
                             "application/json")
        if path == "/__reset":
            HITS.clear()
            return self.send("ok", "text/plain")
        self.send_response(404)
        self.end_headers()

    def send(self, body, ctype="text/html; charset=utf-8"):
        data = body.encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)


class TS(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


if __name__ == "__main__":
    port = int(sys.argv[1])
    TS(("127.0.0.1", port), H).serve_forever()
