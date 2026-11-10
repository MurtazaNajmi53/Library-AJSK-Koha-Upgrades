<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Maktabat Aljamea</title>

<style>
/* Minimal Bootstrap 5 grid, matching what Koha actually loads. Without
   this the fixture's columns have no width rules at all, the main column
   fills the row by default, and a test for "does the main column widen
   when the empty column is hidden" passes no matter what the CSS says.
   That gap let an invalid :has() selector through once already. */
*,*::before,*::after{box-sizing:border-box}
.container-fluid{width:100%;padding-right:.75rem;padding-left:.75rem;margin:0 auto}
.row{display:flex;flex-wrap:wrap;margin-right:-.75rem;margin-left:-.75rem}
.row>*{flex-shrink:0;width:100%;max-width:100%;padding-right:.75rem;padding-left:.75rem}
.col-12{flex:0 0 auto;width:100%}
@media (min-width:992px){
  .col-lg-9{flex:0 0 auto;width:75%}
  .col-lg-3{flex:0 0 auto;width:25%}
}
</style>
<style>__CSS__</style>
</head>
<body id="opac-main">
<div id="wrapper">
<div id="header-region"><nav class="navbar navbar-expand">
  <div id="logo"><a class="navbar-brand" href="/">Koha online</a></div>
  <ul class="navbar-nav" id="members">
    <li class="nav-item dropdown"><a href="#" id="user-menu" class="nav-link dropdown-toggle">
      <span class="userlabel">Welcome, 30454007-Mulla Murtaza Shaikh Mustafa Najmi</span></a>
      <div class="dropdown-menu" id="loggedinuser-menu">
        <a href="/cgi-bin/koha/opac-user.pl">Your summary</a>
        <a href="/cgi-bin/koha/opac-account.pl">Your charges</a>
        <a href="/cgi-bin/koha/opac-logout.pl" id="logout">Log out</a>
      </div></li>
    <li class="nav-item dropdown"><a href="#" id="listsmenu" class="nav-link">Lists</a>
      <div class="dropdown-menu"><a href="/cgi-bin/koha/opac-shelves.pl">Your lists</a></div></li>
  </ul>
  <ul id="cart-list-nav"><li class="nav-item"><a id="cartmenulink" href="#">Cart</a></li></ul>
</nav></div>
<div class="main"><div class="container-fluid"><div class="row">
<div class="col-12 col-lg-9 order-md-1 maincontent">

<div id="news" class="newscontainer">
  <div class="newsitem">
    <h2 class="newsheader"><a id="newsitem1" href="/cgi-bin/koha/opac-main.pl?news_id=1">Library timings</a></h2>
    <div class="newsbody"><table><tr><th>Monday to Friday</th><td>8:00 am &ndash; 8:00 pm</td></tr><tr><th>Saturday</th><td>9:00 am &ndash; 1:00 pm</td></tr></table></div>
    <div class="newsfooter">Published on 01/09/2026 by <span class="newsauthor">Librarian</span></div>
  </div>
  <div class="newsitem">
    <h2 class="newsheader"><a id="newsitem2" href="/cgi-bin/koha/opac-main.pl?news_id=2">Computer lab</a></h2>
    <div class="newsbody"><p>The computer lab on the first floor is open <strong>9:00 am to 6:00 pm</strong> on working days.</p><ul><li>Printing available until 5:30 pm</li><li>Bring your ITS card</li></ul></div>
    <div class="newsfooter">Published on 02/09/2026</div>
  </div>
  <div class="newsitem">
    <h2 class="newsheader"><a id="newsitem3" href="/cgi-bin/koha/opac-main.pl?news_id=3">Milad holiday</a></h2>
    <div class="newsbody"><p>The library will remain closed on 29 September. Returns may be left in the drop box.</p></div>
    <div class="newsfooter">Published on 15/09/2026</div>
  </div>
  <div id="rssnews-container"><a href="#">RSS feed for library news</a></div>
</div>
<!-- Maktabat Aljamea (Sindh) — home page widgets            (v3, 20 Sep 2026)

     Tools › HTML customizations › New entry
       Display location : OpacMainUserBlock
       Library          : All libraries
     Paste this with "Edit with text editor", NOT the visual editor.

     OPACUserJS_V3.js fills all three boxes; OPACUserCSS_V3.css lays them
     out side by side and gives them their shared card design.

     Replaces FINAL_OpacMainUserBlock_V2.html. If an older entry
     (aj-my-library-block.html or FINAL_OpacMainUserBlock_V2.html) is
     still installed, DELETE IT — otherwise the page shows two of each box.

     Reading order, left to right on a wide screen:
       1. New in the library
       2. My library
       3. Library information  (fed by Tools › Additional tools › News)

     The source order below is deliberately different: "My library" comes
     first so that a reader on a phone, and anyone using a screen reader,
     reaches their own account before the browsing lists. The CSS grid
     puts it back in the middle on a wide screen.
-->
<div id="aj-home" class="aj-home">

  <section id="aj-my-library" class="aj-ml" aria-live="polite" aria-label="My library">
    <p class="aj-ml__loading">Loading your account…</p>
  </section>

  <section id="aj-new-books" class="aj-shelf aj-new" aria-live="polite" aria-label="New in the library">
    <p class="aj-shelf__status">Loading new books…</p>
  </section>

  <section id="aj-news" class="aj-news" aria-label="Library information">
    <div class="aj-news__head">
      <h2 class="aj-news__title">Library information</h2>
    </div>
    <p class="aj-news__empty">Loading…</p>
  </section>

  <noscript>
    <!-- With JavaScript off, nothing can fill these boxes. Put Koha's own
         news block back and take the three empty widgets away, so the
         page still tells a reader something useful. -->
    <style>
      #opac-main #news,
      #opac-main #rssnews-container { display: block; }
      #opac-main .aj-home > .aj-ml,
      #opac-main .aj-home > .aj-new,
      #opac-main .aj-home > .aj-news { display: none; }
    </style>
    <p class="aj-ml__message">Turn on JavaScript to see your account and the new books here, or open
      <a href="/cgi-bin/koha/opac-user.pl">Your summary</a>.</p>
  </noscript>
</div>

</div>
<div class="col-12 col-lg-3 order-md-2">
                <!-- login box / user summary would go here; both are off -->
            </div>
</div></div></div>
<span class="loggedinusername" data-borrowernumber="4242">Your account</span>
</div>
<script>__JS__</script>
</body></html>