# Load Testing Guide - Backend Performance Comparison

A comprehensive guide to stress test and benchmark all three backend implementations under high traffic conditions.

## 🎯 Overview

This guide will help you:
- Install load testing tools
- Run realistic high-traffic scenarios
- Compare performance metrics
- Identify bottlenecks
- Optimize for production

## 🛠️ Tools We'll Use

### 1. Autocannon (Recommended - Fast & Simple)
- **Best for**: Quick benchmarks, HTTP load testing
- **Written in**: Node.js
- **Speed**: Very fast

### 2. Apache Bench (ab)
- **Best for**: Simple HTTP benchmarks
- **Written in**: C
- **Speed**: Fast

### 3. Artillery (Advanced)
- **Best for**: Complex scenarios, realistic traffic patterns
- **Written in**: Node.js
- **Features**: Scenarios, ramp-up, metrics

### 4. k6 (Professional)
- **Best for**: Production-grade load testing
- **Written in**: Go
- **Features**: Scripting, thresholds, cloud integration

## 📦 Installation

### Install Autocannon (Easiest)
```bash
npm install -g autocannon
```

### Install Artillery
```bash
npm install -g artillery
```

### Install k6 (Windows)
```powershell
# Using Chocolatey
choco install k6

# Or download from: https://k6.io/docs/getting-started/installation/
```

### Install Apache Bench (Usually pre-installed)
```bash
# Check if installed
ab -V

# Windows: Download Apache and use ab.exe
# Or use WSL
```

## 🚀 Quick Benchmarks

### Test 1: Health Check Endpoint (Warmup)

**Express (Port 5005):**
```bash
autocannon -c 100 -d 10 http://localhost:5005/health
```

**NestJS (Port 5000):**
```bash
autocannon -c 100 -d 10 http://localhost:5000/health
```

**Fastify (Port 5002):**
```bash
autocannon -c 100 -d 10 http://localhost:5002/health
```

**Parameters:**
- `-c 100` = 100 concurrent connections
- `-d 10` = 10 seconds duration

### Test 2: Moderate Load
```bash
# 200 concurrent connections, 30 seconds
autocannon -c 200 -d 30 http://localhost:5005/health
autocannon -c 200 -d 30 http://localhost:5000/health
autocannon -c 200 -d 30 http://localhost:5002/health
```

### Test 3: High Load
```bash
# 500 concurrent connections, 60 seconds
autocannon -c 500 -d 60 http://localhost:5005/health
autocannon -c 500 -d 60 http://localhost:5000/health
autocannon -c 500 -d 60 http://localhost:5002/health
```

### Test 4: Extreme Load
```bash
# 1000 concurrent connections, 60 seconds
autocannon -c 1000 -d 60 http://localhost:5005/health
autocannon -c 1000 -d 60 http://localhost:5000/health
autocannon -c 1000 -d 60 http://localhost:5002/health
```

## 📊 Understanding Results

### Autocannon Output Explained

```
Running 10s test @ http://localhost:5002/health
100 connections

┌─────────┬──────┬──────┬───────┬──────┬─────────┬─────────┬────────┐
│ Stat    │ 2.5% │ 50%  │ 97.5% │ 99%  │ Avg     │ Stdev   │ Max    │
├─────────┼──────┼──────┼───────┼──────┼─────────┼─────────┼────────┤
│ Latency │ 2 ms │ 3 ms │ 5 ms  │ 6 ms │ 3.2 ms  │ 1.1 ms  │ 45 ms  │
└─────────┴──────┴──────┴───────┴──────┴─────────┴─────────┴────────┘
┌───────────┬─────────┬─────────┬─────────┬─────────┬──────────┬─────────┬─────────┐
│ Stat      │ 1%      │ 2.5%    │ 50%     │ 97.5%   │ Avg      │ Stdev   │ Min     │
├───────────┼─────────┼─────────┼─────────┼─────────┼──────────┼─────────┼─────────┤
│ Req/Sec   │ 28,000  │ 28,000  │ 30,000  │ 31,000  │ 29,800   │ 1,200   │ 28,000  │
├───────────┼─────────┼─────────┼─────────┼─────────┼──────────┼─────────┼─────────┤
│ Bytes/Sec │ 5.1 MB  │ 5.1 MB  │ 5.4 MB  │ 5.6 MB  │ 5.4 MB   │ 220 kB  │ 5.1 MB  │
└───────────┴─────────┴─────────┴─────────┴─────────┴──────────┴─────────┴─────────┘

Req/Bytes counts sampled once per second.

300k requests in 10.04s, 54 MB read
```

