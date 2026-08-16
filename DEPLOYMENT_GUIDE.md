# 🚀 Vercel ও Google Play Store অটোমেটিক CI/CD সেটআপ গাইড

এই ডকুমেন্টে আপনার গিটহাবে কোড পুশ করার সাথে সাথে **Vercel (ওয়েবসাইট)** এবং **Google Play Store (অ্যান্ড্রয়েড অ্যাপ)**-এ অটোমেটিক ডেপ্লয় করার পূর্ণাঙ্গ নির্দেশনা দেওয়া হয়েছে।

---

## 🛠️ ১. প্রয়োজনীয় গিটহাব সিক্রেটস (GitHub Repository Secrets)
আপনার গিটহাব রিপোজিটরির **Settings -> Secrets and variables -> Actions -> New repository secret**-এ গিয়ে নিচের সিক্রেটগুলো যোগ করুন:

### 🌐 Vercel-এর জন্য:
1. `VERCEL_TOKEN`: Vercel Account Settings -> Tokens থেকে তৈরি করা পার্সোনাল অ্যাক্সেস টোকেন।
2. `VERCEL_ORG_ID`: Vercel প্রজেক্ট সেটিংসের `orgId` (অথবা আপনার টিম আইডি)।
3. `VERCEL_PROJECT_ID`: Vercel প্রজেক্ট সেটিংসের `projectId`।

---

### 📱 Google Play Store ও Android Signing-এর জন্য:
1. `ANDROID_KEYSTORE_BASE64`: আপনার রিলিজ `.keystore` বা `.jks` ফাইলের Base64 স্ট্রিং।
   - জেনারেট করার কমান্ড:
     ```bash
     base64 -w 0 my-release-key.keystore > keystore_base64.txt
     ```
   - (ম্যাক ব্যবহারকারী হলে: `base64 -i my-release-key.keystore -o keystore_base64.txt`)
2. `KEYSTORE_PASSWORD`: Keystore তৈরি করার সময় দেওয়া পাসওয়ার্ড।
3. `KEY_ALIAS`: Keystore-এর অ্যালিয়াস নাম (যেমন: `amarbazar-key`)।
4. `KEY_PASSWORD`: Key-এর পাসওয়ার্ড।
5. `PLAY_STORE_JSON_KEY`: Google Cloud Console / Google Play Console থেকে তৈরি করা **Service Account JSON Key** ফাইলের ভেতরের সম্পূর্ণ টেক্সট।

---

## 📦 ২. লোকাল মেশিনে Android ফোল্ডার যুক্ত ও টেস্ট করার নিয়ম

আপনার লোকাল পিসিতে টার্মিনালে রান করুন:
```bash
# ১. ডিপেন্ডেন্সি ও বিল্ড
npm install
npm run build

# ২. ক্যাপাসিটর অ্যান্ড্রয়েড প্ল্যাটফর্ম যুক্ত করা
npx cap add android

# ৩. ওয়েব অ্যাসেটস সিঙ্ক করা
npx cap sync android

# ৪. অ্যান্ড্রয়েড স্টুডিওতে ওপেন করা
npx cap open android
```

---

## 🔢 ৩. ভার্সন ম্যানেজমেন্ট ও রিলিজ গাইডলাইন (Play Store Versioning)
Google Play Store-এ প্রতিটি নতুন আপডেটের জন্য `versionCode` প্রতিবার বাড়াতে হবে।
`android/app/build.gradle`-এ:
```groovy
defaultConfig {
    applicationId "com.amarbazarbd.app"
    minSdkVersion 22
    targetSdkVersion 34
    versionCode 2       // 👈 প্রতি আপডেটে ১ করে বাড়াবেন (যেমন: ১, ২, ৩...)
    versionName "1.0.1" // 👈 ইউজারদের দেখানোর জন্য ভার্সন নাম
}
```

---

## 🔄 ৪. অটোমেশন ফ্লো কিভাবে কাজ করবে?
১. আপনি যখনই `main` বা `master` ব্রাঞ্চে কোড **`git push`** করবেন:
   - **Step 1:** GitHub Actions স্বয়ংক্রিয়ভাবে ভিটাইট/ওয়েব বিল্ড তৈরি করবে এবং **Vercel**-এ লাইভ ওয়েবসাইট আপডেট করে দেবে।
   - **Step 2:** একই সাথে এটি ক্যাপাসিটরের মাধ্যমে কোড সিঙ্ক করে **Fastlane** ও **Gradle** দিয়ে সাইনড রিলিজ বান্ডেল (`.aab`) ফাইল তৈরি করবে।
   - **Step 3:** তৈরি হওয়া `.aab` ফাইল সরাসরি Google Play Console-এর **Internal/Production Track**-এ আপলোড হয়ে যাবে।
