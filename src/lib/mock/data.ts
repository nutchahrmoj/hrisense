// Mock data for local testing
// Shapes mirror the views defined in supabase/migrations/013_views.sql & 016_additional_views.sql.
// Derived mocks (org dashboard, risk distribution, etc.) compute from mockPersonnel/mockVacancyAnalysis
// so values stay internally consistent.

export const mockOrganizations = [
  { id: 'org-1',  parent_id: null,    org_code: '00',    name_th: 'กระทรวงยุติธรรม', abbreviation_th: 'ยธ.', level: 'ministry' },
  { id: 'org-2',  parent_id: 'org-1', org_code: '01',    name_th: 'สำนักงานปลัดกระทรวงยุติธรรม', abbreviation_th: 'สป.ยธ.', level: 'department' },
  { id: 'org-3',  parent_id: 'org-2', org_code: '01.01', name_th: 'กองกลาง', abbreviation_th: 'กก.', level: 'division' },
  { id: 'org-4',  parent_id: 'org-2', org_code: '01.02', name_th: 'กองบริหารทรัพยากรบุคคล', abbreviation_th: 'กบค.', level: 'division' },
  { id: 'org-5',  parent_id: 'org-2', org_code: '01.03', name_th: 'กองบริหารการคลัง', abbreviation_th: 'กบค.', level: 'division' },
  { id: 'org-6',  parent_id: 'org-2', org_code: '01.04', name_th: 'กองการต่างประเทศ', abbreviation_th: 'กตท.', level: 'division' },
  { id: 'org-7',  parent_id: 'org-2', org_code: '01.05', name_th: 'กองออกแบบและก่อสร้าง', abbreviation_th: 'กอศ.', level: 'division' },
  { id: 'org-8',  parent_id: 'org-2', org_code: '01.06', name_th: 'ศูนย์เทคโนโลยีสารสนเทศและการสื่อสาร', abbreviation_th: 'ศทส.', level: 'division' },
  { id: 'org-9',  parent_id: 'org-2', org_code: '01.07', name_th: 'กองกฎหมาย', abbreviation_th: 'กกด.', level: 'division' },
  { id: 'org-10', parent_id: 'org-2', org_code: '01.08', name_th: 'กองยุทธศาสตร์และแผนงาน', abbreviation_th: 'กยผ.', level: 'division' },
  { id: 'org-11', parent_id: 'org-2', org_code: '01.09', name_th: 'สถาบันพัฒนาบุคลากรกระทรวงยุติธรรม', abbreviation_th: 'สบย.', level: 'division' },
  { id: 'org-12', parent_id: 'org-2', org_code: '01.10', name_th: 'กลุ่มตรวจสอบภายใน', abbreviation_th: 'กตภ.', level: 'division' },
  { id: 'org-13', parent_id: 'org-2', org_code: '01.11', name_th: 'กลุ่มพัฒนาระบบบริหารกระทรวงยุติธรรม', abbreviation_th: 'กพบ.', level: 'division' },
  { id: 'org-14', parent_id: 'org-2', org_code: '01.12', name_th: 'สำนักผู้ตรวจราชการกระทรวงยุติธรรม', abbreviation_th: 'สบย.', level: 'division' },
  { id: 'org-15', parent_id: 'org-2', org_code: '01.13', name_th: 'กองพัฒนานวัตกรรมการยุติธรรม', abbreviation_th: 'กพน.', level: 'division' },
  { id: 'org-16', parent_id: 'org-2', org_code: '01.14', name_th: 'ศูนย์ปฏิบัติการต่อต้านการทุจริต', abbreviation_th: 'ศปท.', level: 'division' },
  { id: 'org-17', parent_id: 'org-2', org_code: '01.15', name_th: 'ศูนย์บริการร่วมกระทรวงยุติธรรม', abbreviation_th: 'ศบร.', level: 'division' },
  { id: 'org-18', parent_id: 'org-2', org_code: '01.16', name_th: 'สำนักงานกองทุนยุติธรรม', abbreviation_th: 'สกย.', level: 'division' },
  { id: 'org-19', parent_id: 'org-2', org_code: '01.17', name_th: 'กองประสานราชการยุติธรรมจังหวัด', abbreviation_th: 'กปย.', level: 'division' },
]

// ---------------------------------------------------------------------------
// Personnel generator — deterministic (seeded PRNG) so values are stable across
// requests. Produces 290 records (p-11..p-300) across 17 divisions, plus 10
// hand-authored seed records = 300 total. Mixed across risk levels
// (ปกติ/เฝ้าระวัง/เสี่ยงสูง/วิกฤต) and risk drivers including burnout.
// The first 10 records (p-1..p-10) are hand-authored and preserved because
// alerts / IDP / succession mocks reference them by id and name.
// ---------------------------------------------------------------------------

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rng = mulberry32(20260618)
const rand = (min: number, max: number) => min + rng() * (max - min)
const randInt = (min: number, max: number) => Math.floor(rand(min, max + 1))
const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)]
const round2g = (n: number) => Math.round(n * 100) / 100
const pad = (n: number, len: number) => String(n).padStart(len, '0')
const isoDate = (year: number, month: number, day: number) => `${year}-${pad(month, 2)}-${pad(day, 2)}`

const maleFirst = ['สมชาย','วิชัย','ประเสริฐ','ธนกฤต','อนุชา','พิชัย','กิตติ','สุรชัย','อดิศร','ภาคิน','ณรงค์','ชัยชนะ','วุฒิชัย','ปิยะ','ธีรภัทร','เอกชัย','นิกร','สมศักดิ์','วิทูร','ประวิทย์','ชาตรี','อำนาจ','สุวิทย์','บุญมี','วิเชียร','อรรค','ทวี','ยุทธนา','สันติ','ก้อง','ปุณยวุฒิ','ธนภัทร','ศุภชัย','อภิชัย','รังสรรค์','นพดล','ภูมิ','ฐิติพงศ์','กฤษณะ']
const femaleFirst = ['สมหญิง','พิมพ์ใจ','สุดา','กัญญา','ปวีณา','จันทร์เพ็ญ','รัชดา','นภา','อรุณี','สายฝน','พรพรรณ','มาลี','วรรณี','สมศรี','ลดา','ศิริพร','อัจฉรา','จิราภรณ์','ปิยะดา','นันทิดา','ชนิกานต์','ปวันรัตน์','สุภาวดี','อรพรรณ','กานต์','ดวงใจ','พิศมัย','ราตรี','สมฤดี','อุษา','ทิพย์','มัทนา','พัชรา','จันทรา','อำพร','สุชาดา','วราภรณ์','นิรมล','เกษรา','อิงอร']
const lastNames = ['ใจดี','รักงาน','มั่นคง','ดีเลิศ','ยิ่งยง','ศรีสุข','อนันตวิเชียร','รักชาติ','พัฒน์ดี','สุขสำราญ','ทองคำ','แก้วใส','พงศ์พรหม','ศรีเจริญ','มีสุข','อยู่สบาย','วงศ์ไพศาล','บุญมา','รัตนพงศ์','เกิดเทศ','ตั้งใจ','กองการ','สิริสุวรรณ','วัฒนานุกูล','ชยุติ','เทียนทอง','นาคสุวรรณ','บุญรอด','เจริญสุข','ทวีทรัพย์','อินทราชัย','จันทร์สมบูรณ์','ศรีอุดม','พูลทรัพย์','วรกานต์','สมบัติ','ชาติเจริญ','รอดเกิด','จริยธรรม','แสงทอง','งามรัตน์','บุญส่ง','พิทักษ์','อ่อนน้อม','สวัสดิ์','ตั้งตรงจิต','วานิช','จันทร์เพ็ญ','ศิริเกษม']

