# ผลการทดสอบ

ผู้ทดสอบ cluster: คนที่ 2

## 1. ข้อมูลไม่หายเมื่อ Pod ฐานข้อมูลถูกลบ
```bash
curl "http://<IP>/api/register?student_id=6401003"     # ก่อน
kubectl delete pod -l app=postgres -n sis
kubectl get pods -n sis -w                              # รอ Running
curl "http://<IP>/api/register?student_id=6401003"     # หลัง ต้องข้อมูลเดิม
```
ผล: TODO (แนบภาพ/output)

## 2. DB ล่ม: backend ไม่ Ready แต่ไม่ restart
```bash
kubectl scale deployment postgres -n sis --replicas=0
kubectl get pods -n sis     # backend 0/1, RESTARTS ไม่เพิ่ม
kubectl scale deployment postgres -n sis --replicas=1
```
ผล: TODO

## 3. Load Balance
ผล: TODO (log หลาย Pod จาก `kubectl logs -l app=backend -n sis --prefix`)

## 4. HPA ขยาย Pod ตอนยิงโหลด (k6, load.js)
| ช่วง | จำนวน Pod | CPU % |
|---|---|---|
| ก่อน | TODO | TODO |
| สูงสุด | TODO | TODO |
| หลังโหลดลด | TODO | TODO |

## 5. Self-healing และ Rolling update
ผล: TODO

## 6. ลงทะเบียนวิชาเต็ม
`PH101` และ `MA101` ต้องได้ 409 ผล: TODO

## ปัญหาที่เจอและวิธีแก้
- Postgres บน Ubuntu 26.04 ติด AppArmor (PR #11)
- TODO
