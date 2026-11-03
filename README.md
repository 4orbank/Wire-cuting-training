# ฝึกตัดสายไฟ (Wire Cutting Trainer)

เกมฝึกตัดสายไฟ จับเวลา 8 วินาทีต่อรอบ (แก้ที่ `TIME_LIMIT_MS` ใน `packages/game-logic/src/constants.js`) ไม่มีปุ่มเริ่ม/หยุด ตัดแล้วแสดงผล ถูก / ผิด / หมดเวลา พร้อมปุ่มเล่นใหม่

## โครงสร้าง (แยกชัดเจน 3 ส่วน)

```
packages/game-logic/   กติกา + สุ่มสายไฟ + ตัดสินผล (JS ล้วน ไม่มี dependency, ไม่รู้จัก web/http)
api/                   Express: เปิดรอบ, รับคำตอบ, ตัดสินผลด้วย game-logic   (พอร์ต 3001)
web/                   Vue 3 + Vite: UI อย่างเดียว คุยกับ API ผ่าน HTTP เท่านั้น (พอร์ต 5173)
```

- `web` ไม่ import อะไรจาก `game-logic` เลย — เฉลยอยู่ฝั่ง API เท่านั้น (ส่งสายไฟมาให้ แต่ไม่ส่งคำตอบ)
- เปลี่ยนกติกา = แก้ที่ `packages/game-logic/src/rules.js` ไฟล์เดียว ทั้งตัวตัดสินและหน้าคู่มือเงื่อนไขอัปเดตเอง

## รันบนเครื่อง (ต้องมี Node 20+)

```bash
npm install          # ติดตั้งครั้งเดียวที่ root (npm workspaces)
npm test             # เทสต์ลอจิก + API
npm run dev          # รัน api (3001) และ web (5173) พร้อมกัน
```

เปิด http://localhost:5173

รันแยกทีละตัว:

```bash
npm run dev:api      # http://localhost:3001
npm run dev:web      # http://localhost:5173
```

ตั้งค่า (ไม่บังคับตอน dev เพราะมีค่าเริ่มต้น): คัดลอก `api/.env.example` → `api/.env` และ `web/.env.example` → `web/.env`

## API

| Method | Path | หน้าที่ |
|---|---|---|
| GET | `/api/health` | เช็กสถานะ |
| GET | `/api/rules` | กติกาทั้งหมด (ข้อความ) |
| POST | `/api/rounds` | เริ่มรอบ → `{ roundId, wires, timeLimitMs }` |
| POST | `/api/rounds/:id/cut` | body `{ "index": 0..n-1 \| null }` → `{ outcome, correct, cutIndex, correctIndex, ruleId, ruleText, elapsedMs }` |

`outcome` = `correct` / `wrong` / `timeout` (ส่ง `null` หรือส่งช้ากว่า 8 วินาที + 1.5 วินาทีเผื่อเน็ต)

## ขึ้น Git และ Render

1. `git init && git add . && git commit -m "init"` แล้ว push ขึ้น GitHub/GitLab
2. Render → New → Blueprint → เลือก repo (อ่าน `render.yaml` ให้อัตโนมัติ จะได้ 2 service: `wire-trainer-api` และ `wire-trainer-web`)
3. ตั้ง env หลังได้ URL ทั้งสองตัว
   - ที่ `wire-trainer-api`: `CORS_ORIGINS` = URL ของ web (เช่น `https://wire-trainer-web.onrender.com`)
   - ที่ `wire-trainer-web`: `VITE_API_URL` = URL ของ api แล้วกด Manual Deploy (ค่า VITE_* ถูกฝังตอน build)
4. แพ็กเกจ Free ของ Render จะหลับเมื่อไม่มีคนใช้ เปิดครั้งแรกอาจรอสักครู่

## หมายเหตุ

- รอบที่กำลังเล่นเก็บในหน่วยความจำของ API (หายเมื่อรีสตาร์ท ไม่เป็นปัญหาสำหรับเกมรอบละ 8 วินาที) ถ้าจะรันหลายอินสแตนซ์ให้ย้ายไป Redis
- สีที่ใช้ตอนนี้: ขาว แดง ฟ้า เหลือง (แก้ที่ `packages/game-logic/src/constants.js`)
