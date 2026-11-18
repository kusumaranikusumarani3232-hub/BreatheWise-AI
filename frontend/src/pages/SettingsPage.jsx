import React, { useState } from 'react';
import { 
  Settings, 
  UserCheck, 
  Key, 
  Shield, 
  RotateCcw, 
  Save, 
  Check, 
  Info,
  HeartPulse,
  Baby,
  Users,
  Dumbbell
} from 'lucide-react';

export default function SettingsPage({ 
  userProfile, 
  setUserProfile 
}) {
  const [profile, setProfile] = useState(userProfile);
  const [saved, setSaved] = useState(false);

  const handleToggle = (key) => {
    setProfile(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setUserProfile(profile);
    try {
      localStorage.setItem("breathewise_user_profile", JSON.stringify(profile));
      localStorage.removeItem("breathewise_groq_key");
    } catch (err) {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    const defaultProfile = {
      has_asthma_respiratory: false,
      has_children: false,
      has_elderly: false,
      is_outdoor_worker_athlete: false,
      commute_mode: "mixed"
    };
    setProfile(defaultProfile);
    setUserProfile(defaultProfile);
    try {
      localStorage.removeItem("breathewise_user_profile");
      localStorage.removeItem("breathewise_groq_key");
    } catch (err) {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-teal-600" />
          <span>Settings & Household Profile</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Customize your family's health sensitivity settings, commute preferences, and AI assistant configurations.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Family Sensitivity Profile */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-base border-b border-slate-100 pb-3">
            <UserCheck className="w-5 h-5 text-teal-600" />
            <h3>Household Health & Lifestyle Vulnerabilities</h3>
          </div>
          <p className="text-xs text-slate-500">
            BreatheWise dynamically customizes daily schedules, workout warnings, and indoor recommendations based on these flags.
          </p>

          <div className="space-y-3 pt-2">
            {/* Asthma */}
            <div 
              onClick={() => handleToggle('has_asthma_respiratory')}
              className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                profile.has_asthma_respiratory 
                  ? 'bg-rose-50 border-rose-300' 
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <HeartPulse className={`w-5 h-5 ${profile.has_asthma_respiratory ? 'text-rose-600' : 'text-slate-400'}`} />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Pre-existing Asthma / Bronchial Sensitivity</h4>
                  <p className="text-xs text-slate-500">Triggers heightened alerts during rapid cold smog drops and morning inversions.</p>
                </div>
              </div>
              <input 
                type="checkbox" 
                checked={profile.has_asthma_respiratory} 
                onChange={() => {}} 
                className="w-4 h-4 text-teal-600 rounded" 
              />
            </div>

            {/* Children */}
            <div 
              onClick={() => handleToggle('has_children')}
              className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                profile.has_children 
                  ? 'bg-amber-50 border-amber-300' 
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Baby className={`w-5 h-5 ${profile.has_children ? 'text-amber-600' : 'text-slate-400'}`} />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Young Children (Under 12 years)</h4>
                  <p className="text-xs text-slate-500">Recommends indoor school recess alternatives and child-fit KF94 mask guidelines.</p>
                </div>
              </div>
              <input 
                type="checkbox" 
                checked={profile.has_children} 
                onChange={() => {}} 
                className="w-4 h-4 text-teal-600 rounded" 
              />
            </div>

            {/* Elderly */}
            <div 
              onClick={() => handleToggle('has_elderly')}
              className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                profile.has_elderly 
                  ? 'bg-indigo-50 border-indigo-300' 
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className={`w-5 h-5 ${profile.has_elderly ? 'text-indigo-600' : 'text-slate-400'}`} />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Elderly Family Members (Seniors 65+)</h4>
                  <p className="text-xs text-slate-500">Flags morning cardiovascular exertion risks and overnight air purifier protocols.</p>
                </div>
              </div>
              <input 
                type="checkbox" 
                checked={profile.has_elderly} 
                onChange={() => {}} 
                className="w-4 h-4 text-teal-600 rounded" 
              />
            </div>

            {/* Outdoor Athlete / Worker */}
            <div 
              onClick={() => handleToggle('is_outdoor_worker_athlete')}
              className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                profile.is_outdoor_worker_athlete 
                  ? 'bg-sky-50 border-sky-300' 
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Dumbbell className={`w-5 h-5 ${profile.is_outdoor_worker_athlete ? 'text-sky-600' : 'text-slate-400'}`} />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Regular Outdoor Athlete or Commuter</h4>
                  <p className="text-xs text-slate-500">Recommends indoor cardio alternatives when AQI exceeds 100.</p>
                </div>
              </div>
              <input 
                type="checkbox" 
                checked={profile.is_outdoor_worker_athlete} 
                onChange={() => {}} 
                className="w-4 h-4 text-teal-600 rounded" 
              />
            </div>
          </div>

          {/* Commute Mode */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Primary Commute Mode
            </label>
            <select
              value={profile.commute_mode}
              onChange={(e) => setProfile(prev => ({ ...prev, commute_mode: e.target.value }))}
              className="w-full sm:w-72 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500"
            >
              <option value="mixed">Mixed Transit</option>
              <option value="car">Personal Car (Solo Driving)</option>
              <option value="public_transit">Public Transit (Metro / Bus)</option>
              <option value="cycling">Cycling / Two-Wheeler</option>
              <option value="walking">Walking</option>
            </select>
          </div>
        </div>

        {/* AI & Groq Configuration */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-base border-b border-slate-100 pb-3">
            <Key className="w-5 h-5 text-teal-600" />
            <h3>GenAI Assistant & Security Configuration</h3>
          </div>

          <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-100 text-xs text-teal-900 leading-relaxed">
            <strong>Security & Privacy Architecture:</strong> The Groq API key is managed exclusively within backend server environment variables (<code className="bg-teal-100 px-1 py-0.5 rounded text-[11px]">GROQ_API_KEY</code>). All AI chat interactions are routed securely through the FastAPI backend proxy. No API keys are accepted, processed, or stored in the browser.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">Backend LLM Engine:</span>
              <span>Groq API with open-weight models (<code className="text-teal-700">llama-3.3-70b-versatile</code> / <code className="text-teal-700">llama-3.1-8b-instant</code>).</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">Built-in Rule Fallback:</span>
              <span>Active and fully functional automatically whenever the backend API key is omitted or during network outages.</span>
            </div>
          </div>
        </div>

        {/* Free Tier Data Attributions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <Shield className="w-4 h-4 text-emerald-600" />
            <h4>Data Sources & Free-Tier Guarantees</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            BreatheWise AI is built strictly using free, open-access, zero-cost services:
          </p>
          <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
            <li><strong>Air Quality Data:</strong> Open-Meteo European Air Quality & Atmospheric Monitoring Models (CAMS ensemble). Zero API key required.</li>
            <li><strong>Geocoding:</strong> Open-Meteo Global Geocoding API with multi-language fallback.</li>
            <li><strong>GenAI Engine:</strong> Groq API open-weight model integration with instant local rule-based fallback.</li>
          </ul>
        </div>

        {/* Save / Reset Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-xs transition-all"
          >
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{saved ? "Preferences Saved!" : "Save Preferences"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
