# 🎨 Real Image Generation Setup Guide

Currently, Cre8Canvas uses **Gemini to analyze prompts** but doesn't generate actual images. This guide shows you how to integrate real image generation.

## 🚀 Quick Summary

**Current Setup:**
- ✅ Gemini analyzes your prompt
- ✅ Creates detailed descriptions
- ❌ Returns placeholder blue image

**What You Need:**
- An actual image generation API

## 🎯 Best Options (Ranked)

### **Option 1: Stability AI (Stable Diffusion) - RECOMMENDED** 

**Pros:**
- ✅ Best quality/price ratio
- ✅ Fast generation (3-10 seconds)
- ✅ Free tier: 25 credits
- ✅ Cheap: $10 = 1000 images

**Setup:**
1. **Get API Key**
   - Visit: https://platform.stability.ai/
   - Sign up (get 25 free credits)
   - Go to Account → API Keys
   - Copy your API key

2. **Install Package**
   ```bash
   cd Cre8Hub-AI-Workflow
   pip install stability-sdk
   ```

3. **Update Backend**
   Add to `cre8canvas.py`:
   ```python
   import requests
   
   STABILITY_API_KEY = os.getenv("STABILITY_API_KEY")
   
   def generate_with_stable_diffusion(prompt, width, height):
       response = requests.post(
           "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
           headers={
               "Authorization": f"Bearer {STABILITY_API_KEY}",
               "Content-Type": "application/json",
           },
           json={
               "text_prompts": [{"text": prompt}],
               "cfg_scale": 7,
               "height": height,
               "width": width,
               "samples": 1,
               "steps": 30,
           },
       )
       
       if response.status_code == 200:
           data = response.json()
           return data["artifacts"][0]["base64"]
       else:
           raise Exception(f"Failed: {response.text}")
   ```

4. **Set Environment Variable**
   ```bash
   export STABILITY_API_KEY='your-stability-api-key'
   ```

---

### **Option 2: Replicate (Multiple Models)**

**Pros:**
- ✅ Many models to choose from
- ✅ Pay per use
- ✅ Easy integration
- ✅ Free tier: $5 credit

**Setup:**
1. **Get API Key**
   - Visit: https://replicate.com/
   - Sign up
   - Go to Account → API tokens

2. **Install Package**
   ```bash
   pip install replicate
   ```

3. **Update Backend**
   ```python
   import replicate
   
   REPLICATE_API_TOKEN = os.getenv("REPLICATE_API_TOKEN")
   
   def generate_with_replicate(prompt, width, height):
       output = replicate.run(
           "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
           input={
               "prompt": prompt,
               "width": width,
               "height": height
           }
       )
       return output[0]  # Returns image URL or base64
   ```

4. **Set Environment Variable**
   ```bash
   export REPLICATE_API_TOKEN='your-replicate-token'
   ```

---

### **Option 3: OpenAI DALL-E 3**

**Pros:**
- ✅ Highest quality
- ✅ Best at understanding prompts
- ✅ No setup needed if you have OpenAI key

**Cons:**
- ❌ Most expensive ($0.04-0.12 per image)
- ❌ Slower generation

**Setup:**
1. **Get API Key**
   - Visit: https://platform.openai.com/
   - Already have ChatGPT Plus? You still need API key separately

2. **Install Package**
   ```bash
   pip install openai
   ```

3. **Update Backend**
   ```python
   from openai import OpenAI
   
   OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
   client = OpenAI(api_key=OPENAI_API_KEY)
   
   def generate_with_dalle(prompt, width, height):
       # DALL-E only supports specific sizes
       size = "1024x1024"  # or "1792x1024" or "1024x1792"
       
       response = client.images.generate(
           model="dall-e-3",
           prompt=prompt,
           size=size,
           quality="standard",
           n=1,
       )
       
       return response.data[0].url  # or .b64_json
   ```

---

### **Option 4: Hugging Face (Free)**

**Pros:**
- ✅ Completely free
- ✅ Many models available
- ✅ Good for testing

