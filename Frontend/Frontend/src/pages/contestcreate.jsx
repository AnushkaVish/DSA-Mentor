// import React, { useState } from "react";
// import axiosClient from "../utils/axiosClient";
// import { useNavigate } from "react-router-dom";



// const emptyQuestion = () => ({
//   questionText: "",
//   options: ["", "", "", ""],
//   correctOption: 0,
//   marks: 1,
// });

// export default function CreateContest() {
//   const navigate = useNavigate();
//   const [form, setForm] = useState({
//     title: "",
//     description: "",
//     duration: 30,
//     startTime: "",
//     endTime: "",
//   });
//   const [questions, setQuestions] = useState([emptyQuestion()]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   // ── Form field handlers ──────────────────────
//   const handleForm = (e) =>
//     setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

//   const handleQuestion = (qi, field, value) => {
//     setQuestions((prev) => {
//       const copy = [...prev];
//       copy[qi] = { ...copy[qi], [field]: value };
//       return copy;
//     });
//   };

//   const handleOption = (qi, oi, value) => {
//     setQuestions((prev) => {
//       const copy = [...prev];
//       const opts = [...copy[qi].options];
//       opts[oi] = value;
//       copy[qi] = { ...copy[qi], options: opts };
//       return copy;
//     });
//   };

//   const addQuestion = () => {
//     if (questions.length >= 20) return;
//     setQuestions((prev) => [...prev, emptyQuestion()]);
//   };

//   const removeQuestion = (qi) => {
//     if (questions.length <= 1) return;
//     setQuestions((prev) => prev.filter((_, i) => i !== qi));
//   };

//   // ── Submit ───────────────────────────────────
//  const handleSubmit = async () => {
//   setError("");

//   if (!form.title || !form.startTime || !form.endTime)
//     return setError("Title, Start Time and End Time are required.");

//   if (questions.length < 5)
//     return setError("Minimum 5 questions required.");

//   for (let i = 0; i < questions.length; i++) {
//     const q = questions[i];

//     if (!q.questionText.trim())
//       return setError(`Question ${i + 1} text is empty.`);

//     if (q.options.some((o) => !o.trim()))
//       return setError(`Question ${i + 1} has an empty option.`);
//   }

//   try {
//     setLoading(true);

//     const res = await axiosClient.post("/api/contests", {
//       ...form,
//       duration: Number(form.duration), // ✅ ensure number
//       questions,
//     });

//     console.log("SUCCESS:", res.data); // ✅ debug

//     navigate("/admin/contests"); 

//   } catch (err) {
//     console.log("ERROR FULL:", err); // ✅ full error
//     console.log("ERROR DATA:", err.response?.data);

//     setError(
//       err.response?.data?.message ||
//       err.message ||
//       "Something went wrong"
//     );
//   } finally {
//     setLoading(false);
//   }
// };
//   return (
//     <div style={styles.page}>
//       {/* ── Header ── */}
//       <div style={styles.header}>
//         <div>
//           <h1 style={styles.heading}>Create Contest</h1>
//           <p style={styles.subheading}>
//             {questions.length}/20 questions added
//           </p>
//         </div>
//         <button
//           onClick={handleSubmit}
//           disabled={loading}
//           style={styles.publishBtn}
//         >
//           {loading ? "Publishing..." : "🚀 Publish Contest"}
//         </button>
//       </div>

//       {error && <div style={styles.errorBox}>{error}</div>}

