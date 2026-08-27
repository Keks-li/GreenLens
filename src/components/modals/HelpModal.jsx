import React from 'react';

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in select-none">
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant w-full max-w-xl overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col">
        <div className="bg-primary px-6 py-4 text-on-primary flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[24px]">help</span>
            <h3 className="font-title-md font-bold text-white text-[18px]">
              GreenLens Command Center Manual
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-body-sm text-on-surface-variant flex-1">
          <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/60">
            <h4 className="font-bold text-on-surface text-[14px] mb-1">
              📡 Real-Time Telemetry & AI Dispatch
            </h4>
            <p className="text-[13px] leading-relaxed">
              The Command Center aggregates citizen mobile reports, thermal drone/sensor imagery, and hydraulic AI models to predict flood vulnerabilities before heavy rainfall occurs.
            </p>
          </div>

          <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/60">
            <h4 className="font-bold text-on-surface text-[14px] mb-1">
              🎛️ Supabase & Database Integration
            </h4>
            <p className="text-[13px] leading-relaxed">
              When ready to link your production PostgreSQL database, provide your Supabase URL & Key in <code>.env</code>. The schema is pre-configured in <code>src/lib/supabaseSchema.sql</code>.
            </p>
          </div>

          <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/60">
            <h4 className="font-bold text-on-surface text-[14px] mb-1">
              🔬 Digital Twin & What-If Simulations
            </h4>
            <p className="text-[13px] leading-relaxed">
              Click any drainage node on the map to test scenarios with rainfall sliders and blockage variance to plan pre-storm mitigation.
            </p>
          </div>
        </div>

        <div className="bg-surface-container-low px-6 py-3 border-t border-outline-variant flex justify-end">
          <button
            onClick={onClose}
            className="bg-primary text-on-primary px-5 py-2 rounded-xl font-label-caps text-[12px] hover:bg-surface-tint transition-all"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
