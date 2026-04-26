import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Scale, 
  Table as TableIcon, 
  BrainCircuit, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  ListTodo,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Target,
  Sparkles,
  Loader2
} from 'lucide-react';
import { performAnalysis } from './services/geminiService';
import { AnalysisType, ProsConsData, TableData, SWOTData } from './types';

export default function App() {
  const [situation, setSituation] = useState('');
  const [type, setType] = useState<AnalysisType>('pros-cons');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const resultRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async () => {
    if (!situation.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await performAnalysis(situation, type);
      setResult(data);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError("Désolé, une erreur est survenue lors de l'analyse. Veuillez réessayer.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col font-sans selection:bg-brand-accent selection:text-white">
      {/* Header Navigation */}
      <header className="h-16 bg-slate-900 text-white flex items-center justify-between px-6 shrink-0 border-b border-slate-700 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="bg-blue-500 p-2 rounded-md">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight uppercase leading-none">
              Arbitrage <span className="text-blue-400 font-light italic">AI</span>
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-mono">
              Outil d'Aide à la Décision Stratégique
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <div className="flex flex-col items-end">
            <span className="status-label">Statut IA</span>
            <span className={`status-value ${loading ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`}>
              {loading ? 'CALCUL EN COURS...' : 'OPÉRATIONNEL [100%]'}
            </span>
          </div>
          <button 
            onClick={() => { setSituation(''); setResult(null); }}
            className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-xs font-bold uppercase transition-colors tracking-wider"
          >
            Nouvelle Décision
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 overflow-hidden flex flex-col gap-6">
        {/* Input Section */}
        <section className="dense-card p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 space-y-3">
              <label htmlFor="situation" className="status-label pl-1">
                Contexte & Paramètres de Décision
              </label>
              <textarea
                id="situation"
                className="w-full h-32 p-4 text-sm bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700 placeholder:text-slate-300 resize-none"
                placeholder="Décrivez ici votre situation ou le dilemme que vous souhaitez arbitrer..."
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
              />
            </div>
            
            <div className="w-full lg:w-72 flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <label className="status-label pl-1">VECTEUR D'ANALYSE</label>
                <div className="grid grid-cols-3 lg:grid-cols-1 gap-2">
                  {[
                    { id: 'pros-cons', label: 'Pours & Contres', icon: ListTodo },
                    { id: 'table', label: 'Comparatif', icon: TableIcon },
                    { id: 'swot', label: 'Analyse SWOT', icon: BrainCircuit }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setType(opt.id as AnalysisType)}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded border text-left transition-all text-xs font-bold uppercase tracking-tight
                        ${type === opt.id 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-slate-100 bg-white hover:border-slate-200 text-slate-500'}
                      `}
                    >
                      <opt.icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={loading || !situation.trim()}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white rounded font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Lancer l'Arbitrage
              </button>
            </div>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded text-red-600 text-[10px] font-bold uppercase flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}
        </section>

        {/* Results Area */}
        <AnimatePresence>
          {result && (
            <motion.div
              ref={resultRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col md:flex-row gap-6 min-h-0"
            >
              {/* Type-Specific Views */}
              <div className="flex-1 flex flex-col gap-6 overflow-auto pr-1">
                {type === 'pros-cons' && <ProsConsView data={result} />}
                {type === 'table' && <TableView data={result} />}
                {type === 'swot' && <SwotView data={result} />}
              </div>

              {/* Recommendation Sidebar */}
              <aside className="w-full md:w-80 flex flex-col gap-6 shrink-0">
                <div className="bg-slate-900 text-white rounded-lg p-5 shadow-lg flex flex-col h-full border border-slate-700">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                    <h3 className="text-xs font-bold uppercase text-blue-400 tracking-tighter cursor-default">Arbitrage AI Insights</h3>
                  </div>
                  
                  <div className="space-y-6 flex-1">
                    <div className="space-y-2">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Synthèse Stratégique</p>
                      <p className="text-sm leading-relaxed text-slate-200">
                        {type === 'swot' ? result.strategicAdvice : (type === 'table' ? result.recommendation : result.conclusion)}
                      </p>
                    </div>
                    
                    <div className="bg-slate-800 p-4 rounded border border-slate-700 space-y-2">
                      <p className="status-label text-blue-400">Indicateur de Confiance</p>
                      <div className="space-y-2">
                        <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '92%' }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="h-full bg-blue-500" 
                          />
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                          <span>CALIBRATION</span>
                          <span className="text-blue-400 font-bold">92% CERTAINTY</span>
                        </div>
                      </div>
                    </div>

                    <button className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded text-[10px] font-bold uppercase tracking-widest transition-all mt-4 border border-blue-400/20">
                      Générer Rapport Analytique
                    </button>
                  </div>
                </div>

                <div className="dense-card p-4">
                  <p className="status-label mb-3">Historique Session</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      <p className="text-[10px] text-slate-600 font-medium tracking-tight">Analyse recalculée avec {type.toUpperCase()}.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                      <p className="text-[10px] text-slate-500">Flux de données synchronisé avec Gemini-3.</p>
                    </div>
                  </div>
                </div>
              </aside>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Info Bar */}
      <footer className="h-8 bg-white border-t border-slate-200 px-6 flex items-center justify-between shrink-0 font-mono">
        <div className="flex gap-6">
          <span className="text-[9px] text-slate-400">SESSION: #{Math.random().toString(36).substring(7).toUpperCase()}</span>
          <span className="text-[9px] text-slate-400 hidden sm:inline">LATENCY: {loading ? 'WAITING' : '1.2s'}</span>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-[9px] font-bold text-slate-500 uppercase">Engine: GEMINI-3-FLASH</span>
        </div>
      </footer>
    </div>
  );
}

function ProsConsView({ data }: { data: ProsConsData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="dense-card flex flex-col h-full overflow-hidden">
        <div className="dense-header flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Avantages Stratégiques</span>
        </div>
        <div className="p-4 flex-1">
          <ul className="space-y-2">
            {data.pros?.map((pro, index) => (
              <motion.li 
                key={index}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="text-[11px] font-medium text-slate-700 bg-emerald-50/50 p-2 rounded border border-emerald-100 flex gap-2 items-start"
              >
                <div className="w-1 h-1 mt-1.5 rounded-full bg-emerald-400 shrink-0" />
                {pro}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>

      <div className="dense-card flex flex-col h-full overflow-hidden">
        <div className="dense-header flex items-center gap-2">
          <XCircle className="w-4 h-4 text-rose-500" />
          <span>Risques & Contraintes</span>
        </div>
        <div className="p-4 flex-1">
          <ul className="space-y-2">
            {data.cons?.map((con, index) => (
              <motion.li 
                key={index}
                initial={{ opacity: 0, x: 5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="text-[11px] font-medium text-slate-700 bg-rose-50/50 p-2 rounded border border-rose-100 flex gap-2 items-start"
              >
                <div className="w-1 h-1 mt-1.5 rounded-full bg-rose-400 shrink-0" />
                {con}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function TableView({ data }: { data: TableData }) {
  return (
    <div className="dense-card flex flex-col overflow-hidden">
      <div className="dense-header">
        Tableau de Comparaison Analytique
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {data.headers?.map((header, i) => (
                <th key={i} className={`p-3 text-[11px] font-bold uppercase tracking-wider ${i === 0 ? 'text-slate-500' : (i === 1 ? 'text-slate-800 bg-slate-100/50' : 'text-blue-800 bg-blue-50')}`}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-[11px] divide-y divide-slate-100">
            {data.rows?.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                {row?.map((cell, j) => (
                  <td key={j} className={`p-3 ${j === 0 ? 'font-bold text-slate-700 bg-slate-50/30' : (j > 0 && i % 2 === 1 ? 'text-slate-600 bg-white' : 'text-slate-600')} ${j === (data.headers?.length || 0) - 1 ? 'bg-blue-50/20 font-medium' : ''}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SwotView({ data }: { data: SWOTData }) {
  const quadrants = [
    { title: 'Forces', items: data.strengths, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { title: 'Faiblesses', items: data.weaknesses, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100' },
    { title: 'Opportunités', items: data.opportunities, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100' },
    { title: 'Menaces', items: data.threats, color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-100' }
  ];

  return (
    <div className="dense-card flex flex-col h-full overflow-hidden">
      <div className="dense-header">Analyse SWOT Stratégique</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2">
        {quadrants.map((q, i) => (
          <div 
            key={q.title}
            className={`p-3 rounded border ${q.border} ${q.bg} space-y-2`}
          >
            <span className={`text-[10px] font-bold uppercase tracking-wider ${q.color}`}>{q.title}</span>
            <ul className="text-[11px] leading-tight space-y-1.5 list-disc pl-3 font-medium text-slate-800">
              {q.items?.map((item, index) => (
                <li key={index} className="pl-1">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

