export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_invites: {
        Row: {
          created_at: string | null
          created_by: string | null
          email: string
          permissions: Json | null
          role: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email: string
          permissions?: Json | null
          role?: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email?: string
          permissions?: Json | null
          role?: string
          status?: string | null
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          config_key: string
          content: Json | null
          created_at: string | null
          gst_percentage: number
          id: string
          razorpay_key_id: string | null
          razorpay_key_secret: string | null
          registration_fee: number
          updated_at: string | null
        }
        Insert: {
          config_key: string
          content?: Json | null
          created_at?: string | null
          gst_percentage?: number
          id?: string
          razorpay_key_id?: string | null
          razorpay_key_secret?: string | null
          registration_fee?: number
          updated_at?: string | null
        }
        Update: {
          config_key?: string
          content?: Json | null
          created_at?: string | null
          gst_percentage?: number
          id?: string
          razorpay_key_id?: string | null
          razorpay_key_secret?: string | null
          registration_fee?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          created_at: string
          email: string | null
          email_type: string
          error_message: string | null
          id: string
          payment_id: string | null
          recipient_email: string
          recipient_name: string
          registration_id: string | null
          sent_at: string
          status: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          email_type: string
          error_message?: string | null
          id?: string
          payment_id?: string | null
          recipient_email: string
          recipient_name: string
          registration_id?: string | null
          sent_at?: string
          status: string
        }
        Update: {
          created_at?: string
          email?: string | null
          email_type?: string
          error_message?: string | null
          id?: string
          payment_id?: string | null
          recipient_email?: string
          recipient_name?: string
          registration_id?: string | null
          sent_at?: string
          status?: string
        }
        Relationships: []
      }
      ga4_analytics: {
        Row: {
          avg_session_duration: number | null
          bounce_rate: number | null
          conversions: number | null
          created_at: string | null
          date_range_end: string | null
          date_range_start: string | null
          fetched_at: string | null
          id: string
          new_users: number | null
          page_views: number | null
          report_date: string
          revenue: number | null
          sessions: number | null
          users: number | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          avg_session_duration?: number | null
          bounce_rate?: number | null
          conversions?: number | null
          created_at?: string | null
          date_range_end?: string | null
          date_range_start?: string | null
          fetched_at?: string | null
          id?: string
          new_users?: number | null
          page_views?: number | null
          report_date: string
          revenue?: number | null
          sessions?: number | null
          users?: number | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          avg_session_duration?: number | null
          bounce_rate?: number | null
          conversions?: number | null
          created_at?: string | null
          date_range_end?: string | null
          date_range_start?: string | null
          fetched_at?: string | null
          id?: string
          new_users?: number | null
          page_views?: number | null
          report_date?: string
          revenue?: number | null
          sessions?: number | null
          users?: number | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      google_analytics_config: {
        Row: {
          created_at: string | null
          custom_dimensions: Json | null
          custom_metrics: Json | null
          debug_mode: boolean | null
          enabled: boolean | null
          event_tracking: Json | null
          exclude_admin_users: boolean | null
          id: string
          measurement_id: string | null
          privacy_settings: Json | null
          sample_rate: number | null
          tracking_enabled: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          custom_dimensions?: Json | null
          custom_metrics?: Json | null
          debug_mode?: boolean | null
          enabled?: boolean | null
          event_tracking?: Json | null
          exclude_admin_users?: boolean | null
          id?: string
          measurement_id?: string | null
          privacy_settings?: Json | null
          sample_rate?: number | null
          tracking_enabled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          custom_dimensions?: Json | null
          custom_metrics?: Json | null
          debug_mode?: boolean | null
          enabled?: boolean | null
          event_tracking?: Json | null
          exclude_admin_users?: boolean | null
          id?: string
          measurement_id?: string | null
          privacy_settings?: Json | null
          sample_rate?: number | null
          tracking_enabled?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      google_analytics_events: {
        Row: {
          event_id: number
          event_name: string
          event_time: string | null
          session_id: number
        }
        Insert: {
          event_id?: number
          event_name: string
          event_time?: string | null
          session_id: number
        }
        Update: {
          event_id?: number
          event_name?: string
          event_time?: string | null
          session_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "google_analytics_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "google_analytics_sessions"
            referencedColumns: ["session_id"]
          },
        ]
      }
      google_analytics_pageviews: {
        Row: {
          page_url: string
          pageview_id: number
          session_id: number
          timestamp: string | null
        }
        Insert: {
          page_url: string
          pageview_id?: number
          session_id: number
          timestamp?: string | null
        }
        Update: {
          page_url?: string
          pageview_id?: number
          session_id?: number
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "google_analytics_pageviews_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "google_analytics_sessions"
            referencedColumns: ["session_id"]
          },
        ]
      }
      google_analytics_sessions: {
        Row: {
          end_time: string | null
          page_views: number | null
          session_id: number
          start_time: string | null
          user_id: string
        }
        Insert: {
          end_time?: string | null
          page_views?: number | null
          session_id?: number
          start_time?: string | null
          user_id: string
        }
        Update: {
          end_time?: string | null
          page_views?: number | null
          session_id?: number
          start_time?: string | null
          user_id?: string
        }
        Relationships: []
      }
      google_analytics_user_properties: {
        Row: {
          property_name: string
          property_value: string | null
          updated_at: string | null
          user_id: string
          user_property_id: number
        }
        Insert: {
          property_name: string
          property_value?: string | null
          updated_at?: string | null
          user_id: string
          user_property_id?: number
        }
        Update: {
          property_name?: string
          property_value?: string | null
          updated_at?: string | null
          user_id?: string
          user_property_id?: number
        }
        Relationships: []
      }
      leads: {
        Row: {
          age: number | null
          age_group: string | null
          consent_analytics: boolean | null
          consent_marketing: boolean | null
          created_at: string | null
          dob: string | null
          email: string | null
          id: string
          name: string
          phone: string
          source: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          age?: number | null
          age_group?: string | null
          consent_analytics?: boolean | null
          consent_marketing?: boolean | null
          created_at?: string | null
          dob?: string | null
          email?: string | null
          id?: string
          name: string
          phone: string
          source?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          age?: number | null
          age_group?: string | null
          consent_analytics?: boolean | null
          consent_marketing?: boolean | null
          created_at?: string | null
          dob?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string
          source?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      pages: {
        Row: {
          content: Json
          created_at: string
          id: string
          is_published: boolean
          meta_description: string | null
          meta_title: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content: Json
          created_at?: string
          id?: string
          is_published?: boolean
          meta_description?: string | null
          meta_title?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          is_published?: boolean
          meta_description?: string | null
          meta_title?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          order_id: string | null
          payment_date: string | null
          payment_id: string | null
          registration_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          order_id?: string | null
          payment_date?: string | null
          payment_id?: string | null
          registration_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          order_id?: string | null
          payment_date?: string | null
          payment_id?: string | null
          registration_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      player_registrations: {
        Row: {
          amount_paid: number | null
          city: string | null
          created_at: string
          date_of_birth: string
          email: string
          full_name: string
          id: string
          is_captain: boolean | null
          payment_amount: number | null
          payment_error_details: Json | null
          payment_status: string
          phone: string
          pincode: string | null
          position: string
          preferred_trials: string | null
          qr_code_id: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          registration_type: string | null
          state: string
          status: string
          team: string | null
          team_id: string | null
          team_members: Json | null
          town: string | null
          updated_at: string
          utm_campaign: string | null
          utm_content: string | null
          utm_id: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          amount_paid?: number | null
          city?: string | null
          created_at?: string
          date_of_birth: string
          email: string
          full_name: string
          id?: string
          is_captain?: boolean | null
          payment_amount?: number | null
          payment_error_details?: Json | null
          payment_status?: string
          phone: string
          pincode?: string | null
          position: string
          preferred_trials?: string | null
          qr_code_id?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          registration_type?: string | null
          state: string
          status?: string
          team?: string | null
          team_id?: string | null
          team_members?: Json | null
          town?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_id?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          amount_paid?: number | null
          city?: string | null
          created_at?: string
          date_of_birth?: string
          email?: string
          full_name?: string
          id?: string
          is_captain?: boolean | null
          payment_amount?: number | null
          payment_error_details?: Json | null
          payment_status?: string
          phone?: string
          pincode?: string | null
          position?: string
          preferred_trials?: string | null
          qr_code_id?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          registration_type?: string | null
          state?: string
          status?: string
          team?: string | null
          team_id?: string | null
          team_members?: Json | null
          town?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_id?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_registrations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      player_workflow: {
        Row: {
          allocated_to_trials_at: string | null
          city: string | null
          confirmation_email_log_id: string | null
          confirmation_email_sent: boolean | null
          confirmation_email_sent_at: string | null
          created_at: string
          email: string | null
          full_name: string | null
          moved_to_trials_at: string | null
          payment_amount: number | null
          payment_status: string | null
          phone: string | null
          pincode: string | null
          registration_id: string
          state: string | null
          trial_uid: string | null
          updated_at: string
          workflow_id: string
          workflow_stage: string
        }
        Insert: {
          allocated_to_trials_at?: string | null
          city?: string | null
          confirmation_email_log_id?: string | null
          confirmation_email_sent?: boolean | null
          confirmation_email_sent_at?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          moved_to_trials_at?: string | null
          payment_amount?: number | null
          payment_status?: string | null
          phone?: string | null
          pincode?: string | null
          registration_id: string
          state?: string | null
          trial_uid?: string | null
          updated_at?: string
          workflow_id?: string
          workflow_stage: string
        }
        Update: {
          allocated_to_trials_at?: string | null
          city?: string | null
          confirmation_email_log_id?: string | null
          confirmation_email_sent?: boolean | null
          confirmation_email_sent_at?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          moved_to_trials_at?: string | null
          payment_amount?: number | null
          payment_status?: string | null
          phone?: string | null
          pincode?: string | null
          registration_id?: string
          state?: string | null
          trial_uid?: string | null
          updated_at?: string
          workflow_id?: string
          workflow_stage?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_workflow_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "player_registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_workflow_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registration_utm_analytics"
            referencedColumns: ["registration_id"]
          },
          {
            foreignKeyName: "player_workflow_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "v_admin_player_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      razorpay_ledger: {
        Row: {
          amount: number | null
          captured_at: string | null
          contact: string | null
          created_at: string | null
          currency: string | null
          email: string | null
          fee: number | null
          last_synced_at: string | null
          method: string | null
          order_id: string | null
          payment_id: string
          raw_payload: Json | null
          status: string | null
          tax: number | null
        }
        Insert: {
          amount?: number | null
          captured_at?: string | null
          contact?: string | null
          created_at?: string | null
          currency?: string | null
          email?: string | null
          fee?: number | null
          last_synced_at?: string | null
          method?: string | null
          order_id?: string | null
          payment_id: string
          raw_payload?: Json | null
          status?: string | null
          tax?: number | null
        }
        Update: {
          amount?: number | null
          captured_at?: string | null
          contact?: string | null
          created_at?: string | null
          currency?: string | null
          email?: string | null
          fee?: number | null
          last_synced_at?: string | null
          method?: string | null
          order_id?: string | null
          payment_id?: string
          raw_payload?: Json | null
          status?: string | null
          tax?: number | null
        }
        Relationships: []
      }
      registration_fields: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          label: string
          name: string
          options: Json | null
          placeholder: string | null
          required: boolean
          type: string
          updated_at: string
          validation_rules: Json | null
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          label: string
          name: string
          options?: Json | null
          placeholder?: string | null
          required?: boolean
          type: string
          updated_at?: string
          validation_rules?: Json | null
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          label?: string
          name?: string
          options?: Json | null
          placeholder?: string | null
          required?: boolean
          type?: string
          updated_at?: string
          validation_rules?: Json | null
        }
        Relationships: []
      }
      registrations: {
        Row: {
          amount: number | null
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          notes: string | null
          order_id: string | null
          payment_id: string | null
          phone: string | null
          player_id: string | null
          registration_date: string | null
          registration_id: string | null
          status: string | null
          trial_id: string | null
          updated_at: string | null
          utm_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          notes?: string | null
          order_id?: string | null
          payment_id?: string | null
          phone?: string | null
          player_id?: string | null
          registration_date?: string | null
          registration_id?: string | null
          status?: string | null
          trial_id?: string | null
          updated_at?: string | null
          utm_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          notes?: string | null
          order_id?: string | null
          payment_id?: string | null
          phone?: string | null
          player_id?: string | null
          registration_date?: string | null
          registration_id?: string | null
          status?: string | null
          trial_id?: string | null
          updated_at?: string | null
          utm_id?: string | null
        }
        Relationships: []
      }
      selectors: {
        Row: {
          age: number
          availability: string[]
          city_state: string
          contact_number: string
          created_at: string
          declaration_accepted: boolean
          document_url: string | null
          email: string
          full_name: string
          highest_level_played: string
          id: string
          preferred_region: string
          previously_worked_as_selector: string
          status: string | null
          years_of_experience: string
        }
        Insert: {
          age: number
          availability: string[]
          city_state: string
          contact_number: string
          created_at?: string
          declaration_accepted?: boolean
          document_url?: string | null
          email: string
          full_name: string
          highest_level_played: string
          id?: string
          preferred_region: string
          previously_worked_as_selector: string
          status?: string | null
          years_of_experience: string
        }
        Update: {
          age?: number
          availability?: string[]
          city_state?: string
          contact_number?: string
          created_at?: string
          declaration_accepted?: boolean
          document_url?: string | null
          email?: string
          full_name?: string
          highest_level_played?: string
          id?: string
          preferred_region?: string
          previously_worked_as_selector?: string
          status?: string | null
          years_of_experience?: string
        }
        Relationships: []
      }
      sspl_qr_channels: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sspl_qr_codes: {
        Row: {
          channel_id: string | null
          code: string
          created_at: string | null
          created_by: string | null
          current_scans: number | null
          description: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_scans: number | null
          tags: string[] | null
          target_url: string
          template_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          channel_id?: string | null
          code: string
          created_at?: string | null
          created_by?: string | null
          current_scans?: number | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_scans?: number | null
          tags?: string[] | null
          target_url: string
          template_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          channel_id?: string | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          current_scans?: number | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_scans?: number | null
          tags?: string[] | null
          target_url?: string
          template_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sspl_qr_scans: {
        Row: {
          id: string
          location: string | null
          qr_code_id: string | null
          scan_duration: number | null
          scanned_at: string | null
          user_agent: string | null
          user_ip: string | null
        }
        Insert: {
          id?: string
          location?: string | null
          qr_code_id?: string | null
          scan_duration?: number | null
          scanned_at?: string | null
          user_agent?: string | null
          user_ip?: string | null
        }
        Update: {
          id?: string
          location?: string | null
          qr_code_id?: string | null
          scan_duration?: number | null
          scanned_at?: string | null
          user_agent?: string | null
          user_ip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sspl_qr_scans_qr_code_id_fkey"
            columns: ["qr_code_id"]
            isOneToOne: false
            referencedRelation: "qr_code_performance"
            referencedColumns: ["qr_id"]
          },
          {
            foreignKeyName: "sspl_qr_scans_qr_code_id_fkey"
            columns: ["qr_code_id"]
            isOneToOne: false
            referencedRelation: "sspl_qr_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      sspl_qr_templates: {
        Row: {
          created_at: string | null
          description: string | null
          design_config: Json | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          design_config?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          design_config?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      teams: {
        Row: {
          city: string | null
          created_at: string | null
          id: string
          payment_amount: number | null
          payment_status: string | null
          primary_contact_email: string | null
          primary_contact_name: string | null
          primary_contact_phone: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          state: string | null
          team_name: string
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          id?: string
          payment_amount?: number | null
          payment_status?: string | null
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          state?: string | null
          team_name: string
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          id?: string
          payment_amount?: number | null
          payment_status?: string | null
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          state?: string | null
          team_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      theme_settings: {
        Row: {
          colors: Json
          created_at: string
          id: string
          is_active: boolean
          theme_name: string
          updated_at: string
        }
        Insert: {
          colors: Json
          created_at?: string
          id?: string
          is_active?: boolean
          theme_name: string
          updated_at?: string
        }
        Update: {
          colors?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          theme_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      tournament_organizers: {
        Row: {
          area_pincode: string | null
          branding_support: string[] | null
          category_other: string | null
          city_district: string
          created_at: string
          current_sponsors: string | null
          delivery_address: string
          delivery_contact_mobile: string
          delivery_contact_name: string
          designation: string | null
          email: string | null
          end_date: string | null
          expected_footfall: string | null
          expected_teams: string | null
          format_other: string | null
          gst_number: string | null
          how_heard: string | null
          id: string
          live_streaming: string | null
          live_streaming_link: string | null
          long_term_collaboration: string | null
          mobile_primary: string
          mobile_secondary: string | null
          organisation_name: string
          organiser_name: string
          preferred_ball_type: string | null
          remarks: string | null
          share_media: string | null
          social_facebook: string | null
          social_instagram: string | null
          social_youtube: string | null
          start_date: string
          state: string
          status: string | null
          total_tournaments: string | null
          tournament_category: string[]
          tournament_format: string
          tournament_type: string
          tournaments_annually: string | null
          venue_address: string | null
          venue_name: string
        }
        Insert: {
          area_pincode?: string | null
          branding_support?: string[] | null
          category_other?: string | null
          city_district: string
          created_at?: string
          current_sponsors?: string | null
          delivery_address: string
          delivery_contact_mobile: string
          delivery_contact_name: string
          designation?: string | null
          email?: string | null
          end_date?: string | null
          expected_footfall?: string | null
          expected_teams?: string | null
          format_other?: string | null
          gst_number?: string | null
          how_heard?: string | null
          id?: string
          live_streaming?: string | null
          live_streaming_link?: string | null
          long_term_collaboration?: string | null
          mobile_primary: string
          mobile_secondary?: string | null
          organisation_name: string
          organiser_name: string
          preferred_ball_type?: string | null
          remarks?: string | null
          share_media?: string | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_youtube?: string | null
          start_date: string
          state: string
          status?: string | null
          total_tournaments?: string | null
          tournament_category: string[]
          tournament_format: string
          tournament_type: string
          tournaments_annually?: string | null
          venue_address?: string | null
          venue_name: string
        }
        Update: {
          area_pincode?: string | null
          branding_support?: string[] | null
          category_other?: string | null
          city_district?: string
          created_at?: string
          current_sponsors?: string | null
          delivery_address?: string
          delivery_contact_mobile?: string
          delivery_contact_name?: string
          designation?: string | null
          email?: string | null
          end_date?: string | null
          expected_footfall?: string | null
          expected_teams?: string | null
          format_other?: string | null
          gst_number?: string | null
          how_heard?: string | null
          id?: string
          live_streaming?: string | null
          live_streaming_link?: string | null
          long_term_collaboration?: string | null
          mobile_primary?: string
          mobile_secondary?: string | null
          organisation_name?: string
          organiser_name?: string
          preferred_ball_type?: string | null
          remarks?: string | null
          share_media?: string | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_youtube?: string | null
          start_date?: string
          state?: string
          status?: string | null
          total_tournaments?: string | null
          tournament_category?: string[]
          tournament_format?: string
          tournament_type?: string
          tournaments_annually?: string | null
          venue_address?: string | null
          venue_name?: string
        }
        Relationships: []
      }
      trial_allocations: {
        Row: {
          allocation_date: string | null
          allocation_id: string
          attendance_status: string | null
          attended_at: string | null
          batting_score: number | null
          bowling_score: number | null
          created_at: string
          evaluated_at: string | null
          evaluator_notes: string | null
          fielding_score: number | null
          overall_score: number | null
          remarks: string | null
          selection_status: string | null
          trial_id: string | null
          workflow_id: string | null
        }
        Insert: {
          allocation_date?: string | null
          allocation_id?: string
          attendance_status?: string | null
          attended_at?: string | null
          batting_score?: number | null
          bowling_score?: number | null
          created_at?: string
          evaluated_at?: string | null
          evaluator_notes?: string | null
          fielding_score?: number | null
          overall_score?: number | null
          remarks?: string | null
          selection_status?: string | null
          trial_id?: string | null
          workflow_id?: string | null
        }
        Update: {
          allocation_date?: string | null
          allocation_id?: string
          attendance_status?: string | null
          attended_at?: string | null
          batting_score?: number | null
          bowling_score?: number | null
          created_at?: string
          evaluated_at?: string | null
          evaluator_notes?: string | null
          fielding_score?: number | null
          overall_score?: number | null
          remarks?: string | null
          selection_status?: string | null
          trial_id?: string | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trial_allocations_trial_id_fkey"
            columns: ["trial_id"]
            isOneToOne: false
            referencedRelation: "trials"
            referencedColumns: ["trial_id"]
          },
          {
            foreignKeyName: "trial_allocations_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "player_workflow"
            referencedColumns: ["workflow_id"]
          },
        ]
      }
      trial_results: {
        Row: {
          allocation_id: string
          batting_score: number | null
          bowling_score: number | null
          created_at: string
          evaluated_at: string | null
          evaluated_by: string | null
          evaluator_notes: string | null
          fielding_score: number | null
          id: string
          overall_score: number | null
          remarks: string | null
          selection_status: string
          updated_at: string
        }
        Insert: {
          allocation_id: string
          batting_score?: number | null
          bowling_score?: number | null
          created_at?: string
          evaluated_at?: string | null
          evaluated_by?: string | null
          evaluator_notes?: string | null
          fielding_score?: number | null
          id?: string
          overall_score?: number | null
          remarks?: string | null
          selection_status?: string
          updated_at?: string
        }
        Update: {
          allocation_id?: string
          batting_score?: number | null
          bowling_score?: number | null
          created_at?: string
          evaluated_at?: string | null
          evaluated_by?: string | null
          evaluator_notes?: string | null
          fielding_score?: number | null
          id?: string
          overall_score?: number | null
          remarks?: string | null
          selection_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      trial_slots: {
        Row: {
          created_at: string | null
          slot_end_time: string | null
          slot_id: string
          slot_name: string
          slot_time: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          slot_end_time?: string | null
          slot_id?: string
          slot_name: string
          slot_time: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          slot_end_time?: string | null
          slot_id?: string
          slot_name?: string
          slot_time?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      trials: {
        Row: {
          center_id: string | null
          created_at: string
          google_map_link: string | null
          slot_id: string | null
          trial_address: string | null
          trial_batch: string | null
          trial_capacity: number | null
          trial_date: string
          trial_id: string
          trial_name: string
          trial_time: string | null
          trial_venue: string
          updated_at: string
        }
        Insert: {
          center_id?: string | null
          created_at?: string
          google_map_link?: string | null
          slot_id?: string | null
          trial_address?: string | null
          trial_batch?: string | null
          trial_capacity?: number | null
          trial_date: string
          trial_id?: string
          trial_name: string
          trial_time?: string | null
          trial_venue: string
          updated_at?: string
        }
        Update: {
          center_id?: string | null
          created_at?: string
          google_map_link?: string | null
          slot_id?: string | null
          trial_address?: string | null
          trial_batch?: string | null
          trial_capacity?: number | null
          trial_date?: string
          trial_id?: string
          trial_name?: string
          trial_time?: string | null
          trial_venue?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trials_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "trials_centers"
            referencedColumns: ["center_id"]
          },
          {
            foreignKeyName: "trials_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "trial_slots"
            referencedColumns: ["slot_id"]
          },
        ]
      }
      trials_allocations: {
        Row: {
          allocation_batch: string | null
          allocation_date: string | null
          allocation_id: string
          allocation_time: string | null
          allocation_venue: string | null
          attendance_status: string | null
          attended_at: string | null
          batting_score: number | null
          bowling_score: number | null
          created_at: string
          evaluated_at: string | null
          evaluator_notes: string | null
          fielding_score: number | null
          overall_score: number | null
          remarks: string | null
          selection_status: string | null
          workflow_id: string | null
        }
        Insert: {
          allocation_batch?: string | null
          allocation_date?: string | null
          allocation_id?: string
          allocation_time?: string | null
          allocation_venue?: string | null
          attendance_status?: string | null
          attended_at?: string | null
          batting_score?: number | null
          bowling_score?: number | null
          created_at?: string
          evaluated_at?: string | null
          evaluator_notes?: string | null
          fielding_score?: number | null
          overall_score?: number | null
          remarks?: string | null
          selection_status?: string | null
          workflow_id?: string | null
        }
        Update: {
          allocation_batch?: string | null
          allocation_date?: string | null
          allocation_id?: string
          allocation_time?: string | null
          allocation_venue?: string | null
          attendance_status?: string | null
          attended_at?: string | null
          batting_score?: number | null
          bowling_score?: number | null
          created_at?: string
          evaluated_at?: string | null
          evaluator_notes?: string | null
          fielding_score?: number | null
          overall_score?: number | null
          remarks?: string | null
          selection_status?: string | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trials_allocations_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "player_workflow"
            referencedColumns: ["workflow_id"]
          },
        ]
      }
      trials_centers: {
        Row: {
          center_address: string | null
          center_id: string
          center_name: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          center_address?: string | null
          center_id?: string
          center_name: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          center_address?: string | null
          center_id?: string
          center_name?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          permissions: Json | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          permissions?: Json | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          permissions?: Json | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      utm_events: {
        Row: {
          created_at: string | null
          event_id: string | null
          event_type: string
          id: number
          metadata: Json | null
          registration_id: string | null
          timestamp: string | null
          utm_campaign: string | null
          utm_id: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          created_at?: string | null
          event_id?: string | null
          event_type: string
          id?: number
          metadata?: Json | null
          registration_id?: string | null
          timestamp?: string | null
          utm_campaign?: string | null
          utm_id?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string | null
          event_type?: string
          id?: number
          metadata?: Json | null
          registration_id?: string | null
          timestamp?: string | null
          utm_campaign?: string | null
          utm_id?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      utm_payment_users: {
        Row: {
          amount: number | null
          created_at: string | null
          email: string | null
          id: string
          phone: string | null
          registration_id: string
          user_name: string | null
          utm_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          email?: string | null
          id?: string
          phone?: string | null
          registration_id: string
          user_name?: string | null
          utm_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          email?: string | null
          id?: string
          phone?: string | null
          registration_id?: string
          user_name?: string | null
          utm_id?: string | null
        }
        Relationships: []
      }
      utm_registrations: {
        Row: {
          city: string
          created_at: string | null
          id: string
          mobile: string
          name: string
          paid: boolean | null
          paid_amount: number | null
          payment_id: string | null
          qr_code_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          city: string
          created_at?: string | null
          id?: string
          mobile: string
          name: string
          paid?: boolean | null
          paid_amount?: number | null
          payment_id?: string | null
          qr_code_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          city?: string
          created_at?: string | null
          id?: string
          mobile?: string
          name?: string
          paid?: boolean | null
          paid_amount?: number | null
          payment_id?: string | null
          qr_code_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_utm_registrations_qr_code"
            columns: ["qr_code_id"]
            isOneToOne: false
            referencedRelation: "qr_code_performance"
            referencedColumns: ["qr_code"]
          },
          {
            foreignKeyName: "fk_utm_registrations_qr_code"
            columns: ["qr_code_id"]
            isOneToOne: false
            referencedRelation: "sspl_qr_codes"
            referencedColumns: ["code"]
          },
        ]
      }
      visitor_leads: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          page_url: string | null
          phone: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          page_url?: string | null
          phone?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          page_url?: string | null
          phone?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          event_id: string
          event_type: string | null
          id: number
          payload: Json | null
          processed_at: string | null
        }
        Insert: {
          event_id: string
          event_type?: string | null
          id?: never
          payload?: Json | null
          processed_at?: string | null
        }
        Update: {
          event_id?: string
          event_type?: string | null
          id?: never
          payload?: Json | null
          processed_at?: string | null
        }
        Relationships: []
      }
      website_content: {
        Row: {
          content: Json
          created_at: string
          id: string
          images: Json | null
          section_name: string
          updated_at: string
        }
        Insert: {
          content: Json
          created_at?: string
          id?: string
          images?: Json | null
          section_name: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          images?: Json | null
          section_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      workflow_history: {
        Row: {
          action_details: Json | null
          action_type: string
          id: string
          ip_address: unknown
          new_stage: string
          performed_at: string
          performed_by: string | null
          previous_stage: string | null
          user_agent: string | null
          workflow_id: string
        }
        Insert: {
          action_details?: Json | null
          action_type: string
          id?: string
          ip_address?: unknown
          new_stage: string
          performed_at?: string
          performed_by?: string | null
          previous_stage?: string | null
          user_agent?: string | null
          workflow_id: string
        }
        Update: {
          action_details?: Json | null
          action_type?: string
          id?: string
          ip_address?: unknown
          new_stage?: string
          performed_at?: string
          performed_by?: string | null
          previous_stage?: string | null
          user_agent?: string | null
          workflow_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      campaign_report: {
        Row: {
          avg_revenue_per_paid_user: number | null
          conversion_rate: number | null
          first_registration_date: string | null
          last_registration_date: string | null
          registrations_from_qr: number | null
          total_paid: number | null
          total_registrations: number | null
          total_revenue: number | null
          unique_qr_codes_used: number | null
          unique_users: number | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Relationships: []
      }
      combined_utm_analytics: {
        Row: {
          date: string | null
          ga4_bounce_rate: number | null
          ga4_conversions: number | null
          ga4_new_users: number | null
          ga4_page_views: number | null
          ga4_revenue: number | null
          ga4_sessions: number | null
          ga4_users: number | null
          internal_paid: number | null
          internal_pending: number | null
          internal_registrations: number | null
          internal_revenue: number | null
          registration_to_payment_rate: number | null
          session_to_registration_rate: number | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Relationships: []
      }
      qr_code_performance: {
        Row: {
          paid_registrations: number | null
          qr_channel: string | null
          qr_code: string | null
          qr_created_at: string | null
          qr_id: string | null
          qr_title: string | null
          registration_to_payment_rate: number | null
          scan_to_registration_rate: number | null
          target_url: string | null
          total_registrations: number | null
          total_revenue: number | null
          total_scans: number | null
          unique_scans: number | null
        }
        Relationships: []
      }
      registration_utm_analytics: {
        Row: {
          city: string | null
          date_of_birth: string | null
          email: string | null
          full_name: string | null
          has_utm_attribution: boolean | null
          is_qr_sourced: boolean | null
          payment_amount: number | null
          payment_status: string | null
          phone: string | null
          position: string | null
          qr_channel: string | null
          qr_code_id: string | null
          qr_target_url: string | null
          qr_title: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          registration_date: string | null
          registration_id: string | null
          revenue: number | null
          state: string | null
          status: string | null
          updated_at: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_id: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Relationships: []
      }
      unified_tracking_report: {
        Row: {
          avg_revenue_per_user: number | null
          conversion_rate: number | null
          desktop_scans: number | null
          first_registration_date: string | null
          first_scan_date: string | null
          last_registration_date: string | null
          last_scan_date: string | null
          mobile_scans: number | null
          qr_channel: string | null
          qr_code_id: string | null
          qr_code_title: string | null
          qr_target_url: string | null
          scan_to_payment_rate: number | null
          scan_to_registration_rate: number | null
          tablet_scans: number | null
          total_paid: number | null
          total_qr_scans: number | null
          total_registrations: number | null
          total_revenue: number | null
          unique_scan_ips: number | null
          unique_users: number | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_utm_registrations_qr_code"
            columns: ["qr_code_id"]
            isOneToOne: false
            referencedRelation: "qr_code_performance"
            referencedColumns: ["qr_code"]
          },
          {
            foreignKeyName: "fk_utm_registrations_qr_code"
            columns: ["qr_code_id"]
            isOneToOne: false
            referencedRelation: "sspl_qr_codes"
            referencedColumns: ["code"]
          },
        ]
      }
      utm_campaign_performance: {
        Row: {
          conversion_rate: number | null
          failed_registrations: number | null
          first_registration: string | null
          last_registration: string | null
          paid_registrations: number | null
          pending_registrations: number | null
          total_registrations: number | null
          total_revenue: number | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Relationships: []
      }
      utm_campaign_report: {
        Row: {
          avg_revenue_per_paid_user: number | null
          conversion_rate: number | null
          first_registration_date: string | null
          last_registration_date: string | null
          registrations_from_qr: number | null
          total_paid: number | null
          total_registrations: number | null
          total_revenue: number | null
          unique_qr_codes_used: number | null
          unique_users: number | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Relationships: []
      }
      utm_paid_users_details: {
        Row: {
          id: string | null
          payment_amount: number | null
          payment_timestamp: string | null
          registration_id: string | null
          user_email: string | null
          user_name: string | null
          user_phone: string | null
          utm_campaign: string | null
          utm_id: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Relationships: []
      }
      utm_summary: {
        Row: {
          last_activity: string | null
          paid_registrations: number | null
          registrations: number | null
          scans: number | null
          total_revenue: number | null
          utm_campaign: string | null
          utm_id: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Relationships: []
      }
      v_admin_player_registrations: {
        Row: {
          city: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          id: string | null
          payment_amount: number | null
          payment_status: string | null
          phone: string | null
          pincode: string | null
          player_name: string | null
          position: string | null
          state: string | null
          status: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_utm_paid_user: {
        Args: {
          p_amount?: number
          p_email?: string
          p_phone?: string
          p_registration_id: string
          p_user_name?: string
        }
        Returns: string
      }
      allocate_to_trials: {
        Args: {
          p_admin_id?: string
          p_allocation_batch?: string
          p_allocation_date: string
          p_allocation_time?: string
          p_allocation_venue?: string
          p_workflow_ids: string[]
        }
        Returns: {
          message: string
          success: boolean
          workflow_id: string
        }[]
      }
      get_all_player_registrations: {
        Args: never
        Returns: {
          id: string
          notes: string
          payment_amount: number
          payment_date: string
          payment_status: string
          phone: string
          player_email: string
          player_name: string
          registration_date: string
          status: string
        }[]
      }
      get_current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_player_registrations: {
        Args: never
        Returns: {
          id: string
          notes: string
          payment_amount: number
          payment_status: string
          phone: string
          player_email: string
          player_name: string
          registration_date: string
          state: string
          status: string
          trial_name: string
        }[]
      }
      get_workflow_dashboard_stats: {
        Args: never
        Returns: {
          absent: number
          attended: number
          completed_payments: number
          emails_pending: number
          emails_sent: number
          in_trials_section: number
          not_selected: number
          pending_payments: number
          selected: number
          total_registrations: number
          trials_allocated: number
          waitlisted: number
        }[]
      }
      has_permission: {
        Args: { required_permission: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      init_player_workflow: {
        Args: { p_registration_id: string }
        Returns: string
      }
      mark_trial_attendance: {
        Args: {
          p_admin_id?: string
          p_allocation_id: string
          p_attendance_status: string
        }
        Returns: boolean
      }
      move_to_trials_section: {
        Args: { p_admin_id?: string; p_registration_ids: string[] }
        Returns: {
          message: string
          registration_id: string
          success: boolean
        }[]
      }
      update_trial_results: {
        Args: {
          p_admin_id?: string
          p_allocation_id: string
          p_batting_score?: number
          p_bowling_score?: number
          p_evaluator_notes?: string
          p_fielding_score?: number
          p_overall_score?: number
          p_remarks?: string
          p_selection_status?: string
        }
        Returns: boolean
      }
      upsert_ga4_analytics: {
        Args: {
          p_avg_session_duration: number
          p_bounce_rate: number
          p_conversions: number
          p_date_range_end: string
          p_date_range_start: string
          p_new_users: number
          p_page_views: number
          p_report_date: string
          p_revenue: number
          p_sessions: number
          p_users: number
          p_utm_campaign: string
          p_utm_content: string
          p_utm_medium: string
          p_utm_source: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
