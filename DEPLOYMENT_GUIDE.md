# 🚀 AmarBazar BD: গিটহাব ➔ ভার্সেল ➔ ফায়ারবেজ (GitHub ➔ Vercel ➔ Firebase) ডেপ্লয়মেন্ট গাইড

আপনার ওয়েবসাইট যাতে **কখনোই স্লিপ না করে (Never Goes to Sleep)**, সবসময় **সুপারফাস্ট স্পিডে (<0.1s)** লোড হয় এবং সমস্ত ডাটা তাৎক্ষণিক রিয়েল-টাইমে সিঙ্ক থাকে, সেজন্য সবচেয়ে সেরা আর্কিটেকচার হলো:
**১. কোড ম্যানেজমেন্ট ও ব্যাকআপ:** GitHub
**২. হাই-স্পিড ফ্রন্টএন্ড হোস্টিং (Global Edge CDN, No Cold Starts):** Vercel
**৩. 24/7 লাইভ ডাটাবেজ, অথেন্টিকেশন ও ক্লাউড স্টোরেজ:** Firebase Firestore

---

## ⚡ কেন এই আর্কিটেকচার সবচেয়ে সেরা ও ফাস্ট?
1. **স্লিপ বা বন্ধ হওয়ার কোনো সুযোগ নেই:** সাধারণ ফ্রি সার্ভার ৫-১০ মিনিট পর বন্ধ হয়ে যায়। কিন্তু Vercel Edge Network এবং Firebase ক্লাউড কখনো স্লিপ করে না।
2. **অল-ডিভাইস ইনস্ট্যান্ট সিঙ্ক:** ফায়ারবেসের রিয়েল-টাইম লিসেনারের মাধ্যমে ফোন, ল্যাপটপ বা যেকোনো ডিভাইসে ডাটা পরিবর্তন (নতুন পণ্য, এডিট, ডিলিট) সাথে সাথে লাইভ দৃশ্যমান হয়।
3. **০ms ক্যাশিং ও স্পিড:** সাইট ওপেন করার সাথে সাথে Vercel CDN এবং লোকাল স্টোরেজ থেকে নিমিষেই পেজ লোড হবে।

---

## 📌 ধাপ ১: কোড GitHub-এ পুশ করুন
১. টার্মিনালে প্রজেক্ট ডিরেক্টরিতে যান:
```bash
git add .
git commit -m "Optimize for Vercel and Firebase real-time sync"
git push origin main
```

---

## 📌 ধাপ ২: Vercel-এ ১-ক্লিকে ডেপ্লয় করুন
১. [Vercel Dashboard](https://vercel.com/new)-এ যান।
২. আপনার **GitHub Repository** (`AmarBazarBD`) সিলেক্ট করে **Import** করুন।
৩. প্রজেক্ট সেটিংস:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build:web`
   - **Output Directory**: `dist`
4. **Environment Variables**:
   - `NODE_ENV` = `production`
   - `VITE_FIREBASE_PROJECT_ID` = `amarbazer-519c5`
5. **Deploy** বাটনে ক্লিক করুন। ২ মিনিটের মধ্যে আপনার সুপারফাস্ট ওয়েবসাইট লাইভ হয়ে যাবে!

---

## 📌 ধাপ ৩: Firebase Firestore রুলস ও ডাটাবেজ
আপনার ফায়ারবেস কনফিগারেশন অলরেডি কোডের সাথে সরাসরি যুক্ত (`amarbazer-519c5`)।
টার্মিনাল থেকে ফায়ারবেস রুলস আপডেট করতে:
```bash
firebase deploy --only firestore:rules
```

---

## 📱 বোনাস: Android Play Store রিলিজ
অ্যান্ড্রয়েড অ্যাপ বান্ডেল তৈরি করার কমান্ড:
```bash
npm run build:android
```
এবং Android Studio-তে ওপেন করতে:
```bash
npx cap open android
```