**Key Metrics:**
- **Req/Sec**: Requests per second (higher is better)
- **Latency**: Response time (lower is better)
- **Bytes/Sec**: Throughput (higher is better)
- **Avg**: Average value
- **50%**: Median (50th percentile)
- **97.5%**: 97.5th percentile (most requests)
- **99%**: 99th percentile (slowest requests)

## 🎭 Realistic Scenarios

### Scenario 1: API Endpoint Testing

Create a test file `load-test-api.js`:

```javascript
// load-test-api.js
import autocannon from 'autocannon';

const backends = [
  { name: 'Express', url: 'http://localhost:5005' },
  { name: 'NestJS', url: 'http://localhost:5000' },
  { name: 'Fastify', url: 'http://localhost:5002' },
];

const endpoints = [
  '/health',
  '/api/v1/events/approved',
];

async function testBackend(backend, endpoint) {
  console.log(`\n🧪 Testing ${backend.name} - ${endpoint}`);
  console.log('='.repeat(50));
  
  const result = await autocannon({
    url: `${backend.url}${endpoint}`,
    connections: 100,
    duration: 10,
  });
  
  console.log(`Requests/sec: ${result.requests.average}`);
  console.log(`Latency (avg): ${result.latency.mean}ms`);
  console.log(`Throughput: ${(result.throughput.average / 1024 / 1024).toFixed(2)} MB/s`);
  
  return result;
}

async function runTests() {
  const results = {};
  
  for (const backend of backends) {
    results[backend.name] = {};
    for (const endpoint of endpoints) {
      results[backend.name][endpoint] = await testBackend(backend, endpoint);
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(JSON.stringify(results, null, 2));
}

runTests();
```

Run it:
```bash
node load-test-api.js
```

### Scenario 2: Authentication Load Test

Create `load-test-auth.js`:

```javascript
import autocannon from 'autocannon';

const backends = [
  { name: 'Express', url: 'http://localhost:5005' },
  { name: 'NestJS', url: 'http://localhost:5000' },
  { name: 'Fastify', url: 'http://localhost:5002' },
];

async function testAuth(backend) {
  console.log(`\n🔐 Testing ${backend.name} - Login Endpoint`);
  
  const result = await autocannon({
    url: `${backend.url}/api/v1/auth/login`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'Password123',
    }),
    connections: 50, // Lower for POST requests
    duration: 10,
  });
  
  console.log(`Requests/sec: ${result.requests.average}`);
  console.log(`Latency (avg): ${result.latency.mean}ms`);
  
  return result;
}

async function runAuthTests() {
  for (const backend of backends) {
    await testAuth(backend);
  }
}

runAuthTests();
```

### Scenario 3: Mixed Traffic Pattern (Artillery)

Create `artillery-scenario.yml`:

```yaml
config:
  target: "http://localhost:5002"  # Change for each backend
  phases:
    - duration: 60
      arrivalRate: 10      # 10 users per second
      name: "Warm up"
    - duration: 120
      arrivalRate: 50      # 50 users per second
      name: "Moderate load"
    - duration: 60
      arrivalRate: 100     # 100 users per second
      name: "High load"
    - duration: 60
      arrivalRate: 200     # 200 users per second
      name: "Peak load"
  processor: "./custom-functions.js"

scenarios:
  - name: "Browse and interact"
    weight: 70
    flow:
      - get:
          url: "/health"
      - think: 2
      - get:
          url: "/api/v1/events/approved"
      - think: 3
      - get:
          url: "/api/v1/events/by-location?location=Addis"

  - name: "User authentication"
    weight: 20
    flow:
      - post:
          url: "/api/v1/auth/login"
          json:
            email: "test@example.com"
            password: "Password123"
      - think: 1

  - name: "Admin operations"
    weight: 10
    flow:
      - post:
          url: "/api/v1/admin/login"
          json:
            email: "admin@example.com"
            password: "Admin123"
      - think: 1
      - get:
          url: "/api/v1/events/pending"
          headers:
            Authorization: "Bearer {{ token }}"
```

