/**
 * RemoteAI Guardian 儀表板 - 前端邏輯
 */

class Dashboard {
  constructor() {
    // 使用儀表板伺服器作為 API 代理
    this.apiBase = window.location.origin;
    this.autoRefresh = true;
    this.refreshInterval = 5000;
    this.currentPairingCode = null;
    this.pairingExpires = null;
    this.currentPairingId = null;
    
    this.initElements();
    this.attachEventListeners();
    this.startAutoRefresh();
    this.updateClock();
  }

  initElements() {
    this.elements = {
      statusBadge: document.getElementById('status-badge'),
      systemStatus: document.getElementById('system-status'),
      pairedDevices: document.getElementById('paired-devices'),
      activeTokens: document.getElementById('active-tokens'),
      startTime: document.getElementById('start-time'),
      generatePairBtn: document.getElementById('generate-pair-btn'),
      refreshDevicesBtn: document.getElementById('refresh-devices-btn'),
      confirmPairBtn: document.getElementById('confirm-pair-btn'),
      pairingCodeSection: document.getElementById('pairing-code-section'),
      pairingCode: document.getElementById('pairing-code'),
      pairingId: document.getElementById('pairing-id'),
      pairingExpires: document.getElementById('pairing-expires'),
      pairingUrl: document.getElementById('pairing-url'),
      deviceUuid: document.getElementById('device-uuid'),
      devicesList: document.getElementById('devices-list'),
      tokensList: document.getElementById('tokens-list'),
      pairingResult: document.getElementById('pairing-result'),
      deviceToken: document.getElementById('device-token'),
      refreshToken: document.getElementById('refresh-token'),
      clearLogsBtn: document.getElementById('clear-logs-btn'),
      autoRefreshBtn: document.getElementById('auto-refresh-btn'),
      logsContainer: document.getElementById('logs-container'),
      timeDisplay: document.getElementById('time-display')
    };
  }

  attachEventListeners() {
    this.elements.generatePairBtn.addEventListener('click', () => this.generatePairingCode());
    this.elements.confirmPairBtn.addEventListener('click', () => this.confirmPairing());
    this.elements.refreshDevicesBtn.addEventListener('click', () => this.refreshStatus());
    this.elements.clearLogsBtn.addEventListener('click', () => this.clearLogs());
    this.elements.autoRefreshBtn.addEventListener('click', () => this.toggleAutoRefresh());
  }

