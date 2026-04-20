import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../utils/axiosClient";

function useTimer(durationMinutes, onExpire) {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const startRef = useRef(Date.now());
  const total = durationMinutes * 60;

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startRef.current) / 1000);
      const remaining = total - elapsed;

      if (remaining <= 0) {
        clearInterval(interval);
        setTimeLeft(0);
        onExpire();
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [total, onExpire]);

  const format = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  return {
    formatted: format(timeLeft),
    percentage: (timeLeft / total) * 100,
    isWarning: timeLeft <= 300,
    isCritical: timeLeft <= 60
  };
}

export default function SolveContest() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contest, setContest] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axiosClient.get(`/api/contests/${id}`);
        setContest(res.data);
        setAnswers(new Array(res.data?.questions?.length || 0).fill(-1));
      } catch (err) {
        if (err.response?.data?.attempted) {
          setError("already_attempted");
        } else {
          setError(err.response?.data?.message || "Failed to load contest");
        }
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [id]);

  const handleSubmit = useCallback(
    async (auto = false) => {
      if (submitting) return;

      if (!auto) {
        const unanswered = answers.filter((a) => a === -1).length;
        if (
          unanswered > 0 &&
          !window.confirm(`${unanswered} unanswered. Submit anyway?`)
        )
          return;
      }

      setSubmitting(true);

      const timeTaken = Math.floor(
        (Date.now() - startTimeRef.current) / 1000
      );

      try {
        const res = await axiosClient.post(
          `/api/contests/${id}/submit`,
          { answers, timeTaken }
        );

        setResult({ ...res.data, answers, timeTaken });
      } catch (err) {
        setError(err.response?.data?.message || "Submission failed");
      } finally {
        setSubmitting(false);
      }
    },
    [answers, id, submitting]
  );

  const { formatted, percentage, isWarning, isCritical } = useTimer(
    contest?.duration || 30,
    () => handleSubmit(true)
  );

  if (loading)
    return (
      <div style={styles.page}>
        <div style={styles.loading}>Loading contest...</div>
      </div>
    );

  if (error === "already_attempted")
    return (
      <div style={styles.page}>
        <div style={styles.errorContainer}>
          <h2 style={styles.errorHeading}>Already Attempted</h2>
          <p style={styles.errorText}>You've already taken this contest.</p>
          <button 
            style={styles.primaryBtn}
            onClick={() => navigate(`/contests/${id}/leaderboard`)}
          >
            View Leaderboard →
          </button>
        </div>
      </div>
    );

  if (error)
    return (
      <div style={styles.page}>
        <div style={styles.errorContainer}>
          <h2 style={styles.errorHeading}>Error</h2>
          <p style={styles.errorText}>{error}</p>
          <button 
            style={styles.secondaryBtn}
            onClick={() => navigate('/contests')}
          >
            Back to Contests
          </button>
        </div>
      </div>
    );

  if (result) {
    return (
      <div style={styles.page}>
        <div style={styles.resultContainer}>
          <div style={styles.resultHeader}>
            <div style={styles.trophy}>🏆</div>
            <h2 style={styles.resultTitle}>Contest Completed!</h2>
          </div>
          
          <div style={styles.scoreBox}>
            <span style={styles.scoreLabel}>Your Score:</span>
            <span style={styles.scoreValue}>{result.percentage}%</span>
          </div>

          <div style={styles.resultStats}>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Time Taken:</span>
              <span style={styles.statValue}>
                {Math.floor(result.timeTaken / 60)}:
                {String(result.timeTaken % 60).padStart(2, '0')}
              </span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Questions:</span>
              <span style={styles.statValue}>
                {result.answers.filter(a => a !== -1).length}/{result.answers.length}
              </span>
            </div>
          </div>

          <button 
            style={styles.primaryBtn}
            onClick={() => navigate(`/contests/${id}/leaderboard`)}
          >
            View Leaderboard →
          </button>
        </div>
      </div>
    );
  }

  const q = contest?.questions?.[currentQ];
  if (!q) return null;

  const progress = ((currentQ + 1) / contest.questions.length) * 100;
  const unanswered = answers.filter(a => a === -1).length;

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.heading}>{contest.title}</h1>
          <p style={styles.subheading}>
            Question {currentQ + 1} of {contest.questions.length}
          </p>
        </div>
        
        {/* Timer */}
        <div style={{
          ...styles.timer,
          color: isCritical ? '#ef4444' : isWarning ? '#eab308' : '#22c55e'
        }}>
          ⏱ {formatted}
          {isCritical && <div style={styles.pulseDot} />}
        </div>
      </div>

      {/* Progress Bar */}
      <div style={styles.progressContainer}>
        <div style={styles.progressBar}>
          <div 
            style={{
              ...styles.progressFill,
              width: `${progress}%`,
              background: isCritical ? '#ef4444' : isWarning ? '#eab308' : '#6366f1'
            }}
          />
        </div>
        <span style={styles.progressText}>
          {Math.round(progress)}% Complete
        </span>
      </div>

      {/* Question Card */}
      <div style={styles.card}>
        <div style={styles.questionHeader}>
          <span style={styles.qBadge}>Q{currentQ + 1}</span>
          <span style={styles.marksBadge}>
            {q.marks} mark{q.marks !== 1 ? 's' : ''}
          </span>
        </div>

        <div style={styles.questionText}>
          {q.questionText}
        </div>

        {/* Options */}
        <div style={styles.optionsGrid}>
          {q.options.map((opt, i) => (
            <div
              key={i}
              style={{
                ...styles.optionCard,
                borderColor: answers[currentQ] === i ? '#6366f1' : '#2a2d3a',
                background: answers[currentQ] === i 
                  ? 'rgba(99,102,241,0.1)' 
                  : 'rgba(255,255,255,0.03)'
              }}
              onClick={() => {
                const copy = [...answers];
                copy[currentQ] = i;
                setAnswers(copy);
              }}
            >
              <div style={{
                ...styles.optionRadio,
                background: answers[currentQ] === i ? '#6366f1' : 'transparent',
                borderColor: answers[currentQ] === i ? '#6366f1' : '#555'
              }}>
                {answers[currentQ] === i && '✓'}
              </div>
              <span style={styles.optionLabel}>
                {["A", "B", "C", "D"][i]}.
              </span>
              <span style={styles.optionText}>{opt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div style={styles.navContainer}>
        <div style={styles.navLeft}>
          <span style={styles.unansweredText}>
            {unanswered} unanswered question{unanswered !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div style={styles.navRight}>
          <button
            style={styles.navBtn}
            disabled={currentQ === 0}
            onClick={() => setCurrentQ(p => p - 1)}
          >
            ← Previous
          </button>

          {currentQ < contest.questions.length - 1 ? (
            <button
              style={styles.primaryNavBtn}
              onClick={() => setCurrentQ(p => p + 1)}
            >
              Next →
            </button>
          ) : (
            <button
              style={{
                ...styles.primaryNavBtn,
                background: isCritical ? '#ef4444' : '#6366f1'
              }}
              onClick={() => handleSubmit(false)}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Contest'}
            </button>
          )}
        </div>
      </div>

      {/* Question Quick Nav */}
      <div style={styles.quickNav}>
        {contest.questions.map((_, index) => (
          <button
            key={index}
            style={{
              ...styles.quickNavBtn,
              background: index === currentQ 
                ? '#6366f1' 
                : answers[index] !== -1 
                  ? '#22c55e' 
                  : '#2a2d3a'
            }}
            onClick={() => setCurrentQ(index)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0f1117",
    padding: "32px 24px",
    fontFamily: "'Segoe UI', sans-serif",
    maxWidth: "800px",
    margin: "0 auto",
    color: "#e1e1e1"
  },
  loading: {
    textAlign: "center",
    paddingTop: "100px",
    color: "#888",
    fontSize: "16px"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "16px"
  },
  heading: {
    fontSize: "28px",
    fontWeight: 700,
    color: "#fff",
    margin: 0
  },
  subheading: {
    color: "#888",
    margin: "4px 0 0",
    fontSize: "14px"
  },
  timer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "20px",
    fontWeight: 600,
    background: "rgba(255,255,255,0.05)",
    padding: "8px 16px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.1)"
  },
  pulseDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#ef4444",
    animation: "pulse 1.5s infinite"
  },
  progressContainer: {
    marginBottom: "24px"
  },
  progressBar: {
    width: "100%",
    height: "6px",
    background: "#2a2d3a",
    borderRadius: "3px",
    overflow: "hidden",
    marginBottom: "8px"
  },
  progressFill: {
    height: "100%",
    borderRadius: "3px",
    transition: "width 0.3s ease"
  },
  progressText: {
    fontSize: "12px",
    color: "#9ca3af"
  },
  card: {
    background: "#1a1d27",
    border: "1px solid #2a2d3a",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "20px"
  },
  questionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px"
  },
  qBadge: {
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#fff",
    borderRadius: "8px",
    padding: "4px 12px",
    fontSize: "13px",
    fontWeight: 700
  },
  marksBadge: {
    background: "rgba(34,197,94,0.15)",
    color: "#22c55e",
    borderRadius: "8px",
    padding: "4px 8px",
    fontSize: "12px",
    fontWeight: 600
  },
  questionText: {
    fontSize: "16px",
    lineHeight: "1.6",
    marginBottom: "20px",
    color: "#e1e1e1"
  },
  optionsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  optionCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    border: "2px solid",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.2s",
    '&:hover': {
      borderColor: "#6366f1",
      background: "rgba(99,102,241,0.05)"
    }
  },
  optionRadio: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    border: "2px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: 700,
    color: "#fff",
    flexShrink: 0
  },
  optionLabel: {
    color: "#9ca3af",
    fontWeight: 700,
    width: "20px",
    flexShrink: 0
  },
  optionText: {
    flex: 1,
    fontSize: "14px"
  },
  navContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "16px"
  },
  navLeft: {
    flex: 1
  },
  unansweredText: {
    color: "#9ca3af",
    fontSize: "14px"
  },
  navRight: {
    display: "flex",
    gap: "12px"
  },
  navBtn: {
    background: "transparent",
    border: "1px solid #2a2d3a",
    color: "#9ca3af",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
    '&:disabled': {
      opacity: 0.5,
      cursor: "not-allowed"
    },
    '&:hover:not(:disabled)': {
      borderColor: "#6366f1",
      color: "#6366f1"
    }
  },
  primaryNavBtn: {
    background: "#6366f1",
    border: "none",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
    transition: "all 0.2s",
    '&:disabled': {
      opacity: 0.5,
      cursor: "not-allowed"
    },
    '&:hover:not(:disabled)': {
      background: "#5558e6"
    }
  },
  quickNav: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    justifyContent: "center"
  },
  quickNavBtn: {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 600,
    transition: "all 0.2s",
    '&:hover': {
      transform: "translateY(-2px)"
    }
  },
  errorContainer: {
    background: "#1a1d27",
    borderRadius: "16px",
    padding: "40px",
    textAlign: "center",
    border: "1px solid #2a2d3a",
    marginTop: "60px"
  },
  errorHeading: {
    color: "#ef4444",
    marginBottom: "16px",
    fontSize: "24px"
  },
  errorText: {
    color: "#9ca3af",
    marginBottom: "24px",
    fontSize: "16px"
  },
  resultContainer: {
    background: "#1a1d27",
    borderRadius: "16px",
    padding: "40px",
    textAlign: "center",
    border: "1px solid #2a2d3a",
    marginTop: "60px"
  },
  resultHeader: {
    marginBottom: "32px"
  },
  trophy: {
    fontSize: "64px",
    marginBottom: "16px"
  },
  resultTitle: {
    fontSize: "28px",
    fontWeight: 700,
    color: "#fff"
  },
  scoreBox: {
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "24px"
  },
  scoreLabel: {
    display: "block",
    fontSize: "14px",
    color: "rgba(255,255,255,0.8)",
    marginBottom: "8px"
  },
  scoreValue: {
    fontSize: "48px",
    fontWeight: 700,
    color: "#fff"
  },
  resultStats: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginBottom: "32px"
  },
  statItem: {
    background: "rgba(255,255,255,0.05)",
    padding: "16px",
    borderRadius: "12px"
  },
  statLabel: {
    display: "block",
    fontSize: "12px",
    color: "#9ca3af",
    marginBottom: "4px"
  },
  statValue: {
    fontSize: "18px",
    fontWeight: 600,
    color: "#fff"
  },
  primaryBtn: {
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "16px 32px",
    fontSize: "16px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
    '&:hover': {
      transform: "translateY(-2px)",
      boxShadow: "0 8px 25px rgba(99,102,241,0.3)"
    }
  },
  secondaryBtn: {
    background: "transparent",
    color: "#9ca3af",
    border: "1px solid #2a2d3a",
    borderRadius: "12px",
    padding: "16px 32px",
    fontSize: "16px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
    '&:hover': {
      borderColor: "#6366f1",
      color: "#6366f1"
    }
  }
};

// Add CSS animations
const styleElement = document.createElement('style');
styleElement.innerHTML = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
`;
document.head.appendChild(styleElement);
