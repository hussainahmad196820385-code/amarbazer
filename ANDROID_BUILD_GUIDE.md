# AmarBazar BD - Unified Web & Android (Play Store AAB) Build Guide

এই প্রজেক্টটি **একই সাথে একটি আধুনিক রেসপনসিভ ওয়েব অ্যাপ্লিকেশন এবং নেটিভ অ্যান্ড্রয়েড অ্যাপ (Google Play Store Ready AAB/APK)** হিসেবে কাজ করার জন্য সম্পূর্ণ কনফিগার করা হয়েছে।

---

## 🌟 মূল বৈশিষ্ট্যসমূহ (Core Architecture)
1. **একক কোডবেস (Single Codebase)**: ওয়েব এবং অ্যান্ড্রয়েড অ্যাপ উভয়ের জন্য একই React 19 + TypeScript কোডবেস ব্যবহার করা হয়েছে।
2. **একই ডাটাবেস ও বিজনেস লজিক (Shared Database & Business Logic)**: 
   - কাস্টমার, সেলার এবং এডমিন অ্যাকাউন্ট
   - প্রোডাক্ট ক্যাটালগ, ক্যাটাগরি, ইনভেন্টরি
   - কার্ট, কুপন, অর্ডার ও বিকাশ/নগদ পেমেন্ট ভেরিফিকেশন
   - রিয়েল-টাইম স্টেট ও সিকিউরিটি
3. **অ্যান্ড্রয়েড নেটিভ সাপোর্ট (Capacitor Bridge)**:
   - **Hardware Back Button Handling**: অ্যান্ড্রয়েড ব্যাক বাটন চাপলে মডাল, ড্রয়ার বন্ধ হবে এবং হোমস্ক্রিনে ফিরে আসবে; ২ সেকেন্ডের মধ্যে ডাবল-ট্যাপ করলে অ্যাপ বন্ধ হবে।
   - **Splash Screen & Status Bar**: অ্যান্ড্রয়েড নোটিফিকেশন বার ও স্প্ল্যাশ স্ক্রিনের আধুনিক কালার প্যালেট।
   - **Notch & Safe Area**: পাঞ্চহোল ও নচ স্ক্রিনের জন্য `viewport-fit=cover` ও সেফ-এরিয়া প্যাডিং।
   - **File & Camera Picker**: প্রোডাক্ট ইমেজ ও শপ লোগো আপলোডের জন্য নেটিভ ফাইল ও ক্যামেরা পারমিশন প্রস্তুত।
4. **Google Play Store Ready**:
   - Package Name: `com.amarbazar.app`
   - Target SDK: **34** (Android 14+ Play Store Requirement)
   - Min SDK: **22** (Android 5.1 Lollipop+)
   - Output Format: **Android App Bundle (.aab)** & **Universal APK (.apk)**

---

## 🚀 লোকাল মেশিনে Android App ও AAB তৈরি করার নিয়মাবলী

### প্রয়োজনীয় সফটওয়্যার (Prerequisites):
- **Node.js**: v18+ বা v20+
- **Android Studio**: সর্বশেষ সংস্করণ (Hedgehog / Iguana / Jellyfish)
- **JDK**: Java Development Kit 17 বা 21

---

### ধাপ ১: ওয়েব প্রজেক্ট বিল্ড করা
প্রথমে React ওয়েব ফাইলগুলো কম্পাইল করে `dist/` ফোল্ডারে বিল্ড করুন:
```bash
npm run build:web
```

### ধাপ ২: অ্যান্ড্রয়েড প্রোজেক্টের সাথে সিঙ্ক করা (Sync Assets)
ওয়েব বিল্ডের ফাইলগুলো অ্যান্ড্রয়েড নেটিভ ডিরেক্টরিতে সিঙ্ক করুন:
```bash
npm run build:android
```
অথবা সরাসরি:
```bash
npx cap sync android
```

---

### ধাপ ৩: Android Studio-তে প্রোজেক্ট ওপেন করা
```bash
npm run cap:open
```
অথবা সরাসরি Android Studio ওপেন করে এই প্রজেক্টের `android/` ফোল্ডারটি ওপেন করুন।

---

### ধাপ ৪: সরাসরি টেস্টিংয়ের জন্য Debug APK তৈরি করা
Android Studio-র ভেতরে টার্মিনালে নিচের কমান্ডটি চালান:
```bash
cd android
./gradlew assembleDebug
```
👉 আউটপুট APK ফাইলটি এখানে পাবেন:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

### ধাপ ৫: Google Play Store-এর জন্য Signed AAB (Android App Bundle) তৈরি করা

1. **Keystore ফাইল তৈরি করুন (যদি পূর্বে না থাকে)**:
```bash
keytool -genkey -v -keystore amarbazar-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias amarbazar-key
```

2. **Android Studio থেকে Signed Bundle তৈরি করুন**:
   - Android Studio মেনু থেকে **Build** > **Generate Signed Bundle / APK...** সিলেক্ট করুন।
   - **Android App Bundle** সিলেক্ট করে **Next** দিন।
   - আপনার Keystore পাথ, পাসওয়ার্ড এবং Alias দিন।
   - Build Variant হিসেবে **release** সিলেক্ট করে **Create** বাটনে ক্লিক করুন।

3. **অথবা কমান্ড লাইনে বিল্ড করুন**:
```bash
cd android
./gradlew bundleRelease
```
👉 আউটপুট AAB ফাইলটি এখানে পাবেন:
`android/app/build/outputs/bundle/release/app-release.aab`

---

## 🌐 প্রোডাকশন ব্যাকএন্ড ও সার্ভার কানেকশন (Unified Live API)
অ্যান্ড্রয়েড অ্যাপটি যখন ব্যবহারকারী প্লে স্টোর থেকে ডাউনলোড করে ইনস্টল করবেন, তখন অ্যাপের রিকোয়েস্টগুলো আপনার লাইভ ক্লাউড সার্ভারের সাথে সরাসরি কানেক্ট হবে।

1. আপনার লাইভ সার্ভার ডোমেইন (যেমন `https://api.amarbazar.com.bd` বা আপনার Cloud Run URL) `.env` ফাইলে সেট করতে পারেন:
```env
VITE_API_URL=https://your-live-domain.com
```
2. অথবা অ্যাপের **Settings** প্যানেল থেকেও API Endpoint পরিবর্তন ও টেস্ট করা যায়।

---

## 📋 Google Play Store Publishing Checklist
- [x] Package Name: `com.amarbazar.app`
- [x] Target SDK Version: `34`
- [x] Deep Linking Domain: `https://amarbazar.com.bd`
- [x] App Icon: 512x512 PNG (`/public/icon.svg` / `/public/icon-512.png`)
- [x] Camera & Storage Permissions configured in `AndroidManifest.xml`
- [x] Hardware Back Button & Lifecycle bridge implemented
- [x] Web PWA Manifest & Responsive Mobile Layout ready
