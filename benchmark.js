#!/usr/bin/env node

/**
 * Automated Benchmark Script for All Three Backends
 * 
 * Usage: node benchmark.js
 * 
 * This script will:
 * 1. Test all three backends
 * 2. Run multiple scenarios
 * 3. Generate a comparison report
 */

import autocannon from 'autocannon';
import { writeFileSync } from 'fs';

const backends = [
  { name: 'Express', port: 5001, color: '\x1b[36m' },
  { name: 'NestJS', port: 5003, color: '\x1b[35m' },
  { name: 'Fastify', port: 5002, color: '\x1b[33m' },
];

const scenarios = [
  {
    name: 'Light Load',
    connections: 50,
    duration: 10,
    description: '50 concurrent users for 10 seconds',
  },
  {
    name: 'Medium Load',
    connections: 200,
    duration: 30,
    description: '200 concurrent users for 30 seconds',
  },
  {
    name: 'High Load',
    connections: 500,
    duration: 30,
    description: '500 concurrent users for 30 seconds',
  },
];

const endpoints = [
  { path: '/health', name: 'Health Check' },
  { path: '/api/v1/events/approved', name: 'Get Events' },
];

const reset = '\x1b[0m';
const bold = '\x1b[1m';

function formatNumber(num) {
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

function printHeader(text) {
  console.log(`\n${bold}${'='.repeat(60)}${reset}`);
  console.log(`${bold}${text}${reset}`);
  console.log(`${bold}${'='.repeat(60)}${reset}\n`);
}

function printSubHeader(text, color = '') {
  console.log(`\n${color}${bold}${text}${reset}`);
  console.log(`${color}${'-'.repeat(50)}${reset}`);
}

async function testBackend(backend, endpoint, scenario) {
  const url = `http://localhost:${backend.port}${endpoint.path}`;
  
  console.log(`Testing: ${url}`);
  console.log(`Scenario: ${scenario.description}`);
  
  try {
    const result = await autocannon({
      url,
      connections: scenario.connections,
      duration: scenario.duration,
    });
    
    return {
      success: true,
      requestsPerSec: result.requests.average,
      latencyAvg: result.latency.mean,
      latencyP95: result.latency.p95,
      latencyP99: result.latency.p99,
      throughput: result.throughput.average,
      errors: result.errors,
      timeouts: result.timeouts,
      totalRequests: result.requests.total,
    };
  } catch (error) {
    console.error(`❌ Error testing ${backend.name}: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
}

async function runBenchmarks() {
  printHeader('🚀 Backend Performance Benchmark');
  console.log('Testing all three backends with multiple scenarios...\n');
  console.log('Backends:');
  backends.forEach(b => console.log(`  - ${b.name} (Port ${b.port})`));
  console.log('\nScenarios:');
  scenarios.forEach(s => console.log(`  - ${s.name}: ${s.description}`));
  console.log('\nEndpoints:');
  endpoints.forEach(e => console.log(`  - ${e.name}: ${e.path}`));
  
  const results = {};
  
  for (const scenario of scenarios) {
    printHeader(`📊 ${scenario.name}`);
    
    for (const endpoint of endpoints) {
      printSubHeader(`${endpoint.name} - ${endpoint.path}`);
      
      for (const backend of backends) {
        printSubHeader(`${backend.name}`, backend.color);
        
        const result = await testBackend(backend, endpoint, scenario);
        
        // Store results
        const key = `${scenario.name}-${endpoint.name}-${backend.name}`;
        results[key] = result;
        
        if (result.success) {
          console.log(`✅ Success!`);
          console.log(`   Requests/sec:  ${formatNumber(result.requestsPerSec)}`);
          console.log(`   Latency (avg): ${formatNumber(result.latencyAvg)} ms`);
          console.log(`   Latency (p95): ${formatNumber(result.latencyP95)} ms`);
          console.log(`   Latency (p99): ${formatNumber(result.latencyP99)} ms`);
          console.log(`   Throughput:    ${formatNumber(result.throughput / 1024 / 1024)} MB/s`);
          console.log(`   Total Requests: ${formatNumber(result.totalRequests)}`);
          if (result.errors > 0) {
            console.log(`   ⚠️  Errors:     ${result.errors}`);
          }
          if (result.timeouts > 0) {
            console.log(`   ⚠️  Timeouts:   ${result.timeouts}`);
          }
        } else {
          console.log(`❌ Failed: ${result.error}`);
        }
        
        // Wait a bit between tests
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  
  // Generate comparison report
  generateReport(results);
}

function generateReport(results) {
  printHeader('📈 Performance Comparison Report');
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {},
    details: results,
  };
  
  // Calculate averages for each backend
  backends.forEach(backend => {
    const backendResults = Object.entries(results)
      .filter(([key]) => key.endsWith(backend.name))
      .map(([, value]) => value)
      .filter(r => r.success);
    
    if (backendResults.length > 0) {
      const avgReqPerSec = backendResults.reduce((sum, r) => sum + r.requestsPerSec, 0) / backendResults.length;
      const avgLatency = backendResults.reduce((sum, r) => sum + r.latencyAvg, 0) / backendResults.length;
      const avgThroughput = backendResults.reduce((sum, r) => sum + r.throughput, 0) / backendResults.length;
      
      report.summary[backend.name] = {
        avgRequestsPerSec: avgReqPerSec,
        avgLatency: avgLatency,
        avgThroughput: avgThroughput,
        totalTests: backendResults.length,
      };
      
      console.log(`\n${backend.color}${bold}${backend.name}:${reset}`);
      console.log(`  Average Requests/sec: ${formatNumber(avgReqPerSec)}`);
      console.log(`  Average Latency:      ${formatNumber(avgLatency)} ms`);
      console.log(`  Average Throughput:   ${formatNumber(avgThroughput / 1024 / 1024)} MB/s`);
    }
  });
  
  // Determine winners
  printHeader('🏆 Winners');
  
  const summaries = Object.entries(report.summary);
  
  if (summaries.length > 0) {
    const fastestReq = summaries.reduce((max, [name, data]) => 
      data.avgRequestsPerSec > max.data.avgRequestsPerSec ? { name, data } : max
    , { name: '', data: { avgRequestsPerSec: 0 } });
    
    const lowestLatency = summaries.reduce((min, [name, data]) => 
      data.avgLatency < min.data.avgLatency ? { name, data } : min
    , { name: '', data: { avgLatency: Infinity } });
    
    const highestThroughput = summaries.reduce((max, [name, data]) => 
      data.avgThroughput > max.data.avgThroughput ? { name, data } : max
    , { name: '', data: { avgThroughput: 0 } });
    
    console.log(`🥇 Highest Requests/sec: ${bold}${fastestReq.name}${reset} (${formatNumber(fastestReq.data.avgRequestsPerSec)} req/s)`);
    console.log(`🥇 Lowest Latency:       ${bold}${lowestLatency.name}${reset} (${formatNumber(lowestLatency.data.avgLatency)} ms)`);
    console.log(`🥇 Highest Throughput:   ${bold}${highestThroughput.name}${reset} (${formatNumber(highestThroughput.data.avgThroughput / 1024 / 1024)} MB/s)`);
  }
  
  // Save report to file
  const filename = `benchmark-report-${Date.now()}.json`;
  writeFileSync(filename, JSON.stringify(report, null, 2));
  
  console.log(`\n📄 Detailed report saved to: ${filename}`);
  
  printHeader('✅ Benchmark Complete!');
  console.log('Summary:');
  console.log(`  - Tested ${backends.length} backends`);
  console.log(`  - Ran ${scenarios.length} scenarios`);
  console.log(`  - Tested ${endpoints.length} endpoints`);
  console.log(`  - Total tests: ${Object.keys(results).length}`);
  console.log(`\nCheck ${filename} for detailed results.`);
}

// Check if autocannon is installed
try {
  await import('autocannon');
} catch (error) {
  console.error('❌ Error: autocannon is not installed');
  console.log('\nPlease install it with:');
  console.log('  npm install -g autocannon');
  console.log('\nOr install it locally:');
  console.log('  npm install autocannon');
  process.exit(1);
}

// Run benchmarks
console.log('⏳ Starting benchmarks in 3 seconds...');
console.log('   Make sure all three backends are running!');
console.log('   - Express on port 5001');
console.log('   - NestJS on port 5003');
console.log('   - Fastify on port 5002\n');

await new Promise(resolve => setTimeout(resolve, 3000));

runBenchmarks().catch(error => {
  console.error('❌ Benchmark failed:', error);
  process.exit(1);
});
