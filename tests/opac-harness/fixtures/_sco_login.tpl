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
<div class="sco_entry">
<form id="mainform" action="/cgi-bin/koha/sco/sco-main.pl" name="mainform" method="post">
  <fieldset><div class="row"><div class="col-md-6"><div class="row">
    <div class="col-md-12"><label for="patronid">Please enter your card number:</label></div>
    <div class="col-md-12"><input type="text" id="patronid" class="form-control focus" size="20" name="patronid" autocomplete="off"></div>
    <div class="col-md-12"><button type="submit" class="btn btn-primary">Submit</button></div>
  </div></div></div>
  <input type="hidden" name="op" value="cud-login"></fieldset>
</form></div>
</div></div></div></main></div>
<script>__OPACJS__</script>
<script>__SCOJS__</script>
</body></html>