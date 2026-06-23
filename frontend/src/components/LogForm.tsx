import { useState } from 'react';

// Base URL for the Flask API
const API_URL = 'http://localhost:5000/api';

// Category options shown in the UI
const CATEGORIES = [
  { value: 'food', label: '🍽️ Alimentação', hint: 'Valor positivo → calorias ingeridas' },
  { value: 'workout', label: '🏋️ Treino', hint: 'Valor positivo → calorias queimadas' },
];

type LogFormProps = {
  /**
   * Called after a successful log creation so the parent can refresh data.
   */
  onSuccess?: () => void;
};

export default function LogForm({ onSuccess }: LogFormProps) {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'food' | 'workout'>('food');
  const [calories, setCalories] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const selectedCategory = CATEGORIES.find((c) => c.value === category)!;

  /** Handles form submission. Prevents page reload. */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    const caloriesNum = parseInt(calories, 10);
    if (!description.trim()) {
      setError('A descrição é obrigatória.');
      return;
    }
    if (isNaN(caloriesNum) || caloriesNum <= 0) {
      setError('Informe um valor de calorias válido (número positivo).');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: description.trim(),
          category,
          calories: caloriesNum,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao salvar o registro');
      }

      // Reset form on success
      setDescription('');
      setCalories('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message ?? 'Erro de comunicação com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-800">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-5 flex items-center gap-2">
        <span>📝</span> Novo Registro
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4" id="log-form">
        {/* Category toggle */}
        <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              id={`category-${cat.value}`}
              onClick={() => setCategory(cat.value as 'food' | 'workout')}
              className={`flex-1 py-2.5 text-sm font-semibold transition-all duration-200 ${
                category === cat.value
                  ? 'bg-violet-600 text-white shadow-inner'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 -mt-2">{selectedCategory.hint}</p>

        {/* Description field */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Descrição
          </label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={category === 'food' ? 'Ex: Frango grelhado com arroz' : 'Ex: Corrida 30 min'}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
          />
        </div>

        {/* Calories field */}
        <div>
          <label htmlFor="calories" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Calorias (kcal)
          </label>
          <input
            id="calories"
            type="number"
            min="1"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="Ex: 450"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
          />
        </div>

        {/* Feedback messages */}
        {error && (
          <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3">
            <span>✅</span>
            <span>Registro adicionado com sucesso!</span>
          </div>
        )}

        {/* Submit button */}
        <button
          id="submit-log"
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-violet-500/30"
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : null}
          {loading ? 'Salvando...' : 'Salvar Registro'}
        </button>
      </form>
    </div>
  );
}
