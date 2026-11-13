# Reports for the OPAC

## `new-arrivals.sql` — the New arrivals popup (v1, 13 Nov 2026)

Used by OPACUserJS v8, Part G. The file holds only the query: paste all of
it, as it is.

**Koha's two rules for the text of a report**

- It must start with `SELECT`. A comment above it gives "Missing SELECT".
- It must not contain a write keyword (Create, Insert, Update, Delete,
  Drop and so on) anywhere, comments included. That is why these notes
  live here and not in the `.sql` file.

### Saving it

Reports › New report › New SQL report

| Field | Value |
|---|---|
| Name | OPAC new arrivals (popup) |
| Group | OPAC |
| Public | Yes (the OPAC reads it without a staff login) |
| Cache expiry | 300 (seconds) |

Run it once: 24 titles, newest first, in well under a second. Then put the
report number (the ID column in Saved reports) in
`CFG.newArrivalsReportId`, in `OPACUserJS_V8.js` Part 0, and run
`node build.js`.

Saved as **report 37** (`CFG.newArrivalsReportId: 37`). The OPAC reads it
at `/cgi-bin/koha/svc/report?id=37`. The OPAC's report service ignores
`annotated=1` and sends each row as a plain list, so OPACUserJS Part G
names the columns by position: **keep the column order as it is**, or
change `COLUMNS` in Part G to match.

It holds no patron data: titles, authors, ISBNs and copy counts only. That
is what makes it safe to publish.

**Why a report, not the Zebra search:** the search had to match and fetch
about 47,000 records to sort them, about 8 seconds every time. This reads
the items table directly.

### Columns

| Column | Meaning |
|---|---|
| `added` | Newest date a copy was accessioned (952$d). Falls back to the date the record was created, so titles whose items have no 952$d still sort sensibly. |
| `on_shelf` | Copies a reader could order now: not on loan, loanable (0) or read-in-library (-2), not lost, withdrawn or damaged. |
| `on_loan` | Loanable copies that are checked out. |
| `read_only` | 1 when every orderable copy is read-in-library only (-2). |
| `held` | Holds waiting on the pickup shelf or in transit, so the popup can say "Ordered by another reader" before Part E checks. |
| `desk` | `main` if any shelf copy is outside Zawaya (First Floor Z-…), else `z`. Same rule as Click & Collect Part E. |

Records with any copy at notforloan 3 ("In-Stock") are left out, matching
the OPAC's "any-copy" mode (`CFG.newBooksHideNotForLoan`). If that code
changes, change it in both places.
