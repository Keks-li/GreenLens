import React, { useState, useEffect } from 'react';

export default function FieldTeamsView({ fieldTeams: propTeams = [], onOpenDispatch, onRefreshData }) {
  const [teams, setTeams] = useState(propTeams || []);

  useEffect(() => {
    if (propTeams) {
      setTeams(propTeams);
    }
  }, [propTeams]);

  return (
    <div className="px-4 sm:px-8 py-4 sm:py-6 w-full max-w-[1440px] mx-auto space-y-6 select-none">
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
            className="bg-surface-container-lowest p-6 rounded-3xl shadow-card-soft border border-outline-variant/60 hover:shadow-card-hover transition-all flex flex-col justify-between"
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
                    <p className="text-[12px] text-on-surface-variant mt-0.5 font-medium">
                      Squad Lead: <strong className="text-on-surface">{team.lead}</strong>
                    </p>
                  </div>
                </div>

                <span
                  className={`px-3 py-0.5 rounded-full text-[10.5px] font-extrabold uppercase tracking-wider font-data-mono ${
                    team.status === 'Available'
                      ? 'bg-primary-container text-on-primary-container border border-[#bbf7d0]'
                      : 'bg-[#ffedd5] text-risk-high border border-[#fed7aa]'
                  }`}
                >
                  {team.status}
                </span>
              </div>

              {/* Rig Vehicle Preview */}
              {team.vehicleImageUrl && (
                <div className="relative rounded-2xl overflow-hidden h-36 mb-4 border border-outline-variant/50 bg-surface-container">
                  <img
                    src={team.vehicleImageUrl}
                    alt={team.vehicle}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"></div>
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-[12px] flex justify-between items-center border border-white/15">
                    <span className="font-semibold">{team.vehicle}</span>
                    <span className="text-primary-fixed font-bold">{team.membersCount} Crew Members</span>
                  </div>
                </div>
              )}

              {/* Team Specs */}
              <div className="space-y-2 text-[12.5px] bg-[#f4f7f4] p-4 rounded-2xl border border-[#d5e2d6] mb-4">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant font-medium">Specialization:</span>
                  <span className="font-bold text-on-surface text-right">{team.specialization}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant font-medium">Current Location:</span>
                  <span className="font-semibold text-on-surface">{team.currentLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant font-medium">Performance Rating:</span>
                  <span className="font-extrabold text-primary font-data-mono">★ {team.rating} / 5.0</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-outline-variant/40">
              <span className="text-[12px] text-on-surface-variant font-semibold">📞 {team.contact}</span>
              <button
                onClick={() => onOpenDispatch && onOpenDispatch({ id: team.id, name: team.name })}
                className="bg-primary text-white px-4 py-2 rounded-full text-[11.5px] font-label-caps hover:bg-primary/90 shadow-2xs transition-all flex items-center gap-1.5 font-bold cursor-pointer"
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
