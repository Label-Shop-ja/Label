// Log analysis script
import { existsSync, readFileSync, readdirSync } from 'fs';
import { resolve } from 'path';

const analyzeLogs = () => {
  console.log('📊 ANALYZING LOGS\n');
  
  const logsPath = resolve('logs');
  
  if (!existsSync(logsPath)) {
    console.log('❌ Logs directory not found');
    return;
  }
  
  const logFiles = readdirSync(logsPath).filter(file => file.endsWith('.log'));
  
  if (logFiles.length === 0) {
    console.log('❌ No log files found');
    return;
  }
  
  console.log(`📁 Found ${logFiles.length} log files\n`);
  
  const analysis = {
    totalLines: 0,
    errorCount: 0,
    warningCount: 0,
    infoCount: 0,
    securityEvents: 0,
    apiRequests: 0,
    topErrors: {},
    topIPs: {},
    topEndpoints: {}
  };
  
  // Analyze each log file
  for (const file of logFiles) {
    console.log(`🔍 Analyzing ${file}...`);
    
    const filePath = resolve(logsPath, file);
    const content = readFileSync(filePath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    
    analysis.totalLines += lines.length;
    
    for (const line of lines) {
      try {
        // Try to parse as JSON log
        if (line.includes('{') && line.includes('}')) {
          const jsonStart = line.indexOf('{');
          const jsonPart = line.substring(jsonStart);
          const logEntry = JSON.parse(jsonPart);
          
          // Count by level
          if (logEntry.level === 'error') analysis.errorCount++;
          else if (logEntry.level === 'warn') analysis.warningCount++;
          else if (logEntry.level === 'info') analysis.infoCount++;
          
          // Security events
          if (logEntry.message?.includes('SECURITY') || file.includes('security')) {
            analysis.securityEvents++;
          }
          
          // API requests
          if (logEntry.message?.includes('API Request') || file.includes('api')) {
            analysis.apiRequests++;
            
            // Track top endpoints
            if (logEntry.url) {
              analysis.topEndpoints[logEntry.url] = (analysis.topEndpoints[logEntry.url] || 0) + 1;
            }
          }
          
          // Track top IPs
          if (logEntry.ip) {
            analysis.topIPs[logEntry.ip] = (analysis.topIPs[logEntry.ip] || 0) + 1;
          }
          
          // Track top errors
          if (logEntry.level === 'error' && logEntry.message) {
            const errorKey = logEntry.message.substring(0, 50);
            analysis.topErrors[errorKey] = (analysis.topErrors[errorKey] || 0) + 1;
          }
        }
      } catch (error) {
        // Skip non-JSON lines
      }
    }
  }
  
  // Display analysis results
  console.log('\n📈 ANALYSIS RESULTS');
  console.log('─'.repeat(50));
  console.log(`Total log lines: ${analysis.totalLines}`);
  console.log(`Errors: ${analysis.errorCount}`);
  console.log(`Warnings: ${analysis.warningCount}`);
  console.log(`Info: ${analysis.infoCount}`);
  console.log(`Security events: ${analysis.securityEvents}`);
  console.log(`API requests: ${analysis.apiRequests}`);
  
  // Top errors
  if (Object.keys(analysis.topErrors).length > 0) {
    console.log('\n🔥 TOP ERRORS:');
    const sortedErrors = Object.entries(analysis.topErrors)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    sortedErrors.forEach(([error, count]) => {
      console.log(`   ${count}x: ${error}...`);
    });
  }
  
  // Top IPs
  if (Object.keys(analysis.topIPs).length > 0) {
    console.log('\n🌐 TOP IPs:');
    const sortedIPs = Object.entries(analysis.topIPs)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    sortedIPs.forEach(([ip, count]) => {
      console.log(`   ${count}x: ${ip}`);
    });
  }
  
  // Top endpoints
  if (Object.keys(analysis.topEndpoints).length > 0) {
    console.log('\n🎯 TOP ENDPOINTS:');
    const sortedEndpoints = Object.entries(analysis.topEndpoints)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    sortedEndpoints.forEach(([endpoint, count]) => {
      console.log(`   ${count}x: ${endpoint}`);
    });
  }
  
  // Health assessment
  console.log('\n🏥 HEALTH ASSESSMENT:');
  const errorRate = (analysis.errorCount / analysis.totalLines * 100).toFixed(2);
  const securityRate = (analysis.securityEvents / analysis.totalLines * 100).toFixed(2);
  
  console.log(`Error rate: ${errorRate}%`);
  console.log(`Security events rate: ${securityRate}%`);
  
  if (parseFloat(errorRate) < 1) {
    console.log('✅ Error rate is healthy (< 1%)');
  } else if (parseFloat(errorRate) < 5) {
    console.log('⚠️  Error rate needs attention (< 5%)');
  } else {
    console.log('❌ Error rate is critical (> 5%)');
  }
  
  if (parseFloat(securityRate) < 0.1) {
    console.log('✅ Security events rate is normal (< 0.1%)');
  } else {
    console.log('⚠️  High security events detected');
  }
  
  console.log('\n✅ Log analysis completed!');
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  analyzeLogs();
}

export default analyzeLogs;