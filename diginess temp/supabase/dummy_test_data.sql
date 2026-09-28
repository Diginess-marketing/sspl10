-- Small dummy dataset for testing the full workflow (all names start with "TEST").
-- Safe to re-run: fixed ids + ON CONFLICT DO NOTHING. Run in the Supabase SQL Editor.
--
-- Player pipeline covered (8 players):
--   1 Arun    payment pending                -> shows in "pending payments"
--   2 Bala    payment failed                 -> failed payment case
--   3 Charan  paid, not moved yet            -> test "Move to Trials Section"
--   4 Dinesh  paid, in trials section        -> test "Allocate to trials"
--   5 Eshwar  allocated, attendance pending  -> test "Mark attendance"
--   6 Farook  allocated, attended            -> test "Update results"
--   7 Gokul   completed, SELECTED
--   8 Hari    completed, NOT SELECTED

-- Teams (1)
insert into public.teams (id, team_name, state, city, primary_contact_name, primary_contact_email, primary_contact_phone, payment_amount, amount_paid, payment_status)
values ('a0000000-0000-0000-0000-000000000001', 'TEST Chennai Kings', 'Tamil Nadu', 'Chennai', 'TEST Captain', 'test.captain@example.com', '9000000001', 1180, 1180, 'captured')
on conflict (id) do nothing;

-- Player registrations (8)
insert into public.player_registrations
  (id, full_name, email, phone, date_of_birth, dob, gender, parent_name, state, city, pincode, position, registration_type, team_id, is_captain, status, payment_status, payment_amount, amount_paid, workflow_stage, created_at)
values
 ('b0000000-0000-0000-0000-000000000001','TEST Arun Kumar','test.arun@example.com','9000000011','2008-03-14','2008-03-14','male','TEST Parent 1','Tamil Nadu','Chennai','600001','Batsman','individual',null,false,'pending','pending',590,0,'registration', now() - interval '7 days'),
 ('b0000000-0000-0000-0000-000000000002','TEST Bala Murugan','test.bala@example.com','9000000012','2007-07-02','2007-07-02','male','TEST Parent 2','Tamil Nadu','Madurai','625001','Bowler','individual',null,false,'pending','failed',590,0,'registration', now() - interval '6 days'),
 ('b0000000-0000-0000-0000-000000000003','TEST Charan Raj','test.charan@example.com','9000000013','2008-11-21','2008-11-21','male','TEST Parent 3','Tamil Nadu','Chennai','600002','All-rounder','team','a0000000-0000-0000-0000-000000000001',true,'confirmed','captured',590,590,'registration', now() - interval '5 days'),
 ('b0000000-0000-0000-0000-000000000004','TEST Dinesh Babu','test.dinesh@example.com','9000000014','2009-01-09','2009-01-09','male','TEST Parent 4','Karnataka','Bengaluru','560001','Wicketkeeper','individual',null,false,'confirmed','captured',590,590,'trials_section', now() - interval '5 days'),
 ('b0000000-0000-0000-0000-000000000005','TEST Eshwar S','test.eshwar@example.com','9000000015','2008-05-30','2008-05-30','male','TEST Parent 5','Kerala','Kochi','682001','Batsman','individual',null,false,'confirmed','captured',590,590,'trials_allocated', now() - interval '4 days'),
 ('b0000000-0000-0000-0000-000000000006','TEST Farook Ali','test.farook@example.com','9000000016','2007-12-12','2007-12-12','male','TEST Parent 6','Telangana','Hyderabad','500001','Bowler','individual',null,false,'confirmed','captured',590,590,'trials_allocated', now() - interval '4 days'),
 ('b0000000-0000-0000-0000-000000000007','TEST Gokul Nath','test.gokul@example.com','9000000017','2008-08-08','2008-08-08','male','TEST Parent 7','Tamil Nadu','Coimbatore','641001','All-rounder','individual',null,false,'confirmed','captured',590,590,'completed', now() - interval '3 days'),
 ('b0000000-0000-0000-0000-000000000008','TEST Hari Prasad','test.hari@example.com','9000000018','2009-04-18','2009-04-18','male','TEST Parent 8','Andhra Pradesh','Vijayawada','520001','Batsman','individual',null,false,'confirmed','captured',590,590,'completed', now() - interval '3 days')
