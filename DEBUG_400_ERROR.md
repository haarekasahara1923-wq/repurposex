# 🔧 Document Upload 400 Error - Debug Guide

## समस्या (Current Issue)
Upload करते समय **400 Bad Request** error आ रहा है।

## Debug करने के Steps

### 1️⃣ Backend Logs देखें (सबसे महत्वपूर्ण)

**Vercel Dashboard में:**
1. अपना project खोलें
2. **Deployments** → Latest deployment
3. **Functions** tab में जाएं
4. Upload करें और real-time logs देखें

**देखने के लिए:**
```
====== UPLOAD REQUEST RECEIVED ======
Headers: { ... }
Body: { ... }
File object: { ... }
```

### 2️⃣ Browser Console में Detail देखें

Upload करते समय browser console (F12) में check करें:

```javascript
// आपको ये दिखना चाहिए:
Starting upload... { hasFile: true, hasUrl: false, hasTitle: true }

// Error होने पर:
Upload failed - Full error: ...
Error response: { success: false, error: { code: '...', message: '...' } }
Error status: 400
```

### 3️⃣ Common 400 Error Causes

| Error Code | Reason | Solution |
|------------|--------|----------|
| `UNAUTHORIZED` | Token missing/invalid | Re-login करें |
| `INPUT_REQUIRED` | File या URL missing | File select करें |
| `INVALID_FILE_TYPE` | Unsupported file type | Supported types check करें |
| `FILE_TOO_LARGE` | File > 2GB | Smaller file upload करें |
| `UNEXPECTED_FIELD` | Wrong field name | 'file' field use करें |

## 🔍 Specific Checks

### Check 1: Authentication
```bash
# Browser console में:
localStorage.getItem('token')

# अगर null है तो:
# - Logout करें
# - फिर से Login करें
```

### Check 2: File Field Name
Frontend में file upload करते समय:
```javascript
formData.append('file', selectedFile); // ✅ Correct
formData.append('document', selectedFile); // ❌ Wrong
```

### Check 3: Content Type Header
Request में automatic `multipart/form-data` होना चाहिए:
```
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...
```

### Check 4: Cloudinary Credentials (Vercel)
Vercel Dashboard → Settings → Environment Variables:
```
CLOUDINARY_CLOUD_NAME = dsvvctyb2
CLOUDINARY_API_KEY = 391248637293836
CLOUDINARY_API_SECRET = *** (set करा है?)
```

## 🧪 Test करने के लिए

### Test 1: Small Text File
1. एक simple .txt file बनाएं (1KB)
2. Upload करें
3. अगर काम करती है = बड़ी files का issue
4. अगर नहीं करती = configuration issue

### Test 2: Different File Types
- ✅ PDF file try करें
- ✅ Word (.docx) try करें
- ✅ Text (.txt) try करें

### Test 3: Network Tab
1. F12 → Network tab
2. Upload करें
3. `upload` request पर click करें
4. **Headers**, **Payload**, **Response** देखें

## 📊 Expected vs Actual

### ✅ Successful Upload:
**Request:**
```
POST /api/v1/content/upload
Status: 201 Created
Response: {
  success: true,
  id: "...",
  title: "...",
  uploadStatus: "completed"
}
```

**Backend Logs:**
```
====== UPLOAD REQUEST RECEIVED ======
File object: { originalname: 'test.pdf', mimetype: 'application/pdf', ... }
Creating content asset: { ... }
Content created successfully: <id>
```

### ❌ Failed Upload (400):
**Response:**
```
Status: 400 Bad Request
Response: {
  success: false,
  error: {
    code: "XXXX",
    message: "..."
  }
}
```

## 🛠️ Quick Fixes

### Fix 1: Clear Cache & Re-login
```bash
# Browser console में:
localStorage.clear()
# फिर login page पर जाएं और login करें
```

### Fix 2: Check Backend Server
Local development में:
```bash
cd server
npm run dev

# Output में check करें:
✅ RepurposeX API Server Started
✅ Port: 5001
```

### Fix 3: Vercel Logs में Error देखें
```bash
# Vercel CLI से (optional):
vercel logs <deployment-url>
```

## 🚨 Most Likely Issues

### Issue 1: Cloudinary Error
**Symptom:** "Service not configured" या empty response
**Solution:** 
- Vercel environment variables check करें
- Cloudinary credentials verify करें
- Local storage fallback use करें (development के लिए)

### Issue 2: Authentication Token Expired
**Symptom:** 401 error या "Not authenticated"
**Solution:**
- Re-login करें
- Token refresh check करें

### Issue 3: CORS Error
**Symptom:** Network error, no response
**Solution:**
- Backend URL check करें (`NEXT_PUBLIC_API_URL`)
- CORS headers verify करें

### Issue 4: File Size
**Symptom:** Request hangs, timeout
**Solution:**
- 2GB से छोटी file try करें
- Network speed check करें

## 📝 Debug Checklist

Upload करने से पहले:
- [ ] User logged in है?
- [ ] Backend server running है?
- [ ] Network connection stable है?
- [ ] File size < 2GB है?
- [ ] File type supported है?

Upload करने के बाद error होने पर:
- [ ] Browser console logs check किए?
- [ ] Backend/Vercel logs check किए?
- [ ] Network tab में request देखी?
- [ ] Error code और message note किया?

## 💡 आगे क्या करें?

1. **सबसे पहले:** Backend logs देखें (Vercel या local)
2. **दूसरा:** Browser console में exact error message देखें
3. **तीसरा:** यहां report करें:
   - Error code
   - Error message
   - File type और size
   - Backend logs screenshot

---

**Updated:** 2026-02-16  
**Version:** 1.1  
**Status:** Debugging in progress
