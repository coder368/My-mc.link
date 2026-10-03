import React, { useState } from 'react';
import { ServerRule, FaqItem } from '../types';
import { 
  ShieldCheck, 
  ShieldAlert, 
  HelpCircle, 
  Flame, 
  Lock, 
  MessageSquare, 
  Cpu, 
  ChevronDown, 
  ChevronUp, 
  Scale
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface RulesBentoGridProps {
  rules: ServerRule[];
  faqs: FaqItem[];
}

export const RulesBentoGrid: React.FC<RulesBentoGridProps> = ({ rules, faqs }) => {
  const [openFaqId, setOpenFaqId] = useState<string | null>(faqs[0]?.id || null);

  const toggleFaq = (id: string) => {
    sounds.playClick();
    setOpenFaqId(openFaqId === id ? null : id);
  };

  const icons = [Flame, Lock, MessageSquare, Cpu];

  return (
    <section id="rules" className="relative py-8 px-4 scroll-mt-24">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold font-mono tracking-tight text-white uppercase">
                Server Rules & Guidelines
              </h2>
            </div>
            <p className="text-zinc-400 text-xs font-mono">
              Fair play standards enforced by active moderation and rollback logging.
            </p>
          </div>
        </div>

        {/* Bento Grid: Clean borders (border-zinc-800), dark background (bg-zinc-900), safe mobile padding (p-4 sm:p-6) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rules.map((rule, idx) => {
            const isWide = idx === 0 || idx === 3;
            const spanClass = isWide ? 'md:col-span-2' : 'md:col-span-1';
            const Icon = icons[idx % icons.length];

            return (
              <div
                key={rule.id}
                className={`rounded-2xl bg-zinc-900 border border-zinc-800 p-4 sm:p-6 shadow-sm hover:border-zinc-700 transition-colors flex flex-col justify-between ${spanClass}`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-emerald-400">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                        {rule.category}
                      </span>
                    </div>
                    <span className="text-zinc-500 font-mono text-xs">#0{idx + 1}</span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">
                      {rule.title}
                    </h3>
                    <p className="text-xs leading-relaxed mt-1 text-zinc-300">
                      {rule.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center gap-2 text-[11px] font-mono text-rose-300 bg-zinc-950/60 px-3 py-1.5 rounded-lg border border-rose-900/30">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                  <span className="truncate">Penalty: {rule.punishment}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Clean FAQ Section */}
        <div className="pt-4 space-y-4">
          <div className="flex items-center gap-2 font-mono">
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {faqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden shadow-sm"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex items-center justify-between p-3.5 text-left text-xs font-semibold text-zinc-200 hover:text-white transition-colors cursor-pointer gap-2"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-3.5 pb-3.5 pt-1 text-xs text-zinc-400 border-t border-zinc-800 leading-relaxed font-sans bg-zinc-950/40">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
