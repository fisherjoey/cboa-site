#!/bin/bash

# Test Netlify Functions locally
# This script tests the functions by invoking them with netlify functions:invoke

echo "🧪 Testing Netlify Functions"
echo "=============================="
echo ""

# Load environment variables
export $(cat .env.local | grep -v '^#' | xargs)

echo "1️⃣ Testing resources function (GET all resources)..."
npx netlify functions:invoke resources --no-identity

echo ""
echo "2️⃣ Testing calendar-events function (GET all events)..."
npx netlify functions:invoke calendar-events --no-identity

echo ""
echo "3️⃣ Testing announcements function (GET all announcements)..."
npx netlify functions:invoke announcements --no-identity

echo ""
echo "4️⃣ Testing list-resource-files function..."
npx netlify functions:invoke list-resource-files --no-identity

echo ""
echo "✅ Function tests complete!"
