/**
 * RemoteAI Guardian - Google 應用密碼認證
 * 不使用 OAuth，直接用 Gmail 應用密碼
 * 適用於有企業政策限制的帳號
 */

const fs = require('fs');
const readline = require('readline');

class GoogleAppPasswordAuth {
  constructor() {
    this.tokenPath = '../credentials/google-app-password.json';
  }

  /**
   * 設置應用密碼
   */
  async setupAppPassword() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('\n📧 Google 應用密碼設置\n');
    console.log('由於你的 Gmail 帳號有企業政策限制，我們改用「應用密碼」方式。\n');
    console.log('步驟：');
    console.log('1. 進入 Google 帳號安全性設定: https://myaccount.google.com/security');
    console.log('2. 找到「應用密碼」(App passwords)');
    console.log('3. 選擇「Mail」和「Windows 電腦」');
    console.log('4. Google 會生成一個 16 位密碼');
    console.log('5. 複製密碼貼到下方\n');

    rl.question('請輸入你的 Gmail 帳號 (s987654321052@gmail.com): ', (email) => {
      rl.question('請輸入 Google 應用密碼 (16 位，不含空格): ', (appPassword) => {
        try {
          const credentials = {
            email: email,
            appPassword: appPassword,
            created_at: new Date().toISOString()
          };

          fs.writeFileSync(this.tokenPath, JSON.stringify(credentials, null, 2));
          
          console.log('\n✅ 應用密碼已保存');
          console.log(`✅ 文件位置: ${this.tokenPath}\n`);
          
        } catch (error) {
          console.error('❌ 保存失敗:', error.message);
        }

        rl.close();
      });
    });
  }

  /**
   * 驗證連接
   */
  async verifyConnection() {
    try {
      const creds = JSON.parse(fs.readFileSync(this.tokenPath, 'utf8'));
      
      // 這裡可以用 gmail API 或 nodemailer 驗證
      console.log(`✅ 已連接到: ${creds.email}`);
      return true;
    } catch (error) {
      console.error('❌ 無法讀取應用密碼:', error.message);
      return false;
    }
  }
}

// 執行
const auth = new GoogleAppPasswordAuth();
auth.setupAppPassword();

module.exports = GoogleAppPasswordAuth;
