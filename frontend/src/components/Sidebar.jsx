import React, { useMemo, memo } from 'react';
import { 
  LayoutDashboard, 
  Bot, 
  CalendarClock, 
  ShieldCheck, 
  Leaf, 
  TrendingDown, 
  Users, 
  Settings,
  Sparkles,
  HeartPulse,
  X
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: 'Live' },
  { id: 'ai-assistant', label: 'AI Assistant', icon: Bot, isSpecial: true },
  { id: 'daily-planner', label: 'Daily Planner', icon: CalendarClock },
  { id: 'indoor-coach', label: 'Indoor Air Coach', icon: ShieldCheck },
  { id: 'eco-alternatives', label: 'Eco Alternatives', icon: Leaf },
  { id: 'impact-tracker', label: 'Impact Tracker', icon: TrendingDown },
  { id: 'community', label: 'Community', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

function SidebarComponent({ activeTab, setActiveTab, isOpen, setIsOpen, userProfile }) {
  const activeSensitivities = useMemo(() => {
    const list = [];
    if (userProfile?.has_asthma_respiratory) list.push("Asthma Alert");
    if (userProfile?.has_children) list.push("Children");
    if (userProfile?.has_elderly) list.push("Seniors");
    return list;
  }, [userProfile?.has_asthma_respiratory, userProfile?.has_children, userProfile?.has_elderly]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-50 h-screen w-64 
        bg-gradient-to-b from-slate-950 via-[#07241d] to-[#041d17] 
        text-slate-200 border-r border-emerald-950/60 flex flex-col justify-between
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div>
          <div className="p-5 flex items-center justify-between border-b border-emerald-900/40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-400">
                <Leaf className="w-4 h-4" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-wide text-white">BreatheWise</span>
                <span className="ml-1 text-[10px] font-semibold text-teal-400 bg-teal-950 border border-teal-800/80 px-1.5 py-0.5 rounded">v1.0</span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="md:hidden p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all
                    ${isActive 
                      ? 'bg-emerald-600/30 text-white border border-emerald-500/40 shadow-sm shadow-emerald-900/40' 
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {item.badge}
                    </span>
                  )}

                  {item.isSpecial && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      <Sparkles className="w-2.5 h-2.5" /> AI
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile Summary Card */}
        <div className="p-4 border-t border-emerald-950/80 bg-slate-950/40">
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-xs">
            <div className="flex items-center gap-2 mb-1 text-teal-300 font-semibold">
              <HeartPulse className="w-3.5 h-3.5" />
              <span>Family Protection Shield</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
              {activeSensitivities.length > 0
                ? `Active filters: ${activeSensitivities.join(", ")}`
                : "No high-risk health sensitivities active."}
            </p>
            <button
              onClick={() => {
                setActiveTab('settings');
                setIsOpen(false);
              }}
              className="text-[11px] text-teal-400 hover:text-teal-300 underline font-medium"
            >
              Configure household profile →
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default memo(SidebarComponent);
