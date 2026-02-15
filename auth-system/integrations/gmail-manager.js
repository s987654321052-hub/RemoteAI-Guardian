/**
 * Gmail API 集成
 */

const { google } = require('googleapis');

class GmailManager {
  constructor(authClient) {
    this.gmail = google.gmail({ version: 'v1', auth: authClient });
  }

  /**
   * 列出郵件
   */
  async listMessages(query = '', maxResults = 10) {
    const response = await this.gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: maxResults
    });
    return response.data.messages || [];
  }

  /**
   * 取得郵件詳情
   */
  async getMessage(messageId) {
    const response = await this.gmail.users.messages.get({
      userId: 'me',
      id: messageId
    });
    return response.data;
  }

  /**
   * 發送郵件
   */
  async sendMessage(to, subject, body) {
    const message = Buffer.from(
      `To: ${to}\r\nSubject: ${subject}\r\n\r\n${body}`
    ).toString('base64');

    const response = await this.gmail.users.messages.send({
      userId: 'me',
      resource: {
        raw: message
      }
    });
    return response.data;
  }
}

module.exports = GmailManager;
