import React from 'react';
import { isViewAllowed, getPermissionsForRole } from '../../lib/rbac';

export default function Sidebar({
  currentView,
  setCurrentView,
  selectedMunicipality,
  currentUser,
  onLogout,
  isMobileOpen = false,
  onCloseMobile
}) {
  const userRole = currentUser?.role || 'Municipal Officer';
  const roleInfo = getPermissionsForRole(userRole);

  const rawNavSections = [
    {
      title: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
      ]
    },
    {
      title: 'Operations',
      items: [
        { id: 'incidents', label: 'Incidents', icon: 'report_problem', badge: '12' },
        { id: 'ai-priority', label: 'AI Priority', icon: 'auto_awesome', badge: '3' },
        { id: 'dispatch', label: 'Dispatch', icon: 'local_shipping' },
        { id: 'field-teams', label: 'Field Teams', icon: 'groups' },
      ]
    },
    {
      title: 'Infrastructure',
      items: [
        { id: 'digital-twin', label: 'Digital Twin', icon: 'hub' },
        { id: 'drainage-network', label: 'Drainage Network', icon: 'waves' },
        { id: 'flood-risk', label: 'Flood Risk', icon: 'flood' },
      ]
    },
    {
      title: 'Intelligence',
      items: [
        { id: 'waste-intelligence', label: 'Refuse & Rewards', icon: 'military_tech' },
        { id: 'ai-insights', label: 'AI Insights', icon: 'psychology_alt' },
        { id: 'analytics', label: 'Analytics', icon: 'monitoring' },
      ]
    },
    {
      title: 'Global',
      items: [
        { id: 'alerts', label: 'Alerts', icon: 'notifications_active', badge: '4' },
        { id: 'administration', label: 'User Management', icon: 'manage_accounts' },
      ]
    }
  ];

  // Filter sections and items based on active role permissions
  const navSections = rawNavSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => isViewAllowed(userRole, item.id))
    }))
    .filter((section) => section.items.length > 0);

  const handleSelectNav = (viewId) => {
    setCurrentView(viewId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-surface-container-low/80 backdrop-blur-md select-none border-r border-outline-variant/60">
      {/* Brand Header */}
      <div className="p-5 sm:p-6 flex items-center justify-between border-b border-outline-variant/50 mb-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-primary flex items-center justify-center shadow-md shadow-primary/20 text-white">
            <span className="material-symbols-outlined text-[24px]">energy_savings_leaf</span>
          </div>
          <div className="flex flex-col">
            <span className="font-title-md text-on-surface leading-tight font-bold tracking-tight text-[18px]">
              Green<span className="text-primary">Lens</span>
            </span>
            <span className="text-[10px] uppercase font-label-caps text-on-surface-variant font-bold tracking-[1.2px]">
              Command Center
            </span>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="p-2 rounded-xl text-outline hover:text-on-surface hover:bg-surface-container lg:hidden transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 flex flex-col gap-1 pb-4 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.title} className="flex flex-col">
            <div className="text-label-caps text-outline uppercase px-3 py-2 mt-3 tracking-wider text-[10px] font-bold">
              {section.title}
            </div>
            {section.items.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectNav(item.id)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all text-left gap-3 ${
                    isActive
                      ? 'bg-primary text-white font-semibold shadow-sm shadow-primary/20'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`material-symbols-outlined text-[20px] ${
                        isActive ? 'text-white' : 'text-outline'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="text-body-sm text-[13.5px]">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : item.id === 'incidents' || item.id === 'alerts'
                          ? 'bg-error-container text-on-error-container'
                          : 'bg-primary-container text-on-primary-container'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Profile / Status */}
      <div className="mt-auto p-4 border-t border-outline-variant/50 bg-surface-container-low/90">
        <div className="bg-surface-container-lowest rounded-2xl p-3.5 flex items-center justify-between gap-2 border border-outline-variant/60 shadow-card-soft hover:shadow-md transition-all">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white shadow-xs shrink-0 font-bold text-[13px]">
              {currentUser?.name?.charAt(0) || 'K'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-body-sm font-bold text-on-surface truncate text-[13px]">
                {currentUser?.name?.split('(')[0] || 'Kwame Mensah'}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-primary-container text-on-primary-container">
                  {roleInfo.badge}
                </span>
                <span className="text-[10px] text-on-surface-variant truncate font-medium">
                  {selectedMunicipality?.name?.split(' ')[0] || 'Winneba'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            title="Sign Out / Switch Officer"
            className="p-2 rounded-xl text-outline hover:text-risk-critical hover:bg-error-container/40 transition-colors shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-72 border-r border-outline-variant z-50 flex-col overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Slide-Over */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer container */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
