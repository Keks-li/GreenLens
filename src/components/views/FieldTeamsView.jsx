import React, { useState, useEffect } from 'react';

export default function FieldTeamsView({ fieldTeams: propTeams = [], onOpenDispatch, onRefreshData }) {
  const [teams, setTeams] = useState(propTeams || []);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    if (propTeams) {
      setTeams(propTeams);
    }
  }, [propTeams]);

  const handleCopyPhone = (team) => {
    if (team.contact) {
      navigator.clipboard?.writeText(team.contact);
      setCopiedId(team.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  return (
    <div className="px-4 sm:px-8 py-4 sm:py-6 w-full max-w-[1440px] mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-[24px]">groups</span>
            <h1 className="font-headline-lg text-on-surface font-bold text-[24px] sm:text-[28px]">
              Field Operations &amp; Response Squads
            </h1>
          </div>
          <p className="font-body-md text-on-surface-variant text-[13.5px]">
            Live municipal registry of response squads, Bus Stop Boys rapid desilting crews, specialized rigs, and direct admin dispatch telephone lines.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-primary/10 text-primary border border-primary/20 px-3.5 py-1.5 rounded-full font-bold text-[12px] font-data-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
            <span>{teams.length} Squads Online</span>
          </span>
        </div>
      </div>

      {/* Grid of Teams with Clear Photos & Rig Images */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teams.map((team) => {
          const isBsb = team.id === 'team-bsb' || team.name?.includes('Bus Stop');
          const cleanPhone = (team.contact || '+233248194022').replace(/\s+/g, '');

          return (
            <div
              key={team.id}
              className={`bg-surface-container-lowest p-6 rounded-3xl shadow-card-soft border hover:shadow-card-hover transition-all flex flex-col justify-between ${
                isBsb ? 'border-primary/60 ring-2 ring-primary/20' : 'border-outline-variant/60'
              }`}
            >
              <div>
                {/* Team Lead & Status Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={team.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'}
                      alt={team.lead}
                      className="w-13 h-13 rounded-2xl object-cover border-2 border-primary shadow-xs shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-title-md text-[17px] sm:text-[18px] font-bold text-on-surface leading-tight">
                          {team.name}
                        </h3>
                        {isBsb && (
                          <span className="bg-primary text-white text-[9.5px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Community Vanguard
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-on-surface-variant mt-0.5 font-medium">
                        Squad Lead: <strong className="text-on-surface">{team.lead}</strong>
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-0.5 rounded-full text-[10.5px] font-extrabold uppercase tracking-wider font-data-mono shrink-0 ${
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
                      <span className="font-semibold truncate">{team.vehicle}</span>
                      <span className="text-primary-fixed font-bold shrink-0">{team.membersCount} Crew</span>
                    </div>
                  </div>
                )}

                {/* Team Specs */}
                <div className="space-y-2 text-[12.5px] bg-[#f4f7f4] p-4 rounded-2xl border border-[#d5e2d6] mb-4">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-on-surface-variant font-medium shrink-0">Specialization:</span>
                    <span className="font-bold text-on-surface text-right">{team.specialization}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-on-surface-variant font-medium shrink-0">Current Base:</span>
                    <span className="font-semibold text-on-surface truncate">{team.currentLocation}</span>
                  </div>
                  {team.radioChannel && (
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-on-surface-variant font-medium shrink-0">Radio Comms:</span>
                      <span className="font-bold text-primary font-data-mono">{team.radioChannel}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant font-medium">Performance Rating:</span>
                    <span className="font-extrabold text-primary font-data-mono">★ {team.rating} / 5.0</span>
                  </div>
                </div>
              </div>

              {/* Direct Telephone Calling Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-outline-variant/40">
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${cleanPhone}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[12px] transition-all hover:scale-[1.02] active:scale-95 shadow-2xs cursor-pointer"
                    title={`Click to call ${team.lead} directly`}
                  >
                    <span className="material-symbols-outlined text-[16px] text-emerald-700">call</span>
                    <span>Call Squad Lead</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleCopyPhone(team)}
                    className="px-2.5 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface text-[11.5px] font-data-mono font-semibold transition-colors cursor-pointer border border-outline-variant/60"
                    title="Copy Phone Number"
                  >
                    {copiedId === team.id ? '✓ Copied' : team.contact}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenDispatch && onOpenDispatch({ id: team.id, name: team.name, drainName: `Direct Assignment to ${team.name}` })}
                  className="bg-primary hover:bg-primary/95 text-white px-4 py-2 rounded-xl text-[11.5px] font-label-caps shadow-2xs hover:shadow-xs transition-all flex items-center gap-1.5 font-bold cursor-pointer hover:scale-[1.02] active:scale-95 whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  <span>Dispatch Directive</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
