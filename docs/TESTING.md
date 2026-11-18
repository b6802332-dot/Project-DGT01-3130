# ผลการทดสอบ

ผู้ทดสอบ cluster: คนที่ 2 (ทดสอบบน cluster จริง วันที่ 18 พ.ย. 2026)

## 1. ข้อมูลไม่หายเมื่อ Pod ฐานข้อมูลถูกลบ (Persistence)
```bash
kubectl get deploy,pvc -n sis
curl "[http://192.168.56.201/api/register?student_id=6401003](http://192.168.56.201/api/register?student_id=6401003)"     # ก่อน
kubectl delete pod -l app=postgres -n sis
kubectl get pods -n sis -w                                     # รอ Running
curl "[http://192.168.56.201/api/register?student_id=6401003](http://192.168.56.201/api/register?student_id=6401003)"     # หลัง ต้องข้อมูลเดิม
```
- **สถานะ Deployment และ PVC**:
```text
NAME                       READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/backend    2/2     2            2           8d
deployment.apps/frontend   2/2     2            2           8d
deployment.apps/postgres   1/1     1            1           7d2h

NAME                                 STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
persistentvolumeclaim/postgres-pvc   Bound    pvc-32996a47-3b8a-42fd-ac23-cf2b5a434b34   1Gi        RWO            local-path     7d2h
```
- **ขั้นตอนที่ทำจริง**: เรียก `POST /api/register` (`student_id: 6401003`, `course_code: CS201`) ได้ `201 Created` จากนั้นลบ Pod `postgres` รอ Pod ใหม่ขึ้น แล้วเรียก `GET` ซ้ำยังเห็น `CS201`
- **ผล**: ผ่าน ข้อมูลถูกจัดเก็บบน `postgres-pvc` (สถานะ `Bound`, `1Gi`, `local-path`)

## 2. DB ล่ม: backend ไม่ Ready แต่ไม่ restart (`/readyz` vs `/healthz`)
```bash
kubectl scale deploy/postgres --replicas=0 -n sis
sleep 20; kubectl get pods -n sis -l app=backend
kubectl scale deploy/postgres --replicas=1 -n sis
```
- **ผลหลัง scale เป็น 0 (รอ 20 วินาที)**:
```text
NAME                       READY   STATUS    RESTARTS   AGE
backend-7cb5c5c4b5-4bqhr   0/1     Running   0          23m
backend-7cb5c5c4b5-7psd6   0/1     Running   0          23m
```
- **ผลหลัง scale กลับเป็น 1**: `postgres` rollout สำเร็จ `backend` กลับเป็น `1/1 Running` ทั้งสองตัว และทดสอบ `curl` ไปที่ `/` และ `/api/courses` ได้ HTTP `200`
- **สรุปผล**: ผ่าน Readiness probe (`/readyz`) ไม่ผ่านจึงหยุดรับทราฟฟิก แต่ Liveness probe (`/healthz`) ไม่แตะ DB จึงไม่รีสตาร์ท Pod วนซ้ำ (`RESTARTS = 0`)

## 3. แยกค่าคอนฟิกด้วย ConfigMap (`backend-config`)
```bash
kubectl apply -f k8s/app/
kubectl exec -n sis deploy/backend -- env | grep -E "DB_|SEMESTER"
curl -s [http://192.168.56.201/api/courses](http://192.168.56.201/api/courses)
```
- **ผล**: สร้าง ConfigMap `backend-config` ครบ 5 ค่า (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `SEMESTER`) โดย `DB_PASSWORD` ยังดึงจาก `db-secret` เดิม `backend` rollout สำเร็จและ `/api/courses` ตอบ JSON ปกติ

