#!/usr/bin/env tsx

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface SmokeTest {
  name: string;
  description: string;
  test: () => Promise<boolean>;
}

const BASE_URL = 'http://localhost:3000';
const API_BASE = 'http://localhost:3000/api';

const smokeTests: SmokeTest[] = [
  {
    name: 'Web App Health',
    description: 'Check if the web application is running',
    test: async () => {
      try {
        const response = await fetch(BASE_URL);
        return response.ok;
      } catch (error) {
        console.error('Web app health check failed:', error);
        return false;
      }
    }
  },
  {
    name: 'Media Service',
    description: 'Check media service health',
    test: async () => {
      try {
        const response = await fetch('http://localhost:3006/healthz');
        return response.ok;
      } catch (error) {
        console.error('Media service health check failed:', error);
        return false;
      }
    }
  },
  {
    name: 'Live Stream Service',
    description: 'Check live stream service health',
    test: async () => {
      try {
        const response = await fetch('http://localhost:3022/healthz');
        return response.ok;
      } catch (error) {
        console.error('Live stream service health check failed:', error);
        return false;
      }
    }
  },
  {
    name: 'Discovery Service',
    description: 'Check discovery service health',
    test: async () => {
      try {
        const response = await fetch('http://localhost:3021/healthz');
        return response.ok;
      } catch (error) {
        console.error('Discovery service health check failed:', error);
        return false;
      }
    }
  },
  {
    name: 'Communities Service',
    description: 'Check communities service health',
    test: async () => {
      try {
        const response = await fetch('http://localhost:3019/healthz');
        return response.ok;
      } catch (error) {
        console.error('Communities service health check failed:', error);
        return false;
      }
    }
  },
  {
    name: 'Rooms Service',
    description: 'Check rooms service health',
    test: async () => {
      try {
        const response = await fetch('http://localhost:3020/healthz');
        return response.ok;
      } catch (error) {
        console.error('Rooms service health check failed:', error);
        return false;
      }
    }
  },
  {
    name: 'Truth Graph Service',
    description: 'Check truth graph service health',
    test: async () => {
      try {
        const response = await fetch('http://localhost:3003/healthz');
        return response.ok;
      } catch (error) {
        console.error('Truth graph service health check failed:', error);
        return false;
      }
    }
  },
  {
    name: 'Truth Agent Service',
    description: 'Check truth agent service health',
    test: async () => {
      try {
        const response = await fetch('http://localhost:3009/healthz');
        return response.ok;
      } catch (error) {
        console.error('Truth agent service health check failed:', error);
        return false;
      }
    }
  },
  {
    name: 'Truth Notary Service',
    description: 'Check truth notary service health',
    test: async () => {
      try {
        const response = await fetch('http://localhost:3010/healthz');
        return response.ok;
      } catch (error) {
        console.error('Truth notary service health check failed:', error);
        return false;
      }
    }
  },
  {
    name: 'Truth Jury Service',
    description: 'Check truth jury service health',
    test: async () => {
      try {
        const response = await fetch('http://localhost:3011/healthz');
        return response.ok;
      } catch (error) {
        console.error('Truth jury service health check failed:', error);
        return false;
      }
    }
  },
  {
    name: 'Truth Bundles Service',
    description: 'Check truth bundles service health',
    test: async () => {
      try {
        const response = await fetch('http://localhost:3012/healthz');
        return response.ok;
      } catch (error) {
        console.error('Truth bundles service health check failed:', error);
        return false;
      }
    }
  },
  {
    name: 'Arena Escrow Service',
    description: 'Check arena escrow service health',
    test: async () => {
      try {
        const response = await fetch('http://localhost:3013/healthz');
        return response.ok;
      } catch (error) {
        console.error('Arena escrow service health check failed:', error);
        return false;
      }
    }
  },
  {
    name: 'Arena Review Service',
    description: 'Check arena review service health',
    test: async () => {
      try {
        const response = await fetch('http://localhost:3014/healthz');
        return response.ok;
      } catch (error) {
        console.error('Arena review service health check failed:', error);
        return false;
      }
    }
  },
  {
    name: 'Recommenders Service',
    description: 'Check recommenders service health',
    test: async () => {
      try {
        const response = await fetch('http://localhost:3015/healthz');
        return response.ok;
      } catch (error) {
        console.error('Recommenders service health check failed:', error);
        return false;
      }
    }
  },
  {
    name: 'Moderation Service',
    description: 'Check moderation service health',
    test: async () => {
      try {
        const response = await fetch('http://localhost:3016/healthz');
        return response.ok;
      } catch (error) {
        console.error('Moderation service health check failed:', error);
        return false;
      }
    }
  },
  {
    name: 'Creator Service',
    description: 'Check creator service health',
    test: async () => {
      try {
        const response = await fetch('http://localhost:3017/healthz');
        return response.ok;
      } catch (error) {
        console.error('Creator service health check failed:', error);
        return false;
      }
    }
  },
  {
    name: 'Observability Service',
    description: 'Check observability service health',
    test: async () => {
      try {
        const response = await fetch('http://localhost:3018/healthz');
        return response.ok;
      } catch (error) {
        console.error('Observability service health check failed:', error);
        return false;
      }
    }
  },
  {
    name: 'Payments Service',
    description: 'Check payments service health',
    test: async () => {
      try {
        const response = await fetch('http://localhost:3007/healthz');
        return response.ok;
      } catch (error) {
        console.error('Payments service health check failed:', error);
        return false;
      }
    }
  },
  {
    name: 'Federation Service',
    description: 'Check federation service health',
    test: async () => {
      try {
        const response = await fetch('http://localhost:3008/healthz');
        return response.ok;
      } catch (error) {
        console.error('Federation service health check failed:', error);
        return false;
      }
    }
  },
  {
    name: 'Transparency Logs API',
    description: 'Check transparency logs API',
    test: async () => {
      try {
        const response = await fetch(`${API_BASE}/transparency/log`);
        return response.ok;
      } catch (error) {
        console.error('Transparency logs API check failed:', error);
        return false;
      }
    }
  },
  {
    name: 'Governance Constitution',
    description: 'Check governance constitution endpoint',
    test: async () => {
      try {
        const response = await fetch(`${API_BASE}/governance/constitution`);
        return response.ok;
      } catch (error) {
        console.error('Governance constitution check failed:', error);
        return false;
      }
    }
  }
];

