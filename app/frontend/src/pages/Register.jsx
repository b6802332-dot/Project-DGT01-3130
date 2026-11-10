import { useEffect, useMemo, useState } from 'react'
import { api } from '../api.js'
import { useApi } from '../hooks/useApi.js'
import { AsyncView, Card, PageHeader, Stat } from '../components/ui.jsx'
import Icon from '../components/Icon.jsx'
import '../styles/register-pages.css'

// รวมสถานะจาก API สองรายการให้ AsyncView จัดการ loading/error แบบเดียวกับหน้าอื่น
function useRegisterQueries(studentId) {
  const courses = useApi('/api/courses')
  const registered = useApi(`/api/register?student_id=${encodeURIComponent(studentId)}`)

  return {
    loading: courses.loading || registered.loading,
    error: courses.error || registered.error,
    data: courses.data && registered.data ? [courses.data, registered.data] : null,
    reload: () => {
      courses.reload()
      registered.reload()
    },
  }
}

export default function Register({ studentId }) {
  const query = useRegisterQueries(studentId)
  const [busyCourse, setBusyCourse] = useState('')
  const [message, setMessage] = useState(null)

  // ล้างข้อความเก่าเมื่อเปลี่ยนรหัสนักเรียน
  useEffect(() => {
    setMessage(null)
    setBusyCourse('')
  }, [studentId])

  const enroll = async (courseCode) => {
    if (busyCourse) return

    setBusyCourse(courseCode)
    setMessage(null)

    try {
      await api('/api/register', {
        method: 'POST',
        body: JSON.stringify({
          student_id: studentId,
          course_code: courseCode,
        }),
      })
      setMessage({
        type: 'success',
        text: `ลงทะเบียน ${courseCode} สำเร็จ`,
      })
    } catch (error) {
      // แสดงข้อความจาก Backend เช่น “ที่นั่งเต็ม” หรือ “ลงทะเบียนวิชานี้แล้ว”
      setMessage({
        type: 'error',
        text: error?.message || 'ลงทะเบียนไม่สำเร็จ กรุณาลองใหม่',
      })
    } finally {
      setBusyCourse('')
      // ต้องโหลดทั้งจำนวนที่นั่งและรายการของนักเรียนใหม่เสมอ แม้ POST ไม่สำเร็จ
      query.reload()
    }
  }

  return (
    <div className="stack register-page">
      <PageHeader
        title="ลงทะเบียนเรียน"
        subtitle={`รหัสนักเรียน ${studentId} · เลือกรายวิชาที่ต้องการลงทะเบียนในภาคเรียนปัจจุบัน`}
      />

      {message && (
        <div
          className={`register-message ${message.type}`}
          role={message.type === 'error' ? 'alert' : 'status'}
          aria-live="polite"
        >
          <Icon name={message.type === 'success' ? 'grade' : 'alert'} size={18} />
          <span>{message.text}</span>
          <button
            type="button"
            className="register-message-close"
            onClick={() => setMessage(null)}
            aria-label="ปิดข้อความ"
          >
            <Icon name="x" size={16} />
          </button>
        </div>
      )}

      <AsyncView query={query} rows={7}>
        {([courseData, registerData]) => (
          <RegisterContent
            courses={courseData.items ?? []}
            mine={registerData.items ?? []}
            semester={courseData.semester || registerData.semester}
            busyCourse={busyCourse}
            onEnroll={enroll}
          />
        )}
      </AsyncView>
    </div>
  )
}

