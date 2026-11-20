import React, { useState, useCallback, Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import { useAirQuality } from './hooks/useAirQuality';

// Code-splitting secondary pages to slash initial bundle size and speed up first paint
const AIAssistantPage = lazy(() => import('./pages/AIAssistantPage'));
const DailyPlannerPage = lazy(() => import('./pages/DailyPlannerPage'));
const IndoorCoachPage = lazy(() => import('./pages/IndoorCoachPage'));
const EcoAlternativesPage = lazy(() => import('./pages/EcoAlternativesPage'));
const ImpactTrackerPage = lazy(() => import('./pages/ImpactTrackerPage'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

function PageLoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-slate-400">
      <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mb-3" />
      <p className="text-xs font-medium">Loading section...</p>
    </div>
  );
}

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

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

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
          <Suspense fallback={<PageLoadingFallback />}>
            <AIAssistantPage
              aqiData={aqiData}
              userProfile={userProfile}
            />
          </Suspense>
        );
      case 'daily-planner':
        return (
          <Suspense fallback={<PageLoadingFallback />}>
            <DailyPlannerPage
              aqiData={aqiData}
              userProfile={userProfile}
            />
          </Suspense>
        );
      case 'indoor-coach':
        return (
          <Suspense fallback={<PageLoadingFallback />}>
            <IndoorCoachPage
              aqiData={aqiData}
            />
          </Suspense>
        );
      case 'eco-alternatives':
        return (
          <Suspense fallback={<PageLoadingFallback />}>
            <EcoAlternativesPage
              aqiData={aqiData}
              setActiveTab={setActiveTab}
            />
          </Suspense>
        );
      case 'impact-tracker':
        return (
          <Suspense fallback={<PageLoadingFallback />}>
            <ImpactTrackerPage />
          </Suspense>
        );
      case 'community':
        return (
          <Suspense fallback={<PageLoadingFallback />}>
            <CommunityPage
              aqiData={aqiData}
            />
          </Suspense>
        );
      case 'settings':
        return (
          <Suspense fallback={<PageLoadingFallback />}>
            <SettingsPage
              userProfile={userProfile}
              setUserProfile={setUserProfile}
            />
          </Suspense>
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
          toggleSidebar={toggleSidebar}
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