on conflict (id) do nothing;

-- Workflow rows for players 3-8 (player 3 stays at stage 'registration', ready to be moved)
insert into public.player_workflow
  (workflow_id, registration_id, workflow_stage, full_name, email, phone, city, state, pincode, payment_status, payment_amount, confirmation_email_sent, moved_to_trials_at, allocated_to_trials_at)
values
 ('c0000000-0000-0000-0000-000000000003','b0000000-0000-0000-0000-000000000003','registration','TEST Charan Raj','test.charan@example.com','9000000013','Chennai','Tamil Nadu','600002','captured',590,true,null,null),
 ('c0000000-0000-0000-0000-000000000004','b0000000-0000-0000-0000-000000000004','trials_section','TEST Dinesh Babu','test.dinesh@example.com','9000000014','Bengaluru','Karnataka','560001','captured',590,true,now() - interval '2 days',null),
 ('c0000000-0000-0000-0000-000000000005','b0000000-0000-0000-0000-000000000005','trials_allocated','TEST Eshwar S','test.eshwar@example.com','9000000015','Kochi','Kerala','682001','captured',590,true,now() - interval '3 days',now() - interval '2 days'),
 ('c0000000-0000-0000-0000-000000000006','b0000000-0000-0000-0000-000000000006','trials_allocated','TEST Farook Ali','test.farook@example.com','9000000016','Hyderabad','Telangana','500001','captured',590,true,now() - interval '3 days',now() - interval '2 days'),
 ('c0000000-0000-0000-0000-000000000007','b0000000-0000-0000-0000-000000000007','completed','TEST Gokul Nath','test.gokul@example.com','9000000017','Coimbatore','Tamil Nadu','641001','captured',590,true,now() - interval '3 days',now() - interval '2 days'),
 ('c0000000-0000-0000-0000-000000000008','b0000000-0000-0000-0000-000000000008','completed','TEST Hari Prasad','test.hari@example.com','9000000018','Vijayawada','Andhra Pradesh','520001','captured',590,true,now() - interval '3 days',now() - interval '2 days')
on conflict (workflow_id) do nothing;

-- Trial allocations for players 5-8 (one venue/date)
insert into public.trials_allocations
  (allocation_id, workflow_id, allocation_date, allocation_time, allocation_venue, allocation_batch, attendance_status, selection_status, attended_at, overall_score, evaluated_at)
values
 ('d0000000-0000-0000-0000-000000000005','c0000000-0000-0000-0000-000000000005', current_date + 3,'09:00 AM','TEST Ground, Chennai','Batch A','pending','pending',null,null,null),
 ('d0000000-0000-0000-0000-000000000006','c0000000-0000-0000-0000-000000000006', current_date + 3,'09:00 AM','TEST Ground, Chennai','Batch A','attended','pending',now(),null,null),
 ('d0000000-0000-0000-0000-000000000007','c0000000-0000-0000-0000-000000000007', current_date - 1,'09:00 AM','TEST Ground, Chennai','Batch A','attended','selected',now() - interval '1 day',8.5,now() - interval '1 day'),
 ('d0000000-0000-0000-0000-000000000008','c0000000-0000-0000-0000-000000000008', current_date - 1,'09:00 AM','TEST Ground, Chennai','Batch A','attended','not_selected',now() - interval '1 day',4.0,now() - interval '1 day')
on conflict (allocation_id) do nothing;

-- Trial results for the two completed players
insert into public.trial_results
  (id, allocation_id, batting_score, bowling_score, fielding_score, overall_score, selection_status, remarks, evaluated_by, evaluated_at)
