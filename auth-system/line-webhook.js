/**
 * RemoteAI Guardian - LINE Webhook 接收器
 * 用於提取用戶 ID 和接收 LINE 事件
 */

const express = require('express');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(express.json());

const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;

/**
 * 驗證 LINE Webhook 簽名
 */
function verifySignature(body, signature) {
  const hash = crypto
    .createHmac('sha256', CHANNEL_SECRET)
    .update(body, 'utf8')
    .digest('base64');
  return hash === signature;
}

/**
 * 處理 LINE Webhook 事件
 */
app.post('/webhook/line', (req, res) => {
  const signature = req.headers['x-line-signature'];
  const body = JSON.stringify(req.body);

  if (!verifySignature(body, signature)) {
    console.log('⚠️ 簽名驗證失敗');
    return res.status(403).json({ error: 'Invalid signature' });
  }

  const { events } = req.body;

  events.forEach((event) => {
    console.log(`\n📨 收到 LINE 事件: ${event.type}`);
    console.log(`👤 用戶 ID: ${event.source.userId}`);

    // 將用戶 ID 保存到環境變數或數據庫
    if (event.type === 'message' && event.message.type === 'text') {
      console.log(`💬 訊息內容: ${event.message.text}`);
    }

    // 如果是配對事件或特定信號，保存 User ID
    if (event.source.userId) {
      console.log(`\n✅ 檢測到用戶 ID: ${event.source.userId}`);
      console.log('請將此 ID 添加到 .env 文件中的 LINE_USER_ID');
      
      // 可選：自動保存到文件
      const fs = require('fs');
      const envPath = '.env';
      let envContent = fs.readFileSync(envPath, 'utf8');
      
      if (!envContent.includes('LINE_USER_ID=')) {
        envContent += `\n# 從 LINE Webhook 自動檢測\nLINE_USER_ID=${event.source.userId}`;
        fs.writeFileSync(envPath, envContent);
        console.log('✅ LINE_USER_ID 已自動保存到 .env');
      }
    }
  });

  // 返回成功響應
  res.status(200).json({ success: true });
});

/**
 * 健康檢查端點
 */
app.get('/webhook/health', (req, res) => {
  res.json({ 
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.WEBHOOK_PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n🚀 LINE Webhook 接收器已啟動，端口: ${PORT}`);
  console.log(`📍 Webhook URL: http://localhost:${PORT}/webhook/line`);
  console.log('\n要設置 LINE Bot，請：');
  console.log('1. 前往 LINE Developers Console');
  console.log('2. 設置 Webhook URL');
  console.log('3. 在 LINE 上發送任何訊息');
  console.log('4. 自動提取的用戶 ID 將保存到 .env\n');
});
