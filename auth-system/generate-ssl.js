/**
 * 生成自簽 SSL 證書
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const certDir = path.join(__dirname, 'certs');

// 建立 certs 目錄
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true });
  console.log(`✅ 建立目錄: ${certDir}`);
}

const keyFile = path.join(certDir, 'key.pem');
const certFile = path.join(certDir, 'cert.pem');

// 檢查是否已存在
if (fs.existsSync(keyFile) && fs.existsSync(certFile)) {
  console.log('✅ SSL 證書已存在');
  console.log(`📄 Key:  ${keyFile}`);
  console.log(`📄 Cert: ${certFile}`);
  process.exit(0);
}

console.log('🔑 生成自簽 SSL 證書...\n');

try {
  // 使用 Node.js 原生 crypto 生成自簽證書
  const pem = require('pem');
  
  // 如果 pem 模塊不可用，使用 OpenSSL 命令
  const cmd = `openssl req -x509 -newkey rsa:2048 -keyout "${keyFile}" -out "${certFile}" -days 365 -nodes -subj "/CN=100.127.44.67"`;
  
  execSync(cmd, { stdio: 'inherit' });
  
  console.log('\n✅ SSL 證書已生成');
  console.log(`📄 Key:  ${keyFile}`);
  console.log(`📄 Cert: ${certFile}`);
  console.log('\n⚠️  注意: 這是自簽證書，瀏覽器會顯示不安全警告，但 LINE API 可以使用');
  
} catch (error) {
  console.log('❌ 使用 OpenSSL 失敗');
  console.log('\n📖 請手動生成證書，使用以下命令:');
  console.log(`openssl req -x509 -newkey rsa:2048 -keyout "${keyFile}" -out "${certFile}" -days 365 -nodes -subj "/CN=100.127.44.67"`);
}
