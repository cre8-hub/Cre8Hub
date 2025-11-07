"""
Test script for Cre8Canvas API
Run this after starting the server to verify functionality
"""

import requests
import json
import base64
from PIL import Image
import io

BASE_URL = "http://localhost:7001"

def test_health_check():
    """Test the health check endpoint"""
    print("\n🏥 Testing Health Check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print("✅ Health check passed!")
            print(f"   Status: {data['status']}")
            print(f"   API Key Set: {data['google_api_key_set']}")
            print(f"   Supported Types: {data['supported_types']}")
            return True
        else:
            print(f"❌ Health check failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def test_get_types():
    """Test getting generation types"""
    print("\n📋 Testing Get Types...")
    try:
        response = requests.get(f"{BASE_URL}/types")
        if response.status_code == 200:
            data = response.json()
            print("✅ Types retrieved successfully!")
            for type_info in data['types']:
                print(f"   - {type_info['name']}: {type_info['dimensions']}")
            return True
        else:
            print(f"❌ Failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def test_text_to_image():
    """Test text-to-image generation"""
    print("\n🎨 Testing Text-to-Image Generation...")
    try:
        payload = {
            "prompt": "A vibrant YouTube thumbnail with bold text 'TEST' in yellow",
            "generation_type": "thumbnail",
            "num_images": 1
        }
        
        response = requests.post(
            f"{BASE_URL}/generate/text-to-image",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            if data['success']:
                print("✅ Text-to-Image generation successful!")
                print(f"   Generation Type: {data['generation_type']}")
                print(f"   Images Generated: {len(data['images'])}")
                print(f"   Message: {data['message']}")
                
                # Optionally save the image
                if data['images']:
                    save_base64_image(data['images'][0], "test_output_text2img.png")
                return True
            else:
                print("❌ Generation failed")
                return False
        else:
            print(f"❌ Request failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def create_test_image():
    """Create a simple test image and encode to base64"""
    img = Image.new('RGB', (640, 360), color=(100, 100, 200))
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    return f"data:image/png;base64,{img_str}"

def test_image_to_image():
    """Test image-to-image generation"""
    print("\n🔄 Testing Image-to-Image Generation...")
    try:
        # Create a test base image
        base_image = create_test_image()
        
        payload = {
            "prompt": "Transform this into a professional advertisement with vibrant colors",
            "generation_type": "advertisement",
            "base_image": base_image,
            "strength": 0.75
        }
        
        response = requests.post(
            f"{BASE_URL}/generate/image-to-image",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            if data['success']:
                print("✅ Image-to-Image generation successful!")
                print(f"   Generation Type: {data['generation_type']}")
                print(f"   Images Generated: {len(data['images'])}")
                
                # Optionally save the image
                if data['images']:
                    save_base64_image(data['images'][0], "test_output_img2img.png")
                return True
            else:
                print("❌ Generation failed")
                return False
        else:
            print(f"❌ Request failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def save_base64_image(base64_string, filename):
    """Save a base64 encoded image to file"""
    try:
        # Remove data URL prefix if present
        if "," in base64_string:
            base64_string = base64_string.split(",")[1]
        
        image_data = base64.b64decode(base64_string)
        image = Image.open(io.BytesIO(image_data))
        image.save(filename)
        print(f"   💾 Image saved as: {filename}")
    except Exception as e:
        print(f"   ⚠️  Could not save image: {str(e)}")

def main():
    """Run all tests"""
    print("=" * 50)
    print("🎨 Cre8Canvas API Test Suite")
    print("=" * 50)
    
    results = {
        "Health Check": test_health_check(),
        "Get Types": test_get_types(),
        "Text-to-Image": test_text_to_image(),
        "Image-to-Image": test_image_to_image()
    }
    
    print("\n" + "=" * 50)
    print("📊 Test Results Summary")
    print("=" * 50)
    
    for test_name, result in results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name:20s}: {status}")
    
    total_passed = sum(results.values())
    total_tests = len(results)
    
    print("\n" + "=" * 50)
    print(f"Total: {total_passed}/{total_tests} tests passed")
    print("=" * 50)
    
    return all(results.values())

if __name__ == "__main__":
    import sys
    success = main()
    sys.exit(0 if success else 1)

