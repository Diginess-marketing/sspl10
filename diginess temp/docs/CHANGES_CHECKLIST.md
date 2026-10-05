# Change checklist: admin redesign + trials workflow

Branch `Diginess-SP`, based on `main`. Tick each box as you review it.

## 1. Set up before testing
- [ ] Run `supabase/migrations/20260929000000_workflow_gaps.sql` (payments ledger, candidate columns, auto-workflow trigger, `sync_trial_candidates()`)
- [ ] Run `supabase/migrations/20260929000100_result_notifications.sql` (`player_notifications` table + trigger)
- [ ] Optional test data: `supabase/dummy_test_data.sql` (8 players) and `dummy_test_data_100.sql` (100 players). Every name starts with `TEST`
- [ ] Make sure your user has `role = 'admin'` in `user_roles`

## 2. Security
- [ ] `AdminRoute.tsx`: removed the debug line that let any signed-in user into `/admin`. Only admins get in now

## 3. Admin redesign (light theme, website brand)
- [ ] **Look:** new `src/styles/admin.css` (scoped to `.admin-shell`), brand tokens only
- [ ] **Shell:** `AdminLayout.tsx` has a grouped sidebar, top bar with breadcrumbs, ⌘K search, account menu, mobile drawer
- [ ] **Routes:** `App.tsx` uses one nested `/admin` layout route (was 13 copies). Added the missing `/admin/certificates` route
- [ ] **Shared parts:** `src/components/admin/ui/` (PageHeader, StatCard, StatusBadge, EmptyState, ActionButton, ConfirmDialog, DetailDrawer, DataTableShell)
- [ ] **Dashboard:** stat cards, pipeline funnel, recent registrations, quick actions
- [ ] **Every admin page restyled:** Trials, Users, Selectors, Organizers, Rewards, Payments, Certificates, Reports, Analytics, Content (+CMS), Settings, Selection Status, WhatsApp
- [ ] **UX changes:** confirm dialogs replace `alert()` / `window.confirm()`, toasts replace popups, slide-over panels for edit and details
- [ ] **Behaviour change:** approve / reject on Selectors now asks for confirmation

## 4. Trials workflow
- [ ] `/admin/trials` has a step bar with live counts
- [ ] New **Levels L1-L3** step. Added the missing hook methods in `usePlayerWorkflow.ts` and the **Sync paid players** button
- [ ] Added the missing `getReportData` and `getTrialOverallStats` (Reports viewer and Analytics were broken)
- [ ] Bug fixes: the "To trials" row button did nothing; the results form pre-filled batting with the overall score

## 5. Backend (`backend/src`)
- [ ] `confirmationMailService.js` (new): sends the confirmation email after payment. Never blocks payment, skips if already sent, skips if keys are missing
- [ ] `paymentController.js`: calls it after settlement. Candidate creation can no longer fail a payment
- [ ] `trialCandidateModel.js`: tolerates a missing column
- [ ] `reconciliationService.js`: accepts `captured`, `paid`, `completed`, `success` (was `completed` only)
- [ ] Email needs backend `VITE_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`, Supabase secrets `AZURE_*`, and `supabase functions deploy send-confirmation-mail`

## 6. Public website
- [ ] **Nav:** fewer items. Players + Trials and Teams + Matches are merged into grouped menus. One Registration button in the bar. Edited `siteNav.ts`, `Header.tsx`, `Header.css`
- [ ] **Social widget:** smaller knee-pad with larger icons (`SocialKneePadWidget.css`)
- [ ] **Cursor:** blue cricket ball on the website, normal cursor on `/admin` (`CricketCursor.tsx/.css`)
- [ ] Loading screen "Loading cricket action..." removed (`App.tsx`)

## 7. Known gaps
- [ ] Result email to players is not built yet. Rows are stored in `player_notifications`
- [ ] Still old style: `DataInsertionTool`, GA4 and Campaign pages
- [ ] 31 unit tests already failed before this work. No new failures
- [ ] Not checked in a browser at phone width. Please check `/admin` at 390px
- [ ] `DataInsertionTool.tsx` has one existing type error (not touched)

## 8. Do not commit
- `diginess temp/.env.local` (points at a test Supabase project)
- `diginess temp/supabase/.temp/*` (local CLI link state)
