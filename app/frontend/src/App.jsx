import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import Grades from './pages/Grades.jsx'
import Schedule from './pages/Schedule.jsx'
import Register from './pages/Register.jsx'
import Announcements from './pages/Announcements.jsx'
import NotFound from './pages/NotFound.jsx'

// รหัสนักเรียนทดสอบตามข้อกำหนดกลาง (6401001 มีข้อมูลครบ) — ยังไม่มีระบบล็อกอิน
const DEFAULT_STUDENT_ID = '6401001'

export default function App() {
  const [studentId, setStudentId] = useState(DEFAULT_STUDENT_ID)

  return (
    <BrowserRouter>
      <div className="shell">
        <Sidebar studentId={studentId} onStudentIdChange={setStudentId} />
        <main className="main">
          <Routes>
            <Route path="/" element={<Grades studentId={studentId} />} />
            <Route path="/schedule" element={<Schedule studentId={studentId} />} />
            {/* หน้าของคนที่ 4 */}
            <Route path="/register" element={<Register studentId={studentId} />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
