import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import {
  CheckCircle, Target, Signal, Dumbbell, BrainCircuit,
  RefreshCcw, List, LayoutGrid, Search, ChevronRight,
  Zap, Code2, SlidersHorizontal,
} from 'lucide-react';
import FeaturesSection from './hero';

// ─── Keyframes (one tiny injection, only animations) ────────────────────────
const Keyframes = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap');
    .font-grotesk { font-family: 'Space Grotesk', sans-serif; }
    .font-mono-jet { font-family: 'JetBrains Mono', monospace; }

    @keyframes drift {
      from { transform: translate(0,0) scale(1); }
      to   { transform: translate(40px,30px) scale(1.05); }
    }
    @keyframes drift2 {
      from { transform: translate(0,0) scale(1); }
      to   { transform: translate(-30px,-20px) scale(1.04); }
    }
    @keyframes rowIn {
      from { opacity:0; transform:translateX(-10px); }
      to   { opacity:1; transform:translateX(0); }
    }
    @keyframes cardIn {
      from { opacity:0; transform:translateY(14px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes pulseGlow {
      0%,100% { box-shadow: 0 0 6px rgba(34,197,94,0.5); }
      50%      { box-shadow: 0 0 16px rgba(34,197,94,0.9), 0 0 32px rgba(34,197,94,0.3); }
    }
    @keyframes fadeUp {
      from { opacity:0; transform:translateY(12px); }
      to   { opacity:1; transform:translateY(0); }
    }
    .anim-drift  { animation: drift  12s ease-in-out infinite alternate; }
    .anim-drift2 { animation: drift2 14s ease-in-out infinite alternate; }
    .anim-glow   { animation: pulseGlow 2s ease infinite; }
    .anim-fadeup { animation: fadeUp 0.5s ease both; }

    /* staggered rows */
    ${Array.from({length:40},(_,i)=>
      `.row-${i+1}{animation:rowIn 0.35s ease both;animation-delay:${i*0.03}s}`
    ).join('')}
    ${Array.from({length:40},(_,i)=>
      `.card-${i+1}{animation:cardIn 0.4s ease both;animation-delay:${i*0.05}s}`
    ).join('')}

    /* ring */
    .ring-track { fill:none; stroke:rgba(255,255,255,0.07); }
    .ring-fill  { fill:none; stroke-linecap:round; transition:stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1); transform:rotate(-90deg); transform-origin:center; }

    /* select arrow */
    .hp-select { appearance:none; -webkit-appearance:none; }
    .hp-select option { background:#0f172a; }

    /* scrollbar */
    ::-webkit-scrollbar { width:5px; }
    ::-webkit-scrollbar-track { background:transparent; }
    ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.08); border-radius:4px; }
    ::-webkit-scrollbar-thumb:hover { background:rgba(34,197,94,0.35); }
  `}</style>
);

// ─── Ring Progress ───────────────────────────────────────────────────────────
const Ring = ({ value, total, color='#22c55e', size=72, stroke=5 }) => {
  const r   = (size - stroke) / 2;
  const c   = 2 * Math.PI * r;
  const off = c * (1 - (total > 0 ? value / total : 0));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle className="ring-track" cx={size/2} cy={size/2} r={r} strokeWidth={stroke}/>
      <circle className="ring-fill"  cx={size/2} cy={size/2} r={r} strokeWidth={stroke}
        stroke={color} strokeDasharray={c} strokeDashoffset={off}/>
    </svg>
  );
};

// ─── Sidebar ─────────────────────────────────────────────────────────────────
const Sidebar = ({ stats, onStatus, onDiff }) => {
  const diffs = [
    { k:'Easy',   color:'#22c55e', icon:<Signal size={13}/> },
    { k:'Medium', color:'#eab308', icon:<Dumbbell size={13}/> },
    { k:'Hard',   color:'#ef4444', icon:<BrainCircuit size={13}/> },
  ];
  const pct = stats.total > 0 ? Math.round((stats.solved/stats.total)*100) : 0;

  return (
    <aside className="hidden lg:flex flex-col gap-4 sticky top-6 w-[260px] shrink-0">

      {/* Progress */}
      <div className="relative rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 overflow-hidden
                      hover:border-green-500/30 transition-colors duration-300 group">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"/>

        <div className="flex items-center justify-between mb-5">
          <span className="font-mono-jet text-[10px] tracking-[0.15em] uppercase text-green-400">Progress</span>
          <span className="w-2 h-2 rounded-full bg-green-400 anim-glow"/>
        </div>

        <div className="flex items-center gap-4 mb-5">
          <div className="relative flex items-center justify-center">
            <Ring value={stats.solved} total={stats.total} size={76}/>
            <div className="absolute text-center">
              <div className="font-mono-jet text-sm font-bold text-green-400 leading-none">{stats.solved}</div>
              <div className="text-[9px] text-slate-500">/{stats.total}</div>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Total solved</p>
            <p className="font-mono-jet text-2xl font-bold text-white leading-none">
              {pct}<span className="text-sm font-normal text-slate-500">%</span>
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {[
            { label:'Solved',    val:stats.solved,    icon:<CheckCircle size={12}/>, color:'#22c55e', s:'Solved' },
            { label:'Attempted', val:stats.attempted, icon:<Target size={12}/>,      color:'#eab308', s:'Attempted' },
          ].map(b => (
            <button key={b.label} onClick={() => onStatus(b.s)}
              className="flex-1 flex flex-col items-center gap-1 py-3 rounded-xl
                         border border-white/[0.07] bg-white/[0.02]
                         hover:bg-white/[0.05] transition-all duration-200 cursor-pointer"
              style={{ color: b.color }}
            >
              {b.icon}
              <span className="font-mono-jet text-base font-bold text-white">{b.val}</span>
              <span className="text-[11px] text-slate-500">{b.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5
                      hover:border-green-500/30 transition-colors duration-300">
        <p className="font-mono-jet text-[10px] tracking-[0.15em] uppercase text-green-400 mb-4">Difficulty</p>
        <div className="flex flex-col gap-4">
          {diffs.map(d => {
            const sv = stats.solvedByDifficulty[d.k];
            const tt = stats.totalByDifficulty[d.k];
            const p  = tt > 0 ? (sv/tt)*100 : 0;
            return (
              <button key={d.k} onClick={() => onDiff(d.k)}
                className="text-left cursor-pointer bg-transparent border-none p-0 group/diff">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="flex items-center gap-1.5 text-xs font-medium" style={{color:d.color}}>
                    {d.icon} {d.k}
                  </span>
                  <span className="font-mono-jet text-[11px] text-slate-500">{sv}/{tt}</span>
                </div>
                <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width:`${p}%`, background:d.color, opacity:0.8 }}/>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Streak */}
      <div className="flex items-start gap-3 rounded-2xl border border-green-500/20 bg-green-500/[0.04] p-4">
        <Zap size={14} className="text-green-400 shrink-0 mt-0.5"/>
        <div>
          <p className="text-xs font-semibold text-white mb-1">Daily Streak</p>
          <p className="text-[11px] text-slate-500 leading-relaxed">Solve at least one problem today to keep your streak alive.</p>
        </div>
      </div>
    </aside>
  );
};

// ─── Mobile Stats Bar ────────────────────────────────────────────────────────
const MobileStats = ({ stats }) => {
  const pct = stats.total > 0 ? Math.round((stats.solved/stats.total)*100) : 0;
  const pills = [
    { label:'Solved', val:stats.solved,                    color:'#22c55e', icon:<CheckCircle size={13}/> },
    { label:'Easy',   val:stats.solvedByDifficulty.Easy,   color:'#22c55e', icon:<Signal size={13}/> },
    { label:'Medium', val:stats.solvedByDifficulty.Medium, color:'#eab308', icon:<Dumbbell size={13}/> },
    { label:'Hard',   val:stats.solvedByDifficulty.Hard,   color:'#ef4444', icon:<BrainCircuit size={13}/> },
    { label:'Total',  val:stats.total,                     color:'#94a3b8', icon:<Code2 size={13}/> },
  ];

  return (
    <div className="lg:hidden mb-5 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 flex flex-col gap-3">
      {/* Ring row */}
      <div className="flex items-center gap-4">
        <div className="relative flex items-center justify-center shrink-0">
          <Ring value={stats.solved} total={stats.total} size={60} stroke={4}/>
          <div className="absolute text-center">
            <div className="font-mono-jet text-xs font-bold text-green-400 leading-none">{stats.solved}</div>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-500 mb-0.5">Overall Progress</p>
          <p className="font-mono-jet text-xl font-bold text-white leading-none">
            {pct}<span className="text-xs font-normal text-slate-500">%</span>
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="w-2 h-2 rounded-full bg-green-400 anim-glow"/>
          <span className="text-[10px] text-slate-500">Live</span>
        </div>
      </div>
      {/* Pills */}
      <div className="grid grid-cols-3 gap-2">
        {pills.slice(0,3).map(s => (
          <div key={s.label} className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2">
            <span style={{color:s.color}} className="shrink-0">{s.icon}</span>
            <div className="min-w-0">
              <p className="font-mono-jet text-sm font-bold leading-none" style={{color:s.color}}>{s.val}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {pills.slice(3).map(s => (
          <div key={s.label} className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2">
            <span style={{color:s.color}} className="shrink-0">{s.icon}</span>
            <div className="min-w-0">
              <p className="font-mono-jet text-sm font-bold leading-none" style={{color:s.color}}>{s.val}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Filters ─────────────────────────────────────────────────────────────────
const Filters = ({
  viewMode, setViewMode, count,
  topics, difficulties, statuses,
  search, topic, difficulty, status,
  onSearch, onTopic, onDiff, onStatus, onReset,
}) => {
  const [open, setOpen] = useState(true);

  const sel = "w-full bg-white/[0.03] border border-white/[0.07] rounded-xl px-3 py-2 text-sm text-slate-200 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 hp-select font-grotesk";

  return (
    <div className="flex flex-col gap-3">
      {/* Top bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-mono-jet text-[10px] tracking-[0.15em] uppercase text-green-400 mr-auto">
          Problems <span className="text-slate-500 normal-case tracking-normal text-[11px]">({count})</span>
        </span>

        <button onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/[0.07]
                     text-slate-400 text-xs hover:border-green-500/30 hover:text-white
                     transition-all duration-200 cursor-pointer bg-transparent font-grotesk whitespace-nowrap">
          <RefreshCcw size={12}/> Reset
        </button>

        {/* Mobile filter toggle */}
        <button onClick={() => setOpen(v => !v)}
          className="flex md:hidden items-center gap-1.5 px-3 py-2 rounded-xl border border-white/[0.07]
                     text-slate-400 text-xs hover:border-green-500/30 hover:text-white
                     transition-all duration-200 cursor-pointer bg-transparent font-grotesk">
          <SlidersHorizontal size={12}/> {open ? 'Hide' : 'Filters'}
        </button>

        <div className="flex gap-1">
          {[['list', <List size={15}/>], ['grid', <LayoutGrid size={15}/>]].map(([m, icon]) => (
            <button key={m} onClick={() => setViewMode(m)} aria-label={m}
              className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all duration-200 cursor-pointer
                ${viewMode === m
                  ? 'bg-green-500 border-green-500 text-black'
                  : 'border-white/[0.07] text-slate-400 bg-transparent hover:border-green-500/30 hover:text-white'}`}>
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* Filter inputs */}
      {open && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 anim-fadeup">
          {/* Search — full width on mobile, spans 1 col md */}
          <div className="relative sm:col-span-2 md:col-span-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"/>
            <input
              className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl pl-9 pr-3 py-2
                         text-sm text-slate-200 placeholder-slate-600 outline-none
                         focus:border-green-500 focus:ring-2 focus:ring-green-500/20
                         transition-all duration-200 font-grotesk"
              placeholder="Search problems..."
              value={search}
              onChange={onSearch}
            />
          </div>
          <select className={sel} value={difficulty} onChange={e => onDiff(e.target.value)}>
            {difficulties.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select className={sel} value={status} onChange={e => onStatus(e.target.value)}>
            {statuses.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select className={sel} value={topic} onChange={e => onTopic(e.target.value)}>
            {topics.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      )}
    </div>
  );
};

