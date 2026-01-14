#!/bin/bash
# Automated spammer tracking script for Linux/Mac
# Downloads logs from Render and runs analysis

echo "========================================"
echo " Spammer Tracking Analysis"
echo "========================================"
echo ""

node backend/scripts/download-and-analyze-logs.js

if [ $? -ne 0 ]; then
    echo ""
    echo "Error occurred. Exiting..."
    exit 1
fi

echo ""
echo "Analysis complete!"

