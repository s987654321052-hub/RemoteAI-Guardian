/**
 * 配對診斷腳本
 */

const axios = require('axios');

async function diagnose() {
  console.log('\n🔍 配對診斷開始...\n');

  try {
    // 1. 檢查系統狀態
    console.log('1️⃣ 檢查認證系統...');
    const statusRes = await axios.get('http://localhost:8888/api/status', { timeout: 5000 });
    console.log(`   ✅ 系統正常: ${statusRes.data.status}`);
    console.log(`   已配對設備: ${statusRes.data.pairedDevices}`);
    console.log(`   活躍令牌: ${statusRes.data.activeTokens}\n`);

    // 2. 生成配對碼
    console.log('2️⃣ 生成配對碼...');
    const pairRes = await axios.post('http://localhost:8888/api/pair/request', {
      deviceName: '測試 iPhone'
    }, { timeout: 5000 });
    
    if (!pairRes.data.success) {
      console.log('   ❌ 生成失敗');
      return;
    }
    
    console.log(`   ✅ 配對碼: ${pairRes.data.pairingCode}`);
    console.log(`   配對 ID: ${pairRes.data.pairingId}`);
    const pairingCode = pairRes.data.pairingCode;
    const pairingId = pairRes.data.pairingId;
    console.log();

    // 3. 確認配對
    console.log('3️⃣ 確認配對...');
    const confirmRes = await axios.post('http://localhost:8888/api/pair/confirm', {
      pairingId: pairingId,
      pairingCode: pairingCode,
      deviceUUID: 'test-device-123'
    }, { timeout: 5000 });

    if (confirmRes.data.success) {
      console.log('   ✅ 配對成功！');
      console.log(`   設備令牌: ${confirmRes.data.deviceToken.substring(0, 20)}...`);
      console.log(`   刷新令牌: ${confirmRes.data.refreshToken.substring(0, 20)}...`);
    } else {
      console.log(`   ❌ 確認失敗: ${confirmRes.data.error}`);
    }
    console.log();

    // 4. 檢查日誌
    console.log('4️⃣ 檢查系統日誌...');
    const logsRes = await axios.get('http://localhost:8888/api/logs?limit=10', { timeout: 5000 });
    logsRes.data.forEach(log => {
      console.log(`   [${log.eventType}] ${log.message}`);
    });
    console.log();

    // 5. 檢查設備列表
    console.log('5️⃣ 檢查設備列表...');
    const devicesRes = await axios.get('http://localhost:8888/api/devices', { timeout: 5000 });
    if (devicesRes.data.devices.length === 0) {
      console.log('   ⚠️ 暫無設備');
    } else {
      devicesRes.data.devices.forEach(device => {
        console.log(`   📱 ${device.deviceName} - ${device.status}`);
      });
    }

  } catch (error) {
    console.error(`\n❌ 診斷失敗: ${error.message}`);
  }
}

diagnose();
