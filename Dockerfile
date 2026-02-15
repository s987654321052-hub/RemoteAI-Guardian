FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init curl

COPY auth-system/package*.json ./

RUN npm ci --only=production 2>&1 | head -20

COPY auth-system/*.js ./

RUN mkdir -p data logs credentials public

ENV NODE_ENV=production

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "railway-final.js"]