type DivType = 'admin' | 'legal' | 'it' | 'policy' | 'finance' | 'hr' | 'audit' | 'service' | 'data' | 'review' | 'technical'
const divConfig: Record<string, { type: DivType; positions: { name: string; level: string; type: string }[] }> = {
  'org-3':  { type: 'admin',   positions: [
    { name: 'นักบริหารงานทั่วไปเชี่ยวชาญ', level: 'เชี่ยวชาญ', type: 'บริหาร' },
    { name: 'นักบริหารงานทั่วไปชำนาญการพิเศษ', level: 'ชำนาญการพิเศษ', type: 'บริหาร' },
    { name: 'นักบริหารงานทั่วไปชำนาญการ', level: 'ชำนาญการ', type: 'บริหาร' },
    { name: 'เจ้าหน้าที่ธุรการ', level: 'ปฏิบัติการ', type: 'ทั่วไป' },
    { name: 'พนักงานขับรถยนต์', level: 'ปฏิบัติการ', type: 'ทั่วไป' },
  ]},
  'org-4':  { type: 'hr',      positions: [
    { name: 'นักทรัพยากรบุคคลเชี่ยวชาญ', level: 'เชี่ยวชาญ', type: 'วิชาการ' },
    { name: 'นักทรัพยากรบุคคลชำนาญการพิเศษ', level: 'ชำนาญการพิเศษ', type: 'วิชาการ' },
    { name: 'นักทรัพยากรบุคคลชำนาญการ', level: 'ชำนาญการ', type: 'วิชาการ' },
    { name: 'นักบริหารงานบุคคลชำนาญการ', level: 'ชำนาญการ', type: 'บริหาร' },
    { name: 'นักบริหารงานบุคคล', level: 'ปฏิบัติการ', type: 'บริหาร' },
  ]},
  'org-5':  { type: 'finance', positions: [
    { name: 'นักวิชาการเงินและบัญชีเชี่ยวชาญ', level: 'เชี่ยวชาญ', type: 'วิชาการ' },
    { name: 'นักวิชาการเงินและบัญชีชำนาญการพิเศษ', level: 'ชำนาญการพิเศษ', type: 'วิชาการ' },
    { name: 'นักวิชาการเงินและบัญชีชำนาญการ', level: 'ชำนาญการ', type: 'วิชาการ' },
    { name: 'นักบัญชีชำนาญการ', level: 'ชำนาญการ', type: 'วิชาการ' },
    { name: 'เจ้าหน้าที่การเงิน', level: 'ปฏิบัติการ', type: 'บริหาร' },
  ]},
  'org-6':  { type: 'legal',   positions: [
    { name: 'นักการต่างประเทศเชี่ยวชาญ', level: 'เชี่ยวชาญ', type: 'วิชาการ' },
    { name: 'นักการต่างประเทศชำนาญการพิเศษ', level: 'ชำนาญการพิเศษ', type: 'วิชาการ' },
    { name: 'นักการต่างประเทศชำนาญการ', level: 'ชำนาญการ', type: 'วิชาการ' },
    { name: 'ล่ามแปลภาษาชำนาญการ', level: 'ชำนาญการ', type: 'วิชาการ' },
    { name: 'เจ้าหน้าที่ประสานงานต่างประเทศ', level: 'ปฏิบัติการ', type: 'บริหาร' },
  ]},
  'org-7':  { type: 'technical', positions: [
    { name: 'วิศวกรโยธาเชี่ยวชาญ', level: 'เชี่ยวชาญ', type: 'วิชาการ' },
    { name: 'วิศวกรโยธาชำนาญการพิเศษ', level: 'ชำนาญการพิเศษ', type: 'วิชาการ' },
    { name: 'นายช่างเขียนแบบชำนาญการ', level: 'ชำนาญการ', type: 'วิชาการ' },
    { name: 'นายช่างโยธาชำนาญการ', level: 'ชำนาญการ', type: 'วิชาการ' },
    { name: 'ช่างเขียนแบบ', level: 'ปฏิบัติการ', type: 'วิชาการ' },
  ]},
  'org-8':  { type: 'it',      positions: [
    { name: 'นักวิชาการคอมพิวเตอร์เชี่ยวชาญ', level: 'เชี่ยวชาญ', type: 'วิชาการ' },
    { name: 'นักวิชาการคอมพิวเตอร์ชำนาญการพิเศษ', level: 'ชำนาญการพิเศษ', type: 'วิชาการ' },
    { name: 'นักวิชาการคอมพิวเตอร์ชำนาญการ', level: 'ชำนาญการ', type: 'วิชาการ' },
    { name: 'นักวิเคราะห์ระบบชำนาญการ', level: 'ชำนาญการ', type: 'วิชาการ' },
    { name: 'นักเทคโนโลยีสารสนเทศ', level: 'ปฏิบัติการ', type: 'วิชาการ' },
  ]},
  'org-9':  { type: 'legal',   positions: [
    { name: 'นิติกรเชี่ยวชาญ', level: 'เชี่ยวชาญ', type: 'วิชาการ' },
    { name: 'นิติกรชำนาญการพิเศษ', level: 'ชำนาญการพิเศษ', type: 'วิชาการ' },
    { name: 'นิติกรชำนาญการ', level: 'ชำนาญการ', type: 'วิชาการ' },
    { name: 'นักกฎหมายชำนาญการ', level: 'ชำนาญการ', type: 'วิชาการ' },
    { name: 'นักกฎหมาย', level: 'ปฏิบัติการ', type: 'วิชาการ' },
  ]},
  'org-10': { type: 'policy',  positions: [
    { name: 'นักวิเคราะห์นโยบายและแผนเชี่ยวชาญ', level: 'เชี่ยวชาญ', type: 'วิชาการ' },
    { name: 'นักวิเคราะห์นโยบายและแผนชำนาญการพิเศษ', level: 'ชำนาญการพิเศษ', type: 'วิชาการ' },
    { name: 'นักวิเคราะห์นโยบายและแผนชำนาญการ', level: 'ชำนาญการ', type: 'วิชาการ' },
    { name: 'นักบริหารงานแผนชำนาญการ', level: 'ชำนาญการ', type: 'บริหาร' },
    { name: 'นักบริหารงานแผน', level: 'ปฏิบัติการ', type: 'บริหาร' },
  ]},
  'org-11': { type: 'hr',      positions: [
    { name: 'นักพัฒนาบุคลากรเชี่ยวชาญ', level: 'เชี่ยวชาญ', type: 'วิชาการ' },
    { name: 'นักพัฒนาบุคลากรชำนาญการพิเศษ', level: 'ชำนาญการพิเศษ', type: 'วิชาการ' },
    { name: 'นักพัฒนาบุคลากรชำนาญการ', level: 'ชำนาญการ', type: 'วิชาการ' },
    { name: 'นักบริหารงานพัฒนาบุคลากร', level: 'ปฏิบัติการ', type: 'บริหาร' },
    { name: 'เจ้าหน้าที่พัฒนาบุคลากร', level: 'ปฏิบัติการ', type: 'บริหาร' },
  ]},
  'org-12': { type: 'audit',   positions: [
    { name: 'นักตรวจสอบภายในเชี่ยวชาญ', level: 'เชี่ยวชาญ', type: 'วิชาการ' },
    { name: 'นักตรวจสอบภายในชำนาญการพิเศษ', level: 'ชำนาญการพิเศษ', type: 'วิชาการ' },
    { name: 'นักตรวจสอบภายในชำนาญการ', level: 'ชำนาญการ', type: 'วิชาการ' },
    { name: 'นักวิชาการตรวจสอบชำนาญการ', level: 'ชำนาญการ', type: 'วิชาการ' },
    { name: 'นักวิชาการตรวจสอบ', level: 'ปฏิบัติการ', type: 'วิชาการ' },
  ]},
  'org-13': { type: 'admin',   positions: [
    { name: 'นักบริหารงานทั่วไปเชี่ยวชาญ', level: 'เชี่ยวชาญ', type: 'บริหาร' },
    { name: 'นักบริหารงานทั่วไปชำนาญการพิเศษ', level: 'ชำนาญการพิเศษ', type: 'บริหาร' },
    { name: 'นักวิเคราะห์นโยบายและแผนชำนาญการ', level: 'ชำนาญการ', type: 'วิชาการ' },
    { name: 'นักบริหารงานแผน', level: 'ปฏิบัติการ', type: 'บริหาร' },
    { name: 'เจ้าหน้าที่บริหารงานทั่วไป', level: 'ปฏิบัติการ', type: 'บริหาร' },
  ]},
  'org-14': { type: 'review',  positions: [
    { name: 'ผู้ตรวจราชการกระทรวงยุติธรรม', level: 'เชี่ยวชาญ', type: 'บริหาร' },
    { name: 'นักตรวจสอบชำนาญการพิเศษ', level: 'ชำนาญการพิเศษ', type: 'วิชาการ' },
    { name: 'นักตรวจสอบชำนาญการ', level: 'ชำนาญการ', type: 'วิชาการ' },
    { name: 'นักวิชาการตรวจสอบภายในชำนาญการ', level: 'ชำนาญการ', type: 'วิชาการ' },
    { name: 'เจ้าหน้าที่ตรวจสอบ', level: 'ปฏิบัติการ', type: 'วิชาการ' },
  ]},
  'org-15': { type: 'it',      positions: [
    { name: 'นักพัฒนานวัตกรรมเชี่ยวชาญ', level: 'เชี่ยวชาญ', type: 'วิชาการ' },
    { name: 'นักพัฒนานวัตกรรมชำนาญการพิเศษ', level: 'ชำนาญการพิเศษ', type: 'วิชาการ' },
    { name: 'นักวิจัยชำนาญการ', level: 'ชำนาญการ', type: 'วิชาการ' },
    { name: 'นักพัฒนานวัตกรรม', level: 'ปฏิบัติการ', type: 'วิชาการ' },
    { name: 'เจ้าหน้าที่วิจัย', level: 'ปฏิบัติการ', type: 'วิชาการ' },
  ]},
  'org-16': { type: 'legal',   positions: [
    { name: 'นักสืบสวนสอบสวนเชี่ยวชาญ', level: 'เชี่ยวชาญ', type: 'วิชาการ' },
    { name: 'นักสืบสวนสอบสวนชำนาญการพิเศษ', level: 'ชำนาญการพิเศษ', type: 'วิชาการ' },
    { name: 'นักกฎหมายชำนาญการ', level: 'ชำนาญการ', type: 'วิชาการ' },
    { name: 'นักสืบสวนสอบสวน', level: 'ปฏิบัติการ', type: 'วิชาการ' },
    { name: 'เจ้าหน้าที่ป้องกันและปราบปรามการทุจริต', level: 'ปฏิบัติการ', type: 'บริหาร' },
  ]},
  'org-17': { type: 'service', positions: [
    { name: 'นักบริหารงานทั่วไปชำนาญการพิเศษ', level: 'ชำนาญการพิเศษ', type: 'บริหาร' },
    { name: 'นักบริหารงานทั่วไปชำนาญการ', level: 'ชำนาญการ', type: 'บริหาร' },
    { name: 'เจ้าหน้าที่บริการประชาชน', level: 'ปฏิบัติการ', type: 'บริหาร' },
    { name: 'พนักงานต้อนรับ', level: 'ปฏิบัติการ', type: 'ทั่วไป' },
    { name: 'เจ้าหน้าที่ประชาสัมพันธ์', level: 'ปฏิบัติการ', type: 'บริหาร' },
  ]},
  'org-18': { type: 'finance', positions: [
    { name: 'นักบริหารกองทุนเชี่ยวชาญ', level: 'เชี่ยวชาญ', type: 'วิชาการ' },
    { name: 'นักวิเคราะห์นโยบายและแผนชำนาญการพิเศษ', level: 'ชำนาญการพิเศษ', type: 'วิชาการ' },
    { name: 'นักวิเคราะห์นโยบายและแผนชำนาญการ', level: 'ชำนาญการ', type: 'วิชาการ' },
    { name: 'นักบริหารกองทุน', level: 'ปฏิบัติการ', type: 'วิชาการ' },
    { name: 'เจ้าหน้าที่บริหารกองทุน', level: 'ปฏิบัติการ', type: 'บริหาร' },
  ]},
  'org-19': { type: 'admin',   positions: [
    { name: 'นักบริหารงานทั่วไปเชี่ยวชาญ', level: 'เชี่ยวชาญ', type: 'บริหาร' },
    { name: 'นักบริหารงานทั่วไปชำนาญการพิเศษ', level: 'ชำนาญการพิเศษ', type: 'บริหาร' },
    { name: 'นักประสานงานชำนาญการ', level: 'ชำนาญการ', type: 'บริหาร' },
    { name: 'นักบริหารงานทั่วไป', level: 'ปฏิบัติการ', type: 'บริหาร' },
    { name: 'เจ้าหน้าที่ประสานงาน', level: 'ปฏิบัติการ', type: 'บริหาร' },
  ]},
}

