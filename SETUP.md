# Setup Guide — AWS SAA-C03 Sprint Dashboard

## สิ่งที่ต้องทำ 4 ขั้นตอน

---

## Step 1 — สร้าง Firebase Project

1. ไปที่ https://console.firebase.google.com
2. คลิก **Add project** → ตั้งชื่อ เช่น `aws-sprint-dashboard`
3. ปิด Google Analytics (ไม่จำเป็น) → **Create project**

---

## Step 2 — เปิด Google Sign-in

1. Firebase Console → **Authentication** → **Get started**
2. **Sign-in method** → เลือก **Google** → Enable → **Save**

---

## Step 3 — สร้าง Firestore Database

1. Firebase Console → **Firestore Database** → **Create database**
2. เลือก **Start in production mode** → **Next**
3. เลือก Region: **asia-southeast1 (Singapore)** → **Enable**
4. ไปที่ **Rules** tab → แทนที่ทุกอย่างด้วย:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

5. คลิก **Publish**

---

## Step 4 — เอา Config มาใส่

1. Firebase Console → **Project Settings** (รูปเฟือง)
2. เลื่อนลงมาที่ **Your apps** → คลิก **</>** (Web app)
3. ตั้งชื่อ app → **Register app**
4. Copy ค่า `firebaseConfig` ทั้งหมด
5. เปิดไฟล์ `js/firebase-config.js` → แทนที่ค่า placeholder ทุกตัว

ตัวอย่าง:
```javascript
const firebaseConfig = {
  apiKey:            "AIzaSy...",
  authDomain:        "aws-sprint-dashboard.firebaseapp.com",
  projectId:         "aws-sprint-dashboard",
  storageBucket:     "aws-sprint-dashboard.appspot.com",
  messagingSenderId: "1234567890",
  appId:             "1:1234567890:web:abc123"
};
```

---

## Step 5 — Push ขึ้น GitHub

```bash
# สร้าง repo ใหม่บน GitHub ชื่อ: aws-sprint-dashboard
# แล้วรันคำสั่งนี้ใน folder นี้:

git init
git add .
git commit -m "init sprint dashboard"
git remote add origin https://github.com/YOUR_USERNAME/aws-sprint-dashboard.git
git push -u origin main
```

---

## Step 6 — เปิด GitHub Pages

1. GitHub repo → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main** → Folder: **/ (root)** → **Save**
4. รอ 1-2 นาที → ได้ URL: `https://YOUR_USERNAME.github.io/aws-sprint-dashboard`

---

## Step 7 — เพิ่ม GitHub Pages domain ใน Firebase Auth

1. Firebase Console → **Authentication** → **Settings** → **Authorized domains**
2. คลิก **Add domain**
3. ใส่: `YOUR_USERNAME.github.io`
4. **Add**

---

## เสร็จแล้ว!

เปิด URL จาก GitHub Pages → Sign in with Google → ตั้ง Sprint Start Date ใน Settings → เริ่มใช้งานได้เลย

---

## หมายเหตุ

- ข้อมูลทั้งหมดเก็บใน Firebase Firestore (ฟรี Spark plan)
- Free tier: 1GB storage, 50,000 reads/day — เพียงพอสำหรับใช้คนเดียวตลอด 12 สัปดาห์
- เข้าได้จากทุกเครื่อง / มือถือ โดย Sign in ด้วย Google account เดิม
