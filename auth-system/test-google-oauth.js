/**
 * RemoteAI Guardian - Google OAuth 授權測試
 * 用於完成 Google 帳號授權
 */

const express = require('express');
const GoogleOAuthManager = require('./google-oauth');

async function startAuthFlow() {
  console.log('\n🔐 RemoteAI Guardian - Google OAuth 授權流程\n');
  
  const oauth = new GoogleOAuthManager();
  const app = express();
  const PORT = 8889;

  // 建立授權伺服器
  const authServer = oauth.createAuthServer();
  
  // 添加簡單的首頁
  authServer.get('/', (req, res) => {
    res.send(`
      <html>
        <head>
          <title>RemoteAI Guardian - Google 授權</title>
          <style>
            body { font-family: Arial; text-align: center; margin-top: 50px; }
            .container { max-width: 500px; margin: 0 auto; }
            a { display: inline-block; padding: 12px 24px; background: #4285F4; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            a:hover { background: #357ae8; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🚀 RemoteAI Guardian</h1>
            <p>點擊下方按鈕授權 Google 帳號</p>
            <p style="color: #999; font-size: 12px;">
              授權後系統將能訪問:<br>
              • Google Sheets (讀寫)<br>
              • Google Docs (讀寫)<br>
              • Gmail (讀取)<br>
              • Google Calendar (讀寫)<br>
              • Google Drive (讀取)
            </p>
            <a href="/oauth/start">授權 Google 帳號</a>
          </div>
        </body>
      </html>
    `);
  });

  // 啟動伺服器
  authServer.listen(PORT, () => {
    console.log('✅ 授權伺服器已啟動');
    console.log(`📱 打開瀏覽器: http://localhost:${PORT}`);
    console.log('\n等待授權...\n');
  });
}

// 執行
startAuthFlow().catch(console.error);
