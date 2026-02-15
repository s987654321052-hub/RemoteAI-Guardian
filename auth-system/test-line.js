/**
 * RemoteAI Guardian - LINE 通知測試
 */

const LineNotifier = require('./line-notifier');
require('dotenv').config();

async function testLineNotification() {
  console.log('\n📱 RemoteAI Guardian - LINE 通知測試\n');
  
  const notifier = new LineNotifier();
  const userId = process.env.LINE_USER_ID;

  if (!userId) {
    console.error('❌ 缺少 LINE_USER_ID，請在 .env 中設置');
    process.exit(1);
  }

  try {
    // 測試 1: 發送系統啟動通知
    console.log('1️⃣  發送系統啟動通知...');
    await notifier.sendSystemStarted(userId);
    await new Promise(r => setTimeout(r, 1000));

    // 測試 2: 發送進度更新
    console.log('2️⃣  發送進度更新通知...');
    await notifier.sendProgressUpdate(
      userId,
      'RemoteAI Guardian',
      35,
      'Google 應用密碼配置',
      100
    );
    await new Promise(r => setTimeout(r, 1000));

    // 測試 3: 發送任務完成通知
    console.log('3️⃣  發送任務完成通知...');
    await notifier.sendTaskCompleted(
      userId,
      'Tailscale 部署',
      'LINE 通知測試'
    );
    await new Promise(r => setTimeout(r, 1000));

    // 測試 4: 發送階段完成通知
    console.log('4️⃣  發送階段完成通知...');
    await notifier.sendPhaseCompleted(
      userId,
      '第一階段: 認證系統',
      '第二階段: 手機應用'
    );

    console.log('\n✅ 所有 LINE 通知測試已完成！');
    console.log('\n📱 檢查你的 LINE，應該收到 4 條訊息。\n');

  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
    process.exit(1);
  }
}

// 執行
testLineNotification();
