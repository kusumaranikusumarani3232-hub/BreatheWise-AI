import React, { useState } from 'react';
import { 
  Leaf, 
  Bus, 
  Users, 
  Bike, 
  Car, 
  Zap, 
  Flame, 
  TrendingDown, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert,
  Sliders
} from 'lucide-react';

const ECO_ACTIONS = [
  {
    title: "Shift to Electric Metro / Bus Rapid Transit",
    category: "Mobility",
    icon: Bus,
    co2Saving: "0.14 kg CO2e / passenger-km",
    impactText: "Cuts personal commute carbon by up to 78% compared to single-occupant gasoline cars.",
    whyItMatters: "Concentrates commuters into mass electrified corridors, drastically reducing localized roadside PM2.5 and nitrogen dioxide plumes.",
    practicalTip: "Trains are pressurized and have industrial air filters that protect riders from street-level tailpipe exhaust."
  },
  {
    title: "Anti-Idling Discipline (School & Traffic)",
    category: "Urban Habit",
    icon: Flame,
    co2Saving: "0.25 kg CO2e / 10 mins cutoff",
    impactText: "Eliminates raw, unburned hydrocarbons and toxic soot emitted while parked or waiting.",
    whyItMatters: "Idling vehicles produce higher concentrations of toxic exhaust than vehicles in motion because engines run below optimal combustion temperature.",
    practicalTip: "If waiting for someone for more than 30 seconds (except in moving traffic), turn the key completely off."
  },
  {
    title: "Carpooling & Trip Chaining",
    category: "Efficiency",
    icon: Users,
    co2Saving: "0.09 kg CO2e / passenger-km",
    impactText: "Halves vehicular traffic per person and reduces parking congestion.",
    whyItMatters: "Combining multiple separate errands into one continuous circuit eliminates cold-engine start cycles.",
    practicalTip: "Organize neighborhood carpools with parents for morning school runs."
  },
  {
    title: "Electrifying Domestic Heating & Cooking",
    category: "Home Energy",
    icon: Zap,
    co2Saving: "1.2 - 2.5 kg CO2e / day",
    impactText: "Replaces kerosene, biomass, or inefficient resistive heaters with heat pumps or induction stoves.",
    whyItMatters: "Eliminates indoor combustion sources that emit unvented carbon monoxide and particulate matter directly into sleeping quarters.",
    practicalTip: "Induction cooktops heat cookware directly with 85-90% thermal efficiency vs 40% for gas burners."
  },
  {
    title: "Active Transit (Safe AQI Windows Only)",
    category: "Health & Eco",
    icon: Bike,
    co2Saving: "0.18 kg CO2e / km",
    impactText: "Zero operational greenhouse gases and zero tailpipe particulate generation.",
    whyItMatters: "Replaces car use for short sub-3 km trips where cold engines pollute most heavily.",
    practicalTip: "CRITICAL: Only walk or cycle when outdoor AQI is below 100. Never cycle in severe smog."
  }
];

export default function EcoAlternativesPage({ aqiData, setActiveTab }) {
  const [tripKm, setTripKm] = useState(12);

  // Carbon comparison math (kg CO2e for the trip)
  const soloCarCo2 = (tripKm * 0.18).toFixed(2);
  const carpoolCo2 = (tripKm * 0.09).toFixed(2);
  const transitCo2 = (tripKm * 0.04).toFixed(2);
  const activeCo2 = "0.00";

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Leaf className="w-7 h-7 text-teal-600" />
          <span>Sustainable Alternatives & Clean Commute</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Practical low-emission lifestyle choices that lower your environmental footprint while minimizing pollution exposure.
        </p>
      </div>

      {/* Interactive Trip Mode Comparison Calculator */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-teal-600" />
              <span>Interactive Commute Carbon & Health Comparator</span>
            </h3>
            <p className="text-xs text-slate-500">
              Calculate emissions and pollution exposure differences across transit modes for your daily travel.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl text-xs font-semibold">
            <span className="text-slate-600 pl-2">One-way distance:</span>
            <input
              type="number"
              min="1"
              max="100"
              value={tripKm}
              onChange={(e) => setTripKm(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 px-2 py-1 text-center bg-white border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-teal-600"
            />
            <span className="text-slate-500 pr-1">km</span>
          </div>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {/* Solo Car */}
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                <Car className="w-4 h-4" />
                <span>Solo Gasoline Car</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-200 text-rose-900">Baseline</span>
            </div>
            <p className="text-2xl font-extrabold text-rose-700">{soloCarCo2} <span className="text-xs font-normal">kg CO2</span></p>
            <p className="text-[11px] text-slate-600 mt-2">
              Generates high roadside smog. Traps driver in slow bumper-to-bumper vehicle exhaust without high-efficiency air recirculation.
            </p>
          </div>

          {/* Carpool */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                <Users className="w-4 h-4" />
                <span>Carpool (2-3 riders)</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900">-50% CO2</span>
            </div>
            <p className="text-2xl font-extrabold text-amber-700">{carpoolCo2} <span className="text-xs font-normal">kg CO2</span></p>
            <p className="text-[11px] text-slate-600 mt-2">
              Cuts per-capita emissions in half and reduces road vehicle counts. Ensure car ventilation is set to internal recirculation.
            </p>
          </div>

          {/* Electric Metro / Bus */}
          <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-teal-800 font-bold text-sm">
                <Bus className="w-4 h-4" />
                <span>Electric Metro / Bus</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-200 text-teal-900">-78% CO2</span>
            </div>
            <p className="text-2xl font-extrabold text-teal-700">{transitCo2} <span className="text-xs font-normal">kg CO2</span></p>
            <p className="text-[11px] text-slate-600 mt-2">
              <strong>Best health choice during winter smog.</strong> Subways have air filtration and avoid idling in street tailpipe exhaust.
            </p>
          </div>

          {/* Walk / Cycle */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <Bike className="w-4 h-4" />
                <span>Walk / Cycling</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">Zero CO2</span>
            </div>
            <p className="text-2xl font-extrabold text-emerald-700">{activeCo2} <span className="text-xs font-normal">kg CO2</span></p>
            <p className="text-[11px] text-slate-600 mt-2">
              Zero emissions. <span className="font-semibold text-rose-700">Warning:</span> Only do this when AQI is below 100 to avoid heavy particle inhalation.
            </p>
          </div>
        </div>
      </div>

      {/* Sustainable Lifestyle Guide Cards */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
          High-Impact Environmental Actions & Scientific Benefits
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ECO_ACTIONS.map((action, idx) => {
            const Icon = action.icon;
            return (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-100">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm sm:text-base text-slate-900">{action.title}</h4>
                        <span className="text-[11px] font-semibold text-slate-400">{action.category}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                      {action.co2Saving}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {action.whyItMatters}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 italic text-[11px]">{action.practicalTip}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