const salaryByLevel: Record<string, [number, number]> = {
  'เชี่ยวชาญ': [52000, 72000],
  'ชำนาญการพิเศษ': [38000, 52000],
  'ชำนาญการ': [28000, 42000],
  'ปฏิบัติการ': [18000, 30000],
}
const eduLevels = ['bachelors', 'bachelors', 'bachelors', 'masters', 'masters', 'doctorate'] as const
const eduDegree: Record<string, string> = { bachelors: 'ศิลปศาสตรบัณฑิต', masters: 'วิทยาศาสตรมหาบัณฑิต', doctorate: 'ปรัชญาดุษฎีบัณฑิต' }

function riskLevelFromScore(score: number): 'green' | 'amber' | 'red' | 'critical' {
  if (score > 80) return 'critical'
  if (score > 60) return 'red'
  if (score > 40) return 'amber'
  return 'green'
}

// ---------------------------------------------------------------------------
// Burnout risk — computed from behavioral/performance inputs, NOT random.
// Inputs (per person, year-to-date):
//   late_days_ytd       การมาสาย (วัน)
//   absent_days_ytd     การขาดงาน (วัน)
//   performance_score   ผลการประเมินล่าสุด (0-100, ต่ำ = เสี่ยงสูง)
//   overtime_hours_ytd  ล่วงเวลา (ชม.)
//   training_hours_ytd  การฝึกอบรมพัฒนา (ชม., ปัจจัยป้องกัน — มาก = เสี่ยงลด)
//   workload_index      ภาระงาน (0-100, สูง = เสี่ยงสูง)
// Formula: weighted blend, each input normalized to 0-100.
//   burnout = late·0.15 + absent·0.15 + (100-perf)·0.20 + ot·0.20
//             + (100-training)·0.10 + workload·0.20
// Transparent & explainable so the detail page can show the breakdown.
// ---------------------------------------------------------------------------
const clamp01 = (n: number) => Math.max(0, Math.min(1, n))
const norm = (v: number, max: number) => clamp01(v / max) * 100

interface BurnoutInputs {
  late_days_ytd: number
  absent_days_ytd: number
  performance_score: number
  overtime_hours_ytd: number
  training_hours_ytd: number
  workload_index: number
}

function computeBurnout(b: BurnoutInputs): number {
  const lateNorm = norm(b.late_days_ytd, 20)            // 0-20 วัน → 0-100
  const absentNorm = norm(b.absent_days_ytd, 15)        // 0-15 วัน → 0-100
  const perfRisk = 100 - b.performance_score            // ผลประเมินต่ำ → เสี่ยงสูง
  const otNorm = norm(b.overtime_hours_ytd, 240)        // 0-240 ชม. → 0-100
  const trainingProtect = 100 - norm(b.training_hours_ytd, 40) // ฝึกอบรมมาก → เสี่ยงลด
  const workload = b.workload_index                     // 0-100 ตรงๆ
  const score =
    lateNorm * 0.15 +
    absentNorm * 0.15 +
    perfRisk * 0.20 +
    otNorm * 0.20 +
    trainingProtect * 0.10 +
    workload * 0.20
  return round2g(Math.max(0, Math.min(100, score)))
}

const divHeadcount: Record<string, number> = {
  // รวม generated 290 + seed 10 = 300 อัตรา
  'org-3': 18, 'org-4': 22, 'org-5': 18, 'org-6': 16, 'org-7': 16,
  'org-8': 22, 'org-9': 17, 'org-10': 20, 'org-11': 20, 'org-12': 15,
  'org-13': 15, 'org-14': 17, 'org-15': 15, 'org-16': 14, 'org-17': 14,
  'org-18': 14, 'org-19': 17,
}

const todayMs = new Date().getTime()

function generatePersonnel() {
  const out: any[] = []
  let empIdx = 11
  let citizenIdx = 1100100000011
  for (const orgId of Object.keys(divHeadcount)) {
    const cfg = divConfig[orgId]
    const org = mockOrganizations.find(o => o.id === orgId)!
    const count = divHeadcount[orgId]
    for (let i = 0; i < count; i++) {
      const id = `p-${empIdx}`
      const gender = rng() < 0.52 ? 'male' : 'female'
      const prefix = gender === 'male' ? 'นาย' : rng() < 0.5 ? 'นาง' : 'นางสาว'
      const firstName = gender === 'male' ? pick(maleFirst) : pick(femaleFirst)
      const lastName = pick(lastNames)
      const birthYear = randInt(1965, 2000)
      const birthMonth = randInt(1, 12)
      const birthDay = randInt(1, 28)
      const birthDate = isoDate(birthYear, birthMonth, birthDay)
      const retYear = birthYear + 60
      // อายุราชการสิ้นสุดวันที่ 30 กันยายน ของปีเกษียณ (ตามระเบียบราชการ)
      const retirementDate = isoDate(retYear, 9, 30)
      const yearsRemaining = round2g((new Date(retirementDate).getTime() - todayMs) / (365.25 * 86400000))
      const pos = pick(cfg.positions)
      const salRange = salaryByLevel[pos.level]
      const salary = Math.round(rand(salRange[0], salRange[1]) / 100) * 100
      const edu = pick(eduLevels as unknown as string[])

      let retirementRisk: number
      if (yearsRemaining <= 1) retirementRisk = rand(82, 96)
      else if (yearsRemaining <= 3) retirementRisk = rand(60, 82)
      else if (yearsRemaining <= 5) retirementRisk = rand(40, 62)
      else if (yearsRemaining <= 10) retirementRisk = rand(18, 42)
      else retirementRisk = rand(5, 24)

      const transferRisk = rng() < 0.20 ? rand(48, 72) : rand(8, 34)
      const talentLossRisk = rng() < 0.25 ? rand(50, 78) : rand(10, 38)

      // Burnout inputs — behavioral/performance data YTD. ~18% are pushed into
      // the high-burnout band via elevated OT + workload + low training.
      const burnoutProne = rng() < 0.18
      const burnoutInputs: BurnoutInputs = {
        late_days_ytd: burnoutProne ? randInt(6, 18) : randInt(0, 6),
        absent_days_ytd: burnoutProne ? randInt(4, 12) : randInt(0, 4),
        performance_score: burnoutProne ? rand(55, 72) : rand(72, 95),
        overtime_hours_ytd: burnoutProne ? rand(120, 280) : rand(0, 90),
        training_hours_ytd: burnoutProne ? rand(0, 12) : rand(12, 48),
        workload_index: burnoutProne ? rand(65, 95) : rand(30, 70),
      }
      const burnoutRisk = computeBurnout(burnoutInputs)

      const overall = round2g(
        retirementRisk * 0.35 + transferRisk * 0.20 + talentLossRisk * 0.20 + burnoutRisk * 0.25,
      )
      const riskLevel = riskLevelFromScore(overall)

      out.push({
        id,
        employee_number: `EMP${pad(empIdx, 3)}`,
        citizen_id: String(citizenIdx),
        prefix_th: prefix,
        first_name_th: firstName,
        last_name_th: lastName,
        full_name_th: `${prefix}${firstName} ${lastName}`,
        birth_date: birthDate,
        retirement_date: retirementDate,
        retirement_years_remaining: yearsRemaining,
        organization_id: orgId,
        organization_name: org.name_th,
        position_name: pos.name,
        position_type: pos.type,
        position_level: pos.level,
        salary,
        status: 'active',
        gender,
        education_level: edu,
        degree_name: eduDegree[edu],
        overall_risk_score: overall,
        risk_level: riskLevel,
        retirement_risk: round2g(retirementRisk),
        transfer_risk: round2g(transferRisk),
        talent_loss_risk: round2g(talentLossRisk),
        burnout_risk: burnoutRisk,
        burnout_factors: burnoutInputs,
      })
      empIdx++
      citizenIdx++
    }
  }
  return out
}

