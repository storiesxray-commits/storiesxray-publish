#!/usr/bin/env bash
# One-time setup: Python deps, three.js, Chromium, voice model (~340 MB).
set -e; cd "$(dirname "$0")/.."
pip install -r requirements.txt
npm install
python -m playwright install chromium || true
mkdir -p models
[ -f models/kokoro-v1.0.onnx ] || curl -L -o models/kokoro-v1.0.onnx https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
[ -f models/voices-v1.0.bin ] || curl -L -o models/voices-v1.0.bin https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
command -v ffmpeg >/dev/null || echo "Install ffmpeg (apt install ffmpeg / brew install ffmpeg)"
echo "Setup done. Try: python tools/build.py xr003-fingers-wrinkle --no-publish"
