// ตรวจว่าเครื่องคำนวณเกรดให้ผลตรงกับเกณฑ์กลาง — รันด้วย `npm test`
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { calcGpa, formatGpa, GRADE_POINTS, compareSemester } from './gpa.js'

test('ค่าคะแนนของแต่ละเกรดตรงกับเกณฑ์กลาง', () => {
  assert.deepEqual(GRADE_POINTS, { A: 4, 'B+': 3.5, B: 3, 'C+': 2.5, C: 2, 'D+': 1.5, D: 1, F: 0 })
})

test('ถ่วงน้ำหนักด้วยหน่วยกิต', () => {
  // (4×3 + 3×2 + 2.5×3) / 8 = 25.5 / 8 = 3.1875
  const r = calcGpa([
    { credit: 3, grade: 'A' },
    { credit: 2, grade: 'B' },
    { credit: 3, grade: 'C+' },
  ])
  assert.equal(r.total_credit, 8)
  assert.equal(r.gpa, 3.1875)
  assert.equal(formatGpa(r.gpa), '3.19')
})

test('F นับหน่วยกิตและได้ 0 คะแนน', () => {
  const r = calcGpa([
    { credit: 3, grade: 'A' },
    { credit: 3, grade: 'F' },
  ])
  assert.equal(r.total_credit, 6)
  assert.equal(r.gpa, 2)
})

test('หน่วยกิตเป็นข้อความจากช่องกรอกก็คำนวณได้ และแถวที่หน่วยกิตว่างไม่นับ', () => {
  const r = calcGpa([
    { credit: '3', grade: 'B+' },
    { credit: '', grade: 'A' },
  ])
  assert.equal(r.total_credit, 3)
  assert.equal(r.gpa, 3.5)
})

test('ไม่มีวิชาเลยได้ null และแสดงเป็นขีด', () => {
  const r = calcGpa([])
  assert.equal(r.gpa, null)
  assert.equal(formatGpa(r.gpa), '–')
})

test('เรียงภาคการศึกษาตามปีก่อน แล้วตามภาค', () => {
  assert.deepEqual(['1/2568', '2/2567', '1/2567'].sort(compareSemester), ['1/2567', '2/2567', '1/2568'])
})
