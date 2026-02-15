/**
 * RemoteAI Guardian - 集成測試（簡化版）
 * 測試認證系統 + LINE 通知
 */

const axios = require('axios');
require('dotenv').config();

class IntegrationTest {
  constructor() {
    this.results = [];
  }

  /**
   * 測試認證系統健康檢查
   */
  async testAuthSystem() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║ 測試 1: 認證系統健康檢查');
    console.log('╚════════════════════════════════════════╝\n');

    try {
      console.log('🔗 連接到 http://localhost:8888...');
      const response = await axios.get('http://localhost:8888/api/status', {
        timeout: 5000
      });
      
      console.log('✅ 認證系統正常運行');
      console.log(`   狀態: ${response.data.status}`);
      console.log(`   已配對設備: ${response.data.pairedDevices}`);
      console.log(`   活躍令牌: ${response.data.activeTokens}`);
      this.results.push({ test: '認證系統', status: 'PASS' });
      return true;
    } catch (error) {
      console.error('❌ 認證系統檢查失敗');
      console.error(`   原因: ${error.message}`);
      console.error('   確保: node auth-system.js 仍在運行');
      this.results.push({ test: '認證系統', status: 'FAIL', error: error.message });
      return false;
    }
  }

  /**
   * 測試認證 API 端點
   */
  async testAuthEndpoints() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║ 測試 2: 認證 API 端點');
    console.log('╚════════════════════════════════════════╝\n');

    try {
      // 測試配對請求端點
      console.log('🔄 測試配對請求端點...');
      const pairResponse = await axios.post(
        'http://localhost:8888/api/pair/request',
        { deviceName: '測試 iPhone' },
        { timeout: 5000 }
      );

      if (pairResponse.data.success && pairResponse.data.pairingCode) {
        console.log(`✅ 配對端點正常`);
        console.log(`   配對碼: ${pairResponse.data.pairingCode}`);
        console.log(`   配對 ID: ${pairResponse.data.pairingId.substring(0, 8)}...`);
        
        // 測試設備列表
        console.log('\n📋 測試設備列表...');
        const devicesResponse = await axios.get(
          'http://localhost:8888/api/devices',
          { timeout: 5000 }
        );
        
        console.log(`✅ 設備列表正常`);
        console.log(`   配對設備數: ${devicesResponse.data.total}`);
        
        this.results.push({ test: '認證 API', status: 'PASS' });
        return true;
      }
    } catch (error) {
      console.error('❌ 認證 API 測試失敗:', error.message);
      this.results.push({ test: '認證 API', status: 'FAIL', error: error.message });
      return false;
    }
  }

  /**
   * 測試 LINE 通知配置
   */
  testLineConfiguration() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║ 測試 3: LINE 通知配置');
    console.log('╚════════════════════════════════════════╝\n');

    try {
      const hasToken = !!process.env.LINE_ACCESS_TOKEN;
      const hasUserId = !!process.env.LINE_USER_ID;
      const hasChannelId = !!process.env.LINE_CHANNEL_ID;

      console.log('📋 LINE 配置檢查:');
      console.log(`   Access Token: ${hasToken ? '✅' : '❌'}`);
      console.log(`   Channel ID: ${hasChannelId ? '✅' : '❌'}`);
      console.log(`   User ID: ${hasUserId ? '✅ ' + process.env.LINE_USER_ID.substring(0, 10) + '...' : '⚠️ (可選)'}`);

      if (hasToken && hasChannelId) {
        if (hasUserId) {
          console.log('\n✅ LINE 通知已完整配置');
          this.results.push({ test: 'LINE 通知', status: 'PASS' });
        } else {
          console.log('\n⚠️ LINE 通知部分配置（缺少 USER_ID，功能可用但不會推送）');
          this.results.push({ test: 'LINE 通知', status: 'WARN' });
        }
        return true;
      } else {
        console.log('\n⚠️ LINE 通知未配置（可選功能）');
        this.results.push({ test: 'LINE 通知', status: 'WARN' });
        return false;
      }
    } catch (error) {
      console.error('❌ LINE 配置檢查失敗:', error.message);
      this.results.push({ test: 'LINE 通知', status: 'FAIL' });
      return false;
    }
  }

  /**
   * 測試 Tailscale 配置
   */
  testTailscaleConfiguration() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║ 測試 4: Tailscale 遠端訪問');
    console.log('╚════════════════════════════════════════╝\n');

    try {
      const tailscaleIp = process.env.TAILSCALE_IP;
      const tailscaleUrl = 'https://desktop-vil1hl8.tail1bf179.ts.net';

      console.log('📋 Tailscale 配置檢查:');
      console.log(`   Windows IP: ${tailscaleIp ? '✅ ' + tailscaleIp : '⚠️'}`);
      console.log(`   公開 URL: ${tailscaleUrl}`);

      console.log('\n🌐 遠端訪問信息:');
      console.log(`   內部訪問: ${tailscaleUrl}/api/status`);
      console.log(`   公開訪問: https://desktop-vil1hl8.tail1bf179.ts.net/api/status`);

      if (tailscaleIp) {
        console.log('\n✅ Tailscale 配置完成');
        this.results.push({ test: 'Tailscale', status: 'PASS' });
        return true;
      } else {
        this.results.push({ test: 'Tailscale', status: 'WARN' });
        return false;
      }
    } catch (error) {
      console.error('❌ Tailscale 檢查失敗:', error.message);
      this.results.push({ test: 'Tailscale', status: 'FAIL' });
      return false;
    }
  }

  /**
   * 輸出測試結果摘要
   */
  printSummary() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║ 🧪 系統配置檢查摘要');
    console.log('╚════════════════════════════════════════╝\n');

    const table = this.results.map(r => {
      const statusIcon = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : '⚠️';
      return {
        '檢查項': r.test,
        '狀態': statusIcon,
        '結果': r.status,
        '備註': r.reason || r.error || 'OK'
      };
    });

    console.table(table);

    const passed = this.results.filter(r => r.status === 'PASS').length;
    const total = this.results.length;
    
    console.log(`\n📊 系統狀態: ${passed}/${total} 完成\n`);
    
    if (passed >= 2) {
      console.log('🎉 系統已就緒！可以開始開發。\n');
    } else {
      console.log('⚠️ 系統配置不完整，請檢查上面的提示。\n');
    }
  }

  /**
   * 運行所有測試
   */
  async runAll() {
    console.log('\n🚀 開始執行系統配置檢查（簡化版）...\n');

    await this.testAuthSystem();
    await new Promise(resolve => setTimeout(resolve, 500));

    await this.testAuthEndpoints();
    await new Promise(resolve => setTimeout(resolve, 500));

    this.testLineConfiguration();
    await new Promise(resolve => setTimeout(resolve, 500));

    this.testTailscaleConfiguration();

    this.printSummary();
  }
}

// 執行測試
if (require.main === module) {
  const tester = new IntegrationTest();
  tester.runAll().catch(error => {
    console.error('測試運行失敗:', error);
    process.exit(1);
  });
}

module.exports = IntegrationTest;
