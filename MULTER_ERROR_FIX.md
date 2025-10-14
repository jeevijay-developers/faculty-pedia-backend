# Fixed: MulterError - Unexpected Field

## 🐛 Error
```
MulterError: Unexpected field
    at wrappedFileFilter (multer\index.js:40:19)
```

## 🔍 Root Cause

**Field Name Mismatch:**
- **Frontend** was sending: `"image"` as the field name
- **Backend** was expecting: `"profileImage"` as the field name

When Multer receives a file with a field name it doesn't recognize, it throws an "Unexpected field" error.

## ✅ Fixes Applied

### 1. Backend Multer Configuration Fix

**File:** `src/middlewares/multer.config.js`

**Before:**
```javascript
module.exports = {
  uploadSingleImage: upload.single("image"),
  uploadMultipleImages: upload.array("images", 5),
  uploadProfileImage: upload.single("profileImage"), // ❌ Expected "profileImage"
};
```

**After:**
```javascript
module.exports = {
  uploadSingleImage: upload.single("image"),
  uploadMultipleImages: upload.array("images", 5),
  uploadProfileImage: upload.single("image"), // ✅ Changed to "image"
};
```

**Why this fix:** Changed `uploadProfileImage` to expect `"image"` field instead of `"profileImage"` to match what the frontend sends.

---

### 2. Frontend Response Access Fix

**File:** `app/dashboard/settings/page.tsx` (Line 166)

**Before:**
```typescript
const response = await updateEducatorImage(educatorId, file);
setProfileImage(response.data.image?.url || ""); // ❌ Wrong path
```

**After:**
```typescript
const response = await updateEducatorImage(educatorId, file);
setProfileImage(response.educator?.image?.url || ""); // ✅ Correct path
```

**Why this fix:** The backend returns:
```javascript
{
  message: "...",
  educator: {
    image: {
      url: "..."
    }
  }
}
```

So we need to access `response.educator.image.url`, not `response.data.image.url`.

---

## 📋 Complete Flow

### Frontend (server.js)
```javascript
export const updateEducatorImage = async (educatorId, imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile); // Sends with field name "image"
  
  const response = await API_CLIENT.put(
    `/api/educator-update/update-image/${educatorId}`,
    formData,
    {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data; // Returns backend response
};
```

### Backend Route (educatorUpdate.routes.js)
```javascript
router.put(
  "/update-image/:educatorId",
  verifyToken,
  uploadProfileImage, // Multer middleware - now expects "image" field
  [mongoIdChainInReqParams("educatorId")],
  validateRequests,
  updateEducatorImage
);
```

### Backend Multer (multer.config.js)
```javascript
uploadProfileImage: upload.single("image") // ✅ Accepts "image" field
```

### Backend Controller (UpdateEducatorController.js)
```javascript
exports.updateEducatorImage = async (req, res) => {
  const imageFile = req.file; // File extracted by Multer
  
  // Upload to Cloudinary
  const uploadResult = await uploadToCloudinary(
    imageFile.buffer,
    imageFile.originalname
  );
  
  // Update educator
  educator.image = {
    public_id: uploadResult.public_id,
    url: uploadResult.url,
  };
  
  await educator.save();
  
  // Return response
  res.status(200).json({
    message: "Educator image updated successfully",
    educator: {
      // ... educator fields including image
      image: educator.image,
    },
  });
};
```

### Frontend Response Handler (page.tsx)
```typescript
const response = await updateEducatorImage(educatorId, file);
// response = { message: "...", educator: { image: { url: "..." } } }
setProfileImage(response.educator?.image?.url || "");
```

---

## 🎯 Key Learnings

### 1. Multer Field Names Must Match
- The field name in `upload.single("fieldName")` must match the field name in `FormData`
- If frontend sends `formData.append("image", file)`, backend must use `upload.single("image")`

### 2. FormData Field Names
```javascript
// Frontend
const formData = new FormData();
formData.append("image", file); // ← This name must match backend

// Backend
upload.single("image") // ← Must match FormData field name
```

### 3. Common Multer Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Unexpected field` | Field name mismatch | Match field names between frontend and backend |
| `File too large` | File exceeds limits | Check `limits: { fileSize: ... }` |
| `Too many files` | Too many files uploaded | Check array limit in `upload.array("field", limit)` |
| `No file uploaded` | req.file is undefined | Check if file is actually being sent |

### 4. Multer File Access
```javascript
// Single file
upload.single("image")
// Access via: req.file

// Multiple files
upload.array("images", 5)
// Access via: req.files (array)

// Multiple fields
upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'gallery', maxCount: 8 }
])
// Access via: req.files.avatar[0], req.files.gallery[]
```

---

## ✅ Testing Checklist

- [x] Backend accepts "image" field name
- [x] Frontend sends "image" field name
- [x] Frontend correctly accesses response.educator.image.url
- [x] File size validation (5MB limit)
- [x] Error handling for upload failures
- [x] Success toast notification
- [x] Profile image updates in UI after upload

---

## 🔧 If Issue Persists

1. **Check network request:**
   - Open DevTools → Network tab
   - Upload an image
   - Find the PUT request to `/api/educator-update/update-image/{id}`
   - Check "Request Payload" → Look for field name in FormData

2. **Backend logging:**
   ```javascript
   console.log("Field name:", req.file ? "received" : "not received");
   console.log("File details:", req.file);
   ```

3. **Verify Content-Type:**
   - Should be `multipart/form-data; boundary=...`
   - Axios automatically sets this when sending FormData

4. **Check Multer configuration:**
   - Field name matches
   - File size limits
   - Storage configuration

---

## 📚 Related Files

- ✅ `src/middlewares/multer.config.js` - Multer configuration
- ✅ `src/routes/educatorUpdate.routes.js` - Upload route
- ✅ `src/controllers/UpdateEducatorController.js` - Image upload logic
- ✅ `app/dashboard/settings/page.tsx` - Frontend upload handler
- ✅ `util/server.js` - API method

---

## 🎉 Result

Image upload now works correctly:
1. User selects an image file
2. Frontend sends file with field name "image"
3. Backend Multer accepts "image" field
4. File is uploaded to Cloudinary
5. Educator record is updated with new image URL
6. Frontend updates profile image display
7. Success notification shown to user
