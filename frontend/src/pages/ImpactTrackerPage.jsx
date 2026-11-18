import React, { useState, useEffect } from 'react';
import { 
  TrendingDown, 
  PlusCircle, 
  CheckCircle2, 
  Car, 
  Bus, 
  Flame, 
  Zap, 
  HelpCircle, 
  Trash2, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { getImpactSummary, getImpactPresets } from '../services/api';

const DEFAULT_ACTIONS = [
  {
    id: "act-1",
    date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    action_type: "transit_replace_car",
    label: "Electric Metro Commute (Replaced Solo Car)",
    distance_km: 16,
    co2_saved_kg: 2.24,
    personal_exposure_reduced: "Protected from ground-level road exhaust plumes."
  },
  {
    id: "act-2",
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    action_type: "avoid_idle",
    label: "Anti-Idling at School Pickup (12 min shutdown)",
    distance_km: 0,
    co2_saved_kg: 0.30,
    personal_exposure_reduced: "Eliminated raw soot plumes outside school gate."
  },
  {
    id: "act-3",
    date: new Date().toISOString().split('T')[0],
    action_type: "carpool",
    label: "Shared Ride to Office with Colleagues",
    distance_km: 14,
    co2_saved_kg: 1.26,
    personal_exposure_reduced: "Vehicle count reduced on arterial corridor."
  }
];

export default function ImpactTrackerPage() {
  const [actions, setActions] = useState(() => {
    try {
      const saved = localStorage.getItem("breathewise_logged_actions");
      return saved ? JSON.parse(saved) : DEFAULT_ACTIONS;
    } catch {
      return DEFAULT_ACTIONS;
    }
  });

  const [summary, setSummary] = useState(null);
  const [presets, setPresets] = useState([]);
  const [selectedType, setSelectedType] = useState("transit_replace_car");
  const [customKm, setCustomKm] = useState(12);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    getImpactPresets().then(data => {
      if (data && data.length > 0) setPresets(data);
    });
  }, []);

  useEffect(() => {
    getImpactSummary(actions).then(data => {
      if (data) setSummary(data);
    });
    try {
      localStorage.setItem("breathewise_logged_actions", JSON.stringify(actions));
    } catch (e) {}
  }, [actions]);

  const handleAddAction = (e) => {
    e.preventDefault();
    let label = "Sustainable Commute";
    let co2 = 0;
    let exposure = "General emissions mitigation";

    if (selectedType === "transit_replace_car") {
      label = `Electric Transit Commute (${customKm} km)`;
      co2 = Number((customKm * 0.14).toFixed(2));
      exposure = "Filtered train cabin; avoids traffic tailpipe gases.";
    } else if (selectedType === "carpool") {
      label = `Carpool Ride (${customKm} km)`;
      co2 = Number((customKm * 0.09).toFixed(2));
      exposure = "Halved per-capita vehicle presence.";
    } else if (selectedType === "avoid_idle") {
      label = `Engine Anti-Idling Cutoff (10+ min)`;
      co2 = 0.25;
      exposure = "Stops dense soot emissions at pedestrian height.";
    } else if (selectedType === "bike_walk") {
      label = `Walk/Bike Neighborhood Trip (${customKm} km)`;
      co2 = Number((customKm * 0.18).toFixed(2));
      exposure = "Zero tailpipe emission (safe window only).";
    } else {
      label = `Home Energy Conservation`;
      co2 = 0.85;
      exposure = "Lowers regional grid load.";
    }

    const newAction = {
      id: "act-" + Date.now(),
      date: new Date().toISOString().split('T')[0],
      action_type: selectedType,
      label,
      distance_km: ["transit_replace_car", "carpool", "bike_walk"].includes(selectedType) ? Number(customKm) : 0,
      co2_saved_kg: co2,
      personal_exposure_reduced: exposure
    };

    setActions(prev => [newAction, ...prev]);
    setIsAdding(false);
  };

  const handleDeleteAction = (id) => {
    setActions(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <TrendingDown className="w-7 h-7 text-teal-600" />
            <span>Personal Impact & Emissions Tracker</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quantify your positive contribution to cleaner urban skies and track estimated emissions avoided.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-teal-600 text-white hover:bg-teal-700 shadow-xs transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isAdding ? "Cancel" : "Log Sustainable Action"}</span>
        </button>
      </div>

      {/* Log Action Modal / Form */}
      {isAdding && (
        <form onSubmit={handleAddAction} className="bg-white rounded-2xl border border-teal-200 p-5 shadow-md space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Log an Environmental Action</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Select Action Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500"
              >
                <option value="transit_replace_car">Public Transit (Metro / Electric Bus)</option>
                <option value="carpool">Carpooling / Ride Sharing</option>
                <option value="avoid_idle">Vehicle Anti-Idling (10 min cutoff)</option>
                <option value="bike_walk">Walking / Cycling (Safe AQI days)</option>
                <option value="energy_saving">Home Energy Conservation (Heating check)</option>
              </select>
            </div>

            {["transit_replace_car", "carpool", "bike_walk"].includes(selectedType) && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Distance (km)</label>
                <input
                  type="number"
                  min="1"
                  max="150"
                  value={customKm}
                  onChange={(e) => setCustomKm(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs"
            >
              Record Action
            </button>
          </div>
        </form>
      )}

      {/* Top 4 Impact Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Total CO2 Avoided</span>
          <p className="text-3xl font-extrabold text-teal-700 mt-1">
            {summary?.total_co2_saved_kg || 0} <span className="text-sm font-semibold text-slate-500">kg</span>
          </p>
          <span className="text-[11px] text-slate-400 mt-2 block">IPCC emissions coefficient model</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Solo Car Trips Replaced</span>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">
            {summary?.car_trips_replaced || 0} <span className="text-sm font-semibold text-slate-500">trips</span>
          </p>
          <span className="text-[11px] text-slate-400 mt-2 block">Reduced corridor congestion</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Clean Travel Distance</span>
          <p className="text-3xl font-extrabold text-emerald-700 mt-1">
            {summary?.clean_km_traveled || 0} <span className="text-sm font-semibold text-slate-500">km</span>
          </p>
          <span className="text-[11px] text-slate-400 mt-2 block">Electrified or shared transit</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Actions Completed</span>
          <p className="text-3xl font-extrabold text-sky-700 mt-1">
            {summary?.actions_completed || 0} <span className="text-sm font-semibold text-slate-500">logs</span>
          </p>
          <span className="text-[11px] text-slate-400 mt-2 block">Verified personal logs</span>
        </div>
      </div>

      {/* Weekly Progress Bar Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-1">Weekly Greenhouse Emissions Avoided (kg CO2e)</h3>
        <p className="text-xs text-slate-500 mb-4">Calculated across your logged commutes and actions over the past 7 days.</p>
        
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summary?.weekly_breakdown || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-lg">
                        <p className="font-semibold text-slate-300">{label}</p>
                        <p className="text-teal-400 font-bold">{payload[0].value} kg CO2e saved</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="co2_kg" fill="#0d9488" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Scientific Distinction Banner - Mandatory Requirement */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <strong className="block text-sm font-bold text-amber-900 mb-1">
            Crucial Scientific Distinction: Global CO2 Mitigation vs Direct Personal PM2.5 Inhalation
          </strong>
          {summary?.distinction_disclaimer || (
            "CO2 savings represent greenhouse gas emissions prevented from entering the global atmosphere. They do NOT equate to an immediate personal reduction in PM2.5 inhalation. Immediate personal health protection requires indoor air filtration, window sealing during thermal inversions, and certified N95 respirators outdoors."
          )}
        </div>
      </div>

      {/* Action History Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-800">Your Sustainability Activity Log</h3>
          <span className="text-xs text-slate-500">{actions.length} activities recorded</span>
        </div>

        {actions.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No sustainable actions logged yet. Click "Log Sustainable Action" above to start tracking!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {actions.map((act) => (
              <div key={act.id} className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{act.label}</h4>
                    <p className="text-[11px] text-slate-500">
                      Date: {act.date} • {act.personal_exposure_reduced}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-teal-700">+{act.co2_saved_kg} kg</span>
                    <span className="text-[10px] text-slate-400 block">CO2e avoided</span>
                  </div>
                  <button
                    onClick={() => handleDeleteAction(act.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
