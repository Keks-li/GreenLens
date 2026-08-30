import React, { useState, useEffect } from 'react';
import { dataService } from '../../lib/supabase';

export default function IncidentsView({
  incidents: initialIncidents = [],
  categories = [],
  onSelectIncident,
  onOpenDispatch,
  onUpdateStatus,
  onLocateOnMap
}) {
  const [incidentsList, setIncidentsList] = useState(initialIncidents);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [showNewIncidentModal, setShowNewIncidentModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState(categories[0]?.name || 'Blocked Drain');
  const [newSeverity, setNewSeverity] = useState('high');
  const [newSector, setNewSector] = useState('Central Market Sector');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    if (initialIncidents) {
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
    if (filterCategory !== 'all' && inc.category !== filterCategory) return false;
    if (
      searchQuery &&
      !inc.title?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !inc.id?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !inc.sector?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !inc.category?.toLowerCase().includes(searchQuery.toLowerCase())
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
      case 'low':
        return 'bg-secondary-container text-on-secondary-container border border-secondary/30';
      default:
        return 'bg-surface-container-high text-on-surface border border-outline-variant';
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
    <div className="px-4 sm:px-8 py-4 sm:py-6 w-full max-w-[1440px] mx-auto space-y-6 select-none">
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
            <h1 className="font-headline-lg text-on-surface">Real-Time Incident &amp; Report Monitoring</h1>
          </div>
          <p className="font-body-md text-on-surface-variant">
            Live Supabase feed of verified citizen scans ({incidentsList.filter(i => i.sourceTable === 'reports').length} Mobile/Citizen), drainage obstructions, and AI waste detections.
          </p>
        </div>

        <button
          onClick={() => setShowNewIncidentModal(true)}
          className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-label-caps text-[12px] hover:bg-surface-tint shadow-xs transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add_alert</span>
          Log Incident Manually
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-3xl border border-outline-variant/60 shadow-card-soft flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-outline text-[18px]">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reports by sector or issue..."
            className="w-full bg-surface-container-low border border-outline-variant/70 rounded-full pl-10 pr-4 py-2 text-body-sm text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none placeholder:text-outline/70"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-full border border-outline-variant/60 overflow-x-auto max-w-full">
            {[
              { id: 'all', label: 'All', count: incidentsList.length },
              { id: 'unresolved', label: 'Unresolved', count: incidentsList.filter(i => i.status === 'unresolved').length },
              { id: 'assigned', label: 'Assigned', count: incidentsList.filter(i => i.status === 'assigned').length },
              { id: 'in-progress', label: 'In Progress', count: incidentsList.filter(i => i.status === 'in-progress').length },
              { id: 'resolved', label: 'Resolved', count: incidentsList.filter(i => i.status === 'resolved').length }
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setFilterStatus(st.id)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-label-caps uppercase transition-all shrink-0 whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                  filterStatus === st.id
                    ? 'bg-primary text-white font-bold shadow-xs'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-semibold'
                }`}
              >
                <span>{st.label}</span>
                <span className="text-[10px] opacity-80 font-data-mono">({st.count})</span>
              </button>
            ))}
          </div>

          {/* Category Filter */}
          {categories?.length > 0 && (
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-surface-container-low border border-outline-variant/70 rounded-full px-3.5 py-1.5 text-[12px] text-on-surface font-bold focus:outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          {/* Severity Filter */}
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-surface-container-low border border-outline-variant/70 rounded-full px-3.5 py-1.5 text-[12px] text-on-surface font-bold focus:outline-none cursor-pointer"
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
            className="bg-surface-container-lowest rounded-3xl border border-outline-variant/60 shadow-card-soft hover:shadow-card-hover transition-all overflow-hidden flex flex-col justify-between cursor-pointer group"
          >
            <div>
              {/* Photo Banner with Clean Tags */}
              <div className="relative h-44 bg-surface-container overflow-hidden">
                <img
                  src={inc.imageUrl || 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80'}
                  alt={inc.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none"></div>

                <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase font-data-mono ${getSeverityBadge(inc.severity)}`}>
                    {inc.severity}
                  </span>
                  {inc.sourceTable === 'reports' && (
                    <span className="bg-primary text-white text-[9.5px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                      <span>📱 Citizen Scan</span>
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white text-[11.5px] font-semibold flex justify-between items-center">
                  <span className="truncate flex items-center gap-1 drop-shadow-sm">
                    <span className="material-symbols-outlined text-[14px] text-primary-fixed">location_on</span>
                    {inc.sector}
                  </span>
                  <span className="bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-data-mono font-bold text-white/90">
                    {inc.drainId || 'Winneba Swale'}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] text-outline font-data-mono font-medium">
                  <span>{inc.id}</span>
                  <span>{inc.reportedAt}</span>
                </div>

                <h3 className="font-title-md text-[15px] font-bold text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
                  {inc.title}
                </h3>

                {/* Refuse Material Tag */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-primary-container text-on-primary-container border border-[#bbf7d0]">
                    🗑️ {inc.refuseType || inc.category || 'Refuse Material'}
                  </span>
                  {inc.estimatedWasteVolume && (
                    <span className="text-[10px] font-data-mono text-outline font-semibold bg-surface-container px-2 py-0.5 rounded-full">
                      {inc.estimatedWasteVolume}
                    </span>
                  )}
                </div>

                <p className="text-[12px] text-on-surface-variant line-clamp-2 leading-relaxed">
                  {inc.description}
                </p>

                <div className="flex items-center justify-between text-[11.5px] pt-1">
                  <span className="text-on-surface-variant">
                    By <strong className="text-on-surface">{inc.reportedBy?.split(' ')[0] || 'Citizen'}</strong>
                  </span>
                  {inc.aiRiskAssessment && (
                    <span className="font-bold text-primary text-[11px] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
                      AI: {inc.aiRiskAssessment.risk_level || 'Active'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Footer / Status Actions */}
            <div className="px-4 py-3 border-t border-outline-variant/40 bg-surface-container-low/40 flex items-center justify-between">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-data-mono ${getStatusBadge(inc.status)}`}>
                {inc.status}
              </span>

              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                {onLocateOnMap && (
                  <button
                    type="button"
                    title="View Exact Coordinates on Map"
                    onClick={(e) => {
                      e.stopPropagation();
                      onLocateOnMap(inc);
                    }}
                    className="p-1 rounded-full text-primary hover:bg-primary-container text-[11px] font-bold flex items-center gap-0.5 px-2.5 cursor-pointer transition-colors border border-primary/20"
                  >
                    <span className="material-symbols-outlined text-[14px]">explore</span>
                    <span>See Map</span>
                  </button>
                )}

                {inc.status !== 'resolved' && (
                  <button
                    onClick={(e) => handleUpdateStatus(inc.id, 'resolved', e)}
                    className="text-[11px] font-bold text-primary hover:bg-primary-container px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                  >
                    Resolve
                  </button>
                )}

                <button
                  type="button"
                  disabled={inc.status === 'resolved'}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (inc.status !== 'resolved' && onOpenDispatch) onOpenDispatch(inc);
                  }}
                  className={`px-3 py-1 rounded-full text-[11px] font-label-caps transition-all flex items-center gap-1 font-bold ${
                    inc.status === 'resolved'
                      ? 'bg-surface-container text-outline cursor-not-allowed opacity-60'
                      : 'bg-primary text-white hover:bg-primary/90 shadow-2xs cursor-pointer'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {inc.status === 'resolved' ? 'check_circle' : 'send'}
                  </span>
                  {inc.status === 'resolved' ? 'Resolved' : 'Dispatch'}
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
                    {categories.length > 0 ? (
                      categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Blocked Drain">Blocked Drain</option>
                        <option value="Illegal Dumping">Illegal Dumping</option>
                        <option value="Overflowing Waste">Overflowing Waste</option>
                        <option value="Flooding">Flooding</option>
                        <option value="Open Drain">Open Drain</option>
                        <option value="Waste Accumulation">Waste Accumulation</option>
                        <option value="Drain Damage">Drain Damage</option>
                      </>
                    )}
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
