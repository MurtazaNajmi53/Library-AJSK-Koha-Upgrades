# Koha settings before pickup-orders changes (29 Oct 2026)

Circulation rules were changed so Holds total and Holds daily equal Checkouts allowed (Library and All/All rows left as they were).

## System preferences
- CurbsidePickup: 1 (enabled) — now set to 0
- OPACUserJS: 37,897 chars, ends with "part D" block. New code is appended as a separately marked block ("PICKUP ORDERS") — delete that block to roll back.

## Circulation rules, library AJSK
Category | Item type | Checkouts allowed | Holds total | Holds daily | Holds per record
--- | --- | --- | --- | --- | ---
Asateza Kiram | Book | 10 | 3 | 3 | 1
Asateza Kiram | Book->Allowed for 8-11 | 10 | 3 | 3 | 1
Collegiate I (5-7) | Book | 10 | 1 | 1 | 1
Collegiate I (5-7) | Book->Allowed for 8-11 | 0 | Unlimited | Unlimited | Unlimited
Collegiate I (5-7) | Book->Manshuraat Issuable | 10 | 1 | 1 | 1
Collegiate II & Higher Studies | Book | 10 | 2 | 2 | 1
Collegiate II & Higher Studies | Book->Allowed for 8-11 | 10 | 2 | 2 | 1
Collegiate II & Higher Studies | Book->Manshuraat Issuable | 10 | 2 | 2 | 1
Culture Générale (Std 1-2) | Book | 5 | 1 | 1 | 1
Culture Générale (Std 1-2) | Book->Allowed for 8-11 | 0 | Unlimited | Unlimited | Unlimited
Culture Générale (Std 1-2) | Book->Manshuraat Issuable | 5 | 1 | 1 | 1
Culture Générale (Std 3-4) | Book | 5 | 1 | 1 | 1
Culture Générale (Std 3-4) | Book->Allowed for 8-11 | 0 | Unlimited | Unlimited | Unlimited
Culture Générale (Std 3-4) | Book->Manshuraat Issuable | 5 | 1 | 1 | 1
Library | Book | 100 | 0 | 0 | 0
Patron | Book | 5 | 2 | 2 | 1
Patron | Book->Allowed for 8-11 | 0 | Unlimited | Unlimited | Unlimited
Teacher | Book | 5 | 2 | 2 | 1
All | All | Unlimited | Unlimited | Unlimited | Unlimited


## Notices before changes (default library; only the email versions were changed)

### HOLDPLACED_PATRON (reserves) — email
Subject: Your hold on [% hold.biblio.title %] is confirmed

Hello [% borrower.firstname %] [% borrower.surname %] ([% borrower.cardnumber %]),
Your hold on [% hold.biblio.title %] ([% hold.biblio.id %]) has been confirmed.
You will be notified by the library when your item is available for pickup.
Thank you!

### HOLD (reserves) — email
Subject: Hold available for pickup at <<branches.branchname>>

Dear [% borrower.firstname %] [% borrower.surname %],

You have a hold available for pickup as of [% hold.waitingdate | $KohaDates %]:

Title: [% biblio.title %]
Author: [% biblio.author %]
Copy: [% item.copynumber %]
Location: [% branch.branchname %]
[% branch.branchaddress1 %]
[% branch.branchaddress2 %]
[% branch.branchaddress3 %]
[% branch.branchcity %] [% branch.branchzip %]

(HOLD print version left unchanged.)

### HOLD_SLIP (circulation) — email [HTML]
Subject: Hold slip

<h5>Date: [% today | $KohaDates %]</h5> <br> <h3> Transfer to/Hold in [% branch.branchname %]</h3> <br> <h3>[% borrower.surname %], [% borrower.firstname %]</h3> <br> <ul> <li>[% borrower.cardnumber %]</li> <li>[% borrower.phone %]</li> <li> [% borrower.address %]<br> [% borrower.address2 %]<br> [% borrower.city %] [% borrower.zipcode %] </li> <li>[% borrower.email %]</li> </ul> <br> <h3>ITEM ON HOLD</h3> <h4>[% biblio.title %]</h4> <h5>[% biblio.author %]</h5> <ul> <li>[% item.barcode %]</li> <li>[% item.itemcallnumber %]</li> <li>[% reserve.waitingdate | $KohaDates %]</li> </ul> <p>Notes: <pre>[% reserve.reservenotes %]</pre> </p>
