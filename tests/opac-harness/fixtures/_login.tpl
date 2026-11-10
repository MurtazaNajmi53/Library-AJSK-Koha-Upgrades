<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Maktabat Aljamea</title>

<style>*,*::before,*::after{box-sizing:border-box}</style>
<style>__CSS__</style>
</head>
<body id="opac-login-page">
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
<div class="col-lg-6">
<div id="opac-auth">
  <h1>Log in to your account</h1>
  <form id="auth" method="post" action="/cgi-bin/koha/opac-user.pl">
    <div class="local-login">
      <fieldset class="brief">
        <div class="form-group"><label for="userid">Card number:</label>
          <input type="text" id="userid" name="userid" class="form-control"></div>
        <div class="form-group"><label for="password">Password:</label>
          <input type="password" id="password" name="password" class="form-control"></div>
        <div class="show-password-toggle"><input type="checkbox" class="show-password-toggle-checkbox" id="show"><label for="show" class="show-password-toggle-label">Show password</label></div>
      </fieldset>
      <fieldset class="action"><input type="submit" value="Log in" class="btn btn-primary"></fieldset>
    </div>
    <div id="nologininstructions"><!-- Maktabat Aljamea (Sindh) — login page help panel        (v1, 20 Sep 2026)

     Tools › HTML customizations › New entry
       Display location : OpacLoginInstructions
       Library          : All libraries
       Publication date : today   (leave the expiration date empty)
     Paste this with "Edit with text editor", NOT the visual editor —
     the visual editor rewrites the classes and the table.

     This REPLACES Koha's built-in text, which reads:
       "Don't have a password yet? ... stop by the circulation desk ..."
       "Don't have a library card? ... stop by your local library ..."
     Neither is true here: readers are enrolled centrally and log in with
     an ITS number. Because Koha swaps this in at the template level, the
     old wording is never sent to the browser at all — there is no flash
     of it before a script can change it, and it still reads correctly
     with JavaScript turned off.

     Styled by section 9b of OPACUserCSS_V3.css.

     ON THE EMAIL LINK
     The href opens a pre-addressed Gmail compose window, which is right
     for readers signed in to their @jameasaifiyah.edu account. If you
     would rather it opened whatever mail app the device uses — better on
     a phone, or for anyone not signed in to Gmail — replace the whole
     href with:  mailto:library_support.karachi@jameasaifiyah.edu
-->
<h2>Trouble signing in?</h2>

<p>Use your <strong>ITS number</strong> and your library password. If they are not
working, or you have not been given a password yet, the library will sort it out
for you.</p>

<div class="aj-help">
  <div class="aj-help__item">
    <h3>Email the library</h3>
    <p>Send us your name and ITS number and we will set up or reset your access.</p>
    <p>
      <a class="aj-help__mail"
         href="https://mail.google.com/mail/?view=cm&amp;fs=1&amp;to=library_support.karachi%40jameasaifiyah.edu"
         target="_blank" rel="noopener">library_support.karachi@jameasaifiyah.edu</a>
    </p>
  </div>

  <div class="aj-help__item">
    <h3>Or come to the Front Office</h3>
    <p>The Front Office of the library can help you in person during working hours.</p>
    <table class="aj-help__hours">
      <tr><th scope="row">Monday to Friday</th><td>9:00 am – 5:00 pm</td></tr>
      <tr><th scope="row">Saturday</th><td>9:00 am – 1:00 pm</td></tr>
    </table>
  </div>
</div>
</div>
    <div id="forgotpassword"><p><a href="#">Forgot your password?</a></p></div>
  </form>
</div></div>
</div></div></div>
<span class="loggedinusername" data-borrowernumber="4242">Your account</span>
</div>
<script>__JS__</script>
</body></html>