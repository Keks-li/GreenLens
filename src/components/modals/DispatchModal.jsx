import React, { useState, useEffect } from 'react';

export default function DispatchModal({
  isOpen,
  onClose,
  targetItem,
  fieldTeamsList = [],
  onConfirmDispatch
}) {
  if (!isOpen || !targetItem) return null;

  const teams = fieldTeamsList || [];
  const [selectedTeamId, setSelectedTeamId] = useState(teams[0]?.id || '');
  const [priority, setPriority] = useState(targetItem.riskScore >= 90 ? 'Critical' : 'High');
  const [deadlineHours, setDeadlineHours] = useState(4);
  const [instructions, setInstructions] = useState(
    targetItem.suggestedEquipment
      ? `Deploy ${targetItem.suggestedEquipment}. Focus on clearing sediment and single-use plastics prior to 18h rainfall.`
      : 'Urgent clearance required. Restore full hydraulic capacity.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (teams.length > 0) {
      const availableTeam = teams.find(t => t.status === 'Available') || teams[0];
      setSelectedTeamId(availableTeam.id);
    }
  }, [teams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfirmDispatch({
        drainId: targetItem.drainId || targetItem.id,
        teamId: selectedTeamId,
        priority,
        deadlineHours,
        instructions
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in select-none">
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant w-full max-w-xl overflow-hidden animate-in zoom-in-95">
        {/* Modal Header */}
        <div className="bg-primary px-6 py-4 text-on-primary flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10">
              <span className="material-symbols-outlined text-[24px]">local_shipping</span>
            </div>
            <div>
              <h3 className="font-title-md font-bold text-white text-[18px]">
                Dispatch Field Operations
              </h3>
              <p className="text-[12px] text-white/80">
                Direct municipal cleanup crew to targeted drainage asset
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Target Summary Card */}
          <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/60">
            <div className="flex justify-between items-start mb-1">
              <span className="font-bold text-on-surface text-[15px]">
                {targetItem.drainName || targetItem.name || targetItem.id}
              </span>
              <span className="bg-error-container text-on-error-container text-[11px] font-bold px-2 py-0.5 rounded font-data-mono">
                RISK {targetItem.riskScore || 90}/100
              </span>
            </div>
            <div className="text-[12px] text-on-surface-variant mb-2">
              Sector: {targetItem.sector || 'Winneba Municipality'}
            </div>
            {targetItem.description && (
              <p className="text-[12px] text-on-surface-variant italic bg-white/70 p-2.5 rounded-lg border border-outline-variant/40">
                "{targetItem.description}"
              </p>
            )}
          </div>

          {/* Field Team Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-body-sm font-semibold text-on-surface text-[13px]">
                Select Field Team (Live Database)
              </label>
              <span className="text-[11px] text-primary font-bold">
                {teams.length} Squads Registered
              </span>
            </div>
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-3.5 py-2.5 text-body-sm focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer mb-2.5"
            >
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name} ({team.status} • {team.membersCount} crew • {team.vehicle})
                </option>
              ))}
            </select>

            {/* Selected Squad Direct Contact HUD */}
            {(() => {
              const currentTeam = teams.find((t) => t.id === selectedTeamId) || teams[0];
              if (!currentTeam) return null;
              return (
                <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200/90 flex items-center justify-between gap-3 text-[12px]">
                  <div className="min-w-0">
                    <div className="font-bold text-emerald-950 truncate">
                      Squad Lead: {currentTeam.lead} ({currentTeam.name})
                    </div>
                    <div className="text-[11px] text-emerald-800 font-data-mono mt-0.5">
                      📞 {currentTeam.contact} • 📻 {currentTeam.radioChannel || 'VHF Ch 01 (Command-Tac)'}
                    </div>
                  </div>
                  {currentTeam.contact && (
                    <a
                      href={`tel:${currentTeam.contact.replace(/\s+/g, '')}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] shrink-0 shadow-2xs transition-transform hover:scale-105"
                      title="Call squad lead directly"
                    >
                      <span className="material-symbols-outlined text-[14px]">call</span>
                      <span>Call Lead</span>
                    </a>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Priority & Deadline Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-body-sm font-semibold text-on-surface mb-1.5 text-[13px]">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-3.5 py-2 text-body-sm focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="Critical">🔴 Critical (Immediate)</option>
                <option value="High">🟠 High Priority (&lt; 6 hrs)</option>
                <option value="Medium">🟡 Moderate (&lt; 24 hrs)</option>
              </select>
            </div>

            <div>
              <label className="block text-body-sm font-semibold text-on-surface mb-1.5 text-[13px]">
                Completion Window
              </label>
              <select
                value={deadlineHours}
                onChange={(e) => setDeadlineHours(Number(e.target.value))}
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-3.5 py-2 text-body-sm focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value={2}>2 Hours (Emergency)</option>
                <option value={4}>4 Hours (Pre-Storm)</option>
                <option value={8}>8 Hours (Standard)</option>
                <option value={24}>24 Hours</option>
              </select>
            </div>
          </div>

          {/* Directive Instructions */}
          <div>
            <label className="block text-body-sm font-semibold text-on-surface mb-1.5 text-[13px]">
              Officer Directive & Equipment Notes
            </label>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Enter special instructions, equipment needs, or access routes..."
              className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 text-body-sm focus:ring-2 focus:ring-primary focus:outline-none resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-on-surface-variant font-label-caps text-[12px] hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-label-caps text-[12px] hover:bg-surface-tint shadow-sm transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  Dispatching to Supabase...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  Confirm & Dispatch Team
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