//       {/* ── Contest Info ── */}
//       <div style={styles.card}>
//         <h2 style={styles.cardTitle}>Contest Details</h2>
//         <div style={styles.grid2}>
//           <div style={styles.formGroup}>
//             <label style={styles.label}>Contest Title *</label>
//             <input
//               style={styles.input}
//               name="title"
//               placeholder="e.g. Weekly DSA Challenge #12"
//               value={form.title}
//               onChange={handleForm}
//             />
//           </div>
//           <div style={styles.formGroup}>
//             <label style={styles.label}>Duration (minutes) *</label>
//             <input
//               style={styles.input}
//               type="number"
//               name="duration"
//               min={5}
//               max={180}
//               value={form.duration}
//               onChange={handleForm}
//             />
//           </div>
//           <div style={styles.formGroup}>
//             <label style={styles.label}>Start Time *</label>
//             <input
//               style={styles.input}
//               type="datetime-local"
//               name="startTime"
//               value={form.startTime}
//               onChange={handleForm}
//             />
//           </div>
//           <div style={styles.formGroup}>
//             <label style={styles.label}>End Time *</label>
//             <input
//               style={styles.input}
//               type="datetime-local"
//               name="endTime"
//               value={form.endTime}
//               onChange={handleForm}
//             />
//           </div>
//         </div>
//         <div style={styles.formGroup}>
//           <label style={styles.label}>Description</label>
//           <textarea
//             style={{ ...styles.input, height: "80px", resize: "vertical" }}
//             name="description"
//             placeholder="Contest description, rules, topics covered..."
//             value={form.description}
//             onChange={handleForm}
//           />
//         </div>
//       </div>

//       {/* ── Questions ── */}
//       {questions.map((q, qi) => (
//         <div key={qi} style={styles.card}>
//           <div style={styles.qHeader}>
//             <span style={styles.qBadge}>Q{qi + 1}</span>
//             <div style={styles.qHeaderRight}>
//               <label style={{ ...styles.label, marginBottom: 0 }}>
//                 Marks:
//               </label>
//               <input
//                 type="number"
//                 min={1}
//                 max={10}
//                 value={q.marks}
//                 onChange={(e) =>
//                   handleQuestion(qi, "marks", Number(e.target.value))
//                 }
//                 style={{ ...styles.input, width: "60px", textAlign: "center" }}
//               />
//               {questions.length > 1 && (
//                 <button
//                   onClick={() => removeQuestion(qi)}
//                   style={styles.removeBtn}
//                 >
//                   ✕ Remove
//                 </button>
//               )}
//             </div>
//           </div>

//           <textarea
//             style={{ ...styles.input, height: "70px", resize: "vertical" }}
//             placeholder={`Enter question ${qi + 1}...`}
//             value={q.questionText}
//             onChange={(e) =>
//               handleQuestion(qi, "questionText", e.target.value)
//             }
//           />

//           <div style={styles.optionsGrid}>
//             {q.options.map((opt, oi) => (
//               <div
//                 key={oi}
//                 style={{
//                   ...styles.optionRow,
//                   borderColor:
//                     q.correctOption === oi ? "#22c55e" : "transparent",
//                   background:
//                     q.correctOption === oi
//                       ? "rgba(34,197,94,0.08)"
//                       : "rgba(255,255,255,0.03)",
//                 }}
//               >
//                 <button
//                   onClick={() => handleQuestion(qi, "correctOption", oi)}
//                   style={{
//                     ...styles.radioBtn,
//                     background:
//                       q.correctOption === oi ? "#22c55e" : "transparent",
//                     borderColor:
//                       q.correctOption === oi ? "#22c55e" : "#555",
//                   }}
//                   title="Mark as correct"
//                 >
//                   {q.correctOption === oi ? "✓" : ""}
//                 </button>
//                 <span style={styles.optLabel}>
//                   {["A", "B", "C", "D"][oi]}.
//                 </span>
//                 <input
//                   style={{ ...styles.input, flex: 1, marginBottom: 0 }}
//                   placeholder={`Option ${["A", "B", "C", "D"][oi]}`}
//                   value={opt}
//                   onChange={(e) => handleOption(qi, oi, e.target.value)}
//                 />
//               </div>
//             ))}
//           </div>
//           <p style={styles.hint}>
//             ✓ Click the circle to mark the correct answer
//           </p>
//         </div>
//       ))}

