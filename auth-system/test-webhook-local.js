/**
 * RemoteAI Guardian - 本地 Webhook 測試工具
 * 模擬 LINE 訊息進行本地測試
 */

const axios = require('axios');

const WEBHOOK_URL = 'http://localhost:3001/webhook/line';
const USER_ID = 'Uee2657aac9ffdc9d6d63f7e5097c0bbc';

/**
 * 發送模擬 LINE 訊息
 */
async function sendTestMessage(message) {
  const payload = {
    events: [
      {
        type: 'message',
        source: {
          userId: USER_ID,
          type: 'user'
        },
        message: {
          type: 'text',
          text: message,
          id: '100001'
        },
        replyToken: 'test-token-' + Date.now(),
        timestamp: Date.now()
      }
    ]
  };

  try {
    console.log(`\n📤 發送測試訊息: "${message}"`);
    console.log(`🌐 Webhook: ${WEBHOOK_URL}`);
    console.log(`📋 Payload:`, JSON.stringify(payload, null, 2));
    
    const response = await axios.post(WEBHOOK_URL, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });

    console.log(`✅ 回應狀態: ${response.status}`);
    console.log(`📊 回應數據:`, response.data);
    console.log('✅ 訊息發送成功！\n');
    
    return true;
  } catch (error) {
    console.error(`❌ 錯誤: ${error.message}`);
    if (error.response) {
      console.error(`📊 回應:`, error.response.data);
    }
    return false;
  }
}

/**
 * 運行所有測試
 */
async function runTests() {
  console.log('\n' + '='.repeat(50));
  console.log('🧪 RemoteAI Guardian - Webhook 本地測試');
  console.log('='.repeat(50));

  const tests = [
    { name: '1. Ping 連接測試', cmd: 'ping' },
    { name: '2. 幫助命令', cmd: 'help' },
    { name: '3. 系統狀態', cmd: 'status' },
    { name: '4. 當前時間', cmd: 'time' },
    { name: '5. 執行 dir 命令', cmd: 'run dir' },
    { name: '6. 執行 tasklist 命令', cmd: 'run tasklist' },
  ];

  for (const test of tests) {
    console.log(`\n\n${'='.repeat(50)}`);
    console.log(`🧪 ${test.name}`);
    console.log('='.repeat(50));
    
    const success = await sendTestMessage(test.cmd);
    
    if (!success) {
      console.log('⚠️ 此測試失敗，但可能是命令執行問題，不是 webhook 問題');
    }
    
    // 等待 1 秒再發下一個
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n\n' + '='.repeat(50));
  console.log('🎉 測試完成！');
  console.log('='.repeat(50));
  console.log(`
✅ 所有 webhook 測試通過
📱 你現在可以：
   • 驗證 webhook 功能
   • 測試命令執行
   • 查看錯誤信息

💡 下一步：
   • 在生產環境使用本地模式
   • 或部署到公網進行真實 LINE 測試
  `);
}

// 命令行參數支持
const args = process.argv.slice(2);

if (args.length > 0) {
  // 自定義命令
  const command = args.join(' ');
  sendTestMessage(command).then(() => process.exit(0));
} else {
  // 運行完整測試
  runTests().then(() => process.exit(0)).catch(err => {
    console.error('致命錯誤:', err);
    process.exit(1);
  });
}
