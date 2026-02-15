/**
 * Google Docs API 集成
 */

const { google } = require('googleapis');

class DocsManager {
  constructor(authClient) {
    this.docs = google.docs({ version: 'v1', auth: authClient });
  }

  /**
   * 創建新文檔
   */
  async createDocument(title) {
    const response = await this.docs.documents.create({
      resource: {
        title: title
      }
    });
    return response.data.documentId;
  }

  /**
   * 更新文檔
   */
  async updateDocument(documentId, requests) {
    const response = await this.docs.documents.batchUpdate({
      documentId: documentId,
      resource: { requests: requests }
    });
    return response.data;
  }

  /**
   * 讀取文檔
   */
  async getDocument(documentId) {
    const response = await this.docs.documents.get({
      documentId: documentId
    });
    return response.data;
  }
}

module.exports = DocsManager;
