import React from 'react';
import {
  Share2,
  GitBranch,
  TrendingDown,
  Sparkles,
  ShieldAlert,
  Layers,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Zap,
  Play
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  return (
    <div className="min-h-screen bg-[#07090e] text-white selection:bg-electric-cyan/30">
      {/* Top Navigation */}
      <nav className="border-b border-white/10 bg-[#07090e]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-electric-blue via-electric-violet to-electric-cyan p-0.5 shadow-glow-cyan">
              <div className="w-full h-full bg-[#07090e] rounded-[6px] flex items-center justify-center">
                <Share2 className="w-4 h-4 text-electric-cyan" />
              </div>
            </div>
            <span className="font-bold text-base tracking-tight text-white">
              BlockerGraph <span className="text-electric-cyan">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onEnterApp}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-electric-cyan hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-glow-cyan transition-all"
            >
              <span>Launch Live Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        {/* Glow backdrop effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-electric-blue/20 via-electric-violet/20 to-electric-cyan/15 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300 mb-6 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Not just another Kanban clone • True Graph Theory for Engineering Projects</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            Visualize Dependencies.{' '}
            <span className="bg-gradient-to-r from-electric-cyan via-electric-blue to-electric-violet bg-clip-text text-transparent">
              Eliminate Blockers.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            BlockerGraph AI detects circular dependency deadlocks, dynamically flags upstream blocker chains, and mathematically simulates delay impacts before production delivery dates slip.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onEnterApp}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-electric-blue to-electric-cyan hover:from-blue-600 hover:to-sky-400 text-slate-950 font-bold text-sm shadow-glow-cyan transition-all scale-100 hover:scale-[1.02]"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Explore Interactive Demo (16 Tasks)</span>
            </button>
          </div>
        </div>

        {/* Interactive Preview Mockup */}
        <div className="max-w-6xl mx-auto px-6 mt-14">
          <div className="rounded-2xl border border-white/15 bg-[#0e1422]/90 backdrop-blur-xl shadow-2xl p-4 overflow-hidden relative group">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-slate-400 ml-2 font-mono text-[11px]">
                  nebula-v2-orchestrator.dag // 16 nodes • 20 edges • 0 float critical path
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/40 animate-pulse">
                Blocked Task Detected
              </span>
            </div>

            {/* Visual Node Diagram Representation */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-[#07090e]/80 rounded-xl border border-white/5">
              <div className="p-3.5 rounded-xl bg-[#0f172a] border border-emerald-500/40 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">READY</span>
                  <span className="font-mono text-slate-400">3d</span>
                </div>
                <div className="font-semibold text-white text-xs">PostgreSQL DB Schema</div>
                <div className="text-[10px] text-slate-400">Sarah Connor</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0f172a] border border-amber-500/60 shadow-glow-critical space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">CRITICAL PATH</span>
                  <span className="font-mono text-slate-400">5d</span>
                </div>
                <div className="font-semibold text-white text-xs">API Gateway Routing</div>
                <div className="text-[10px] text-slate-400">David Kim (65%)</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0f172a] border border-rose-500/60 shadow-glow-danger space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold animate-pulse">BLOCKED</span>
                  <span className="font-mono text-slate-400">4d</span>
                </div>
                <div className="font-semibold text-white text-xs">Stripe Billing Webhooks</div>
                <div className="text-[10px] text-rose-300/90 font-medium">Waiting on: API Gateway</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0f172a] border border-white/10 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-bold">LOCKED</span>
                  <span className="font-mono text-slate-400">4d</span>
                </div>
                <div className="font-semibold text-white text-xs">End-to-End Cypress Suite</div>
                <div className="text-[10px] text-slate-400">Downstream dependent</div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-electric-cyan/10 border border-electric-cyan/30 flex items-center justify-between text-xs">
              <span className="text-sky-200">
                ⚡ <strong>Simulation Engine Ready:</strong> Test +2 day delay on API Gateway to observe automatic downstream schedule propagation.
              </span>
              <button
                onClick={onEnterApp}
                className="px-3 py-1 rounded-lg bg-electric-cyan text-slate-950 font-bold text-[11px] shrink-0 hover:bg-sky-400 transition-colors"
              >
                Launch Simulator →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-20 border-t border-white/10 bg-[#090d16]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Mathematical Precision for Complex Delivery Pipelines
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-slate-400">
              Traditional task boards don't understand directed graphs or critical path physics. BlockerGraph AI does.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-[#0e1422] border border-white/10 space-y-3 glass-panel-hover">
              <div className="p-3 rounded-xl bg-electric-cyan/15 text-electric-cyan w-fit">
                <GitBranch className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Interactive Directed Graph</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Render tasks as custom nodes in React Flow. Pan, zoom, inspect downstream cascades, and drag connections with real-time feedback.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-[#0e1422] border border-rose-500/20 space-y-3 glass-panel-hover">
              <div className="p-3 rounded-xl bg-rose-500/15 text-rose-400 w-fit">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Circular Dependency Prevention</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                DFS cycle detection intercepts self-dependencies and cyclic loops before saving, displaying an exact step-by-step path explanation.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-[#0e1422] border border-amber-500/20 space-y-3 glass-panel-hover">
              <div className="p-3 rounded-xl bg-amber-500/15 text-amber-400 w-fit">
                <TrendingDown className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Delay Impact Simulator</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Simulate postponing any task by 1 to 21 days. Watch finish dates recalculate dynamically, pinpointing at-risk milestones.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-[#0e1422] border border-white/10 space-y-3 glass-panel-hover">
              <div className="p-3 rounded-xl bg-electric-violet/15 text-electric-violet w-fit">
                <Sparkles className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-base font-bold text-white">Critical Path Method (CPM)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Computes Earliest Start (ES), Earliest Finish (EF), Latest Finish (LF), and Total Float/Slack to protect project delivery dates.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-[#0e1422] border border-white/10 space-y-3 glass-panel-hover">
              <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-400 w-fit">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Dynamic Blocker Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automatically identifies uncompleted prerequisites, counts downstream dependents, and suggests immediate next unblocking actions.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-[#0e1422] border border-white/10 space-y-3 glass-panel-hover">
              <div className="p-3 rounded-xl bg-sky-500/15 text-sky-400 w-fit">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Project Intelligence Analytics</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Explainable AI insights highlighting architectural bottlenecks, high fan-out hubs, and zero-float schedule vulnerabilities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10 text-center text-xs text-slate-500">
        <p>BlockerGraph AI • Built for Advanced Hackathon Demonstration • 100% Deterministic Graph Algorithms</p>
      </footer>
    </div>
  );
};
