import { useEffect, useMemo } from 'react'
import { useApi } from '../hooks/useApi.js'
import { AsyncView, Card, GradeBadge, PageHeader, Stat } from '../components/ui.jsx'
import GpaCalculator from '../components/GpaCalculator.jsx'
import { calcGpa, compareSemester, formatGpa, gradeTone, semesterLabel } from '../lib/gpa.js'

// รวมสองคำขอให้ AsyncView ใช้ได้เหมือนคำขอเดียว
function useBoth(a, b) {
  return {
    loading: a.loading || b.loading,
    error: a.error || b.error,
    data: a.data && b.data ? [a.data, b.data] : null,
    reload: () => {
      a.reload()
      b.reload()
    },
  }
}

export default function Grades({ studentId }) {
  const id = encodeURIComponent(studentId)
  const grades = useApi(`/api/grades?student_id=${id}`)
  const gpa = useApi(`/api/gpa?student_id=${id}`)
  const query = useBoth(grades, gpa)

  return (
    <>
      <PageHeader
        title="ผลการเรียน"
        subtitle={`รหัสนักเรียน ${studentId} · เกรดรายวิชา เกรดเฉลี่ยรายภาค (GPS) และเกรดเฉลี่ยสะสม (GPAX)`}
      />
      <AsyncView query={query} rows={6}>
        {([g, p]) => <GradesBody items={g.items ?? []} gpa={p} />}
      </AsyncView>
    </>
  )
}

// จัดกลุ่ม items ตามภาค แล้วคำนวณ GPS รายภาคและ GPAX สะสมถึงภาคนั้นด้วยเกณฑ์กลาง
function groupBySemester(items) {
  const map = new Map()
  for (const x of items) map.set(x.semester, [...(map.get(x.semester) ?? []), x])
  const all = []
  return [...map.entries()]
    .sort(([a], [b]) => compareSemester(a, b))
    .map(([semester, rows]) => {
      all.push(...rows)
      return { semester, rows, term: calcGpa(rows), cumulative: calcGpa(all) }
    })
}

function GradesBody({ items, gpa }) {
  const semesters = useMemo(() => groupBySemester(items), [items])
  const local = useMemo(() => calcGpa(items), [items])

  // ระหว่างพัฒนา: เตือนในคอนโซลถ้า /api/gpa ไม่ตรงกับที่คำนวณจากรายวิชาด้วยเกณฑ์เดียวกัน
  useEffect(() => {
    if (import.meta.env.DEV && gpa.gpa != null && local.gpa != null && Math.abs(gpa.gpa - local.gpa) >= 0.01) {
      console.warn(`[GPA] /api/gpa ตอบ ${gpa.gpa} แต่คำนวณจาก /api/grades ได้ ${local.gpa.toFixed(4)}`)
    }
  }, [gpa.gpa, local.gpa])

  if (semesters.length === 0) {
    return (
      <Card>
        <p className="empty">ยังไม่มีผลการเรียนของรหัสนักเรียนนี้</p>
      </Card>
    )
  }

  const latest = semesters.at(-1)
  const maxCredit = Math.max(...semesters.map((t) => t.term.total_credit), 1)

  return (
    <>
      <div className="stats">
        <Stat label="เกรดเฉลี่ยสะสม (GPAX)" value={formatGpa(gpa.gpa)} hint="จากระบบทะเบียน" tone="primary" />
        <Stat label="หน่วยกิตสะสม" value={gpa.total_credit ?? '–'} />
        <Stat label="GPS ภาคล่าสุด" value={formatGpa(latest.term.gpa)} hint={semesterLabel(latest.semester)} />
        <Stat label="จำนวนภาคเรียน" value={semesters.length} />
      </div>

      <div className="grades-layout">
        <div className="stack">
          <Card title="แนวโน้มเกรดเฉลี่ย">
            <ol className="trend" aria-label="เกรดเฉลี่ยรายภาค">
              {semesters.map((t) => (
                <li key={t.semester}>
                  <span className="trend-term">{t.semester}</span>
                  <span className="trend-track">
                    <span className="trend-bar" style={{ width: `${((t.term.gpa ?? 0) / 4) * 100}%` }} />
                    <span
                      className="trend-cum"
                      style={{ left: `${((t.cumulative.gpa ?? 0) / 4) * 100}%` }}
                      title={`GPAX ${formatGpa(t.cumulative.gpa)}`}
                    />
                  </span>
                  <span className="trend-value">{formatGpa(t.term.gpa)}</span>
                  <span className="trend-credits" style={{ opacity: 0.5 + (t.term.total_credit / maxCredit) * 0.5 }}>
                    {t.term.total_credit} นก.
                  </span>
                </li>
              ))}
            </ol>
            <p className="legend">
              <span className="legend-bar" /> GPS รายภาค <span className="legend-cum" /> GPAX สะสม ณ ภาคนั้น
            </p>
          </Card>

          {[...semesters].reverse().map((t) => (
            <SemesterCard key={t.semester} data={t} />
          ))}
        </div>

        <aside className="calc-column">
          <GpaCalculator base={local} />
        </aside>
      </div>
    </>
  )
}

function SemesterCard({ data }) {
  return (
    <Card
      title={semesterLabel(data.semester)}
      aside={
        <span className="term-meta">
          GPS <strong>{formatGpa(data.term.gpa)}</strong>
          <span className="dot" />
          GPAX <strong>{formatGpa(data.cumulative.gpa)}</strong>
        </span>
      }
    >
      <div className="table-wrap">
        <table className="table table-grades">
          <colgroup>
            <col className="c-code" />
            <col />
            <col className="c-credits" />
            <col className="c-grade" />
          </colgroup>
          <thead>
            <tr>
              <th>รหัสวิชา</th>
              <th>ชื่อวิชา</th>
              <th className="num">หน่วยกิต</th>
              <th className="num">เกรด</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((x) => (
              <tr key={x.semester + x.course_code}>
                <td className="mono">{x.course_code}</td>
                <td>{x.course_name}</td>
                <td className="num">{x.credit}</td>
                <td className="num">
                  <GradeBadge grade={x.grade} tone={gradeTone(x.grade)} />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2}>รวม</td>
              <td className="num">{data.term.total_credit}</td>
              <td className="num">
                <strong>{formatGpa(data.term.gpa)}</strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  )
}
