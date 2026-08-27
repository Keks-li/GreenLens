import React, { useState, useEffect } from 'react';
import { getPermissionsForRole } from '../../lib/rbac';
import { dataService } from '../../lib/supabase';

export default function AlertsView({ currentUser, alertsList: propAlerts, onRefreshAlerts }) {
  const userRole = currentUser?.role || 'Municipal Officer';
  const permissions = getPermissionsForRole(userRole);
  const canBroadcast = permissions.canBroadcastAlerts;

  const [alerts, setAlerts] = useState([
    {
      id: 'ALT-2026-09',
      title: 'Heavy Convective Storm Alert — 18-Hour Forecast Window',
      category: 'Meteorological Warning',
      severity: 'Critical',
      targetSectors: ['Central Market', 'South Residential', 'North Campus Zone'],
      issuedAt: '2026-08-26 14:15',
      expiresIn: '16h 45m',
      status: 'Active Broadcast',
      message: 'High precipitation event (>60mm) expected. Traders and residents in low-lying market corridors advised to secure goods and avoid clogged swales.',
      recipientsNotified: 14200
    },
    {
      id: 'ALT-2026-08',
      title: 'Drain D-102 High Blockage (80%) Alert',
      category: 'Infrastructure Choke',
      severity: 'High',
      targetSectors: ['Central Market Sector'],
      issuedAt: '2026-08-26 13:40',
      expiresIn: '6h 15m',
      status: 'Active Broadcast',
      message: 'Severe single-use plastic buildup at primary culvert intake. Clearance team dispatched.',
      recipientsNotified: 4800
    },
    {
      id: 'ALT-2026-07',
      title: 'Tidal Surge Warning for Coastal Fisheries Outfall',
      category: 'Hydraulic Coastal Risk',
      severity: 'Moderate',
      targetSectors: ['Coastal Fishing Harbor'],
      issuedAt: '2026-08-26 11:20',
      expiresIn: '2h 10m',
      status: 'Monitoring',
      message: 'Spring high tide expected at 17:30. Sluice gates under manual supervision.',
      recipientsNotified: 1250
    }
  ]);

  useEffect(() => {
    if (propAlerts?.length) {
      setAlerts(propAlerts.map(a => ({
        id: a.id,
        title: a.title,
        category: a.alertType || 'Emergency Broadcast',
        severity: a.severity || 'Critical',
        targetSectors: a.targetZones ? [a.targetZones] : ['All Municipality Zones'],
        issuedAt: a.issuedAt || 'Recent',
        expiresIn: a.expiresAt || '12h',
        status: a.status || 'Active Broadcast',
        message: a.message,
        recipientsNotified: 12000
      })));
    }
  }, [propAlerts]);

  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSeverity, setBroadcastSeverity] = useState('Critical');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!canBroadcast) {
      showToast('⚠️ Action prohibited: Only Municipal Officers and Administrators can issue broadcasts.');
      return;
    }

    const created = await dataService.createAlert({
      title: broadcastTitle,
      message: broadcastMessage,
      severity: broadcastSeverity,
      alertType: 'Municipal Emergency Directive',
      targetZones: 'All Municipality Zones',
      channels: 'SMS, Radio, Mobile App Push'
    });

    const newAlertObj = {
      id: created.id,
      title: broadcastTitle,
      category: 'Municipal Emergency Directive',
      severity: broadcastSeverity,
      targetSectors: ['All Municipality Zones'],
      issuedAt: 'Just Now',
      expiresIn: '24h',
      status: 'Active Broadcast',
      message: broadcastMessage,
      recipientsNotified: 18500
    };

    setAlerts([newAlertObj, ...alerts]);
    setShowBroadcastModal(false);
    setBroadcastTitle('');
    setBroadcastMessage('');
    showToast(`✓ Broadcast alert published and synced with database!`);
    if (onRefreshAlerts) onRefreshAlerts();
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
            <span className="material-symbols-outlined text-primary text-[24px]">campaign</span>
            <h1 className="font-headline-lg text-on-surface">Emergency Alerts &amp; Citizen Broadcasts</h1>
          </div>
          <p className="font-body-md text-on-surface-variant">
            Live broadcast management for flood hazard alerts, civic directives, and localized sirens.
          </p>
        </div>

        {canBroadcast && (
          <button
            onClick={() => setShowBroadcastModal(true)}
            className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-label-caps text-[12px] hover:bg-surface-tint shadow-xs transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">broadcast_on_personal</span>
            Broadcast Emergency Alert
          </button>
        )}
      </div>

      {/* Active Broadcasts Feed */}
      <div className="space-y-4">
        <h2 className="font-title-md font-bold text-on-surface text-[18px] flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-risk-critical animate-pulse"></span>
          Active Public Advisories (Live Database)
        </h2>

        <div className="space-y-4">
          {alerts.map((al) => (
            <div
              key={al.id}
              className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/60 shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-data-mono ${
                    al.severity === 'Critical' ? 'bg-error-container text-on-error-container' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {al.severity}
                  </span>
                  <h3 className="font-title-md text-[16px] font-bold text-on-surface">{al.title}</h3>
                </div>
                <div className="text-[11px] font-data-mono text-outline">
                  Issued: {al.issuedAt} • Expires: {al.expiresIn}
                </div>
              </div>

              <p className="text-[13px] text-on-surface-variant leading-relaxed bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/40">
                {al.message}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3 text-[12px] pt-1">
                <div className="flex items-center gap-2 text-outline">
                  <span className="material-symbols-outlined text-[16px]">pin_drop</span>
                  <span>Target Sectors: <strong className="text-on-surface">{al.targetSectors.join(', ')}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-primary font-bold">
                  <span className="material-symbols-outlined text-[16px]">sensors</span>
                  <span>{al.recipientsNotified?.toLocaleString()} citizens notified</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="bg-primary px-6 py-4 text-on-primary flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[22px]">campaign</span>
                <h3 className="font-title-md font-bold text-[17px]">Issue Citizen Broadcast</h3>
              </div>
              <button onClick={() => setShowBroadcastModal(false)} className="p-1 rounded-lg text-white/80 hover:text-white">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="p-6 space-y-4 text-body-sm">
              <div>
                <label className="block font-semibold text-on-surface mb-1 text-[13px]">Alert Title</label>
                <input
                  type="text"
                  required
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="e.g. Flash Flood Precaution — Lowtown Corridor"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 text-body-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1 text-[13px]">Severity Classification</label>
                <select
                  value={broadcastSeverity}
                  onChange={(e) => setBroadcastSeverity(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 text-body-sm"
                >
                  <option value="Critical">Critical (Immediate Warning)</option>
                  <option value="High">High (Pre-storm advisory)</option>
                  <option value="Moderate">Moderate (Operational notification)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1 text-[13px]">Advisory Message</label>
                <textarea
                  rows={4}
                  required
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Actionable instructions for citizens and community volunteers..."
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 text-body-sm resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-4 py-2 rounded-xl text-on-surface-variant font-label-caps text-[12px] hover:bg-surface-container cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary text-on-primary px-5 py-2 rounded-xl font-label-caps text-[12px] hover:bg-surface-tint shadow-xs cursor-pointer"
                >
                  Broadcast &amp; Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
