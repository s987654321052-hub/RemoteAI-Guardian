/**
 * RemoteAI Guardian - 儀表板更新測試
 * 測試是否能成功更新項目監控儀表板
 */

const DashboardUpdater = require('./dashboard-updater');

async function testDashboardUpdate() {
  console.log('🧪 開始儀表板更新測試...\n');
  
  const updater = new DashboardUpdater();
  
  try {
    // 檢查儀表板是否可達
    console.log('📍 檢查儀表板連接...');
    const summary = await updater.getProjectSummary();
    console.log('✅ 儀表板已連接');
    console.log(`   當前進度: ${summary.progress}%`);
    console.log(`   已完成任務: ${summary.completedTasks}/${summary.totalTasks}\n`);
    
    // 測試更新任務進度
    console.log('📊 測試任務進度更新...');
    
    // 開始第一個認證任務
    console.log('  1. 開始任務: 蘋果裝置認證框架');
    await updater.startTask('task-auth-1');
    await new Promise(r => setTimeout(r, 500));
    
    console.log('  2. 更新進度到 25%');
    await updater.updateProgress('task-auth-1', 25);
    await new Promise(r => setTimeout(r, 500));
    
    console.log('  3. 更新進度到 50%');
    await updater.updateProgress('task-auth-1', 50);
    await new Promise(r => setTimeout(r, 500));
    
    console.log('  4. 更新進度到 75%');
    await updater.updateProgress('task-auth-1', 75);
    await new Promise(r => setTimeout(r, 500));
    
    console.log('  5. 完成任務');
    await updater.completeTask('task-auth-1');
    await new Promise(r => setTimeout(r, 500));
    
    console.log('\n✅ 所有測試已完成！');
    console.log('\n📈 最終項目狀態:');
    const finalSummary = await updater.getProjectSummary();
    console.log(`   當前進度: ${finalSummary.progress}%`);
    console.log(`   已完成任務: ${finalSummary.completedTasks}/${finalSummary.totalTasks}`);
    console.log(`   項目健康度: ${finalSummary.healthScore}/100`);
    
  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
    console.log('\n💡 確保儀表板正在運行：http://127.0.0.1:9999');
  }
}

// 執行測試
testDashboardUpdate();
