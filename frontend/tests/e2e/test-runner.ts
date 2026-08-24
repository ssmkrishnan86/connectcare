import axios, { AxiosInstance } from 'axios';

export interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  durationMs: number;
  error?: string;
}

export class TestHarness {
  private results: TestResult[] = [];
  public currentSuite: string = 'General';

  public async runTest(name: string, fn: () => Promise<void>): Promise<boolean> {
    const start = Date.now();
    try {
      await fn();
      const durationMs = Date.now() - start;
      this.results.push({
        suite: this.currentSuite,
        name,
        passed: true,
        durationMs,
      });
      console.log(`  ✅ [PASS] ${name} (${durationMs}ms)`);
      return true;
    } catch (err: any) {
      const durationMs = Date.now() - start;
      const errorMsg = err?.response?.data?.message || err?.message || String(err);
      this.results.push({
        suite: this.currentSuite,
        name,
        passed: false,
        durationMs,
        error: errorMsg,
      });
      console.error(`  ❌ [FAIL] ${name} (${durationMs}ms): ${errorMsg}`);
      return false;
    }
  }

  public assert(condition: boolean, message: string) {
    if (!condition) {
      throw new Error(`Assertion Failed: ${message}`);
    }
  }

  public assertEquals<T>(actual: T, expected: T, message?: string) {
    if (actual !== expected) {
      throw new Error(
        `Assertion Failed: expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}. ${message || ''}`
      );
    }
  }

  public assertDefined(val: any, name: string) {
    if (val === undefined || val === null) {
      throw new Error(`Assertion Failed: "${name}" must be defined.`);
    }
  }

  public createClient(token?: string): AxiosInstance {
    return axios.create({
      baseURL: 'http://localhost:5231/api',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      timeout: 10000,
    });
  }

  public printSummary(): { total: number; passed: number; failed: number } {
    const total = this.results.length;
    const passed = this.results.filter((r) => r.passed).length;
    const failed = total - passed;

    console.log('\n' + '='.repeat(70));
    console.log('🏁 E2E TEST EXECUTION SUMMARY');
    console.log('='.repeat(70));
    console.log(`Total Tests Executed : ${total}`);
    console.log(`Passed               : ${passed} ✅`);
    console.log(`Failed               : ${failed} ${failed > 0 ? '❌' : '🎉'}`);
    console.log('='.repeat(70));

    if (failed > 0) {
      console.log('\n❌ FAILED TESTS BREAKDOWN:');
      this.results
        .filter((r) => !r.passed)
        .forEach((r, idx) => {
          console.log(`  ${idx + 1}. [${r.suite}] ${r.name}`);
          console.log(`     Error: ${r.error}`);
        });
      console.log('='.repeat(70));
    }

    return { total, passed, failed };
  }

  public getResults(): TestResult[] {
    return this.results;
  }
}
