import React, { useState } from 'react';
import { generateWisdom } from '../services/geminiService';
import { WisdomNugget } from '../types';
import { Sparkles, Quote, Share2, Loader2 } from 'lucide-react';

export const WisdomGenerator: React.FC = () => {
  const [situation, setSituation] = useState('');
  const [wisdom, setWisdom] = useState<WisdomNugget | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReframe = async () => {
    if (!situation.trim()) return;
    setLoading(true);
    try {
      const result = await generateWisdom(situation);
      setWisdom(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Sparkles className="text-yellow-300" />
          Reframe Your Mindset
        </h2>
        <p className="text-indigo-100 mb-6">
          Tell us what's on your mind, and let AI help you find a new perspective rooted in wisdom.
        </p>

        <div className="relative">
          <textarea
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            placeholder="I'm feeling overwhelmed by my workload..."
            className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/30 h-32 resize-none"
          />
          <button
            onClick={handleReframe}
            disabled={loading || !situation}
            className={`absolute bottom-4 right-4 px-4 py-2 bg-white text-indigo-600 rounded-lg font-semibold text-sm transition-all
              ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-50 shadow-md'}`}
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Get Wisdom'}
          </button>
        </div>
      </div>

      {wisdom && (
        <div className="animate-fade-in-up bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-100 dark:border-slate-700 transition-colors">
          <div className="mb-6 text-center">
            <Quote className="h-8 w-8 text-brand-500 mx-auto mb-4 opacity-50" />
            <p className="text-xl md:text-2xl font-serif text-slate-800 dark:text-slate-100 italic leading-relaxed">
              "{wisdom.quote}"
            </p>
            <p className="mt-4 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              — {wisdom.author}
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-5 mb-6">
            <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">The Perspective</h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
              {wisdom.context}
            </p>
          </div>

          <div className="border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 rounded-r-xl p-5">
            <h4 className="font-bold text-green-800 dark:text-green-400 mb-1 text-sm uppercase">Actionable Step</h4>
            <p className="text-green-900 dark:text-green-200 font-medium">
              {wisdom.actionableStep}
            </p>
          </div>

          <div className="mt-6 flex justify-between items-center">
            <div className="flex gap-2">
              {wisdom.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-xs rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
            <button className="text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
              <Share2 size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};