import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Share2, 
  Award, 
  BookOpen, 
  CheckCircle2, 
  Copy, 
  Sparkles, 
  ShieldAlert, 
  ArrowRight,
  ExternalLink,
  Flame,
  Check
} from 'lucide-react';
import { getCommunityChallenges, getSafetyTips, generateShareCard } from '../services/api';

export default function CommunityPage({ aqiData }) {
  const [challenges, setChallenges] = useState([]);
  const [tips, setTips] = useState([]);
  const [pledged, setPledged] = useState({});
  const [copied, setCopied] = useState(false);
  const [shareData, setShareData] = useState(null);

  useEffect(() => {
    getCommunityChallenges().then(data => {
      if (data) setChallenges(data);
    });
    getSafetyTips().then(data => {
      if (data) setTips(data);
    });
  }, []);

  useEffect(() => {
    if (aqiData) {
      generateShareCard(
        aqiData.city,
        aqiData.aqi,
        aqiData.category,
        aqiData.health_guidance
      ).then(data => {
        if (data) setShareData(data);
      });
    }
  }, [aqiData]);

  const togglePledge = (id) => {
    setPledged(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCopyCard = () => {
    if (!shareData) return;
    navigator.clipboard.writeText(shareData.card_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Users className="w-7 h-7 text-teal-600" />
          <span>Community Awareness & Collective Action</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Join community pledges, explore peer-reviewed safety guides, and share verified atmospheric safety alerts.
        </p>
      </div>

      {/* Shareable Safety Alert Card Generator */}
      <div className="bg-gradient-to-tr from-slate-900 via-[#07241d] to-[#041d17] rounded-2xl p-6 text-white shadow-md border border-emerald-900/50">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-emerald-900/40">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800">
              Community Broadcast Generator
            </span>
            <h3 className="text-lg font-bold text-white mt-1">
              Shareable Air Safety Bulletin for {aqiData?.city}
            </h3>
          </div>

          <button
            onClick={handleCopyCard}
            className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-xs"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "Copied to Clipboard!" : "Copy Broadcast Bulletin"}</span>
          </button>
        </div>

        <div className="bg-slate-950/70 p-4 rounded-xl border border-emerald-900/30 font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-line">
          {shareData?.card_text || "Generating verified community card..."}
        </div>
        <p className="text-[11px] text-slate-400 mt-2">
          Format optimized for family WhatsApp groups, neighborhood community portals, and local schools.
        </p>
      </div>

      {/* Active Community Challenges */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            Community Winter Sustainability Challenges
          </h3>
          <span className="text-xs text-slate-400">Real verified civic pledges</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges.map((c) => {
            const isPledged = !!pledged[c.id];
            return (
              <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-100">
                      {c.badge_label}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {(c.participants_count + (isPledged ? 1 : 0)).toLocaleString()} Pledged
                    </span>
                  </div>

                  <h4 className="font-bold text-base text-slate-900 mb-1.5">{c.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">{c.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">{c.target_action}</span>
                  <button
                    onClick={() => togglePledge(c.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isPledged
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-teal-50 hover:text-teal-900 text-slate-700'
                    }`}
                  >
                    {isPledged ? "✓ Pledged" : "Join Pledge"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Verified Pollution Educational Guides */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
          Atmospheric Science & Family Protection Guides
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tips.map((tip, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
                  {tip.category}
                </span>
                {tip.is_winter_smog_focus && (
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                    Winter Smog Focus
                  </span>
                )}
              </div>

              <h4 className="font-bold text-base text-slate-900">{tip.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{tip.summary}</p>

              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Actionable Steps:</p>
                <ul className="space-y-1 text-xs text-slate-600">
                  {tip.practical_steps?.map((step, sIdx) => (
                    <li key={sIdx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0 mt-1.5" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