const seedPersonnel = [
  { id: 'p-1', full_name_th: 'นายสมชาย ใจดี', birth_date: '1967-03-15', retirement_date: '2027-09-30', retirement_years_remaining: 1.3, organization_id: 'org-4', organization_name: 'กองบริหารทรัพยากรบุคคล', position_name: 'นิติกรเชี่ยวชาญ', position_type: 'วิชาการ', position_level: 'เชี่ยวชาญ', salary: 55000, status: 'active', gender: 'male', overall_risk_score: 85, risk_level: 'red', retirement_risk: 95, transfer_risk: 20, talent_loss_risk: 70, burnout_risk: 62, burnout_factors: { late_days_ytd: 12, absent_days_ytd: 6, performance_score: 68, overtime_hours_ytd: 180, training_hours_ytd: 8, workload_index: 88 }, employee_number: 'EMP001', citizen_id: '1100100000001', education_level: 'masters', degree_name: 'วิทยาศาสตรมหาบัณฑิต' },
  { id: 'p-2', full_name_th: 'นางสมหญิง รักงาน', birth_date: '1968-07-22', retirement_date: '2028-09-30', retirement_years_remaining: 2.3, organization_id: 'org-4', organization_name: 'กองบริหารทรัพยากรบุคคล', position_name: 'นิติกรชำนาญการพิเศษ', position_type: 'วิชาการ', position_level: 'ชำนาญการพิเศษ', salary: 42000, status: 'active', gender: 'female', overall_risk_score: 72, risk_level: 'red', retirement_risk: 80, transfer_risk: 15, talent_loss_risk: 65, burnout_risk: 48, burnout_factors: { late_days_ytd: 7, absent_days_ytd: 3, performance_score: 75, overtime_hours_ytd: 120, training_hours_ytd: 12, workload_index: 72 }, employee_number: 'EMP002', citizen_id: '1100100000002', education_level: 'bachelors', degree_name: 'ศิลปศาสตรบัณฑิต' },
  { id: 'p-3', full_name_th: 'นายวิชัย มั่นคง', birth_date: '1970-01-10', retirement_date: '2030-09-30', retirement_years_remaining: 4.3, organization_id: 'org-4', organization_name: 'กองบริหารทรัพยากรบุคคล', position_name: 'นิติกรชำนาญการพิเศษ', position_type: 'วิชาการ', position_level: 'ชำนาญการพิเศษ', salary: 38000, status: 'active', gender: 'male', overall_risk_score: 55, risk_level: 'amber', retirement_risk: 65, transfer_risk: 25, talent_loss_risk: 50, burnout_risk: 32, burnout_factors: { late_days_ytd: 5, absent_days_ytd: 2, performance_score: 80, overtime_hours_ytd: 80, training_hours_ytd: 32, workload_index: 60 }, employee_number: 'EMP003', citizen_id: '1100100000003', education_level: 'masters', degree_name: 'วิทยาศาสตรมหาบัณฑิต' },
  { id: 'p-4', full_name_th: 'นางสาวพิมพ์ใจ ดีเลิศ', birth_date: '1971-05-18', retirement_date: '2031-09-30', retirement_years_remaining: 5.3, organization_id: 'org-4', organization_name: 'กองบริหารทรัพยากรบุคคล', position_name: 'นักวิชาการเงินและบัญชี', position_type: 'วิชาการ', position_level: 'ชำนาญการ', salary: 30000, status: 'active', gender: 'female', overall_risk_score: 42, risk_level: 'amber', retirement_risk: 55, transfer_risk: 20, talent_loss_risk: 45, burnout_risk: 26, burnout_factors: { late_days_ytd: 3, absent_days_ytd: 1, performance_score: 82, overtime_hours_ytd: 40, training_hours_ytd: 24, workload_index: 50 }, employee_number: 'EMP004', citizen_id: '1100100000004', education_level: 'bachelors', degree_name: 'ศิลปศาสตรบัณฑิต' },
  { id: 'p-5', full_name_th: 'นายประเสริฐ ยิ่งยง', birth_date: '1972-11-03', retirement_date: '2032-09-30', retirement_years_remaining: 6.3, organization_id: 'org-8', organization_name: 'ศูนย์เทคโนโลยีสารสนเทศและการสื่อสาร', position_name: 'นักวิชาการคอมพิวเตอร์ชำนาญการพิเศษ', position_type: 'วิชาการ', position_level: 'ชำนาญการพิเศษ', salary: 40000, status: 'active', gender: 'male', overall_risk_score: 48, risk_level: 'amber', retirement_risk: 50, transfer_risk: 30, talent_loss_risk: 55, burnout_risk: 56, burnout_factors: { late_days_ytd: 9, absent_days_ytd: 5, performance_score: 70, overtime_hours_ytd: 160, training_hours_ytd: 48, workload_index: 78 }, employee_number: 'EMP005', citizen_id: '1100100000005', education_level: 'masters', degree_name: 'วิทยาศาสตรมหาบัณฑิต' },
  { id: 'p-6', full_name_th: 'นางสุดา ศรีสุข', birth_date: '1973-08-25', retirement_date: '2033-09-30', retirement_years_remaining: 7.3, organization_id: 'org-4', organization_name: 'กองบริหารทรัพยากรบุคคล', position_name: 'นักทรัพยากรบุคคลชำนาญการพิเศษ', position_type: 'วิชาการ', position_level: 'ชำนาญการพิเศษ', salary: 38000, status: 'active', gender: 'female', overall_risk_score: 35, risk_level: 'amber', retirement_risk: 45, transfer_risk: 15, talent_loss_risk: 40, burnout_risk: 22, burnout_factors: { late_days_ytd: 2, absent_days_ytd: 1, performance_score: 85, overtime_hours_ytd: 30, training_hours_ytd: 20, workload_index: 45 }, employee_number: 'EMP006', citizen_id: '1100100000006', education_level: 'masters', degree_name: 'วิทยาศาสตรมหาบัณฑิต' },
  { id: 'p-7', full_name_th: 'นางสาวณัชชา อนันตวิเชียร', birth_date: '1985-02-14', retirement_date: '2045-09-30', retirement_years_remaining: 19.3, organization_id: 'org-4', organization_name: 'กองบริหารทรัพยากรบุคคล', position_name: 'นักทรัพยากรบุคคลชำนาญการ', position_type: 'วิชาการ', position_level: 'ชำนาญการ', salary: 35000, status: 'active', gender: 'female', overall_risk_score: 28, risk_level: 'green', retirement_risk: 15, transfer_risk: 20, talent_loss_risk: 35, burnout_risk: 18, burnout_factors: { late_days_ytd: 1, absent_days_ytd: 0, performance_score: 90, overtime_hours_ytd: 20, training_hours_ytd: 44, workload_index: 38 }, employee_number: 'EMP007', citizen_id: '1100100000007', education_level: 'bachelors', degree_name: 'ศิลปศาสตรบัณฑิต' },
  { id: 'p-8', full_name_th: 'นายอนุชา รักชาติ', birth_date: '1983-06-30', retirement_date: '2043-09-30', retirement_years_remaining: 17.3, organization_id: 'org-4', organization_name: 'กองบริหารทรัพยากรบุคคล', position_name: 'นิติกรชำนาญการ', position_type: 'วิชาการ', position_level: 'ชำนาญการ', salary: 28000, status: 'active', gender: 'male', overall_risk_score: 22, risk_level: 'green', retirement_risk: 18, transfer_risk: 15, talent_loss_risk: 28, burnout_risk: 20, burnout_factors: { late_days_ytd: 2, absent_days_ytd: 1, performance_score: 88, overtime_hours_ytd: 25, training_hours_ytd: 28, workload_index: 42 }, employee_number: 'EMP008', citizen_id: '1100100000008', education_level: 'bachelors', degree_name: 'ศิลปศาสตรบัณฑิต' },
  { id: 'p-9', full_name_th: 'นางสาวกัญญา พัฒน์ดี', birth_date: '1988-09-12', retirement_date: '2048-09-30', retirement_years_remaining: 22.3, organization_id: 'org-8', organization_name: 'ศูนย์เทคโนโลยีสารสนเทศและการสื่อสาร', position_name: 'นักวิชาการคอมพิวเตอร์ชำนาญการ', position_type: 'วิชาการ', position_level: 'ชำนาญการ', salary: 25000, status: 'active', gender: 'female', overall_risk_score: 18, risk_level: 'green', retirement_risk: 10, transfer_risk: 12, talent_loss_risk: 25, burnout_risk: 24, burnout_factors: { late_days_ytd: 3, absent_days_ytd: 2, performance_score: 84, overtime_hours_ytd: 50, training_hours_ytd: 16, workload_index: 48 }, employee_number: 'EMP009', citizen_id: '1100100000009', education_level: 'bachelors', degree_name: 'ศิลปศาสตรบัณฑิต' },
  { id: 'p-10', full_name_th: 'นายธนกฤต สุขสำราญ', birth_date: '1980-04-05', retirement_date: '2040-09-30', retirement_years_remaining: 14.3, organization_id: 'org-4', organization_name: 'กองบริหารทรัพยากรบุคคล', position_name: 'นักวิเคราะห์นโยบายและแผน', position_type: 'วิชาการ', position_level: 'ชำนาญการ', salary: 26000, status: 'active', gender: 'male', overall_risk_score: 25, risk_level: 'amber', retirement_risk: 20, transfer_risk: 18, talent_loss_risk: 30, burnout_risk: 38, burnout_factors: { late_days_ytd: 4, absent_days_ytd: 2, performance_score: 78, overtime_hours_ytd: 60, training_hours_ytd: 16, workload_index: 58 }, employee_number: 'EMP010', citizen_id: '1100100000010', education_level: 'bachelors', degree_name: 'ศิลปศาสตรบัณฑิต' },
]

