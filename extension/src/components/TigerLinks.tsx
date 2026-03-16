import React from "react";
import "./TigerLinks.css";

type LinkItem = {
  name: string;
  url: string;
  icon: string;
};

const TIGER_LINKS: LinkItem[] = [
  { name: "Canvas", url: "https://princeton.instructure.com/", icon: "📚" },
  { name: "TigerHub", url: "https://tigerhub.princeton.edu/", icon: "🐯" },
  { name: "Gradescope", url: "https://www.gradescope.com/", icon: "📝" },
  { name: "Gmail", url: "https://mail.google.com/mail/u/0/?hd=princeton.edu", icon: "✉️" },
  { name: "TigerSnatch", url: "https://tigersnatch.com/", icon: "🏃" },
];

const TigerLinks: React.FC = () => {
  return (
    <div className="tiger-links-container">
      {TIGER_LINKS.map((link) => (
        <a
          key={link.name}
          href={link.url}
          className="tiger-link-item"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="tiger-link-icon">{link.icon}</div>
          <div className="tiger-link-name">{link.name}</div>
        </a>
      ))}
    </div>
  );
};

export default TigerLinks;
