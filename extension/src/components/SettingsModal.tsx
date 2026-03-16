import React, { useState, useRef } from "react";
import { StorageKeys, useStorage } from "../context/StorageContext";
import "./SettingsModal.css";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  activeWidgets: string[];
  toggleWidget: (id: string) => void;
  availableWidgets: { id: string; name: string }[];
};

const SettingsModal: React.FC<Props> = ({ isOpen, onClose, activeWidgets, toggleWidget, availableWidgets }) => {
  const storage = useStorage();
  const [bgUrl, setBgUrl] = useState("");
  const [activeTab, setActiveTab] = useState<"widgets" | "background">("widgets");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleBgUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bgUrl) {
      storage.setLocalStorage(StorageKeys.CUSTOM_BG, bgUrl);
      window.location.reload(); // Reload to apply
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        try {
          storage.setLocalStorage(StorageKeys.CUSTOM_BG, base64String);
          window.location.reload();
        } catch (err) {
          alert("Image too large! Please use a smaller image or an Image URL.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearBg = () => {
    window.localStorage.removeItem(StorageKeys.CUSTOM_BG);
    window.location.reload();
  };

  return (
    <div className="settings-overlay">
      <div className="settings-popup">
        <button className="settings-close-button" onClick={onClose}>×</button>
        
        <div className="settings-sidebar">
          <button 
            className={`settings-side-button ${activeTab === "widgets" ? "active" : ""}`}
            onClick={() => setActiveTab("widgets")}
          >
            Widgets
          </button>
          <button 
            className={`settings-side-button ${activeTab === "background" ? "active" : ""}`}
            onClick={() => setActiveTab("background")}
          >
            Background
          </button>
        </div>

        <div className="settings-box">
          {activeTab === "widgets" && (
            <div className="settings-section">
              <h4>Manage Widgets</h4>
              <div className="widget-toggles">
                {availableWidgets.map(widget => (
                  <label key={widget.id} className="widget-toggle-label">
                    <input
                      type="checkbox"
                      checked={activeWidgets.includes(widget.id)}
                      onChange={() => toggleWidget(widget.id)}
                    />
                    <span>{widget.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === "background" && (
            <div className="settings-section">
              <h4>Custom Background</h4>
              
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "#555" }}>Upload Image (PNG/JPG)</label>
                <input 
                  type="file" 
                  accept="image/png, image/jpeg" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />
                <button 
                  className="settings-submit" 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ width: "100%", backgroundColor: "#333" }}
                >
                  Choose File
                </button>
              </div>

              <div style={{ textAlign: "center", margin: "15px 0", color: "#888", fontSize: "14px" }}>OR</div>

              <form onSubmit={handleBgUrlSubmit} className="timer-settings form">
                <label style={{ fontSize: "14px", color: "#555", marginBottom: "8px", display: "block" }}>Image URL</label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    type="text"
                    placeholder="https://example.com/image.png"
                    value={bgUrl}
                    onChange={(e) => setBgUrl(e.target.value)}
                    style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
                  />
                  <button type="submit" className="settings-submit">Set</button>
                </div>
              </form>

              <button 
                className="settings-submit" 
                onClick={handleClearBg}
                style={{ marginTop: "30px", backgroundColor: "#dc3545", width: "100%" }}
              >
                Reset to Default Background
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
