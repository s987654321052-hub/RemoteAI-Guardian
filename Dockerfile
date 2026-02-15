FROM node:20-alpine

# 設置工作目錄
WORKDIR /app

# 安裝系統依賴
RUN apk add --no-cache dumb-init curl

# 複製 package files
COPY auth-system/package*.json ./

# 安裝生產依賴
RUN npm ci --only=production

# 複製應用代碼
COPY auth-system/ ./

# 建立必需的目錄
RUN mkdir -p data logs credentials public

# 設置環境變數
ENV NODE_ENV=production
ENV LOG_LEVEL=info

# 暴露端口
EXPOSE 3000

# 健康檢查（使用 curl）
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# 使用 dumb-init 作為 PID 1 進程
ENTRYPOINT ["dumb-init", "--"]

# 啟動應用（直接指向 railway-start.js）
CMD ["node", "railway-start.js"]
