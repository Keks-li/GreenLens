import React, { useState, useEffect } from 'react';

export default function DispatchView({
  fieldTeams: propFieldTeams = [],
  dispatches: propDispatches = [],
  onOpenDispatchModal,
  onRefreshData
}) {
  const [teams, setTeams] = useState(propFieldTeams || []);
  const [missions, setMissions] = useState(propDispatches || []);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (propFieldTeams?.length) {
      setTeams(propFieldTeams);
    }
  }, [propFieldTeams]);

  useEffect(() => {
    if (propDispatches?.length) {
      setMissions(propDispatches);
    }
  }, [propDispatches]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="px-4 sm:px-8 py-4 sm:py-6 w-full max-w-[1440px] mx-auto space-y-6 select-none">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-primary text-on-primary px-5 py-3 rounded-xl shadow-xl border border-primary-fixed flex items-center gap-3 animate-in fade-in">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span className="text-[13px] font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-[24px]">local_shipping</span>
            <h1 className="font-headline-lg text-on-surface">Operations Dispatch &amp; Field Coordination</h1>
          </div>
          <p className="font-body-md text-on-surface-variant">
            Live database tracking of field assignments, SLA completion timers, and available heavy response rigs.
          </p>
        </div>

        <button
          onClick={() => onOpenDispatchModal && onOpenDispatchModal({ id: 'D-102', name: 'Rapid Dispatch Directive' })}
          className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-label-caps text-[12px] hover:bg-surface-tint shadow-xs transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Create New Dispatch
        </button>
      </div>

      {/* Active Missions Live SLA Board */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-title-md font-bold text-on-surface text-[18px] flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-risk-critical animate-pulse"></span>
            Active Field Missions ({missions.length} in progress)
          </h2>
          <span className="text-[11px] font-bold text-outline uppercase font-data-mono">
            Live Telemetry Sync
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {missions.map((msn) => (
            <div
              key={msn.id}
              className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/60 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-data-mono text-[11px] font-bold text-outline">{msn.id}</span>
                      <span className="bg-error-container text-on-error-container text-[10px] font-bold px-2 py-0.5 rounded font-data-mono uppercase">
                        {msn.priority}
                      </span>
                      <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded">
                        {msn.drainId}
                      </span>
                    </div>
                    <h3 className="font-title-md text-[17px] font-bold text-on-surface mt-1">
                      {msn.targetLocation}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-label-caps text-outline">SLA Deadline</span>
                    <div className="font-data-mono font-bold text-risk-critical text-[14px]">
                      {msn.timeRemaining}
                    </div>
                  </div>
                </div>

                <p className="text-[13px] text-on-surface-variant bg-surface-container-low p-3 rounded-xl border border-outline-variant/40 mb-3 leading-relaxed">
                  "{msn.directive}"
                </p>

                <div className="space-y-2 text-[12px] mb-3">
                  <div className="flex justify-between">
                    <span className="text-outline">Assigned Crew:</span>
                    <span className="font-bold text-on-surface">{msn.assignedTeam} (Lead: {msn.lead})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-outline">Equipment Deployed:</span>
                    <span className="font-semibold text-on-surface">{msn.equipment}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-outline mb-1">
                    <span>Task Progress</span>
                    <span className="font-data-mono text-primary font-bold">{msn.progress}% Completed</span>
                  </div>
                  <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${msn.progress}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-outline-variant/40">
                <button
                  onClick={() => showToast(`Radio telemetry ping sent to ${msn.assignedTeam}`)}
                  className="text-on-surface-variant hover:text-primary text-[12px] font-bold flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">podcasts</span>
                  Ping Crew Telemetry
                </button>
                <button
                  onClick={() => {
                    showToast(`✓ Mission ${msn.id} marked as Complete!`);
                    if (onRefreshData) onRefreshData();
                  }}
                  className="bg-primary text-on-primary px-4 py-1.5 rounded-xl text-[12px] font-label-caps hover:bg-surface-tint transition-all shadow-2xs cursor-pointer"
                >
                  Mark Completed
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Field Fleet Availability */}
      <div className="space-y-4 pt-4">
        <h2 className="font-title-md font-bold text-on-surface text-[18px]">
          Field Squad Readiness &amp; Availability
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {teams.map((team) => (
            <div
              key={team.id}
              className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/60 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-data-mono ${
                      team.status === 'Available'
                        ? 'bg-secondary-container text-on-secondary-container'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {team.status}
                  </span>
                  <span className="text-[12px] text-primary font-bold">★ {team.rating}</span>
                </div>

                <h4 className="font-bold text-on-surface text-[15px]">{team.name}</h4>
                <p className="text-[12px] text-on-surface-variant mb-2">Lead: {team.lead}</p>
                <div className="text-[11px] text-outline bg-surface-container-low p-2 rounded-lg border border-outline-variant/30 mb-3">
                  {team.vehicle}
                </div>
              </div>

              <button
                onClick={() => onOpenDispatchModal && onOpenDispatchModal({ id: team.id, name: team.name })}
                className="w-full bg-surface-container hover:bg-primary hover:text-white text-on-surface font-label-caps text-[11px] py-2 rounded-xl transition-all font-bold cursor-pointer"
              >
                Assign Directive
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