// ─── Status Icon ─────────────────────────────────────────────────────────────
const StatusDot = ({ status }) =>
  status === 'Solved'
    ? <CheckCircle size={15} className="text-green-400 shrink-0" style={{filter:'drop-shadow(0 0 4px rgba(34,197,94,0.6))'}}/>
    : <div className="w-4 h-4 rounded-full border border-slate-600 shrink-0"/>;

// ─── Problems Table ───────────────────────────────────────────────────────────
const ProblemsTable = ({ problems }) => {
  if (!problems.length) return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 rounded-2xl border border-dashed border-white/10">
      <Code2 size={30} className="text-slate-600"/>
      <p className="text-white font-semibold">No problems found</p>
      <p className="text-slate-500 text-sm">Try adjusting your filters.</p>
    </div>
  );

  const diffPill = {
    easy:   'bg-green-500/10 text-green-400 border border-green-500/25',
    medium: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/25',
    hard:   'bg-red-500/10 text-red-400 border border-red-500/25',
  };

  return (
    <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
      {/* Header */}
      <div className="hidden sm:grid grid-cols-[24px_1fr_auto_auto] gap-3 px-5 py-3
                      bg-white/[0.02] border-b border-white/[0.07]">
        {['','Title','Difficulty','Topics'].map((h,i) => (
          <span key={i} className="font-mono-jet text-[10px] tracking-widest uppercase text-slate-600">{h}</span>
        ))}
      </div>

      {problems.map((p, idx) => (
        <NavLink key={p._id} to={`/problem/${p._id}`}
          className={`row-${Math.min(idx+1,40)} grid grid-cols-[24px_1fr_auto] sm:grid-cols-[24px_1fr_auto_auto]
                      items-center gap-3 px-5 py-3.5
                      border-b border-white/[0.05] last:border-b-0
                      hover:bg-green-500/[0.04] transition-colors duration-150
                      no-underline group`}
        >
          <StatusDot status={p.status}/>

          <span className="text-slate-200 text-sm font-medium truncate
                           group-hover:text-green-400 transition-colors duration-200">
            {p.title}
          </span>

          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${diffPill[p.difficulty.toLowerCase()]}`}>
            {p.difficulty}
          </span>

          <div className="hidden sm:flex gap-1.5 flex-wrap justify-end max-w-[180px]">
            {p.tags.slice(0,2).map(t => (
              <span key={t} className="text-[11px] px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.07] text-slate-500 whitespace-nowrap">
                {t}
              </span>
            ))}
            {p.tags.length > 2 && (
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.07] text-slate-500">
                +{p.tags.length-2}
              </span>
            )}
          </div>
        </NavLink>
      ))}
    </div>
  );
};

// ─── Problems Grid ────────────────────────────────────────────────────────────
const ProblemsGrid = ({ problems }) => {
  if (!problems.length) return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 rounded-2xl border border-dashed border-white/10">
      <Code2 size={30} className="text-slate-600"/>
      <p className="text-white font-semibold">No problems found</p>
      <p className="text-slate-500 text-sm">Try adjusting your filters.</p>
    </div>
  );

  const diffColor = { Easy:'#22c55e', Medium:'#eab308', Hard:'#ef4444' };
  const diffPill  = {
    easy:   'bg-green-500/10 text-green-400 border border-green-500/25',
    medium: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/25',
    hard:   'bg-red-500/10 text-red-400 border border-red-500/25',
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
      {problems.map((p, idx) => (
        <NavLink key={p._id} to={`/problem/${p._id}`}
          className={`card-${Math.min(idx+1,40)} relative flex flex-col gap-3 p-4 rounded-2xl
                      border border-white/[0.07] bg-white/[0.02]
                      hover:border-green-500/30 hover:-translate-y-1
                      hover:shadow-[0_16px_40px_rgba(0,0,0,0.4),0_0_0_1px_rgba(34,197,94,0.08)]
                      transition-all duration-300 no-underline group overflow-hidden`}>
          {/* top glow line */}
          <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-green-400 to-cyan-400
                          opacity-0 group-hover:opacity-50 transition-opacity duration-300"/>

          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${diffPill[p.difficulty.toLowerCase()]}`}>
              {p.difficulty}
            </span>
            <StatusDot status={p.status}/>
          </div>

          <p className="text-sm font-semibold text-slate-200 leading-snug flex-1 group-hover:text-white transition-colors duration-200">
            {p.title}
          </p>

          <div className="flex gap-1.5 flex-wrap">
            {p.tags.slice(0,3).map(t => (
              <span key={t} className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.07] text-slate-500">
                {t}
              </span>
            ))}
            {p.tags.length > 3 && (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.07] text-slate-500">
                +{p.tags.length-3}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-xs mt-auto" style={{color: diffColor[p.difficulty] || '#64748b'}}>
            <ChevronRight size={12}
              className="translate-x-0 group-hover:translate-x-0.5 transition-transform duration-200"/>
            Solve now
          </div>
        </NavLink>
      ))}
    </div>
  );
};

