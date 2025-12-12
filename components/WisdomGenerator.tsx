
import React, { useState } from 'react';
import { generateWisdom } from '../services/geminiService';
import { WisdomNugget } from '../types';
import { Sparkles, Quote, Share2, Loader2, Leaf } from 'lucide-react';

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
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Input Card */}
      <div className="bg-gradient-to-br from-brand-600 to-brand-800 dark:from-brand-800 dark:to-brand-950 rounded-3xl p-8 text-white shadow-xl shadow-brand-900/10">
        <h2 className="text-2xl font-serif font-bold mb-3 flex items-center gap-3">
          <Leaf className="text-brand-200" size={24} />
          Reframe Your Mindset
        </h2>
        <p className="text-brand-100 mb-6 font-light leading-relaxed">
          Tell us what's on your mind. We'll use ancient wisdom to help you find a calmer, clearer perspective.
        </p>

        <div className="relative">
          <label htmlFor="situation-input" className="sr-only">Enter your situation</label>
          <textarea
            id="situation-input"
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            placeholder="I'm feeling overwhelmed by..."
            className="w-full bg-white/10 border border-white/10 rounded-2xl p-5 text-white placeholder-brand-200 focus:outline-none focus:ring-2 focus:ring-white/30 h-36 resize-none transition-all"
          />
          <button
            onClick={handleReframe}
            disabled={loading || !situation}
            className={`absolute bottom-4 right-4 px-6 py-2.5 bg-sand-50 text-brand-900 rounded-xl font-semibold text-sm transition-all shadow-lg
              ${loading ? 'opacity-80 cursor-not-allowed' : 'hover:bg-white hover:scale-105'}`}
            aria-label="Generate Wisdom"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Reflect'}
          </button>
        </div>
      </div>

      {/* Result Card */}
      <div aria-live="polite" aria-atomic="true">
        {wisdom && (
          <div className="animate-fade-in-up bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-10 shadow-xl border border-sand-100 dark:border-slate-700 transition-colors relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 dark:bg-brand-900/20 rounded-full blur-3xl -mr-10 -mt-10"></div>

            <div className="mb-8 text-center relative z-10">
              <Quote className="h-10 w-10 text-brand-300 dark:text-brand-700 mx-auto mb-6" aria-hidden="true" />
              <p className="text-2xl md:text-3xl font-serif text-slate-800 dark:text-sand-50 italic leading-relaxed tracking-wide">
                "{wisdom.quote}"
              </p>
              <div className="flex items-center justify-center gap-3 mt-6">
                <div className="h-px w-8 bg-brand-200 dark:bg-slate-600"></div>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  {wisdom.author}
                </p>
                <div className="h-px w-8 bg-brand-200 dark:bg-slate-600"></div>
              </div>
            </div>

            <div className="bg-sand-50 dark:bg-slate-900/50 rounded-2xl p-6 mb-8 border border-sand-100 dark:border-slate-800">
              <h4 className="font-serif font-bold text-slate-700 dark:text-sand-100 mb-2">The Perspective</h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                {wisdom.context}
              </p>
            </div>

            <div className="border-l-4 border-brand-500 bg-brand-50 dark:bg-brand-900/20 rounded-r-2xl p-6">
              <h4 className="font-bold text-brand-800 dark:text-brand-300 mb-2 text-sm uppercase tracking-wider flex items-center gap-2">
                <Sparkles size={16} aria-hidden="true" /> Actionable Step
              </h4>
              <p className="text-brand-900 dark:text-brand-100 font-medium">
                {wisdom.actionableStep}
              </p>
            </div>

            <div className="mt-8 flex justify-between items-center">
              <div className="flex gap-2 flex-wrap">
                {wisdom.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-xs rounded-full font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
              <button 
                className="text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors p-2 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                aria-label="Share this wisdom"
              >
                <Share2 size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