function RegisterContent({ courses, mine, semester, busyCourse, onEnroll }) {
  const registeredCodes = useMemo(
    () => new Set(mine.map((item) => item.course_code)),
    [mine],
  )

  const availableSeats = courses.reduce(
    (total, course) => total + Math.max(0, Number(course.seats) - Number(course.enrolled)),
    0,
  )
  const openCourses = courses.filter(
    (course) => Number(course.seats) - Number(course.enrolled) > 0,
  ).length

  return (
    <div className="stack">
      <div className="stats register-stats">
        <Stat label="รายวิชาที่เปิดสอน" value={courses.length} hint={semester || 'ภาคเรียนปัจจุบัน'} />
        <Stat label="รายวิชาที่ยังมีที่นั่ง" value={openCourses} tone="primary" />
        <Stat label="ที่นั่งคงเหลือทั้งหมด" value={availableSeats} />
        <Stat label="ลงทะเบียนแล้ว" value={mine.length} />
      </div>

      <Card
        title="รายวิชาที่เปิดรับลงทะเบียน"
        aside={semester && <span className="pill">ภาคเรียน {semester}</span>}
      >
        {courses.length === 0 ? (
          <p className="empty">ยังไม่มีรายวิชาที่เปิดรับลงทะเบียน</p>
        ) : (
          <div className="table-wrap">
            <table className="table register-table">
              <thead>
                <tr>
                  <th>รหัสวิชา</th>
                  <th>ชื่อรายวิชา</th>
                  <th className="num">หน่วยกิต</th>
                  <th className="num">ที่นั่งคงเหลือ</th>
                  <th className="register-action-heading">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => {
                  const remaining = Math.max(0, Number(course.seats) - Number(course.enrolled))
                  const isRegistered = registeredCodes.has(course.course_code)
                  const isBusy = busyCourse === course.course_code
                  const disabled = Boolean(busyCourse) || remaining <= 0 || isRegistered

                  return (
                    <tr key={course.course_code}>
                      <td className="mono register-code">{course.course_code}</td>
                      <td>
                        <span className="register-course-name">{course.course_name}</span>
                      </td>
                      <td className="num">{course.credit}</td>
                      <td className="num">
                        <span className={remaining <= 0 ? 'register-seats full' : 'register-seats'}>
                          {remaining}
                        </span>
                      </td>
                      <td className="register-action-cell">
                        <button
                          type="button"
                          className={`btn register-button ${isRegistered ? 'is-registered' : ''}`}
                          disabled={disabled}
                          onClick={() => onEnroll(course.course_code)}
                        >
                          {isBusy ? (
                            <><span className="register-spinner" /> กำลังส่ง</>
                          ) : isRegistered ? (
                            <><Icon name="grade" size={15} /> ลงทะเบียนแล้ว</>
                          ) : remaining <= 0 ? (
                            'เต็ม'
                          ) : (
                            <><Icon name="plus" size={15} /> ลงทะเบียน</>
                          )}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="register-footnote">
          <Icon name="alert" size={14} /> จำนวนที่นั่งอาจเปลี่ยนแปลงได้ ระบบจะตรวจสอบกับ Backend อีกครั้งเมื่อกดลงทะเบียน
        </p>
      </Card>

      <Card
        title="รายวิชาที่ลงทะเบียนแล้ว"
        aside={<span className="pill pill-muted">{mine.length} รายวิชา</span>}
      >
        {mine.length === 0 ? (
          <div className="register-empty-mine">
            <span className="register-empty-icon"><Icon name="register" size={22} /></span>
            <p>ยังไม่มีรายวิชาที่ลงทะเบียน</p>
            <span className="muted small">เลือกรายวิชาจากตารางด้านบนเพื่อเริ่มลงทะเบียน</span>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table register-table mine-table">
              <thead>
                <tr>
                  <th>รหัสวิชา</th>
                  <th>ชื่อรายวิชา</th>
                  <th className="num">หน่วยกิต</th>
                  <th>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {mine.map((course) => (
                  <tr key={course.course_code}>
                    <td className="mono register-code">{course.course_code}</td>
                    <td>{course.course_name}</td>
                    <td className="num">{course.credit}</td>
                    <td><span className="register-status"><Icon name="grade" size={14} /> สำเร็จ</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
