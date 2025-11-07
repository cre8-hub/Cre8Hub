# 🚀 Quick Setup Guide for Cre8Canvas

## What I've Created

I've built a complete **AI-powered image generation system** with:

1. **Backend API** (`cre8canvas.py`):
   - FastAPI server on port 7001
   - Text-to-image generation endpoint
   - Image-to-image transformation endpoint
   - Support for 3 generation types (thumbnail, advertisement, poster)
   - Integration with Google Gemini Flash model

2. **Frontend Integration** (`Cre8Canvas.tsx`):
   - Beautiful UI matching your site's theme
   - Type selection (thumbnail/ad/poster)
   - Text input for descriptions
   - Image upload for reference images
   - Download generated images
   - Real-time loading states

3. **Tools & Documentation**:
   - Startup script: `run_cre8canvas.sh`
   - Test suite: `test_cre8canvas.py`
   - Full documentation: `CRE8CANVAS_README.md`

## 🏃 Quick Start (5 Steps)

### 1. Install Dependencies
```bash
cd Cre8Hub-AI-Workflow
pip install -r requirements.txt
```

### 2. Set Your Google API Key
```bash
export GOOGLE_API_KEY='your-google-api-key-here'
```

### 3. Start the Backend Server
```bash
# Option A: Using the script (recommended)
./run_cre8canvas.sh

# Option B: Direct command
python -m uvicorn cre8canvas:app --host 0.0.0.0 --port 7001 --reload
```

### 4. Start Your Frontend
```bash
cd ../Frontend
npm run dev  # or your frontend start command
```

### 5. Test It!
Navigate to `http://localhost:5173/cre8canvas` and start creating!

## 🧪 Testing the API

Run the test suite to verify everything works:
```bash
cd Cre8Hub-AI-Workflow
python test_cre8canvas.py
```

Or test individual endpoints:

**Health Check:**
```bash
curl http://localhost:7001/health
```

**Generate Image:**
```bash
curl -X POST http://localhost:7001/generate/text-to-image \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A vibrant YouTube thumbnail with bold text",
    "generation_type": "thumbnail",
    "num_images": 1
  }'
```

## 📁 File Structure

```
Cre8Hub-AI-Workflow/
├── cre8canvas.py              # 🎨 Main API server
├── run_cre8canvas.sh          # 🚀 Startup script
├── test_cre8canvas.py         # 🧪 Test suite
├── CRE8CANVAS_README.md       # 📚 Full documentation
├── SETUP_CRE8CANVAS.md        # 📖 This file
└── requirements.txt           # 📦 Updated with new dependencies

Frontend/src/pages/
└── Cre8Canvas.tsx             # 🖼️ React component (updated)
```

## 🎯 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API info |
| `/health` | GET | Health check |
| `/types` | GET | Get generation types |
| `/generate/text-to-image` | POST | Generate from text |
| `/generate/image-to-image` | POST | Transform images |
| `/generate/upload` | POST | Upload files to generate |

## 💡 How It Works

### Text-to-Image Flow:
1. User enters description + selects type
2. Frontend sends request to `/generate/text-to-image`
3. Backend enhances prompt using Gemini
4. Returns base64 encoded image
5. Frontend displays and allows download

### Image-to-Image Flow:
1. User uploads image(s) + enters transformation prompt
2. Frontend converts images to base64
3. Sends to `/generate/image-to-image`
4. Backend analyzes with Gemini Vision
5. Returns transformed image
6. Frontend displays result

## 🔧 Configuration

### Environment Variables
Create a `.env` file in `Cre8Hub-AI-Workflow/`:
```env
GOOGLE_API_KEY=your_google_api_key_here
```

### Frontend Environment
Update `.env` in `Frontend/`:
```env
VITE_AI_WORKFLOW_URL=http://localhost:7001
```

## 📝 Generation Types

| Type | Dimensions | Best For |
|------|------------|----------|
| **Thumbnail** | 1280x720 | YouTube videos |
| **Advertisement** | 1200x628 | Social media ads |
| **Poster** | 1080x1920 | Events, stories |

## 🎨 Usage Examples

### Example 1: YouTube Thumbnail
```
Type: Thumbnail
Prompt: "A shocked person with hands on face, bold yellow text 'YOU WON'T BELIEVE THIS!', red arrow pointing down, vibrant background"
```

### Example 2: Advertisement
```
Type: Advertisement  
Prompt: "Modern minimalist ad for coffee, warm brown tones, elegant typography, coffee cup center, 'Premium Quality' text"
```

### Example 3: Poster
```
Type: Poster
Prompt: "Concert poster, dark purple gradient, bold band name, geometric patterns, date and venue info, edgy modern design"
```

## 🐛 Troubleshooting

### Server won't start?
- Check if port 7001 is available: `lsof -i :7001`
- Verify GOOGLE_API_KEY is set: `echo $GOOGLE_API_KEY`
- Check Python version: `python --version` (need 3.8+)

### CORS errors?
- Ensure frontend URL is in `allow_origins` in `cre8canvas.py`
- Clear browser cache
- Check console for specific error

### Images not generating?
- Verify API key has Gemini access
- Check server logs for errors
- Test with `/health` endpoint first

### Frontend not connecting?
- Confirm backend is running on port 7001
- Check `VITE_AI_WORKFLOW_URL` environment variable
- Verify network requests in browser DevTools

## 🔄 Updates & Changes

### What Was Modified:
1. ✅ Created `cre8canvas.py` - complete FastAPI application
2. ✅ Updated `requirements.txt` - added image processing libraries
3. ✅ Created `run_cre8canvas.sh` - automated startup
4. ✅ Updated `Cre8Canvas.tsx` - full API integration
5. ✅ Created test suite and documentation

### No Breaking Changes:
- All existing functionality remains intact
- Cre8Echo (port 7000) works independently
- Frontend routes unchanged

## 📞 Support

**Common Commands:**
```bash
# Start backend
./run_cre8canvas.sh

# Run tests
python test_cre8canvas.py

# Check logs
# (logs appear in terminal where server is running)

# Stop server
# Press Ctrl+C in terminal
```

**API Documentation:**
- Swagger UI: http://localhost:7001/docs
- ReDoc: http://localhost:7001/redoc

## 🎉 You're All Set!

The system is ready to generate:
- 🖼️ Eye-catching thumbnails
- 📱 Professional advertisements  
- 🎭 Stunning event posters

**Next Steps:**
1. Start the server
2. Open the frontend
3. Navigate to Cre8Canvas
4. Start creating amazing visuals!

---

**Happy Creating! 🎨✨**

*For detailed API documentation, see `CRE8CANVAS_README.md`*

