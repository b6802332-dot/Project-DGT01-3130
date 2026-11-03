// ตารางเทียบค่า day จาก API (MON … SUN) เป็นชื่อวันภาษาไทย — id ใช้เรียงลำดับ จันทร์ = 1
export const DAYS = [
  { code: 'MON', id: 1, short: 'จ.', long: 'จันทร์' },
  { code: 'TUE', id: 2, short: 'อ.', long: 'อังคาร' },
  { code: 'WED', id: 3, short: 'พ.', long: 'พุธ' },
  { code: 'THU', id: 4, short: 'พฤ.', long: 'พฤหัสบดี' },
  { code: 'FRI', id: 5, short: 'ศ.', long: 'ศุกร์' },
  { code: 'SAT', id: 6, short: 'ส.', long: 'เสาร์' },
  { code: 'SUN', id: 7, short: 'อา.', long: 'อาทิตย์' },
]

const BY_CODE = Object.fromEntries(DAYS.map((d) => [d.code, d]))

// 'MON' → { id: 1, long: 'จันทร์', … } — ไม่รู้จักค่าก็คืน undefined
export function dayFromCode(code) {
  return BY_CODE[String(code ?? '').toUpperCase()]
}

export function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

// วันในสัปดาห์แบบ 1 = จันทร์ … 7 = อาทิตย์
export function isoWeekday(date = new Date()) {
  return ((date.getDay() + 6) % 7) + 1
}

// '2026-11-16' → Date เวลาเที่ยงคืนตามเวลาท้องถิ่น (กันวันเลื่อนจาก timezone)
export function parseDate(ymd) {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function startOfToday() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

export function daysUntil(ymd) {
  return Math.round((parseDate(ymd) - startOfToday()) / 86_400_000)
}

const longFmt = new Intl.DateTimeFormat('th-TH', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})
const shortFmt = new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short' })

export const formatDateLong = (ymd) => longFmt.format(parseDate(ymd))
export const formatDateShort = (ymd) => shortFmt.format(parseDate(ymd))

export function overlaps(a, b) {
  return toMinutes(a.start) < toMinutes(b.end) && toMinutes(b.start) < toMinutes(a.end)
}

// สีประจำรายวิชา คำนวณจากรหัสวิชา ให้วิชาเดียวกันได้สีเดิมทุกหน้า
const HUES = [214, 192, 236, 204, 250, 182, 224, 262] // โทนน้ำเงิน–ฟ้า–คราม ให้เข้ากับธีม
export function courseHue(code) {
  let h = 0
  for (const ch of code) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return HUES[h % HUES.length]
}

export function countdownText(days) {
  if (days === 0) return 'วันนี้'
  if (days === 1) return 'พรุ่งนี้'
  if (days > 1) return `อีก ${days} วัน`
  return 'สอบแล้ว'
}
