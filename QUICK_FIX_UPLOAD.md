# 🚨 URGENT: Document Upload Fix Kaise Karein

## Problem
जब आप documents (PDF, Word, Doc) upload करते हैं तो **"loading failed"** error आता है।

## तुरंत करें (Do This Now)

### Option A: Cloudinary Setup (5 मिनट में) ✅ RECOMMENDED

```bash
# 1. https://cloudinary.com पर Free Account बनाएं

# 2. Dashboard से ये 3 values copy करें:
#    - Cloud Name
#    - API Key  
#    - API Secret

# 3. server/.env file खोलें और add करें:
CLOUDINARY_CLOUD_NAME=आपका_cloud_name
CLOUDINARY_API_KEY=आपकी_api_key
CLOUDINARY_API_SECRET=आपकी_api_secret

# 4. Server restart करें:
cd server
npm run dev
```

### Option B: Testing के लिए (0 मिनट - कुछ नहीं करना!) 

अगर आप सिर्फ test कर रहे हैं:

**✅ कुछ करने की जरूरत नहीं!**

Code automatically local file storage use करेगा। बस server restart करें:

```bash
cd server  
npm run dev
```

Files `server/uploads/` folder में save होंगी।

⚠️ **Warning:** Production deployment (Vercel/Railway) के लिए Cloudinary जरूरी है!

## Quick Check करें

Upload करने के बाद:

```bash
# Server logs में ये देखें:
✅ "Upload request received"
✅ "Content created successfully"
✅ "Using local file storage" या "Using Cloudinary"

❌ अगर error है तो यहाँ देखें:
FILE_UPLOAD_SETUP_GUIDE.md
```

## अभी भी Problem?

1. **Server terminal check करें** - error message देखें
2. **Browser Console (F12) check करें** - network errors देखें  
3. **Full Guide पढ़ें:** `FILE_UPLOAD_SETUP_GUIDE.md`

---

**Quick Help:** अगर Cloudinary setup में confusion है, तो Option B use करें (local storage) testing के लिए।
