export const APP_NAME = 'HRiSENSE'
export const APP_NAME_TH = 'ระบบพยากรณ์กำลังคน'
export const MINISTRY_NAME = 'สำนักงานปลัดกระทรวงยุติธรรม'
export const RETIREMENT_AGE = 60

export const RETIREMENT_BUCKETS = [
  { key: 'within_1_year', label: 'ภายใน 1 ปี', color: '#991b1b' },
  { key: 'within_2_years', label: '1-2 ปี', color: '#ef4444' },
  { key: 'within_3_years', label: '2-3 ปี', color: '#f59e0b' },
  { key: 'within_5_years', label: '3-5 ปี', color: '#eab308' },
  { key: 'over_5_years', label: 'มากกว่า 5 ปี', color: '#22c55e' },
] as const

export const POSITION_CATEGORIES_TH = [
  { key: 'exec_count', label: 'บริหาร', color: '#7c3aed' },
  { key: 'director_count', label: 'อำนวยการ', color: '#2563eb' },
  { key: 'academic_count', label: 'วิชาการ', color: '#059669' },
  { key: 'general_count', label: 'ทั่วไป', color: '#6b7280' },
] as const

export const RISK_FACTORS = [
  { key: 'retirement_risk', label: 'เกษียณ', labelEn: 'Retirement' },
  { key: 'transfer_risk', label: 'โอนย้าย', labelEn: 'Transfer' },
  { key: 'talent_loss_risk', label: 'สูญเสียทาเลนท์', labelEn: 'Talent Loss' },
  { key: 'burnout_risk', label: 'เหนื่อยล้า', labelEn: 'Burnout' },
  { key: 'vacancy_risk', label: 'อัตราว่าง', labelEn: 'Vacancy' },
  { key: 'succession_risk', label: 'สืบทอด', labelEn: 'Succession' },
] as const
