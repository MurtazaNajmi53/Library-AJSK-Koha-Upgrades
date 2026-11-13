# Click & Collect in Koha: project log

Koha 25.11.02 · library AJSK (Aljamea-tus-Saifiyah Library Karachi) · staff `library-karachi-admin.jameasaifiyah.org` · OPAC `library-karachi.jameasaifiyah.org` (behind Cloudflare)

Click & Collect orders are ordinary Koha **item-level holds**. Custom JavaScript on the OPAC replaces Koha's hold screen with a short dialog. Nothing in Koha's code is modified, so upgrades are safe.


## Files in this folder (`opac/click-and-collect/`)

From OPAC release v8.1 this folder lives inside `opac/`, and every file in it that is installed in Koha carries the OPAC release number (now `_V8.2`). The OPAC part, "Part E", is no longer a file of its own: it is the last part of `opac/current/OPACUserJS_V8.2.js`, so OPACUserJS is one paste.

| File | What it is |
| --- | --- |
| `00-project-log-status-rollback-and-migration.md` | This log: status, design, every change with old values, rollback, migration |
| `01-backup-of-koha-settings-before-changes-2026-10-29.md` | Settings, circulation rules and notice text as they were before any change |
| `../current/OPACUserJS_V8.2.js`, Part E | The Click & Collect buttons, dialog and ordering on the OPAC (was `02-opac-userjs-click-and-collect-buttons-and-dialog.js`, v2.4; that file is now in `legacy/`) |
| `03-staff-userjs-print-pull-list-pdf-button_V8.2.js` | The IntranetUserJS block that adds "Print pull list (PDF)" to report 34 (unchanged) |
| `04-report-34-orders-to-pull_V8.2.sql` | SQL of report 34 "Click & Collect: orders to pull" (unchanged) |
| `05-email-notices-and-shelf-slip-templates_V8.2.md` | Text of the order-received email, ready email and shelf slip (unchanged) |

Rollback item lists live inside Koha as reports 35 and 36 (see §5).

---

## 1. Status (end of 29 Oct, 4 pm): everything LIVE and tested

| # | Change | Status |
| --- | --- | --- |
| 1 | Per-category "Total holds allowed" = loan limit | LIVE, verified |
| 2 | Not-for-loan code **-2 "Collect & read in library"** | LIVE, verified |
| 3 | Prefs `TrapHoldsOnOrder` = 1, `HoldsLog` = 1 | LIVE, verified |
| 4 | Report 34 "Click & Collect: orders to pull" (cache 1 s) | LIVE, verified |
| 5 | Item recode: **17,879 items at -2**, 3,642 at 1 (17 + 4 background jobs, all finished) | LIVE, verified by count |
| 6 | **12 item types unblocked** (REF, ZAW, MH, MQ, MGZE, MP, AR, CHRT, MI, MJ, PSTR, QASAID) | LIVE, verified |
| 7 | Catch-all circulation rule (All/All, AJSK): OPAC item-level holds N → **F** (Force) | LIVE, verified |
| 8 | Notices v2 (branded confirmation, branded ready) + **slip v3** (ITS + last name only, desk banner, category box) | LIVE, verified (slip rendered for hold 8, 29 Oct evening) |
| 9 | OPACUserJS Part E **v2.2** (36,570 chars, sha1 `6b8d0fc0fd4d`): backdrop fix (v2.1); button styling + copies ordered by another reader shown as "Reserve" (v2.2) | LIVE, verified on record + search pages (29 Oct, 7 pm); backdrop fix still needs one real order |
| 10 | IntranetUserJS "Print pull list (PDF)" | LIVE, verified |
| 11 | Circulation panel: title "Click & Collect", single "Orders to pull" button | LIVE, verified |
| 12 | Rollback reports 35 and 36 | LIVE |
| 13 | OPACUserJS Part E **v2.3** (13 Nov 2026, goes with OPAC v7): buttons show as soon as each title's copies are known, 8 titles at a time, without waiting for the reader's orders; titles already ordered switch to "Ordered" when the orders arrive, and a click checks them first. Measured on a 20-title results page: first button 0.7 s (v2.2: 2.8 s), all by 2.7 s (v2.2: 5.6 s) | READY, not yet pasted. Tested in a live preview, no order placed. v2.2 is kept in `legacy/` |
| 14 | Part E **v2.4** (with OPAC v8): `window.ajCC.fill(root, force)` for the New arrivals popup | READY, not yet pasted. Kept in `legacy/` |
| 15 | **OPAC v8.1:** Part E moves into `OPACUserJS_V8.1.js` (no code change beyond v2.4). OPACUserJS is pasted as one file | LIVE (seen on the OPAC, 13 Nov 2026) |
| 16 | **OPAC v8.2:** a new order dialog in Part E. It is a native `<dialog>` on the design system: it opens at once with a skeleton while the copies are checked, then shows date cards, Confirm and Cancel pills, and a done screen with "Done". It is a bottom sheet on phones and sits above the cart and the New arrivals popup instead of closing them. `ajCC.where(bib)` gives the popup the real shelf. The ordering itself (`placeOrders`, `resolveLines`, the hidden frame, the holds-list check) is unchanged | READY, not yet pasted. Previewed on the live OPAC; the done screen was drawn with test data and no order was placed. Staff should place one real order after pasting |

