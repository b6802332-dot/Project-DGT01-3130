# Project DGT01 3130 — Deploy ระบบทะเบียนและประเมินผลบน Kubernetes

เว็บแอป 3-Tier (React + Node/Express + PostgreSQL) Deploy บน Kubernetes พร้อม Gateway, Load Balance และ Scaling

## โครง repo

```
├── app/
│   ├── frontend/        # คนที่ 3-4 (Dockerfile: คนที่ 1)
│   └── backend/         # คนที่ 1-2
├── db/                  # คนที่ 5 (schema.sql, seed.sql)
├── ansible/             # คนที่ 2
├── k8s/
│   ├── app/             # คนที่ 1
│   ├── db/              # คนที่ 1
│   ├── gateway/         # คนที่ 2
│   └── scaling/         # คนที่ 2
├── docker-compose.yml   # คนที่ 1
└── docs/                # คนที่ 1 (คนที่ 3-5 ส่งภาพและ diagram ให้)
```

## กฎการใช้ Git

- แต่ละคนทำงานใน branch ของตัวเอง เช่น `feat/frontend` แล้วเปิด Pull Request เข้า `main`
- แก้ไฟล์ในโฟลเดอร์ของคนอื่นต้องแจ้งเจ้าของโฟลเดอร์ก่อน
- ห้าม commit รหัสผ่าน, kubeconfig หรือไฟล์ `.env` (ใส่ได้แค่ `.env.example`)
- เขียน commit message ให้อ่านรู้เรื่อง


## รันบนเครื่อง (docker compose)

```bash
docker compose up --build
```

เปิด http://localhost:8080 ใช้รหัสนักเรียนทดสอบ 6401001, 6401002, 6401003
ถ้าแก้ `db/seed.sql` ให้รัน `docker compose down -v` ก่อน เพราะสคริปต์ init รันเฉพาะตอนฐานข้อมูลว่าง

## Deploy บน k3s (Ansible)

1. แก้ `ansible/inventory.ini` ใส่ IP ของ master และ worker
2. ติดตั้ง k3s ทุกเครื่อง
   ```bash
   ansible-playbook -i ansible/inventory.ini ansible/site.yml
   ```
3. Deploy แอป
   ```bash
   ansible-playbook -i ansible/inventory.ini ansible/deploy.yml
   ```

ต้องรันจากโฟลเดอร์ root ของ repo และรัน `site.yml` ก่อน `deploy.yml` เสมอ
`deploy.yml` ทำงานบน master ตามลำดับ: รอ Traefik พร้อม, คัดลอก `k8s/` ไปที่ master, สร้าง namespace `sis`, สร้าง Secret `db-secret`, `kubectl apply -R` ทุก manifest แล้วแสดงสถานะ Pod/Service/Ingress/HPA

ระหว่างรันจะถามรหัสผ่านฐานข้อมูล (ไม่เก็บลง Git) หรือส่งเองด้วย `-e db_password=xxxx`
Secret `db-secret` มีคีย์ `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` และถูกสร้างโดย playbook ไม่ต้องสร้างด้วยมือ

## สถาปัตยกรรม

- Gateway: Traefik (มากับ k3s) ส่ง `/` ไป `frontend` และ `/api` ไป `backend`
- Service: `frontend` (80), `backend` (3000), `postgres-svc` (5432) ใน namespace `sis`
- Image: `jidarat/sis-backend:v2`, `jidarat/sis-frontend:v2`
- Backend มี `/healthz` (ไม่แตะฐานข้อมูล) และ `/readyz` (เช็กฐานข้อมูล) ใช้เป็น liveness/readiness
- Scaling: HPA ของ backend 2 ถึง 6 Pod ที่ CPU 50%

## ทดสอบหลัง Deploy

```bash
kubectl get pods,svc,ingress,hpa -n sis
curl http://<IP node>/api/courses
```

เปิด http://<IP node>/ แล้วลองลงทะเบียน `CS201` ด้วยรหัส `6401003` (วิชาที่เต็มคือ `PH101`, `MA101`)
ผลทดสอบละเอียดอยู่ที่ `docs/TESTING.md` และผู้ร่วมงานอยู่ที่ `docs/CONTRIBUTION.md`

## หมายเหตุ: ส่วนที่ต่างจากคู่มือโปรเจกต์

| หัวข้อ | คู่มือ | ที่ใช้จริง | เหตุผล |
|---|---|---|---|
| Gateway | Ingress NGINX | Traefik (มากับ k3s) | ไม่ต้องติดตั้งเพิ่ม และทำหน้าที่ Ingress ได้เหมือนกัน (`/` ไป frontend, `/api` ไป backend) |
| Playbook Ansible | `site.yml` ปิด traefik และติดตั้ง Ingress NGINX | ไม่ปิด traefik | สอดคล้องกับ Gateway ที่ใช้จริง |
| Health check | `/healthz` อย่างเดียว | แยก `/healthz` (liveness) กับ `/readyz` (readiness) | readiness ตรวจ DB ส่วน liveness ไม่ตรวจ เพื่อไม่ให้ Pod รีสตาร์ททั้งหมดเมื่อ DB ล่ม |
| ฐานข้อมูล | StatefulSet + volumeClaimTemplates | Deployment + PersistentVolumeClaim แยก (`k8s/db/postgres.yaml`) | ใช้ replica เดียว ข้อมูลอยู่บน PVC จึงไม่หายเมื่อ Pod ถูกลบ (พิสูจน์แล้วจากการลบ Pod postgres) |
