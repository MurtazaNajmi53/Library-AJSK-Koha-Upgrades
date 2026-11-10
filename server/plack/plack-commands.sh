# =============================================================================
# Enabling Plack for the Karachi Koha OPAC
# Run these in ONE terminal session, in order — $INSTANCE is a shell variable
# and will be lost if you open a new shell or switch user partway through.
# Nothing here deletes anything. Step 3 takes a backup before any edit.
# =============================================================================


# --- 1. Work out which instance serves the public catalogue ------------------
# The status table lists both "karachi" and "library", so confirm before
# changing anything.

INSTANCE=$(grep -l "library-karachi.jameasaifiyah.org" /etc/apache2/sites-enabled/*.conf 2>/dev/null \
           | head -1 | xargs -r basename | sed 's/\.conf$//')
echo "Instance: ${INSTANCE:-** NOT FOUND — set it by hand: INSTANCE=karachi **}"


# --- 2. Diagnose: is Apache actually pointed at Plack? -----------------------
# Expected right now: both plack lines COMMENTED OUT. That is the whole problem.

grep -n "plack" /etc/apache2/sites-enabled/$INSTANCE.conf
sudo koha-plack --status $INSTANCE
apachectl -M 2>/dev/null | grep -E "headers_module|proxy_http_module"

# Baseline timing, for comparison afterwards. Expect roughly 2 seconds.
for i in 1 2 3; do
  curl -s -o /dev/null -w "before: %{time_total}s\n" \
    -H "Host: library-karachi.jameasaifiyah.org" \
    http://127.0.0.1/cgi-bin/koha/opac-main.pl
done


# --- 3. Back up the vhost, and enable the required Apache modules ------------

sudo cp -a /etc/apache2/sites-available/$INSTANCE.conf \
           /root/$INSTANCE.conf.bak-$(date +%F-%H%M)
sudo a2enmod headers proxy_http


# --- 4. Enable Plack in the vhost — THE STEP THAT WAS MISSED ----------------
# "--start" (already done) only starts the daemon.
# "--enable" is what edits Apache so requests actually reach it.
#
# Expected output: "Plack enabled for <instance> OPAC"
#              and "Plack enabled for <instance> Intranet"
# If it says "Plack NOT enabled", skip to step 7.

sudo koha-plack --enable $INSTANCE


# --- 5. Restart Plack, then reload Apache -----------------------------------
# Both are needed. koha-plack --enable does NOT reload Apache itself, so
# without the second line nothing changes.

sudo koha-plack --restart $INSTANCE
sudo systemctl reload apache2


# --- 6. Verify ---------------------------------------------------------------
# The two plack lines should now be UNCOMMENTED.
# Timing should drop from ~2s to a few hundred ms.

grep -n "plack" /etc/apache2/sites-enabled/$INSTANCE.conf
for i in 1 2 3; do
  curl -s -o /dev/null -w "after:  %{time_total}s\n" \
    -H "Host: library-karachi.jameasaifiyah.org" \
    http://127.0.0.1/cgi-bin/koha/opac-main.pl
done

# Then check in the browser:
#   Staff interface -> About Koha -> Server information
#   should now say Plack, not CGI.


# --- 7. ONLY IF step 4 said "Plack NOT enabled" ------------------------------
# The vhost has been customised, so koha-plack's pattern did not match.
# Uncomment the two Include lines by hand. The backup from step 3 is in /root.

sudo sed -i -E 's|^[[:space:]]*#[[:space:]]*(Include /etc/koha/apache-shared-(opac|intranet)-plack\.conf)[[:space:]]*$|   \1|' \
  /etc/apache2/sites-available/$INSTANCE.conf

# Check the result, then re-run step 5.
grep -n "plack" /etc/apache2/sites-available/$INSTANCE.conf
sudo apache2ctl configtest


# --- 8. ONLY IF it is still CGI afterwards -----------------------------------
# If the Plack app fails to start, Apache quietly falls back to CGI and
# everything looks exactly as it did before.

sudo tail -40 /var/log/koha/$INSTANCE/plack-error.log
sudo tail -40 /var/log/koha/$INSTANCE/opac-error.log
ls -l /var/run/koha/$INSTANCE/


# --- Afterwards --------------------------------------------------------------
# Under Plack the code stays in memory between requests. After changing Perl
# code, or if a system preference edit does not seem to take effect:
#
#   sudo koha-plack --reload $INSTANCE
#
# --reload lets busy workers finish their current request first, so it is safe
# to run during opening hours.
