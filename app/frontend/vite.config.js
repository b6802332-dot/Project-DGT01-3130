import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// ตอนพัฒนา (npm run dev / npm run preview) ส่งคำขอ /api ไปที่ Backend บนเครื่อง พอร์ต 3000 ตามข้อกำหนดกลาง
// ไฟล์นี้ใช้แค่ตอนพัฒนา ไม่ถูกรวมเข้าไปในไฟล์ที่ build — โค้ดใน src/ เรียกแค่ /api/... เสมอ
// ถ้า Backend อยู่ที่อื่น (เช่น ทดสอบกับ docker-compose) ตั้ง API_PROXY_TARGET ใน .env.local
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.API_PROXY_TARGET || 'http://localhost:3000'
  const proxy = { '/api': target }

  return {
    plugins: [react()],
    server: { proxy },
    preview: { proxy },
  }
})
