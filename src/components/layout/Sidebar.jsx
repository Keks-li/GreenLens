import React from 'react';
import { isViewAllowed, getPermissionsForRole } from '../../lib/rbac';

export default function Sidebar({
  currentView,
  setCurrentView,
  selectedMunicipality,
  currentUser,
  onLogout
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

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-surface-container-low border-r border-outline-variant z-50 flex flex-col overflow-y-auto select-none">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 border-b border-outline-variant mb-2">
        <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-xs">
          <span className="material-symbols-outlined text-primary text-[24px]">energy_savings_leaf</span>
        </div>
        <div className="flex flex-col">
          <span className="font-title-md text-primary leading-tight font-bold tracking-tight">GreenLens</span>
          <span className="text-[10px] uppercase font-label-caps text-on-surface-variant tracking-[1px]">
            Command Center
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 flex flex-col gap-1 pb-4">
        {navSections.map((section) => (
          <div key={section.title} className="flex flex-col">
            <div className="text-label-caps text-outline uppercase px-4 py-2 mt-3 tracking-wider text-[11px]">
              {section.title}
            </div>
            {section.items.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-lg transition-all text-left gap-3 ${
                    isActive
                      ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`material-symbols-outlined text-[20px] ${
                        isActive ? 'text-on-primary-container' : 'text-outline'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="text-body-sm">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        isActive
                          ? 'bg-on-primary-container/20 text-on-primary-container'
                          : item.id === 'incidents' || item.id === 'alerts'
                          ? 'bg-error-container text-on-error-container'
                          : 'bg-primary/10 text-primary'
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
      <div className="mt-auto p-4 border-t border-outline-variant/60 bg-surface-container-low">
        <div className="bg-surface-container-high rounded-xl p-3 flex items-center justify-between gap-2 border border-outline-variant/40 hover:bg-surface-container-highest transition-colors">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-xs shrink-0 font-bold text-[12px]">
              {currentUser?.name?.charAt(0) || 'K'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-body-sm font-semibold text-on-surface truncate text-[13px]">
                {currentUser?.name?.split('(')[0] || 'Kwame Mensah'}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-primary/15 text-primary">
                  {roleInfo.badge}
                </span>
                <span className="text-[10px] text-on-surface-variant truncate">
                  {selectedMunicipality?.name?.split(' ')[0] || 'Winneba'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            title="Sign Out / Switch Officer"
            className="p-1.5 rounded-lg text-outline hover:text-risk-critical hover:bg-surface-container transition-colors shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
