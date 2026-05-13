# Setup Guide — AWS SAA-C03 Sprint Dashboard

Dashboard นี้เป็น static web app ที่เก็บข้อมูลใน `localStorage` ของ browser เครื่องนั้นๆ ไม่ต้องใช้ Firebase, database, login, หรือ backend

## ใช้งานแบบ local

1. เปิดไฟล์ `index.html` ด้วย browser
2. ไปที่ tab `Settings`
3. ตั้ง `Sprint Start Date`
4. ตั้ง `Weekly Hour Target`
5. เริ่ม log การเรียนใน tab `Log Today`

## Deploy ด้วย GitHub Pages

1. สร้าง repo ใหม่บน GitHub เช่น `aws-sprint-dashboard`
2. push ไฟล์ทั้งหมดขึ้น repo

```bash
git init
git add .
git commit -m "init sprint dashboard"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/aws-sprint-dashboard.git
git push -u origin main
```

3. เปิด GitHub repo แล้วไปที่ `Settings` -> `Pages`
4. Source: `Deploy from a branch`
5. Branch: `main`, Folder: `/ (root)`
6. กด `Save`
7. รอ 1-2 นาที แล้วเปิด URL:

```text
https://YOUR_USERNAME.github.io/aws-sprint-dashboard
```

## Backup และย้ายเครื่อง

ข้อมูลถูกเก็บใน browser ของเครื่องที่ใช้งานผ่าน `localStorage` ดังนั้นข้อมูลจะไม่ sync ข้ามเครื่องอัตโนมัติ

วิธี backup:

1. กด `Export` ด้านบนขวา
2. เก็บไฟล์ `sprint-backup-YYYY-MM-DD.json`

วิธี restore หรือย้ายเครื่อง:

1. เปิด dashboard ใน browser เครื่องใหม่
2. กด `Import`
3. เลือกไฟล์ backup `.json`

## หมายเหตุสำคัญ

- ถ้า clear browser data หรือใช้ incognito ข้อมูลอาจหายได้
- ถ้าใช้หลาย browser ข้อมูลจะแยกกัน
- ถ้าต้องการ sync ข้ามเครื่องจริงๆ ค่อยเพิ่ม Firebase/Firestore หรือ backend ภายหลัง
- เวอร์ชันปัจจุบันตั้งใจให้เรียบง่าย: เปิดได้เร็ว, deploy ง่าย, ใช้คนเดียวได้ทันที