// Recompute burnout_risk for seed personnel from their behavioral inputs so the
// formula is the single source of truth (the hand-set burnout_risk above is
// overwritten — kept only as a fallback shape).
for (const p of seedPersonnel) {
  if (p.burnout_factors) p.burnout_risk = computeBurnout(p.burnout_factors as BurnoutInputs)
}

export const mockPersonnel = [...seedPersonnel, ...generatePersonnel()]

const activePersonnel = mockPersonnel.filter(p => p.status === 'active')
const round2 = (n: number) => Math.round(n * 100) / 100

export const mockRetirementTimeline = mockPersonnel.map(p => ({
  personnel_id: p.id, employee_number: p.employee_number, full_name_th: p.full_name_th,
  birth_date: p.birth_date, retirement_date: p.retirement_date,
  retirement_years_remaining: p.retirement_years_remaining,
  organization_id: p.organization_id, organization_name: p.organization_name,
  position_name: p.position_name, position_level: p.position_level,
  is_critical_position: p.salary > 40000,
  retirement_bucket: p.retirement_years_remaining <= 1 ? 'within_1_year' : p.retirement_years_remaining <= 3 ? 'within_3_years' : p.retirement_years_remaining <= 5 ? 'within_5_years' : 'over_5_years',
  has_ready_successor: p.id === 'p-1' || p.id === 'p-2',
}))

// v_vacancy_analysis — positions + quota for every division. Quota per division
// is sized to roughly match its headcount so the fill-rate KPI stays sane.
const positionCodeSeq: Record<string, number> = {}
function nextPosCode(orgId: string) {
  positionCodeSeq[orgId] = (positionCodeSeq[orgId] || 0) + 1
  const org = mockOrganizations.find(o => o.id === orgId)!
  const abbr = org.abbreviation_th.replace(/\./g, '')
  return `${abbr}-${pad(positionCodeSeq[orgId], 3)}`
}

function buildVacancyAnalysis() {
  const out: any[] = []
  let posIdx = 7
  const quotaPattern = [8, 7, 6, 5, 4]
  for (const orgId of Object.keys(divConfig)) {
    const cfg = divConfig[orgId]
    const org = mockOrganizations.find(o => o.id === orgId)!
    cfg.positions.forEach((pos, i) => {
      const quota = quotaPattern[i]
      const vacancy = rng() < 0.45 ? randInt(1, 2) : 0
      const occupancy = quota - vacancy
      const isCritical = i < 2
      const hasSuccession = isCritical ? rng() < 0.5 : rng() < 0.3
      out.push({
        position_id: `pos-${posIdx}`,
        position_code: nextPosCode(orgId),
        position_name: pos.name,
        organization_id: orgId,
        organization_name: org.name_th,
        position_type: pos.type,
        position_level: pos.level,
        quota,
        current_occupancy: occupancy,
        vacancy_count: vacancy,
        vacancy_rate_pct: round2g((vacancy / quota) * 100),
        is_critical: isCritical,
        has_succession_plan: hasSuccession,
      })
      posIdx++
    })
  }
  return out
}

const seedVacancy = [
  { position_id: 'pos-1', position_code: 'LEG-EX-001', position_name: 'นิติกรเชี่ยวชาญ', organization_id: 'org-4', organization_name: 'กองบริหารทรัพยากรบุคคล', position_type: 'วิชาการ', position_level: 'เชี่ยวชาญ', quota: 1, current_occupancy: 1, vacancy_count: 0, vacancy_rate_pct: 0, is_critical: true, has_succession_plan: true },
  { position_id: 'pos-2', position_code: 'LEG-SP-001', position_name: 'นิติกรชำนาญการพิเศษ', organization_id: 'org-4', organization_name: 'กองบริหารทรัพยากรบุคคล', position_type: 'วิชาการ', position_level: 'ชำนาญการพิเศษ', quota: 2, current_occupancy: 2, vacancy_count: 0, vacancy_rate_pct: 0, is_critical: true, has_succession_plan: true },
  { position_id: 'pos-3', position_code: 'COM-SP-001', position_name: 'นักวิชาการคอมพิวเตอร์ชำนาญการพิเศษ', organization_id: 'org-8', organization_name: 'ศูนย์เทคโนโลยีสารสนเทศและการสื่อสาร', position_type: 'วิชาการ', position_level: 'ชำนาญการพิเศษ', quota: 2, current_occupancy: 1, vacancy_count: 1, vacancy_rate_pct: 50, is_critical: true, has_succession_plan: false },
  { position_id: 'pos-4', position_code: 'COM-PR-001', position_name: 'นักวิชาการคอมพิวเตอร์ชำนาญการ', organization_id: 'org-8', organization_name: 'ศูนย์เทคโนโลยีสารสนเทศและการสื่อสาร', position_type: 'วิชาการ', position_level: 'ชำนาญการ', quota: 2, current_occupancy: 1, vacancy_count: 1, vacancy_rate_pct: 50, is_critical: false, has_succession_plan: false },
  { position_id: 'pos-5', position_code: 'GEN-SP-001', position_name: 'นักทรัพยากรบุคคลชำนาญการพิเศษ', organization_id: 'org-4', organization_name: 'กองบริหารทรัพยากรบุคคล', position_type: 'วิชาการ', position_level: 'ชำนาญการพิเศษ', quota: 1, current_occupancy: 1, vacancy_count: 0, vacancy_rate_pct: 0, is_critical: true, has_succession_plan: true },
  { position_id: 'pos-6', position_code: 'LEG-EX-002', position_name: 'นิติกรเชี่ยวชาญ (สำรอง)', organization_id: 'org-4', organization_name: 'กองบริหารทรัพยากรบุคคล', position_type: 'วิชาการ', position_level: 'เชี่ยวชาญ', quota: 1, current_occupancy: 0, vacancy_count: 1, vacancy_rate_pct: 100, is_critical: true, has_succession_plan: false },
]

export const mockVacancyAnalysis = [...seedVacancy, ...buildVacancyAnalysis()]

