import SneakyLinksTable from "./components/SneakyLinks";
import DHallTable from "./components/DiningHalls";
import Name from "./components/Name";
import StudyMode from "./components/StudyMode";
import React, { useEffect, useState } from "react";
import { useTime } from "./context/TimeContext";
import "bootstrap/dist/css/bootstrap.min.css";
import Carousel from "./components/Carousel";
import { EventTypes, useMixpanel } from "./context/MixpanelContext";
import { useStorage } from "./context/StorageContext";
import "react-sliding-pane/dist/react-sliding-pane.css";
import "./App.css";
import WeatherTable from "./components/Weather";

function App() {
  const time = useTime();
  const storage = useStorage();
  const mixpanel = useMixpanel();

  const [showWidgets, setShowWidgets] = useState(true); // Show widgets initially

  useEffect(() => {
    const state = storage.getLocalStorageObject();
    mixpanel.trackEvent(EventTypes.PAGE_LOAD, state);
  }, []);

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
        <div className="header-section">
          <h1 className="centered greeting">
            Good {time.timeOfDay} <Name />
          </h1>
          <h2 className="centered date">{time.dateString}</h2>
        </div>
      )}

      {showWidgets && (
        <div className="bento-grid">
          <div className="bento-col">
            <DHallTable />
          </div>
          <div className="bento-col center-col">
            <WeatherTable />
            <SneakyLinksTable />
          </div>
          <div className="bento-col">
            <Carousel />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
