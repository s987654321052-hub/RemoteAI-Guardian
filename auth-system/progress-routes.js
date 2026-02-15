/**
 * RemoteAI Guardian - 進度 API
 * 提供進度查詢和更新端點
 */

const express = require('express');
const ProgressManager = require('./progress-manager');

const router = express.Router();
const progressManager = new ProgressManager();

/**
 * 獲取完整進度報告
 * GET /progress
 */
router.get('/', (req, res) => {
  const report = progressManager.getFullReport();
  res.json(report);
});

/**
 * 獲取進度統計
 * GET /progress/stats
 */
router.get('/stats', (req, res) => {
  const stats = progressManager.getStats();
  res.json(stats);
});

/**
 * 獲取特定階段進度
 * GET /progress/phases/:phaseId
 */
router.get('/phases/:phaseId', (req, res) => {
  const { phaseId } = req.params;
  const phase = progressManager.progress.phases.find(p => p.id === phaseId);
  
  if (!phase) {
    return res.status(404).json({ error: 'Phase not found' });
  }

  res.json(phase);
});

/**
 * 更新任務進度
 * POST /progress/tasks/:taskId/update
 * Body: { phaseId, progress, status }
 */
router.post('/tasks/:taskId/update', (req, res) => {
  const { taskId } = req.params;
  const { phaseId, progress, status } = req.body;

  if (!phaseId) {
    return res.status(400).json({ error: 'Missing phaseId' });
  }

  const updated = progressManager.updateTaskProgress(phaseId, taskId, progress, status);

  if (!updated) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.json({
    success: true,
    message: 'Task updated',
    stats: progressManager.getStats()
  });
});

/**
 * 完成任務
 * POST /progress/tasks/:taskId/complete
 * Body: { phaseId, taskName }
 */
router.post('/tasks/:taskId/complete', async (req, res) => {
  const { taskId } = req.params;
  const { phaseId, taskName } = req.body;

  if (!phaseId) {
    return res.status(400).json({ error: 'Missing phaseId' });
  }

  try {
    const stats = await progressManager.completeTask(phaseId, taskId, taskName || taskId);
    
    res.json({
      success: true,
      message: 'Task completed',
      stats: stats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 重置進度（僅用於測試）
 * POST /progress/reset
 */
router.post('/reset', (req, res) => {
  progressManager.progress = progressManager.initializeProgress();
  progressManager.saveProgress();

  res.json({
    success: true,
    message: 'Progress reset',
    progress: progressManager.progress
  });
});

module.exports = router;
