#!/usr/bin/env python3
"""
Quick test script to check what the backend returns
"""

import requests
import json

API_URL = "http://localhost:7001"

print("=" * 70)
print("🧪 Testing Cre8Canvas Backend")
print("=" * 70)

# Test health endpoint
print("\n1️⃣  Testing /health endpoint...")
try:
    response = requests.get(f"{API_URL}/health")
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
except Exception as e:
    print(f"   ❌ Error: {e}")
    print("   Make sure server is running on port 7001!")
    exit(1)

# Test text-to-image
print("\n2️⃣  Testing /generate/text-to-image...")
print("   ⚠️  This will use your API quota!")
print("   Press Ctrl+C to cancel...")

import time
time.sleep(2)

payload = {
    "prompt": "A simple red circle on white background",
    "generation_type": "thumbnail",
    "num_images": 1
}

print(f"\n   📤 Sending request with prompt: '{payload['prompt']}'")

try:
    response = requests.post(
        f"{API_URL}/generate/text-to-image",
        json=payload,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"   📥 Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\n   ✅ SUCCESS!")
        print(f"   • Success flag: {data.get('success')}")
        print(f"   • Number of images: {len(data.get('images', []))}")
        print(f"   • Message: {data.get('message')}")
        
        if data.get('images'):
            first_image = data['images'][0]
            print(f"\n   📊 Image Details:")
            print(f"   • Type: {type(first_image)}")
            print(f"   • Length: {len(first_image)} characters")
            print(f"   • Starts with: {first_image[:60]}")
            print(f"   • Contains 'data:': {'data:' in first_image}")
            print(f"   • Contains 'base64': {'base64' in first_image}")
            
            # Check if it's valid base64
            if first_image.startswith('data:'):
                print(f"   ✅ Valid data URL format!")
                
                # Extract mime type
                if ';base64,' in first_image:
                    mime = first_image.split(';base64,')[0].replace('data:', '')
                    b64_data = first_image.split(';base64,')[1]
                    print(f"   • MIME type: {mime}")
                    print(f"   • Base64 data length: {len(b64_data)}")
                    print(f"   • Estimated size: {len(b64_data) * 3 // 4 / 1024:.2f} KB")
                else:
                    print(f"   ⚠️  No base64 marker found!")
            else:
                print(f"   ❌ NOT a valid data URL!")
                print(f"   First 200 chars: {first_image[:200]}")
                
    else:
        print(f"   ❌ FAILED!")
        print(f"   Response: {response.text[:500]}")
        
except Exception as e:
    print(f"   ❌ Error: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 70)
print("✅ Test Complete!")
print("=" * 70)
print("\n💡 Next Steps:")
print("   1. Check the console logs above")
print("   2. If image format looks correct, check frontend console")
print("   3. Look for browser console errors")
print("   4. Verify the img tag is rendering")

