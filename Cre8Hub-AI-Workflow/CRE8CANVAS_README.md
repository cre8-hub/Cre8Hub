# 🎨 Cre8Canvas - Simple & Clean

**AI Image Generator using Google AI Studio API (Gemini 2.5 Flash Image)**

## ✨ What Changed?

### **Before**: 
- 530+ lines of complex code
- Vertex AI references (not needed!)
- Confusing error handling
- Unclear rate limit logic

### **After**:
- **~320 lines** of clean, simple code
- **No Vertex AI** - just Google AI Studio API
- Clear error messages
- Better rate limit handling
- Easier to understand and maintain

## 🚀 What You Need

### **1. Google AI Studio API Key** (That's it!)

Get it here: https://makersuite.google.com/app/apikey

```bash
export GOOGLE_API_KEY="your-key-here"
```

### **2. Install Dependencies**

```bash
cd /Users/prathameshpatil/Cre8Hub/Cre8Hub-AI-Workflow

# Option A: Install only what Cre8Canvas needs
pip3 install -r requirements-cre8canvas.txt

# Option B: Use existing full requirements
pip3 install -r requirements.txt
```

### **3. Start Server**

```bash
./run_cre8canvas.sh
```

Or manually:

```bash
python3 -m uvicorn cre8canvas:app --host 0.0.0.0 --port 7001 --reload
```

## 📚 How It Works

### **Text-to-Image Generation**

```python
# What happens:
1. Your prompt → Enhanced with type-specific details
2. Gemini 2.5 Flash Image generates the image
3. Returns base64 image data
4. Auto-retries if rate limited (up to 5 times)
```

### **Image-to-Image Generation**

```python
# What happens:
1. Your image + prompt → Analyzed by Gemini Vision
2. Creates transformation instructions
3. Gemini 2.5 Flash Image generates new image
4. Returns transformed result
```

## 🎯 Generation Types

| Type | Dimensions | Use Case |
|------|-----------|----------|
| **thumbnail** | 1280×720 | YouTube thumbnails |
| **advertisement** | 1200×628 | Social media ads |
| **poster** | 1080×1920 | Vertical posters |

## ⚡ Rate Limits

**Gemini 2.5 Flash Image is in PREVIEW**, so it has limits:

| Plan | Requests/Min | Requests/Day |
|------|--------------|--------------|
| Free | ~15 RPM | ~1,500/day |
| Paid | ~60 RPM | Higher quota |

### **Built-in Handling**:
- ✅ Auto-retry with exponential backoff (15s, 30s, 60s, 120s, 240s)
- ✅ 8-second delay between multiple images
- ✅ Clear error messages
- ✅ Up to 5 retry attempts

## 🧪 Test It

### **Health Check**

```bash
curl http://localhost:7001/health
```

### **Generate Image**

```bash
curl -X POST http://localhost:7001/generate/text-to-image \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Futuristic city at sunset",
    "generation_type": "thumbnail",
    "num_images": 1
  }'
```

## 🔥 Key Improvements

### **1. Cleaner Code**
- Removed 200+ lines of unnecessary code
- Clear function names
- Simple logic flow

### **2. No Vertex AI Confusion**
- Uses Google AI Studio API (simpler!)
- No project/location setup needed
- Just API key and go

### **3. Better Error Handling**
- Placeholder images with helpful error messages
- Clear rate limit warnings
- Retry logic that actually works

### **4. Improved Rate Limit Strategy**
- Longer delays (15s base instead of 2s)
- More retries (5 instead of 3)
- Smarter backoff (up to 4 minutes)
- Spacing between multiple images

## 📊 API Endpoints

### `POST /generate/text-to-image`
Generate from text prompt

**Request:**
```json
{
  "prompt": "your prompt",
  "generation_type": "thumbnail|advertisement|poster",
  "num_images": 1
}
```

**Response:**
```json
{
  "success": true,
  "images": ["data:image/png;base64,..."],
  "prompt_used": "enhanced prompt",
  "generation_type": "thumbnail",
  "message": "Generated 1 image(s)"
}
```

### `POST /generate/image-to-image`
Transform existing image

**Request:**
```json
{
  "prompt": "make it futuristic",
  "generation_type": "poster",
  "base_image": "data:image/png;base64,...",
  "strength": 0.75
}
```

### `GET /health`
Check server status

### `GET /types`
Get available generation types

## 🐛 Troubleshooting

### **"Rate limit exceeded"**
✅ **Already handled!** The code will auto-retry for you.
- If all retries fail → Wait 5 minutes
- Request quota increase: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas

### **"No image in response"**
- Model might not be available in your region
- Check API key has proper permissions
- Try again in a few minutes

### **"API key not set"**
```bash
export GOOGLE_API_KEY="your-key"
```

Or add to `.env` file:
```
GOOGLE_API_KEY=your-key
```

## 🎨 Frontend Integration

Your frontend (`Cre8Canvas.tsx`) already works with this!

Just make sure:
- Backend is running on port 7001
- Frontend points to `http://localhost:7001`
- CORS is configured (already done!)

## 📈 Monitoring

Watch the logs:
```bash
# If using run_cre8canvas.sh
tail -f cre8canvas.log

# If running manually
# Logs appear in terminal
```

Look for:
- `🎨 Generating...` - Generation started
- `✅ Image generated!` - Success
- `⚠️ Rate limit!` - Retry in progress
- `❌ Failed:` - Error occurred

## 🚦 Rate Limit Best Practices

1. **Generate one image at a time** (don't request 4 at once)
2. **Wait 10-15 seconds** between requests
3. **Request quota increase** if you need more
4. **Cache results** to avoid regenerating same prompts

## 💡 Tips

- Be specific in prompts for better results
- Longer prompts = better images
- Use negative prompts to avoid unwanted elements
- The model works best with English

## 🎯 What's NOT Needed

❌ Vertex AI setup  
❌ Google Cloud Project (beyond API key)  
❌ gcloud CLI  
❌ Service account credentials  
❌ Complex authentication  

✅ Just your Google AI Studio API key!

---

**Current Status**: ✅ Fully functional, clean, simple!

**Model**: `gemini-2.5-flash-image-preview`  
**Version**: 2.0.0  
**Lines of Code**: ~320 (down from 530+)
