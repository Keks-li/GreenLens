import React, { useState, useEffect } from 'react';
import { getPermissionsForRole } from '../../lib/rbac';
import { dataService } from '../../lib/supabase';
import GenerateReportModal from '../modals/GenerateReportModal';

export default function AdministrationView({
  auditLogsList = [],
  usersList: propUsersList,
  incidentsList = [],
  currentUser,
  selectedMunicipality,
  municipalitiesList = [],
  kpis,
  drainageSegments = [],
  fieldTeams = [],
  citizenRewards = [],
  weather,
  onRefreshData,
  onOpenDispatch
}) {
  const userRole = currentUser?.role || 'Municipal Officer';
  const permissions = getPermissionsForRole(userRole);
  const isAdmin = permissions.canManageUsers || userRole.toLowerCase().includes('admin');

  const defaultMunis = [
    { id: 'winneba', name: 'Winneba Municipal Assembly' },
    { id: 'accra', name: 'Accra Metropolitan Assembly' },
    { id: 'kumasi', name: 'Kumasi Metropolitan Assembly' },
    { id: 'cape_coast', name: 'Cape Coast Metropolitan' }
  ];
  const availableMunicipalities = municipalitiesList?.length > 0 ? municipalitiesList : defaultMunis;

  const [activeTab, setActiveTab] = useState('users'); // 'users', 'activity', 'config'
  const [userCategoryFilter, setUserCategoryFilter] = useState('all'); // 'all', 'officers', 'field', 'citizens'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Administrator',
    department: 'Operations Command',
    municipalityId: selectedMunicipality?.id || 'winneba'
  });

  const [toastMessage, setToastMessage] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [credentialsModalData, setCredentialsModalData] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const [users, setUsers] = useState(propUsersList || []);

  useEffect(() => {
    if (propUsersList) {
      const enhanced = propUsersList.map((u) => {
        const userReports = (incidentsList || []).filter(
          (i) => i.reportedBy === u.name || i.reporterContact === u.phone || i.reporterContact === u.email || i.user_id === u.id
        );
        return {
          ...u,
          reportsCount: userReports.length || u.reportsCount || 0
        };
      });
      setUsers(enhanced);
    }
  }, [propUsersList, incidentsList]);

  // Filtered Users List
  const filteredUsers = users.filter((u) => {
    // Category filter
    if (userCategoryFilter === 'officers' && u.role !== 'Municipal Officer' && u.role !== 'Administrator') return false;
    if (userCategoryFilter === 'field' && u.role !== 'Supervisor' && u.role !== 'Field Worker Lead') return false;
    if (userCategoryFilter === 'citizens' && !u.role?.includes('Citizen')) return false;

    // Status filter
    if (statusFilter !== 'all' && u.status !== statusFilter) return false;

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = u.name?.toLowerCase().includes(q);
      const matchEmail = u.email?.toLowerCase().includes(q);
      const matchRole = u.role?.toLowerCase().includes(q);
      const matchDept = u.department?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchRole && !matchDept) return false;
    }

    return true;
  });

  const handleInviteUser = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      showToast('⚠️ Only Administrators can register new users.');
      return;
    }

    const created = await dataService.createUser({
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      department: newUser.department,
      status: 'Active',
      municipalityId: newUser.municipalityId
    });

    setUsers([created, ...users]);
    setShowInviteModal(false);
    setNewUser({
      name: '',
      email: '',
      phone: '',
      role: 'Administrator',
      department: 'Operations Command',
      municipalityId: selectedMunicipality?.id || 'winneba'
    });

    // Open the Credentials Dialog Box so the admin can copy and send the password
    setCredentialsModalData({
      isOpen: true,
      title: 'New User Provisioned',
      user: created,
      isReset: false
    });

    if (onRefreshData) onRefreshData();
  };

  const handleResetUserPassword = async (userObj) => {
    if (!isAdmin) {
      showToast('⚠️ Only Administrators can reset passwords.');
      return;
    }
    setIsResettingPassword(true);
    try {
      const res = await dataService.resetUserPassword({
        userId: userObj.id,
        email: userObj.email
      });

      if (res?.success && res.tempPassword) {
        setCredentialsModalData({
          isOpen: true,
          title: 'Password Reset Successful',
          user: {
            ...userObj,
            tempPassword: res.tempPassword
          },
          isReset: true
        });
      } else {
        showToast(`⚠️ ${res?.error || 'Failed to reset password'}`);
      }
    } catch (err) {
      showToast('⚠️ Error resetting user password');
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleToggleUserStatus = async (userObj) => {
    setIsUpdatingStatus(true);
    const newStatus = userObj.status === 'Active' ? 'Suspended' : 'Active';
    
    // Update local state and log audit record
    setUsers(users.map(u => u.id === userObj.id ? { ...u, status: newStatus } : u));
    if (selectedUserDetail?.id === userObj.id) {
      setSelectedUserDetail({ ...selectedUserDetail, status: newStatus });
    }

    await dataService.addAuditLog({
      user: currentUser?.name || 'Administrator',
      action: 'USER_STATUS_CHANGE',
      entity: userObj.name,
      details: `Changed account status from ${userObj.status} to ${newStatus}.`
    });

    setIsUpdatingStatus(false);
    showToast(`✓ User status updated to ${newStatus}!`);
    if (onRefreshData) onRefreshData();
  };

  // Get user-specific activity history from auditLogsList
  const getUserActivities = (userName) => {
    if (!userName) return [];
    return auditLogsList.filter(log =>
      log.user?.toLowerCase().includes(userName.toLowerCase()) ||
      log.details?.toLowerCase().includes(userName.toLowerCase())
    );
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
            <span className="material-symbols-outlined text-primary text-[24px]">manage_accounts</span>
            <h1 className="font-headline-lg text-on-surface">User Management &amp; Activity Tracking</h1>
          </div>
          <p className="font-body-md text-on-surface-variant">
            Comprehensive registry of municipal personnel, field staff, and active citizen contributors.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          {/* Generate PDF Report Button */}
          <button
            onClick={() => setShowReportModal(true)}
            className="bg-surface-container-low border border-outline-variant hover:border-primary/50 text-on-surface hover:text-primary px-4 py-2.5 rounded-xl font-label-caps text-[12px] font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            title="Download Municipal Briefing & Audit in PDF format"
          >
            <span className="material-symbols-outlined text-[18px] text-primary">picture_as_pdf</span>
            <span>Generate PDF Report</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-label-caps text-[12px] hover:bg-surface-tint shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              <span>Register New User</span>
            </button>
          )}
        </div>
      </div>

      {/* Top User Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/60 shadow-xs">
          <span className="text-[11px] font-bold uppercase font-label-caps text-outline">Total Registered Users</span>
          <div className="text-[28px] font-bold text-on-surface mt-1">{users.length}</div>
          <span className="text-[12px] text-primary font-bold mt-0.5 block">Across {selectedMunicipality?.name || 'Municipal Assembly'}</span>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/60 shadow-xs">
          <span className="text-[11px] font-bold uppercase font-label-caps text-outline">Active Staff &amp; Officers</span>
          <div className="text-[28px] font-bold text-on-surface mt-1">
            {users.filter(u => u.role !== 'Citizen Champion' && u.status === 'Active').length}
          </div>
          <span className="text-[12px] text-on-surface-variant font-medium mt-0.5 block">Operations &amp; Field Commands</span>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/60 shadow-xs">
          <span className="text-[11px] font-bold uppercase font-label-caps text-outline">Citizen Champions</span>
          <div className="text-[28px] font-bold text-primary mt-1">
            {users.filter(u => u.role?.includes('Citizen')).length}
          </div>
          <span className="text-[12px] text-primary font-semibold mt-0.5 block">Verified Community Watch</span>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/60 shadow-xs">
          <span className="text-[11px] font-bold uppercase font-label-caps text-outline">User Activity Events</span>
          <div className="text-[28px] font-bold text-on-surface mt-1">{auditLogsList.length}</div>
          <span className="text-[12px] text-on-surface-variant font-medium mt-0.5 block">Logged in Supabase</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-outline-variant/60 gap-4 sm:gap-8 overflow-x-auto">
        {[
          { id: 'users', label: 'User Directory & Profiles', icon: 'group', badge: filteredUsers.length },
          { id: 'activity', label: 'Global User Activity Stream', icon: 'browse_activity', badge: auditLogsList.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3.5 font-label-caps text-[12px] sm:text-[13px] flex items-center gap-2 transition-all relative cursor-pointer shrink-0 whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-primary font-bold border-b-2 border-primary'
                : 'text-on-surface-variant hover:text-on-surface font-semibold'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === tab.id ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container text-outline'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab 1: User Directory & Management */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* User Filters & Search Toolbar */}
          <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/60 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user by name, email, department..."
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl pl-10 pr-4 py-2 text-[13px] text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Category and Status Dropdowns */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <div className="flex bg-surface-container-low p-1 rounded-xl border border-outline-variant/50">
                {[
                  { id: 'all', label: 'All Users' },
                  { id: 'officers', label: 'Officers' },
                  { id: 'field', label: 'Field Staff' },
                  { id: 'citizens', label: 'Citizens' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setUserCategoryFilter(c.id)}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all cursor-pointer ${
                      userCategoryFilter === c.id
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2 text-[12px] text-on-surface font-medium cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="Active">Active</option>
                <option value="On Mission">On Mission</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-body-sm">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant text-[11px] uppercase font-label-caps text-outline">
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Contact Info</th>
                    <th className="py-3.5 px-4">Role &amp; Access</th>
                    <th className="py-3.5 px-4">Department / Group</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40 text-[13px]">
                  {filteredUsers.map((usr) => {
                    const isCitizen = usr.role?.includes('Citizen');
                    return (
                      <tr
                        key={usr.id}
                        onClick={() => setSelectedUserDetail(usr)}
                        className="hover:bg-surface-container-low/60 transition-colors cursor-pointer"
                      >
                        <td className="py-3.5 px-4 font-semibold text-on-surface flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-[13px] ${
                            isCitizen ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-primary/10 text-primary'
                          }`}>
                            {usr.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-[14px] text-on-surface">{usr.name}</div>
                            <div className="text-[10px] text-outline font-data-mono">{usr.id}</div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-data-mono text-[12px] text-on-surface">{usr.email}</div>
                          {usr.phone && <div className="text-[11px] text-outline font-data-mono">{usr.phone}</div>}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            usr.role === 'Administrator'
                              ? 'bg-purple-100 text-purple-900'
                              : isCitizen
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-primary/10 text-primary'
                          }`}>
                            {usr.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-on-surface-variant font-medium">
                          <div>{usr.department}</div>
                          <div className="text-[11px] text-outline font-semibold">
                            {availableMunicipalities.find(m => m.id === usr.municipalityId)?.name || usr.municipalityId || 'Winneba'}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            usr.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : usr.status === 'On Mission'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-error-container text-on-error-container'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              usr.status === 'Active' ? 'bg-emerald-600' : usr.status === 'On Mission' ? 'bg-blue-600' : 'bg-risk-critical'
                            }`}></span>
                            {usr.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2" onClick={(e) => e.stopPropagation()}>
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleResetUserPassword(usr)}
                              disabled={isResettingPassword}
                              className="text-on-surface-variant hover:text-primary font-bold text-[12px] px-2.5 py-1 rounded-lg hover:bg-surface-container cursor-pointer transition-colors inline-flex items-center gap-1"
                              title="Reset and generate a new password for this user"
                            >
                              <span className="material-symbols-outlined text-[15px] text-primary">key</span>
                              <span>Reset Pwd</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedUserDetail(usr)}
                            className="text-primary font-bold text-[12px] hover:underline px-2 py-1 rounded cursor-pointer"
                          >
                            View Profile
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Global Activity Feed */}
      {activeTab === 'activity' && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-outline-variant/60 flex items-center justify-between">
            <h3 className="font-title-md font-bold text-on-surface text-[17px]">
              Live User Activity &amp; Audit Log
            </h3>
            <span className="text-[12px] font-data-mono text-outline">{auditLogsList.length} Logged Events</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-body-sm">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant text-[11px] uppercase font-label-caps text-outline">
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Target Entity</th>
                  <th className="py-3.5 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40 text-[13px]">
                {auditLogsList.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-container-low/60 transition-colors">
                    <td className="py-3.5 px-4 font-data-mono text-[12px] text-outline whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-on-surface whitespace-nowrap flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[11px]">
                        {log.user?.charAt(0) || 'U'}
                      </div>
                      <span>{log.user}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-surface-container px-2 py-0.5 rounded text-[11px] font-bold font-data-mono">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-primary">{log.entity}</td>
                    <td className="py-3.5 px-4 text-on-surface-variant">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Detail & Activity Modal / Drawer */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl border border-outline-variant w-full max-w-2xl overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="bg-primary px-6 py-5 text-on-primary flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center font-bold text-[18px]">
                  {selectedUserDetail.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-title-md font-bold text-[18px]">{selectedUserDetail.name}</h3>
                  <p className="text-[12px] text-white/80">{selectedUserDetail.role} • {selectedUserDetail.department}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserDetail(null)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Profile Content */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 text-body-sm">
              {/* User Info Card */}
              <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/60 grid grid-cols-2 gap-3 text-[13px]">
                <div>
                  <span className="text-outline text-[11px] block">Email Address:</span>
                  <span className="font-semibold text-on-surface font-data-mono">{selectedUserDetail.email}</span>
                </div>
                <div>
                  <span className="text-outline text-[11px] block">Phone / Mobile:</span>
                  <span className="font-semibold text-on-surface font-data-mono">{selectedUserDetail.phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-outline text-[11px] block">Jurisdiction:</span>
                  <span className="font-semibold text-on-surface uppercase font-data-mono">
                    {availableMunicipalities.find(m => m.id === selectedUserDetail.municipalityId)?.name || selectedUserDetail.municipalityId || selectedMunicipality?.name || 'Winneba Municipal Assembly'}
                  </span>
                </div>
                <div>
                  <span className="text-outline text-[11px] block">Account Status:</span>
                  <span className="font-bold text-primary">{selectedUserDetail.status}</span>
                </div>
              </div>

              {/* User Action Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 bg-surface-container rounded-xl border border-outline-variant/40">
                <div className="text-[12px]">
                  <span className="font-bold text-on-surface block">Account Access & Security</span>
                  <span className="text-outline text-[11px]">Suspend, reactivate, or reset credentials</span>
                </div>
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleResetUserPassword(selectedUserDetail)}
                      disabled={isResettingPassword}
                      className="px-3.5 py-2 rounded-xl text-[12px] font-bold font-label-caps bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-outline-variant flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Generate and issue a new password for this user"
                    >
                      <span className="material-symbols-outlined text-[16px] text-primary">key</span>
                      <span>{isResettingPassword ? 'Generating...' : 'Reset Password'}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleToggleUserStatus(selectedUserDetail)}
                    disabled={isUpdatingStatus}
                    className={`px-3.5 py-2 rounded-xl text-[12px] font-bold font-label-caps transition-all cursor-pointer ${
                      selectedUserDetail.status === 'Active'
                        ? 'bg-error-container text-on-error-container hover:bg-red-200'
                        : 'bg-primary text-on-primary hover:bg-surface-tint'
                    }`}
                  >
                    {selectedUserDetail.status === 'Active' ? 'Suspend Account' : 'Reactivate Account'}
                  </button>
                </div>
              </div>

              {/* Activity History for this Specific User */}
              <div className="space-y-2.5">
                <h4 className="font-title-md font-bold text-on-surface text-[15px] flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">history</span>
                  User Activity History (Database Trail)
                </h4>

                {getUserActivities(selectedUserDetail.name).length > 0 ? (
                  <div className="space-y-2">
                    {getUserActivities(selectedUserDetail.name).map((act) => (
                      <div
                        key={act.id}
                        className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/60 flex items-start justify-between gap-3 text-[12px]"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-primary font-data-mono text-[11px]">{act.action}</span>
                            <span className="text-outline">•</span>
                            <span className="font-semibold text-on-surface">{act.entity}</span>
                          </div>
                          <p className="text-on-surface-variant text-[11px]">{act.details}</p>
                        </div>
                        <span className="font-data-mono text-[10px] text-outline whitespace-nowrap">
                          {act.timestamp}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-surface-container-low p-4 rounded-xl text-center text-outline text-[12px]">
                    No audit records logged yet for this user.
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-surface-container-low border-t border-outline-variant/60 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedUserDetail(null)}
                className="bg-surface-container hover:bg-surface-container-high px-5 py-2 rounded-xl text-[12px] font-label-caps font-bold cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl border border-outline-variant w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="bg-primary px-6 py-4 text-on-primary flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[22px]">person_add</span>
                <h3 className="font-title-md font-bold text-[17px]">Register New User</h3>
              </div>
              <button onClick={() => setShowInviteModal(false)} className="p-1 rounded-lg text-white/80 hover:text-white">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleInviteUser} className="p-6 space-y-4 text-body-sm">
              <div>
                <label className="block font-semibold text-on-surface mb-1 text-[12px]">Full Name</label>
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
                <label className="block font-semibold text-on-surface mb-1 text-[12px]">Official / Citizen Email</label>
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
                <label className="block font-semibold text-on-surface mb-1 text-[12px]">Phone Number</label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  placeholder="+233 24 000 0000"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 text-body-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1 text-[12px]">Assigned Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 text-body-sm"
                >
                  <option value="Administrator">Administrator (Full Admin)</option>
                  <option value="Municipal Officer">Municipal Officer (Operations Lead)</option>
                  <option value="Supervisor">Supervisor (Field Lead)</option>
                  <option value="Field Worker Lead">Field Worker Lead (Rapid Strike)</option>
                  <option value="Citizen Champion">Citizen Champion (Community Reporter)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1 text-[12px]">Assigned Municipality / Jurisdiction</label>
                <select
                  value={newUser.municipalityId}
                  onChange={(e) => setNewUser({ ...newUser, municipalityId: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 text-body-sm"
                >
                  {availableMunicipalities.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1 text-[12px]">Department / Sector</label>
                <input
                  type="text"
                  value={newUser.department}
                  onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                  placeholder="e.g. Operations Command, Central Market Watch"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 text-body-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl text-on-surface-variant font-label-caps text-[12px] hover:bg-surface-container cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary text-on-primary px-5 py-2 rounded-xl font-label-caps text-[12px] hover:bg-surface-tint shadow-xs cursor-pointer"
                >
                  Register &amp; Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credentials & Password Dialog Box */}
      {credentialsModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl border border-outline-variant w-full max-w-md overflow-hidden animate-in zoom-in-95 flex flex-col">
            <div className="bg-primary px-6 py-5 text-on-primary flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[24px]">key</span>
                <div>
                  <h3 className="font-title-md font-bold text-[18px]">
                    {credentialsModalData.title || 'User Credentials'}
                  </h3>
                  <p className="text-[12px] text-white/80">
                    {credentialsModalData.isReset
                      ? 'New password generated via Supabase Auth'
                      : 'Account provisioned in Supabase Auth'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCredentialsModalData(null)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4 text-body-sm">
              <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/60 space-y-2 text-[13px]">
                <div className="flex justify-between items-center">
                  <span className="text-outline text-[11px]">User Name:</span>
                  <span className="font-bold text-on-surface">{credentialsModalData.user.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-outline text-[11px]">Email Address:</span>
                  <span className="font-semibold text-on-surface font-data-mono">{credentialsModalData.user.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-outline text-[11px]">Assigned Role:</span>
                  <span className="font-bold text-primary">{credentialsModalData.user.role}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-outline text-[11px]">Jurisdiction:</span>
                  <span className="font-semibold text-on-surface uppercase font-data-mono text-[11px]">
                    {availableMunicipalities.find(m => m.id === credentialsModalData.user.municipalityId)?.name || credentialsModalData.user.municipalityId || 'Winneba Municipal Assembly'}
                  </span>
                </div>
              </div>

              {/* Temporary Password Highlight Box */}
              <div>
                <label className="block font-semibold text-on-surface mb-1 text-[12px]">
                  Generated Password
                </label>
                <div className="flex items-center gap-2 p-3 bg-surface-container rounded-xl border border-outline-variant">
                  <span className="material-symbols-outlined text-primary text-[20px]">lock</span>
                  <span className="font-data-mono font-bold text-[16px] text-on-surface flex-1 tracking-wider select-all">
                    {credentialsModalData.user.tempPassword || 'GreenLens@2026!'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(credentialsModalData.user.tempPassword || '');
                      setCopyFeedback(true);
                      setTimeout(() => setCopyFeedback(false), 2500);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-bold font-label-caps flex items-center gap-1.5 transition-all cursor-pointer ${
                      copyFeedback
                        ? 'bg-emerald-600 text-white'
                        : 'bg-primary text-on-primary hover:bg-surface-tint'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {copyFeedback ? 'check' : 'content_copy'}
                    </span>
                    <span>{copyFeedback ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-outline mt-1.5">
                  Copy and send this password to the user. They can sign in immediately using these credentials.
                </p>
              </div>

              {/* Full Invitation Card Copy */}
              <button
                type="button"
                onClick={() => {
                  const muniName = availableMunicipalities.find(m => m.id === credentialsModalData.user.municipalityId)?.name || credentialsModalData.user.municipalityId || 'Winneba Municipal Assembly';
                  const msg = `GreenLens Municipal Command Center Credentials\n\nUser: ${credentialsModalData.user.name}\nEmail: ${credentialsModalData.user.email}\nPassword: ${credentialsModalData.user.tempPassword}\nRole: ${credentialsModalData.user.role}\nJurisdiction: ${muniName}\n\nPlease log in and update your password after initial access.`;
                  navigator.clipboard.writeText(msg);
                  setCopyFeedback(true);
                  setTimeout(() => setCopyFeedback(false), 2500);
                }}
                className="w-full py-2.5 rounded-xl border border-outline-variant hover:border-primary/50 text-on-surface hover:text-primary bg-surface-container-low text-[12px] font-bold font-label-caps flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span className="material-symbols-outlined text-[16px] text-primary">share</span>
                <span>Copy Full Login Message</span>
              </button>
            </div>

            <div className="p-4 bg-surface-container-low border-t border-outline-variant/60 flex justify-end">
              <button
                type="button"
                onClick={() => setCredentialsModalData(null)}
                className="bg-primary text-on-primary hover:bg-surface-tint px-6 py-2 rounded-xl text-[12px] font-label-caps font-bold cursor-pointer shadow-xs"
              >
                Close Dialog
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Municipal PDF Report Modal */}
      <GenerateReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        selectedMunicipality={selectedMunicipality}
        currentUser={currentUser}
        kpis={kpis}
        drainageSegments={drainageSegments}
        incidents={incidentsList}
        fieldTeams={fieldTeams}
        citizenRewards={citizenRewards}
        usersList={users}
        weather={weather}
        onSuccess={showToast}
      />
    </div>
  );
}
