import DHallTable from "./components/DiningHalls";
import React, { useEffect, useState } from "react";
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
import { FiMove, FiSettings } from "react-icons/fi";
import TodayNewsWidget from "./components/TodayNewsWidget";

const AVAILABLE_WIDGETS = [
  { id: "dhall", name: "Dinner" },
  { id: "weather", name: "Weather" },
  { id: "today", name: "Today News" },
];

const DEFAULT_WIDGETS = ["dhall", "weather", "today"];
const ALLOWED_WIDGET_IDS = new Set(AVAILABLE_WIDGETS.map((widget) => widget.id));
type WidgetColumn = "left" | "right";
type WidgetLayout = Record<WidgetColumn, string[]>;

const WIDGET_COLUMNS: WidgetColumn[] = ["left", "right"];

const buildDefaultLayout = (widgets: string[]): WidgetLayout => {
  const layout: WidgetLayout = { left: [], right: [] };
  widgets.forEach((widgetId, index) => {
    const targetColumn: WidgetColumn = index % 2 === 0 ? "left" : "right";
    layout[targetColumn].push(widgetId);
  });
  return layout;
};

const normalizeWidgetLayout = (
  layout: Partial<WidgetLayout> | null,
  activeWidgets: string[]
): WidgetLayout => {
  const activeSet = new Set(activeWidgets);
  const seen = new Set<string>();

  const sanitize = (ids?: string[]) =>
    (ids || []).filter((id) => {
      if (!activeSet.has(id) || seen.has(id)) return false;
      seen.add(id);
      return true;
    });

  const normalized: WidgetLayout = {
    left: sanitize(layout?.left),
    right: sanitize(layout?.right),
  };

  activeWidgets.forEach((id) => {
    if (seen.has(id)) return;
    const targetColumn =
      normalized.left.length <= normalized.right.length ? "left" : "right";
    normalized[targetColumn].push(id);
    seen.add(id);
  });

  return normalized;
};

