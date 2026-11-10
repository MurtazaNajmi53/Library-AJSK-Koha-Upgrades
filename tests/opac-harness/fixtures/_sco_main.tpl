<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Self checkout</title>
<style>*,*::before,*::after{box-sizing:border-box}</style>
<style>__OPACCSS__</style>
<style>__SCOCSS__</style>
</head>
<body id="sco_main" class="sco">
<div id="wrapper"><main class="main"><div class="container-fluid"><div class="row"><div class="col">
<div id="masthead"><h1>Maktabat Aljamea (Sindh) Self-checkout system</h1></div>
<div class="alert alert-info">You are logged in as 30454007-Mulla Murtaza Shaikh Mustafa Najmi.</div>
<div id="newcheckout" class="sco_entry">
<form id="scan_form" name="scan_form" method="post" action="/cgi-bin/koha/sco/sco-main.pl">
  <legend><h2><span>Check out or renew an item:</span></h2></legend>
  <div class="row">
    <div class="col"><label for="barcode">Scan a new item or enter its barcode:</label></div>
    <div class="col-3"><input id="barcode" name="barcode" size="20" type="text" class="focus form-control" autocomplete="off"></div>
    <div class="col-auto"><button type="submit" class="btn btn-primary">Submit</button></div>
    <div class="col ml-auto"><button type="button" id="logout_form" class="btn btn-info">Finish</button>
      <input type="hidden" name="patronid" value="30454007"></div>
  </div>
</form></div>
<div id="checkouts"><table class="table">
<caption>Checkouts for 30454007-Mulla Murtaza Shaikh Mustafa Najmi <span class="count">(3 total)</span></caption>
<thead><tr><th>Title</th><th>Due date</th><th></th></tr></thead>
<tbody>
<tr><td data-label="Title">Da'a'im al-Islam</td><td data-label="Due date">25/09/2026</td><td><input type="submit" value="Renew item" class="btn btn-primary btn-sm renew"></td></tr>
<tr><td data-label="Title">Sharh al-Akhbar, vol. 3</td><td data-label="Due date">30/09/2026</td><td><input type="submit" value="Renew item" class="btn btn-primary btn-sm renew"></td></tr>
<tr><td data-label="Title">The Fatimids and their Traditions of Learning</td><td data-label="Due date">02/10/2026</td><td><input type="submit" value="Renew item" class="btn btn-primary btn-sm renew"></td></tr>
</tbody></table></div>
</div></div></div></main></div>
<script>__OPACJS__</script>
<script>__SCOJS__</script>
</body></html>