export const mockOrgDashboard = mockOrganizations
  .filter(o => o.level === 'division')
  .map(org => {
    const personnel = mockPersonnel.filter(p => p.organization_id === org.id)
    const positions = mockVacancyAnalysis.filter(v => v.organization_id === org.id)
    const totalQuota = positions.reduce((s, v) => s + v.quota, 0)
    const totalVacant = positions.reduce((s, v) => s + v.vacancy_count, 0)
    const criticalPositions = positions.filter(v => v.is_critical).length
    const avgRisk = personnel.length > 0 ? personnel.reduce((s, p) => s + (p.overall_risk_score || 0), 0) / personnel.length : 0
    let riskLevel = 'green'
    if (avgRisk >= 75) riskLevel = 'critical'
    else if (avgRisk >= 50) riskLevel = 'red'
    else if (avgRisk >= 25) riskLevel = 'amber'
    return {
      organization_id: org.id, org_code: org.org_code, name_th: org.name_th,
      abbreviation_th: org.abbreviation_th, level: org.level, org_level: org.level,
      parent_id: org.parent_id, parent_org_name: mockOrganizations.find(o => o.id === org.parent_id)?.name_th || '',
      total_personnel: personnel.length, total_quota: totalQuota,
      vacancy_count: totalVacant, vacancy_rate: totalQuota > 0 ? (totalVacant / totalQuota) * 100 : 0,
      overall_risk_score: round2(avgRisk), risk_level: riskLevel,
      avg_retirement_risk: round2(personnel.reduce((s, p) => s + (p.retirement_risk || 0), 0) / (personnel.length || 1)),
      avg_transfer_risk: round2(personnel.reduce((s, p) => s + (p.transfer_risk || 0), 0) / (personnel.length || 1)),
      avg_talent_risk: round2(personnel.reduce((s, p) => s + (p.talent_loss_risk || 0), 0) / (personnel.length || 1)),
      retirements_1yr: personnel.filter(p => (p.retirement_years_remaining || 99) <= 1).length,
      retirements_3yr: personnel.filter(p => (p.retirement_years_remaining || 99) <= 3).length,
      retirements_5yr: personnel.filter(p => (p.retirement_years_remaining || 99) <= 5).length,
      retirement_rate_3yr: personnel.length > 0 ? (personnel.filter(p => (p.retirement_years_remaining || 99) <= 3).length / personnel.length) * 100 : 0,
      critical_positions: criticalPositions,
      positions_without_successor: positions.filter(v => v.is_critical && !v.has_succession_plan).length,
      succession_coverage_rate: criticalPositions > 0 ? (positions.filter(v => v.is_critical && v.has_succession_plan).length / criticalPositions) * 100 : 0,
      snapshot_date: new Date().toISOString().slice(0, 10),
      computed_at: new Date().toISOString(),
    }
  })

// v_high_risk_personnel — view threshold is overall_risk_score >= 25; driver logic matches 013_views.sql
export const mockHighRiskPersonnel = mockPersonnel
  .filter(p => (p.overall_risk_score || 0) >= 25 && p.status === 'active')
  .sort((a, b) => (b.overall_risk_score || 0) - (a.overall_risk_score || 0))
  .map(p => {
    const rr = p.retirement_risk || 0, tr = p.transfer_risk || 0, tl = p.talent_loss_risk || 0, br = (p as any).burnout_risk || 0
    let driver = 'mixed'
    if (rr >= 75) driver = 'retirement'
    else if (tl >= 75) driver = 'talent_loss'
    else if (br >= 70) driver = 'burnout'
    else if (tr >= 75) driver = 'transfer'
    return {
      ...p,
      is_critical_position: p.salary > 40000,
      vacancy_risk: 30,
      succession_risk: 40,
      primary_risk_driver: driver,
    }
  })

export const mockActiveAlerts = [
  { id: 'alert-1', severity: 'critical', title: 'ตำแหน่งสำคัญว่าง', message: 'ไม่มีผู้สืบทอดพร้อม', organization_id: 'org-4', organization_name: 'กองบริหารทรัพยากรบุคคล', personnel_id: null, personnel_name: null, status: 'active', indicator_value: 100, threshold_value: 0, alert_rule_id: 'rule-1', rule_name: 'วิกฤตตำแหน่งสำคัญ', created_at: '2026-06-10T08:00:00', acknowledged_at: null, resolved_at: null, age_hours: 120 },
  { id: 'alert-2', severity: 'warning', title: 'บุคลากรเกษียณภายใน 1 ปี', message: 'นายสมชาย ใจดี จะเกษียณ', organization_id: 'org-4', organization_name: 'กองบริหารทรัพยากรบุคคล', personnel_id: 'p-1', personnel_name: 'นายสมชาย ใจดี', status: 'active', indicator_value: 1.3, threshold_value: 1, alert_rule_id: 'rule-2', rule_name: 'เกษียณใกล้', created_at: '2026-06-12T10:00:00', acknowledged_at: null, resolved_at: null, age_hours: 72 },
  { id: 'alert-3', severity: 'warning', title: 'อัตราการว่างสูงเกิน 30%', message: 'ศูนย์เทคโนโลยีสารสนเทศและการสื่อสาร อัตราว่าง 50%', organization_id: 'org-8', organization_name: 'ศูนย์เทคโนโลยีสารสนเทศและการสื่อสาร', personnel_id: null, personnel_name: null, status: 'active', indicator_value: 50, threshold_value: 30, alert_rule_id: 'rule-3', rule_name: 'อัตราว่างสูง', created_at: '2026-06-13T14:00:00', acknowledged_at: null, resolved_at: null, age_hours: 48 },
]

export const mockWorkforceComposition = mockOrganizations
  .filter(o => o.level === 'division')
  .map(org => {
    const personnel = mockPersonnel.filter(p => p.organization_id === org.id && p.status === 'active')
    return {
      organization_id: org.id, organization_name: org.name_th,
      exec_count: 0, director_count: 0,
      academic_count: personnel.filter(p => p.position_type === 'วิชาการ').length,
      general_count: 0,
      male_count: personnel.filter(p => p.gender === 'male').length,
      female_count: personnel.filter(p => p.gender === 'female').length,
      doctorate_count: personnel.filter((p: any) => (p as any).education_level === 'doctorate').length,
      masters_count: personnel.filter((p: any) => (p as any).education_level === 'masters').length,
      bachelors_count: personnel.filter((p: any) => (p as any).education_level === 'bachelors').length,
      near_retirement_count: personnel.filter(p => (p.retirement_years_remaining || 99) <= 5).length,
      mid_career_count: personnel.filter(p => { const r = p.retirement_years_remaining || 99; return r > 5 && r <= 15 }).length,
      early_career_count: personnel.filter(p => (p.retirement_years_remaining || 99) > 15).length,
      total_active: personnel.length,
    }
  })

// v_risk_distribution — counts personnel with each risk factor >= 50 (matches 016_views.sql)
const pctOf = (count: number, total: number) => total > 0 ? round2((count / total) * 100) : 0
const retirementRiskCount = activePersonnel.filter(p => (p.retirement_risk || 0) >= 50).length
const transferRiskCount = activePersonnel.filter(p => (p.transfer_risk || 0) >= 50).length
const talentLossCount = activePersonnel.filter(p => (p.talent_loss_risk || 0) >= 50).length
const burnoutCount = activePersonnel.filter((p: any) => ((p as any).burnout_risk || 0) >= 50).length
const highRiskCount = activePersonnel.filter(p => (p.overall_risk_score || 0) >= 50).length
export const mockRiskDistribution = [
  { risk_type: 'retirement', risk_type_th: 'เสี่ยงเกษียณ', count: retirementRiskCount, percentage: pctOf(retirementRiskCount, activePersonnel.length) },
  { risk_type: 'transfer', risk_type_th: 'เสี่ยงโอนย้าย', count: transferRiskCount, percentage: pctOf(transferRiskCount, activePersonnel.length) },
  { risk_type: 'talent_loss', risk_type_th: 'เสี่ยงสูญเสียทาเลนท์', count: talentLossCount, percentage: pctOf(talentLossCount, activePersonnel.length) },
  { risk_type: 'burnout', risk_type_th: 'เสี่ยงเหนื่อยล้า (Burnout)', count: burnoutCount, percentage: pctOf(burnoutCount, activePersonnel.length) },
  { risk_type: 'high_risk', risk_type_th: 'เสี่ยงสูงทั้งหมด', count: highRiskCount, percentage: pctOf(highRiskCount, activePersonnel.length) },
]