## 4. Load Balance
```bash
for i in $(seq 20); do curl -s -o /dev/null [http://192.168.56.201/api/courses](http://192.168.56.201/api/courses); done
kubectl logs -l app=backend -n sis --prefix --tail=-1 --since=2m | grep courses | cut -d' ' -f1 | sort | uniq -c
```
- **ผลลัพธ์จริง**:
```text
     10 [pod/backend-7cb5c5c4b5-4bqhr/backend]
     10 [pod/backend-7cb5c5c4b5-7psd6/backend]
```
- **สรุปผล**: ผ่าน ยิงคำขอ 20 ครั้ง กระจายไปยัง Backend Pod ทั้ง 2 ตัวเท่ากัน (Pod ละ 10 คำขอ)

## 5. HPA ขยาย Pod ตอนยิงโหลด (`k6`, `load.js`)
| ช่วง | จำนวน Pod | CPU % (Target 50%) |
|---|---|---|
| ก่อนยิงโหลด | 2 | 2% |
| สูงสุดขณะยิงโหลด | 6 | 244% |
| หลังโหลดลด (Cooldown) | 2 | 3% |

- **ผลจาก `kubectl get hpa -n sis -w`**:
```text
NAME      REFERENCE            TARGETS       MINPODS   MAXPODS   REPLICAS   AGE
backend   Deployment/backend   cpu: 2%/50%   2         6         2          10d
backend   Deployment/backend   cpu: 217%/50% 2         6         2          10d
backend   Deployment/backend   cpu: 244%/50% 2         6         4          10d
backend   Deployment/backend   cpu: 209%/50% 2         6         6          10d
backend   Deployment/backend   cpu: 17%/50%  2         6         6          10d
backend   Deployment/backend   cpu: 3%/50%   2         6         2          10d
```
- **สรุปผล**: ผ่าน HPA ขยาย Pod จาก `2` เป็น `4` และสูงสุด `6` Pod เมื่อ CPU เกิน `50%` และลดกลับเหลือ `2` Pod อัตโนมัติหลังโหลดลดลง

## 6. Self-healing และ Rolling update
- **ผล**: TODO (รอผลลบ Pod backend และอัปเดต image `v1` -> `v2` จากคนที่ 2)

## 7. ลงทะเบียนวิชาเต็ม / ลงทะเบียนซ้ำ
- **ผล**:
  - วิชา `PH101` และ `MA101` ที่นั่งเต็มแล้ว ตอบ `409 Conflict` (`{"error":"ที่นั่งเต็ม"}`)
  - หมายเหตุ: รหัส `6401003` ใน DB จริงมี `CS101`, `CS201`, `EN101` อยู่แล้ว หากทดสอบลงทะเบียน `CS201` ซ้ำจะได้ `409 Conflict` (`{"error":"ลงทะเบียนวิชานี้แล้ว"}`)

## ปัญหาที่เจอและวิธีแก้
- **Postgres บน Ubuntu 26.04 ติด AppArmor (PR #11)**: ปรับตั้งค่าและ probe timeout ให้ Pod ฐานข้อมูลเริ่มทำงานได้ปกติ
- **Backend รีสตาร์ทวนเมื่อฐานข้อมูลไม่พร้อม (PR #12)**: แยก `/healthz` (ตรวจเฉพาะโปรเซสแอป) ออกจาก `/readyz` (ตรวจการเชื่อมต่อ PostgreSQL)

## 8. ทดสอบทำตาม README บนเครื่องสมาชิก (คนที่ 3)
- **ผู้ทดสอบ**: คนที่ 3 (ทดสอบกับ `main` ล่าสุดรวม PR #14 และ `README.md` ฉบับอัปเดต)
- **ผลลัพธ์**:
  - `docker compose config` และ `ansible-playbook --syntax-check` ผ่าน
  - ทดสอบครบทุกหน้าบนพอร์ต `8080` ด้วยรหัส `6401001`–`6401003` ได้ GPAX `3.75` / `2.75` / `2.00` ถูกต้อง
  - ลงทะเบียน `CS201` ด้วย `6401003` ได้ `201 Created` และวิชาเต็ม (`PH101`, `MA101`) ได้ `409 Conflict`
  - ผลตรวจ `check-gateway.mjs` ผ่าน `10/10`
