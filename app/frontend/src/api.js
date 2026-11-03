// ทุกหน้าเรียก API ผ่านฟังก์ชันนี้ เพื่อให้จัดการ error เหมือนกัน (คู่มือคนที่ 3 ขั้นที่ 2)
// เรียกด้วยพาธ /api/... เท่านั้น ห้ามใส่ URL ของเครื่องตัวเองหรือ IP
//   VITE_USE_MOCK=true  → อ่านไฟล์จำลองจาก public/mock/api/*.json (ไม่สน query string)
//   VITE_USE_MOCK=false → เรียก /api จริง (dev: proxy ใน vite.config.js, production: Ingress/nginx)
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export async function api(path, options = {}) {
  const url = USE_MOCK ? `/mock${path.split('?')[0]}.json` : path
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
  return data
}
