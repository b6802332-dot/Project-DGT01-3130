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
