# Click & Collect notices (v2, 29 Oct 2026)

Paste into Tools → Notices & slips. Email versions only. TT variables: `hold` (the hold), `hold.item`, `borrower`, `biblio`.

## HOLDPLACED_PATRON (library AJSK, branded HTML)
Subject: `Click & Collect order received: [% hold.biblio.title %]`

In the existing branded template, replace this block:

```html
This is to inform you that we have received your pickup order for <u>[% hold.biblio.title %]</u>.<br>
<br>
<strong>When it will be ready on the pickup shelf:</strong><br>
&bull; Ordered Monday to Saturday, 8:30 AM to 5:00 PM: ready at 6:30 PM the same day<br>
&bull; Ordered between 5:00 PM and 8:30 AM: ready at 10:30 AM<br>
&bull; Ordered after 5:00 PM on Saturday, or on Sunday: ready on Monday at 10:30 AM<br>
<br>
We will email you again when it is on the shelf. You will then have 3 days to collect it and borrow it at a self-checkout machine. After that, it goes back on the open shelves.
```

with:

```html
This is to inform you that we have received your Click &amp; Collect order for <u>[% hold.biblio.title %]</u>.<br>
<br>
[% IF hold.item.onloan %]All copies are on loan at the moment. We will email you as soon as it is returned and waiting for you.<br>
[% ELSIF hold.reservedate > hold.timestamp.substr(0,10) %]<strong>It will be ready on [% hold.reservedate | $KohaDates %] at 10:30 AM.</strong><br>
[% ELSE %]<strong>When it will be ready:</strong><br>
&bull; Ordered Monday to Saturday, 8:30 AM to 5:00 PM: ready at 6:30 PM the same day<br>
&bull; Ordered between 5:00 PM and 8:30 AM: ready at 10:30 AM<br>
&bull; Ordered after 5:00 PM on Saturday, or on Sunday: ready on Monday at 10:30 AM<br>
[% END %]<br>
Collect it from: <strong>[% IF hold.item.location.match('First Floor Z-') %]the Zawaya attendant's desk[% ELSE %]the Pickup Counter in the main library hall[% END %]</strong>.<br>
[% IF hold.item.notforloan < 0 %]<strong>Please note: this book is for reading in the library only. It cannot be borrowed.</strong><br>
[% END %]<br>
We will email you again when it is ready. You will then have 3 days to collect it. After that, it goes back on the open shelves.
```

## HOLD (library AJSK, branded HTML)
Subject: `Click & Collect order ready: [% hold.biblio.title %]`

Replace:

```html
This is to inform you that your order <u>[% hold.biblio.title %]</u> is now on the pickup shelf.<br>
Call number: [% item.itemcallnumber %]<br>
<br>
<strong>Please collect it by [% hold.expirationdate | $KohaDates %].</strong> Look for the slip with your name on the pickup shelf, then borrow the book at a self-checkout machine.<br>
<br>
If it isn't collected by then, it goes back on the open shelves and someone else may borrow it.
```

with:

```html
This is to inform you that your Click &amp; Collect order <u>[% hold.biblio.title %]</u> is ready.<br>
<br>
Collect it from: <strong>[% IF hold.item.location.match('First Floor Z-') %]the Zawaya attendant's desk[% ELSE %]the Pickup Counter in the main library hall[% END %]</strong><br>
Call number: [% hold.item.itemcallnumber %]<br>
<br>
<strong>Please collect it by [% hold.expirationdate | $KohaDates %].</strong> Look for the slip with your name.
[% IF hold.item.notforloan < 0 %]<br><br><strong>This book is for reading in the library only and cannot be borrowed.</strong> Please read it in the library and hand it back to the attendant when you have finished. The self-checkout machines will not accept it.
[% ELSE %] Then borrow it at a self-checkout machine.
[% END %]<br>
<br>
If it isn't collected by then, it goes back on the open shelves.
```

## HOLD_SLIP (circulation, all libraries, HTML) — v3, 29 Oct 2026
Title: `Click & Collect slip`

Privacy: shows only the ITS number (`borrower.userid`) and the last name. No card number, full name, phone or address.
Last name rule: strip any leading "123 -" prefix from `surname`, take the last word; if that word is "wala"/"walla", keep the word before it too (e.g. BURHANPUR WALA).
Layout: black "COLLECT FROM" banner with the desk (Zawaya attendant's desk for locations containing `First Floor Z-`, else Pickup Counter), then a boxed PATRON CATEGORY (`borrower.category.description`), then LAST NAME and ITS number.
There is no AJSK-specific HOLD_SLIP; the default (all libraries) one is used.

```html
[%- SET cc_name = borrower.surname.remove('^\s*\d+\s*-\s*').trim -%]
[%- SET cc_words = cc_name.split('\s+') -%]
[%- SET cc_last = cc_words.last -%]
[%- IF cc_words.size > 1 && cc_last.match('^(?i)wall?a$') -%][%- SET cc_i = cc_words.size - 2 -%][%- SET cc_last = cc_words.$cc_i _ ' ' _ cc_last -%][%- END -%]
[%- SET cc_zawaya = hold.item.location.match('First Floor Z-') -%]
<div style="font-family:Arial,sans-serif;">
<div style="background:#000;color:#fff;padding:8px 10px;margin:0 0 8px 0;text-align:center;">
<p style="font-size:10pt;margin:0;letter-spacing:1px;">COLLECT FROM</p>
<p style="font-size:24pt;font-weight:bold;margin:0;">[% IF cc_zawaya %]ZAWAYA ATTENDANT'S DESK[% ELSE %]PICKUP COUNTER[% END %]</p>
</div>
<div style="border:3px solid #000;padding:6px 10px;margin:0 0 8px 0;text-align:center;">
<p style="font-size:10pt;margin:0;letter-spacing:1px;">PATRON CATEGORY</p>
<p style="font-size:18pt;font-weight:bold;margin:0;">[% borrower.category.description | upper %]</p>
</div>
<p style="font-size:26pt;font-weight:bold;margin:4px 0 0 0;">[% cc_last | upper %]</p>
<p style="font-size:18pt;font-weight:bold;margin:0 0 6px 0;">ITS: [% borrower.userid %]</p>
[% IF hold.item.notforloan < 0 %]<div style="border:3px solid #000;padding:6px;margin:6px 0;">
<p style="font-size:15pt;font-weight:bold;margin:0;">READ IN LIBRARY ONLY</p>
<p style="font-size:10pt;margin:2px 0 0 0;">This book cannot be borrowed and will not work at the self-checkout machines. Read it in the library and hand it back to the attendant when you have finished.</p>
</div>[% END %]
<hr />
<p style="font-size:12pt;margin:4px 0;"><strong>[% biblio.title %]</strong>[% IF biblio.author %]<br />[% biblio.author %][% END %]</p>
<p style="font-size:11pt;margin:4px 0;">Call no: [% hold.item.itemcallnumber %]<br />Barcode: [% hold.item.barcode %]</p>
<hr />
<p style="font-size:11pt;margin:4px 0;">[% IF hold.reservenotes %][% hold.reservenotes %][% ELSE %]Ordered: [% hold.reservedate | $KohaDates %][% END %]</p>
<p style="font-size:14pt;font-weight:bold;margin:4px 0;">Expires: [% hold.expirationdate | $KohaDates %]</p>
<p style="font-size:9pt;margin:4px 0;">Not collected by this date? Staff: cancel the hold, then check the book in. If another reader has reserved it, Koha will set it aside for them; otherwise return it to its shelf.</p>
</div>
```
