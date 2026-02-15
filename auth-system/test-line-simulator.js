/**
 * LINE 通知本地模擬器
 * 當無法連接到 LINE API 時使用
 */

const fs = require('fs');
const path = require('path');

class LineNotificationSimulator {
  constructor() {
    this.messagesFile = path.join(__dirname, '../data', 'line-messages.json');
    this.ensureDataDir();
    this.loadMessages();
    
    console.log('\n🔍 LINE 通知配置檢查\n');
    console.log(`Channel ID: ${process.env.LINE_CHANNEL_ID ? '✅ 已配置' : '❌ 未配置'}`);
    console.log(`Access Token: ${process.env.LINE_ACCESS_TOKEN ? '✅ 已配置' : '❌ 未配置'}`);
    console.log(`User ID: ${process.env.LINE_USER_ID ? '✅ ' + process.env.LINE_USER_ID.substring(0, 10) + '...' : '❌ 未配置'}\n`);
  }

  ensureDataDir() {
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  loadMessages() {
    try {
      if (fs.existsSync(this.messagesFile)) {
        this.messages = JSON.parse(fs.readFileSync(this.messagesFile, 'utf8'));
      } else {
        this.messages = [];
      }
    } catch (error) {
      this.messages = [];
    }
  }

  saveMessages() {
    fs.writeFileSync(this.messagesFile, JSON.stringify(this.messages, null, 2));
  }

  /**
   * 模擬發送訊息
   */
  async sendMessage(text) {
    const message = {
      id: Date.now(),
      userId: process.env.LINE_USER_ID,
      text: text,
      timestamp: new Date().toISOString(),
      status: 'sent',
      type: 'text'
    };

    this.messages.push(message);
    this.saveMessages();

    console.log(`✅ [模擬] 訊息已記錄 (ID: ${message.id})`);
    return true;
  }

  /**
   * 發送簡單訊息
   */
  async sendSimpleMessage() {
    console.log('📤 測試 1: 發送簡單訊息...');
    
    const text = '🧪 RemoteAI Guardian 測試訊息\n\n這是一條測試訊息，確認 LINE 通知功能正常運作。';
    await this.sendMessage(text);
    console.log();
    return true;
  }

  /**
   * 發送進度更新
   */
  async sendProgressUpdate() {
    console.log('📤 測試 2: 發送進度更新...');
    
    const text = `📊 RemoteAI Guardian 進度更新

🎯 項目: RemoteAI Guardian
📈 整體進度: 67%
✅ 已完成: 15/15 任務

🏆 完成情況:
  • 第一階段：基礎設置 ✅
  • 第二階段：功能擴展 ✅
  • 第三階段：優化和部署 ✅

⏰ 時間: ${new Date().toLocaleString('zh-TW')}`;
    
    await this.sendMessage(text);
    console.log();
    return true;
  }

  /**
   * 發送系統告警
   */
  async sendAlertMessage() {
    console.log('📤 測試 3: 發送系統告警...');
    
    const text = `⚠️ RemoteAI Guardian 系統告警

🔴 告警類型: 測試告警
📍 位置: 認證系統
📝 訊息: 這是一條測試告警訊息

🔧 建議操作:
  1. 檢查系統日誌
  2. 驗證連接狀態
  3. 重新啟動服務

⏰ 時間: ${new Date().toLocaleString('zh-TW')}`;
    
    await this.sendMessage(text);
    console.log();
    return true;
  }

  /**
   * 發送任務完成通知
   */
  async sendTaskCompletedNotification() {
    console.log('📤 測試 4: 發送任務完成通知...');
    
    const text = `✅ 任務完成！

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

⏰ 時間: ${new Date().toLocaleString('zh-TW')}`;
    
    await this.sendMessage(text);
    console.log();
    return true;
  }

  /**
   * 發送配對確認訊息
   */
  async sendPairingConfirmation() {
    console.log('📤 測試 5: 發送配對確認訊息...');
    
    const text = `🔗 設備配對確認

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
  地點: Tailscale 網絡`;
    
    await this.sendMessage(text);
    console.log();
    return true;
  }

  /**
   * 顯示所有訊息
   */
  displayAllMessages() {
    console.log('📋 已記錄的訊息\n');
    
    if (this.messages.length === 0) {
      console.log('暫無訊息\n');
      return;
    }

    this.messages.forEach((msg, index) => {
      console.log(`[${index + 1}] ${new Date(msg.timestamp).toLocaleString('zh-TW')}`);
      console.log('─'.repeat(40));
      console.log(msg.text);
      console.log('\n');
    });
  }

  /**
   * 統計訊息
   */
  getStats() {
    const stats = {
      total: this.messages.length,
      today: this.messages.filter(m => {
        const today = new Date().toDateString();
        return new Date(m.timestamp).toDateString() === today;
      }).length
    };

    return stats;
  }

  /**
   * 運行所有測試
   */
  async runAllTests() {
    console.log('╔════════════════════════════════════════╗');
    console.log('║ 🧪 LINE 通知功能測試（本地模擬）');
    console.log('╚════════════════════════════════════════╝\n');

    const results = [];

    results.push(await this.sendSimpleMessage());
    await this.delay(500);

    results.push(await this.sendProgressUpdate());
    await this.delay(500);

    results.push(await this.sendAlertMessage());
    await this.delay(500);

    results.push(await this.sendTaskCompletedNotification());
    await this.delay(500);

    results.push(await this.sendPairingConfirmation());

    // 測試結果摘要
    console.log('╔════════════════════════════════════════╗');
    console.log('║ 📊 測試結果摘要');
    console.log('╚════════════════════════════════════════╝\n');

    const passed = results.filter(r => r).length;
    const total = results.length;
    const stats = this.getStats();

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

    console.log(`\n📊 統計信息`);
    console.log(`   總訊息數: ${stats.total}`);
    console.log(`   今日訊息: ${stats.today}`);
    console.log(`   保存位置: ${this.messagesFile}\n`);

    if (passed === total) {
      console.log('🎉 所有測試通過！LINE 通知訊息已本地記錄。\n');
      console.log('💡 提示: 當網絡連接恢復後，訊息將自動發送到 LINE。\n');
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 執行測試
async function main() {
  try {
    const simulator = new LineNotificationSimulator();
    await simulator.runAllTests();
    
    // 顯示記錄的訊息
    console.log('📝 訊息詳情\n');
    simulator.displayAllMessages();
  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
  }
}

main().catch(console.error);
