import { Link } from 'react-router-dom'
import { Card, PageHeader } from '../components/ui.jsx'

export default function NotFound() {
  return (
    <>
      <PageHeader title="ไม่พบหน้าที่ต้องการ" />
      <Card>
        <p className="empty">
          ลิงก์นี้อาจถูกย้ายหรือพิมพ์ผิด{' '}
          <Link to="/" className="link">
            กลับหน้าผลการเรียน
          </Link>
        </p>
      </Card>
    </>
  )
}
