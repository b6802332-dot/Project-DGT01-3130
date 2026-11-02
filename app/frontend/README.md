# Frontend — ระบบทะเบียนและประเมินผล

React + Vite + React Router · ทำตาม "คู่มือรายละเอียด คนที่ 3: Frontend"

| พาธ | หน้า | ผู้ทำ |
|---|---|---|
| `/` | ผลการเรียน + ทดลองคำนวณเกรด | คนที่ 3 |
| `/schedule` | ตารางเรียน/สอบ | คนที่ 3 |
| `/register` | ลงทะเบียนเรียน (หน้าเปล่า รอทำต่อ) | คนที่ 4 |
| `/announcements` | ข่าวประกาศ (หน้าเปล่า รอทำต่อ) | คนที่ 4 |

## เริ่มใช้งาน

```bash
cd app/frontend
npm install          # ใน Docker ใช้ npm ci
npm run dev          # เรียก Backend จริงที่พอร์ต 3000 ผ่าน /api
npm run dev:mock     # ใช้ข้อมูลจำลองใน public/mock/api/ (ไม่ต้องมี Backend)
npm run build        # สร้างไฟล์ไว้ที่ dist/
npm run preview      # เปิดดูไฟล์ที่ build แล้ว (ยังส่ง /api ไปพอร์ต 3000)
npm run build:mock   # build แบบข้อมูลจำลอง แล้วตามด้วย npm run preview
npm test             # ตรวจว่าเครื่องคำนวณเกรดตรงกับเกณฑ์กลาง
npm run lint
```

`dev:mock` ทำเหมือน `VITE_USE_MOCK=true npm run dev` ในคู่มือ แต่ใช้ได้ทั้ง Windows, macOS และ Linux
(ค่าอยู่ในไฟล์ `.env.mock`)

## การเรียก API (คู่มือขั้นที่ 2)

- ทุกหน้าเรียกผ่าน `api()` ใน `src/api.js` ด้วยพาธ `/api/...` เท่านั้น — **ห้ามใส่ URL ของเครื่องตัวเองหรือ IP ในโค้ด**
- `VITE_USE_MOCK=true` → อ่าน `public/mock/api/<ชื่อ>.json` แทน (ตัด query string ออก) · `false` → เรียก `/api` จริง
- ตอนพัฒนา `vite.config.js` ส่ง `/api` ไปที่พอร์ต 3000 บนเครื่อง ถ้า Backend อยู่ที่อื่น ตั้ง `API_PROXY_TARGET` ใน `.env.local`
- ข้อมูลจำลองใช้ชื่อฟิลด์และรูปแบบเดียวกับ "ตัวอย่าง JSON ที่ตอบกลับ" ในข้อกำหนดกลางเป๊ะ (snake_case, รหัสทดสอบ `6401001`)

| Endpoint ที่หน้าของคนที่ 3 ใช้ | ใช้ในหน้า |
|---|---|
| `GET /api/grades?student_id=` | ผลการเรียน |
| `GET /api/gpa?student_id=` | ผลการเรียน (GPAX ทางการ) |
| `GET /api/schedule?student_id=` | ตารางเรียน/สอบ |

รหัสนักเรียนกรอกที่ช่องในเมนูด้านซ้าย (ยังไม่มีระบบล็อกอิน) ค่าเริ่มต้น `6401001` แล้วส่งให้ทุกหน้าเป็น prop `studentId`

## สำหรับคนที่ 4

1. ดึง branch นี้ แล้วทำหน้าใน `src/pages/Register.jsx` และ `src/pages/Announcements.jsx` (route และเมนูมีให้แล้ว ไม่ต้องแก้ `App.jsx`)
2. `Register` ได้ prop `studentId` อยู่แล้ว · เรียก API ด้วย `api()` จาก `../api.js` เช่น
   `api('/api/register', { method: 'POST', body: JSON.stringify({ student_id: studentId, course_code }) })`
3. ใช้ส่วนประกอบใน `src/components/ui.jsx` ได้ (`PageHeader`, `Card`, `AsyncView`, `ErrorBox`) และ `useApi()` ใน `src/hooks/useApi.js`
4. ใส่ข้อมูลจำลองของตัวเองที่ `public/mock/api/courses.json`, `register.json`, `announcements.json`

## สำหรับคนที่ 1 (Dockerfile / nginx / K8s)

| เรื่อง | ค่า |
|---|---|
| เวอร์ชัน Node | 22 (`.nvmrc`, `engines` ใน `package.json` ขั้นต่ำ 22.12) |
| ติดตั้ง | `npm ci` (ล็อกด้วย `package-lock.json`) |
| คำสั่ง build | `npm run build` |
| โฟลเดอร์ผลลัพธ์ | `dist/` — ไฟล์ static ล้วน เสิร์ฟด้วย nginx พอร์ต 80 |
| ตัวแปรตอน build | `VITE_USE_MOCK` ไม่ต้องตั้ง (ค่าว่าง = เรียก Backend จริง) |
| SPA fallback | ใช้ URL จริง (`/schedule`) ต้องมี `try_files $uri /index.html;` ไม่งั้นรีเฟรชแล้ว 404 |
| `/api` | docker-compose: nginx ของ Frontend proxy ไป `backend:3000` · K8s: Ingress ส่งไป Backend โดยไม่ตัด `/api` |

## โครงสร้าง

```
app/frontend/
├── public/mock/api/      ข้อมูลจำลอง grades.json, gpa.json, schedule.json
├── src/
│   ├── api.js            ฟังก์ชัน api() ที่ทุกหน้าใช้
│   ├── App.jsx           router + รหัสนักเรียน
│   ├── hooks/useApi.js   โหลดข้อมูลพร้อมสถานะ loading/error
│   ├── components/       Sidebar, GpaCalculator, ui.jsx, Icon
│   ├── lib/              gpa.js (เกณฑ์เกรดกลาง + test), time.js (วัน MON…SUN → ภาษาไทย)
│   ├── pages/            Grades, Schedule, Register, Announcements, NotFound
│   └── index.css         ธีมเทาเข้ม ตัดน้ำเงิน (ปรับสีที่ :root)
└── docs/screenshots/     ภาพหน้าจอสำหรับเอกสารและสไลด์
```

## กฎ Git

- ทำงานใน branch `feat/frontend` แล้วเปิด Pull Request เข้า `main`
- `.gitignore` กัน `.env` และ `.env.*` ไว้แล้ว commit ได้แค่ `.env.example` และ `.env.mock` (ไม่มีความลับ)
- commit `package-lock.json` ทุกครั้งที่เพิ่มแพ็กเกจ ไม่งั้น `npm ci` ใน Docker จะล้ม
