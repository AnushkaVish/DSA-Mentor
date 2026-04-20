// import React from 'react';

// const Loader = () => (
//     <div className="animate-pulse space-y-4 p-6 w-full max-w-4xl mx-auto">
//         <div className="h-8 bg-gray-700 rounded w-3/4"></div>
//         <div className="h-4 bg-gray-700 rounded w-1/4"></div>
//         <div className="h-4 bg-gray-700 rounded w-1/2"></div>
//         <div className="space-y-2">
//             <div className="h-4 bg-gray-700 rounded w-full"></div>
//             <div className="h-4 bg-gray-700 rounded w-11/12"></div>
//             <div className="h-4 bg-gray-700 rounded w-full"></div>
//             <div className="h-4 bg-gray-700 rounded w-5/6"></div>
//         </div>
//         <div className="h-24 bg-gray-700 rounded"></div>
//         <div className="h-24 bg-gray-700 rounded"></div>
//     </div>
// );

// export default Loader;

import React, { useEffect, useState } from "react";

const Loader = () => {
  const [visibleLines, setVisibleLines] = useState([]);
  const [showBadges, setShowBadges] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [currentBar, setCurrentBar] = useState(null);

  const lines = [
    { text: "$ initializing DSA-Mentor v2.0...", cls: "green", delay: 0 },
    { text: "  loading core data structures", cls: "blue", delay: 600, bar: { color: "#79c0ff", dur: "1.2s" } },
    { text: "  compiling algorithm library", cls: "purple", delay: 1900, bar: { color: "#c084fc", dur: "1s" } },
    { text: "  indexing 450+ practice problems", cls: "amber", delay: 3000, bar: { color: "#e3b341", dur: "0.8s" } },
    { text: "  building your adaptive roadmap", cls: "blue", delay: 3900, bar: { color: "#6366f1", dur: "1.1s" } },
    { text: "✓ environment ready", cls: "green", delay: 5100 },
    { text: "$ welcome to DSA-Mentor  ▋", cls: "white", delay: 5700 },
  ];

  const badges = [
    { label: "Arrays", cls: "g" },
    { label: "Trees", cls: "b" },
    { label: "Graphs", cls: "p" },
    { label: "DP", cls: "a" },
    { label: "Sorting", cls: "g" },
    { label: "Heaps", cls: "b" },
  ];

  const stats = [
    { num: "450+", label: "Problems", color: "#6366f1" },
    { num: "12", label: "Topics", color: "#3fb950" },
    { num: "3", label: "Difficulty Levels", color: "#e3b341" },
  ];

  useEffect(() => {
    lines.forEach((line, i) => {
      setTimeout(() => {
        setVisibleLines((prev) => [...prev, i]);
        if (line.bar) setCurrentBar(line.bar);
      }, line.delay);
    });

    setTimeout(() => setShowBadges(true), 5200);
    setTimeout(() => setShowStats(true), 5600);
  }, []);

  const colorMap = {
    green: "#3fb950",
    blue: "#79c0ff",
    amber: "#e3b341",
    purple: "#c084fc",
    muted: "#8b949e",
    white: "#f0f6fc",
  };

  return (
    <div
      style={{
        background: "#0d1117",
        borderRadius: "16px",
        padding: "28px",
        minHeight: "480px",
        fontFamily: "monospace",
      }}
    >
      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "56px",
            height: "56px",
            borderRadius: "14px",
            background: "#161b22",
            border: "0.5px solid #30363d",
            marginBottom: "12px",
            animation: "float 3s ease-in-out infinite",
          }}
        >
          <svg width="32" height="32" viewBox="0 0 30 30" fill="none">
            <circle cx="15" cy="4" r="3" fill="#6366f1" />
            <circle cx="7" cy="14" r="3" fill="#3fb950" />
            <circle cx="23" cy="14" r="3" fill="#3fb950" />
            <circle cx="3" cy="24" r="3" fill="#79c0ff" />
            <circle cx="11" cy="24" r="3" fill="#79c0ff" />
            <circle cx="19" cy="24" r="3" fill="#79c0ff" />
            <circle cx="27" cy="24" r="3" fill="#79c0ff" />
            <line x1="15" y1="7" x2="7" y2="11" stroke="#30363d" strokeWidth="1.5" />
            <line x1="15" y1="7" x2="23" y2="11" stroke="#30363d" strokeWidth="1.5" />
            <line x1="7" y1="17" x2="3" y2="21" stroke="#30363d" strokeWidth="1.5" />
            <line x1="7" y1="17" x2="11" y2="21" stroke="#30363d" strokeWidth="1.5" />
            <line x1="23" y1="17" x2="19" y2="21" stroke="#30363d" strokeWidth="1.5" />
            <line x1="23" y1="17" x2="27" y2="21" stroke="#30363d" strokeWidth="1.5" />
          </svg>
        </div>
        <div style={{ fontSize: "26px", fontWeight: 600, color: "#f0f6fc", letterSpacing: "1px" }}>
          <span style={{ color: "#6366f1" }}>DSA</span>
          <span style={{ color: "#8b949e" }}>—</span>
          <span style={{ color: "#3fb950" }}>Mentor</span>
        </div>
        <div style={{ fontSize: "12px", color: "#8b949e", marginTop: "4px" }}>
          your algorithmic learning companion
        </div>
      </div>

      {/* Terminal */}
      <div
        style={{
          background: "#0d1117",
          borderRadius: "12px",
          border: "0.5px solid #30363d",
          overflow: "hidden",
        }}
      >
        {/* Terminal Header */}
        <div
          style={{
            background: "#161b22",
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            borderBottom: "0.5px solid #30363d",
          }}
        >
          <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#ff5f57", display: "inline-block" }} />
          <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#febc2e", display: "inline-block" }} />
          <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#28c840", display: "inline-block" }} />
          <span style={{ fontSize: 12, color: "#8b949e", marginLeft: "auto" }}>dsa-mentor ~ session</span>
        </div>

        {/* Terminal Body */}
        <div style={{ padding: "20px", minHeight: "160px" }}>
          {lines.map((line, i) =>
            visibleLines.includes(i) ? (
              <div key={i}>
                <div
                  style={{
                    fontSize: "13px",
                    lineHeight: 2,
                    color: colorMap[line.cls] || "#f0f6fc",
                    animation: "fadeSlideIn 0.4s ease forwards",
                  }}
                >
                  {line.text}
                  {i === lines.length - 1 && (
                    <span
                      style={{
                        display: "inline-block",
                        width: 7,
                        height: 13,
                        background: "#3fb950",
                        verticalAlign: "middle",
                        marginLeft: 2,
                        animation: "blink 1s step-end infinite",
                      }}
                    />
                  )}
                </div>
                {line.bar && currentBar?.color === line.bar.color && (
                  <div
                    style={{
                      height: 4,
                      background: "#21262d",
                      borderRadius: 2,
                      margin: "2px 0 8px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        borderRadius: 2,
                        background: line.bar.color,
                        animation: `progressBar ${line.bar.dur} linear forwards`,
                      }}
                    />
                  </div>
                )}
              </div>
            ) : null
          )}
        </div>
      </div>

      {/* Badges */}
      {showBadges && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
          {[
            { label: "Arrays", bg: "#0d2e1a", color: "#3fb950", border: "#3fb95066" },
            { label: "Trees", bg: "#0c1f3a", color: "#79c0ff", border: "#79c0ff55" },
            { label: "Graphs", bg: "#1e1230", color: "#c084fc", border: "#c084fc55" },
            { label: "DP", bg: "#2e1f05", color: "#e3b341", border: "#e3b34155" },
            { label: "Sorting", bg: "#0d2e1a", color: "#3fb950", border: "#3fb95066" },
            { label: "Heaps", bg: "#0c1f3a", color: "#79c0ff", border: "#79c0ff55" },
          ].map((b, i) => (
            <span
              key={i}
              style={{
                padding: "3px 10px",
                borderRadius: 20,
                fontSize: 11,
                fontFamily: "monospace",
                fontWeight: 500,
                background: b.bg,
                color: b.color,
                border: `0.5px solid ${b.border}`,
                animation: "fadeSlideIn 0.5s ease forwards",
              }}
            >
              {b.label}
            </span>
          ))}
        </div>
      )}

      {/* Stats */}
      {showStats && (
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          {[
            { num: "450+", label: "Problems", color: "#6366f1" },
            { num: "12", label: "Topics", color: "#3fb950" },
            { num: "3", label: "Difficulty Levels", color: "#e3b341" },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                background: "#161b22",
                border: "0.5px solid #30363d",
                borderRadius: 8,
                padding: "10px",
                textAlign: "center",
                animation: "fadeSlideIn 0.5s ease forwards",
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 600, color: s.color, fontFamily: "monospace" }}>
                {s.num}
              </div>
              <div style={{ fontSize: 10, color: "#8b949e", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Spinner */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
        <div
          style={{
            width: 20,
            height: 20,
            border: "2px solid #30363d",
            borderTopColor: "#6366f1",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes progressBar { from{width:0%} to{width:100%} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
      `}</style>
    </div>
  );
};

export default Loader;