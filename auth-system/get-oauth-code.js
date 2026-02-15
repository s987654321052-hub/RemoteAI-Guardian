/**
 * RemoteAI Guardian - 簡單的 OAuth 授權工具
 * 直接生成授權 URL
 */

const fs = require('fs');

// 讀取 OAuth 憑證
const credentialsPath = '../credentials/google-oauth.json';
const content = fs.readFileSync(credentialsPath, 'utf8');
const credentials = JSON.parse(content).installed;

// OAuth 授權參數
const params = new URLSearchParams({
  client_id: credentials.client_id,
  redirect_uri: 'http://localhost:8889/oauth/callback',
  response_type: 'code',
  scope: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/documents',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/drive'
  ].join(' '),
  access_type: 'offline',
  prompt: 'consent'
});

const authUrl = `${credentials.auth_uri}?${params.toString()}`;

console.log('\n🔐 Google OAuth 授權 URL\n');
console.log('在瀏覽器中打開此 URL：\n');
console.log(authUrl);
console.log('\n\n複製上面的完整 URL 到瀏覽器中打開。\n');
console.log('授權後，Google 會重定向到一個包含 code 參數的 URL。');
console.log('複製那個 URL 並貼到下方。\n');

// 讀取用戶輸入
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('請貼上重定向後的完整 URL: ', async (redirectUrl) => {
  try {
    // 解析授權碼
    const url = new URL(redirectUrl);
    const authCode = url.searchParams.get('code');
    
    if (!authCode) {
      console.log('\n❌ 找不到授權碼，請檢查 URL 是否正確');
      rl.close();
      return;
    }

    console.log(`\n✅ 找到授權碼: ${authCode.substring(0, 20)}...\n`);

    // 交換令牌
    console.log('⏳ 正在交換令牌...\n');
    
    const axios = require('axios');
    const response = await axios.post(credentials.token_uri, {
      code: authCode,
      client_id: credentials.client_id,
      client_secret: credentials.client_secret,
      redirect_uri: 'http://localhost:8889/oauth/callback',
      grant_type: 'authorization_code'
    });

    const tokens = {
      ...response.data,
      created_at: Date.now(),
      expires_at: Date.now() + (response.data.expires_in * 1000)
    };

    // 保存令牌
    const tokenPath = '../credentials/google-token.json';
    fs.writeFileSync(tokenPath, JSON.stringify(tokens, null, 2));

    console.log('✅ 授權成功！');
    console.log(`✅ 令牌已保存到: ${tokenPath}\n`);
    console.log('你可以現在關閉此程序，重啟認證系統。\n');

  } catch (error) {
    console.error('\n❌ 授權失敗:', error.response?.data?.error_description || error.message);
  }

  rl.close();
});
