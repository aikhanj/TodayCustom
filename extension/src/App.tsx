import DHallTable from "./components/DiningHalls";
import StudyMode from "./components/StudyMode";
import React, { useEffect, useState } from "react";
import { useTime } from "./context/TimeContext";
import "bootstrap/dist/css/bootstrap.min.css";
import CampusEvents from "./components/CampusEvents";
import { EventTypes, useMixpanel } from "./context/MixpanelContext";
import { useStorage } from "./context/StorageContext";
import "react-sliding-pane/dist/react-sliding-pane.css";
import "./App.css";
import WeatherTable from "./components/Weather";
import SearchBar from "./components/SearchBar";
import TigerLinks from "./components/TigerLinks";
import TigerTransit from "./components/TigerTransit";
import ClockDate from "./components/ClockDate";

function App() {
  const time = useTime();
  const storage = useStorage();
  const mixpanel = useMixpanel();

  const [showWidgets, setShowWidgets] = useState(true); // Show widgets initially

  useEffect(() => {
    const state = storage.getLocalStorageObject();
    mixpanel.trackEvent(EventTypes.PAGE_LOAD, state);
  }, []);

  useEffect(() => {
    let bgUrl = "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2069&auto=format&fit=crop"; // Default

    if (time.timeOfDay === "morning") {
      bgUrl = "https://images.unsplash.com/photo-1541336032412-2048a678540d?q=80&w=2000&auto=format&fit=crop"; // Morning campus vibe
    } else if (time.timeOfDay === "afternoon") {
      bgUrl = "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2069&auto=format&fit=crop"; // Afternoon campus vibe
    } else if (time.timeOfDay === "evening" || time.timeOfDay === "night") {
      bgUrl = "https://images.unsplash.com/photo-1513628253939-010e64ac66cd?q=80&w=2000&auto=format&fit=crop"; // Night campus vibe
    }

    document.body.style.backgroundImage = `url('${bgUrl}')`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center center";
    document.body.style.backgroundAttachment = "fixed";
  }, [time.timeOfDay]);

  const toggleWidgets = () => {
    setShowWidgets((prevShowWidgets) => !prevShowWidgets);
  };

  return (
    <div className="App">
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
            <DHallTable />
          </div>
          <div className="bento-col center-col">
            <WeatherTable />
            <TigerTransit />
          </div>
          <div className="bento-col">
            <CampusEvents />
          </div>
        </div>
        </div>
      )}
    </div>
  );
}

export default App;