//       {/* ── Add Question Button ── */}
//       {questions.length < 20 && (
//         <button onClick={addQuestion} style={styles.addBtn}>
//           + Add Question ({questions.length}/20)
//         </button>
//       )}

//       {/* ── Bottom Publish ── */}
//       <div style={styles.bottomBar}>
//         <span style={{ color: "#888" }}>
//           {questions.length} question{questions.length !== 1 ? "s" : ""} •{" "}
//           {questions.reduce((s, q) => s + q.marks, 0)} total marks
//         </span>
//         <button
//           onClick={handleSubmit}
//           disabled={loading}
//           style={styles.publishBtn}
//         >
//           {loading ? "Publishing..." : "🚀 Publish Contest"}
//         </button>
//       </div>
//     </div>
//   );
// }

// // ── Styles ────────────────────────────────────
// const styles = {
//   page: {
//     minHeight: "100vh",
//     background: "#0f1117",
//     padding: "32px 24px",
//     fontFamily: "'Segoe UI', sans-serif",
//     maxWidth: "860px",
//     margin: "0 auto",
//     color: "#e1e1e1",
//   },
//   header: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//     marginBottom: "24px",
//     flexWrap: "wrap",
//     gap: "12px",
//   },
//   heading: {
//     fontSize: "28px",
//     fontWeight: 700,
//     color: "#fff",
//     margin: 0,
//   },
//   subheading: {
//     color: "#888",
//     margin: "4px 0 0",
//     fontSize: "14px",
//   },
//   publishBtn: {
//     background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
//     color: "#fff",
//     border: "none",
//     borderRadius: "10px",
//     padding: "12px 28px",
//     fontSize: "15px",
//     fontWeight: 600,
//     cursor: "pointer",
//     transition: "opacity 0.2s",
//   },
//   errorBox: {
//     background: "rgba(239,68,68,0.15)",
//     border: "1px solid #ef4444",
//     borderRadius: "8px",
//     padding: "12px 16px",
//     color: "#fca5a5",
//     marginBottom: "20px",
//     fontSize: "14px",
//   },
//   card: {
//     background: "#1a1d27",
//     border: "1px solid #2a2d3a",
//     borderRadius: "14px",
//     padding: "24px",
//     marginBottom: "20px",
//   },
//   cardTitle: {
//     fontSize: "16px",
//     fontWeight: 600,
//     color: "#a5b4fc",
//     marginTop: 0,
//     marginBottom: "18px",
//     textTransform: "uppercase",
//     letterSpacing: "0.08em",
//     fontSize: "12px",
//   },
//   grid2: {
//     display: "grid",
//     gridTemplateColumns: "1fr 1fr",
//     gap: "16px",
//   },
//   formGroup: {
//     display: "flex",
//     flexDirection: "column",
//     gap: "6px",
//   },
//   label: {
//     fontSize: "13px",
//     color: "#9ca3af",
//     fontWeight: 500,
//     marginBottom: "4px",
//   },
//   input: {
//     background: "#0f1117",
//     border: "1px solid #2a2d3a",
//     borderRadius: "8px",
//     padding: "10px 14px",
//     color: "#e1e1e1",
//     fontSize: "14px",
//     outline: "none",
//     width: "100%",
//     boxSizing: "border-box",
//     transition: "border-color 0.2s",
//     marginBottom: "4px",
//   },
//   qHeader: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: "14px",
//   },
//   qHeaderRight: {
//     display: "flex",
//     alignItems: "center",
//     gap: "12px",
//   },
//   qBadge: {
//     background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
//     color: "#fff",
//     borderRadius: "8px",
//     padding: "4px 12px",
//     fontSize: "13px",
//     fontWeight: 700,
//   },
//   removeBtn: {
//     background: "rgba(239,68,68,0.15)",
//     border: "1px solid #ef4444",
//     color: "#fca5a5",
//     borderRadius: "7px",
//     padding: "5px 12px",
//     cursor: "pointer",
//     fontSize: "13px",
//   },
//   optionsGrid: {
//     display: "flex",
//     flexDirection: "column",
//     gap: "10px",
//     marginTop: "12px",
//   },
//   optionRow: {
//     display: "flex",
//     alignItems: "center",
//     gap: "10px",
//     border: "1px solid",
//     borderRadius: "10px",
//     padding: "8px 12px",
//     transition: "all 0.2s",
//   },
//   radioBtn: {
//     width: "26px",
//     height: "26px",
//     borderRadius: "50%",
//     border: "2px solid",
//     cursor: "pointer",
//     color: "#fff",
//     fontSize: "14px",
//     fontWeight: 700,
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     flexShrink: 0,
//     transition: "all 0.2s",
//   },
//   optLabel: {
//     color: "#9ca3af",
//     fontWeight: 700,
//     width: "20px",
//     flexShrink: 0,
//   },
//   hint: {
//     color: "#6b7280",
//     fontSize: "12px",
//     marginTop: "10px",
//     marginBottom: 0,
//   },
//   addBtn: {
//     width: "100%",
//     padding: "16px",
//     background: "transparent",
//     border: "2px dashed #2a2d3a",
//     borderRadius: "14px",
//     color: "#6366f1",
//     fontSize: "15px",
//     fontWeight: 600,
//     cursor: "pointer",
//     marginBottom: "20px",
//     transition: "all 0.2s",
//   },
//   bottomBar: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: "20px 0",
//     flexWrap: "wrap",
//     gap: "12px",
//   },
// };



