import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Wind, 
  Flame, 
  AlertTriangle, 
  CheckCircle2, 
  Wrench, 
  Info, 
  Sparkles,
  ChevronDown,
  Layers,
  ThermometerSnowflake,
  CookingPot,
  Ban
} from 'lucide-react';

const INDOOR_CHECKLIST = [
  { id: 'c1', label: 'Doors and windows have weatherstrip draft seals installed', room: 'Living & Entry', points: 15 },
  { id: 'c2', label: 'True HEPA or MERV-13 air purifier running in active bedrooms', room: 'Bedrooms', points: 25 },
  { id: 'c3', label: 'Kitchen range hood exhaust runs every time oil/gas stove is used', room: 'Kitchen', points: 20 },
  { id: 'c4', label: 'Strict zero-smoking and zero-incense (agarbatti) indoor policy', room: 'Whole House', points: 20 },
  { id: 'c5', label: 'Purifier pre-filters vacuumed or washed in the past 30 days', room: 'Maintenance', points: 10 },
  { id: 'c6', label: 'Windows kept strictly sealed during 6 AM - 10 AM thermal inversion', room: 'Ventilation', points: 10 },
];

export default function IndoorCoachPage({ aqiData }) {
  const [checkedItems, setCheckedItems] = useState({ c3: true, c4: true });
  const [activeTab, setActiveTab] = useState('audit'); // 'audit' | 'diy-purifier' | 'ventilation' | 'plants-truth'

  const toggleCheck = (id) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const totalScore = INDOOR_CHECKLIST.reduce((acc, item) => {
    return acc + (checkedItems[item.id] ? item.points : 0);
  }, 0);

  const getScoreRating = (score) => {
    if (score >= 85) return { label: "Excellent Indoor Air Fortress", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    if (score >= 60) return { label: "Moderate Protection (Gaps Exist)", color: "text-amber-700 bg-amber-50 border-amber-200" };
    return { label: "High Vulnerability to Outdoor Infiltration", color: "text-red-700 bg-red-50 border-red-200" };
  };

  const rating = getScoreRating(totalScore);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <ShieldCheck className="w-7 h-7 text-emerald-600" />
          <span>Indoor Air Quality Coach</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Science-backed protocols to turn your home into a safe clean-air sanctuary during winter smog.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'audit' 
              ? 'bg-emerald-800 text-white shadow-xs' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Interactive Home Audit
        </button>
        <button
          onClick={() => setActiveTab('diy-purifier')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'diy-purifier' 
              ? 'bg-emerald-800 text-white shadow-xs' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          DIY Corsi-Rosenthal Purifier ($65)
        </button>
        <button
          onClick={() => setActiveTab('ventilation')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'ventilation' 
              ? 'bg-emerald-800 text-white shadow-xs' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Smart Ventilation Windows
        </button>
        <button
          onClick={() => setActiveTab('plants-truth')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'plants-truth' 
              ? 'bg-emerald-800 text-white shadow-xs' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          The Houseplant Reality Check
        </button>
      </div>

      {/* TAB 1: INTERACTIVE AUDIT */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          {/* Score Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
                {totalScore}
              </div>
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Indoor Safety Rating</span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">{rating.label}</h3>
                <p className="text-xs text-slate-500">Check completed items below to calculate your family's protection score.</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-semibold text-slate-400">Outdoor Baseline</span>
              <p className="text-sm font-bold text-slate-800">
                {aqiData?.city}: AQI {aqiData?.aqi || '—'}
              </p>
            </div>
          </div>

          {/* Checklist Items */}
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 font-bold text-xs uppercase tracking-wider text-slate-500 flex justify-between">
              <span>Home Protection Checkpoints</span>
              <span>Score Impact</span>
            </div>
            {INDOOR_CHECKLIST.map((item) => {
              const checked = !!checkedItems[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className="p-4 flex items-center justify-between hover:bg-emerald-50/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                      checked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {checked && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${checked ? 'text-slate-900 line-through opacity-80' : 'text-slate-800'}`}>
                        {item.label}
                      </p>
                      <span className="text-[11px] text-slate-400 font-normal">Zone: {item.room}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    +{item.points} pts
                  </span>
                </div>
              );
            })}
          </div>

          {/* Key Prevention Protocols */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center gap-2 mb-2 text-rose-700 font-bold text-sm">
                <Ban className="w-4 h-4" />
                <h4>Eliminate Indoor Combustion</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Incense sticks (agarbatti), scented candles, and indoor tobacco release high densities of PM2.5, benzene, and acrolein in enclosed rooms.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center gap-2 mb-2 text-amber-700 font-bold text-sm">
                <CookingPot className="w-4 h-4" />
                <h4>Stove & Cooking Discipline</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Frying and gas flame combustion spike indoor particulate counts above 400 µg/m³. Always run kitchen range hoods on maximum fan speed during cooking.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center gap-2 mb-2 text-teal-700 font-bold text-sm">
                <Wrench className="w-4 h-4" />
                <h4>Filter Cleaning Routine</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Vacuum pre-filters every 2-3 weeks in winter. Do NOT wash true HEPA or MERV-13 paper elements with water as moisture destroys electrostatic fiber charges.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DIY PURIFIER */}
      {activeTab === 'diy-purifier' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-teal-600">Open-Source Engineering</span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">The Corsi-Rosenthal Box</h3>
              <p className="text-xs text-slate-500 mt-1">
                A proven, affordable DIY air cleaner developed by environmental engineers that matches the Clean Air Delivery Rate (CADR) of $400+ commercial units.
              </p>
            </div>

            <div className="text-right bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
              <span className="text-xs font-semibold text-emerald-800">Total Build Cost</span>
              <p className="text-xl font-extrabold text-emerald-700">~$60 - $75</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div>
              <h4 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-teal-600" />
                <span>Bill of Materials (Readily Available):</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg">
                  <span className="font-bold text-teal-700">1x</span>
                  <span><strong>20-inch Box Fan:</strong> Standard domestic 3-speed floor box fan ($20 - $25).</span>
                </li>
                <li className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg">
                  <span className="font-bold text-teal-700">4x</span>
                  <span><strong>MERV 13 Furnace Filters (20x20x2 or 20x20x1 inch):</strong> Captures &gt;85% of sub-micron PM2.5 particulates ($35 - $45).</span>
                </li>
                <li className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg">
                  <span className="font-bold text-teal-700">1x</span>
                  <span><strong>Cardboard Shroud & Duct Tape:</strong> For creating the base and sealing all joints ($5).</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-900 text-white rounded-xl p-5 text-xs space-y-3 font-mono">
              <p className="text-teal-400 font-bold uppercase tracking-wider text-[11px]">Assembly Protocol:</p>
              <ol className="list-decimal list-inside space-y-2 text-slate-300">
                <li>Tape the 4 filters into a 4-sided cube. Ensure the <strong>airflow direction arrows</strong> printed on the filter frames all point <em>INWARD</em> toward the center.</li>
                <li>Tape a 20x20 inch cardboard square firmly to the bottom to seal the floor of the cube.</li>
                <li>Mount the 20-inch box fan on top, blowing air <strong>UPWARD</strong> out of the box into the room.</li>
                <li>Apply duct tape to seal every seam airtight. Cut a circular 15-inch cardboard shroud for the front of the fan to eliminate blade back-draft.</li>
              </ol>
              <div className="pt-2 text-[10px] text-slate-400 font-sans border-t border-slate-800">
                Validated by UC Davis & EPA researchers: Delivers ~250–350 CFM of clean, PM2.5-filtered air quietly on speed 1 or 2.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SMART VENTILATION */}
      {activeTab === 'ventilation' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ThermometerSnowflake className="w-5 h-5 text-sky-600" />
            <span>Thermal Inversion & Window Timing Science</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            During winter, outdoor pollution fluctuates dramatically between dawn and midday. Opening windows at the wrong hour will flood your home with toxic smog.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-red-50 border border-red-200">
              <div className="flex items-center gap-2 text-red-800 font-bold text-sm mb-1">
                <Ban className="w-4 h-4 text-red-600" />
                <span>Strict Lockdown Window (6:00 AM – 10:30 AM)</span>
              </div>
              <p className="text-xs text-red-700 leading-relaxed">
                Ground radiation cooling keeps cold air pinned beneath a warm ceiling layer. Fine particles and tailpipe emissions stay trapped at pedestrian height. <strong>Keep all exterior windows and doors sealed.</strong>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Safe Flush Window (1:00 PM – 3:30 PM)</span>
              </div>
              <p className="text-xs text-emerald-700 leading-relaxed">
                Direct solar heating partially destabilizes the surface layer, initiating convective mixing. If your indoor CO2 is elevated, perform a brisk 15-minute cross-ventilation flush during this window, then reseal.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: THE HOUSEPLANT REALITY CHECK */}
      {activeTab === 'plants-truth' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              🌿
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">The Houseplant Myth vs Peer-Reviewed Reality</h3>
              <p className="text-xs text-slate-500">Why potted plants cannot clean room-scale urban air pollution</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-3 leading-relaxed">
            <p>
              <strong>The Origin:</strong> The belief that houseplants purify indoor air stems from the famous 1989 NASA Clean Air Study. However, that experiment was conducted inside a <em>sealed, airtight 1-cubic-meter chamber</em> with zero air exchange, which does not reflect realistic homes.
            </p>
            <p>
              <strong>The Environmental Science Verdict:</strong> In real apartments with normal air exchange rates (0.5 to 1.5 air changes per hour), natural ventilation replaces room air dozens of times faster than potted plant leaves can metabolize volatile organic compounds (VOCs).
            </p>
            <p className="font-semibold text-rose-800 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
              Critical Warning: Houseplants do NOT filter fine particulate matter (PM2.5 or PM10) from the air. Relying on houseplants instead of mechanical filtration during winter smog leaves families directly exposed to toxic inhalation.
            </p>
            <p>
              <strong>BreatheWise Recommendation:</strong> Enjoy houseplants for aesthetics and psychological well-being, but always rely on certified <strong>HEPA filters</strong> or <strong>MERV-13 air cleaners</strong> for actual lung protection.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
