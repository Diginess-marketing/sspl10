/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string
  readonly VITE_API_URL: string
  readonly VITE_RAZORPAY_KEY_ID: string
  readonly VITE_API_BASE_URL?: string
  readonly VITE_REGISTRATION_FEE?: string
  // 'false' until the cms_items migration is applied to the database in use
  readonly VITE_CMS_ENABLED?: string
  // 'false' until the player_photos migration (player-photos bucket) is applied
  readonly VITE_PLAYER_PHOTO_UPLOAD_ENABLED?: string
  // Google Analytics 4
  readonly VITE_GA4_ID?: string
  readonly VITE_GA_ENABLED?: string
  readonly VITE_GA_DEBUG?: string
  // Legacy GA (deprecated)
  readonly VITE_GA_MEASUREMENT_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
