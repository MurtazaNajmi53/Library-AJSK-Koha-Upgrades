/* ==========================================================================
   Maktabat Aljamea (Sindh) — SCOUserJS for Koha 25.11          (v1, 20 Sep 2026)
   Self-checkout kiosks: 21-inch screens, mounted portrait, touch input.

   Paste this whole file into:
   Administration › System preferences › SCOUserJS

   Goes with SCOUserCSS_V1.css.

   WHAT IT DOES
   ------------
   1. Takes the ITS number out of everything the kiosk prints on screen.
   2. Makes sure the number is masked as it is typed, even on a browser
      too old for the CSS rule that normally does it.
   3. Keeps the cursor in the barcode box, so the next scan lands
      somewhere useful without anyone having to tap first.
   4. Marks the page ready, which is what lets SCOUserCSS reveal the
      greeting it has been hiding.

   ORDER MATTERS
   -------------
   Koha runs OPACUserJS before this file on the self-checkout screen.
   OPACUserJS_V3 detects the kiosk and stops immediately, so by the time
   this runs nothing else has touched the page.
   ========================================================================== */

try { (function () {
  "use strict";

  var body = document.body;
  if (!body || body.id !== "sco_main") { return; }

  function safely(fn) {
    try { fn(); }
    catch (err) { if (window.console) console.warn("SCOUserJS:", err); }
  }

  /* ---------------------------------------------------------------------
     1. Names, with the ITS number taken out

     Patron names here are stored as, for example,
        "30454007-Mulla Murtaza Shaikh Mustafa Najmi"
     Koha prints that whole string in "You are logged in as ..." and in
     the "Checkouts for ..." caption. A reader's ITS number is the only
     thing needed to borrow against their name, so it does not belong on
     a screen in a public part of the library.

     Both places are hidden by SCOUserCSS until this has run, so the
     number is never painted — not even for a single frame.
     --------------------------------------------------------------------- */
  var HONORIFICS = [
    "mulla", "shaikh", "sheikh", "shk", "syedi", "sayedi",
    "janab", "dr", "bhai", "bhaisaheb", "mr", "mrs", "ms", "miss"
  ];

  /* Keeps the name, drops the number. Honorifics are kept here — unlike
     the OPAC's account menu, where only a first name is wanted — because
     a reader glancing at a kiosk should recognise themselves at once. */
  function withoutNumber(fullName) {
    var name = fullName
      .replace(/\b\d{5,}\b\s*[-–—]?\s*/g, " ")   // ITS numbers
      .replace(/\s+/g, " ")
      .trim();
    return name;
  }

  /* If a name were nothing but a number, fall back to something neutral
     rather than printing an empty greeting. */
  function firstNameOnly(fullName) {
    var words = withoutNumber(fullName).split(" ");
    for (var i = 0; i < words.length; i++) {
      var word = words[i].replace(/[.,]+/g, "");
      if (word && HONORIFICS.indexOf(word.toLowerCase()) === -1) { return word; }
    }
    return "";
  }

  /* Rewrites one element's text, leaving everything but the name alone. */
  function stripNumbers(el) {
    if (!el) { return; }
    var before = el.textContent;
    var after = withoutNumber(before);
    if (after !== before.replace(/\s+/g, " ").trim()) {
      el.textContent = after;
    }
  }

  safely(function () {
    // "You are logged in as <name>."
    var greeting = document.querySelector("#masthead ~ .alert-info") ||
                   document.querySelector(".alert-info");
    if (greeting && /logged in as/i.test(greeting.textContent)) {
      var match = greeting.textContent.match(/logged in as\s+(.*?)\.?\s*$/i);
      var name = match ? withoutNumber(match[1]) : "";
      var first = match ? firstNameOnly(match[1]) : "";
      greeting.textContent = name
        ? "You are logged in as " + name + "."
        : "You are logged in.";
      window.ajSco = { name: name, firstName: first };
    } else if (greeting) {
      stripNumbers(greeting);
    }

    // "Checkouts for <name> (n total)"
    document.querySelectorAll("table caption").forEach(stripNumbers);

    // Anywhere else a bare ITS number might have been printed
    document.querySelectorAll(".sco_entry .patroninfo, #scomainuserblock .patroninfo")
      .forEach(stripNumbers);
  });

  /* ---------------------------------------------------------------------
     2. Masking the number as it is scanned

     The card reader is a keyboard: tapping a card types the ITS number
     into the login box one character at a time, in full view, before the
     form submits. SCOUserCSS masks it with -webkit-text-security, which
     hides the characters without turning the box into a password field —
     a password field would make the browser offer to remember it, which
     is the last thing a shared kiosk needs.

     This is only the fallback, for a browser too old to support that
     property. It should almost never fire.
     --------------------------------------------------------------------- */
  safely(function () {
    var input = document.getElementById("patronid");
    if (!input) { return; }

    input.setAttribute("autocomplete", "off");
    input.setAttribute("autocorrect", "off");
    input.setAttribute("autocapitalize", "off");
    input.setAttribute("spellcheck", "false");
    input.setAttribute("inputmode", "numeric");
    input.setAttribute("aria-label", "ITS number");

    var label = document.querySelector('label[for="patronid"]');
    if (label && /card number/i.test(label.textContent)) {
      label.textContent = "Tap your card, or enter your ITS number:";
    }

    var masked = window.CSS && CSS.supports &&
                 (CSS.supports("-webkit-text-security", "disc") ||
                  CSS.supports("text-security", "disc"));
    if (!masked) {
      input.type = "password";
      if (input.form) { input.form.setAttribute("autocomplete", "off"); }
    }
  });

  /* ---------------------------------------------------------------------
     3. Keeping the cursor in the barcode box

     A hardware scanner types wherever the cursor happens to be. Koha
     already focuses the box on load; on a touchscreen a stray tap on the
     background takes that focus away, and the next scan then goes
     nowhere. This puts it back.

     preventScroll keeps the page from jumping, and focus is only
     restored after a tap on something that is not itself a control — so
     tapping Finish still works.
     --------------------------------------------------------------------- */
  safely(function () {
    var barcode = document.getElementById("barcode");
    if (!barcode) { return; }

    function refocus() {
      if (document.activeElement === barcode) { return; }
      try { barcode.focus({ preventScroll: true }); }
      catch (e) { barcode.focus(); }
    }

    document.addEventListener("pointerup", function (event) {
      var target = event.target;
      if (target.closest("a, button, input, select, textarea, label, [role='button']")) { return; }
      // Let the tap finish before moving focus
      setTimeout(refocus, 0);
    });

    // Coming back from the browser's back/forward cache
    window.addEventListener("pageshow", function () { setTimeout(refocus, 0); });

    refocus();
  });

  /* ---------------------------------------------------------------------
     4. Tell the stylesheet it is safe to show the greeting
     --------------------------------------------------------------------- */
  body.classList.add("aj-sco-ready");

})(); } catch (err) { if (window.console) console.warn("SCOUserJS:", err); }
