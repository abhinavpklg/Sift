# Sift

**Sift smarter. Apply faster.**

AI-powered Chrome extension that finds jobs and fills applications for you.

## Features

- 🔍 **Smart Job Discovery** - Sifts through 65+ ATS platforms to find relevant jobs
- 🤖 **AI Auto-Fill** - Automatically fills application forms using your profile
- 📚 **Learns From You** - Improves responses based on your corrections
- 📊 **Track Everything** - Never apply to the same job twice
- 🔒 **Privacy First** - Runs locally with Ollama, your data stays yours

## Quick Start

```bash
# Install dependencies
pnpm install

# Build extension
pnpm build

# Load in Chrome:
# 1. Go to chrome://extensions
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select: apps/extension/dist
```

## Setup Local AI (Optional)

```bash
brew install ollama
ollama pull llama3.2:8b-instruct-q4_K_M
ollama serve
```

## Project Structure

```
sift/
├── apps/extension/     # Chrome Extension
├── packages/           # Shared packages
└── docs/              # Documentation
```
