// เกณฑ์เกรดกลาง (คู่มือคนที่ 3 — "เกณฑ์เกรดที่ใช้คำนวณ GPA")
// ต้องตรงกับที่ Backend (คนที่ 1) ใช้คำนวณ /api/gpa ทุกตัว
export const GRADE_POINTS = {
  A: 4,
  'B+': 3.5,
  B: 3,
  'C+': 2.5,
  C: 2,
  'D+': 1.5,
  D: 1,
  F: 0,
}

export const GRADE_OPTIONS = Object.keys(GRADE_POINTS)

/**
 * คำนวณเกรดเฉลี่ยแบบถ่วงน้ำหนักด้วยหน่วยกิต
 * รับ [{ credit, grade }] ตามชื่อฟิลด์ในข้อกำหนดกลาง
 * คืน { gpa, total_credit } — gpa เป็น null ถ้าไม่มีหน่วยกิตเลย
 */
export function calcGpa(rows) {
  let points = 0
  let total = 0
  for (const r of rows) {
    const credit = Number(r.credit) || 0
    if (credit <= 0 || !(r.grade in GRADE_POINTS)) continue
    points += GRADE_POINTS[r.grade] * credit
    total += credit
  }
  return { gpa: total > 0 ? points / total : null, total_credit: total, points }
}

// แสดงทศนิยม 2 ตำแหน่งแบบปัดเศษ (toFixed) เหมือนตัวอย่างในคู่มือ
export function formatGpa(value) {
  if (value == null || Number.isNaN(Number(value))) return '–'
  return Number(value).toFixed(2)
}

// เรียงภาคการศึกษา '1/2567' < '2/2567' < '1/2568'
export function compareSemester(a, b) {
  const [sa, ya] = a.split('/').map(Number)
  const [sb, yb] = b.split('/').map(Number)
  return ya - yb || sa - sb
}

export function semesterLabel(id) {
  const [sem, year] = id.split('/')
  const name = sem === '3' ? 'ภาคฤดูร้อน' : `ภาคเรียนที่ ${sem}`
  return `${name} ปีการศึกษา ${year}`
}

export function gradeTone(grade) {
  if (grade === 'A' || grade === 'B+') return 'good'
  if (grade === 'B' || grade === 'C+' || grade === 'C') return 'mid'
  return 'low'
}
