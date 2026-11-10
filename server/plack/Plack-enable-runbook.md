# Enabling Plack for the Karachi OPAC — step by step

Koha 25.11.02 · Debian/Ubuntu packaged install (`koha-common`) · 21 September 2026

---

## The short version

**The Plack daemon is running. Apache is not sending it any traffic.**

Those are two separate things, and `koha-plack` has two separate commands for
them:

| Command | What it does |
|---|---|
| `koha-plack --start` | Starts the Starman daemon. **This is what the status table shows.** |
| `koha-plack --enable` | Edits the Apache vhost so requests are actually routed to it. |

`--status` reports only on the first. An instance can show "running / 4 workers"
all day while every single request is still handled by CGI — the workers simply
sit idle.

Two independent signals confirm that is what is happening:

- The staff interface reports **CGI mode**. Koha determines that from the
  request that rendered the page, so it is authoritative: that request did not
  arrive via Plack.
- Measured from outside: five identical consecutive requests to the same
  endpoint took 5734, 5810, 5690, 5678, 5724 ms — a spread of 132 ms. A
  persistent application server makes the fifth request far faster than the
  first. There is no warm-up at all, which means a fresh process every time.

---

## Why this happens

The Koha vhost template ships with the Plack includes **commented out**
(`debian/templates/apache-site.conf.in`):

```apache
   Include /etc/koha/apache-shared.conf
#  Include /etc/koha/apache-shared-disable.conf
#  Include /etc/koha/apache-shared-opac-plack.conf
   Include /etc/koha/apache-shared-opac.conf
```

`koha-plack --enable` uncomments those lines. Three things are worth knowing
before you run it:

1. It uncomments with a very literal `sed`, anchored to end of line:
   `s:^\s*#\(\s*Include /etc/koha/apache-shared-opac-plack.conf\)$:\1:`
   A trailing space after `.conf`, a changed path, or a hand-written vhost and
   it matches nothing. It does warn — "Plack not enabled for *instance* OPAC" —
   but only if `--enable` was the command that was run.
2. **It never reloads Apache.** There is no `systemctl` or `apache2ctl` call
   anywhere in that function. A successful `--enable` still leaves CGI serving
   every request until Apache is reloaded.
3. It needs the `headers` and `proxy_http` modules and Apache 2.4.

---

## The steps

### 1. Identify the right instance

The status table lists both `karachi` and `library`, so confirm which one
serves the public catalogue before changing anything:

```bash
grep -l "library-karachi.jameasaifiyah.org" /etc/apache2/sites-enabled/*.conf
```

The filename is the instance name. Use it as `<instance>` below.

### 2. Confirm the diagnosis

```bash
grep -n "plack" /etc/apache2/sites-enabled/<instance>.conf
```

If the two `-plack.conf` lines are commented out, that is the whole problem:

```apache
#  Include /etc/koha/apache-shared-opac-plack.conf
#  Include /etc/koha/apache-shared-intranet-plack.conf
```

### 3. Make sure the required Apache modules are on

```bash
apachectl -M | grep -E "headers|proxy_http"
sudo a2enmod headers proxy_http        # safe to run even if already enabled
```

### 4. Enable Plack in the vhost — the step that was missed

```bash
sudo koha-plack --enable <instance>
```

Expected output: `Plack enabled for <instance> OPAC` **and**
`Plack enabled for <instance> Intranet`.

If it says **"Plack not enabled"**, the `sed` did not match because the vhost
has been customised. Edit the file by hand instead: remove the leading `#` from
those two `Include` lines, keeping the path exactly as above and leaving no
trailing whitespace.

### 5. Restart Plack, then reload Apache

Both. The second is the one that is easy to forget, and without it nothing
changes.

```bash
sudo koha-plack --restart <instance>
sudo systemctl reload apache2
```

### 6. Verify on the server

```bash
grep -n "plack" /etc/apache2/sites-enabled/<instance>.conf

# run twice — the second is the real test
time curl -s -o /dev/null -H "Host: library-karachi.jameasaifiyah.org" \
     http://127.0.0.1/cgi-bin/koha/opac-main.pl
```

Testing over the loopback address takes the network out of the picture.

**Before:** roughly 2.0 s of server time per page.
**After:** a few hundred milliseconds, and the second run noticeably faster
than the first.

### 7. Verify in Koha

Staff interface → **About Koha → Server information**. It should now say Plack
rather than CGI.

---

## If it is still CGI after all that

Check the Plack error log — if the app fails to start, Apache quietly falls
back to CGI and everything looks exactly as it does now:

```bash
tail -50 /var/log/koha/<instance>/plack-error.log
tail -50 /var/log/koha/<instance>/opac-error.log
```

Also confirm the socket exists and Apache can reach it:

```bash
ls -l /var/run/koha/<instance>/plack.sock
```

---

## One thing to know afterwards

Under Plack the code stays loaded in memory between requests. After changing
Perl code, or if a system preference edit does not appear to take effect, run:

```bash
sudo koha-plack --reload <instance>
```

`--reload` lets busy workers finish their current request first, so it is safe
during opening hours. Configuring **memcached** alongside Plack avoids most
stale-preference surprises and is worth doing at the same time.

---

## What success looks like

The quickest external check, which needs no server access:

`https://library-karachi.jameasaifiyah.org/api/v1/public/libraries`

That endpoint currently takes **5.7 seconds**. Once Plack is actually in front
of the site it should return in well under half a second.
