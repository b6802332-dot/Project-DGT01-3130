# บันทึกการมีส่วนร่วมของสมาชิก

ทีมมี 5 คน คนที่ 4 และ 5 ไม่มีบัญชี GitHub ใน repo จึงส่งงานผ่านคนที่ 3 (บัญชี b6802332-dot) ประวัติ git ของ PR #2 และ #9 จึงเป็นชื่อคนที่ 3

| คนที่ | ชื่อ | บัญชี GitHub / ชื่อใน git | หน้าที่ | PR |
|---|---|---|---|---|
| 1 | Jidarat | jidaratjidarat9-lang (Jidarat, jidarat) | Backend (grades, gpa, schedule), Docker, K8s, เอกสาร | #3 #4 #6 #8 #10 #12 #14 #15 |
| 2 | Panuphong | Game555web (Game555) | Backend (courses, register, announcements), Ansible, Gateway, HPA, สไลด์ | #5 #7 #11 #13 |
| 3 | Siripop | b6802332-dot (Sirapop) | Frontend โครงโปรเจกต์, หน้าผลการเรียน/GPA, ตารางเรียน/สอบ | #1 |
| 4 | Jiamthong | ส่งผ่านคนที่ 3 | Frontend หน้าลงทะเบียน, ข่าวประกาศ | #9 (เปิดโดยคนที่ 3) |
| 5 | ออกแบบ schema.sql (students, courses, enrollments, grades, schedules, announcements พร้อม Foreign Key และ Constraint), สร้างข้อมูลจำลอง seed.sql, เขียนสคริปต์เสริม verify.sql, backup.sh, restore.sh, วาด ER diagram | AI (ไม่ระบุชื่อเครื่องมือในบันทึก), Mermaid (วาด ER diagram) | ใช้สคริปต์ verify.sql ตรวจความถูกต้องของฐานข้อมูล |

จำนวน commit (จาก `git shortlog -sn` รวมชื่อซ้ำของคนเดียวกันแล้ว): คนที่ 1 = 18, คนที่ 2 = 6, คนที่ 3 (รวมงานที่ส่งแทนคนที่ 4 และ 5) = 8 เป็นข้อมูลประกอบเท่านั้น

## บันทึกการใช้ AI

