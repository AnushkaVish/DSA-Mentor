import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../authSlice';
import { User, LogOut, Settings, ChevronDown, Menu, X, Code2 } from 'lucide-react';

const Layout = ({ children }) => {
  const dispatch = useDispatch();
  const { user }  = useSelector(s => s.auth);

  const [dropOpen,   setDropOpen]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled,   setScrolled]   = useState(false);

  const dropRef = useRef(null);

  /* scroll shadow */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* close dropdown on outside click */
  useEffect(() => {
    const handler = e => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* lock body scroll when mobile menu open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleLogout = () => { dispatch(logoutUser()); setDropOpen(false); setMobileOpen(false); };

  const navLinks = [
    { to: '/',                   label: 'Problems' },
    { to: '/contest',            label: 'Contests' },
    { to: '/leaderboard',        label: 'Leaderboard' },
    { to: '/verify-certificate', label: 'Verify' },
    { to: '/documentation',      label: 'Docs' },
    { to: '/courses',            label: 'Courses' },
    { to: '/interview',          label: 'Interview' },
  ];

  /* shared active class helper */
  const linkCls = ({ isActive }) =>
    `text-[13.5px] font-medium px-3 py-1.5 rounded-xl transition-all duration-200 whitespace-nowrap
     ${isActive
       ? 'text-white bg-indigo-500/20'
       : 'text-white/50 hover:text-white hover:bg-white/[0.07]'}`;

  return (
    <div className="min-h-screen bg-[#090e12] text-white font-sans">

      {/* ── Fonts ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@700&display=swap');
        body { font-family: 'Space Grotesk', sans-serif; margin:0; padding:0; background:#090e12; }
        .font-mono-jet { font-family: 'JetBrains Mono', monospace; }
        @keyframes slideDown { from{transform:translateY(-8px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes dropIn    { from{transform:translateY(-6px) scale(0.97);opacity:0} to{transform:translateY(0) scale(1);opacity:1} }
        .anim-slide { animation: slideDown 0.22s ease both; }
        .anim-fade  { animation: fadeIn 0.2s ease both; }
        .anim-drop  { animation: dropIn 0.15s ease both; }
      `}</style>

      {/* ══════════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════════ */}
      <nav className={`sticky top-0 z-50 w-full flex justify-center px-4 py-3 transition-all duration-300
                       ${scrolled ? 'bg-[#090e12]/80 backdrop-blur-xl' : ''}`}>

        <div className={`w-full max-w-[1200px] flex items-center justify-between
                         bg-white/[0.04] backdrop-blur-2xl
                         border rounded-2xl px-4 py-2.5
                         transition-all duration-300
                         ${scrolled
                           ? 'border-white/[0.1] shadow-[0_8px_32px_rgba(0,0,0,0.5)]'
                           : 'border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.3)]'}`}>

          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2.5 no-underline shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600
                            flex items-center justify-center shadow-[0_2px_12px_rgba(99,102,241,0.4)]">
              <Code2 size={15} className="text-white"/>
            </div>
            <span className="font-mono-jet text-[15px] font-bold text-white hidden sm:block tracking-tight">
              DSA<span className="text-indigo-400">—</span>MENTOR
            </span>
          </NavLink>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navLinks.map(l => (
              <NavLink key={l.to} to={l.to} className={linkCls} end={l.to === '/'}>
                {l.label}
              </NavLink>
            ))}
          </div>

          {/* Right: auth + hamburger */}
          <div className="flex items-center gap-2">

            {/* Desktop auth */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                /* User dropdown */
                <div className="relative" ref={dropRef}>
                  <button
                    onClick={() => setDropOpen(v => !v)}
                    className="flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.1]
                               border border-white/[0.1] hover:border-white/[0.18]
                               rounded-xl px-2.5 py-1.5 transition-all duration-200 cursor-pointer"
                  >
                    <img
                      src={user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                      alt="avatar"
                      className="w-7 h-7 rounded-lg object-cover bg-indigo-600"
                    />
                    <span className="text-[13px] font-semibold text-white/85 max-w-[90px] truncate">
                      {user.username}
                    </span>
                    <ChevronDown size={13} className={`text-white/40 transition-transform duration-200 ${dropOpen ? 'rotate-180' : ''}`}/>
                  </button>

                  {dropOpen && (
                    <div className="anim-drop absolute top-[calc(100%+8px)] right-0 min-w-[190px]
                                    bg-[#0f172a]/98 backdrop-blur-xl
                                    border border-white/[0.09] rounded-2xl p-1.5
                                    shadow-[0_20px_50px_rgba(0,0,0,0.6)]">

                      {/* User header */}
                      <div className="flex items-center gap-2.5 px-3 py-2.5 mb-1">
                        <img
                          src={user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                          alt="avatar"
                          className="w-8 h-8 rounded-xl object-cover bg-indigo-600"
                        />
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-white truncate">{user.username}</p>
                          <p className="text-[11px] text-white/40 truncate">{user.email || 'Member'}</p>
                        </div>
                      </div>

                      <div className="h-px bg-white/[0.07] mx-1 mb-1"/>

                      <NavLink to="/profile" onClick={() => setDropOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium
                                   text-white/60 hover:text-white hover:bg-white/[0.07]
                                   transition-all duration-150 no-underline">
                        <User size={13}/> Profile
                      </NavLink>

                      {user.role === 'admin' && (
                        <NavLink to="/admin" onClick={() => setDropOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium
                                     text-white/60 hover:text-white hover:bg-white/[0.07]
                                     transition-all duration-150 no-underline">
                          <Settings size={13}/> Admin Panel
                        </NavLink>
                      )}

                      <div className="h-px bg-white/[0.07] mx-1 my-1"/>

                      <button onClick={handleLogout}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium
                                   text-red-400/80 hover:text-red-400 hover:bg-red-500/[0.1]
                                   transition-all duration-150 w-full text-left cursor-pointer bg-transparent border-none">
                        <LogOut size={13}/> Logout
                      </button>
                    </div>
                  )}
                </div>

              ) : (
                <>
                  <NavLink to="/login"
                    className="text-[13.5px] font-medium text-white/60 hover:text-white
                               px-3.5 py-1.5 rounded-xl hover:bg-white/[0.07]
                               transition-all duration-200 no-underline">
                    Log In
                  </NavLink>
                  <NavLink to="/signup"
                    className="text-[13.5px] font-semibold text-white
                               bg-gradient-to-r from-indigo-500 to-violet-600
                               px-4 py-1.5 rounded-xl
                               shadow-[0_2px_12px_rgba(99,102,241,0.4)]
                               hover:shadow-[0_4px_20px_rgba(99,102,241,0.55)]
                               hover:-translate-y-0.5
                               transition-all duration-200 no-underline">
                    Sign Up
                  </NavLink>
                </>
              )}
            </div>

            {/* Hamburger */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl
                         bg-white/[0.07] hover:bg-white/[0.11] border border-white/[0.1]
                         text-white transition-all duration-200 cursor-pointer">
              {mobileOpen ? <X size={18}/> : <Menu size={18}/>}
            </button>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════
          MOBILE MENU
      ══════════════════════════════════════════════ */}
      {mobileOpen && (
        <>
          {/* Overlay */}
          <div
            className="anim-fade fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          {/* Panel */}
          <div className="anim-slide fixed top-0 left-0 right-0 z-50
                          bg-[#0d1117] border-b border-white/[0.08]
                          px-4 pt-4 pb-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">

            {/* Panel header */}
            <div className="flex items-center justify-between mb-5">
              <NavLink to="/" onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 no-underline">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600
                                flex items-center justify-center">
                  <Code2 size={15} className="text-white"/>
                </div>
                <span className="font-mono-jet text-[15px] font-bold text-white tracking-tight">
                  DSA<span className="text-indigo-400">—</span>MENTOR
                </span>
              </NavLink>
              <button
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center w-8 h-8 rounded-xl
                           bg-white/[0.07] border border-white/[0.1] text-white
                           hover:bg-white/[0.12] transition-all duration-200 cursor-pointer">
                <X size={16}/>
              </button>
            </div>

            {/* Nav links */}
            <div className="flex flex-col gap-0.5 mb-5">
              {navLinks.map((l, i) => (
                <NavLink key={l.to} to={l.to} end={l.to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `block text-[14px] font-medium px-3 py-2.5 rounded-xl
                     transition-all duration-150 no-underline
                     ${isActive
                       ? 'text-white bg-indigo-500/[0.18]'
                       : 'text-white/55 hover:text-white hover:bg-white/[0.06]'}`
                  }
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  {l.label}
                </NavLink>
              ))}
            </div>

            {/* Divider */}
            <div className="h-px bg-white/[0.07] mb-4"/>

            {/* Auth section */}
            {user ? (
              <div className="flex flex-col gap-0.5">
                {/* User info */}
                <div className="flex items-center gap-3 px-3 py-2.5 mb-1
                                bg-white/[0.03] rounded-xl border border-white/[0.06]">
                  <img
                    src={user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                    alt="avatar"
                    className="w-9 h-9 rounded-xl object-cover bg-indigo-600 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-white truncate">{user.username}</p>
                    <p className="text-[11px] text-white/40">Member</p>
                  </div>
                </div>

                <NavLink to="/profile" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[14px] font-medium
                             text-white/60 hover:text-white hover:bg-white/[0.06]
                             transition-all duration-150 no-underline">
                  <User size={15}/> Profile
                </NavLink>

                {user.role === 'admin' && (
                  <NavLink to="/admin" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[14px] font-medium
                               text-white/60 hover:text-white hover:bg-white/[0.06]
                               transition-all duration-150 no-underline">
                    <Settings size={15}/> Admin Panel
                  </NavLink>
                )}

                <div className="h-px bg-white/[0.07] my-1"/>

                <button onClick={handleLogout}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[14px] font-medium
                             text-red-400/80 hover:text-red-400 hover:bg-red-500/[0.1]
                             transition-all duration-150 w-full text-left cursor-pointer bg-transparent border-none">
                  <LogOut size={15}/> Logout
                </button>
              </div>

            ) : (
              <div className="flex gap-2">
                <NavLink to="/login" onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center text-[14px] font-medium text-white/70
                             py-2.5 rounded-xl border border-white/[0.1]
                             hover:bg-white/[0.07] hover:text-white
                             transition-all duration-200 no-underline">
                  Log In
                </NavLink>
                <NavLink to="/signup" onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center text-[14px] font-semibold text-white
                             py-2.5 rounded-xl
                             bg-gradient-to-r from-indigo-500 to-violet-600
                             shadow-[0_2px_12px_rgba(99,102,241,0.4)]
                             hover:shadow-[0_4px_18px_rgba(99,102,241,0.55)]
                             transition-all duration-200 no-underline">
                  Sign Up
                </NavLink>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Page Content ── */}
      <main className="relative z-10">
        {children}
      </main>
    </div>
  );
};

export default Layout;