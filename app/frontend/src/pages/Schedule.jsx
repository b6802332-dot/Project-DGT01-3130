import { useMemo } from 'react'
import { useApi } from '../hooks/useApi.js'
import { AsyncView, Card, PageHeader } from '../components/ui.jsx'
import Icon from '../components/Icon.jsx'
import {
  countdownText,
  courseHue,
  dayFromCode,
  daysUntil,
  DAYS,
  formatDateLong,
  isoWeekday,
  overlaps,
  toMinutes,
} from '../lib/time.js'
import { semesterLabel } from '../lib/gpa.js'

const SLOT = 30 // นาทีต่อ 1 แถวในตารางสัปดาห์

export default function Schedule({ studentId }) {
  const query = useApi(`/api/schedule?student_id=${encodeURIComponent(studentId)}`)

  return (
    <AsyncView query={query} rows={8}>
      {(data) => (
        <>
          <PageHeader
            title="ตารางเรียน/สอบ"
            subtitle={`รหัสนักเรียน ${studentId}${data.semester ? ` · ${semesterLabel(data.semester)}` : ''}`}
          />
          <ScheduleBody items={data.items ?? []} />
        </>
      )}
    </AsyncView>
  )
}

function ScheduleBody({ items }) {
  // แปลง day (MON…SUN) เป็นวันภาษาไทย แล้วเรียงตามวันและเวลาเริ่ม
  const classes = useMemo(
    () =>
      items
        .map((x) => ({ ...x, dayInfo: dayFromCode(x.day) }))
        .sort(
          (a, b) => (a.dayInfo?.id ?? 99) - (b.dayInfo?.id ?? 99) || toMinutes(a.start_time) - toMinutes(b.start_time),
        ),
    [items],
  )

  // ตารางสอบ: หนึ่งวิชาหนึ่งแถว (items ของวิชาเดียวกันมีข้อมูลสอบซ้ำกันทุกคาบ)
  const exams = useMemo(() => {
    const byCourse = new Map()
    for (const x of items) {
      if (x.exam_date && !byCourse.has(x.course_code)) byCourse.set(x.course_code, x)
    }
    return [...byCourse.values()].sort(
      (a, b) => a.exam_date.localeCompare(b.exam_date) || toMinutes(a.exam_start) - toMinutes(b.exam_start),
    )
  }, [items])

  const noExam = useMemo(() => {
    const withExam = new Set(exams.map((e) => e.course_code))
    return [...new Set(items.map((x) => x.course_code))].filter((c) => !withExam.has(c))
  }, [items, exams])

  if (items.length === 0) {
    return (
      <Card>
        <p className="empty">ยังไม่มีวิชาที่ลงทะเบียนในเทอมนี้</p>
      </Card>
    )
  }

  return (
    <div className="stack">
      <WeekGrid classes={classes} />
      <ClassTable classes={classes} />
      <ExamSection exams={exams} noExam={noExam} />
    </div>
  )
}

function WeekGrid({ classes }) {
  const today = isoWeekday()
  const placed = classes.filter((c) => c.dayInfo)
  const hasDay = (id) => placed.some((c) => c.dayInfo.id === id)
  const days = DAYS.filter((d) => d.id <= 5 || hasDay(d.id))
  const starts = placed.map((c) => toMinutes(c.start_time))
  const ends = placed.map((c) => toMinutes(c.end_time))
  const startHour = Math.min(8, Math.floor(Math.min(...starts, 480) / 60))
  const endHour = Math.max(17, Math.ceil(Math.max(...ends, 1020) / 60))
  const slots = ((endHour - startHour) * 60) / SLOT
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i)
  const rowOf = (hhmm) => (toMinutes(hhmm) - startHour * 60) / SLOT + 2 // +1 หัวตาราง +1 index เริ่มที่ 1

  return (
    <Card className="week-card">
      <div
        className="week"
        style={{
          gridTemplateColumns: `56px repeat(${days.length}, minmax(110px, 1fr))`,
          gridTemplateRows: `40px repeat(${slots}, 26px)`,
        }}
      >
        <div className="week-corner" />
        {days.map((d, i) => (
          <div key={d.id} className={`week-day ${d.id === today ? 'is-today' : ''}`} style={{ gridColumn: i + 2 }}>
            {d.long}
          </div>
        ))}
        {hours.map((h, i) => (
          <div key={h} className="week-hour" style={{ gridRow: `${i * 2 + 2} / span 2` }}>
            {String(h).padStart(2, '0')}:00
          </div>
        ))}
        {days.map((d, i) => (
          <div
            key={d.id}
            className={`week-col ${d.id === today ? 'is-today' : ''}`}
            style={{ gridColumn: i + 2, gridRow: `2 / span ${slots}` }}
          />
        ))}
        {placed.map((c) => {
          const col = days.findIndex((d) => d.id === c.dayInfo.id)
          return (
            <article
              key={`${c.course_code}-${c.day}-${c.start_time}`}
              className="class-block"
              style={{
                gridColumn: col + 2,
                gridRow: `${rowOf(c.start_time)} / ${rowOf(c.end_time)}`,
                '--hue': courseHue(c.course_code),
              }}
            >
              <strong>{c.course_code}</strong>
              <span className="class-name">{c.course_name}</span>
              <span className="class-meta">
                {c.start_time}–{c.end_time} · {c.room}
              </span>
            </article>
          )
        })}
      </div>
    </Card>
  )
}

