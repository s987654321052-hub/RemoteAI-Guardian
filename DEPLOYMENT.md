# RemoteAI Guardian 生產部署指南

## 📋 目錄

- [前置要求](#前置要求)
- [環境準備](#環境準備)
- [部署步驟](#部署步驟)
- [驗證部署](#驗證部署)
- [監控和維護](#監控和維護)
- [故障排除](#故障排除)
- [安全最佳實踐](#安全最佳實踐)

---

## 前置要求

### 系統要求

- **操作系統**: Linux (Ubuntu 20.04 或更高) / macOS / Windows with WSL2
- **Docker**: 20.10 或更高
- **Docker Compose**: 1.29 或更高
- **Node.js**: 24.x (包含在容器中)
- **磁盤空間**: 至少 10GB
- **內存**: 至少 2GB

### 網絡要求

- 公開互聯網連接 (用於 LINE 通知)
- Tailscale 帳戶已配置
- 端口 8888 和 9999 開放

---

## 環境準備

### 1. 複製環境配置

```bash
cd RemoteAI-Guardian
cp .env.example .env
```

### 2. 編輯 .env 文件

```bash
nano .env  # 或用你喜歡的編輯器
```

**必需配置:**

```env
# Node 環境
NODE_ENV=production
LOG_LEVEL=info

# 服務端口
AUTH_PORT=8888
DASHBOARD_PORT=9999

# LINE 通知 (從 .env 複製)
LINE_CHANNEL_ID=2009132426
LINE_CHANNEL_SECRET=8ec86e5781c1e3df454caf94eafb235c
LINE_ACCESS_TOKEN=tSq0UBIOGW03sqQjsl1uXJ3VEb5Iukm4CWZl5xb/yVtgRX4yrCRw5xVyyoDQNLUvlMPgOLHVaQq2fhkFCsRPrbDo9lBoFczlEef7uRk+Skf6pKjmPYOQ9IBE71BSyUUdmlEAO9HwvLIdPlllGvNSgdB04t89/1O/w1cDnyilFU=
LINE_USER_ID=Uee2657aac9ffdc9d6d63f7e5097c0bbc

# Tailscale
TAILSCALE_IP=100.127.44.67

# 安全密鑰 (生成新的)
SECRET_KEY=your_very_long_secret_key_change_this_in_production

# 日誌
LOG_DIR=./logs

# Redis (可選)
REDIS_URL=redis://redis:6379

# MongoDB (可選)
MONGODB_URI=mongodb://localhost:27017/remoteai-guardian
```

### 3. 檢查部署準備情況

```bash
cd auth-system
node deployment-checker.js
```

---

## 部署步驟

### 1. 構建 Docker 映像

```bash
# 構建映像
docker-compose build

# 驗證映像
docker images | grep remoteai
```

### 2. 啟動服務

```bash
# 在後台啟動所有服務
docker-compose up -d

# 或在前台運行 (用於調試)
docker-compose up
```

### 3. 驗證容器運行

```bash
# 查看所有容器
docker-compose ps

# 應該看到:
# - auth-system (8888/tcp) - Up
# - redis (6379/tcp) - Up (可選)
```

### 4. 查看日誌

```bash
# 查看所有日誌
docker-compose logs -f

# 查看特定服務日誌
docker-compose logs -f auth-system
docker-compose logs -f redis
```

---

## 驗證部署

### 1. 檢查認證系統

```bash
# 查詢系統狀態
curl http://localhost:8888/api/status

# 應返回:
# {"status":"running","pairedDevices":0,"activeTokens":0,"startedAt":"..."}
```

### 2. 檢查儀表板

```bash
# 打開瀏覽器訪問
http://localhost:9999

# 或用 curl 檢查
curl http://localhost:9999/health
```

### 3. 測試 LINE 通知

```bash
cd auth-system
node test-line-simulator.js
```

### 4. 監控資源使用

```bash
# 查看容器資源使用
docker stats

# 查看磁盤使用
df -h

# 查看內存使用
free -h
```

---

## 監控和維護

### 健康檢查

服務已配置自動健康檢查。查看狀態:

```bash
# 檢查容器健康狀態
docker-compose ps

# 詳細檢查
docker ps --format "{{.Names}}\t{{.Status}}"
```

### 日誌管理

```bash
# 查看最近 100 行日誌
docker-compose logs --tail=100

# 查看特定時間的日誌
docker-compose logs --since 10m

# 導出日誌到文件
docker-compose logs > logs-$(date +%Y%m%d).txt
```

### 性能監控

```bash
# 查看容器性能指標
docker stats --no-stream

# 監控進程
docker top remoteai-guardian-auth-system-1

# 檢查磁盤 I/O
iostat -x 1 5
```

### 定期備份

```bash
# 備份數據目錄
tar -czf backup-$(date +%Y%m%d).tar.gz data/ credentials/

# 備份日誌
tar -czf logs-$(date +%Y%m%d).tar.gz logs/

# 遠程備份 (到 S3 或其他存儲)
aws s3 cp backup-*.tar.gz s3://your-bucket/backups/
```

---

## 故障排除

### 容器無法啟動

```bash
# 檢查日誌
docker-compose logs auth-system

# 常見原因:
# 1. 環境變數未配置
# 2. 端口已被占用
# 3. 磁盤空間不足

# 解決:
# 檢查 .env 配置
# 檢查端口: lsof -i :8888
# 清理磁盤: docker system prune
```

### 無法連接到認證系統

```bash
# 檢查容器是否運行
docker-compose ps

# 檢查端口映射
docker port remoteai-guardian-auth-system-1

# 測試連接
telnet localhost 8888
# 或
nc -zv localhost 8888

# 檢查防火牆
sudo ufw allow 8888
sudo ufw allow 9999
```

### LINE 通知不工作

```bash
# 檢查網絡連接
curl -I https://api.line.biz

# 檢查環境變數
echo $LINE_ACCESS_TOKEN
echo $LINE_USER_ID

# 測試 LINE 通知
node test-line-simulator.js
```

### 高 CPU 使用率

```bash
# 監控進程
docker stats --no-stream

# 檢查日誌中的錯誤
docker-compose logs | grep ERROR

# 重新啟動服務
docker-compose restart auth-system
```

---

## 安全最佳實踐

### 1. 環境變數安全

```bash
# 使用強密碼和密鑰
SECRET_KEY=$(openssl rand -base64 32)
echo "SECRET_KEY=$SECRET_KEY" >> .env

# 限制文件權限
chmod 600 .env

# 不要將 .env 提交到 Git
echo ".env" >> .gitignore
```

### 2. 容器安全

```bash
# 運行非 root 用戶 (已在 Dockerfile 中配置)
# 限制容器資源
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up

# 定期更新基礎映像
docker pull node:24-alpine
docker-compose build --no-cache
```

### 3. 網絡安全

```bash
# 設置防火牆規則
sudo ufw allow 8888/tcp from 192.168.1.0/24
sudo ufw allow 9999/tcp from 192.168.1.0/24

# 啟用 HTTPS (通過 Tailscale 自動提供)
# 或使用反向代理 (nginx)
```

### 4. 數據安全

```bash
# 加密敏感數據
# 已在 security-hardener.js 中實現

# 定期備份
0 2 * * * cd /app && tar -czf backup-$(date +\%Y\%m\%d).tar.gz data/ && aws s3 cp backup-*.tar.gz s3://bucket/

# 限制訪問權限
chmod 700 data/ credentials/
```

### 5. 日誌安全

```bash
# 不要記錄敏感信息
# 配置日誌輪換
docker-compose logs --tail=0 -f 2>&1 | tee -a logs/app-$(date +%Y%m%d).log

# 監控異常訪問
grep "ERROR\|WARN" logs/*.log
```

---

## 擴展和優化

### 橫向擴展

```bash
# 使用 docker-compose 複制服務
# 在 docker-compose.yml 中添加多個實例
# 使用 nginx 作為負載均衡器
```

### 性能優化

```bash
# 啟用 Redis 快取
# 配置 REDIS_URL 環境變數

# 啟用 MongoDB 持久化
# 配置 MONGODB_URI 環境變數

# 調整 Node.js 參數
NODE_OPTIONS="--max-old-space-size=2048" docker-compose up
```

### 監控和告警

```bash
# 使用 Prometheus 監控
# 使用 Grafana 可視化
# 配置 Alertmanager 告警

# 或使用簡單的健康檢查
watch 'curl -s http://localhost:8888/api/status | jq .'
```

---

## 生產清單

- [ ] 環境變數已配置
- [ ] .env 文件已保護 (chmod 600)
- [ ] Docker 映像已構建
- [ ] 所有健康檢查通過
- [ ] 日誌系統已配置
- [ ] 備份策略已制定
- [ ] 監控系統已設置
- [ ] 防火牆規則已配置
- [ ] SSL/TLS 已啟用 (通過 Tailscale)
- [ ] 定期備份已計劃

---

## 支持和聯繫

遇到問題？

- 查看日誌: `docker-compose logs`
- 檢查健康: `curl http://localhost:8888/api/status`
- 重新啟動: `docker-compose restart`
- 重新部署: `docker-compose down && docker-compose up -d`

---

**最後更新**: 2026/02/15
**版本**: 1.0.0
**狀態**: ✅ 生產就緒