Run Artillery test:
```bash
# Test Express
artillery run --target http://localhost:5005 artillery-scenario.yml

# Test NestJS
artillery run --target http://localhost:5000 artillery-scenario.yml

# Test Fastify
artillery run --target http://localhost:5002 artillery-scenario.yml
```

### Scenario 4: Sustained Load Test (k6)

Create `k6-load-test.js`:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up to 100 users
    { duration: '5m', target: 100 },   // Stay at 100 users
    { duration: '2m', target: 200 },   // Ramp up to 200 users
    { duration: '5m', target: 200 },   // Stay at 200 users
    { duration: '2m', target: 500 },   // Ramp up to 500 users
    { duration: '5m', target: 500 },   // Stay at 500 users
    { duration: '2m', target: 0 },     // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'],    // Error rate must be below 1%
  },
};

const BASE_URL = 'http://localhost:5002'; // Change for each backend

export default function () {
  // Test health endpoint
  let res = http.get(`${BASE_URL}/health`);
  check(res, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 100ms': (r) => r.timings.duration < 100,
  });
  
  sleep(1);
  
  // Test events endpoint
  res = http.get(`${BASE_URL}/api/v1/events/approved`);
  check(res, {
    'events status is 200': (r) => r.status === 200,
  });
  
  sleep(2);
  
  // Test login endpoint
  const payload = JSON.stringify({
    email: 'test@example.com',
    password: 'Password123',
  });
  
  res = http.post(`${BASE_URL}/api/v1/auth/login`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  
  check(res, {
    'login status is 200 or 401': (r) => r.status === 200 || r.status === 401,
  });
  
  sleep(1);
}
```

Run k6 test:
```bash
# Test Express
k6 run k6-load-test.js

# Edit BASE_URL and test others
```

## 📈 Monitoring During Tests

### 1. Monitor System Resources

**Windows PowerShell:**
```powershell
# CPU and Memory usage
while ($true) {
  Get-Process node | Select-Object Name, CPU, WorkingSet | Format-Table
  Start-Sleep -Seconds 2
}
```

**Or use Task Manager:**
- Press `Ctrl + Shift + Esc`
- Go to "Performance" tab
- Watch CPU, Memory, Network

### 2. Monitor MongoDB

```bash
# In MongoDB shell
mongosh

# Run this to see operations
db.currentOp()

# Monitor stats
db.serverStatus()
```

### 3. Monitor Application Logs

**Express/Fastify:**
```bash
# Watch logs in real-time
tail -f backend-express/logs/combined.log
```

**NestJS:**
```bash
# Logs appear in console
# Watch the terminal where server is running
```

## 🎯 Benchmark Scenarios

### Scenario A: Light Load (Normal Traffic)
```bash
autocannon -c 50 -d 30 http://localhost:5002/api/v1/events/approved
```
**Simulates**: 50 concurrent users, 30 seconds

### Scenario B: Medium Load (Busy Hours)
```bash
autocannon -c 200 -d 60 http://localhost:5002/api/v1/events/approved
```
**Simulates**: 200 concurrent users, 1 minute

### Scenario C: High Load (Peak Traffic)
```bash
autocannon -c 500 -d 120 http://localhost:5002/api/v1/events/approved
```
**Simulates**: 500 concurrent users, 2 minutes

### Scenario D: Stress Test (Breaking Point)
```bash
autocannon -c 1000 -d 180 http://localhost:5002/api/v1/events/approved
```
**Simulates**: 1000 concurrent users, 3 minutes

### Scenario E: Spike Test (Sudden Traffic)
```bash
# Start with low load
autocannon -c 10 -d 10 http://localhost:5002/health

# Immediately spike to high load
autocannon -c 1000 -d 30 http://localhost:5002/health

