import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../utils/axiosClient"; // ✅ IMPORTANT

export default function ContestList() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const res = await axiosClient.get("/api/contests"); // ✅ cookie-based auth
        setContests(res.data || []);
      } catch (err) {
        console.error("ERROR:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContests();
  }, []);

  const getStatusStyle = (status) => {
    if (status === "live")
      return { bg: "rgba(34,197,94,0.15)", color: "#22c55e", dot: "#22c55e" };
    if (status === "upcoming")
      return {
        bg: "rgba(234,179,8,0.15)",
        color: "#eab308",
        dot: "#eab308",
      };
    return { bg: "rgba(107,114,128,0.15)", color: "#9ca3af", dot: "#6b7280" };
  };

  const formatDate = (d) => {
    if (!d) return "-";
    return new Date(d).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loading}>Loading contests...</div>
      </div>
    );
  }

  // ✅ SAFE FILTERS
  const live = contests?.filter((c) => c?.status === "live") || [];
  const upcoming = contests?.filter((c) => c?.status === "upcoming") || [];
  const ended = contests?.filter((c) => c?.status === "ended") || [];

  const Section = ({ title, items, emoji }) =>
    items.length === 0 ? null : (
      <div style={{ marginBottom: "32px" }}>
        <h2 style={styles.sectionTitle}>
          {emoji} {title}
        </h2>

        <div style={styles.grid}>
          {items.map((c) => {
            if (!c?._id) return null; 

            const st = getStatusStyle(c.status);

            return (
              <div key={c._id} style={styles.card}>
                {/* STATUS */}
                <div
                  style={{
                    ...styles.badge,
                    background: st.bg,
                    color: st.color,
                  }}
                >
                  <span
                    style={{
                      ...styles.dot,
                      background: st.dot,
                      animation:
                        c.status === "live"
                          ? "pulse 1.5s infinite"
                          : "none",
                    }}
                  />
                  {c.status?.toUpperCase()}
                </div>

                <h3 style={styles.cardTitle}>{c.title || "Untitled"}</h3>

                {c.description && (
                  <p style={styles.cardDesc}>{c.description}</p>
                )}

                <div style={styles.metaRow}>
                  <span style={styles.metaItem}>
                    ⏱ {c.duration || 0} min
                  </span>
                  <span style={styles.metaItem}>
                    📝 {c.totalQuestions || 0} questions
                  </span>
                </div>

                <div style={styles.timeRow}>
                  <span style={styles.timeLabel}>Starts:</span>
                  <span style={styles.timeVal}>
                    {formatDate(c.startTime)}
                  </span>
                </div>

                <div style={styles.timeRow}>
                  <span style={styles.timeLabel}>Ends:</span>
                  <span style={styles.timeVal}>
                    {formatDate(c.endTime)}
                  </span>
                </div>

                {/* SCORE */}
                {c.attempted && (
                  <div style={styles.scoreBox}>
                    ✅ Score:{" "}
                    <strong style={{ color: "#22c55e" }}>
                      {c.userPercentage || 0}%
                    </strong>
                  </div>
                )}

                <div style={styles.cardFooter}>
                  {c.attempted ? (
                    <>
                      <button
                        style={styles.secondaryBtn}
                        onClick={() =>
                          navigate(`/contests/${c._id}/leaderboard`)
                        }
                      >
                        🏆 Leaderboard
                      </button>
                      <span style={styles.attemptedTag}>
                        Already Attempted
                      </span>
                    </>
                  ) : c.status === "live" ? (
                    <button
                      style={styles.primaryBtn}
                      onClick={() =>
                        navigate(`/contests/${c._id}/solve`)
                      }
                    >
                      Start Contest →
                    </button>
                  ) : c.status === "upcoming" ? (
                    <button
                      style={{ ...styles.primaryBtn, opacity: 0.5 }}
                      disabled
                    >
                      Not Started Yet
                    </button>
                  ) : (
                    <button
                      style={styles.secondaryBtn}
                      onClick={() =>
                        navigate(`/contests/${c._id}/leaderboard`)
                      }
                    >
                      🏆 View Results
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>

      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>Contests</h1>
        <p style={styles.pageSubtitle}>
          Solve contests and track performance 🚀
        </p>
      </div>

      {contests.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: "48px" }}>🎯</div>
          <p>No contests available right now</p>
        </div>
      ) : (
        <>
          <Section title="Live Now" items={live} emoji="🔴" />
          <Section title="Upcoming" items={upcoming} emoji="🗓" />
          <Section title="Past Contests" items={ended} emoji="📁" />
        </>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0f1117",
    padding: "32px 24px",
    maxWidth: "1100px",
    margin: "0 auto",
    color: "#e1e1e1",
    fontFamily: "Segoe UI",
  },
  loading: {
    textAlign: "center",
    paddingTop: "100px",
    color: "#888",
  },
  pageHeader: {
    marginBottom: "32px",
  },
  pageTitle: {
    fontSize: "32px",
    fontWeight: "bold",
  },
  pageSubtitle: {
    color: "#9ca3af",
  },
  sectionTitle: {
    color: "#c4b5fd",
    marginBottom: "16px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "#1a1d27",
    borderRadius: "16px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  badge: {
    display: "inline-flex",
    gap: "6px",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "11px",
  },
  dot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
  },
  cardTitle: {
    fontWeight: "bold",
  },
  metaRow: {
    display: "flex",
    gap: "10px",
  },
  metaItem: {
    color: "#a5b4fc",
  },
  timeRow: {
    display: "flex",
    gap: "6px",
    fontSize: "12px",
  },
  timeLabel: {
    color: "#6b7280",
  },
  timeVal: {
    color: "#d1d5db",
  },
  scoreBox: {
    background: "#064e3b",
    padding: "6px",
    borderRadius: "6px",
  },
  cardFooter: {
    marginTop: "auto",
    display: "flex",
    gap: "10px",
  },
  primaryBtn: {
    flex: 1,
    background: "#6366f1",
    color: "#fff",
    border: "none",
    padding: "8px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  secondaryBtn: {
    flex: 1,
    background: "#2a2d3a",
    color: "#a5b4fc",
    border: "none",
    padding: "8px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  attemptedTag: {
    color: "#22c55e",
    fontSize: "12px",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px",
  },
};