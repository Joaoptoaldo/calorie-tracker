import { useState } from 'react';
import Dashboard from './components/Dashboard';
import LogForm from './components/LogForm';

export default function App() {
  // Incrementing this key causes Dashboard to re-fetch data after a new log is saved
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
              Diário de Treinos & Calorias
            </h1>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Registre sua alimentação e seus treinos
            </p>
          </div>
        </div>
      </header>

      {/* Main layout: form (left) + dashboard (right) */}
      <main className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">
        <aside>
          <LogForm onSuccess={() => setRefreshKey((k) => k + 1)} />
        </aside>
        <section>
          <Dashboard refreshKey={refreshKey} />
        </section>
      </main>
    </div>
  );
}
