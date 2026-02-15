/**
 * 安全加固模塊
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');

class SecurityHardener {
  constructor(secretKey) {
    this.secretKey = secretKey || process.env.SECRET_KEY;
    this.encryptionKey = crypto.scryptSync(this.secretKey, 'salt', 32);
  }

  /**
   * 加密敏感數據
   */
  encryptData(data) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * 解密敏感數據
   */
  decryptData(encryptedData) {
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.encryptionKey, iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  }

  /**
   * 生成 JWT 令牌
   */
  generateToken(payload, expiresIn = '24h') {
    return jwt.sign(payload, this.secretKey, { expiresIn });
  }

  /**
   * 驗證 JWT 令牌
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, this.secretKey);
    } catch (error) {
      return null;
    }
  }

  /**
   * 密碼雜湊
   */
  hashPassword(password) {
    return crypto.pbkdf2Sync(password, 'salt', 100000, 64, 'sha512').toString('hex');
  }

  /**
   * 驗證密碼
   */
  verifyPassword(password, hash) {
    const verify = crypto.pbkdf2Sync(password, 'salt', 100000, 64, 'sha512').toString('hex');
    return verify === hash;
  }

  /**
   * 生成安全隨機令牌
   */
  generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * 速率限制檢查
   */
  checkRateLimit(ip, limit = 100, window = 3600) {
    const key = `rate:${ip}`;
    // 實現應使用 Redis
    return true;
  }
}

module.exports = SecurityHardener;
