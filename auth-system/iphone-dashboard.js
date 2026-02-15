/**
 * RemoteAI Guardian - iPhone Web Dashboard
 * 響應式網頁介面，支援 iPhone Safari 和 Tailscale 訪問
 */

const express = require('express');
const axios = require('axios');
require('dotenv').config();

class iPhoneDashboard {
  constructor() {
    this.app = express();
    this.app.use(express.static('public'));
    this.app.use(express.json());
    
    this.setupRoutes();
  }

  setupRoutes() {
    /**
     * 主頁 - 儀表板
     */
    this.app.get('/', (req, res) => {
      res.send(this.getMainDashboardHTML());
    });

    /**
     * API: 獲取系統狀態
     */
    this.app.get('/api/dashboard/status', async (req, res) => {
      try {
        const authResponse = await axios.get('http://localhost:8888/api/status', { timeout: 5000 });
        
        res.json({
          success: true,
          status: 'running',
          pairedDevices: authResponse.data.pairedDevices,
          activeTokens: authResponse.data.activeTokens,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    /**
     * API: 獲取設備列表
     */
    this.app.get('/api/dashboard/devices', async (req, res) => {
      try {
        const response = await axios.get('http://localhost:8888/api/devices', { timeout: 5000 });
        
        res.json({
          success: true,
          devices: response.data.devices
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    /**
     * API: 執行命令
     */
    this.app.post('/api/dashboard/execute', (req, res) => {
      const { command } = req.body;

      if (!command) {
        return res.status(400).json({
          success: false,
          error: '缺少命令參數'
        });
      }

      try {
        const { execSync } = require('child_process');
        const output = execSync(command, {
          encoding: 'utf-8',
          maxBuffer: 10 * 1024 * 1024,
          timeout: 30000
        }).toString();

        res.json({
          success: true,
          command: command,
          output: output,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          command: command,
          error: error.message
        });
      }
    });

    /**
     * 健康檢查
     */
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok' });
    });
  }

  /**
   * 主儀表板 HTML（響應式設計）
   */
  getMainDashboardHTML() {
    return `
<!DOCTYPE html>
<html lang="zh-Hant">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>RemoteAI Guardian - iPhone 儀表板</title>
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="RemoteAI Guardian">
    <meta name="theme-color" content="#1e1e2e">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
            background: linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%);
            color: #ffffff;
            min-height: 100vh;
            padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
            padding-top: max(20px, env(safe-area-inset-top));
            padding-bottom: max(20px, env(safe-area-inset-bottom));
        }

        .container {
            max-width: 100%;
            margin: 0 auto;
            padding: 16px;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-top: 10px;
        }

        .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
            background: linear-gradient(135deg, #00d4ff, #0099ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .header p {
            color: #888;
            font-size: 14px;
        }

        .status-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 24px;
        }

        .status-card {
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 12px;
            padding: 16px;
            text-align: center;
            backdrop-filter: blur(10px);
        }

        .status-card .value {
            font-size: 24px;
            font-weight: 700;
            color: #00d4ff;
            margin-bottom: 4px;
        }

        .status-card .label {
            font-size: 12px;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .status-card.warning .value {
            color: #ffaa00;
        }

        .status-indicator {
            display: inline-block;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #00ff00;
            margin-right: 6px;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        .section {
            margin-bottom: 24px;
        }

        .section-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 12px;
            color: #00d4ff;
            display: flex;
            align-items: center;
        }

        .section-title::before {
            content: '';
            display: inline-block;
            width: 4px;
            height: 4px;
            background: #00d4ff;
            border-radius: 50%;
            margin-right: 8px;
        }

        .devices-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .device-item {
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(0, 212, 255, 0.2);
            border-radius: 10px;
            padding: 14px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            backdrop-filter: blur(10px);
        }

        .device-info {
            flex: 1;
        }

        .device-name {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 4px;
        }

        .device-status {
            font-size: 12px;
            color: #888;
        }

        .device-status.active {
            color: #00ff00;
        }

        .device-badge {
            background: rgba(0, 212, 255, 0.2);
            color: #00d4ff;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
        }

        .command-section {
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 12px;
            padding: 16px;
            backdrop-filter: blur(10px);
        }

        .command-input-group {
            display: flex;
            gap: 8px;
            margin-bottom: 12px;
        }

        .command-input {
            flex: 1;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 8px;
            padding: 10px 12px;
            color: #ffffff;
            font-size: 14px;
        }

        .command-input::placeholder {
            color: #666;
        }

        .command-input:focus {
            outline: none;
            border-color: #00d4ff;
            background: rgba(0, 212, 255, 0.1);
        }

        .btn {
            padding: 10px 16px;
            border-radius: 8px;
            border: none;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .btn-primary {
            background: linear-gradient(135deg, #00d4ff, #0099ff);
            color: #1e1e2e;
        }

        .btn-primary:active {
            transform: scale(0.98);
            opacity: 0.9;
        }

        .btn-secondary {
            background: rgba(255, 255, 255, 0.1);
            color: #ffffff;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .btn-secondary:active {
            background: rgba(255, 255, 255, 0.15);
        }

        .quick-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-top: 12px;
        }

        .quick-btn {
            padding: 12px;
            border-radius: 8px;
            border: 1px solid rgba(0, 212, 255, 0.2);
            background: rgba(0, 212, 255, 0.08);
            color: #00d4ff;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .quick-btn:active {
            background: rgba(0, 212, 255, 0.15);
        }

        .output-box {
            background: #0a0a0e;
            border: 1px solid rgba(0, 212, 255, 0.2);
            border-radius: 8px;
            padding: 12px;
            font-family: 'Menlo', 'Monaco', monospace;
            font-size: 12px;
            color: #00d4ff;
            max-height: 300px;
            overflow-y: auto;
            margin-top: 12px;
            display: none;
        }

        .output-box.visible {
            display: block;
        }

        .loading {
            display: inline-block;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            color: #666;
            font-size: 12px;
        }

        .info-box {
            background: rgba(0, 212, 255, 0.08);
            border: 1px solid rgba(0, 212, 255, 0.2);
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 16px;
            font-size: 12px;
            color: #00d4ff;
        }

        .info-box strong {
            color: #ffffff;
        }

        /* iPhone 特定樣式 */
        @media (max-width: 600px) {
            .container {
                padding: 12px;
            }

            .header h1 {
                font-size: 24px;
            }

            .status-grid {
                grid-template-columns: 1fr;
            }

            .quick-actions {
                grid-template-columns: 1fr;
            }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
            body {
                background: linear-gradient(135deg, #0a0a0e 0%, #1e1e2e 100%);
            }
        }

        /* Smooth scrolling for iPhone */
        html {
            -webkit-user-select: none;
            user-select: none;
        }

        input, button {
            -webkit-user-select: text;
            user-select: text;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 RemoteAI Guardian</h1>
            <p>iPhone 控制面板</p>
        </div>

        <div class="info-box">
            💡 <strong>提示:</strong> 用 LINE 傳送命令獲得最佳體驗<br>
            例: "help" 或 "status"
        </div>

        <!-- 狀態卡片 -->
        <div class="status-grid">
            <div class="status-card">
                <div class="status-indicator"></div>
                <div class="value" id="status-value">●</div>
                <div class="label">系統狀態</div>
            </div>
            <div class="status-card">
                <div class="value" id="devices-value">0</div>
                <div class="label">已配對設備</div>
            </div>
        </div>

        <!-- 設備列表 -->
        <div class="section">
            <div class="section-title">已配對設備</div>
            <div class="devices-list" id="devices-list">
                <div class="device-item" style="text-align: center; color: #888;">
                    載入中...
                </div>
            </div>
        </div>

        <!-- 命令執行 -->
        <div class="section">
            <div class="section-title">執行命令</div>
            <div class="command-section">
                <div class="command-input-group">
                    <input 
                        type="text" 
                        class="command-input" 
                        id="command-input" 
                        placeholder="輸入命令 (例: docker ps)"
                    >
                    <button class="btn btn-primary" onclick="executeCommand()">執行</button>
                </div>

                <div class="quick-actions">
                    <button class="quick-btn" onclick="runQuickCommand('docker ps')">Docker PS</button>
                    <button class="quick-btn" onclick="runQuickCommand('docker stats --no-stream')">系統統計</button>
                    <button class="quick-btn" onclick="runQuickCommand('dir')">列表文件</button>
                    <button class="quick-btn" onclick="runQuickCommand('tasklist')">任務列表</button>
                </div>

                <div class="output-box" id="output-box"></div>
            </div>
        </div>

        <div class="footer">
            <p>RemoteAI Guardian v1.0.0</p>
            <p>使用 Tailscale 通過 <strong>${process.env.TAILSCALE_IP || 'your-ip'}</strong> 訪問</p>
            <p style="margin-top: 8px; color: #555;">在 LINE 上傳送 <strong>"help"</strong> 查看更多命令</p>
        </div>
    </div>

    <script>
        // 自動刷新狀態
        function refreshStatus() {
            fetch('/api/dashboard/status')
                .then(r => r.json())
                .then(data => {
                    document.getElementById('status-value').textContent = '✅ 在線';
                    document.getElementById('status-value').style.color = '#00ff00';
                    document.getElementById('devices-value').textContent = data.pairedDevices || 0;
                })
                .catch(() => {
                    document.getElementById('status-value').textContent = '❌ 離線';
                    document.getElementById('status-value').style.color = '#ff4444';
                });

            fetch('/api/dashboard/devices')
                .then(r => r.json())
                .then(data => {
                    const list = document.getElementById('devices-list');
                    if (!data.devices || data.devices.length === 0) {
                        list.innerHTML = '<div class="device-item" style="text-align: center; color: #888;">暫無已配對設備</div>';
                        return;
                    }

                    list.innerHTML = data.devices.map(dev => \`
                        <div class="device-item">
                            <div class="device-info">
                                <div class="device-name">📱 \${dev.deviceName}</div>
                                <div class="device-status \${dev.hasActiveToken ? 'active' : ''}>
                                    \${dev.status === 'CONFIRMED' ? '✅ 已連接' : '⏳ 待確認'}
                                </div>
                            </div>
                            <div class="device-badge">\${dev.status}</div>
                        </div>
                    \`).join('');
                })
                .catch(console.error);
        }

        function executeCommand() {
            const command = document.getElementById('command-input').value.trim();
            if (!command) {
                alert('請輸入命令');
                return;
            }

            const btn = event.target;
            const originalText = btn.textContent;
            btn.innerHTML = '<span class="loading">⚙️</span> 執行中...';
            btn.disabled = true;

            fetch('/api/dashboard/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command })
            })
            .then(r => r.json())
            .then(data => {
                const output = document.getElementById('output-box');
                if (data.success) {
                    output.textContent = data.output || '(無輸出)';
                } else {
                    output.textContent = '錯誤: ' + data.error;
                }
                output.classList.add('visible');
            })
            .catch(e => {
                document.getElementById('output-box').textContent = '執行失敗: ' + e.message;
                document.getElementById('output-box').classList.add('visible');
            })
            .finally(() => {
                btn.textContent = originalText;
                btn.disabled = false;
            });
        }

        function runQuickCommand(command) {
            document.getElementById('command-input').value = command;
            executeCommand.call({ target: event.target });
        }

        // 初始化和定期刷新
        refreshStatus();
        setInterval(refreshStatus, 5000);

        // Enter 鍵執行命令
        document.getElementById('command-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') executeCommand();
        });
    </script>
</body>
</html>
    `;
  }

  start(port = 9999) {
    this.app.listen(port, '0.0.0.0', () => {
      console.log(`\n🌐 iPhone Web 儀表板已啟動，端口: ${port}`);
      console.log(`📱 訪問 URL: http://localhost:${port}`);
      console.log(`🔗 Tailscale 訪問: http://${process.env.TAILSCALE_IP}:${port}`);
      console.log('✅ 可在 iPhone Safari 中使用\n');
    });
  }
}

module.exports = iPhoneDashboard;

if (require.main === module) {
  const dashboard = new iPhoneDashboard();
  const port = process.env.DASHBOARD_PORT || 9999;
  dashboard.start(port);
}
