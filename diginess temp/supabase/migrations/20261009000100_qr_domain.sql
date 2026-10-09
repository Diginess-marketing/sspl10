-- QR codes: every link uses the current domain ssplt10.co.in (PRD 7.2).
-- Older records still point at sspl10.com, which no longer responds. Only the stored
-- link text changes; QR images already printed are unaffected. Safe to re-run.

update public.sspl_qr_codes
   set target_url = regexp_replace(target_url, '^https?://(www\.)?sspl10\.com', 'https://ssplt10.co.in'),
       updated_at = now()
 where target_url ~ '^https?://(www\.)?sspl10\.com';
