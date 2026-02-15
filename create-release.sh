#!/bin/bash

# 直接使用 GitHub API 創建 Release

REPO="s987654321052-hub/RemoteAI-Guardian"
TAG="v1.0.0"
GITHUB_TOKEN=$(gh auth token)

curl -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/repos/$REPO/releases \
  -d "{
    \"tag_name\":\"$TAG\",
    \"target_commitish\":\"main\",
    \"name\":\"RemoteAI Guardian v1.0.0\",
    \"body\":\"# RemoteAI Guardian v1.0.0

## 🎉 Release Highlights

- Complete iPhone + LINE integration system
- Multi-platform support (iOS, macOS, Windows, Linux)
- GitHub Actions automated builds
- Docker containerization
- Tailscale network integration

## Features

✅ iPhone Web Dashboard (Safari)
✅ LINE Bot Command Interface
✅ iOS Native Application (SwiftUI)
✅ Remote command execution
✅ Real-time progress reporting
✅ Multi-platform CI/CD

## System Requirements

- Node.js 20+
- Docker (optional)
- Tailscale VPN
- LINE Official Account

## Installation

\\\`\\\`\\\`bash
git clone https://github.com/s987654321052-hub/RemoteAI-Guardian.git
cd RemoteAI-Guardian
npm install
npm start
\\\`\\\`\\\`

## Documentation

- IPHONE_LINE_SETUP.md - iPhone + LINE complete setup
- GITHUB_ACTIONS_QUICKSTART.md - GitHub Actions quick start
- PACKAGING_AND_DISTRIBUTION.md - Build and distribution guide

## Built

- Date: $(date -u +'%Y-%m-%d %H:%M:%S UTC')
- Commit: $(git rev-parse HEAD)
\",
    \"draft\":false,
    \"prerelease\":false
  }"
