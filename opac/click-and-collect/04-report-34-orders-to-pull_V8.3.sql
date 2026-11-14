SELECT
  CASE WHEN TRIM(REPLACE(i.location, CHAR(9), '')) LIKE 'First Floor Z-%' THEN 'Zawaya desk' ELSE 'Pickup Counter' END AS Desk,
  CONCAT(b.surname, ', ', b.firstname) AS Patron,
  b.cardnumber AS Card,
  bi.title AS Title,
  TRIM(REPLACE(COALESCE(av.lib, i.location), CHAR(9), '')) AS Shelf,
  i.itemcallnumber AS `Call number`,
  i.barcode AS Barcode,
  DATE_FORMAT(r.ordered_at, '%a %e %b, %l:%i %p') AS Ordered,
  CASE
    WHEN r.reservedate > DATE(r.ordered_at)
      THEN CONCAT(DATE_FORMAT(r.reservedate, '%a %e %b'), ', 10:30 AM')
    WHEN DAYOFWEEK(r.ordered_at) = 1
      THEN CONCAT(DATE_FORMAT(DATE(r.ordered_at) + INTERVAL 1 DAY, '%a %e %b'), ', 10:30 AM')
    WHEN DAYOFWEEK(r.ordered_at) = 7 AND TIME(r.ordered_at) >= '17:00:00'
      THEN CONCAT(DATE_FORMAT(DATE(r.ordered_at) + INTERVAL 2 DAY, '%a %e %b'), ', 10:30 AM')
    WHEN TIME(r.ordered_at) >= '08:30:00' AND TIME(r.ordered_at) < '17:00:00'
      THEN CONCAT(DATE_FORMAT(r.ordered_at, '%a %e %b'), ', 6:30 PM')
    WHEN TIME(r.ordered_at) >= '17:00:00'
      THEN CONCAT(DATE_FORMAT(DATE(r.ordered_at) + INTERVAL 1 DAY, '%a %e %b'), ', 10:30 AM')
    ELSE CONCAT(DATE_FORMAT(r.ordered_at, '%a %e %b'), ', 10:30 AM')
  END AS `Ready by`,
  CASE
    WHEN i.notforloan = -2 THEN 'Read in library only'
    WHEN r.itemnumber IS NULL THEN 'Any copy'
    ELSE ''
  END AS Note
FROM (
  SELECT rr.*, COALESCE(hl.created, rr.timestamp) AS ordered_at
  FROM reserves rr
  LEFT JOIN (
    SELECT object, MIN(timestamp) AS created
    FROM action_logs
    WHERE module = 'HOLDS' AND action LIKE 'CREAT_'
    GROUP BY object
  ) hl ON hl.object = rr.reserve_id
) r
JOIN borrowers b ON b.borrowernumber = r.borrowernumber
JOIN biblio bi ON bi.biblionumber = r.biblionumber
LEFT JOIN items i ON i.itemnumber = r.itemnumber
LEFT JOIN authorised_values av ON av.category = 'LOC' AND av.authorised_value = TRIM(REPLACE(i.location, CHAR(9), ''))
WHERE r.found IS NULL
  AND r.suspend = 0
  AND i.onloan IS NULL
  AND r.reservedate <= CURDATE()
  AND r.branchcode = 'AJSK'
  AND b.cardnumber LIKE CONCAT(<<Card number (leave blank for everyone)>>, '%')
ORDER BY Desk, Shelf, `Call number`, Patron