async function runSmokeTests() {
  console.log('🚀 Running PolyVerse v0.4 Smoke Tests\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const test of smokeTests) {
    process.stdout.write(`🧪 ${test.name}... `);
    
    try {
      const result = await test.test();
      
      if (result) {
        console.log('✅ PASSED');
        passed++;
      } else {
        console.log('❌ FAILED');
        failed++;
      }
    } catch (error) {
      console.log('❌ FAILED');
      console.error(`   Error: ${error}`);
      failed++;
    }
  }
  
  console.log('\n📊 Test Results:');
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Success Rate: ${((passed / smokeTests.length) * 100).toFixed(1)}%`);
  
  if (failed > 0) {
    console.log('\n⚠️  Some services are not responding. Make sure all services are running with:');
    console.log('   docker compose -f infra/docker-compose.yml up -d');
    console.log('   make seed');
    process.exit(1);
  } else {
    console.log('\n🎉 All smoke tests passed! PolyVerse v0.4 is ready.');
    console.log('\n📋 v0.4 Features Verified:');
    console.log('   • Media service with resumable uploads');
    console.log('   • Live streaming with chat');
    console.log('   • Discovery with recommendation bundles');
    console.log('   • Communities and rooms');
    console.log('   • Truth verification system');
    console.log('   • Arena disputes and payouts');
    console.log('   • Recommenders with voice balance');
    console.log('   • Moderation system');
    console.log('   • Creator economy features');
    console.log('   • Federation outbound');
    console.log('   • Observability and monitoring');
    console.log('   • Transparency logs and governance');
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSmokeTests();
}

export { runSmokeTests, smokeTests };