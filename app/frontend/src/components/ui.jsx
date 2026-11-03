import Icon from './Icon.jsx'

export function PageHeader({ title, subtitle, actions }) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  )
}

export function Card({ title, aside, children, className = '' }) {
  return (
    <section className={`card ${className}`}>
      {(title || aside) && (
        <div className="card-head">
          {title && <h2>{title}</h2>}
          {aside}
        </div>
      )}
      {children}
    </section>
  )
}

export function Stat({ label, value, hint, tone }) {
  return (
    <div className={`stat ${tone ? `stat-${tone}` : ''}`}>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
      {hint && <span className="stat-hint">{hint}</span>}
    </div>
  )
}

export function Loading({ rows = 4 }) {
  return (
    <div className="loading" role="status" aria-label="กำลังโหลด">
      {Array.from({ length: rows }, (_, i) => (
        <span key={i} className="skeleton skeleton-row" />
      ))}
    </div>
  )
}

export function ErrorBox({ error, onRetry }) {
  return (
    <div className="error-box" role="alert">
      <Icon name="alert" />
      <div>
        <strong>โหลดข้อมูลไม่สำเร็จ</strong>
        <p>{error?.message}</p>
      </div>
      {onRetry && (
        <button type="button" className="btn btn-ghost" onClick={onRetry}>
          <Icon name="refresh" size={16} /> ลองใหม่
        </button>
      )}
    </div>
  )
}

// ห่อสถานะ loading / error ของ useApi ให้ทุกหน้าใช้รูปแบบเดียวกัน
export function AsyncView({ query, children, rows }) {
  if (query.loading && !query.data) return <Loading rows={rows} />
  if (query.error) return <ErrorBox error={query.error} onRetry={query.reload} />
  return children(query.data)
}

export function GradeBadge({ grade, tone }) {
  return <span className={`grade grade-${tone}`}>{grade}</span>
}
