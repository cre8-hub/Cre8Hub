#!/bin/bash

# Cre8Canvas - AI Image Generator Server Startup Script

echo "🎨 Starting Cre8Canvas Server..."
echo "================================"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Creating one..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "✅ Activating virtual environment..."
source venv/bin/activate

# Install/Update requirements
echo "📦 Installing/Updating dependencies..."
pip3 install -q -r requirements.txt

# Check for GOOGLE_API_KEY
if [ -z "$GOOGLE_API_KEY" ]; then
    echo "⚠️  Warning: GOOGLE_API_KEY environment variable not set"
    echo "Please set it using: export GOOGLE_API_KEY='your-api-key'"
    echo ""
    read -p "Enter your Google API Key (or press Enter to skip): " api_key
    if [ ! -z "$api_key" ]; then
        export GOOGLE_API_KEY=$api_key
        echo "✅ API Key set for this session"
    else
        echo "❌ Cannot start without GOOGLE_API_KEY"
        exit 1
    fi
else
    echo "✅ GOOGLE_API_KEY is set"
fi

# Start the server
echo ""
echo "🚀 Starting Cre8Canvas server on port 7001..."
echo "================================"
echo ""
echo "📍 API endpoints available at:"
echo "   - http://localhost:7001/"
echo "   - http://localhost:7001/docs (Swagger UI)"
echo "   - http://localhost:7001/health"
echo ""
echo "🎨 Generation endpoints:"
echo "   - POST /generate/text-to-image"
echo "   - POST /generate/image-to-image"
echo "   - POST /generate/upload"
echo ""
echo "Press Ctrl+C to stop the server"
echo "================================"
echo ""

# Run the FastAPI server
python3 -m uvicorn cre8canvas:app --host 0.0.0.0 --port 7001 --reload

