import React, { useState } from 'react';

export default function Header({
  currentView,
  municipalities = [],
  selectedMunicipalityId,
  onSelectMunicipality,
  searchQuery,
  setSearchQuery,
  weatherData,
  onOpenNotifications,
  onOpenHelp
}) {
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);

  const weather = weatherData || { temp: '--', condition: 'Telemetry Active' };
  const munisList = municipalities || [];

  const getBreadcrumbTitle = (viewId) => {
    switch (viewId) {
      case 'dashboard': return 'Overview';
      case 'incidents': return 'Incident Monitoring';
      case 'ai-priority': return 'AI Priority Queue';
      case 'dispatch': return 'Operations Dispatch';
      case 'field-teams': return 'Field Teams Roster';
      case 'digital-twin': return 'Drainage Digital Twin';
      case 'drainage-network': return 'Hydraulic Network';
      case 'flood-risk': return 'Flood Risk Matrix';
      case 'waste-intelligence': return 'Waste Intelligence';
      case 'ai-insights': return 'AI Simulation & Insights';
      case 'analytics': return 'Municipal Analytics';
      case 'alerts': return 'Emergency Alerts';
      case 'administration': return 'Administration & Audit';
      default: return 'Command Center';
    }
  };

  const [showWeatherPopover, setShowWeatherPopover] = useState(false);

  return (
    <header className="fixed top-0 left-72 right-0 h-16 bg-surface/85 backdrop-blur-md border-b border-outline-variant z-40 flex items-center justify-between px-8 select-none">
      {/* Left side: Municipality selector & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-on-surface-variant text-body-sm bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/60">
          <span className="material-symbols-outlined text-[18px] text-primary">location_city</span>
          <select
            value={selectedMunicipalityId}
            onChange={(e) => onSelectMunicipality(e.target.value)}
            className="bg-transparent font-semibold text-on-surface focus:outline-none cursor-pointer text-body-sm"
          >
            {munisList.map((mun) => (
              <option key={mun.id} value={mun.id}>
                {mun.name}
              </option>
            ))}
          </select>
        </div>

        <div className="h-4 w-[1px] bg-outline-variant"></div>

        <nav className="flex items-center gap-2 text-on-surface-variant text-body-sm">
          <span className="hover:text-primary transition-colors cursor-pointer capitalize">
            {currentView === 'dashboard' ? 'Dashboard' : 'Operations'}
          </span>
          <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
          <span className="text-on-surface font-semibold">{getBreadcrumbTitle(currentView)}</span>
        </nav>
      </div>

      {/* Right side: Search, Telemetry Weather, AI status, Actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-outline text-[18px]">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search city data, drains, incidents..."
            className="bg-surface-container-low border border-outline-variant rounded-full pl-9 pr-4 py-1.5 text-body-sm w-56 focus:w-64 transition-all focus:ring-1 focus:ring-primary focus:outline-none placeholder:text-outline"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 text-outline hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        {/* Live Weather & Rainfall Prediction Telemetry */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowWeatherPopover(!showWeatherPopover)}
            className="flex items-center gap-2 bg-secondary-container/30 border border-secondary/20 px-3 py-1.5 rounded-full shadow-2xs hover:bg-secondary-container/50 transition-all cursor-pointer"
            title="Open-Meteo Rainfall & Hydrology Forecast"
          >
            <span className="material-symbols-outlined text-secondary text-[17px] animate-pulse">cloud</span>
            <span className="text-body-sm font-bold text-on-secondary-container">{weather?.temp || '28°C'}</span>
            <span className="text-[11px] text-secondary font-semibold hidden sm:inline flex items-center gap-1">
              <span>🌧️ {weather?.rain24hMm || '28.5'}mm (24h)</span>
            </span>
          </button>

          {/* Rainfall Prediction Popover */}
          {showWeatherPopover && (
            <div className="absolute right-0 top-11 w-80 bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[18px]">rainy</span>
                  <span className="font-title-md text-[13px] text-on-surface font-bold">Open-Meteo Rainfall Prediction</span>
                </div>
                <span className="text-[10px] text-primary font-bold uppercase font-data-mono">Live API</span>
              </div>

              <div className="space-y-2.5 text-[12px]">
                <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/20 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-outline">Projected 24h Rainfall:</span>
                    <span className="font-bold text-risk-critical font-data-mono">{weather?.rain24hMm || '28.5'} mm</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-outline">Precipitation Probability:</span>
                    <span className="font-bold text-primary font-data-mono">{weather?.rainProbability || '85%'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-outline">Current Wind &amp; Humidity:</span>
                    <span className="font-semibold text-on-surface">{weather?.wind || '18 km/h'} • {weather?.humidity || '76%'}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40">
                  <span className="text-[10px] uppercase font-bold text-outline block mb-1">Hydrological Impact Advisory:</span>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    {weather?.warning || 'Convective storm front detected. High surcharge risk on partially silted culverts.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Core Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-container/20 rounded-full border border-primary/30 shadow-2xs">
          <span className="material-symbols-outlined text-primary text-[17px] animate-spin" style={{ animationDuration: '6s' }}>
            temp_preferences_custom
          </span>
          <span className="text-[10px] font-bold text-primary uppercase tracking-wider hidden sm:inline">AI Active</span>
        </div>

        {/* Notifications & Help */}
        <div className="flex items-center gap-3 relative">
          <button
            onClick={() => setShowNotificationsMenu(!showNotificationsMenu)}
            title="Active Notifications"
            className="relative p-1.5 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-risk-critical rounded-full ring-2 ring-background"></span>
          </button>

          {/* Quick Notification Dropdown */}
          {showNotificationsMenu && (
            <div className="absolute right-0 top-10 w-80 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant mb-3">
                <span className="font-title-md text-[14px] text-on-surface font-bold">System Alerts</span>
                <span className="text-[10px] text-primary font-bold uppercase">Live Telemetry</span>
              </div>
              <div className="space-y-2.5 text-body-sm">
                <div className="p-2 rounded-lg bg-error-container/40 border border-error/20 flex gap-2">
                  <span className="material-symbols-outlined text-risk-critical text-[18px] mt-0.5">warning</span>
                  <div>
                    <div className="font-semibold text-on-error-container text-[12px]">Drain D-102 High Blockage (80%)</div>
                    <div className="text-[11px] text-on-surface-variant">Immediate clearance suggested prior to 18h storm.</div>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-primary/5 border border-primary/20 flex gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">check_circle</span>
                  <div>
                    <div className="font-semibold text-on-surface text-[12px]">Rapid Unit 3 Cleanup Completed</div>
                    <div className="text-[11px] text-on-surface-variant">Lowtown Conduit restored to 100% capacity.</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={onOpenHelp}
            title="System Documentation & Guide"
            className="p-1.5 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">help</span>
          </button>
        </div>
      </div>
    </header>
  );
}