**End-to-end test (29 Oct, 3:50 pm, Murtaza's account, Zawaya read-only book, record 365):** dialog → Confirm → "Order received · Ready today at 6:30 PM · Zawaya attendant's desk · Read in the library only" in 11 s; hold created on the right copy with today's date and the note "Ordered: Thu, 29 Oct 2026, 3:50 pm (Click & Collect)"; confirmation email generated with desk and read-only text; order on the pull list under "Zawaya desk". Test holds 9 and 10 cancelled afterwards.

**Not yet tested by staff:** check-in of an order (slip printing with dates), self-checkout refusing a -2 book, an on-loan "Reserve", a future date, and the cart.

---

## 2. How it works (v2 design)

**Patron (OPAC)**
- Every hold link (search results, record page, lists) becomes a dynamic button, decided per title from the public API:
  - **Click & Collect**: a copy is on the shelf and orderable.
  - **Reserve** (+ "On loan"): every orderable copy is checked out. The hold is caught at check-in when it's returned.
  - **Ordered ✓**: the patron already has a hold on it.
  - No button: nothing orderable (lost, withdrawn, damaged, Rarities, Store, Back Office, other not-for-loan codes).
- The dialog asks only **when** they want it: "As soon as possible" (with the computed ready time), or a later date up to 7 days ahead (ready 10:30 AM that day). Sundays are never offered. The copy is chosen automatically (main hall preferred over Zawaya, loanable preferred over read-only).
- It shows the desk and, for -2 items, "Read in the library only."
- The order is placed through Koha's own hold form inside a hidden frame. After submitting, the script **confirms against the patron's real holds list** (with retries) before reporting anything, because the connection sometimes drops the response page even when Koha has saved the order.
- The hold note is set to "Ordered: Thu 29 Oct 2026, 1:15 pm (Click & Collect)", which the slip prints.
- Cart: one **Click & Collect all** button with per-title checkboxes (on-loan titles offered as reservations, unticked).
- Search results and lists: Koha's toolbar "Place hold" is replaced by **Click & Collect selected** (same multi-title dialog). No "Place hold" label remains anywhere on the OPAC.
- Old links to `opac-reserve.pl?biblionumber=N` redirect to the record page and open the dialog. `&manual=1` keeps Koha's own screen (testing/staff).

**Desks** (decided by shelf, no extra Koha libraries)
- Shelving location starting "First Floor Z-" → **Zawaya attendant's desk**
- Everything else → **Pickup Counter, main library hall**

**Ready-time rule**
- ASAP: Mon–Sat 8:30 AM–5 PM → 6:30 PM same day; 5 PM–8:30 AM → 10:30 AM next morning; Sat after 5 PM and all Sunday → Monday 10:30 AM.
- Chosen later date → 10:30 AM that day. (Koha hold start date = that date, so it appears on the pull list that morning.)

**Staff**
1. Circulation home → **Orders to pull** (report 34): due orders only, grouped by desk, sorted by shelf and call number. Books on loan are excluded (Koha catches them at check-in).
2. **Print pull list (PDF)** button on the report: name, title, shelf, call no., barcode, tick box. Uses the browser's print dialog ("Save as PDF"), which handles Arabic correctly.
3. Check each book in and confirm the hold. Koha prints the slip and emails the patron.
4. Read-only (-2) books: the patron reads in the library and hands the book back. **Staff cancel the hold** at that point, otherwise it blocks the book for 3 days.
5. Daily: Holds awaiting pickup → expired tab → reshelve. The nightly cron cancels expired holds.

**Not-for-loan items**
- Koha refuses holds on any item with a not-for-loan value above 0 (hard-coded in `C4::Reserves::IsAvailableForItemLevelRequest`). Negative values are holdable but still can't be checked out. So "deliver but don't lend" = code **-2**.
- `TrapHoldsOnOrder` = 1 is required, or check-in ignores holds on negative-code items.
- Koha **also** blocks holds when the item's **type** is marked not-for-loan. Reference, Zawaya, Manshuraat, Maqalah, Magazine, Maps and 6 smaller types were, so the item recode alone left almost nothing orderable. Those 12 types were unblocked (decision of 29 Oct). Archives (DHARC), Rarities (RAR) and Store Room (STR) stay blocked.
- Before unblocking, every item of those 12 types still coded 0 was given a code, so none became borrowable: 2,396 → -2, 100 (Manshuraat copies in excluded areas) → 1.
- Recoded in total: 17,879 items at -2. Batch 1: all Zawaya items with code 0 or 1 (7,316, incl. 1,292 that were loanable) and all other code-1 items except Rarities, Store, Back Office, Front Office, Damaged (8,167). Batch 2: the 2,396 type-blocked items above.
- Not orderable, code 1: 3,642 (Rarities 3,200, Store 284, Back Office 40, Front Office 9, Damaged 9, plus the 100 Manshuraat copies).
- The catch-all rule (All/All) had item-level holds off; it is now **Force**, so these types accept item-level holds. Its 0-day loan / unlimited checkouts were left as they were (see §8 risk).

**Holds for books on loan**
Patron clicks **Reserve**. When the book is returned (desk or SIP), check-in traps the hold, prints the slip and sends the "ready" email. Nobody else can borrow it in between (self-checkout and SIP refuse items on hold for someone else: `AllowItemsOnHoldCheckoutSCO/SIP` = 0).

---

## 3. Root causes found on 29 Oct

- **Popup never appeared:** `OPACMandatoryHoldDates` = "start". Koha's Confirm handler refused the auto-submit (empty start date), so the order never went through. v2 fills the date from the patron's choice.
- **"Maximum number of holds" for a Teacher with 2 holds:** a second cap, *Checkout, hold policy by patron category → Total holds allowed*, was still 1–3. Fixed (§4).
- **Blank dates on the slip:** the slip used `reserve.*`; Koha names the hold `hold` in notices. Fixed in v2 slip.
- **Read-only books had no button:** their item types were blocked as not-for-loan (see §2). Fixed by unblocking 12 types.
- **Order placed but dialog said it failed:** the response page after submitting hit a dropped connection. The script now verifies against the holds list. (Found during the end-to-end test; the order itself had been saved correctly.)
- **Screen went dark after choosing a date (29 Oct evening):** the date dialog was removed while still open, so Bootstrap's grey backdrop stayed on the page and blocked clicks. The script now closes and disposes the old dialog, removes any stray backdrop and resets the page scroll lock. Fixed in Part E v2.1.
- **Button looked broken (29 Oct, 6 pm):** the theme's OPACUserCSS rules for `#action a/button` (copper icons, navy text) also hit the Click & Collect button: icon copper on copper (invisible but taking space), navy text, odd hover. v2.2 adds its own scoped CSS (`#ajCCStyle`, class `ajCCBtn`): solid copper, white text and icon, hover = darker copper. Reserve button = white with copper outline, fills on hover. `fa-clock-o` replaced by `fa-clock` (FA6 has no `-o` name).
- **Button offered on books already ordered by someone else:** the public items API says nothing about holds. v2.2 reads the page (record page: "Item holds" count / "On hold" status per copy; search results: "On hold (n)") and, on click, checks Koha's own hold form (`opac-reserve.pl`, read only) to see which copies are free. If none is free the patron gets **Reserve** ("Ordered by another reader") and joins the queue. If the chosen copy was taken seconds earlier, another free copy at the same desk is used; otherwise the patron is told to reload and reserve.
- **How a waiting hold shows:** OPAC record page status "On hold", OPAC results "Not available … On hold (1)", staff record page "Waiting at … since [date]", staff results "(On hold)". An ordered-but-not-yet-pulled copy still shows "Available" (Koha only says "On hold" once it is waiting).
- **Patron cancels a waiting hold → it is NOT cancelled:** Koha files a "cancellation request" and hides it from the patron's account; the book stays on the hold shelf. Staff must clear **Circulation → Holds awaiting pickup → Holds with cancellation requests** daily.
- **`ExpireReservesAutoFill` = Do:** when the nightly job expires an uncollected order and someone has reserved the book, Koha hands it straight to the next reader and emails them, but the slip on the shelf still shows the first reader. Staff should reprint the slip (check the book in again) for those. Slip footer updated to say "cancel, then check in".
- **Slip exposed card number and full name:** replaced with ITS number + last name only (slip v3).
- **Report slow:** the query itself runs in 0.5–1.1 s. The delay is the connection: the site uses **HTTP/3 (QUIC) through Cloudflare**; the same 350 KB stylesheet took 12.4 s, 3.4 s, 2.2 s on some loads and 60 ms on others, and Chrome hit `ERR_QUIC_PROTOCOL_ERROR`. **Fix (needs whoever manages Cloudflare):** Cloudflare dashboard → Speed → Optimization → Protocol Optimization → turn **HTTP/3 (with QUIC)** off. Browsers fall back to HTTP/2 over TCP. Alternatively ask campus IT whether UDP 443 is throttled.

---

## 4. Every change, with previous values

| Where | Before | After |
| --- | --- | --- |
| Pref CurbsidePickup | 1 | 0 |
| Pref TrapHoldsOnOrder | 0 | 1 |
| Pref HoldsLog | 0 | 1 |
| Pref OPACMandatoryHoldDates | start | start (unchanged; v2 fills it) |
| Circ rules AJSK, item-type rows | holds total/daily 1–3 or Unlimited | = checkouts allowed (Library & All/All untouched) |
| Circ rules AJSK, per-category totals (holds) | Patron 2, CG 1-2 1, CG 3-4 1, Collegiate I 1, Collegiate II 2, Teacher 2, Asateza Kiram 3 | Patron 5, CG 1-2 5, CG 3-4 5, Collegiate I 10, Collegiate II 10, Teacher 5, Asateza Kiram 10 |
| Authorised value NOT_LOAN | -1, 0, 1, 2, 3, 4 | + **-2** "Collect & read in library" |
| Items | see §2 | 17,879 items → -2; 100 items 0 → 1 |
| Item types REF, ZAW, MH, MQ, MGZE, MP, AR, CHRT, MI, MJ, PSTR, QASAID | "Not for loan" ticked | unticked |
| Circ rule AJSK All/All, OPAC item level holds | N (Don't allow) | F (Force) |
| OPACUserJS | Parts A–D (37,897 chars) + v1 Part E | Parts A–D unchanged + Part E v2 |
| OPACUserJS (OPAC v8.2, when pasted) | `../legacy/v8.1/OPACUserJS_V8.1.paste.js` | `../current/OPACUserJS_V8.2.paste.js` (Part E dialog redesign) |
| OPACUserCSS (OPAC v8.2, when pasted) | `../legacy/v8.1/OPACUserCSS_V8.1.paste.css` | `../current/OPACUserCSS_V8.2.paste.css` |
| Pref OPACStarRatings (optional, v8.2) | record the current value here before changing | no |
| OPACUserJS Part E (with OPAC v7, when pasted) | v2.2, `legacy/02-opac-userjs-click-and-collect-buttons-and-dialog_v2.2.js` | Part E of `../current/OPACUserJS_V8.1.js` (v2.4 code) |
| IntranetUserJS | empty | Click & Collect staff block |
| IntranetCirculationHomeHTML | empty | "Click & Collect" panel: Orders to pull, Check in, Holds awaiting pickup |
| Report 34 | (new 29 Oct) | v2 SQL in `04-report-34-orders-to-pull-sql.sql`, cache 1 s |
| Report 35 | — | rollback list: 1,292 Zawaya items that were loanable (0) |
| Report 36 | — | rollback list: 2,496 type-blocked items that were 0 |
| Notice HOLDPLACED_PATRON (AJSK, branded HTML) | 48 hours / 3:10–8pm sentence | v2 body (desk, future date, read-only, on-loan) |
| Notice HOLD (AJSK) | — (created 29 Oct) | v2 body |
| Slip HOLD_SLIP (default) | Koha default (printed phone/address/email) | v3 (29 Oct evening): black COLLECT FROM desk banner, boxed PATRON CATEGORY, LAST NAME (…wala pairs kept), ITS number from login ID, READ IN LIBRARY ONLY box, title, call no., barcode, ordered time, expiry. Card number and full name removed. (v2 printed full surname + card no.) |

Old notice text is in `01-backup-of-koha-settings-before-changes-2026-10-29.md`.

---

## 5. Rolling back

Do these in this order.
1. **OPAC:** in OPACUserJS delete from `/* ==== PART E` to `END PART E ... */`. Koha's normal hold screen returns. (To go back only from v2.3 to v2.2, replace that block with `legacy/02-opac-userjs-click-and-collect-buttons-and-dialog_v2.2.js`.)
2. **Staff JS:** in IntranetUserJS delete the `CLICK & COLLECT: STAFF` block.
3. **Item types first:** Administration → Item types → tick "Not for loan" again on REF, ZAW, MH, MQ, MGZE, MP, AR, CHRT, MI, MJ, PSTR, QASAID. (Do this before step 4, or the items set back to 0 become borrowable.)
4. **Items:** run **report 36** → batch-modify those 2,496 to Not for loan = 0. Run **report 35** → batch-modify those 1,292 to 0. Then every remaining -2 item (`SELECT itemnumber FROM items WHERE notforloan = -2`) → 1. -2 did not exist before 29 Oct, so this is exact.
5. **Catch-all rule:** Circulation rules → AJSK → All/All → OPAC item level holds back to "Don't allow".
6. **Prefs:** TrapHoldsOnOrder → 0, HoldsLog → 0 (optional), CurbsidePickup → 1 only if you want the old curbside module back.
7. **Limits:** restore per-category and item-type hold limits from §4.
8. **Notices:** paste old text from the backup file.
9. Delete the -2 authorised value only after step 4.

## 6. Test checklist for staff

1. Order a shelf book ASAP from search results → check popup, email, pull list (Pickup Counter).
2. Order with a later date → it should appear on the pull list only that morning.
3. Click **Reserve** on an on-loan book → check it in when returned → slip prints, "ready" email sent.
4. Pull list → **Print pull list (PDF)** → check the printout.
5. Check in an ordered book → confirm hold → slip shows the desk banner, patron category, last name and ITS number only (no card number, no full name), "Ordered" time, **Expires** date, and the READ IN LIBRARY ONLY box for -2 books.
5b. Ask a second patron to open a book that's waiting for you: they must see **Reserve · Ordered by another reader**, not Click & Collect.
5c. Check the cancellation-requests tab at the desk every day.
5a. Place an order with a later delivery date → after the "Order received" popup closes, the page must not stay dark and must still respond to clicks.
6. Try a -2 book at self-checkout as the ordering patron → it must refuse. Then cancel the hold at the desk when the patron hands it back.
7. Cart → **Click & Collect all** with a mix of titles.

## 7. Moving this to another Koha

Needs Koha 23.11+ (HOLDPLACED_PATRON) and Bootstrap 5 OPAC (Koha 23.05+).
1. Create NOT_LOAN value -2. Set TrapHoldsOnOrder = 1, HoldsLog = 1, EmailPatronWhenHoldIsPlaced = 1, ReservesMaxPickUpDelay = 3, ExpireReservesMaxPickUpDelay = 1, AllowItemsOnHoldCheckoutSCO/SIP = 0, OPACHoldRequests = 1, opacbookbag = 1, RESTPublicAPI = 1, OPACMandatoryHoldDates = start.
2. Circ rules: OPAC item level holds = Force on every rule including All/All; holds limits = loan limits (both item-type rows and per-category totals); holds pickup period 3.
2a. Item types used for read-only stock must **not** be flagged "Not for loan" at type level; give their items not-for-loan -2 instead (or 1 to keep them unorderable).
3. Create the report from `04-report-34-orders-to-pull-sql.sql`, note its ID, and set `REPORT_ID` in the staff script.
4. Paste notices, OPAC script (adjust `CFG.zawayaRe` and the desk names if shelf codes differ) and staff script.
5. Make sure the cron `cancel_expired_holds.pl` runs daily (default in Debian packages).

## 8. Other findings worth fixing
- **New risk to manage:** the 12 unblocked types no longer stop loans by themselves. A *new* Reference, Zawaya, Manshuraat etc. item catalogued with not-for-loan 0 would be borrowable under the catch-all rule (0-day loan, unlimited checkouts). Catalogue these with **-2** (or 1). A weekly check: `SELECT itemnumber, barcode, itype FROM items WHERE notforloan = 0 AND itype IN ('REF','ZAW','MH','MQ','MGZE','MP','AR','CHRT','MI','MJ','PSTR','QASAID')` should return nothing.
- The catch-all rule itself (0-day loan, unlimited checkouts) is odd: patrons in "Dars Burhani" have no Book rule and fall onto it. Worth reviewing separately.
- About 7,600 items have location **"Ground Floor Reference" followed by a tab character**, and Zawaya items have the same trailing tab. They don't match the shelving list, so the OPAC can't show their proper location name. A batch modification with a regex (strip `\t`) would fix it. The Click & Collect code already tolerates it.
- "First Floor Maqalaat Section" and "Ground Floor Front Office" are in use but missing from the LOC list.

## 9. Arabic (still needs review)
The v2 Arabic strings are live in the OPAC file (`T` block), shown only when the OPAC is in Arabic: button اطلب واستلم, selected-titles اطلب المحدد واستلم. The email Arabic below has **not** been added to Koha and predates the desk/read-only wording.

**Order received (draft)**
نحيطكم علمًا بأننا استلمنا طلبكم لاستلام كتاب [العنوان].
مواعيد التجهيز على رف الطلبات:
- الطلبات من الإثنين إلى السبت بين ٨:٣٠ صباحًا و٥:٠٠ مساءً: جاهزة الساعة ٦:٣٠ مساءً من اليوم نفسه
- الطلبات بين ٥:٠٠ مساءً و٨:٣٠ صباحًا: جاهزة الساعة ١٠:٣٠ صباحًا
- الطلبات بعد ٥:٠٠ مساءً يوم السبت أو يوم الأحد: جاهزة يوم الإثنين الساعة ١٠:٣٠ صباحًا
سنرسل إليكم بريدًا آخر عند وضعه على الرف، ولكم بعدها ٣ أيام لاستلامه، ثم يُعاد إلى الرفوف المفتوحة.

**Ready (draft)**
نحيطكم علمًا بأن طلبكم [العنوان] جاهز الآن.
رقم الاستدعاء: [رقم الاستدعاء]
يرجى استلامه قبل [التاريخ]. ابحثوا عن القسيمة التي تحمل اسمكم.
إن لم يُستلم قبل هذا التاريخ، يُعاد إلى الرفوف المفتوحة.
