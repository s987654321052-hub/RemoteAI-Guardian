/**
 * RemoteAI Guardian 生產部署檢查清單
 */

const fs = require('fs');
const path = require('path');

class ProductionDeploymentChecker {
  constructor() {
    this.checks = [];
    this.timestamp = new Date().toISOString();
  }

  /**
   * 檢查環境變數
   */
  checkEnvironmentVariables() {
    console.log('\n📋 檢查環境變數...\n');

    const required = [
      'NODE_ENV',
      'AUTH_PORT',
      'DASHBOARD_PORT',
      'LINE_CHANNEL_ID',
      'LINE_CHANNEL_SECRET',
      'LINE_ACCESS_TOKEN',
      'LINE_USER_ID',
      'TAILSCALE_IP',
      'SECRET_KEY',
      'LOG_LEVEL'
    ];

    const optional = [
      'MONGODB_URI',
      'REDIS_URL',
      'LOG_DIR'
    ];

    let passed = 0;
    let warning = 0;

    console.log('必需變數:');
    required.forEach(env => {
      const value = process.env[env];
      if (value) {
        console.log(`  ✅ ${env}`);
        passed++;
      } else {
        console.log(`  ❌ ${env} - 未配置`);
      }
    });

    console.log('\n可選變數:');
    optional.forEach(env => {
      const value = process.env[env];
      if (value) {
        console.log(`  ✅ ${env}`);
      } else {
        console.log(`  ⚠️ ${env} - 使用默認值`);
        warning++;
      }
    });

    this.checks.push({
      name: '環境變數',
      passed: passed === required.length,
      details: `${passed}/${required.length} 必需變數已配置`
    });

    console.log();
  }

  /**
   * 檢查文件結構
   */
  checkFileStructure() {
    console.log('📂 檢查文件結構...\n');

    const required = [
      'auth-system.js',
      'dashboard.js',
      'package.json',
      'Dockerfile',
      'docker-compose.yml',
      '.env.example'
    ];

    const dirs = [
      'public',
      'data',
      'logs',
      'credentials'
    ];

    let allExist = true;

    console.log('必需文件:');
    required.forEach(file => {
      const exists = fs.existsSync(path.join(__dirname, file));
      const status = exists ? '✅' : '❌';
      console.log(`  ${status} ${file}`);
      if (!exists) allExist = false;
    });

    console.log('\n必需目錄:');
    dirs.forEach(dir => {
      const exists = fs.existsSync(path.join(__dirname, '..', dir));
      const status = exists ? '✅' : '❌';
      console.log(`  ${status} ${dir}`);
      if (!exists) allExist = false;
    });

    this.checks.push({
      name: '文件結構',
      passed: allExist,
      details: allExist ? '所有必需文件和目錄都存在' : '某些文件或目錄缺失'
    });

    console.log();
  }

  /**
   * 檢查依賴
   */
  checkDependencies() {
    console.log('📦 檢查依賴...\n');

    try {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8')
      );

      const deps = packageJson.dependencies || {};
      const critical = ['express', 'axios', 'dotenv'];

      let allPresent = true;

      critical.forEach(dep => {
        if (deps[dep]) {
          console.log(`  ✅ ${dep}@${deps[dep]}`);
        } else {
          console.log(`  ❌ ${dep} - 缺失`);
          allPresent = false;
        }
      });

      this.checks.push({
        name: '依賴',
        passed: allPresent,
        details: `${Object.keys(deps).length} 個依賴已配置`
      });
    } catch (error) {
      console.log('  ❌ 無法讀取 package.json');
      this.checks.push({
        name: '依賴',
        passed: false,
        details: error.message
      });
    }

    console.log();
  }

  /**
   * 檢查安全配置
   */
  checkSecurityConfiguration() {
    console.log('🔐 檢查安全配置...\n');

    const checks = [
      {
        name: 'SECRET_KEY 已配置',
        check: !!process.env.SECRET_KEY && process.env.SECRET_KEY.length > 16
      },
      {
        name: 'NODE_ENV 設為 production',
        check: process.env.NODE_ENV === 'production'
      },
      {
        name: 'TLS/SSL 配置',
        check: fs.existsSync(path.join(__dirname, '..', 'ssl'))
      },
      {
        name: '認證系統已配置',
        check: !!process.env.LINE_ACCESS_TOKEN
      }
    ];

    let passed = 0;
    checks.forEach(check => {
      const status = check.check ? '✅' : '⚠️';
      console.log(`  ${status} ${check.name}`);
      if (check.check) passed++;
    });

    this.checks.push({
      name: '安全配置',
      passed: passed === checks.length,
      details: `${passed}/${checks.length} 安全檢查通過`
    });

    console.log();
  }

  /**
   * 檢查日誌配置
   */
  checkLoggingConfiguration() {
    console.log('📝 檢查日誌配置...\n');

    const logDir = process.env.LOG_DIR || './logs';
    const logExists = fs.existsSync(logDir);

    console.log(`  ${logExists ? '✅' : '⚠️'} 日誌目錄: ${logDir}`);
    console.log(`  ${process.env.LOG_LEVEL ? '✅' : '⚠️'} 日誌級別: ${process.env.LOG_LEVEL || '未配置'}`);

    this.checks.push({
      name: '日誌配置',
      passed: logExists,
      details: logExists ? '日誌系統已配置' : '日誌目錄不存在'
    });

    console.log();
  }

  /**
   * 生成部署報告
   */
  generateReport() {
    console.log('╔════════════════════════════════════════╗');
    console.log('║ 📊 生產部署檢查報告');
    console.log('╚════════════════════════════════════════╝\n');

    const passed = this.checks.filter(c => c.passed).length;
    const total = this.checks.length;

    console.log(`✅ 通過: ${passed}/${total}\n`);

    this.checks.forEach(check => {
      const status = check.passed ? '✅' : '⚠️';
      console.log(`${status} ${check.name}`);
      console.log(`   ${check.details}`);
    });

    console.log();

    if (passed === total) {
      console.log('🎉 所有檢查通過！系統已準備好進行生產部署。\n');
      return true;
    } else {
      console.log('⚠️ 某些檢查未通過，請在部署前修正。\n');
      return false;
    }
  }

  /**
   * 運行所有檢查
   */
  runAll() {
    console.log('\n🚀 開始生產部署檢查...\n');

    this.checkEnvironmentVariables();
    this.checkFileStructure();
    this.checkDependencies();
    this.checkSecurityConfiguration();
    this.checkLoggingConfiguration();

    const ready = this.generateReport();

    if (ready) {
      console.log('📋 下一步:');
      console.log('   1. 構建 Docker 映像: docker-compose build');
      console.log('   2. 啟動服務: docker-compose up -d');
      console.log('   3. 驗證服務: docker-compose ps');
      console.log('   4. 查看日誌: docker-compose logs -f\n');
    }

    return ready;
  }
}

// 執行檢查
if (require.main === module) {
  const checker = new ProductionDeploymentChecker();
  const ready = checker.runAll();
  process.exit(ready ? 0 : 1);
}

module.exports = ProductionDeploymentChecker;
