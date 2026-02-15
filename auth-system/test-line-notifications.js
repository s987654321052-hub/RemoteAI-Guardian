/**
 * LINE 通知測試腳本
 */

const axios = require('axios');
require('dotenv').config();

class LineNotificationTester {
  constructor() {
    this.channelId = process.env.LINE_CHANNEL_ID;
    this.channelSecret = process.env.LINE_CHANNEL_SECRET;
    this.accessToken = process.env.LINE_ACCESS_TOKEN;
    this.userId = process.env.LINE_USER_ID;
    
    console.log('\n🔍 LINE 通知配置檢查\n');
    console.log(`Channel ID: ${this.channelId ? '✅ 已配置' : '❌ 未配置'}`);
    console.log(`Channel Secret: ${this.channelSecret ? '✅ 已配置' : '❌ 未配置'}`);
    console.log(`Access Token: ${this.accessToken ? '✅ 已配置' : '❌ 未配置'}`);
    console.log(`User ID: ${this.userId ? '✅ ' + this.userId.substring(0, 10) + '...' : '❌ 未配置'}\n`);
    
    if (!this.accessToken || !this.userId) {
      throw new Error('LINE_ACCESS_TOKEN 或 LINE_USER_ID 未配置');
    }
  }

  /**
   * 發送簡單文本訊息
   */
  async sendSimpleMessage() {
    console.log('📤 測試 1: 發送簡單訊息...');
    
    try {
      const response = await axios.post(
        'https://api.line.biz/v3/bot/message/push',
        {
          to: this.userId,
          messages: [
            {
              type: 'text',
              text: '🧪 RemoteAI Guardian 測試訊息\n\n這是一條測試訊息，確認 LINE 通知功能正常運作。'
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ 簡單訊息發送成功\n');
      return true;
    } catch (error) {
      console.error('❌ 簡單訊息發送失敗:', error.response?.data || error.message);
      console.error();
      return false;
    }
  }

  /**
   * 發送進度更新訊息
   */
  async sendProgressUpdate() {
    console.log('📤 測試 2: 發送進度更新...');
    
    try {
      const response = await axios.post(
        'https://api.line.biz/v3/bot/message/push',
        {
          to: this.userId,
          messages: [
            {
              type: 'text',
              text: `📊 RemoteAI Guardian 進度更新

🎯 項目: RemoteAI Guardian
📈 整體進度: 67%
✅ 已完成: 15/15 任務

🏆 完成情況:
  • 第一階段：基礎設置 ✅
  • 第二階段：功能擴展 ✅
  • 第三階段：優化和部署 ✅

⏰ 時間: ${new Date().toLocaleString('zh-TW')}`
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ 進度更新發送成功\n');
      return true;
    } catch (error) {
      console.error('❌ 進度更新發送失敗:', error.response?.data || error.message);
      console.error();
      return false;
    }
  }

  /**
   * 發送系統告警訊息
   */
  async sendAlertMessage() {
    console.log('📤 測試 3: 發送系統告警...');
    
    try {
      const response = await axios.post(
        'https://api.line.biz/v3/bot/message/push',
        {
          to: this.userId,
          messages: [
            {
              type: 'text',
              text: `⚠️ RemoteAI Guardian 系統告警

🔴 告警類型: 測試告警
📍 位置: 認證系統
📝 訊息: 這是一條測試告警訊息

🔧 建議操作:
  1. 檢查系統日誌
  2. 驗證連接狀態
  3. 重新啟動服務

⏰ 時間: ${new Date().toLocaleString('zh-TW')}`
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ 系統告警發送成功\n');
      return true;
    } catch (error) {
      console.error('❌ 系統告警發送失敗:', error.response?.data || error.message);
      console.error();
      return false;
    }
  }

  /**
   * 發送任務完成通知
   */
  async sendTaskCompletedNotification() {
    console.log('📤 測試 4: 發送任務完成通知...');
    
    try {
      const response = await axios.post(
        'https://api.line.biz/v3/bot/message/push',
        {
          to: this.userId,
          messages: [
            {
              type: 'text',
              text: `✅ 任務完成！

🎉 RemoteAI Guardian 系統開發完成

📋 完成的任務:
  ✅ 認證系統開發
  ✅ Web 儀表板
  ✅ LINE 通知集成
  ✅ Tailscale 遠程訪問
  ✅ Google APIs 集成
  ✅ 自動化任務系統
  ✅ iOS App 框架
  ✅ 性能優化
  ✅ 安全加固
  ✅ Docker 部署

🚀 下一步:
  1. 生產部署
  2. iOS App 完成開發
  3. 監控和告警設置

⏰ 時間: ${new Date().toLocaleString('zh-TW')}`
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ 任務完成通知發送成功\n');
      return true;
    } catch (error) {
      console.error('❌ 任務完成通知發送失敗:', error.response?.data || error.message);
      console.error();
      return false;
    }
  }

  /**
   * 發送配對確認訊息
   */
  async sendPairingConfirmation() {
    console.log('📤 測試 5: 發送配對確認訊息...');
    
    try {
      const response = await axios.post(
        'https://api.line.biz/v3/bot/message/push',
        {
          to: this.userId,
          messages: [
            {
              type: 'text',
              text: `🔗 設備配對確認

✅ 新設備已配對

📱 設備信息:
  設備名稱: Test iPhone
  設備 ID: iphone-test-123
  配對時間: ${new Date().toLocaleString('zh-TW')}
  狀態: 已確認

🔑 令牌信息:
  設備令牌有效期: 24 小時
  刷新令牌: 長期有效

🔒 安全性:
  連接: 加密 (TLS 1.3)
  驗證: JWT 令牌
  地點: Tailscale 網絡`
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ 配對確認訊息發送成功\n');
      return true;
    } catch (error) {
      console.error('❌ 配對確認訊息發送失敗:', error.response?.data || error.message);
      console.error();
      return false;
    }
  }

  /**
   * 運行所有測試
   */
  async runAllTests() {
    console.log('╔════════════════════════════════════════╗');
    console.log('║ 🧪 LINE 通知功能測試');
    console.log('╚════════════════════════════════════════╝\n');

    const results = [];

    results.push(await this.sendSimpleMessage());
    await this.delay(1000);

    results.push(await this.sendProgressUpdate());
    await this.delay(1000);

    results.push(await this.sendAlertMessage());
    await this.delay(1000);

    results.push(await this.sendTaskCompletedNotification());
    await this.delay(1000);

    results.push(await this.sendPairingConfirmation());

    // 測試結果摘要
    console.log('╔════════════════════════════════════════╗');
    console.log('║ 📊 測試結果摘要');
    console.log('╚════════════════════════════════════════╝\n');

    const passed = results.filter(r => r).length;
    const total = results.length;

    console.log(`✅ 通過: ${passed}/${total}\n`);

    const tests = [
      '簡單訊息',
      '進度更新',
      '系統告警',
      '任務完成通知',
      '配對確認'
    ];

    tests.forEach((test, index) => {
      const status = results[index] ? '✅' : '❌';
      console.log(`${status} ${test}`);
    });

    console.log();

    if (passed === total) {
      console.log('🎉 所有測試通過！LINE 通知功能正常運作。\n');
    } else {
      console.log(`⚠️ ${total - passed} 個測試失敗，請檢查配置。\n`);
    }
  }

  /**
   * 延遲函數
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 執行測試
async function main() {
  try {
    const tester = new LineNotificationTester();
    await tester.runAllTests();
  } catch (error) {
    console.error('❌ 測試準備失敗:', error.message);
    console.log('\n📋 請確保已在 .env 文件中配置以下變數:');
    console.log('   LINE_ACCESS_TOKEN=your_token');
    console.log('   LINE_USER_ID=your_user_id\n');
  }
}

main().catch(console.error);