// ─── Homepage ─────────────────────────────────────────────────────────────────
export default function Homepage() {
  const { user } = useSelector(s => s.auth);
  const [problems,        setProblems]        = useState([]);
  const [solvedIds,       setSolvedIds]       = useState(new Set());
  const [filters,         setFilters]         = useState({ difficulty:'All', tag:'All', status:'All', search:'' });
  const [viewMode,        setViewMode]        = useState('list');

  const set = key => val => setFilters(p => ({...p, [key]: val}));

  useEffect(() => {
    axiosClient.get('/problem/getAllProblem').then(({ data }) => {
      setProblems(data.map(p => ({
        ...p,
        difficulty: p.difficulty.charAt(0).toUpperCase() + p.difficulty.slice(1),
        tags: Array.isArray(p.tags) ? p.tags : [p.tags],
      })));
    }).catch(console.error);

    if (user) {
      axiosClient.get('/problem/problemSolvedByUser').then(({ data }) => {
        setSolvedIds(new Set(data.map(p => p._id)));
      }).catch(console.error);
    }
  }, [user]);

  const filtered = problems
    .map(p => ({ ...p, status: solvedIds.has(p._id) ? 'Solved' : 'Todo' }))
    .filter(p =>
      (filters.difficulty === 'All' || p.difficulty === filters.difficulty) &&
      (filters.tag        === 'All' || p.tags.includes(filters.tag)) &&
      (filters.status     === 'All' || p.status === filters.status) &&
      p.title.toLowerCase().includes(filters.search.toLowerCase())
    );

  const stats = {
    solved:    solvedIds.size,
    total:     problems.length,
    attempted: 0,
    solvedByDifficulty: {
      Easy:   problems.filter(p => p.difficulty==='Easy'   && solvedIds.has(p._id)).length,
      Medium: problems.filter(p => p.difficulty==='Medium' && solvedIds.has(p._id)).length,
      Hard:   problems.filter(p => p.difficulty==='Hard'   && solvedIds.has(p._id)).length,
    },
    totalByDifficulty: {
      Easy:   problems.filter(p => p.difficulty==='Easy').length,
      Medium: problems.filter(p => p.difficulty==='Medium').length,
      Hard:   problems.filter(p => p.difficulty==='Hard').length,
    },
  };

  const topics = [
    { label:'All Topics', value:'All' },
    ...Array.from(new Set(problems.flatMap(p => p.tags))).map(t => ({ label:t, value:t })),
  ];
  const difficulties = [
    { label:'All Difficulty', value:'All' },
    { label:'Easy',   value:'Easy' },
    { label:'Medium', value:'Medium' },
    { label:'Hard',   value:'Hard' },
  ];
  const statuses = [
    { label:'All Status', value:'All' },
    { label:'Solved',     value:'Solved' },
    { label:'Todo',       value:'Todo' },
  ];

  return (
    <div className="font-grotesk bg-[#090e12] min-h-screen relative overflow-x-hidden">
      <Keyframes/>

      {/* Ambient orbs */}
      <div className="anim-drift pointer-events-none fixed -top-24 -left-24 w-[500px] h-[500px] rounded-full
                      bg-[radial-gradient(circle,rgba(34,197,94,0.11)_0%,transparent_70%)]"
           style={{filter:'blur(80px)', zIndex:0}}/>
      <div className="anim-drift2 pointer-events-none fixed bottom-[20%] -right-24 w-[400px] h-[400px] rounded-full
                      bg-[radial-gradient(circle,rgba(99,102,241,0.08)_0%,transparent_70%)]"
           style={{filter:'blur(80px)', zIndex:0}}/>
      {/* Scanline */}
      <div className="pointer-events-none fixed inset-0 z-0"
           style={{background:'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.025) 2px,rgba(0,0,0,0.025) 4px)'}}/>

      {/* Page content */}
      <div className="relative z-10 max-w-[1240px] mx-auto px-4 sm:px-6 pt-7 pb-20">

        {/* Mobile stats */}
        <MobileStats stats={stats}/>

        {/* Two-column layout */}
        <div className="flex gap-6 items-start">

          {/* Sidebar */}
          <Sidebar
            stats={stats}
            onStatus={set('status')}
            onDiff={set('difficulty')}
          />

          {/* Main content */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            <Filters
              viewMode={viewMode} setViewMode={setViewMode}
              count={filtered.length}
              topics={topics} difficulties={difficulties} statuses={statuses}
              search={filters.search} topic={filters.tag}
              difficulty={filters.difficulty} status={filters.status}
              onSearch={e => set('search')(e.target.value)}
              onTopic={set('tag')}
              onDiff={set('difficulty')}
              onStatus={set('status')}
              onReset={() => setFilters({ difficulty:'All', tag:'All', status:'All', search:'' })}
            />

            {viewMode === 'list'
              ? <ProblemsTable problems={filtered}/>
              : <ProblemsGrid  problems={filtered}/>
            }
          </div>
        </div>

        {/* Divider */}
        <div className="mt-20 mb-2 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"/>

        {/* Features section — no overlap */}
        <div className="mt-2">
          <FeaturesSection/>
        </div>
      </div>
    </div>
  );
}