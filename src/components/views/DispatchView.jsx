import React, { useState, useEffect } from 'react';

export default function DispatchView({
  fieldTeams: propFieldTeams = [],
  dispatches: propDispatches = [],
  onOpenDispatchModal,
  onOpenCreateTeam,
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

        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          {onOpenCreateTeam && (
            <button
              onClick={onOpenCreateTeam}
              className="bg-surface-container text-on-surface hover:bg-surface-container-high px-4 py-2.5 rounded-xl font-label-caps text-[12px] transition-all flex items-center gap-1.5 cursor-pointer border border-outline-variant/60 font-bold"
            >
              <span className="material-symbols-outlined text-[18px]">group_add</span>
              Add Dispatch Team
            </button>
          )}

          <button
            onClick={() => onOpenDispatchModal && onOpenDispatchModal({ name: 'Municipal Operations Dispatch' })}
            className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-label-caps text-[12px] hover:bg-surface-tint shadow-xs transition-all flex items-center gap-2 cursor-pointer font-bold"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create New Dispatch
          </button>
        </div>
      </div>

      {/* Active Missions Live SLA Board */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-title-md font-bold text-on-surface text-[18px] flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping"></span>
            Active Field Missions ({missions.length} in progress)
          </h2>
          <span className="text-[10.5px] font-bold text-primary bg-primary-container px-3 py-1 rounded-full uppercase font-data-mono">
            Live Telemetry Sync
          </span>
        </div>

        {missions.length === 0 ? (
          <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/60 text-center space-y-2 shadow-card-soft">
            <span className="material-symbols-outlined text-outline text-[36px]">assignment_turned_in</span>
            <h4 className="font-title-md font-bold text-on-surface text-[15px]">No Active Field Missions</h4>
            <p className="text-on-surface-variant text-[12.5px] max-w-sm mx-auto">
              All field dispatches have been resolved or no operations are currently underway.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {missions.map((msn) => (
            <div
              key={msn.id}
              className="bg-surface-container-lowest p-5 sm:p-6 rounded-3xl border border-outline-variant/60 shadow-card-soft hover:shadow-card-hover transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-data-mono text-[11px] font-bold text-outline">{msn.id}</span>
                      <span className="bg-error-container text-on-error-container text-[10px] font-extrabold px-2.5 py-0.5 rounded-full font-data-mono uppercase">
                        {msn.priority}
                      </span>
                      <span className="bg-primary-container text-on-primary-container text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        {msn.drainId}
                      </span>
                    </div>
                    <h3 className="font-title-md text-[17px] font-bold text-on-surface mt-1.5">
                      {msn.targetLocation}
                    </h3>
                  </div>

                  <div className="text-right bg-surface-container-low px-3 py-1.5 rounded-2xl border border-outline-variant/40">
                    <span className="text-[9.5px] uppercase font-label-caps text-outline block font-bold">SLA Remaining</span>
                    <div className="font-data-mono font-extrabold text-risk-critical text-[13.5px]">
                      {msn.timeRemaining}
                    </div>
                  </div>
                </div>

                <p className="text-[12.5px] text-on-surface-variant bg-[#f4f7f4] p-3 rounded-2xl border border-[#d5e2d6] mb-3 leading-relaxed">
                  "{msn.directive}"
                </p>

                <div className="space-y-1.5 text-[12px] mb-4">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant font-medium">Assigned Squad:</span>
                    <span className="font-bold text-on-surface">{msn.assignedTeam} (Lead: {msn.lead})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant font-medium">Equipment:</span>
                    <span className="font-semibold text-on-surface">{msn.equipment}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-on-surface-variant mb-1.5">
                    <span>Task Progress</span>
                    <span className="font-data-mono text-primary font-bold">{msn.progress}% Completed</span>
                  </div>
                  <div className="w-full bg-[#e8f0e8] rounded-full h-2 overflow-hidden">
                    <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${msn.progress}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-outline-variant/40">
                <button
                  onClick={() => showToast(`Radio telemetry ping sent to ${msn.assignedTeam}`)}
                  className="text-on-surface-variant hover:text-primary text-[12px] font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">podcasts</span>
                  Ping Crew
                </button>
                <button
                  onClick={() => {
                    showToast(`✓ Mission ${msn.id} marked as Complete!`);
                    if (onRefreshData) onRefreshData();
                  }}
                  className="bg-primary text-white px-4 py-2 rounded-full text-[11.5px] font-label-caps hover:bg-primary/90 transition-all shadow-2xs font-bold cursor-pointer"
                >
                  Mark Complete
                </button>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* Field Fleet Availability */}
      <div className="space-y-4 pt-2">
        <h2 className="font-title-md font-bold text-on-surface text-[18px]">
          Field Squad Readiness &amp; Availability
        </h2>

        {teams.length === 0 ? (
          <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/60 text-center space-y-2 shadow-card-soft">
            <span className="material-symbols-outlined text-outline text-[36px]">local_shipping</span>
            <h4 className="font-title-md font-bold text-on-surface text-[15px]">No Field Squads Available</h4>
            <p className="text-on-surface-variant text-[12.5px] max-w-sm mx-auto">
              No registered response units found in the fleet roster. Register a new squad to dispatch directives.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {teams.map((team) => (
              <div
                key={team.id}
                className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/60 shadow-card-soft hover:shadow-card-hover transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase font-data-mono ${
                        team.status === 'Available'
                          ? 'bg-primary-container text-on-primary-container border border-[#bbf7d0]'
                          : 'bg-[#ffedd5] text-risk-high border border-[#fed7aa]'
                      }`}
                    >
                      {team.status}
                    </span>
                    <span className="text-[12px] text-primary font-bold bg-primary-container/30 px-2 py-0.5 rounded-full">★ {team.rating}</span>
                  </div>

                  <h4 className="font-bold text-on-surface text-[14.5px] leading-snug">{team.name}</h4>
                  <p className="text-[11.5px] text-on-surface-variant mb-1.5">Lead: <strong>{team.lead}</strong></p>
                  <div className="text-[11px] text-outline bg-surface-container-low p-2 rounded-xl border border-outline-variant/30 mb-2 font-medium truncate">
                    {team.vehicle}
                  </div>
                  {team.contact && (
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-data-mono text-primary font-bold">{team.contact}</span>
                      <a
                        href={`tel:${team.contact.replace(/\s+/g, '')}`}
                        className="p-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 cursor-pointer flex items-center justify-center transition-all"
                        title={`Call ${team.lead}`}
                      >
                        <span className="material-symbols-outlined text-[14px] text-emerald-700">call</span>
                      </a>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onOpenDispatchModal && onOpenDispatchModal({ id: team.id, name: team.name, drainName: `Directive to ${team.name}` })}
                  className="w-full bg-surface-container hover:bg-primary hover:text-white text-on-surface font-label-caps text-[11px] py-2 rounded-xl transition-all font-bold cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[15px]">send</span>
                  <span>Assign Directive</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
