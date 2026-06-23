import Dashboard from './components/Dashboard';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-violet-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 font-sans">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 premium-card rounded-none border-t-0 border-x-0 bg-white/70 dark:bg-slate-900/70 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-violet flex items-center justify-center shadow-lg shadow-violet-500/25">
              <span className="text-xl text-white">🔥</span>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight font-outfit bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-600 dark:from-violet-400 dark:via-indigo-400 dark:to-fuchsia-400 bg-clip-text text-transparent">
                Calorie<span className="font-serif italic font-normal text-violet-500 dark:text-violet-300">Diary</span>
              </h1>
              <p className="text-xs text-slate-500/80 dark:text-slate-400/70 font-medium">
                Registre sua alimentação e treinos
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 dark:text-slate-600 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            online
          </div>
        </div>
      </header>

      {/* ── Page Content ───────────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-6 sm:px-8 py-8">
        <Dashboard />
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="max-w-6xl mx-auto px-6 sm:px-8 py-6 text-center">
        <p className="text-xs text-slate-300 dark:text-slate-700">
          CalorieDiary &middot; Desenvolvido por João Pedro Toaldo &middot; CS50 2026
        </p>
      </footer>
    </div>
  );
}

