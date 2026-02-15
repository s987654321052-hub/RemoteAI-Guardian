/**
 * RemoteAI Guardian - 進度報告生成器
 */

const ProgressManager = require('./progress-manager');
const Phase2TaskRunner = require('./phase2-runner');

async function generateReport() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║ 📊 RemoteAI Guardian 進度報告');
  console.log('╚════════════════════════════════════════╝\n');

  const progressManager = new ProgressManager();
  const report = progressManager.getFullReport();

  // 顯示整體統計
  console.log('📈 整體進度');
  console.log(`   整體完成度: ${report.overallProgress}%`);
  console.log(`   已完成任務: ${report.tasks.completed}/${report.tasks.total}`);
  console.log(`   已完成階段: ${report.phases.completed}/${report.phases.total}\n`);

  // 顯示各階段進度
  console.log('🎯 各階段進度\n');
  report.phases.forEach(phase => {
    const status = phase.status === 'completed' ? '✅' : 
                   phase.status === 'in-progress' ? '🔄' : '⏳';
    console.log(`${status} ${phase.name}`);
    console.log(`   進度: ${phase.progress}%`);
    console.log(`   任務:`);
    
    phase.tasks.forEach(task => {
      const taskStatus = task.status === 'completed' ? '✅' :
                        task.status === 'in-progress' ? '🔄' : '⏳';
      console.log(`      ${taskStatus} ${task.name} (${task.progress}%)`);
    });
    console.log();
  });

  // 最後更新時間
  console.log(`⏰ 最後更新: ${new Date(report.lastUpdated).toLocaleString('zh-TW')}\n`);
}

async function runPhase2() {
  console.log('\n🚀 準備運行第二階段任務...\n');

  const progressManager = new ProgressManager();
  const runner = new Phase2TaskRunner(progressManager);

  try {
    await runner.runAll();
    console.log('\n✅ 第二階段任務完成！\n');
    
    // 生成報告
    await generateReport();
  } catch (error) {
    console.error('❌ 運行失敗:', error);
  }
}

// 執行
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'phase2') {
    runPhase2();
  } else {
    generateReport();
  }
}

module.exports = { generateReport, runPhase2 };
