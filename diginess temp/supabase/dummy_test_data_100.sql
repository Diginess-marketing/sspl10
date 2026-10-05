-- 100 extra dummy players (names "TEST Player N") spread across every workflow stage.
-- Run AFTER dummy_test_data.sql (or on its own). Safe to re-run: ids come from md5(), ON CONFLICT DO NOTHING.
--
--   i   1-15  payment pending        i  61-75  allocated, attendance pending
--   i  16-20  payment failed         i  76-85  attended, result not entered
--   i  21-40  paid, not moved yet    i  86-92  completed - SELECTED
--   i  41-60  in trials section      i  93-97  completed - NOT SELECTED
--                                    i  98-100 completed - WAITLISTED

-- 1) Registrations (100)
insert into public.player_registrations
  (id, full_name, email, phone, date_of_birth, dob, gender, parent_name, state, city, pincode, position, registration_type,
   status, payment_status, payment_amount, amount_paid, workflow_stage, created_at)
select
  md5('reg' || i)::uuid,
  'TEST Player ' || i,
  'test.player' || i || '@example.com',
  (9100000000 + i)::text,
  date '2007-01-01' + (i * 9),
  date '2007-01-01' + (i * 9),
  'male',
  'TEST Parent ' || i,
  (array['Tamil Nadu','Karnataka','Kerala','Telangana','Andhra Pradesh'])[1 + i % 5],
  (array['Chennai','Bengaluru','Kochi','Hyderabad','Vijayawada'])[1 + i % 5],
  (600000 + i)::text,
  (array['Batsman','Bowler','All-rounder','Wicketkeeper'])[1 + i % 4],
  'individual',
  case when i <= 20 then 'pending' else 'confirmed' end,
  case when i <= 15 then 'pending' when i <= 20 then 'failed' else 'captured' end,
  590,
  case when i <= 20 then 0 else 590 end,
  case when i <= 40 then 'registration'
       when i <= 60 then 'trials_section'
       when i <= 85 then 'trials_allocated'
       else 'completed' end,
  now() - ((101 - i) || ' hours')::interval
from generate_series(1, 100) i
on conflict (id) do nothing;

-- 2) Workflow rows (players 21-100)
insert into public.player_workflow
  (workflow_id, registration_id, workflow_stage, full_name, email, phone, city, state, pincode, payment_status, payment_amount,
   confirmation_email_sent, moved_to_trials_at, allocated_to_trials_at)
select
  md5('wf' || i)::uuid,
  md5('reg' || i)::uuid,
  case when i <= 40 then 'registration'
       when i <= 60 then 'trials_section'
       when i <= 85 then 'trials_allocated'
       else 'completed' end,
  'TEST Player ' || i,
  'test.player' || i || '@example.com',
  (9100000000 + i)::text,
  (array['Chennai','Bengaluru','Kochi','Hyderabad','Vijayawada'])[1 + i % 5],
  (array['Tamil Nadu','Karnataka','Kerala','Telangana','Andhra Pradesh'])[1 + i % 5],
  (600000 + i)::text,
  'captured',
  590,
  i > 40,
  case when i > 40 then now() - interval '3 days' end,
  case when i > 60 then now() - interval '2 days' end
from generate_series(21, 100) i
on conflict (workflow_id) do nothing;

-- 3) Trial allocations (players 61-100), 3 batches
insert into public.trials_allocations
  (allocation_id, workflow_id, allocation_date, allocation_time, allocation_venue, allocation_batch,
   attendance_status, selection_status, attended_at, overall_score, evaluated_at)
select
  md5('alloc' || i)::uuid,
  md5('wf' || i)::uuid,
  case when i <= 85 then current_date + 3 else current_date - 1 end,
  (array['09:00 AM','11:00 AM','02:00 PM'])[1 + i % 3],
  'TEST Ground, ' || (array['Chennai','Bengaluru','Kochi'])[1 + i % 3],
  'Batch ' || (array['A','B','C'])[1 + i % 3],
  case when i <= 75 then 'pending' else 'attended' end,
  case when i <= 85 then 'pending'
       when i <= 92 then 'selected'
       when i <= 97 then 'not_selected'
       else 'waitlisted' end,
  case when i > 75 then now() - interval '1 day' end,
  case when i > 85 then round((3 + (i % 7))::numeric, 1) end,
  case when i > 85 then now() - interval '1 day' end
from generate_series(61, 100) i
on conflict (allocation_id) do nothing;

-- 4) Trial results (players 86-100)
insert into public.trial_results
  (id, allocation_id, batting_score, bowling_score, fielding_score, overall_score, selection_status, remarks, evaluated_by, evaluated_at)
select
  md5('res' || i)::uuid,
  md5('alloc' || i)::uuid,
  3 + (i % 7), 3 + ((i + 1) % 7), 3 + ((i + 2) % 7),
  round((3 + (i % 7))::numeric, 1),
  case when i <= 92 then 'selected' when i <= 97 then 'not_selected' else 'waitlisted' end,
  'TEST remark ' || i,
  'TEST Evaluator',
  now() - interval '1 day'
from generate_series(86, 100) i
on conflict (id) do nothing;

-- 5) Confirmation emails for players 41-100 (they are past the email step)
insert into public.email_logs (id, email, recipient_email, recipient_name, email_type, status, registration_id)
select md5('mail' || i)::uuid, 'test.player' || i || '@example.com', 'test.player' || i || '@example.com',
       'TEST Player ' || i, 'registration_confirmation', 'success', md5('reg' || i)::uuid::text
from generate_series(41, 100) i
on conflict (id) do nothing;
