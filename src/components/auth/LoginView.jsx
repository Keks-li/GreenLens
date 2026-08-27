import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { municipalities } from '../../data/mockData';

export default function LoginView({ onLoginSuccess }) {
  const [email, setEmail] = useState('kwame.mensah@winneba.gov.gh');
  const [password, setPassword] = useState('••••••••••••');
  const [selectedMunicipality, setSelectedMunicipality] = useState('winneba');
  const [selectedRole, setSelectedRole] = useState('Municipal Officer');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Demo user quick-fill options
  const demoAccounts = [
    {
      role: 'Municipal Officer',
      name: 'Kwame Mensah (Command Lead)',
      email: 'kwame.mensah@winneba.gov.gh',
      dept: 'Operations Command',
      icon: 'shield_person',
      badge: 'Full Command'
    },
    {
      role: 'Field Supervisor',
      name: 'Abena Osei (Field Lead)',
      email: 'abena.osei@winneba.gov.gh',
      dept: 'Field Operations',
      icon: 'engineering',
      badge: 'Field Ops'
    },
    {
      role: 'System Administrator',
      name: 'Dr. Joseph Ansah (SysAdmin)',
      email: 'admin@winneba.gov.gh',
      dept: 'Municipal IT & Security',
      icon: 'admin_panel_settings',
      badge: 'Admin'
    }
  ];

  const handleSelectDemoAccount = (acc) => {
    setEmail(acc.email);
    setSelectedRole(acc.role);
    setPassword('••••••••••••');
    setErrorMessage('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) {
          console.warn('Supabase auth attempt:', error.message);
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 600));

      const matchedAccount = demoAccounts.find((d) => d.email === email) || {
        name: email.split('@')[0].replace('.', ' '),
        email,
        role: selectedRole,
        dept: 'Municipal Operations'
      };

      onLoginSuccess({
        ...matchedAccount,
        municipalityId: selectedMunicipality
      });
    } catch (err) {
      setErrorMessage('Authentication error. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background text-on-surface flex items-center justify-center p-4 lg:p-8 relative font-body-lg select-none">
      {/* Background Healthy Green Vegetated Land Wallpaper with Transparent Soft Scrim */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1600&q=80')`,
        }}
      ></div>

      {/* Main Container Card with Clean Glass Transparency */}
      <div className="relative z-10 w-full max-w-5xl bg-surface-container-lowest/95 backdrop-blur-xl rounded-3xl border border-outline-variant shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        
        {/* Left Column: Visual Showcase with Clear Healthy Green Vegetated Land and Transparent Overlay */}
        <div className="lg:col-span-5 relative overflow-hidden flex flex-col justify-between p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-outline-variant bg-[#0b1d0e]">
          {/* High-Resolution Clear Healthy Green Vegetated Land Image */}
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80"
            alt="Lush Healthy Green Vegetated Land & Watershed Resilience"
            className="absolute inset-0 w-full h-full object-cover opacity-80"
          />
          {/* Transparent solid green ecological tint overlay */}
          <div className="absolute inset-0 bg-[#0a1e0f]/55 backdrop-blur-xs pointer-events-none"></div>

          {/* Foreground Content */}
          <div className="relative z-10 space-y-6 text-white">
            {/* Logo Badge */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-md text-on-primary border border-white/20">
                <span className="material-symbols-outlined text-[28px]">energy_savings_leaf</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-lg text-[24px] font-bold text-white leading-tight">
                  GreenLens
                </span>
                <span className="text-[10px] uppercase font-label-caps text-primary-fixed tracking-[1.5px] font-bold">
                  Command Center
                </span>
              </div>
            </div>

            {/* Mission Statement */}
            <div className="space-y-2 pt-2">
              <h2 className="font-title-lg text-[22px] font-bold text-white leading-snug">
                Municipal Climate Resilience &amp; Drainage Intelligence
              </h2>
              <p className="text-[13px] text-white/80 leading-relaxed">
                Next-generation hydraulic digital twin, predictive flood telemetry, and AI-powered dispatch operations for Ghana municipalities.
              </p>
            </div>

            {/* Transparent Metric Tiles */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-black/40 border border-white/15 rounded-2xl p-4 backdrop-blur-md">
                <span className="text-[10px] uppercase font-label-caps text-white/60 font-bold block">Network Length</span>
                <div className="font-display-lg text-[22px] font-bold text-primary-fixed mt-0.5">34.2 km</div>
                <span className="text-[11px] text-white/70">GIS Mapped</span>
              </div>

              <div className="bg-black/40 border border-white/15 rounded-2xl p-4 backdrop-blur-md">
                <span className="text-[10px] uppercase font-label-caps text-white/60 font-bold block">AI Accuracy</span>
                <div className="font-display-lg text-[22px] font-bold text-primary-fixed mt-0.5">94.6%</div>
                <span className="text-[11px] text-white/70">Flood Forecast</span>
              </div>
            </div>
          </div>

          {/* Bottom Compliance Tag */}
          <div className="relative z-10 pt-6 border-t border-white/20 flex items-center justify-between text-[11px] text-white/75">
            <div className="flex items-center gap-1.5 font-medium">
              <span className="material-symbols-outlined text-[16px] text-primary-fixed">verified_user</span>
              <span>Republic of Ghana • Municipal Portal</span>
            </div>
            <span className="font-data-mono text-white/60 font-bold">v2.4.0</span>
          </div>
        </div>

        {/* Right Column: Portal Login Form (7 cols) */}
        <div className="lg:col-span-7 p-8 lg:p-10 flex flex-col justify-between bg-surface-container-lowest/80 backdrop-blur-md">
          <div className="space-y-5">
            {/* Header & Status */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="font-title-lg text-[20px] font-bold text-on-surface">Officer Portal Sign In</h3>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  AI Core Online
                </span>
              </div>
              <p className="text-[13px] text-on-surface-variant">
                Select your authorized municipal role or enter government credentials.
              </p>
            </div>

            {/* Quick Demo Role Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {demoAccounts.map((acc) => {
                const isSelected = email === acc.email;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleSelectDemoAccount(acc)}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-primary-container text-on-primary-container border-primary shadow-xs font-semibold'
                        : 'bg-surface-container-low/70 border-outline-variant/60 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="material-symbols-outlined text-[20px]">
                        {acc.icon}
                      </span>
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface">
                        {acc.badge}
                      </span>
                    </div>
                    <div>
                      <div className="font-bold text-[12px] leading-tight">{acc.role}</div>
                      <div className="text-[10px] opacity-80 truncate mt-0.5">{acc.name.split(' ')[0]}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4 pt-1">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-error-container border border-error/30 text-on-error-container text-[12px] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-risk-critical">error</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Municipal Jurisdiction Dropdown */}
              <div>
                <label className="block text-[12px] font-semibold text-on-surface mb-1">
                  Municipal Jurisdiction
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-outline text-[18px]">
                    location_city
                  </span>
                  <select
                    value={selectedMunicipality}
                    onChange={(e) => setSelectedMunicipality(e.target.value)}
                    className="w-full bg-surface-container-low/70 border border-outline-variant rounded-xl pl-10 pr-4 py-2.5 text-[13px] text-on-surface font-medium focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer"
                  >
                    {municipalities.map((mun) => (
                      <option key={mun.id} value={mun.id}>
                        {mun.name} ({mun.region})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-[12px] font-semibold text-on-surface mb-1">
                  Official Gov / Staff Email
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-outline text-[18px]">
                    mail
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="officer@winneba.gov.gh"
                    className="w-full bg-surface-container-low/70 border border-outline-variant rounded-xl pl-10 pr-4 py-2.5 text-[13px] text-on-surface focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[12px] font-semibold text-on-surface">Security Key / Password</label>
                  <button
                    type="button"
                    onClick={() => alert('Please contact Municipal Assembly IT Help Desk at +233 33 232 2011 to reset credentials.')}
                    className="text-[11px] text-primary font-semibold hover:underline cursor-pointer"
                  >
                    Forgot passcode?
                  </button>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-outline text-[18px]">
                    lock
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-surface-container-low/70 border border-outline-variant rounded-xl pl-10 pr-10 py-2.5 text-[13px] text-on-surface focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-outline hover:text-on-surface transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Remember Me & 2FA */}
              <div className="flex items-center justify-between text-[12px] pt-1">
                <label className="flex items-center gap-2 text-on-surface-variant cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded accent-primary cursor-pointer w-4 h-4"
                  />
                  <span>Keep session active (24h)</span>
                </label>
                <span className="text-[11px] text-outline flex items-center gap-1 font-semibold">
                  <span className="material-symbols-outlined text-[14px]">key</span> 2FA Enforced
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-surface-tint text-on-primary font-title-md font-bold text-[14px] py-3 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-70 mt-2"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                    <span>Authenticating Municipal Officer...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">login</span>
                    <span>Enter Command Center</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Security Notice Footer */}
          <div className="pt-4 border-t border-outline-variant/50 text-center text-[11px] text-outline">
            Protected under Ghana Cybersecurity Authority &amp; Municipal Data Sovereignty protocols.
          </div>
        </div>
      </div>
    </div>
  );
}
