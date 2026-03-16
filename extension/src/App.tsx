import DHallTable from "./components/DiningHalls";
import StudyMode from "./components/StudyMode";
import React, { useEffect, useState } from "react";
import { useTime } from "./context/TimeContext";
import "bootstrap/dist/css/bootstrap.min.css";
import CampusEvents from "./components/CampusEvents";
import { EventTypes, useMixpanel } from "./context/MixpanelContext";
import { StorageKeys, useStorage } from "./context/StorageContext";
import "react-sliding-pane/dist/react-sliding-pane.css";
import "./App.css";
import WeatherTable from "./components/Weather";
import SearchBar from "./components/SearchBar";
import TigerLinks from "./components/TigerLinks";
import TigerTransit from "./components/TigerTransit";
import ClockDate from "./components/ClockDate";
import Chat from "./components/Chat";
import TigerAppsWidget from "./components/TigerAppsWidget";
import ComingSoonWidget from "./components/ComingSoonWidget";
import SettingsModal from "./components/SettingsModal";
import { FiSettings } from "react-icons/fi";

const AVAILABLE_WIDGETS = [
  { id: "dhall", name: "Dining Halls" },
  { id: "weather", name: "Weather" },
  { id: "transit", name: "TigerTransit" },
  { id: "events", name: "Campus Events" },
  { id: "chat", name: "Tay (Chatbot)" },
  { id: "tigerapps", name: "TigerApps" },
  { id: "laundry", name: "Laundry (Coming Soon)" },
  { id: "printer", name: "Printer (Coming Soon)" },
];

const DEFAULT_WIDGETS = ["dhall", "weather", "transit", "events", "chat", "tigerapps"];

function App() {
  const time = useTime();
  const storage = useStorage();
  const mixpanel = useMixpanel();

  const [showWidgets, setShowWidgets] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [activeWidgets, setActiveWidgets] = useState<string[]>(() => {
    const saved = storage.getLocalStorage(StorageKeys.ACTIVE_WIDGETS);
    return saved ? JSON.parse(saved) : DEFAULT_WIDGETS;
  });

  useEffect(() => {
    const state = storage.getLocalStorageObject();
    mixpanel.trackEvent(EventTypes.PAGE_LOAD, state);
  }, []);

  useEffect(() => {
    storage.setLocalStorage(StorageKeys.ACTIVE_WIDGETS, JSON.stringify(activeWidgets));
  }, [activeWidgets]);

  useEffect(() => {
    const customBg = storage.getLocalStorage(StorageKeys.CUSTOM_BG);
    
    let bgUrl = customBg;
    
    if (!bgUrl) {
      bgUrl = "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2069&auto=format&fit=crop"; // Default

      if (time.timeOfDay === "morning") {
        bgUrl = "https://images.unsplash.com/photo-1541336032412-2048a678540d?q=80&w=2000&auto=format&fit=crop"; // Morning campus vibe
      } else if (time.timeOfDay === "afternoon") {
        bgUrl = "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2069&auto=format&fit=crop"; // Afternoon campus vibe
      } else if (time.timeOfDay === "evening" || time.timeOfDay === "night") {
        bgUrl = "https://images.unsplash.com/photo-1513628253939-010e64ac66cd?q=80&w=2000&auto=format&fit=crop"; // Night campus vibe
      }
    }

    document.body.style.backgroundImage = `url('${bgUrl}')`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center center";
    document.body.style.backgroundAttachment = "fixed";
  }, [time.timeOfDay]);

  const toggleWidgets = () => {
    setShowWidgets((prevShowWidgets) => !prevShowWidgets);
  };

  const toggleWidget = (id: string) => {
    setActiveWidgets(prev => 
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    );
  };

  const renderWidget = (id: string) => {
    switch(id) {
      case "dhall": return <DHallTable key={id} />;
      case "weather": return <WeatherTable key={id} />;
      case "transit": return <TigerTransit key={id} />;
      case "events": return <CampusEvents key={id} />;
      case "chat": return <div key={id} className="widget-card chat-widget" style={{ padding: 0, overflow: "hidden" }}><Chat /></div>;
      case "tigerapps": return <TigerAppsWidget key={id} />;
      case "laundry": return <ComingSoonWidget key={id} title="Laundry Status" />;
      case "printer": return <ComingSoonWidget key={id} title="Printer Status" />;
      default: return null;
    }
  };

  // Divide active widgets into 3 columns
  const col1 = activeWidgets.filter((_, i) => i % 3 === 0);
  const col2 = activeWidgets.filter((_, i) => i % 3 === 1);
  const col3 = activeWidgets.filter((_, i) => i % 3 === 2);

  return (
    <div className="App">
      <button className="settings-button-top" onClick={() => setIsSettingsOpen(true)}>
        <FiSettings />
      </button>

      {/* Top-right StudyMode Button */}
      <div className="study-mode-top-right">
        <StudyMode toggleWidgets={toggleWidgets} />
      </div>

      {showWidgets && (
        <div className="main-content">
          <ClockDate />
          <SearchBar />
          <TigerLinks />
          
          <div className="bento-grid">
            <div className="bento-col">
              {col1.map(renderWidget)}
            </div>
            <div className="bento-col center-col">
              {col2.map(renderWidget)}
            </div>
            <div className="bento-col">
              {col3.map(renderWidget)}
            </div>
          </div>
        </div>
      )}

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        activeWidgets={activeWidgets}
        toggleWidget={toggleWidget}
        availableWidgets={AVAILABLE_WIDGETS}
      />
    </div>
  );
}

export default App;
