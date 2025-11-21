import React, { useState, useMemo } from 'react';
import { StatTable } from './components/StatTable';
import { Charts } from './components/Charts';
import { analyzeDataWithGemini } from './services/geminiService';
import { ClassRow, StatResult } from './types';
import { 
  Sigma, 
  TrendingUp, 
  BrainCircuit, 
  RotateCcw,
  Loader2,
  GraduationCap
} from 'lucide-react';

// Initial data from user prompt
const INITIAL_ROWS: ClassRow[] = [
  { id: '1', lower: 2, upper: 3, frequency: 5 },
  { id: '2', lower: 3, upper: 4, frequency: 11 },
  { id: '3', lower: 4, upper: 5, frequency: 25 },
  { id: '4', lower: 5, upper: 6, frequency: 2 },
];

const App: React.FC = () => {
  const [rows, setRows] = useState<ClassRow[]>(INITIAL_ROWS);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Derived state: Calculate statistics automatically
  const stats: StatResult = useMemo(() => {
    let totalFrequency = 0;
    let totalProduct = 0;

    const processedRows = rows.map(row => {
      const center = (row.lower + row.upper) / 2;
      const product = center * row.frequency;
      totalFrequency += row.frequency;
      totalProduct += product;
      return { ...row, center, product };
    });

    const mean = totalFrequency > 0 ? totalProduct / totalFrequency : 0;

    return {
      totalFrequency,
      totalProduct,
      mean,
      rows: processedRows
    };
  }, [rows]);

  const handleReset = () => {
    if (window.confirm("Voulez-vous vraiment réinitialiser le tableau ?")) {
      setRows(INITIAL_ROWS);
      setAiAnalysis(null);
    }
  };

  const handleAiAnalysis = async () => {
    if (!process.env.API_KEY) {
      alert("Veuillez configurer la clé API Gemini dans l'environnement.");
      return;
    }
    setIsAnalyzing(true);
    const result = await analyzeDataWithGemini(stats);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <Sigma className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">StatMaster</h1>
              <p className="text-xs text-slate-500 hidden sm:block">Calculateur de Moyenne & Analyse</p>
            </div>
          </div>
          <button 
            onClick={handleReset}
            className="text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-md transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Réinitialiser</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Mean Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp className="w-24 h-24 text-indigo-600" />
            </div>
            <h3 className="text-sm font-medium text-indigo-500 uppercase tracking-wide">Moyenne (<span className="italic">x̄</span>)</h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-slate-800">
                {stats.mean.toFixed(3)}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-2">
              Calculée sur {stats.totalFrequency} observations
            </p>
          </div>

          {/* Total Frequency Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Effectif Total (N)</h3>
            <div className="mt-2 text-3xl font-bold text-slate-800">
              {stats.totalFrequency}
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-4">
              <div className="bg-slate-400 h-1.5 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>

          {/* Sum Product Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Somme des Produits (Σ)</h3>
            <div className="mt-2 text-3xl font-bold text-slate-800">
              {stats.totalProduct.toFixed(2)}
            </div>
             <p className="text-xs text-slate-400 mt-4 font-mono">
              Σ(xi × ni)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Data Table */}
          <div className="lg:col-span-2 space-y-6">
             <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 text-blue-800 text-sm mb-4">
                <GraduationCap className="w-5 h-5 flex-shrink-0" />
                <p>
                  <strong>Formule utilisée :</strong> Moyenne (x̄) = (Somme des [Centre de classe × Effectif]) ÷ Effectif Total.
                  <br />
                  Les centres de classes (xi) sont calculés automatiquement : (Borne Inf + Borne Sup) / 2.
                </p>
             </div>
            
            <StatTable rows={rows} setRows={setRows} stats={stats} />
            
            {/* AI Analysis Section */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl shadow-lg text-white overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5" />
                    Analyse Intelligente
                  </h3>
                  <button
                    onClick={handleAiAnalysis}
                    disabled={isAnalyzing}
                    className={`px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${isAnalyzing ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyse en cours...
                      </>
                    ) : (
                      "Demander à Gemini"
                    )}
                  </button>
                </div>
                
                <div className="bg-black/20 rounded-lg p-4 min-h-[100px] text-indigo-50 text-sm leading-relaxed">
                  {aiAnalysis ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <div dangerouslySetInnerHTML={{ 
                        __html: aiAnalysis.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                      }} />
                    </div>
                  ) : (
                    <p className="italic opacity-60 text-center py-4">
                      Cliquez sur le bouton pour obtenir une interprétation pédagogique de vos données par l'IA.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Charts */}
          <div className="lg:col-span-1 h-full min-h-[400px] sticky top-24">
            <Charts stats={stats} />
          </div>
        </div>

      </main>
    </div>
  );
};

export default App;
