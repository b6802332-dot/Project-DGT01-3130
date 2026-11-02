import { useState } from 'react'
import Icon from './Icon.jsx'
import { Card } from './ui.jsx'
import { calcGpa, formatGpa, GRADE_OPTIONS, GRADE_POINTS } from '../lib/gpa.js'

let nextId = 1
const newRow = () => ({ id: nextId++, name: '', credit: 3, grade: 'A' })

/**
 * เครื่องคำนวณเกรดทดลองในเบราว์เซอร์ (คู่มือคนที่ 3 ขั้นที่ 4)
 * ใช้เกณฑ์เกรดชุดเดียวกับข้อกำหนดกลางผ่าน calcGpa() ใน lib/gpa.js
 * base — ผลการเรียนเดิม { gpa, total_credit, points } ใช้คาดการณ์ GPAX ถ้าได้เกรดตามที่กรอก
 */
export default function GpaCalculator({ base }) {
  const [rows, setRows] = useState(() => [newRow()])
  const [withBase, setWithBase] = useState(true)

  const update = (id, patch) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  const remove = (id) => setRows((rs) => rs.filter((r) => r.id !== id))
  const add = () => setRows((rs) => [...rs, newRow()])
  const reset = () => setRows([newRow()])

  const result = calcGpa(rows)
  const hasBase = base && base.total_credit > 0
  const projected =
    hasBase && withBase && result.total_credit > 0
      ? (base.points + result.points) / (base.total_credit + result.total_credit)
      : null
  const delta = projected != null ? projected - base.gpa : null

  return (
    <Card title="ทดลองคำนวณเกรด" className="calc">
      <p className="muted small">เพิ่มวิชา ใส่หน่วยกิตและเกรดที่คาดว่าจะได้ ระบบคำนวณให้ทันที</p>

      <div className="calc-rows">
        <div className="calc-row calc-row-head" aria-hidden="true">
          <span>วิชา (ไม่บังคับ)</span>
          <span>นก.</span>
          <span>เกรด</span>
          <span />
        </div>
        {rows.length === 0 && <p className="empty small">ยังไม่มีวิชา กด "เพิ่มวิชา" เพื่อเริ่ม</p>}
        {rows.map((r, i) => (
          <div className="calc-row" key={r.id}>
            <input
              className="input"
              value={r.name}
              placeholder={`วิชาที่ ${i + 1}`}
              aria-label={`ชื่อวิชาที่ ${i + 1}`}
              onChange={(e) => update(r.id, { name: e.target.value })}
            />
            <input
              className="input num"
              type="number"
              min="1"
              max="12"
              value={r.credit}
              aria-label={`หน่วยกิตวิชาที่ ${i + 1}`}
              onChange={(e) => update(r.id, { credit: e.target.value })}
            />
            <select
              className="input"
              value={r.grade}
              aria-label={`เกรดวิชาที่ ${i + 1}`}
              onChange={(e) => update(r.id, { grade: e.target.value })}
            >
              {GRADE_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  {g} ({GRADE_POINTS[g]})
                </option>
              ))}
            </select>
            <button type="button" className="icon-btn" onClick={() => remove(r.id)} aria-label={`ลบวิชาที่ ${i + 1}`}>
              <Icon name="x" size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="calc-actions">
        <button type="button" className="btn btn-ghost" onClick={add}>
          <Icon name="plus" size={16} /> เพิ่มวิชา
        </button>
        <button type="button" className="btn btn-link" onClick={reset}>
          ล้าง
        </button>
      </div>

      <div className="calc-result" aria-live="polite">
        <div>
          <span className="stat-label">เกรดเฉลี่ยของวิชาที่กรอก</span>
          <span className="calc-big">{result.total_credit ? formatGpa(result.gpa) : '0.00'}</span>
          <span className="stat-hint">{result.total_credit} หน่วยกิต</span>
        </div>
        {hasBase && (
          <div>
            <span className="stat-label">GPAX ที่คาดว่าจะได้</span>
            <span className="calc-big">{withBase ? formatGpa(projected) : '–'}</span>
            {delta != null && Math.abs(delta) >= 0.005 && (
              <span className={`delta ${delta >= 0 ? 'up' : 'down'}`}>
                {delta >= 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(2)} จาก {formatGpa(base.gpa)}
              </span>
            )}
          </div>
        )}
      </div>

      {hasBase && (
        <label className="check">
          <input type="checkbox" checked={withBase} onChange={(e) => setWithBase(e.target.checked)} />
          รวมกับผลการเรียนเดิม ({base.total_credit} หน่วยกิต, GPAX {formatGpa(base.gpa)})
        </label>
      )}
      <p className="muted small">
        เกณฑ์: A=4 · B+=3.5 · B=3 · C+=2.5 · C=2 · D+=1.5 · D=1 · F=0 ถ่วงน้ำหนักด้วยหน่วยกิต
      </p>
    </Card>
  )
}
