import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import Icon from './Icon.jsx'

// เมนูไปทุกหน้า — คนที่ 4 ไม่ต้องแก้ไฟล์นี้ (มีลิงก์ลงทะเบียน/ข่าวประกาศให้แล้ว)
const NAV = [
  { to: '/', label: 'ผลการเรียน', icon: 'grade' },
  { to: '/schedule', label: 'ตารางเรียน/สอบ', icon: 'calendar' },
  { to: '/register', label: 'ลงทะเบียน', icon: 'register' },
  { to: '/announcements', label: 'ข่าวประกาศ', icon: 'news' },
]

export default function Sidebar({ studentId, onStudentIdChange }) {
  const [draft, setDraft] = useState(studentId)
  const { pathname } = useLocation()

  useEffect(() => {
    const current = NAV.find((n) => n.to === pathname)
    document.title = `${current?.label ?? 'ไม่พบหน้า'} · ระบบทะเบียนนักเรียน`
  }, [pathname])

  // เปลี่ยนรหัสเมื่อกด Enter/ปุ่ม เท่านั้น กันไม่ให้ยิง API ทุกครั้งที่พิมพ์
  const submit = (e) => {
    e.preventDefault()
    const id = draft.trim()
    if (id && id !== studentId) onStudentIdChange(id)
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          <Icon name="grade" size={20} />
        </span>
        <span className="brand-text">
          <strong>ระบบทะเบียน</strong>
          <small>และประเมินผล</small>
        </span>
      </div>

      <nav className="nav" aria-label="เมนูหลัก">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.to === '/'} className="nav-link">
            <Icon name={n.icon} />
            <span>{n.label}</span>
          </NavLink>
        ))}
      </nav>

      <form className="student-form" onSubmit={submit}>
        <label htmlFor="student-id">รหัสนักเรียน</label>
        <div className="student-input">
          <input
            id="student-id"
            className="input"
            inputMode="numeric"
            autoComplete="off"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <button type="submit" className="icon-btn icon-btn-primary" aria-label="ดูข้อมูลของรหัสนี้">
            <Icon name="search" size={16} />
          </button>
        </div>
        <small className="muted">ยังไม่มีระบบล็อกอิน · ทดสอบ 6401001–6401003</small>
      </form>
    </aside>
  )
}
