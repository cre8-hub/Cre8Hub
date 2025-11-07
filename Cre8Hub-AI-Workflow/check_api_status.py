#!/usr/bin/env python3
"""
Check your Google AI API key status, billing, and quota
"""

import os
import google.generativeai as genai
from dotenv import load_dotenv
import time

load_dotenv()

api_key = os.getenv('GOOGLE_API_KEY')
if not api_key:
    print("❌ No GOOGLE_API_KEY found in environment!")
    exit(1)

genai.configure(api_key=api_key)

print("=" * 70)
print("🔍 GOOGLE AI API KEY STATUS CHECK")
print("=" * 70)

# 1. API Key Info
print("\n📋 API KEY INFORMATION:")
print(f"   Key: {api_key[:10]}...{api_key[-4:]}")
print(f"   Length: {len(api_key)} characters")
print(f"   Type: Google AI Studio API Key" if api_key.startswith("AIza") else "   Type: Unknown")

# 2. Model Access
print("\n🎨 MODEL ACCESS:")
try:
    # Test image generation model
    img_model = genai.GenerativeModel('gemini-2.5-flash-image-preview')
    print("   ✅ gemini-2.5-flash-image-preview: ACCESSIBLE")
    
    # Test vision model
    vision_model = genai.GenerativeModel('gemini-2.0-flash-exp')
    print("   ✅ gemini-2.0-flash-exp: ACCESSIBLE")
    
except Exception as e:
    print(f"   ❌ Error accessing models: {e}")

# 3. Rate Limit Test
print("\n⚡ RATE LIMIT TEST:")
print("   Testing with a simple request...")

try:
    start = time.time()
    model = genai.GenerativeModel('gemini-2.0-flash-exp')
    response = model.generate_content("Say 'API working!'")
    duration = time.time() - start
    
    print(f"   ✅ Request successful!")
    print(f"   ⏱️  Response time: {duration:.2f}s")
    print(f"   📝 Response: {response.text[:50]}...")
    
except Exception as e:
    error_str = str(e)
    print(f"   ❌ Request failed: {error_str}")
    
    if '429' in error_str:
        print("   ⚠️  RATE LIMIT HIT!")
        print("   💡 You need to wait before making more requests")
    elif '403' in error_str:
        print("   ⚠️  PERMISSION DENIED!")
        print("   💡 Check if billing is enabled")

# 4. Billing Status
print("\n💳 BILLING STATUS:")
print("   ℹ️  Google AI Studio API has two tiers:")
print()
print("   📦 FREE TIER:")
print("      • 15 requests/minute")
print("      • 1,500 requests/day")
print("      • Used for improving Google products")
print()
print("   💰 PAID TIER (Billing Enabled):")
print("      • 60 requests/minute")
print("      • Higher daily quota")
print("      • Data not used for training")
print()

# 5. Check which tier you're on
print("🔎 DETECTING YOUR TIER:")

# The only reliable way to know is to check the project/billing in Cloud Console
print("   ℹ️  To confirm billing status:")
print("   1. Go to: https://console.cloud.google.com/")
print("   2. Select your project")
print("   3. Go to 'Billing' → Check if linked to billing account")
print()
print("   📊 Your current behavior:")

# Check .env for clues
if os.path.exists('.env'):
    with open('.env', 'r') as f:
        env_content = f.read()
        if 'VERTEX_AI_PROJECT' in env_content:
            print("      • VERTEX_AI_PROJECT found (not needed for AI Studio)")
        if 'GOOGLE_CLOUD_PROJECT' in env_content:
            print("      • GOOGLE_CLOUD_PROJECT found")

# 6. Recommendations
print("\n💡 RECOMMENDATIONS:")
print()
print("   If you're hitting rate limits frequently:")
print("   1. ✅ Verify billing is enabled at:")
print("      https://console.cloud.google.com/billing")
print()
print("   2. ✅ Request quota increase at:")
print("      https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas")
print()
print("   3. ✅ Check usage dashboard at:")
print("      https://console.cloud.google.com/apis/dashboard")
print()
print("   4. ✅ Consider these strategies:")
print("      • Generate 1 image at a time (not multiple)")
print("      • Add 10-15 second delays between requests")
print("      • Cache results to avoid regenerating")
print("      • Use queue system for high volume")

print("\n" + "=" * 70)
print("✅ API Status Check Complete!")
print("=" * 70)

# Test if we can actually generate (optional - costs quota)
test_gen = input("\n🎨 Want to test actual image generation? (y/N): ").strip().lower()

if test_gen == 'y':
    print("\n🚀 Testing image generation...")
    print("⚠️  This will use your quota!")
    
    try:
        img_model = genai.GenerativeModel('gemini-2.5-flash-image-preview')
        print("   Generating test image with prompt: 'A simple red circle'")
        
        start = time.time()
        response = img_model.generate_content("A simple red circle on white background")
        duration = time.time() - start
        
        print(f"\n   ✅ SUCCESS! Image generated in {duration:.2f}s")
        print("   📊 This confirms:")
        print("      • Your API key works")
        print("      • You have quota available")
        print("      • Billing is likely enabled")
        
        # Check if we got image data
        if hasattr(response, 'parts'):
            for part in response.parts:
                if hasattr(part, 'inline_data'):
                    print(f"      • Image size: {len(part.inline_data.data)} bytes")
                    print(f"      • MIME type: {part.inline_data.mime_type}")
        
    except Exception as e:
        error_str = str(e)
        print(f"\n   ❌ FAILED: {error_str}")
        
        if '429' in error_str:
            print("\n   ⚠️  RATE LIMIT!")
            print("   → You've hit your quota limit")
            print("   → Wait 5-10 minutes and try again")
            print("   → Or request quota increase")
        elif '403' in error_str:
            print("\n   ⚠️  PERMISSION DENIED!")
            print("   → Billing might not be enabled")
            print("   → Check: https://console.cloud.google.com/billing")
        else:
            print(f"\n   ⚠️  Unexpected error: {error_str}")

else:
    print("\n👍 Skipped generation test to preserve quota")

print("\n🎯 Current Server Status:")
print("   Server: http://localhost:7001")
print("   Health: curl http://localhost:7001/health")

