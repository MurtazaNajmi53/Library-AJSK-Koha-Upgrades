SELECT
  b.biblionumber                                              AS biblionumber,
  b.title                                                     AS title,
  COALESCE(b.author, '')                                      AS author,
  COALESCE(SUBSTRING_INDEX(bi.isbn, ' | ', 1), '')            AS isbn,
  DATE(COALESCE(MAX(i.dateaccessioned), b.datecreated))       AS added,
  SUM(i.onloan IS NULL AND i.notforloan IN (0, -2)
      AND i.itemlost = 0 AND i.withdrawn = 0 AND i.damaged = 0
      AND COALESCE(i.location, '') NOT REGEXP 'Rarities|Store|Back Office|Damaged')
                                                              AS on_shelf,
  SUM(i.onloan IS NOT NULL AND i.notforloan = 0
      AND i.itemlost = 0 AND i.withdrawn = 0)                 AS on_loan,
  (SUM(i.notforloan = 0) = 0 AND SUM(i.notforloan = -2) > 0)  AS read_only,
  (SELECT COUNT(*) FROM reserves r
    WHERE r.biblionumber = b.biblionumber AND r.found IN ('W', 'T'))
                                                              AS held,
  IF(SUM(i.onloan IS NULL AND i.notforloan IN (0, -2)
         AND COALESCE(i.location, '') NOT REGEXP '^[[:space:]]*First Floor Z-') > 0,
     'main', 'z')                                             AS desk
FROM items i
JOIN biblio b       ON b.biblionumber  = i.biblionumber
JOIN biblioitems bi ON bi.biblionumber = i.biblionumber
WHERE i.withdrawn = 0
GROUP BY b.biblionumber
HAVING SUM(i.notforloan = 3) = 0
   AND (on_shelf > 0 OR on_loan > 0)
ORDER BY added DESC, b.biblionumber DESC
LIMIT 24
