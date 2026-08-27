import React, { useState, useEffect } from 'react';
import { dataService } from '../../lib/supabase';

export default function IncidentsView({
  incidents: initialIncidents = [],
  onSelectIncident,
  onOpenDispatch,
  onUpdateStatus,
  onOpenImageAnalysis
}) {
  const [incidentsList, setIncidentsList] = useState(initialIncidents);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [showNewIncidentModal, setShowNewIncidentModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Blocked Drain');
  const [newSeverity, setNewSeverity] = useState('high');
  const [newSector, setNewSector] = useState('Central Market Sector');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    if (initialIncidents?.length) {
      setIncidentsList(initialIncidents);
    }
  }, [initialIncidents]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleUpdateStatus = async (incidentId, newStatus, e) => {
    if (e) e.stopPropagation();
    if (onUpdateStatus) {
      await onUpdateStatus(incidentId, newStatus);
    } else {
      await dataService.updateIncidentStatus(incidentId, newStatus);
      showToast(`✓ Incident ${incidentId} marked as ${newStatus}!`);
    }
    setIncidentsList(
      incidentsList.map((inc) => (inc.id === incidentId ? { ...inc, status: newStatus } : inc))
    );
  };

  const handleCreateIncident = async (e) => {
    e.preventDefault();
    const created = await dataService.createIncident({
      title: newTitle,
      category: newCategory,
      severity: newSeverity,
      sector: newSector,
      description: newDesc,
      reportedBy: 'Officer Manual Entry'
    });
    setIncidentsList([created, ...incidentsList]);
    setShowNewIncidentModal(false);
    setNewTitle('');
    setNewDesc('');
    showToast(`✓ Incident ${created.id} created and synced to Supabase!`);
  };

  const filtered = (incidentsList || []).filter((inc) => {
    if (filterStatus !== 'all' && inc.status !== filterStatus) return false;
    if (filterSeverity !== 'all' && inc.severity !== filterSeverity) return false;
    if (
      searchQuery &&
      !inc.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !inc.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !inc.sector.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-error-container text-on-error-container border border-error/30';
      case 'high':
        return 'bg-risk-high/15 text-risk-high border border-risk-high/30';
      case 'moderate':
        return 'bg-amber-100 text-amber-800 border border-amber-300';
      default:
        return 'bg-secondary-container text-on-secondary-container border border-secondary/30';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'resolved':
        return 'bg-primary/10 text-primary border border-primary/20';
      case 'in-progress':
        return 'bg-amber-500/10 text-amber-700 border border-amber-500/20';
      case 'assigned':
        return 'bg-blue-500/10 text-blue-700 border border-blue-500/20';
      default:
        return 'bg-error-container text-on-error-container border border-error/20';
    }
  };

  return (
    <div className="px-8 py-6 w-full max-w-[1440px] mx-auto space-y-6 select-none">
      {/* Toast Notification */}
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
            <span className="material-symbols-outlined text-primary text-[24px]">report_problem</span>
            <h1 className="font-headline-lg text-on-surface">Real-Time Incident Monitoring</h1>
          </div>
          <p className="font-body-md text-on-surface-variant">
            Live Supabase feed of citizen reports, verified drainage obstructions, and AI waste detections.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={onOpenImageAnalysis}
            className="bg-secondary text-on-secondary px-4 py-2.5 rounded-xl font-label-caps text-[12px] hover:bg-secondary/80 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_a_photo</span>
            AI Photo Scan
          </button>
          <button
            onClick={() => setShowNewIncidentModal(true)}
            className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-label-caps text-[12px] hover:bg-surface-tint shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_alert</span>
            Log Incident Manually
          </button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/60 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search incident ID, sector, keywords..."
            className="w-full bg-surface-container-low border border-outline-variant rounded-xl pl-9 pr-4 py-2 text-body-sm focus:ring-1 focus:ring-primary focus:outline-none"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-outline-variant/60">
            {['all', 'unresolved', 'assigned', 'in-progress', 'resolved'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-label-caps uppercase transition-colors ${
                  filterStatus === st
                    ? 'bg-primary text-on-primary font-bold shadow-xs'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Severity Filter */}
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2 text-body-sm text-on-surface font-semibold focus:outline-none cursor-pointer"
          >
            <option value="all">All Severities</option>
            <option value="critical">🔴 Critical</option>
            <option value="high">🟠 High</option>
            <option value="moderate">🟡 Moderate</option>
            <option value="low">🟢 Low</option>
          </select>
        </div>
      </div>

      {/* Incidents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((inc) => (
          <div
            key={inc.id}
            onClick={() => onSelectIncident && onSelectIncident(inc)}
            className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between cursor-pointer group"
          >
            <div>
              {/* Photo Banner with Transparent Tags */}
              <div className="relative h-40 bg-surface-container overflow-hidden">
                <img
                  src={inc.imageUrl || 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80'}
                  alt={inc.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>

                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-data-mono ${getSeverityBadge(inc.severity)}`}>
                    {inc.severity}
                  </span>
                  <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-white/20 font-data-mono">
                    {inc.category}
                  </span>
                </div>

                <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-white text-[11px] flex justify-between items-center border border-white/10">
                  <span className="truncate">📍 {inc.sector}</span>
                  <span className="text-primary-fixed font-bold font-data-mono shrink-0">{inc.drainId || 'Unlinked'}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] text-outline font-data-mono">
                  <span>{inc.id}</span>
                  <span>{inc.reportedAt}</span>
                </div>

                <h3 className="font-title-md text-[15px] font-bold text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
                  {inc.title}
                </h3>

                <p className="text-[12px] text-on-surface-variant line-clamp-2 leading-relaxed">
                  {inc.description}
                </p>

                <div className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/40 text-[11px] flex items-center justify-between">
                  <span className="text-outline">Estimated Refuse:</span>
                  <span className="font-bold text-on-surface">{inc.estimatedWasteVolume || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Footer / Status Actions */}
            <div className="px-4 py-3 border-t border-outline-variant/40 bg-surface-container-low/30 flex items-center justify-between">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-data-mono ${getStatusBadge(inc.status)}`}>
                {inc.status}
              </span>

              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                {inc.status !== 'resolved' && (
                  <button
                    onClick={(e) => handleUpdateStatus(inc.id, 'resolved', e)}
                    className="text-[11px] font-semibold text-primary hover:bg-primary/10 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    Resolve
                  </button>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDispatch && onOpenDispatch(inc);
                  }}
                  className="bg-primary text-on-primary px-3 py-1 rounded-lg text-[11px] font-label-caps hover:bg-surface-tint shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">send</span>
                  Dispatch
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Manual Incident Modal */}
      {showNewIncidentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="bg-primary px-6 py-4 text-on-primary flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[22px]">add_alert</span>
                <h3 className="font-title-md font-bold text-[17px]">Log New Incident</h3>
              </div>
              <button onClick={() => setShowNewIncidentModal(false)} className="p-1 rounded-lg text-white/80 hover:text-white">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateIncident} className="p-6 space-y-4 text-body-sm">
              <div>
                <label className="block font-semibold text-on-surface mb-1 text-[13px]">Incident Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Blocked culvert behind market stalls"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 text-body-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-on-surface mb-1 text-[13px]">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 text-body-sm"
                  >
                    <option value="Blocked Drain">Blocked Drain</option>
                    <option value="Illegal Dumping">Illegal Dumping</option>
                    <option value="Structural Failure">Structural Failure</option>
                    <option value="Siltation">Siltation</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-on-surface mb-1 text-[13px]">Severity</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 text-body-sm"
                  >
                    <option value="critical">Critical (Immediate)</option>
                    <option value="high">High (&lt;6 hrs)</option>
                    <option value="moderate">Moderate</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1 text-[13px]">Sector / Community</label>
                <input
                  type="text"
                  required
                  value={newSector}
                  onChange={(e) => setNewSector(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 text-body-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1 text-[13px]">Description</label>
                <textarea
                  rows={3}
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Details of obstruction, waste volume, impact on roadway..."
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 text-body-sm resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewIncidentModal(false)}
                  className="px-4 py-2 rounded-xl text-on-surface-variant font-label-caps text-[12px] hover:bg-surface-container cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary text-on-primary px-5 py-2 rounded-xl font-label-caps text-[12px] hover:bg-surface-tint shadow-xs cursor-pointer"
                >
                  Save to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
