/**
 * 使用 pem 生成自簽 SSL 證書
 */

const fs = require('fs');
const path = require('path');
const pem = require('pem');

const certDir = path.join(__dirname, 'certs');
const keyFile = path.join(certDir, 'key.pem');
const certFile = path.join(certDir, 'cert.pem');

// 建立 certs 目錄
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true });
  console.log(`✅ 建立目錄: ${certDir}`);
}

// 檢查是否已存在
if (fs.existsSync(keyFile) && fs.existsSync(certFile)) {
  console.log('✅ SSL 證書已存在');
  console.log(`📄 Key:  ${keyFile}`);
  console.log(`📄 Cert: ${certFile}`);
  process.exit(0);
}

console.log('🔑 生成自簽 SSL 證書...\n');

pem.createCertificate({
  days: 365,
  selfSigned: true,
  commonName: '100.127.44.67'
}, (err, keys) => {
  if (err) {
    console.error('❌ 生成證書失敗:', err.message);
    process.exit(1);
  }

  // 寫入文件
  fs.writeFileSync(keyFile, keys.key);
  fs.writeFileSync(certFile, keys.cert);

  console.log('✅ SSL 證書已生成');
  console.log(`📄 Key:  ${keyFile}`);
  console.log(`📄 Cert: ${certFile}`);
  console.log('\n⚠️  注意: 這是自簽證書');
  console.log('   - 瀏覽器會顯示不安全警告');
  console.log('   - 但 LINE API 可以正常使用');
  console.log('\n✅ 現在可以啟動 HTTPS Webhook');
  console.log('   停止舊的 webhook');
  console.log('   node line-webhook-https.js');
});
