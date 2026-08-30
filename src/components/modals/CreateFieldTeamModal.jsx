import React, { useState } from 'react';

const AVATAR_PRESETS = [
  { label: 'Captain 1', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' },
  { label: 'Captain 2', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80' },
  { label: 'Captain 3', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80' },
  { label: 'Captain 4', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' },
  { label: 'Captain 5', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80' }
];

const RIG_PRESETS = [
  { label: 'Flatbed & Desilting Jet', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80' },
  { label: 'Heavy Vac-Jet Tanker', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156a?auto=format&fit=crop&w=600&q=80' },
  { label: 'Heavy Tipper Truck', url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80' },
  { label: 'Excavator & Lowbed', url: 'https://images.unsplash.com/photo-1580901368919-7738efb0f87e?auto=format&fit=crop&w=600&q=80' },
  { label: 'Utility Rapid Van', url: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=600&q=80' }
];

export default function CreateFieldTeamModal({ isOpen, onClose, onCreateTeam }) {
  const [name, setName] = useState('');
  const [lead, setLead] = useState('');
  const [contact, setContact] = useState('+233 ');
  const [specialization, setSpecialization] = useState('High-Density Urban Drainage & Rapid Sludge Desilting');
  const [vehicle, setVehicle] = useState('Flatbed Truck + Desilting Jet (GH-8820-25)');
  const [membersCount, setMembersCount] = useState(8);
  const [currentLocation, setCurrentLocation] = useState('Winneba Municipal Central Depot');
  const [avatarUrl, setAvatarUrl] = useState(AVATAR_PRESETS[0].url);
  const [vehicleImageUrl, setVehicleImageUrl] = useState(RIG_PRESETS[0].url);
  const [status, setStatus] = useState('Available');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !lead.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreateTeam({
        name: name.trim(),
        lead: lead.trim(),
        contact: contact.trim() || '+233 24 000 0000',
        specialization,
        vehicle,
        membersCount: Number(membersCount) || 6,
        currentLocation,
        avatarUrl,
        vehicleImageUrl,
        status,
        rating: 5.0
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in select-none">
      <div className="bg-surface-container-lowest rounded-3xl shadow-2xl border border-outline-variant/60 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-primary px-6 py-5 text-on-primary flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[24px]">group_add</span>
            </div>
            <div>
              <h3 className="font-title-md font-bold text-white text-[18px]">
                Register New Dispatch Squad
              </h3>
              <p className="text-[12px] text-white/80">
                Provision a field team, assign equipment rigs, and enable 1-click administrative dispatch.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Squad & Captain Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-bold text-on-surface mb-1.5">
                Squad / Team Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Bus Stop Boys Rapid Unit"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-3.5 py-2.5 text-[13.5px] focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-on-surface mb-1.5">
                Squad Captain / Lead *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Kwame Appiah (Captain)"
                value={lead}
                onChange={(e) => setLead(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-3.5 py-2.5 text-[13.5px] focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Contact & Crew Count */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[13px] font-bold text-on-surface mb-1.5">
                Direct Contact Phone *
              </label>
              <input
                type="text"
                required
                placeholder="+233 24 819 4022"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-3.5 py-2.5 text-[13.5px] font-data-mono focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-on-surface mb-1.5">
                Crew Members
              </label>
              <input
                type="number"
                min={2}
                max={50}
                value={membersCount}
                onChange={(e) => setMembersCount(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-3.5 py-2.5 text-[13.5px] focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-on-surface mb-1.5">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-3.5 py-2.5 text-[13px] focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
              >
                <option value="Available">🟢 Available</option>
                <option value="Standby">🟡 Standby</option>
                <option value="On Mission">🔵 On Mission</option>
              </select>
            </div>
          </div>

          {/* Specialization & Rig Vehicle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-bold text-on-surface mb-1.5">
                Squad Specialization
              </label>
              <select
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-3.5 py-2.5 text-[12.5px] focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
              >
                <option value="High-Density Urban Drainage & Rapid Sludge Desilting">
                  High-Density Urban Drainage & Rapid Desilting
                </option>
                <option value="Hydro-jetting, Culvert Flushing & Sump Evacuation">
                  Hydro-jetting, Culvert Flushing & Sump Evacuation
                </option>
                <option value="Manual Channel Desilting & Trash Sieve Extraction">
                  Manual Channel Desilting & Trash Extraction
                </option>
                <option value="Plastic Waste Interception & Community Cleanups">
                  Plastic Interception & Community Cleanups
                </option>
                <option value="Sluice Gate Hydraulics & Concrete Excavation">
                  Sluice Hydraulics & Concrete Armor Excavation
                </option>
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-on-surface mb-1.5">
                Assigned Rig / Vehicle
              </label>
              <input
                type="text"
                placeholder="e.g. Flatbed Truck + Jet (GH-4412-24)"
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-3.5 py-2.5 text-[13px] focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Current Base Location */}
          <div>
            <label className="block text-[13px] font-bold text-on-surface mb-1.5">
              Current Base / Station Location
            </label>
            <input
              type="text"
              placeholder="e.g. Winneba Lorry Station / Bus Stop Junction"
              value={currentLocation}
              onChange={(e) => setCurrentLocation(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/60 rounded-xl px-3.5 py-2.5 text-[13.5px] focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          {/* Avatar & Rig Visual Selection Presets */}
          <div className="space-y-3 pt-1">
            <label className="block text-[13px] font-bold text-on-surface">
              Squad Leader Profile Photo
            </label>
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {AVATAR_PRESETS.map((p, idx) => (
                <div
                  key={idx}
                  onClick={() => setAvatarUrl(p.url)}
                  className={`w-13 h-13 rounded-2xl overflow-hidden border-2 cursor-pointer transition-all shrink-0 ${
                    avatarUrl === p.url ? 'border-primary ring-2 ring-primary/40 scale-105' : 'border-outline-variant opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <label className="block text-[13px] font-bold text-on-surface">
              Assigned Rig / Heavy Machinery Preview
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {RIG_PRESETS.map((r, idx) => (
                <div
                  key={idx}
                  onClick={() => setVehicleImageUrl(r.url)}
                  className={`relative rounded-xl overflow-hidden h-16 border-2 cursor-pointer transition-all ${
                    vehicleImageUrl === r.url ? 'border-primary ring-2 ring-primary/40 scale-102' : 'border-outline-variant opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={r.url} alt={r.label} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 left-1 right-1 text-[9px] font-bold text-white bg-black/70 px-1 py-0.5 rounded truncate text-center">
                    {r.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-on-surface-variant font-label-caps text-[12px] hover:bg-surface-container transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/95 text-white px-6 py-2.5 rounded-xl font-label-caps text-[12px] shadow-sm hover:shadow-md transition-all flex items-center gap-2 font-bold cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  Registering Squad...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  Register Dispatch Team
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
