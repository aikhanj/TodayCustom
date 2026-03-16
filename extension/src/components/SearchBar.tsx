import React, { useState } from "react";
import "./SearchBar.css";

type SearchMode = "google" | "directory";

const SearchBar: React.FC = () => {
  const [mode, setMode] = useState<SearchMode>("google");
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (mode === "google") {
      window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    } else {
      window.location.href = `https://search.princeton.edu/search/people?f=${encodeURIComponent(query)}`;
    }
  };

  return (
    <div className="search-container">
      <div className="search-tabs">
        <button
          className={`search-tab ${mode === "google" ? "active" : ""}`}
          onClick={() => setMode("google")}
        >
          Google
        </button>
        <button
          className={`search-tab ${mode === "directory" ? "active" : ""}`}
          onClick={() => setMode("directory")}
        >
          Directory
        </button>
      </div>
      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          className="search-input"
          placeholder={mode === "google" ? "Search the web..." : "Search Princeton Directory..."}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