// v_org_risk_details — per-org averages (matches 016_views.sql)
export const mockOrgRiskDetails = mockOrganizations
  .filter(o => o.level === 'division')
  .map(org => {
    const personnel = mockPersonnel.filter(p => p.organization_id === org.id && p.status === 'active')
    const positions = mockVacancyAnalysis.filter(v => v.organization_id === org.id)
    const avg = (key: 'overall_risk_score' | 'retirement_risk' | 'transfer_risk' | 'talent_loss_risk') => personnel.length > 0 ? round2(personnel.reduce((s, p) => s + ((p[key] as number) || 0), 0) / personnel.length) : 0
    const overall = avg('overall_risk_score')
    let riskLevel = 'green'
    if (overall >= 75) riskLevel = 'critical'
    else if (overall >= 50) riskLevel = 'red'
    else if (overall >= 25) riskLevel = 'amber'
    const totalQuota = positions.reduce((s, v) => s + v.quota, 0)
    const totalVacant = positions.reduce((s, v) => s + v.vacancy_count, 0)
    return {
      organization_id: org.id, organization_name: org.name_th, abbreviation_th: org.abbreviation_th,
      total_personnel: personnel.length,
      overall_risk_score: overall,
      retirement_risk: avg('retirement_risk'),
      transfer_risk: avg('transfer_risk'),
      talent_loss_risk: avg('talent_loss_risk'),
      vacancy_rate: totalQuota > 0 ? round2((totalVacant / totalQuota) * 100) : 0,
      risk_level: riskLevel,
      retiring_1yr: personnel.filter(p => (p.retirement_years_remaining || 99) <= 1).length,
      retiring_3yr: personnel.filter(p => (p.retirement_years_remaining || 99) <= 3).length,
      retiring_5yr: personnel.filter(p => (p.retirement_years_remaining || 99) <= 5).length,
    }
  })

// v_critical_positions — critical, active positions (matches 016_views.sql)
export const mockCriticalPositions = mockVacancyAnalysis
  .filter(v => v.is_critical)
  .map(v => {
    const incumbent = mockPersonnel.find(p => p.organization_id === v.organization_id && p.position_name === v.position_name && p.status === 'active')
    return {
      position_id: v.position_id, position_code: v.position_code, position_name: v.position_name,
      organization_id: v.organization_id, organization_name: v.organization_name,
      position_type: v.position_type, position_level: v.position_level,
      quota: v.quota, current_occupancy: v.current_occupancy, vacancy_count: v.vacancy_count,
      is_critical: v.is_critical,
      incumbent_name: incumbent ? incumbent.full_name_th : 'Vacant',
      has_succession_plan: v.has_succession_plan,
      has_ready_successor: v.has_succession_plan,
    }
  })

// v_succession_candidates — candidates for critical positions (matches 016_views.sql)
export const mockSuccessionCandidates = [
  { candidate_id: 'spc-1', personnel_id: 'p-3', employee_number: 'EMP003', candidate_name: 'นายวิชัย มั่นคง', organization_id: 'org-4', current_organization: 'กองบริหารทรัพยากรบุคคล', current_position: 'นิติกรชำนาญการพิเศษ', succession_plan_id: 'sp-1', target_position_id: 'pos-1', target_position: 'นิติกรเชี่ยวชาญ', target_org_id: 'org-4', target_organization: 'กองบริหารทรัพยากรบุคคล', readiness: 'ready_1_2_years', readiness_score: 72, is_primary: true, assigned_date: '2026-01-15', notes: 'กำลังพัฒนาทักษะเชี่ยวชาญ', readiness_level: 'developing' },
  { candidate_id: 'spc-2', personnel_id: 'p-6', employee_number: 'EMP006', candidate_name: 'นางสุดา ศรีสุข', organization_id: 'org-4', current_organization: 'กองบริหารทรัพยากรบุคคล', current_position: 'นักทรัพยากรบุคคลชำนาญการพิเศษ', succession_plan_id: 'sp-1', target_position_id: 'pos-1', target_position: 'นิติกรเชี่ยวชาญ', target_org_id: 'org-4', target_organization: 'กองบริหารทรัพยากรบุคคล', readiness: 'ready_3_5_years', readiness_score: 45, is_primary: false, assigned_date: '2026-02-01', notes: 'ต้องฝึกอบรมเพิ่ม', readiness_level: 'early_stage' },
  { candidate_id: 'spc-3', personnel_id: 'p-7', employee_number: 'EMP007', candidate_name: 'นางสาวณัชชา อนันตวิเชียร', organization_id: 'org-4', current_organization: 'กองบริหารทรัพยากรบุคคล', current_position: 'นักทรัพยากรบุคคลชำนาญการ', succession_plan_id: 'sp-2', target_position_id: 'pos-2', target_position: 'นิติกรชำนาญการพิเศษ', target_org_id: 'org-4', target_organization: 'กองบริหารทรัพยากรบุคคล', readiness: 'ready_now', readiness_score: 85, is_primary: true, assigned_date: '2026-01-10', notes: 'พร้อมรับตำแหน่ง', readiness_level: 'ready' },
  { candidate_id: 'spc-4', personnel_id: 'p-5', employee_number: 'EMP005', candidate_name: 'นายประเสริฐ ยิ่งยง', organization_id: 'org-8', current_organization: 'ศูนย์เทคโนโลยีสารสนเทศและการสื่อสาร', current_position: 'นักวิชาการคอมพิวเตอร์ชำนาญการพิเศษ', succession_plan_id: 'sp-3', target_position_id: 'pos-3', target_position: 'นักวิชาการคอมพิวเตอร์ชำนาญการพิเศษ', target_org_id: 'org-8', target_organization: 'ศูนย์เทคโนโลยีสารสนเทศและการสื่อสาร', readiness: 'ready_1_2_years', readiness_score: 68, is_primary: true, assigned_date: '2026-03-01', notes: 'พัฒนาทักษะบริหาร', readiness_level: 'developing' },
]

// v_org_vacancy_summary — per-org vacancy totals (matches 016_views.sql)
export const mockOrgVacancySummary = mockOrganizations
  .filter(o => o.level === 'division')
  .map(org => {
    const positions = mockVacancyAnalysis.filter(v => v.organization_id === org.id)
    const totalQuota = positions.reduce((s, v) => s + v.quota, 0)
    const totalFilled = positions.reduce((s, v) => s + v.current_occupancy, 0)
    const totalVacant = positions.reduce((s, v) => s + v.vacancy_count, 0)
    const criticalVacant = positions.filter(v => v.is_critical).reduce((s, v) => s + v.vacancy_count, 0)
    const criticalQuota = positions.filter(v => v.is_critical).reduce((s, v) => s + v.quota, 0)
    return {
      organization_id: org.id, organization_name: org.name_th, abbreviation_th: org.abbreviation_th,
      total_quota: totalQuota, total_filled: totalFilled, vacancy_count: totalVacant,
      vacancy_rate: totalQuota > 0 ? round2((totalVacant / totalQuota) * 100) : 0,
      critical_vacancy_count: criticalVacant, critical_quota: criticalQuota,
      total_positions: positions.length,
      positions_with_vacancy: positions.filter(v => v.vacancy_count > 0).length,
    }
  })

// v_critical_vacancies — critical positions with vacancy_count > 0 (matches 016_views.sql)
export const mockCriticalVacancies = mockVacancyAnalysis
  .filter(v => v.is_critical && v.vacancy_count > 0)
  .map(v => ({
    position_id: v.position_id, position_code: v.position_code, position_name: v.position_name,
    organization_id: v.organization_id, organization_name: v.organization_name,
    position_type: v.position_type, position_level: v.position_level,
    quota: v.quota, current_occupancy: v.current_occupancy, vacancy_count: v.vacancy_count,
    vacancy_rate_pct: v.vacancy_rate_pct, is_critical: v.is_critical,
    vacant_since: '2026-01-01',
    vacancy_impact: v.vacancy_count >= v.quota ? 'critical' : v.vacancy_count >= (v.quota * 0.5) ? 'high' : 'medium',
  }))

// v_recruitment_pipeline — NOT in DB (migration 016 skipped it: recruitment_plans table missing).
// Mock only, so the vacancy page "สถานะการสรรหาและบรรจุ" section renders.
export const mockRecruitmentPipeline = [
  { id: 'rp-1', position_name: 'นิติกรเชี่ยวชาญ (สำรอง)', organization_name: 'กองบริหารทรัพยากรบุคคล', status: 'in_progress', posted_date: '2026-05-01', applicants_count: 12, target_date: '2026-08-30' },
  { id: 'rp-2', position_name: 'นักวิชาการคอมพิวเตอร์ชำนาญการพิเศษ', organization_name: 'ศูนย์เทคโนโลยีสารสนเทศและการสื่อสาร', status: 'in_progress', posted_date: '2026-05-15', applicants_count: 8, target_date: '2026-09-15' },
  { id: 'rp-3', position_name: 'นักวิชาการคอมพิวเตอร์ชำนาญการ', organization_name: 'ศูนย์เทคโนโลยีสารสนเทศและการสื่อสาร', status: 'completed', posted_date: '2026-02-01', applicants_count: 15, target_date: '2026-05-01' },
  { id: 'rp-4', position_name: 'นักวิเคราะห์นโยบายและแผน', organization_name: 'กองบริหารทรัพยากรบุคคล', status: 'pending', posted_date: '2026-06-10', applicants_count: 0, target_date: '2026-12-31' },
]

