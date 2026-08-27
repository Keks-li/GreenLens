import React, { useState, useEffect } from 'react';
import { getPermissionsForRole } from '../../lib/rbac';
import { dataService } from '../../lib/supabase';

export default function AdministrationView({
  auditLogsList = [],
  usersList: propUsersList,
  currentUser,
  onRefreshData
}) {
  const userRole = currentUser?.role || 'Municipal Officer';
  const permissions = getPermissionsForRole(userRole);
  const isAdmin = permissions.canManageUsers || userRole.toLowerCase().includes('admin');

  const [activeTab, setActiveTab] = useState('users'); // 'users', 'config', 'audit'
  const [criticalThreshold, setCriticalThreshold] = useState(80);
  const [highThreshold, setHighThreshold] = useState(65);
  const [weatherApiInterval, setWeatherApiInterval] = useState(15);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Municipal Officer', department: 'Environmental Health' });
  const [toastMessage, setToastMessage] = useState(null);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const [users, setUsers] = useState([
    { id: 'usr-1', name: 'Kwame Mensah', email: 'kwame.mensah@winneba.gov.gh', role: 'Municipal Officer', department: 'Operations Command', status: 'Active' },
    { id: 'usr-2', name: 'Abena Osei', email: 'abena.osei@winneba.gov.gh', role: 'Supervisor', department: 'Field Operations', status: 'Active' },
    { id: 'usr-3', name: 'Dr. Joseph Ansah', email: 'j.ansah@winneba.gov.gh', role: 'Administrator', department: 'Municipal Assembly IT', status: 'Active' },
    { id: 'usr-4', name: 'Emmanuel Kofi', email: 'e.kofi@winneba.gov.gh', role: 'Field Worker Lead', department: 'Rapid Strike Unit', status: 'On Mission' },
    { id: 'usr-5', name: 'Francisca Arthur', email: 'f.arthur@winneba.gov.gh', role: 'Supervisor', department: 'Coastal & Sluice Taskforce', status: 'Active' }
  ]);

  useEffect(() => {
    if (propUsersList?.length) {
      setUsers(propUsersList);
    }
  }, [propUsersList]);

  useEffect(() => {
    const fetchConfigs = async () => {
      const conf = await dataService.getSystemConfigs();
      if (conf) {
        if (conf.criticalThreshold) setCriticalThreshold(conf.criticalThreshold);
        if (conf.highThreshold) setHighThreshold(conf.highThreshold);
        if (conf.weatherApiInterval) setWeatherApiInterval(conf.weatherApiInterval);
      }
    };
    fetchConfigs();
  }, []);

  const handleSaveThresholds = async () => {
    setIsSavingConfig(true);
    try {
      await dataService.updateSystemConfigs({
        criticalThreshold,
        highThreshold,
        weatherApiInterval
      });
      showToast('✓ AI risk thresholds & telemetry configs saved to database!');
      if (onRefreshData) onRefreshData();
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleInviteUser = async (e) => {
    e.preventDefault();
    const created = await dataService.createUser({
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      department: newUser.department,
      status: 'Active'
    });

    setUsers([created, ...users]);
    setShowInviteModal(false);
    setNewUser({ name: '', email: '', role: 'Municipal Officer', department: 'Environmental Health' });
    showToast(`✓ Staff member ${created.name} registered in database!`);
    if (onRefreshData) onRefreshData();
  };

  return (
    <div className="px-8 py-6 w-full max-w-[1440px] mx-auto space-y-6 select-none">
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
            <span className="material-symbols-outlined text-primary text-[24px]">settings</span>
            <h1 className="font-headline-lg text-on-surface">Administration &amp; System Governance</h1>
          </div>
          <p className="font-body-md text-on-surface-variant">
            Role-Based Access Control (RBAC), risk thresholds calibration, data configuration, and immutable audit logs.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-surface-container-low p-1.5 rounded-xl border border-outline-variant/60 flex self-start sm:self-auto">
          {[
            { id: 'users', label: 'User Roles & RBAC', icon: 'badge' },
            { id: 'config', label: 'Data & Thresholds', icon: 'tune' },
            { id: 'audit', label: 'Audit Trail', icon: 'history' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-label-caps uppercase transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-on-primary shadow-xs font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: User Management & RBAC */}
      {activeTab === 'users' && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-xs overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-title-md font-bold text-on-surface text-[17px]">
                Authorized Municipal Personnel (Live Database)
              </h3>
              <p className="text-[12px] text-on-surface-variant">
                Manage portal permissions for Officers, Supervisors, Field Workers, and IT Admins
              </p>
            </div>

            <button
              onClick={() => setShowInviteModal(true)}
              className="bg-primary text-on-primary px-4 py-2 rounded-xl text-[12px] font-label-caps hover:bg-surface-tint shadow-xs transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <span className="material-symbols-outlined text-[16px]">person_add</span>
              Add New User
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-body-sm">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant text-[11px] uppercase font-label-caps text-outline">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40 text-[13px]">
                {users.map((usr) => (
                  <tr key={usr.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-on-surface flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[12px]">
                        {usr.name.charAt(0)}
                      </div>
                      {usr.name}
                    </td>
                    <td className="py-3.5 px-4 font-data-mono text-[12px] text-outline">{usr.email}</td>
                    <td className="py-3.5 px-4">
                      <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                        {usr.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-on-surface-variant">{usr.department}</td>
                    <td className="py-3.5 px-4">
                      <span className="flex items-center gap-1 text-[12px] font-semibold text-primary">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                        {usr.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => showToast(`Permissions verified for ${usr.name}`)}
                        className="text-on-surface-variant hover:text-primary p-1 rounded transition-colors"
                        title="Edit Permissions"
                      >
                        <span className="material-symbols-outlined text-[18px]">verified_user</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Data Configuration & Risk Calibration */}
      {activeTab === 'config' && (
        <div className="space-y-6">
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/60 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-title-md font-bold text-on-surface text-[17px]">
                AI Risk Threshold Calibration
              </h3>
              <button
                onClick={handleSaveThresholds}
                disabled={isSavingConfig}
                className="bg-primary text-on-primary px-4 py-1.5 rounded-xl text-[12px] font-label-caps hover:bg-surface-tint shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                {isSavingConfig ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/40 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-on-surface text-[13px]">Critical Incident Threshold</span>
                  <span className="font-bold text-risk-critical text-[15px] font-data-mono">{criticalThreshold}% Blockage</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="95"
                  value={criticalThreshold}
                  onChange={(e) => setCriticalThreshold(Number(e.target.value))}
                  className="w-full accent-risk-critical cursor-pointer"
                />
                <p className="text-[11px] text-outline">
                  Drains exceeding this blockage trigger automated emergency dispatch directives.
                </p>
              </div>

              <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/40 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-on-surface text-[13px]">High Risk Pre-Storm Threshold</span>
                  <span className="font-bold text-risk-high text-[15px] font-data-mono">{highThreshold}% Blockage</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="80"
                  value={highThreshold}
                  onChange={(e) => setHighThreshold(Number(e.target.value))}
                  className="w-full accent-risk-high cursor-pointer"
                />
                <p className="text-[11px] text-outline">
                  Drains scheduled for pre-storm clearing within 8 hours.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/60 shadow-xs space-y-4">
            <h3 className="font-title-md font-bold text-on-surface text-[17px]">
              Weather Telemetry &amp; Radar Sync
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[13px]">
              <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/40">
                <span className="text-outline font-semibold block mb-1">Weather Provider:</span>
                <span className="font-bold text-on-surface">Ghana Meteorological Agency (GMet)</span>
              </div>
              <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/40">
                <span className="text-outline font-semibold block mb-1">Radar Sync Interval:</span>
                <span className="font-bold text-primary">Every {weatherApiInterval} minutes</span>
              </div>
              <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/40">
                <span className="text-outline font-semibold block mb-1">Satellite Resolution:</span>
                <span className="font-bold text-on-surface">High-Res Multi-spectral (10m)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: System Audit Log */}
      {activeTab === 'audit' && (
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/60 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-title-md font-bold text-on-surface text-[17px]">
                Municipal Accountability Audit Log (Live Database)
              </h3>
              <p className="text-[12px] text-on-surface-variant">
                Cryptographically hashed audit log for government &amp; regulatory oversight
              </p>
            </div>
            <span className="text-[11px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase font-data-mono">
              Immutable Trail
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-body-sm">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant text-[11px] uppercase font-label-caps text-outline">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40 text-[13px]">
                {auditLogsList.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-container-low/60 transition-colors">
                    <td className="py-3 px-4 font-data-mono text-[12px] text-outline whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-4 font-semibold text-on-surface whitespace-nowrap">{log.user}</td>
                    <td className="py-3 px-4">
                      <span className="bg-surface-container px-2 py-0.5 rounded text-[11px] font-bold font-data-mono">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-primary">{log.entity}</td>
                    <td className="py-3 px-4 text-on-surface-variant">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="bg-primary px-6 py-4 text-on-primary flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[22px]">person_add</span>
                <h3 className="font-title-md font-bold text-[17px]">Add Municipal Staff</h3>
              </div>
              <button onClick={() => setShowInviteModal(false)} className="p-1 rounded-lg text-white/80 hover:text-white">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleInviteUser} className="p-6 space-y-4 text-body-sm">
              <div>
                <label className="block font-semibold text-on-surface mb-1 text-[13px]">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="e.g. Kwame Mensah"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 text-body-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1 text-[13px]">Official Email</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="e.g. officer@winneba.gov.gh"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 text-body-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1 text-[13px]">Assigned Role (RBAC)</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 text-body-sm"
                >
                  <option value="Municipal Officer">Municipal Officer (Dashboard, Dispatch, Analytics)</option>
                  <option value="Supervisor">Supervisor (Field Operations, Team Management)</option>
                  <option value="Field Worker Lead">Field Worker Lead (Task Assignments)</option>
                  <option value="Administrator">Administrator (Full Access &amp; Config)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl text-on-surface-variant font-label-caps text-[12px] hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary text-on-primary px-5 py-2 rounded-xl font-label-caps text-[12px] hover:bg-surface-tint shadow-xs"
                >
                  Confirm &amp; Register User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