# Back to normal
autocannon -c 10 -d 10 http://localhost:5002/health
```

## 📊 Results Comparison Template

Create a spreadsheet or table:

| Metric | Express | NestJS | Fastify | Winner |
|--------|---------|--------|---------|--------|
| **Light Load (50 users)** |
| Req/sec | | | | |
| Latency (avg) | | | | |
| Latency (p95) | | | | |
| Errors | | | | |
| **Medium Load (200 users)** |
| Req/sec | | | | |
| Latency (avg) | | | | |
| Latency (p95) | | | | |
| Errors | | | | |
| **High Load (500 users)** |
| Req/sec | | | | |
| Latency (avg) | | | | |
| Latency (p95) | | | | |
| Errors | | | | |
| **Stress Test (1000 users)** |
| Req/sec | | | | |
| Latency (avg) | | | | |
| Latency (p95) | | | | |
| Errors | | | | |
| **Resource Usage** |
| CPU (avg %) | | | | |
| Memory (MB) | | | | |
| Network (MB/s) | | | | |

## 🔍 What to Look For

### Good Signs ✅
- Consistent request rates
- Low latency (< 100ms for simple endpoints)
- Low error rate (< 1%)
- Stable memory usage
- CPU usage < 80%

### Warning Signs ⚠️
- Increasing latency over time
- Error rate > 1%
- Memory leaks (increasing memory)
- CPU at 100%
- Timeouts

### Critical Issues ❌
- Server crashes
- Error rate > 5%
- Latency > 1000ms
- Out of memory errors
- Connection refused errors

## 🎓 Best Practices

### 1. Warm Up First
```bash
# Run a small test first to warm up the server
autocannon -c 10 -d 10 http://localhost:5002/health
```

### 2. Test One at a Time
- Stop other backends before testing
- Close unnecessary applications
- Ensure consistent environment

### 3. Multiple Runs
```bash
# Run each test 3 times and average results
for i in {1..3}; do
  echo "Run $i"
  autocannon -c 100 -d 30 http://localhost:5002/health
  sleep 5
done
```

### 4. Test Different Endpoints
- Health check (simple)
- Database queries (complex)
- Authentication (CPU intensive)
- File uploads (I/O intensive)

### 5. Monitor Everything
- CPU usage
- Memory usage
- Network usage
- Database connections
- Error logs

## 📝 Sample Test Script

Create `run-all-tests.sh` (or `.ps1` for Windows):

```bash
#!/bin/bash

echo "🚀 Starting Load Tests for All Backends"
echo "========================================"

# Test Express
echo "\n📦 Testing Express Backend (Port 5005)"
autocannon -c 100 -d 30 http://localhost:5005/health > results-express.txt
autocannon -c 100 -d 30 http://localhost:5005/api/v1/events/approved >> results-express.txt

# Test NestJS
echo "\n🏢 Testing NestJS Backend (Port 5000)"
autocannon -c 100 -d 30 http://localhost:5000/health > results-nestjs.txt
autocannon -c 100 -d 30 http://localhost:5000/api/v1/events/approved >> results-nestjs.txt

# Test Fastify
echo "\n⚡ Testing Fastify Backend (Port 5002)"
autocannon -c 100 -d 30 http://localhost:5002/health > results-fastify.txt
autocannon -c 100 -d 30 http://localhost:5002/api/v1/events/approved >> results-fastify.txt

echo "\n✅ Tests Complete! Check results-*.txt files"
```

## 🎯 Expected Results

Based on typical performance:

### Light Load (50 concurrent users)
- **Express**: 12,000-15,000 req/s
- **NestJS**: 18,000-22,000 req/s
- **Fastify**: 28,000-32,000 req/s

### Medium Load (200 concurrent users)
- **Express**: 10,000-13,000 req/s
- **NestJS**: 15,000-19,000 req/s
- **Fastify**: 25,000-29,000 req/s

### High Load (500 concurrent users)
- **Express**: 8,000-11,000 req/s
- **NestJS**: 12,000-16,000 req/s
- **Fastify**: 20,000-25,000 req/s

## 🚀 Quick Start

```bash
# 1. Install autocannon
npm install -g autocannon

# 2. Start all three backends (in separate terminals)
cd backend-express && npm run dev
cd backend-nestjs && npm run start:dev
cd backend-fastify && npm run dev

# 3. Run quick test
autocannon -c 100 -d 10 http://localhost:5005/health
autocannon -c 100 -d 10 http://localhost:5000/health
autocannon -c 100 -d 10 http://localhost:5002/health

# 4. Compare results!
```

---

**Happy Load Testing! 🚀**

Remember: Real-world performance depends on many factors including hardware, network, database, and application complexity. These tests give you relative comparisons.
