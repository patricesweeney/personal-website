// Auto-generated types from Supabase
// Run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      jobs: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          status: 'pending' | 'running' | 'done' | 'error'
          job_type: string
          input_file_path: string | null
          result: Json | null
          error_message: string | null
          progress: number | null
          column_config: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          status?: 'pending' | 'running' | 'done' | 'error'
          job_type: string
          input_file_path?: string | null
          result?: Json | null
          error_message?: string | null
          progress?: number | null
          column_config?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          status?: 'pending' | 'running' | 'done' | 'error'
          job_type?: string
          input_file_path?: string | null
          result?: Json | null
          error_message?: string | null
          progress?: number | null
          column_config?: Json | null
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