import React, { useState } from "react";
import axiosClient from "../utils/axiosClient";
import { useNavigate } from "react-router-dom";

const emptyQuestion = () => ({
  questionText: "",
  options: ["", "", "", ""],
  correctOption: 0,
  marks: 1,
});

export default function CreateContest() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    duration: 30,
    startTime: "",
    endTime: "",
  });
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleForm = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleQuestion = (qi, field, value) =>
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qi] = { ...copy[qi], [field]: value };
      return copy;
    });

  const handleOption = (qi, oi, value) =>
    setQuestions((prev) => {
      const copy = [...prev];
      const opts = [...copy[qi].options];
      opts[oi] = value;
      copy[qi] = { ...copy[qi], options: opts };
      return copy;
    });

  const addQuestion = () => {
    if (questions.length >= 20) return;
    setQuestions((prev) => [...prev, emptyQuestion()]);
  };

  const removeQuestion = (qi) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== qi));
  };

  const handleSubmit = async () => {
    setError("");

    if (!form.title || !form.startTime || !form.endTime)
      return setError("Title, Start Time and End Time are required.");

    if (questions.length < 5)
      return setError("Minimum 5 questions required.");

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim())
        return setError(`Question ${i + 1} text is empty.`);
      if (q.options.some((o) => !o.trim()))
        return setError(`Question ${i + 1} has an empty option.`);
    }

    try {
      setLoading(true);
      await axiosClient.post("/api/contests", {
        ...form,
        duration: Number(form.duration),
        questions,
      });
      navigate("/contests");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const totalMarks = questions.reduce((s, q) => s + q.marks, 0);

  return (
    <div style={s.page}>
      <style>{`
        input:focus, textarea:focus { border-color: #6366f1 !important; outline: none; }
        input[type=number]::-webkit-inner-spin-button { opacity: 0.4; }
      `}</style>

      {/* ── Header ── */}
      <div style={s.header}>
        <div>
          <div style={s.breadcrumb}>
            <span style={s.breadcrumbLink} onClick={() => navigate("/contests")}>Contests</span>
            <span style={s.breadcrumbSep}>›</span>
            <span style={{ color: "#e1e1e1" }}>Create New</span>
          </div>
          <h1 style={s.heading}>Create Contest</h1>
          <p style={s.subheading}>
            {questions.length}/20 questions &nbsp;·&nbsp; {totalMarks} total marks
          </p>
        </div>
        <button onClick={handleSubmit} disabled={loading} style={s.publishBtn}>
          {loading ? "Publishing…" : "🚀 Publish"}
        </button>
      </div>

      {error && <div style={s.errorBox}>⚠ {error}</div>}

      {/* ── Contest Details ── */}
      <div style={s.card}>
        <p style={s.cardLabel}>Contest Details</p>
        <div style={s.grid2}>
          <Field label="Contest Title *">
            <input style={s.input} name="title" placeholder="e.g. Weekly DSA Challenge #12"
              value={form.title} onChange={handleForm} />
          </Field>
          <Field label="Duration (minutes) *">
            <input style={s.input} type="number" name="duration" min={5} max={180}
              value={form.duration} onChange={handleForm} />
          </Field>
          <Field label="Start Time *">
            <input style={s.input} type="datetime-local" name="startTime"
              value={form.startTime} onChange={handleForm} />
          </Field>
          <Field label="End Time *">
            <input style={s.input} type="datetime-local" name="endTime"
              value={form.endTime} onChange={handleForm} />
          </Field>
        </div>
        <Field label="Description">
          <textarea style={{ ...s.input, height: "80px", resize: "vertical" }}
            name="description" placeholder="Contest description, rules, topics covered…"
            value={form.description} onChange={handleForm} />
        </Field>
      </div>

      {/* ── Questions ── */}
      {questions.map((q, qi) => (
        <div key={qi} style={s.card}>
          <div style={s.qHeader}>
            <div style={s.qHeaderLeft}>
              <span style={s.qBadge}>Q{qi + 1}</span>
              <span style={s.qHint}>
                {q.questionText.trim() ? `${q.questionText.trim().slice(0, 40)}…` : "Untitled question"}
              </span>
            </div>
            <div style={s.qHeaderRight}>
              <label style={s.smallLabel}>Marks</label>
              <input type="number" min={1} max={10} value={q.marks}
                onChange={(e) => handleQuestion(qi, "marks", Number(e.target.value))}
                style={{ ...s.input, width: "58px", textAlign: "center", marginBottom: 0 }} />
              {questions.length > 1 && (
                <button onClick={() => removeQuestion(qi)} style={s.removeBtn}>✕</button>
              )}
            </div>
          </div>

          <textarea style={{ ...s.input, height: "70px", resize: "vertical", marginBottom: "16px" }}
            placeholder={`Enter question ${qi + 1}…`}
            value={q.questionText}
            onChange={(e) => handleQuestion(qi, "questionText", e.target.value)} />

          <div style={s.optionsGrid}>
            {q.options.map((opt, oi) => {
              const isCorrect = q.correctOption === oi;
              return (
                <div key={oi} style={{
                  ...s.optionRow,
                  borderColor: isCorrect ? "#22c55e" : "#1e2130",
                  background: isCorrect ? "rgba(34,197,94,0.07)" : "rgba(255,255,255,0.02)",
                }}>
                  <button
                    onClick={() => handleQuestion(qi, "correctOption", oi)}
                    style={{
                      ...s.radioBtn,
                      background: isCorrect ? "#22c55e" : "transparent",
                      borderColor: isCorrect ? "#22c55e" : "#3f4252",
                    }}
                    title="Mark as correct"
                  >
                    {isCorrect ? "✓" : ""}
                  </button>
                  <span style={s.optLabel}>{["A", "B", "C", "D"][oi]}.</span>
                  <input
                    style={{ ...s.input, flex: 1, marginBottom: 0 }}
                    placeholder={`Option ${["A", "B", "C", "D"][oi]}`}
                    value={opt}
                    onChange={(e) => handleOption(qi, oi, e.target.value)}
                  />
                </div>
              );
            })}
          </div>
          <p style={s.hint}>Click the circle to mark the correct answer</p>
        </div>
      ))}

      {/* ── Add Question ── */}
      {questions.length < 20 && (
        <button onClick={addQuestion} style={s.addBtn}>
          + Add Question &nbsp;<span style={{ color: "#555" }}>({questions.length}/20)</span>
        </button>
      )}

      {/* ── Bottom Bar ── */}
      <div style={s.bottomBar}>
        <span style={{ color: "#6b7280", fontSize: "14px" }}>
          {questions.length} question{questions.length !== 1 ? "s" : ""} · {totalMarks} total marks
        </span>
        <button onClick={handleSubmit} disabled={loading} style={s.publishBtn}>
          {loading ? "Publishing…" : "🚀 Publish Contest"}
        </button>
      </div>
    </div>
  );
}

