// Player Workflow Types
// These types correspond to the tables created in 20251203_create_player_workflow_tables.sql

export type WorkflowStage = 'registration' | 'trials_section' | 'trials_allocated' | 'completed';
export type AttendanceStatus = 'pending' | 'attended' | 'absent';
export type SelectionStatus = 'pending' | 'selected' | 'not_selected' | 'waitlisted';

// Base player workflow record
export interface PlayerWorkflow {
  id: string;
  registration_id: string;
  workflow_stage: WorkflowStage;
  confirmation_email_sent: boolean;
  confirmation_email_sent_at: string | null;
  confirmation_email_log_id: string | null;
  manually_moved: boolean;
  moved_by_admin_id: string | null;
  moved_at: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

// Trial allocation record
export interface TrialAllocation {
  id: string;
  workflow_id: string;
  allocation_date: string;
  allocation_time: string | null;
  allocation_venue: string | null;
  allocation_batch: string | null;
  attendance_status: AttendanceStatus;
  attendance_marked_at: string | null;
  attendance_marked_by: string | null;
  allocation_notes: string | null;
  created_at: string;
  updated_at: string;
}

// Trial results record
export interface TrialResult {
  id: string;
  allocation_id: string;
  batting_score: number | null;
  bowling_score: number | null;
  fielding_score: number | null;
  overall_score: number | null;
  selection_status: SelectionStatus;
  remarks: string | null;
  evaluator_notes: string | null;
  evaluated_by: string | null;
  evaluated_at: string | null;
  created_at: string;
  updated_at: string;
}

// Workflow history record
export interface WorkflowHistory {
  id: string;
  workflow_id: string;
  previous_stage: string | null;
  new_stage: string;
  action_type: string;
  action_details: Record<string, any> | null;
  performed_by: string | null;
  performed_at: string;
  ip_address: string | null;
  user_agent: string | null;
}

// Combined view types for easier data handling
export interface PlayerWorkflowDetails {
  workflow_id: string;
  registration_id: string;
  workflow_stage: WorkflowStage;
  confirmation_email_sent: boolean;
  confirmation_email_sent_at: string | null;
  manually_moved: boolean;
  moved_at: string | null;
  admin_notes: string | null;
  workflow_created_at: string;
  workflow_updated_at: string;
  // Player registration fields
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  position: string;
  state: string;
  city: string | null;
  town: string | null;
  pincode: string | null;
  payment_status: string;
  payment_amount: number | null;
  razorpay_payment_id: string | null;
  registration_created_at: string;
  // Email log fields
  email_status: string | null;
  email_sent_at: string | null;
}

export interface TrialsSectionPlayer {
  workflow_id: string;
  registration_id: string;
  confirmation_email_sent: boolean;
  confirmation_email_sent_at: string | null;
  moved_to_trials_at: string;
  // Player fields
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  position: string;
  state: string;
  city: string | null;
  payment_status: string;
  payment_amount: number | null;
  registration_date: string;
}

export interface TrialsAllocatedPlayer {
  workflow_id: string;
  registration_id: string;
  allocation_id: string;
  allocation_date: string;
  allocation_time: string | null;
  allocation_venue: string | null;
  allocation_batch: string | null;
  attendance_status: AttendanceStatus;
  attendance_marked_at: string | null;
  allocation_notes: string | null;
  allocated_at: string;
  // Player fields
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  position: string;
  state: string;
  city: string | null;
  payment_status: string;
  registration_date: string;
  // Trial results
  overall_score: number | null;
  selection_status: SelectionStatus | null;
  remarks: string | null;
  evaluated_at: string | null;
}

// Dashboard stats interface
export interface WorkflowDashboardStats {
  total_registrations: number;
  pending_payments: number;
  completed_payments: number;
  emails_sent: number;
  emails_pending: number;
  in_trials_section: number;
  trials_allocated: number;
  attended: number;
  absent: number;
  selected: number;
  not_selected: number;
  waitlisted: number;
}

// Input types for RPC functions
export interface MoveToTrialsInput {
  registration_ids: string[];
  admin_id?: string;
}

export interface AllocateToTrialsInput {
  workflow_ids: string[];
  allocation_date: string;
  allocation_time?: string;
  allocation_venue?: string;
  allocation_batch?: string;
  admin_id?: string;
}

export interface MarkAttendanceInput {
  allocation_id: string;
  attendance_status: AttendanceStatus;
  admin_id?: string;
}

export interface UpdateTrialResultsInput {
  allocation_id: string;
  batting_score?: number;
  bowling_score?: number;
  fielding_score?: number;
  overall_score?: number;
  selection_status: SelectionStatus;
  remarks?: string;
  evaluator_notes?: string;
  admin_id?: string;
}

// Response types from RPC functions
export interface BulkOperationResult {
  registration_id?: string;
  workflow_id?: string;
  success: boolean;
  message: string;
}

// Player registration with email status for workflow management
export interface PlayerRegistrationWithEmailStatus {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  position: string;
  state: string;
  city: string | null;
  town: string | null;
  pincode: string | null;
  payment_status: string;
  payment_amount: number | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  // Additional workflow fields
  workflow_id?: string;
  workflow_stage?: WorkflowStage;
  confirmation_email_sent?: boolean;
  confirmation_email_sent_at?: string;
}
