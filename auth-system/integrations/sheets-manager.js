/**
 * Google Sheets API 集成
 */

const { google } = require('googleapis');
const fs = require('fs');

class SheetsManager {
  constructor(authClient) {
    this.sheets = google.sheets({ version: 'v4', auth: authClient });
  }

  /**
   * 創建新試算表
   */
  async createSpreadsheet(title) {
    const spreadsheet = await this.sheets.spreadsheets.create({
      resource: {
        properties: { title: title }
      }
    });
    return spreadsheet.data.spreadsheetId;
  }

  /**
   * 寫入資料
   */
  async writeData(spreadsheetId, range, values) {
    await this.sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId,
      range: range,
      valueInputOption: 'RAW',
      resource: { values: values }
    });
  }

  /**
   * 讀取資料
   */
  async readData(spreadsheetId, range) {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: range
    });
    return response.data.values;
  }
}

module.exports = SheetsManager;
