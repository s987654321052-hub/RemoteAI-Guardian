/**
 * 性能優化模塊
 */

const redis = require('redis');
const zlib = require('zlib');

class PerformanceOptimizer {
  constructor() {
    this.cacheClient = redis.createClient();
    this.cacheClient.connect();
  }

  /**
   * 快取管理
   */
  async cacheGet(key) {
    try {
      const data = await this.cacheClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get failed:', error);
      return null;
    }
  }

  async cacheSet(key, value, ttl = 3600) {
    try {
      await this.cacheClient.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set failed:', error);
    }
  }

  /**
   * 數據壓縮
   */
  compress(data) {
    return new Promise((resolve, reject) => {
      zlib.gzip(JSON.stringify(data), (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
  }

  decompress(buffer) {
    return new Promise((resolve, reject) => {
      zlib.gunzip(buffer, (error, result) => {
        if (error) reject(error);
        else resolve(JSON.parse(result.toString()));
      });
    });
  }

  /**
   * 批量操作優化
   */
  async batchInsert(collection, documents) {
    const chunkSize = 1000;
    const chunks = [];
    
    for (let i = 0; i < documents.length; i += chunkSize) {
      chunks.push(documents.slice(i, i + chunkSize));
    }

    for (const chunk of chunks) {
      await collection.insertMany(chunk);
    }
  }

  /**
   * 索引優化
   */
  async ensureIndices(collection) {
    await collection.createIndex({ userId: 1 });
    await collection.createIndex({ createdAt: -1 });
    await collection.createIndex({ status: 1, userId: 1 });
  }

  /**
   * 查詢優化
   */
  async optimizedQuery(collection, filter, projection) {
    return collection
      .find(filter)
      .project(projection)
      .limit(100)
      .toArray();
  }
}

module.exports = PerformanceOptimizer;