  /**
   * 獲取系統狀態
   */
  async getStatus() {
    try {
      const response = await fetch(`${this.apiBase}/api/status`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      
      this.updateStatusDisplay(data);
      this.updateConnectionStatus(true);
    } catch (error) {
      console.error('Failed to fetch status:', error);
      this.updateConnectionStatus(false);
      this.addLog('ERROR', `無法獲取狀態: ${error.message}`);
    }
  }

  /**
   * 生成配對碼
   */
  async generatePairingCode() {
    try {
      this.elements.generatePairBtn.disabled = true;
      this.elements.generatePairBtn.textContent = '生成中...';
      
      const response = await fetch(`${this.apiBase}/api/pair/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceName: 'iPhone' })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        this.currentPairingCode = data.pairingCode;
        this.currentPairingId = data.pairingId;
        this.pairingExpires = Date.now() + (data.expiresIn * 1000);
        
        this.elements.pairingId.value = data.pairingId;
        this.elements.pairingCode.textContent = data.pairingCode;
        this.elements.pairingUrl.textContent = `https://desktop-vil1hl8.tail1bf179.ts.net/api/pair/request`;
        this.elements.pairingCodeSection.classList.remove('hidden');
        this.elements.pairingResult.classList.add('hidden');
        
        // 清除 UUID
        this.elements.deviceUuid.value = '';
        
        this.startPairingCountdown();
        this.addLog('PAIR_REQUEST', `✅ 生成配對碼: ${data.pairingCode}`);
      } else {
        throw new Error(data.error || '生成失敗');
      }
    } catch (error) {
      console.error('Failed to generate pairing code:', error);
      this.addLog('ERROR', `❌ 生成配對碼失敗: ${error.message}`);
      alert(`生成配對碼失敗:\n${error.message}`);
    } finally {
      this.elements.generatePairBtn.disabled = false;
      this.elements.generatePairBtn.textContent = '🔗 生成配對碼';
    }
  }

  /**
   * 確認配對
   */
  async confirmPairing() {
    const pairingCode = this.elements.pairingCode.textContent;
    const pairingId = this.elements.pairingId.value;
    const deviceUuid = this.elements.deviceUuid.value || `iphone-${Date.now()}`;
    
    if (!pairingCode || pairingCode === '------') {
      alert('請先生成配對碼');
      return;
    }
    
    try {
      this.elements.confirmPairBtn.disabled = true;
      this.elements.confirmPairBtn.textContent = '確認中...';
      
      const response = await fetch(`${this.apiBase}/api/pair/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pairingId: pairingId,
          pairingCode: pairingCode,
          deviceUUID: deviceUuid
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // 隱藏配對碼輸入
        this.elements.pairingCodeSection.classList.add('hidden');
        
        // 顯示成功結果
        this.elements.deviceToken.textContent = data.deviceToken;
        this.elements.refreshToken.textContent = data.refreshToken;
        this.elements.pairingResult.classList.remove('hidden');
        
        this.addLog('PAIR_CONFIRMED', `✅ 配對成功: ${deviceUuid}`);
        
        // 刷新狀態
        setTimeout(() => this.refreshStatus(), 1000);
      } else {
        throw new Error(data.error || '配對失敗');
      }
    } catch (error) {
      console.error('Failed to confirm pairing:', error);
      this.addLog('ERROR', `❌ 確認配對失敗: ${error.message}`);
      alert(`確認配對失敗:\n${error.message}`);
    } finally {
      this.elements.confirmPairBtn.disabled = false;
      this.elements.confirmPairBtn.textContent = '✅ 確認配對';
    }
  }

  /**
   * 配對倒計時
   */
  startPairingCountdown() {
    const countdown = setInterval(() => {
      const remaining = Math.max(0, this.pairingExpires - Date.now());
      const seconds = Math.floor(remaining / 1000);
      
      if (seconds === 0) {
        clearInterval(countdown);
        this.elements.pairingCodeSection.classList.add('hidden');
        this.addLog('PAIR_EXPIRED', '⏰ 配對碼已過期');
      } else {
        this.elements.pairingExpires.textContent = `${seconds} 秒有效`;
      }
    }, 1000);
  }

  /**
   * 刷新設備列表和狀態
   */
  async refreshStatus() {
    this.elements.refreshDevicesBtn.disabled = true;
    this.elements.refreshDevicesBtn.textContent = '刷新中...';
    
    try {
      await this.getStatus();
      await this.getDevices();
      this.addLog('REFRESH', '🔄 已刷新狀態');
    } finally {
      this.elements.refreshDevicesBtn.disabled = false;
      this.elements.refreshDevicesBtn.textContent = '🔄 刷新設備';
    }
  }

  /**
   * 獲取設備列表
   */
  async getDevices() {
    try {
      const response = await fetch(`${this.apiBase}/api/devices`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      
      this.updateDevicesList(data.devices);
    } catch (error) {
      console.error('Failed to fetch devices:', error);
      this.addLog('ERROR', `無法獲取設備列表: ${error.message}`);
    }
  }

  /**
   * 更新狀態顯示
   */
  updateStatusDisplay(data) {
    this.elements.systemStatus.textContent = data.status === 'running' ? '✅ 正常運行' : '❌ 離線';
    this.elements.pairedDevices.textContent = data.pairedDevices;
    this.elements.activeTokens.textContent = data.activeTokens;
    this.elements.startTime.textContent = new Date(data.startedAt).toLocaleString('zh-TW');
  }

  /**
   * 更新設備列表
   */
  updateDevicesList(devices) {
    if (devices.length === 0) {
      this.elements.devicesList.innerHTML = '<p class="empty-state">暫無配對設備</p>';
      return;
    }

    this.elements.devicesList.innerHTML = devices.map(device => `
      <div class="device-item">
        <div class="device-info">
          <div class="device-name">
            <span class="status-indicator ${device.status === 'CONFIRMED' ? 'confirmed' : 'pending'}"></span>
            ${device.deviceName}
          </div>
          <div class="device-status">
            狀態: ${device.status === 'CONFIRMED' ? '已確認' : '待確認'} 
            ${device.hasActiveToken ? '| 令牌有效' : ''}
          </div>
        </div>
      </div>
    `).join('');
  }

  /**
   * 獲取日誌
   */
  async getLogs() {
    try {
      const response = await fetch(`${this.apiBase}/api/logs?limit=50`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const logs = await response.json();
      
      this.updateLogsDisplay(logs);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  }

  /**
   * 更新日誌顯示
   */
  updateLogsDisplay(logs) {
    if (logs.length === 0) {
      this.elements.logsContainer.innerHTML = '<p class="empty-state">暫無日誌</p>';
      return;
    }

    this.elements.logsContainer.innerHTML = logs.map(log => `
      <div class="log-entry">
        <span class="log-time">[${new Date(log.timestamp).toLocaleTimeString('zh-TW')}]</span>
        <span class="log-event">${log.eventType}</span>
        <span class="log-message">${log.message}</span>
      </div>
    `).join('');

    this.elements.logsContainer.scrollTop = this.elements.logsContainer.scrollHeight;
  }

  /**
   * 添加日誌
   */
  addLog(eventType, message) {
    const time = new Date().toLocaleTimeString('zh-TW');
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    logEntry.innerHTML = `
      <span class="log-time">[${time}]</span>
      <span class="log-event">${eventType}</span>
      <span class="log-message">${message}</span>
    `;
    this.elements.logsContainer.appendChild(logEntry);
    this.elements.logsContainer.scrollTop = this.elements.logsContainer.scrollHeight;
  }

  /**
   * 清除日誌
   */
  clearLogs() {
    this.elements.logsContainer.innerHTML = '<p class="empty-state">暫無日誌</p>';
    this.addLog('CLEAR', '📋 日誌已清除');
  }

  /**
   * 更新連接狀態
   */
  updateConnectionStatus(connected) {
    if (connected) {
      this.elements.statusBadge.textContent = '● 已連接';
      this.elements.statusBadge.classList.add('online');
    } else {
      this.elements.statusBadge.textContent = '● 連接失敗';
      this.elements.statusBadge.classList.remove('online');
    }
  }

  /**
   * 自動刷新
   */
  startAutoRefresh() {
    this.refreshInterval = setInterval(() => {
      if (this.autoRefresh) {
        this.getStatus();
        this.getLogs();
      }
    }, 5000);
  }

  /**
   * 切換自動刷新
   */
  toggleAutoRefresh() {
    this.autoRefresh = !this.autoRefresh;
    
    if (this.autoRefresh) {
      this.elements.autoRefreshBtn.classList.add('active');
      this.elements.autoRefreshBtn.textContent = '🔄 自動刷新';
    } else {
      this.elements.autoRefreshBtn.classList.remove('active');
      this.elements.autoRefreshBtn.textContent = '⏸ 暫停刷新';
    }
  }

  /**
   * 更新時鐘
   */
  updateClock() {
    setInterval(() => {
      const now = new Date();
      this.elements.timeDisplay.textContent = now.toLocaleTimeString('zh-TW');
    }, 1000);
  }
}

/**
 * 複製到剪貼板
 */
function copyToClipboard(elementId) {
  const element = document.getElementById(elementId);
  const text = element.textContent;
  
  navigator.clipboard.writeText(text).then(() => {
    alert('已複製到剪貼板');
  }).catch(err => {
    console.error('複製失敗:', err);
  });
}

// 初始化儀表板
document.addEventListener('DOMContentLoaded', () => {
  const dashboard = new Dashboard();
  
  console.log('🚀 儀表板已初始化');
  console.log(`📍 API 基址: ${dashboard.apiBase}`);
  
  // 初始加載
  dashboard.getStatus();
  dashboard.getDevices();
  dashboard.getLogs();
});