**Cons:**
- ❌ Slower (15-30 seconds)
- ❌ Rate limits
- ❌ Lower quality

**Setup:**
1. **Get API Key**
   - Visit: https://huggingface.co/
   - Go to Settings → Access Tokens

2. **Install Package**
   ```bash
   pip install huggingface_hub
   ```

3. **Update Backend**
   ```python
   from huggingface_hub import InferenceClient
   
   HF_API_KEY = os.getenv("HF_API_KEY")
   client = InferenceClient(token=HF_API_KEY)
   
   def generate_with_huggingface(prompt, width, height):
       image = client.text_to_image(
           prompt,
           model="stabilityai/stable-diffusion-xl-base-1.0"
       )
       return image  # PIL Image object
   ```

---

## 💰 Cost Comparison

| Service | Free Tier | Cost per Image | Quality | Speed |
|---------|-----------|----------------|---------|-------|
| **Stability AI** | 25 credits | $0.01 | ⭐⭐⭐⭐⭐ | Fast |
| **Replicate** | $5 credit | $0.008-0.02 | ⭐⭐⭐⭐⭐ | Fast |
| **DALL-E 3** | - | $0.04-0.12 | ⭐⭐⭐⭐⭐ | Medium |
| **Hugging Face** | Unlimited | Free | ⭐⭐⭐ | Slow |

## 🔧 Quick Integration (Stability AI)

Here's a complete working example to replace the placeholder:

```python
# In cre8canvas.py, replace the placeholder section with:

async def generate_with_gemini_text_to_image(prompt: str, generation_type: str, num_images: int = 1):
    # ... existing Gemini code for prompt enhancement ...
    
    # Check if Stability AI is configured
    STABILITY_API_KEY = os.getenv("STABILITY_API_KEY")
    
    if STABILITY_API_KEY:
        # Use Stability AI for actual generation
        import requests
        
        response = requests.post(
            "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
            headers={
                "Authorization": f"Bearer {STABILITY_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "text_prompts": [{"text": enhanced_prompt}],
                "cfg_scale": 7,
                "height": height,
                "width": width,
                "samples": num_images,
                "steps": 30,
            },
        )
        
        if response.status_code == 200:
            data = response.json()
            generated_images = [
                f"data:image/png;base64,{artifact['base64']}"
                for artifact in data["artifacts"]
            ]
            return generated_images, detailed_description
        else:
            print(f"Stability AI error: {response.text}")
            # Fall through to placeholder
    
    # Placeholder if no API configured
    # ... existing placeholder code ...
```

## 🚀 Recommended Setup for Production

1. **Start with Stability AI** (best value)
2. **Add Replicate** as backup
3. **Use Gemini** for prompt enhancement (current setup)
4. **Add caching** to avoid regenerating same prompts

## 📝 Environment Variables Needed

```bash
# Add to your .env file
GOOGLE_API_KEY=your-gemini-key          # Already set ✓
STABILITY_API_KEY=your-stability-key    # Add this
```

## 🎯 Next Steps

1. **Choose a service** (I recommend Stability AI)
2. **Get API key** from that service
3. **Install required package**
4. **Update cre8canvas.py** with integration code
5. **Set environment variable**
6. **Restart server**
7. **Generate real images!** 🎨

## 💡 Pro Tips

- **Use Gemini for prompts**: Keep using Gemini to enhance prompts (you're already doing this!)
- **Cache results**: Store generated images to avoid regenerating
- **Multiple services**: Have fallback options
- **Optimize prompts**: Better prompts = better images = fewer regenerations

## 📞 Need Help?

Common issues:
- **"Invalid API key"**: Double-check the key and environment variable
- **"Rate limit"**: Wait or upgrade plan
- **"Invalid dimensions"**: Each service has size limits
- **"Timeout"**: Image generation takes time (10-30 seconds is normal)

---

**Want me to implement one of these for you?** Let me know which service you prefer! 🚀

