// Auto-generated types stub for HRiSENSE
// Run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/types/database.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: { id: string; parent_id: string | null; org_code: string; name_th: string; name_en: string | null; abbreviation_th: string | null; level: string; is_active: boolean; hierarchy_path: string | null; created_at: string }
        Insert: { id?: string; parent_id?: string | null; org_code: string; name_th: string }
        Update: { id?: string; name_th?: string }
      }
      personnel: {
        Row: { id: string; citizen_id: string; prefix_th: string | null; first_name_th: string; last_name_th: string; birth_date: string; retirement_date: string | null; organization_id: string; current_position_id: string | null; status: string; salary: number | null; salary_step: number | null; education_level: string | null; degree_name: string | null; university: string | null; major: string | null; email: string | null; mobile: string | null; gender: string | null; retirement_years_remaining: number | null; overall_risk_score: number | null; risk_level: string | null; created_at: string }
        Insert: { id?: string; citizen_id: string; first_name_th: string; last_name_th: string; birth_date: string; organization_id: string; status?: string }
        Update: { id?: string; first_name_th?: string; last_name_th?: string; status?: string; salary?: number | null; organization_id?: string; current_position_id?: string | null }
      }
      positions: {
        Row: { id: string; position_code: string; name_th: string; name_en: string | null; organization_id: string; position_type_id: string | null; position_level_id: string | null; position_family_id: string | null; quota: number; current_occupancy: number; vacancy_count: number; is_critical: boolean; is_active: boolean; created_at: string }
        Insert: { id?: string; position_code: string; name_th: string; organization_id: string; quota?: number }
        Update: { id?: string; name_th?: string; quota?: number; is_active?: boolean }
      }
      personnel_risk_scores: {
        Row: { id: string; personnel_id: string; retirement_risk: number; transfer_risk: number; talent_loss_risk: number; vacancy_risk: number; succession_risk: number; burnout_risk: number | null; overall_score: number; risk_level: string; computed_at: string }
      }
      organization_risk_summary: {
        Row: { id: string; organization_id: string; total_personnel: number; total_quota: number; vacancy_count: number; vacancy_rate: number; retirements_1yr: number; retirements_3yr: number; retirements_5yr: number; overall_risk_score: number; risk_level: string; snapshot_date: string }
      }
      alerts: {
        Row: { id: string; alert_rule_id: string | null; severity: string; title: string; message: string; organization_id: string | null; personnel_id: string | null; status: string; created_at: string }
      }
      profiles: {
        Row: { id: string; role: string; department_id: string | null; first_name_th: string | null; last_name_th: string | null; language: string; created_at: string }
      }
    }
    Views: {
      v_personnel_overview: { Row: { id: string; citizen_id: string; employee_number: string | null; prefix_th: string | null; first_name_th: string; last_name_th: string; full_name_th: string; prefix_en: string | null; first_name_en: string | null; last_name_en: string | null; full_name_en: string | null; birth_date: string; birth_date_be: string | null; government_start_date: string | null; position_appointment_date: string | null; retirement_date: string | null; retirement_years_remaining: number | null; organization_id: string; organization_name: string; org_abbreviation: string | null; org_level: string; parent_org_id: string | null; current_position_id: string | null; position_name: string | null; position_code: string | null; is_critical_position: boolean | null; position_type: string | null; position_type_code: string | null; position_level: string | null; c_level: string | null; position_family: string | null; salary: number | null; salary_step: number | null; education_level: string | null; degree_name: string | null; university: string | null; major: string | null; email: string | null; mobile: string | null; status: string; gender: string | null; overall_risk_score: number | null; risk_level: string | null; retirement_risk: number | null; transfer_risk: number | null; talent_loss_risk: number | null; vacancy_risk: number | null; succession_risk: number | null; burnout_risk: number | null; burnout_factors: Json | null } }
      v_org_dashboard: { Row: { organization_id: string; org_code: string; name_th: string; abbreviation_th: string | null; level: string; total_personnel: number; total_quota: number; vacancy_count: number; vacancy_rate: number; overall_risk_score: number; risk_level: string; retirements_1yr: number; retirements_3yr: number; retirements_5yr: number } }
      v_retirement_timeline: { Row: { personnel_id: string; employee_number: string | null; full_name_th: string; birth_date: string; retirement_date: string | null; retirement_years_remaining: number | null; organization_id: string; organization_name: string; position_name: string | null; position_level: string | null; is_critical_position: boolean; retirement_bucket: string; has_ready_successor: boolean } }
      v_vacancy_analysis: { Row: { position_id: string; position_code: string; position_name: string; organization_id: string; organization_name: string; position_type: string | null; position_level: string | null; quota: number; current_occupancy: number; vacancy_count: number; vacancy_rate_pct: number; is_critical: boolean; has_succession_plan: boolean } }
      v_high_risk_personnel: { Row: { id: string; employee_number: string | null; full_name_th: string; organization_name: string; position_name: string | null; position_level: string | null; overall_risk_score: number; risk_level: string; retirement_risk: number | null; retirement_years_remaining: number | null; retirement_date: string | null; is_critical_position: boolean; primary_risk_driver: string } }
      v_active_alerts: { Row: { id: string; severity: string; title: string; message: string; status: string; organization_id: string | null; organization_name: string | null; personnel_id: string | null; personnel_name: string | null; created_at: string; age_hours: number } }
      v_workforce_composition: { Row: { organization_id: string; organization_name: string; exec_count: number; director_count: number; academic_count: number; general_count: number; male_count: number; female_count: number; near_retirement_count: number; mid_career_count: number; early_career_count: number; total_active: number } }
    }
    Functions: {
      calculate_personnel_risk_score: { Args: { p_personnel_id: string }; Returns: Json }
      calculate_org_risk_summary: { Args: { p_org_id: string }; Returns: void }
      forecast_retirements: { Args: { p_org_id?: string; p_years_ahead?: number }; Returns: { org_name: string; position_title: string; personnel_name: string; retirement_date: string; years_remaining: number; is_critical: boolean }[] }
      get_vacancy_rate: { Args: { p_org_id?: string }; Returns: { org_name: string; total_positions: number; filled: number; vacant: number; vacancy_rate: number }[] }
    }
  }
}