values
 ('e0000000-0000-0000-0000-000000000007','d0000000-0000-0000-0000-000000000007',9,8,8.5,8.5,'selected','TEST: strong all-round showing','TEST Evaluator',now() - interval '1 day'),
 ('e0000000-0000-0000-0000-000000000008','d0000000-0000-0000-0000-000000000008',4,4,4,4.0,'not_selected','TEST: needs more practice','TEST Evaluator',now() - interval '1 day')
on conflict (id) do nothing;

-- Confirmation emails sent for 5 paid players (feeds dashboard "emails sent" stat)
insert into public.email_logs (id, email, recipient_email, recipient_name, email_type, status, registration_id)
select gen_random_uuid(), r.email, r.email, r.full_name, 'registration_confirmation', 'success', r.id::text
from public.player_registrations r
where r.id in ('b0000000-0000-0000-0000-000000000004','b0000000-0000-0000-0000-000000000005','b0000000-0000-0000-0000-000000000006','b0000000-0000-0000-0000-000000000007','b0000000-0000-0000-0000-000000000008')
  and not exists (select 1 from public.email_logs l where l.registration_id = r.id::text);

-- Selector applications (3): pending / approved / rejected
insert into public.selectors (id, full_name, age, city_state, contact_number, email, years_of_experience, highest_level_played, previously_worked_as_selector, availability, preferred_region, declaration_accepted, status)
values
 ('f0000000-0000-0000-0000-000000000001','TEST Selector One',45,'Chennai, Tamil Nadu','9000000021','test.sel1@example.com','15','State','yes',array['weekends'],'South',true,'pending'),
 ('f0000000-0000-0000-0000-000000000002','TEST Selector Two',52,'Mumbai, Maharashtra','9000000022','test.sel2@example.com','20','National','yes',array['weekdays','weekends'],'West',true,'approved'),
 ('f0000000-0000-0000-0000-000000000003','TEST Selector Three',38,'Delhi','9000000023','test.sel3@example.com','8','District','no',array['weekends'],'North',true,'rejected')
on conflict (id) do nothing;

-- Multi-level trial tracker (3 candidates: selected at L1, rejected at L1, absent)
insert into public.trial_candidates (id, name, mobile, phone, city, state, proficiency)
values
 ('11000000-0000-0000-0000-000000000001','TEST Ishaan','9000000031','9000000031','Chennai','Tamil Nadu','Batsman'),
 ('11000000-0000-0000-0000-000000000002','TEST Jayanth','9000000032','9000000032','Madurai','Tamil Nadu','Bowler'),
 ('11000000-0000-0000-0000-000000000003','TEST Karthik','9000000033','9000000033','Salem','Tamil Nadu','All-rounder')
on conflict (id) do nothing;

insert into public.trial_progress (id, candidate_id, current_level, l1_called, l1_attendance, l1_marks, l1_result, l1_remarks, l2_called)
values
 ('12000000-0000-0000-0000-000000000001','11000000-0000-0000-0000-000000000001',2,true,'PRESENT',8,'SELECTED','TEST: good technique',true),
 ('12000000-0000-0000-0000-000000000002','11000000-0000-0000-0000-000000000002',1,true,'PRESENT',3,'REJECTED','TEST: below cut-off',false),
 ('12000000-0000-0000-0000-000000000003','11000000-0000-0000-0000-000000000003',1,true,'ABSENT',null,null,null,false)
on conflict (id) do nothing;

-- Rewards (2) and one news article
insert into public.rewards (id, title, description, points_cost, is_active)
values
 ('13000000-0000-0000-0000-000000000001','TEST Signed Cap','Dummy reward for testing',100,true),
 ('13000000-0000-0000-0000-000000000002','TEST Match Ticket','Dummy inactive reward',250,false)
on conflict (id) do nothing;

insert into public.news_articles (id, title, slug, excerpt, content, is_published, published_at)
values ('14000000-0000-0000-0000-000000000001','TEST News Article','test-news-article','Dummy excerpt for testing.','Dummy content for testing the news pages.',true,now())
on conflict (id) do nothing;
