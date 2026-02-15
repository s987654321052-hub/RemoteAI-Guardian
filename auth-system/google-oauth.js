/**
 * RemoteAI Guardian - Google OAuth 2.0 整合
 * 用於 Google Sheets、Docs、Gmail、Gemini 的驗證
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

class GoogleOAuthManager {
  constructor() {
    this.credentialsPath = process.env.GOOGLE_OAUTH_PATH || '../credentials/google-oauth.json';
    this.tokenPath = path.join(path.dirname(this.credentialsPath), 'google-token.json');
    this.scopes = [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/documents',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/drive'
    ];
    
    this.credentials = this.loadCredentials();
  }

  /**
   * 載入 OAuth 憑證
   */
  loadCredentials() {
    try {
      const content = fs.readFileSync(this.credentialsPath);
      return JSON.parse(content).installed;
    } catch (error) {
      console.error('❌ 無法載入 Google OAuth 憑證:', error.message);
      process.exit(1);
    }
  }

  /**
   * 生成授權 URL
   */
  getAuthUrl() {
    const redirectUri = this.credentials.redirect_uris[0] || 'http://localhost';
    const params = new URLSearchParams({
      client_id: this.credentials.client_id,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: this.scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent'
    });

    return `${this.credentials.auth_uri}?${params.toString()}`;
  }

  /**
   * 用授權碼交換訪問令牌
   */
  async getAccessToken(authCode) {
    try {
      const redirectUri = this.credentials.redirect_uris[0] || 'http://localhost';
      const response = await axios.post(this.credentials.token_uri, {
        code: authCode,
        client_id: this.credentials.client_id,
        client_secret: this.credentials.client_secret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      });

      const tokens = response.data;
      
      // 保存令牌
      this.saveTokens(tokens);
      
      console.log('✅ 訪問令牌已獲得');
      return tokens;
    } catch (error) {
      console.error('❌ 無法獲得訪問令牌:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * 刷新訪問令牌
   */
  async refreshAccessToken() {
    try {
      const tokens = this.loadTokens();
      
      if (!tokens.refresh_token) {
        throw new Error('沒有刷新令牌，需要重新授權');
      }

      const response = await axios.post(this.credentials.token_uri, {
        refresh_token: tokens.refresh_token,
        client_id: this.credentials.client_id,
        client_secret: this.credentials.client_secret,
        grant_type: 'refresh_token'
      });

      const newTokens = {
        ...tokens,
        ...response.data,
        created_at: Date.now()
      };

      this.saveTokens(newTokens);
      console.log('✅ 訪問令牌已刷新');
      return newTokens;
    } catch (error) {
      console.error('❌ 無法刷新訪問令牌:', error.message);
      throw error;
    }
  }

  /**
   * 保存令牌到文件
   */
  saveTokens(tokens) {
    const dataToSave = {
      ...tokens,
      created_at: Date.now(),
      expires_at: Date.now() + (tokens.expires_in * 1000)
    };

    fs.writeFileSync(this.tokenPath, JSON.stringify(dataToSave, null, 2));
    console.log(`✅ 令牌已保存到 ${this.tokenPath}`);
  }

  /**
   * 載入保存的令牌
   */
  loadTokens() {
    try {
      const content = fs.readFileSync(this.tokenPath);
      return JSON.parse(content);
    } catch (error) {
      console.error('⚠️ 無法載入令牌（可能尚未授權）:', error.message);
      return null;
    }
  }

  /**
   * 獲得有效的訪問令牌
   */
  async getValidAccessToken() {
    let tokens = this.loadTokens();

    if (!tokens) {
      throw new Error('沒有保存的令牌，需要授權');
    }

    // 檢查令牌是否已過期
    if (tokens.expires_at && Date.now() > tokens.expires_at - 300000) {
      // 提前 5 分鐘刷新
      tokens = await this.refreshAccessToken();
    }

    return tokens.access_token;
  }

  /**
   * 驗證 Google API 連接
   */
  async verifyConnection() {
    try {
      const accessToken = await this.getValidAccessToken();
      
      const response = await axios.get(
        'https://www.googleapis.com/drive/v3/about?fields=user',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      const userName = response.data.user.displayName;
      console.log(`✅ 已連接到 Google 帳號: ${userName}`);
      return true;
    } catch (error) {
      console.error('❌ Google API 連接失敗:', error.message);
      return false;
    }
  }

  /**
   * 建立授權伺服器
   */
  createAuthServer() {
    const express = require('express');
    const app = express();

    // 授權開始
    app.get('/oauth/start', (req, res) => {
      const authUrl = this.getAuthUrl();
      res.send(`
        <h1>RemoteAI Guardian - Google 授權</h1>
        <p>點擊下方連結授權 Google 帳號：</p>
        <a href="${authUrl}" style="
          display: inline-block;
          padding: 10px 20px;
          background: #4285F4;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        ">授權 Google 帳號</a>
      `);
    });

    // 授權回調
    app.get('/oauth/callback', async (req, res) => {
      const { code, error } = req.query;

      if (error) {
        res.send(`<h1>❌ 授權失敗</h1><p>錯誤: ${error}</p>`);
        return;
      }

      try {
        await this.getAccessToken(code);
        res.send(`
          <h1>✅ 授權成功！</h1>
          <p>Google 帳號已連接，你可以關閉此窗口。</p>
          <script>setTimeout(() => window.close(), 3000);</script>
        `);
      } catch (error) {
        res.send(`<h1>❌ 授權失敗</h1><p>${error.message}</p>`);
      }
    });

    return app;
  }
}

// 導出
module.exports = GoogleOAuthManager;

// 使用示例
if (require.main === module) {
  const oauth = new GoogleOAuthManager();
  
  console.log('🔐 Google OAuth 管理器已初始化\n');
  console.log('授權 URL:');
  console.log(oauth.getAuthUrl());
  console.log('\n在瀏覽器中打開上述 URL 進行授權。');
}
