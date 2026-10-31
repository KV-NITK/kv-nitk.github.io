-- ==========================================================
-- The photo booth's scanner (/parva-26/photobooth/scan). Safe to re-run.
-- The booth is run by someone with no IRIS login. They unlock the scanner with
-- PHOTO_BOOTH_PASSCODE, and every claim they make is made as this one staff row,
-- so it is logged and counted like anyone's. Set it to inactive on the staff
-- admin page to stop the booth scanner. Needs 009_photo_booth.sql first.
-- ==========================================================

INSERT INTO event_staff (iris_id, role, name, active)
VALUES ('PHOTO-BOOTH', 'VOLUNTEER', 'Photo booth', TRUE)
ON CONFLICT (iris_id) DO NOTHING;