// Helper wrapper
const Field = ({ label, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
    <label style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600, letterSpacing: "0.04em" }}>
      {label}
    </label>
    {children}
  </div>
);

// ─── Styles ────────────────────────────────────────────────────────────────────
const s = {
  page: {
    minHeight: "100vh",
    background: "#0b0d14",
    padding: "32px 24px",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    maxWidth: "860px",
    margin: "0 auto",
    color: "#e1e1e1",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "28px",
    flexWrap: "wrap",
    gap: "12px",
  },
  breadcrumb: { display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", marginBottom: "8px" },
  breadcrumbLink: { color: "#6366f1", cursor: "pointer" },
  breadcrumbSep: { color: "#4b5563" },
  heading: { fontSize: "26px", fontWeight: 700, color: "#fff", margin: 0 },
  subheading: { color: "#6b7280", margin: "4px 0 0", fontSize: "13px" },
  publishBtn: {
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "11px 26px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },
  errorBox: {
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.35)",
    borderRadius: "8px",
    padding: "11px 16px",
    color: "#fca5a5",
    marginBottom: "20px",
    fontSize: "13px",
  },
  card: {
    background: "#13161f",
    border: "1px solid #1e2130",
    borderRadius: "14px",
    padding: "24px",
    marginBottom: "18px",
  },
  cardLabel: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#6366f1",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginTop: 0,
    marginBottom: "18px",
  },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" },
  smallLabel: { fontSize: "12px", color: "#6b7280", fontWeight: 600 },
  input: {
    background: "#0b0d14",
    border: "1px solid #1e2130",
    borderRadius: "8px",
    padding: "10px 13px",
    color: "#e1e1e1",
    fontSize: "14px",
    width: "100%",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
    marginBottom: "4px",
    fontFamily: "inherit",
  },
  qHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "14px",
    gap: "12px",
    flexWrap: "wrap",
  },
  qHeaderLeft: { display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 },
  qHeaderRight: { display: "flex", alignItems: "center", gap: "10px" },
  qBadge: {
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#fff",
    borderRadius: "7px",
    padding: "4px 11px",
    fontSize: "12px",
    fontWeight: 700,
    flexShrink: 0,
  },
  qHint: { color: "#4b5563", fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  removeBtn: {
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.3)",
    color: "#f87171",
    borderRadius: "7px",
    padding: "6px 10px",
    cursor: "pointer",
    fontSize: "13px",
  },
  optionsGrid: { display: "flex", flexDirection: "column", gap: "9px" },
  optionRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    border: "1px solid",
    borderRadius: "10px",
    padding: "8px 12px",
    transition: "all 0.2s",
  },
  radioBtn: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    border: "2px solid",
    cursor: "pointer",
    color: "#fff",
    fontSize: "13px",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "all 0.2s",
  },
  optLabel: { color: "#6b7280", fontWeight: 700, width: "18px", flexShrink: 0, fontSize: "13px" },
  hint: { color: "#374151", fontSize: "11px", marginTop: "10px", marginBottom: 0 },
  addBtn: {
    width: "100%",
    padding: "16px",
    background: "transparent",
    border: "2px dashed #1e2130",
    borderRadius: "12px",
    color: "#6366f1",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    marginBottom: "20px",
    transition: "border-color 0.2s",
  },
  bottomBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 0",
    flexWrap: "wrap",
    gap: "12px",
    borderTop: "1px solid #1e2130",
  },
};