import React, { useState, useEffect } from 'react';
import { 
  CalendarClock, 
  Sun, 
  Moon, 
  Sunset, 
  AlertTriangle, 
  Dumbbell, 
  Bus, 
  GraduationCap, 
  CheckCircle2, 
  RefreshCw, 
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { getDailyPlanner } from '../services/api';

export default function DailyPlannerPage({ aqiData, userProfile }) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPlan = async () => {
    if (!aqiData) return;
    setLoading(true);
    try {
      const data = await getDailyPlanner(
        aqiData.city,
        aqiData.aqi,
        aqiData.pm2_5,
        userProfile,
        aqiData.hourly_trends
      );
      setPlan(data);
    } catch (err) {
      console.error("Failed to load plan:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, [aqiData, userProfile]);

  if (loading && !plan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium">Generating atmospheric-aware personalized routine...</p>
      </div>
    );
  }

  const getCautionBadge = (level) => {
    if (level === 'high') {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">High Caution</span>;
    }
    if (level === 'medium') {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">Moderate Caution</span>;
    }
    return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Optimal Window</span>;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <CalendarClock className="w-7 h-7 text-teal-600" />
            <span>Personalized Daily Routine Planner</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tailored schedule for <strong>{aqiData?.city}</strong> • {plan?.date} • Based on current AQI: <strong>{aqiData?.aqi}</strong>
          </p>
        </div>

        <button
          onClick={fetchPlan}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal-600' : ''}`} />
          <span>Regenerate Routine</span>
        </button>
      </div>

      {/* Critical Status Bar */}
      <div className="p-4 rounded-2xl bg-teal-900 text-white flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-teal-300 block mb-1">
            Atmospheric Health Assessment
          </span>
          <p className="text-base font-bold">{plan?.overall_status}</p>
        </div>

        {plan?.safer_outdoor_windows?.length > 0 && (
          <div className="bg-teal-950/70 border border-teal-700/60 rounded-xl px-4 py-2 text-xs">
            <span className="text-teal-300 font-semibold flex items-center gap-1.5 mb-0.5">
              <Clock className="w-3.5 h-3.5" /> Recommended Outdoor Window:
            </span>
            <span className="text-white font-medium">{plan.safer_outdoor_windows[0]}</span>
          </div>
        )}
      </div>

      {/* Critical Warnings if any */}
      {plan?.critical_warnings?.length > 0 && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-sm space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-red-800">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>Winter Smog Health Warning</span>
          </div>
          <ul className="list-disc list-inside text-xs space-y-1 pl-1">
            {plan.critical_warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Structured Day Plan: Morning, Afternoon, Evening */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
          Diurnal Structured Schedule (Why & What To Do)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Morning Routine Card */}
          {plan?.morning_routine && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-amber-600">
                    <Sun className="w-5 h-5" />
                    <span className="font-bold text-sm text-slate-900">{plan.morning_routine.time_window}</span>
                  </div>
                  {getCautionBadge(plan.morning_routine.caution_level)}
                </div>

                <h4 className="font-bold text-base text-slate-800 mb-2">{plan.morning_routine.title}</h4>
                <p className="text-xs text-slate-700 leading-relaxed mb-4">{plan.morning_routine.recommendation}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
                <strong className="text-slate-800 block mb-1 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-teal-600" /> Scientific Reason:
                </strong>
                {plan.morning_routine.why}
              </div>
            </div>
          )}

          {/* Afternoon Routine Card */}
          {plan?.afternoon_routine && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sky-600">
                    <Sunset className="w-5 h-5" />
                    <span className="font-bold text-sm text-slate-900">{plan.afternoon_routine.time_window}</span>
                  </div>
                  {getCautionBadge(plan.afternoon_routine.caution_level)}
                </div>

                <h4 className="font-bold text-base text-slate-800 mb-2">{plan.afternoon_routine.title}</h4>
                <p className="text-xs text-slate-700 leading-relaxed mb-4">{plan.afternoon_routine.recommendation}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
                <strong className="text-slate-800 block mb-1 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-teal-600" /> Scientific Reason:
                </strong>
                {plan.afternoon_routine.why}
              </div>
            </div>
          )}

          {/* Evening Routine Card */}
          {plan?.evening_routine && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <Moon className="w-5 h-5" />
                    <span className="font-bold text-sm text-slate-900">{plan.evening_routine.time_window}</span>
                  </div>
                  {getCautionBadge(plan.evening_routine.caution_level)}
                </div>

                <h4 className="font-bold text-base text-slate-800 mb-2">{plan.evening_routine.title}</h4>
                <p className="text-xs text-slate-700 leading-relaxed mb-4">{plan.evening_routine.recommendation}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
                <strong className="text-slate-800 block mb-1 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-teal-600" /> Scientific Reason:
                </strong>
                {plan.evening_routine.why}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Practical Supplements: Exercise, Commute, School/Work */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Exercise Alternatives */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3 text-slate-800 font-bold text-sm">
            <Dumbbell className="w-4 h-4 text-teal-600" />
            <h4>Indoor Exercise Alternatives</h4>
          </div>
          <ul className="space-y-2 text-xs text-slate-600">
            {plan?.indoor_exercise_alternatives?.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Low-Emission Commute */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3 text-slate-800 font-bold text-sm">
            <Bus className="w-4 h-4 text-emerald-600" />
            <h4>Safe & Low-Emission Commuting</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {plan?.low_emission_commute_advice}
          </p>
          <div className="mt-3 p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 text-[11px] text-emerald-800 font-medium">
            💡 Tip: Turn on vehicle air recirculation mode to block up to 70% of external exhaust gases.
          </div>
        </div>

        {/* School & Work Precautions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3 text-slate-800 font-bold text-sm">
            <GraduationCap className="w-4 h-4 text-sky-600" />
            <h4>School & Workplace Precautions</h4>
          </div>
          <ul className="space-y-2 text-xs text-slate-600">
            {plan?.school_and_work_precautions?.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0 mt-1.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
