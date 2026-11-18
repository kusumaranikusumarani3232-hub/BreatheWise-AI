import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import AIAssistantPage from './pages/AIAssistantPage';
import DailyPlannerPage from './pages/DailyPlannerPage';
import IndoorCoachPage from './pages/IndoorCoachPage';
import EcoAlternativesPage from './pages/EcoAlternativesPage';
import ImpactTrackerPage from './pages/ImpactTrackerPage';
import CommunityPage from './pages/CommunityPage';
import SettingsPage from './pages/SettingsPage';
import { useAirQuality } from './hooks/useAirQuality';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // User Profile State
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("breathewise_user_profile");
      return saved ? JSON.parse(saved) : {
        has_asthma_respiratory: false,
        has_children: false,
        has_elderly: false,
        is_outdoor_worker_athlete: false,
        commute_mode: "mixed"
      };
    } catch {
      return {
        has_asthma_respiratory: false,
        has_children: false,
        has_elderly: false,
        is_outdoor_worker_athlete: false,
        commute_mode: "mixed"
      };
    }
  });

  const [userGroqKey, setUserGroqKey] = useState(() => {
    try {
      return localStorage.getItem("breathewise_groq_key") || "";
    } catch {
      return "";
    }
  });

  const {
    location,
    aqiData,
    loading,
    error,
    isLocating,
    refresh,
    selectCity,
    useBrowserGeolocation
  } = useAirQuality();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardPage
            aqiData={aqiData}
            loading={loading}
            setActiveTab={setActiveTab}
            userProfile={userProfile}
          />
        );
      case 'ai-assistant':
        return (
          <AIAssistantPage
            aqiData={aqiData}
            userProfile={userProfile}
            userGroqKey={userGroqKey}
          />
        );
      case 'daily-planner':
        return (
          <DailyPlannerPage
            aqiData={aqiData}
            userProfile={userProfile}
          />
        );
      case 'indoor-coach':
        return (
          <IndoorCoachPage
            aqiData={aqiData}
          />
        );
      case 'eco-alternatives':
        return (
          <EcoAlternativesPage
            aqiData={aqiData}
            setActiveTab={setActiveTab}
          />
        );
      case 'impact-tracker':
        return (
          <ImpactTrackerPage />
        );
      case 'community':
        return (
          <CommunityPage
            aqiData={aqiData}
          />
        );
      case 'settings':
        return (
          <SettingsPage
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            userGroqKey={userGroqKey}
            setUserGroqKey={setUserGroqKey}
          />
        );
      default:
        return (
          <DashboardPage
            aqiData={aqiData}
            loading={loading}
            setActiveTab={setActiveTab}
            userProfile={userProfile}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        userProfile={userProfile}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          location={location}
          aqiData={aqiData}
          loading={loading}
          refresh={refresh}
          selectCity={selectCity}
          useBrowserGeolocation={useBrowserGeolocation}
          isLocating={isLocating}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {error && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-center justify-between">
              <span>{error}</span>
              <button onClick={refresh} className="font-bold underline ml-2">Retry</button>
            </div>
          )}

          {renderContent()}
        </main>

        {/* Global Product Footer */}
        <footer className="border-t border-slate-200 bg-white py-6 px-4 text-center text-xs text-slate-500">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">BreatheWise AI</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">Breathe Better. Live Smarter. Protect Your Community.</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Free Tiers Only • Open-Meteo Air Quality & CAMS Models • Groq LLM Inference
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