function App() {
  const storage = useStorage();
  const mixpanel = useMixpanel();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isArrangeMode, setIsArrangeMode] = useState(false);
  const [draggingWidgetId, setDraggingWidgetId] = useState<string | null>(null);
  const [dropTargetKey, setDropTargetKey] = useState<string | null>(null);
  const [snappedWidgetId, setSnappedWidgetId] = useState<string | null>(null);
  
  const [activeWidgets, setActiveWidgets] = useState<string[]>(() => {
    const saved = storage.getLocalStorage(StorageKeys.ACTIVE_WIDGETS);
    if (!saved) return DEFAULT_WIDGETS;

    try {
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return DEFAULT_WIDGETS;
      const filtered = parsed.filter((id): id is string => typeof id === "string" && ALLOWED_WIDGET_IDS.has(id));
      return filtered;
    } catch {
      return DEFAULT_WIDGETS;
    }
  });
  const [widgetLayout, setWidgetLayout] = useState<WidgetLayout>(() => {
    const saved = storage.getLocalStorage(StorageKeys.WIDGET_LAYOUT);
    if (!saved) return buildDefaultLayout(activeWidgets);

    try {
      const parsed = JSON.parse(saved) as Partial<WidgetLayout>;
      return normalizeWidgetLayout(parsed, activeWidgets);
    } catch {
      return buildDefaultLayout(activeWidgets);
    }
  });

  useEffect(() => {
    const customBackground = storage.getLocalStorage(StorageKeys.CUSTOM_BG);
    if (customBackground) {
      document.body.style.backgroundImage = `url('${customBackground}')`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center center";
      document.body.style.backgroundAttachment = "fixed";
      return;
    }
    document.body.style.backgroundImage = "";
    document.body.style.backgroundSize = "";
    document.body.style.backgroundPosition = "";
    document.body.style.backgroundAttachment = "";
  }, []);

  useEffect(() => {
    const state = storage.getLocalStorageObject();
    mixpanel.trackEvent(EventTypes.PAGE_LOAD, state);
  }, []);

  useEffect(() => {
    storage.setLocalStorage(StorageKeys.ACTIVE_WIDGETS, JSON.stringify(activeWidgets));
  }, [activeWidgets]);

  useEffect(() => {
    setWidgetLayout((prev) => normalizeWidgetLayout(prev, activeWidgets));
  }, [activeWidgets]);

  useEffect(() => {
    storage.setLocalStorage(StorageKeys.WIDGET_LAYOUT, JSON.stringify(widgetLayout));
  }, [widgetLayout]);

  const toggleWidget = (id: string) => {
    if (!ALLOWED_WIDGET_IDS.has(id)) return;
    setActiveWidgets(prev => 
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    );
  };

  const renderWidget = (id: string) => {
    switch(id) {
      case "dhall": return <DHallTable />;
      case "weather": return <WeatherTable />;
      case "today": return <TodayNewsWidget />;
      case "transit": return <TigerTransit />;
      case "events": return <CampusEvents />;
      case "chat": return <div className="widget-card chat-widget" style={{ padding: 0, overflow: "hidden" }}><Chat /></div>;
      case "tigerapps": return <TigerAppsWidget />;
      case "laundry": return <ComingSoonWidget title="Laundry Status" />;
      case "printer": return <ComingSoonWidget title="Printer Status" />;
      default: return null;
    }
  };

  const moveWidget = (fromId: string, toColumn: WidgetColumn, toIndex: number) => {
    if (!fromId) return;

    setWidgetLayout((prev) => {
      const next = normalizeWidgetLayout(prev, activeWidgets);
      next.left = next.left.filter((id) => id !== fromId);
      next.right = next.right.filter((id) => id !== fromId);

      const insertionIndex = Math.max(
        0,
        Math.min(toIndex, next[toColumn].length)
      );
      next[toColumn].splice(insertionIndex, 0, fromId);
      return next;
    });
    setSnappedWidgetId(fromId);
    window.setTimeout(() => setSnappedWidgetId(null), 380);
  };

  const feedbackMailto =
    "mailto:aj5828@princeton.edu?subject=TodayCustom%20Feedback%20%28Free%20Coffee%29&body=Hey%20Khan%2C%0A%0AHere%20is%20my%20feedback%20for%20TodayCustom%3A%0A-%20%0A-%20%0A%0AThanks!";

  return (
    <div className="App">
      <button
        className="settings-button-top"
        onClick={() => setIsSettingsOpen(true)}
        aria-label="Open customization settings"
        title="Customize dashboard"
      >
        <FiSettings className="settings-button-icon" />
        <span>Customize</span>
      </button>

      <div className="main-content">
        <ClockDate />
        <SearchBar />
        <TigerLinks />
        
        {activeWidgets.length > 0 && (
          <div className="widget-arrange-toolbar">
            <button
              className={`arrange-button ${isArrangeMode ? "is-active" : ""}`}
              onClick={() => {
                setIsArrangeMode((prev) => !prev);
                setDraggingWidgetId(null);
                setDropTargetKey(null);
              }}
              aria-label="Rearrange widgets"
              title="Rearrange widgets"
            >
              <FiMove className="arrange-button-icon" />
              <span>{isArrangeMode ? "Done Arranging" : "Arrange Widgets"}</span>
            </button>
          </div>
        )}

        <div className={`command-center-widgets ${isArrangeMode ? "is-arranging" : ""}`}>
          {WIDGET_COLUMNS.map((column) => (
            <div
              key={column}
              className={[
                "widget-column",
                isArrangeMode ? "is-arranging" : "",
                dropTargetKey === `${column}:end` ? "is-drop-target" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onDragOver={(e) => {
                if (!isArrangeMode) return;
                e.preventDefault();
                if (dropTargetKey !== `${column}:end`) {
                  setDropTargetKey(`${column}:end`);
                }
              }}
              onDrop={(e) => {
                if (!isArrangeMode) return;
                e.preventDefault();
                const draggedId = e.dataTransfer.getData("text/plain");
                moveWidget(draggedId, column, widgetLayout[column].length);
                setDraggingWidgetId(null);
                setDropTargetKey(null);
              }}
            >
              {widgetLayout[column].map((widgetId) => (
                <div
                  key={widgetId}
                  className={[
                    "widget-slot",
                    draggingWidgetId === widgetId ? "is-dragging" : "",
                    dropTargetKey === `${column}:${widgetId}` ? "is-drop-target" : "",
                    snappedWidgetId === widgetId ? "is-snapped" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  draggable={isArrangeMode}
                  onDragStart={(e) => {
                    if (!isArrangeMode) return;
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", widgetId);
                    setDraggingWidgetId(widgetId);
                  }}
                  onDragOver={(e) => {
                    if (!isArrangeMode) return;
                    e.preventDefault();
                    if (dropTargetKey !== `${column}:${widgetId}`) {
                      setDropTargetKey(`${column}:${widgetId}`);
                    }
                  }}
                  onDrop={(e) => {
                    if (!isArrangeMode) return;
                    e.preventDefault();
                    const draggedId = e.dataTransfer.getData("text/plain");
                    const targetIndex = widgetLayout[column].indexOf(widgetId);
                    moveWidget(draggedId, column, targetIndex);
                    setDraggingWidgetId(null);
                    setDropTargetKey(null);
                  }}
                  onDragEnd={() => {
                    setDraggingWidgetId(null);
                    setDropTargetKey(null);
                  }}
                >
                  {isArrangeMode && (
                    <div className="widget-slot-badge">
                      <FiMove />
                      <span>Drag to move</span>
                    </div>
                  )}
                  {renderWidget(widgetId)}
                </div>
              ))}
              {isArrangeMode && widgetLayout[column].length === 0 && (
                <div className="widget-column-empty">Drop widgets here</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        activeWidgets={activeWidgets}
        toggleWidget={toggleWidget}
        availableWidgets={AVAILABLE_WIDGETS}
      />

      <a
        className="settings-button-top feedback-button-floating"
        href={feedbackMailto}
        aria-label="Contribute feedback by email for free coffee"
      >
        Contribute Feedback (Free Coffee on Me)
      </a>
    </div>
  );
}

export default App;
