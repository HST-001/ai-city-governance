# Urban Environment Scoring System - Quick Start Guide

## What's New?

I've created new English-only batch files to avoid encoding issues that were causing problems with Chinese characters in previous scripts. These files should work correctly on all Windows systems.

## Available Scripts

### 1. install_deps.bat
- Installs only minimal dependencies (Flask, numpy, requests, loguru)
- Uses Tsinghua University's PyPI mirror for faster downloads
- Checks Python installation automatically
- Works without Torch or OpenCV requirements

### 2. start_service.bat
- Starts the API service directly
- Automatically checks and uses an available port (5000 or 5001)
- Installs missing dependencies if possible
- Runs in BASIC MODE which doesn't require Torch or OpenCV

## Recommended Usage

1. **First time setup**:
   - Double-click on `install_deps.bat` to install required dependencies
   - The script will guide you through the installation process

2. **Start the service**:
   - Double-click on `start_service.bat` to launch the API
   - The service will automatically choose an available port
   - You'll see the URL to access the API in the terminal

3. **Test the service**:
   - Run `python simple_test_tool.py` to test the API functionality
   - If service is running on a custom port, use: `python simple_test_tool.py <port_number>`

## Important Notes

- The system runs in **BASIC MODE** without requiring Torch or OpenCV
- All scripts use English only to avoid encoding problems
- If you encounter any issues, make sure Python is properly installed and added to your system PATH
- Press Ctrl+C to stop the running service

## Example Commands

```
# Install dependencies
install_deps.bat

# Start service
start_service.bat

# Test service (default port)
python simple_test_tool.py

# Test service (custom port)
python simple_test_tool.py 5001
```

---

**Happy using the Urban Environment Scoring System!**
