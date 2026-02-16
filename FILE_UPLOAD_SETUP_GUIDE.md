# 📁 File Upload Setup Guide (Hindi)

## समस्या: "Loading Failed" Document Upload Error

जब आप documents (PDF, Word, Doc) को repurpose करने के लिए upload करते हैं तो "loading failed" error आ रहा है।

## समस्या का कारण

आपके project में **Cloudinary configuration missing है**। Cloudinary एक cloud-based file storage service है जो files को upload और store करती है।

## समाधान (Solution)

### विकल्प 1: Cloudinary Setup करें (RECOMMENDED - Production के लिए)

#### Step 1: Cloudinary Account बनाएं

1. https://cloudinary.com पर जाएं
2. Free account के लिए sign up करें
3. Dashboard में login करें

#### Step 2: Credentials प्राप्त करें

1. Cloudinary Dashboard में जाएं
2. **Settings → Account** पर click करें
3. निम्नलिखित 3 values copy करें:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

#### Step 3: Environment Variables सेट करें

**Server के लिए (`server/.env`):**

```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**महत्वपूर्ण:** 
- `your_cloud_name_here`, `your_api_key_here`, और `your_api_secret_here` को अपने actual Cloudinary credentials से replace करें
- यह values Dashboard → Settings → Account में मिलेंगी

#### Step 4: Server Restart करें

```bash
# Server को restart करें
cd server
npm run dev
```

### विकल्प 2: Local File Storage का उपयोग करें (Development के लिए)

अगर आप सिर्फ testing/development कर रहे हैं और Cloudinary setup नहीं करना चाहते:

1. **कोई configuration की जरूरत नहीं!** 
2. Code automatically local file storage पर switch हो जाएगा
3. Files `server/uploads/` folder में save होंगी

**ध्यान दें:**
- यह सिर्फ local development के लिए है
- Production/Deployment के लिए Cloudinary जरूरी है
- Vercel/Railway पर local storage काम नहीं करेगा

## Deployment के लिए (Vercel/Railway)

### Vercel पर:

1. Vercel Dashboard में अपने project को open करें
2. **Settings → Environment Variables** में जाएं
3. निम्नलिखित variables add करें:
   ```
   CLOUDINARY_CLOUD_NAME = your_cloud_name
   CLOUDINARY_API_KEY = your_api_key
   CLOUDINARY_API_SECRET = your_api_secret
   ```
4. **Redeploy** करें

### Railway पर:

1. Railway Dashboard में project को open करें
2. **Variables** tab में जाएं
3. Cloudinary credentials add करें
4. Service automatically redeploy हो जाएगी

## Troubleshooting

### Error: "Cloudinary is not configured"

**समाधान:**
1. `.env` file में Cloudinary credentials जांचें
2. सुनिश्चित करें कि सभी 3 values सही हैं
3. Server restart करें

### Error: "File type not supported"

**समाधान:**
Code अब निम्नलिखित file types support करता है:
- **Video:** MP4, MOV, AVI, etc.
- **Audio:** MP3, WAV, etc.
- **Documents:** PDF, DOCX, DOC, TXT
- **Images:** JPG, PNG, GIF, etc.

### Upload अभी भी fail हो रहा है?

**Debug Steps:**

1. **Terminal में server logs देखें:**
   ```bash
   cd server
   npm run dev
   ```

2. **Browser Console देखें:**
   - Browser में F12 press करें
   - Console tab में errors देखें

3. **Network Tab देखें:**
   - F12 → Network tab
   - Upload करते समय request देखें
   - Response में error message check करें

## Supported File Types और Limits

| File Type | Max Size | Formats |
|-----------|----------|---------|
| Video | 2GB | MP4, MOV, AVI, WMV |
| Audio | 2GB | MP3, WAV, M4A |
| Documents | 2GB | PDF, DOCX, DOC, TXT |
| Images | 2GB | JPG, PNG, GIF, WEBP |

## Additional Notes

### Free Tier Limits (Cloudinary):

- **Storage:** 25GB
- **Bandwidth:** 25GB/month
- **Transformations:** 25,000/month
- यह एक small-medium project के लिए काफी है

### Production Best Practices:

1. ✅ Cloudinary का उपयोग करें (न कि local storage)
2. ✅ Environment variables को `.env` में रखें
3. ✅ Git में `.env` file को commit न करें
4. ✅ Different credentials testing और production के लिए use करें

## संपर्क और सहायता

अगर फिर भी problem है:

1. Server terminal logs screenshot भेजें
2. Browser console errors copy करें
3. Upload करते समय Network tab की screenshot लें

---

**Updated:** 2026-02-16
**Version:** 1.0
