import { useApi } from '../hooks/useApi.js'
import { AsyncView, Card, PageHeader } from '../components/ui.jsx'
import Icon from '../components/Icon.jsx'
import '../styles/register-pages.css'

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
]

// published_at เป็น YYYY-MM-DD จาก API; แยกข้อความเองเพื่อป้องกันวันที่เลื่อนตาม timezone
function formatPublishedDate(value) {
  if (typeof value !== 'string') return 'ไม่ระบุวันที่'
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return value

  const [, year, month, day] = match
  const monthName = THAI_MONTHS[Number(month) - 1]
  if (!monthName) return value
  return `${Number(day)} ${monthName} ${Number(year) + 543}`
}

export default function Announcements() {
  const query = useApi('/api/announcements')

  return (
    <div className="stack announcements-page">
      <PageHeader
        title="ข่าวประกาศ"
        subtitle="ติดตามข่าวสารและประกาศสำคัญจากระบบทะเบียนนักเรียน"
        actions={
          <button type="button" className="btn btn-ghost" onClick={query.reload} disabled={query.loading}>
            <Icon name="refresh" size={16} /> รีเฟรช
          </button>
        }
      />

      <AsyncView query={query} rows={5}>
        {(data) => <AnnouncementList items={data.items ?? []} />}
      </AsyncView>
    </div>
  )
}

function AnnouncementList({ items }) {
  if (items.length === 0) {
    return (
      <Card>
        <div className="announcement-empty">
          <span className="announcement-empty-icon"><Icon name="news" size={26} /></span>
          <strong>ยังไม่มีประกาศ</strong>
          <p className="muted small">เมื่อมีข่าวสารใหม่ จะแสดงรายการที่หน้านี้</p>
        </div>
      </Card>
    )
  }

  // คงลำดับใหม่ไปเก่าตามที่ API ส่งมา ไม่เรียงวันที่ซ้ำในฝั่ง Frontend
  return (
    <div className="announcement-list">
      {items.map((item) => (
        <article className="card announcement-card" key={item.id}>
          <div className="announcement-icon"><Icon name="news" size={20} /></div>
          <div className="announcement-content">
            <div className="announcement-meta">
              <span className="announcement-label">ประกาศ</span>
              <time className="announcement-date" dateTime={item.published_at || undefined}>
                <Icon name="clock" size={14} />
                {formatPublishedDate(item.published_at)}
              </time>
            </div>
            <h2>{item.title}</h2>
            <p className="announcement-body">{item.body}</p>
          </div>
        </article>
      ))}
    </div>
  )
}