| คนที่ | ใช้ AI ช่วยตรงไหน | เครื่องมือ | ตรวจสอบผลอย่างไร |
|---|---|---|---|
| 1 | ช่วยร่าง Dockerfile ของ backend/frontend, docker-compose, K8s manifests (Deployment, StatefulSet, Service, probe), แยก /healthz กับ /readyz, ช่วยหาสาเหตุ backend ล้มเมื่อ Postgres หยุด และช่วยร่างเอกสาร README | Claude | รันทดสอบเองด้วย docker compose และ curl, ตรวจ diff ก่อน commit, ให้คนที่ 2 ทดสอบบน cluster จริงแล้วดูผลด้วย kubectl |
| 2 | สืบค้นวิธีทำและคำสั่งที่ใช้ในโปรเจกต์ (ติดตั้ง k3s ด้วย Ansible, Ingress, HPA, k6), แก้บั๊กโค้ดและไฟล์ตั้งค่า, สรุปผลทดสอบและจัดทำสไลด์รายงาน | Claude (ใช้ทำโปรเจกต์ทั้งหมด), Gemini (แก้บั๊กและปัญหาเพิ่มเติม) | ค้นคว้าวิธีทำล่วงหน้าเพื่อคาดการณ์ผล แล้วเทียบกับผลรันจริง และบันทึกภาพหลักฐานจากคลัสเตอร์จริง |
| 3 | ร่างโครงโปรเจกต์ Frontend (React + Vite + React Router, layout, ธีม, ฟังก์ชัน api() และ dev proxy /api)<br>เขียนหน้าผลการเรียน + เครื่องคำนวณ GPA + unit test และหน้าตารางเรียน/สอบ<br>ทำข้อมูลจำลองใน public/mock/api/<br>ตรวจและแก้ schema.sql/seed.sql ของคนที่ 5 ให้ตรงข้อกำหนดกลาง (วัน MON–SUN, เทอม 1/2569, เพิ่ม PH101) และแยกเป็นสองไฟล์<br>เขียนสคริปต์ check-gateway.mjs ตรวจระบบผ่าน Gateway<br>ช่วยรีวิว PR #13, ลองทำตาม README, ทำ ER diagram (Mermaid/DBML), ร่างบทพรีเซนต์ และแนะนำขั้นตอน Git/Docker | Claude | รัน npm test ผ่าน 6/6 และ npm run build ผ่าน<br>grep ตรวจว่าไม่มี URL ฝังตายใน app/frontend/src<br>เปิดเว็บทดสอบทั้งโหมดข้อมูลจำลองและต่อ Backend + PostgreSQL จริงบนเครื่อง (6401001 ได้ GPAX 3.75)<br>เทียบ GPA หน้าเว็บกับ /api/gpa ทุกรหัสว่าตรงกัน<br>รัน schema.sql/seed.sql ใน Docker (postgres:16) แล้วตรวจ docker logs และ query ผลเอง<br>อ่าน diff ก่อน commit และเปิด PR ให้เพื่อนตรวจก่อน merge |
| 4 | วิเคราะห์ข้อกำหนดงาน Frontend, เขียน/แก้โค้ดหน้าลงทะเบียนเรียนและข่าวประกาศ, เชื่อมต่อ API และจัดการกรณีลงทะเบียนซ้ำ/ที่นั่งเต็ม/ข้อผิดพลาด, แก้ปัญหาติดตั้งและรัน (เช่น npm error ENOENT), แนะนำคำสั่ง Git, npm, Docker Compose | ChatGPT (วิเคราะห์ Requirement, อธิบายโค้ด, แก้ Error, ทำ Checklist), Claude (เขียนและปรับปรุงโค้ด), VS Code, Git/GitHub | รัน Frontend ที่ localhost:5173, ตรวจ UI ข้อมูลรายวิชาและรายการลงทะเบียน, ทดสอบลงทะเบียนสำเร็จ/ซ้ำ/ที่นั่งเต็มกับ Backend จริง, npm run build, ทดสอบรวมระบบด้วย Docker Compose |
| 5 | ออกแบบ schema.sql (students, courses, enrollments, grades, schedules, announcements พร้อม Foreign Key และ Constraint), สร้างข้อมูลจำลอง seed.sql, เขียนสคริปต์เสริม verify.sql, backup.sh, restore.sh, วาด ER diagram | AI (ไม่ระบุชื่อเครื่องมือในบันทึก), Mermaid (วาด ER diagram) | ใช้สคริปต์ verify.sql ตรวจความถูกต้องของฐานข้อมูล |

## Research log

| วันที่ | ผู้ค้นคว้า | หัวข้อ | แหล่งที่มา | ผลที่ได้ |
|---|---|---|---|---|
| 2026-11-04 | จิดารัตน์ มณีณัฐธิดา (คนที่ 1) | การเขียน Multi-stage Dockerfile และ Nginx SPA routing (`try_files`) | Docker Docs & Nginx Docs | ลดขนาด image, รันด้วย user `node` ไม่ใช้ root และแก้ปัญหา refresh หน้า React แล้ว 404 |
| 2026-11-11 | จิดารัตน์ มณีณัฐธิดา (คนที่ 1) | แยก Liveness (`/healthz`) กับ Readiness (`/readyz`) และใช้ ConfigMap + Secret ใน K8s | Kubernetes Probes & ConfigMap Docs | ป้องกัน Pod backend รีสตาร์ทวนเมื่อ DB หยุดทำงาน และเปลี่ยนค่าคอนฟิกได้โดยไม่ต้อง build image ใหม่ |