function ClassTable({ classes }) {
  const courseCount = new Set(classes.map((c) => c.course_code)).size
  return (
    <Card title="ตารางเรียน" aside={<span className="muted small">{courseCount} วิชา</span>}>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>วัน</th>
              <th>เวลา</th>
              <th>รหัสวิชา</th>
              <th>ชื่อวิชา</th>
              <th>ห้อง</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((c) => (
              <tr key={`${c.course_code}-${c.day}-${c.start_time}`}>
                <td className="nowrap">{c.dayInfo?.long ?? c.day}</td>
                <td className="nowrap tabular">
                  {c.start_time}–{c.end_time}
                </td>
                <td className="mono">
                  <span className="swatch" style={{ '--hue': courseHue(c.course_code) }} />
                  {c.course_code}
                </td>
                <td>{c.course_name}</td>
                <td className="nowrap">{c.room}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function ExamSection({ exams, noExam }) {
  const next = exams.find((e) => daysUntil(e.exam_date) >= 0)

  // วิชาที่เวลาสอบชนกัน (วันเดียวกันและช่วงเวลาทับกัน)
  const clashes = new Set()
  for (let i = 0; i < exams.length; i++) {
    for (let j = i + 1; j < exams.length; j++) {
      const a = exams[i]
      const b = exams[j]
      if (
        a.exam_date === b.exam_date &&
        overlaps({ start: a.exam_start, end: a.exam_end }, { start: b.exam_start, end: b.exam_end })
      ) {
        clashes.add(a.course_code)
        clashes.add(b.course_code)
      }
    }
  }

  return (
    <>
      {next && (
        <section className="next-exam">
          <div>
            <span className="eyebrow">สอบถัดไป</span>
            <h2>
              {next.course_code} {next.course_name}
            </h2>
            <p>
              <Icon name="calendar" size={16} /> {formatDateLong(next.exam_date)}
              <span className="sep" />
              <Icon name="clock" size={16} /> {next.exam_start}–{next.exam_end}
              <span className="sep" />
              <Icon name="pin" size={16} /> ห้อง {next.exam_room}
            </p>
          </div>
          <div className="next-count">
            <strong>{daysUntil(next.exam_date)}</strong>
            <span>วัน</span>
          </div>
        </section>
      )}

      <Card title="ตารางสอบ" aside={<span className="muted small">{exams.length} วิชา</span>}>
        {clashes.size > 0 && (
          <div className="warn-box" role="status">
            <Icon name="alert" />
            มี {clashes.size} วิชาที่เวลาสอบชนกัน กรุณาติดต่อฝ่ายทะเบียน
          </div>
        )}
        {exams.length === 0 ? (
          <p className="empty">ยังไม่มีตารางสอบของเทอมนี้</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>วันที่สอบ</th>
                  <th>เวลา</th>
                  <th>รหัสวิชา</th>
                  <th>ชื่อวิชา</th>
                  <th>ห้องสอบ</th>
                  <th className="num">นับถอยหลัง</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((e) => {
                  const d = daysUntil(e.exam_date)
                  return (
                    <tr
                      key={e.course_code}
                      className={clashes.has(e.course_code) ? 'row-clash' : d < 0 ? 'row-past' : ''}
                    >
                      <td className="nowrap">{formatDateLong(e.exam_date)}</td>
                      <td className="nowrap tabular">
                        {e.exam_start}–{e.exam_end}
                      </td>
                      <td className="mono">
                        <span className="swatch" style={{ '--hue': courseHue(e.course_code) }} />
                        {e.course_code}
                      </td>
                      <td>
                        {e.course_name}
                        {clashes.has(e.course_code) && <span className="tag tag-danger">เวลาชน</span>}
                      </td>
                      <td className="nowrap">{e.exam_room}</td>
                      <td className="num">
                        <span className={`pill ${d < 0 ? 'pill-muted' : d <= 7 ? 'pill-warn' : ''}`}>
                          {countdownText(d)}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        {noExam.length > 0 && <p className="muted small table-note">ไม่มีสอบในตาราง: {noExam.join(', ')}</p>}
      </Card>
    </>
  )
}