// v_idp_summary — IDP plans for current BE year (matches 016_views.sql)
const currentBEYear = new Date().getFullYear() + 543
export const mockIdpSummary = [
  { id: 'idp-1', personnel_id: 'p-7', personnel_name: 'นางสาวณัชชา อนันตวิเชียร', employee_number: 'EMP007', organization_id: 'org-4', organization_name: 'กองบริหารทรัพยากรบุคคล', position_name: 'นักทรัพยากรบุคคลชำนาญการ', plan_year: currentBEYear, status: 'in_progress', goal_description: 'พัฒนาสู่ตำแหน่งนิติกรชำนาญการพิเศษ', activities: ['ฝึกอบรมกฎหมาย', 'Mentoring'], target_position: 'นิติกรชำนาญการพิเศษ', created_at: '2026-01-15T09:00:00', updated_at: '2026-06-01T10:00:00', completed_hours: 24, completed_trainings: 3, completion_percentage: 60 },
  { id: 'idp-2', personnel_id: 'p-3', personnel_name: 'นายวิชัย มั่นคง', employee_number: 'EMP003', organization_id: 'org-4', organization_name: 'กองบริหารทรัพยากรบุคคล', position_name: 'นิติกรชำนาญการพิเศษ', plan_year: currentBEYear, status: 'in_progress', goal_description: 'พัฒนาสู่ตำแหน่งนิติกรเชี่ยวชาญ', activities: ['หลักสูตรนิติกรเชี่ยวชาญ', 'KM'], target_position: 'นิติกรเชี่ยวชาญ', created_at: '2026-01-20T09:00:00', updated_at: '2026-06-10T10:00:00', completed_hours: 32, completed_trainings: 4, completion_percentage: 45 },
  { id: 'idp-3', personnel_id: 'p-5', personnel_name: 'นายประเสริฐ ยิ่งยง', employee_number: 'EMP005', organization_id: 'org-8', organization_name: 'ศูนย์เทคโนโลยีสารสนเทศและการสื่อสาร', position_name: 'นักวิชาการคอมพิวเตอร์ชำนาญการพิเศษ', plan_year: currentBEYear, status: 'completed', goal_description: 'พัฒนาทักษะดิจิทัล', activities: ['Cloud Architecture', 'Data Analytics'], target_position: 'นักวิชาการคอมพิวเตอร์เชี่ยวชาญ', created_at: '2025-10-01T09:00:00', updated_at: '2026-05-30T10:00:00', completed_hours: 48, completed_trainings: 6, completion_percentage: 100 },
  { id: 'idp-4', personnel_id: 'p-6', personnel_name: 'นางสุดา ศรีสุข', employee_number: 'EMP006', organization_id: 'org-4', organization_name: 'กองบริหารทรัพยากรบุคคล', position_name: 'นักทรัพยากรบุคคลชำนาญการพิเศษ', plan_year: currentBEYear, status: 'pending', goal_description: 'พัฒนา HR Analytics', activities: [], target_position: 'นักวิเคราะห์ HR', created_at: '2026-06-01T09:00:00', updated_at: '2026-06-01T09:00:00', completed_hours: 0, completed_trainings: 0, completion_percentage: 0 },
  { id: 'idp-5', personnel_id: 'p-9', personnel_name: 'นางสาวกัญญา พัฒน์ดี', employee_number: 'EMP009', organization_id: 'org-8', organization_name: 'ศูนย์เทคโนโลยีสารสนเทศและการสื่อสาร', position_name: 'นักวิชาการคอมพิวเตอร์ชำนาญการ', plan_year: currentBEYear, status: 'in_progress', goal_description: 'พัฒนาสู่ชำนาญการพิเศษ', activities: ['Cybersecurity', 'System Design'], target_position: 'นักวิชาการคอมพิวเตอร์ชำนาญการพิเศษ', created_at: '2026-02-01T09:00:00', updated_at: '2026-06-15T10:00:00', completed_hours: 16, completed_trainings: 2, completion_percentage: 30 },
]

// v_training_records — training detail (matches 016_views.sql)
export const mockTrainingRecords = [
  { id: 'tr-1', personnel_id: 'p-3', personnel_name: 'นายวิชัย มั่นคง', employee_number: 'EMP003', organization_id: 'org-4', organization_name: 'กองบริหารทรัพยากรบุคคล', course_name: 'หลักสูตรนิติกรเชี่ยวชาญ', course_type: 'วิชาการ', provider: 'สถาบันยุติธรรม', start_date: '2026-03-01', end_date: '2026-03-05', training_hours: 32, cost: 15000, status: 'completed', certificate_number: 'CERT-2026-001', notes: 'ผ่านการประเมิน', created_at: '2026-03-06T09:00:00' },
  { id: 'tr-2', personnel_id: 'p-7', personnel_name: 'นางสาวณัชชา อนันตวิเชียร', employee_number: 'EMP007', organization_id: 'org-4', organization_name: 'กองบริหารทรัพยากรบุคคล', course_name: 'HR Management Modernization', course_type: 'บริหาร', provider: 'สำนักงาน ก.พ.', start_date: '2026-04-10', end_date: '2026-04-12', training_hours: 24, cost: 12000, status: 'completed', certificate_number: 'CERT-2026-002', notes: '', created_at: '2026-04-13T09:00:00' },
  { id: 'tr-3', personnel_id: 'p-5', personnel_name: 'นายประเสริฐ ยิ่งยง', employee_number: 'EMP005', organization_id: 'org-8', organization_name: 'ศูนย์เทคโนโลยีสารสนเทศและการสื่อสาร', course_name: 'Cloud Architecture Fundamentals', course_type: 'เทคโนโลยี', provider: 'AWS Thailand', start_date: '2026-02-15', end_date: '2026-02-20', training_hours: 48, cost: 35000, status: 'completed', certificate_number: 'CERT-2026-003', notes: 'ได้รับใบรับรอง', created_at: '2026-02-21T09:00:00' },
  { id: 'tr-4', personnel_id: 'p-9', personnel_name: 'นางสาวกัญญา พัฒน์ดี', employee_number: 'EMP009', organization_id: 'org-8', organization_name: 'ศูนย์เทคโนโลยีสารสนเทศและการสื่อสาร', course_name: 'Cybersecurity Essentials', course_type: 'เทคโนโลยี', provider: 'ETDA', start_date: '2026-05-01', end_date: '2026-05-03', training_hours: 16, cost: 8000, status: 'in_progress', certificate_number: null, notes: 'กำลังดำเนินการ', created_at: '2026-05-04T09:00:00' },
  { id: 'tr-5', personnel_id: 'p-7', personnel_name: 'นางสาวณัชชา อนันตวิเชียร', employee_number: 'EMP007', organization_id: 'org-4', organization_name: 'กองบริหารทรัพยากรบุคคล', course_name: 'Data Analytics for HR', course_type: 'วิชาการ', provider: 'สถาบันพัฒนาข้าราชการ', start_date: '2026-06-01', end_date: '2026-06-05', training_hours: 20, cost: 10000, status: 'in_progress', certificate_number: null, notes: '', created_at: '2026-06-06T09:00:00' },
  { id: 'tr-6', personnel_id: 'p-3', personnel_name: 'นายวิชัย มั่นคง', employee_number: 'EMP003', organization_id: 'org-4', organization_name: 'กองบริหารทรัพยากรบุคคล', course_name: 'Knowledge Management', course_type: 'วิชาการ', provider: 'สถาบันยุติธรรม', start_date: '2026-05-10', end_date: '2026-05-11', training_hours: 12, cost: 5000, status: 'completed', certificate_number: 'CERT-2026-004', notes: '', created_at: '2026-05-12T09:00:00' },
]

// v_high_potential_personnel — Hi-Po with composite potential score (matches 016_views.sql)
export const mockHighPotentialPersonnel = mockPersonnel
  .filter(p => p.status === 'active' && (p.retirement_years_remaining || 0) > 3)
  .map(p => {
    const edu = (p as any).education_level || 'bachelors'
    const eduScore = edu === 'doctorate' ? 100 : edu === 'masters' ? 80 : edu === 'bachelors' ? 60 : 40
    const perf = 70
    const potential = round2(perf * 0.4 + (p.salary || 0) / 1000 * 0.2 + eduScore * 0.2 + (100 - (p.retirement_risk || 50)) * 0.2)
    return {
      id: p.id, employee_number: p.employee_number, full_name_th: p.full_name_th,
      organization_id: p.organization_id, organization_name: p.organization_name,
      position_name: p.position_name, position_level: p.position_level, position_type: p.position_type,
      education_level: edu, degree_name: edu === 'masters' ? 'วิทยาศาสตรมหาบัณฑิต' : 'ศิลปศาสตรบัณฑิต',
      performance_score: perf, potential_score: potential,
      training_hours_ytd: 20,
      high_performer: perf >= 80,
      advanced_education: edu === 'doctorate' || edu === 'masters',
      long_term_potential: (p.retirement_years_remaining || 0) > 5,
    }
  })
  .sort((a, b) => b.potential_score - a.potential_score)
