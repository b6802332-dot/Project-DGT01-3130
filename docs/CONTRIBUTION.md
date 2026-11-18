# บันทึกการมีส่วนร่วมของสมาชิก

ทีมมี 5 คน คนที่ 4 และ 5 ไม่มีบัญชี GitHub ใน repo จึงส่งงานผ่านคนที่ 3 (บัญชี b6802332-dot) ประวัติ git ของ PR #2 และ #9 จึงเป็นชื่อคนที่ 3

| คนที่ | ชื่อ | บัญชี GitHub / ชื่อใน git | หน้าที่ | PR |
|---|---|---|---|---|
| 1 | Jidarat | jidaratjidarat9-lang (Jidarat, jidarat) | Backend (grades, gpa, schedule), Docker, K8s, เอกสาร | #3 #4 #6 #8 #10 #12 #15 |
| 2 | TODO | Game555web (Game555) | Backend (courses, register, announcements), Ansible, Gateway, HPA, สไลด์ | #5 #7 #11 #13 |
| 3 | Sirapop | b6802332-dot (Sirapop) | Frontend โครงโปรเจกต์, หน้าผลการเรียน/GPA, ตารางเรียน/สอบ | #1 |
| 4 | TODO | ส่งผ่านคนที่ 3 | Frontend หน้าลงทะเบียน, ข่าวประกาศ | #9 (เปิดโดยคนที่ 3) |
| 5 | TODO | ส่งผ่านคนที่ 3 | Database (schema.sql, seed.sql) | #2 (เปิดโดยคนที่ 3) |

จำนวน commit (จาก `git shortlog -sn` รวมชื่อซ้ำของคนเดียวกันแล้ว): คนที่ 1 = 18, คนที่ 2 = 6, คนที่ 3 (รวมงานที่ส่งแทนคนที่ 4 และ 5) = 8 เป็นข้อมูลประกอบเท่านั้น

## บันทึกการใช้ AI

| คนที่ | ใช้ AI ช่วยตรงไหน | เครื่องมือ | ตรวจสอบผลอย่างไร |
|---|---|---|---|
| 1 | ช่วยร่าง Dockerfile ของ backend/frontend, docker-compose, K8s manifests (Deployment, StatefulSet, Service, probe), แยก /healthz กับ /readyz, ช่วยหาสาเหตุ backend ล้มเมื่อ Postgres หยุด และช่วยร่างเอกสาร README | Claude | รันทดสอบเองด้วย docker compose และ curl, ตรวจ diff ก่อน commit, ให้คนที่ 2 ทดสอบบน cluster จริงแล้วดูผลด้วย kubectl |
| 2 | TODO | TODO | TODO |
| 3 | TODO | TODO | TODO |
| 4 | TODO | TODO | TODO |
| 5 | TODO | TODO | TODO |

## Research log

| วันที่ | ผู้ค้นคว้า | หัวข้อ | แหล่งที่มา | ผลที่ได้ |
|---|---|---|---|---|
| TODO | | | | |
