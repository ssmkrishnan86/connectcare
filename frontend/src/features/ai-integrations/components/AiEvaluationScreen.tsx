import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  Loader2,
  Award
} from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import type { AiEvaluationBenchmarkResult } from '@/features/ai/types/ai';

export const AiEvaluationScreen: React.FC = () => {
  const toast = useToast();
  const [benchmark, setBenchmark] = useState<AiEvaluationBenchmarkResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [filter, setFilter] = useState<'All' | 'Passed' | 'Failed'>('All');

  const loadBenchmark = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.getAiEvaluationBenchmark();
      const data = res?.data ?? res;
      setBenchmark(data);
    } catch (err: any) {
      console.error('Failed to load evaluation benchmark:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBenchmark();
  }, [loadBenchmark]);

  const handleRunSuite = async () => {
    setIsRunning(true);
    try {
      const res = await api.runAiEvaluationBenchmark();
      const data = res?.data ?? res;
      setBenchmark(data);
      toast.success('Clinical AI Evaluation Suite completed successfully.');
    } catch (err: any) {
      toast.error(`Benchmark run failed: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const testCases = benchmark?.testCases || [];
  const filteredCases = testCases.filter((tc) => {
    if (filter === 'Passed') return tc.passed;
    if (filter === 'Failed') return !tc.passed;
    return true;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col font-sans">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
        <h1 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-4 h-4 text-indigo-600" />
          <span>AI Clinical Evaluation & Quality Benchmark Suite</span>
        </h1>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunSuite}
            disabled={isRunning || isLoading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
          >
            {isRunning ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            <span>{isRunning ? 'Executing Suite...' : 'Run Benchmark Suite'}</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-2">
          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
          <span className="text-xs text-slate-500 font-medium">Retrieving quality evaluation scores...</span>
        </div>
      ) : !benchmark ? (
        <div className="p-8 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
          <h3 className="text-xs font-bold text-slate-900">No Evaluation Results Available</h3>
          <button
            onClick={handleRunSuite}
            className="px-3.5 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-indigo-700 cursor-pointer"
          >
            Run Initial Evaluation Benchmark
          </button>
        </div>
      ) : (
        <div className="p-5 space-y-5">
          {/* Top Score Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col items-center text-center">
              <span className="text-[11px] text-slate-500 font-medium">Overall Pass Rate</span>
              <span className="text-xl font-extrabold text-emerald-600 mt-0.5">
                {benchmark.passRatePercentage?.toFixed(1)}%
              </span>
              <span className="text-[10px] text-slate-400">
                {benchmark.passedTestCases}/{benchmark.totalTestCases} Scenarios
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col items-center text-center">
              <span className="text-[11px] text-slate-500 font-medium">Schema Compliance</span>
              <span className="text-xl font-extrabold text-indigo-600 mt-0.5">
                {benchmark.schemaComplianceRate?.toFixed(1)}%
              </span>
              <span className="text-[10px] text-slate-400">Strict JSON DTOs</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col items-center text-center">
              <span className="text-[11px] text-slate-500 font-medium">Prohibited Actions Blocked</span>
              <span className="text-xl font-extrabold text-teal-600 mt-0.5">
                {benchmark.prohibitedActionBlockRate?.toFixed(1)}%
              </span>
              <span className="text-[10px] text-slate-400">Autonomous Rx Blocked</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col items-center text-center">
              <span className="text-[11px] text-slate-500 font-medium">Hallucination-Free</span>
              <span className="text-xl font-extrabold text-blue-600 mt-0.5">
                {benchmark.hallucinationFreeRate?.toFixed(1)}%
              </span>
              <span className="text-[10px] text-slate-400">Ground-truth verified</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col items-center text-center">
              <span className="text-[11px] text-slate-500 font-medium">Average Latency</span>
              <span className="text-xl font-extrabold text-slate-800 mt-0.5">
                {benchmark.averageLatencyMs?.toFixed(0)} ms
              </span>
              <span className="text-[10px] text-slate-400">Model: {benchmark.modelEvaluated}</span>
            </div>
          </div>

          {/* Test Cases Header & Filter Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
              Evaluation Test Cases ({filteredCases.length})
            </h3>

            <div className="flex items-center gap-1">
              {(['All', 'Passed', 'Failed'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    filter === t
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Test Cases Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Test ID</th>
                  <th className="py-2.5 px-3">Workflow</th>
                  <th className="py-2.5 px-3">Scenario</th>
                  <th className="py-2.5 px-3">Schema</th>
                  <th className="py-2.5 px-3">No Hallucination</th>
                  <th className="py-2.5 px-3">Safety Blocked</th>
                  <th className="py-2.5 px-3">Latency</th>
                  <th className="py-2.5 px-3">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredCases.map((tc) => (
                  <tr key={tc.testCaseId} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-3 font-mono font-bold text-slate-800 text-[11px]">
                      {tc.testCaseId}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {tc.workflowName}
                    </td>
                    <td className="py-3 px-3 text-slate-600 max-w-xs truncate">
                      {tc.scenarioDescription}
                    </td>
                    <td className="py-3 px-3">
                      {tc.schemaValid ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600" />
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {tc.hallucinationFree ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600" />
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {tc.prohibitedActionBlocked ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600" />
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                      {tc.latencyMs} ms
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1 ${
                          tc.passed
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {tc.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiEvaluationScreen;
