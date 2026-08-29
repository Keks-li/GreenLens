import React, { useState, useEffect } from 'react';

export default function FieldTeamsView({ fieldTeams: propTeams = [], onOpenDispatch, onRefreshData }) {
  const [teams, setTeams] = useState(propTeams || []);

  useEffect(() => {
    if (propTeams) {
      setTeams(propTeams);
    }
  }, [propTeams]);

  return (
    <div className="px-8 py-6 w-full max-w-[1440px] mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-[24px]">groups</span>
            <h1 className="font-headline-lg text-on-surface">Field Operations Teams Roster</h1>
          </div>
          <p className="font-body-md text-on-surface-variant">
            Live database registry of personnel availability, specialized rigs, equipment inventory, and operational track records.
          </p>
        </div>
      </div>

      {/* Grid of Teams with Clear Photos & Rig Images */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teams.map((team) => (
          <div
            key={team.id}
            className="bg-surface-container-lowest/90 backdrop-blur-md p-6 rounded-3xl shadow-xs border border-outline-variant/60 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Team Lead & Status Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={team.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'}
                    alt={team.lead}
                    className="w-13 h-13 rounded-2xl object-cover border-2 border-primary shadow-xs"
                  />
                  <div>
                    <h3 className="font-title-md text-[18px] font-bold text-on-surface leading-tight">
                      {team.name}
                    </h3>
                    <p className="text-[12px] text-on-surface-variant mt-0.5">
                      Squad Lead: <span className="font-semibold text-on-surface">{team.lead}</span>
                    </p>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider font-data-mono ${
                    team.status === 'Available'
                      ? 'bg-secondary-container text-on-secondary-container'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {team.status}
                </span>
              </div>

              {/* Rig Vehicle Preview with Transparent Overlays */}
              {team.vehicleImageUrl && (
                <div className="relative rounded-2xl overflow-hidden h-36 mb-4 border border-outline-variant/50 bg-surface-container">
                  <img
                    src={team.vehicleImageUrl}
                    alt={team.vehicle}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-[12px] flex justify-between items-center border border-white/15">
                    <span className="font-semibold">{team.vehicle}</span>
                    <span className="text-primary-fixed font-bold">{team.membersCount} Crew Members</span>
                  </div>
                </div>
              )}

              {/* Team Specs */}
              <div className="space-y-2 text-[13px] bg-surface-container-low/70 backdrop-blur-xs p-4 rounded-2xl border border-outline-variant/40 mb-4">
                <div className="flex justify-between">
                  <span className="text-outline font-medium">Specialization:</span>
                  <span className="font-semibold text-on-surface text-right">{team.specialization}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline font-medium">Current Location:</span>
                  <span className="font-semibold text-on-surface">{team.currentLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline font-medium">Performance Rating:</span>
                  <span className="font-bold text-primary font-data-mono">★ {team.rating} / 5.0</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-outline-variant/40">
              <span className="text-[12px] text-on-surface-variant font-medium">📞 {team.contact}</span>
              <button
                onClick={() => onOpenDispatch && onOpenDispatch({ id: team.id, name: team.name })}
                className="bg-primary text-on-primary px-4 py-2 rounded-xl text-[12px] font-label-caps hover:bg-surface-tint shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
                Dispatch Directive
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
