import React, { useState, useEffect } from 'react';
import { 
  Menu, X, ChevronRight, Book, Code, Trophy, 
  GraduationCap, MessageSquare, Users, Shield, 
  FileText, Award, Target, Sparkles, Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const sections = [
  { id: 'introduction', title: 'Introduction', icon: Book, color: 'from-orange-500 to-amber-500' },
  { id: 'objectives', title: 'Key Objectives', icon: Target, color: 'from-blue-500 to-cyan-500' },
  { id: 'user-roles', title: 'User Roles', icon: Users, color: 'from-purple-500 to-pink-500' },
  { id: 'authentication', title: 'Authentication', icon: Shield, color: 'from-emerald-500 to-teal-500' },
  { id: 'problems', title: 'Problem Solving', icon: Code, color: 'from-orange-500 to-red-500' },
  { id: 'editor', title: 'Code Editor', icon: FileText, color: 'from-indigo-500 to-blue-500' },
  { id: 'ai-interview', title: 'AI Interview', icon: MessageSquare, color: 'from-rose-500 to-orange-500' },
  { id: 'courses', title: 'Course Section', icon: GraduationCap, color: 'from-sky-500 to-indigo-500' },
  { id: 'certificates', title: 'Certificates', icon: Award, color: 'from-yellow-500 to-orange-500' },
  { id: 'contests', title: 'Contest Module', icon: Trophy, color: 'from-amber-500 to-yellow-600' },
  { id: 'leaderboard', title: 'Leaderboard', icon: Users, color: 'from-violet-500 to-fuchsia-500' },
  { id: 'admin', title: 'Admin Panel', icon: Shield, color: 'from-slate-500 to-slate-700' },
  { id: 'tech-stack', title: 'Tech Stack', icon: Code, color: 'from-cyan-500 to-blue-500' },
];

export default function DocumentationPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('introduction');

  // Close sidebar on mobile when section changes
  const handleSectionChange = (id) => {
    setActiveSection(id);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentSectionData = sections.find(s => s.id === activeSection);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-orange-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-orange-500/5 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Mobile Top Bar */}
      <div className="lg:hidden sticky top-0 z-50 bg-[#1e293b]/80 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-orange-500 p-1.5 rounded-lg shadow-lg shadow-orange-500/20">
            <Code size={18} className="text-white" />
          </div>
          <span className="font-black tracking-tighter text-white">DSA-MENTOR <span className="text-orange-500">DOCS</span></span>
        </div>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-slate-800 rounded-full text-orange-500"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div className="flex max-w-[1600px] mx-auto relative">
        
        {/* Sidebar Overlay for Mobile */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-0 lg:top-0 h-screen z-50
            w-72 bg-[#0f172a]/80 lg:bg-transparent backdrop-blur-xl lg:backdrop-blur-none
            border-r border-white/5 transition-transform duration-300
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <div className="p-6 h-full flex flex-col">
            <div className="hidden lg:flex items-center gap-3 mb-10">
              <div className="bg-orange-500 p-2 rounded-xl shadow-xl shadow-orange-500/20">
                <Sparkles size={20} className="text-white" />
              </div>
              <h1 className="text-xl font-black tracking-tighter text-white">DSA-MENTOR</h1>
            </div>

            <nav className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 px-4">Navigation</p>
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => handleSectionChange(section.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
                      ${isActive 
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 scale-[1.02]' 
                        : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'}
                    `}
                  >
                    <Icon size={18} className={isActive ? 'text-white' : 'group-hover:text-orange-500'} />
                    <span className="text-sm font-semibold">{section.title}</span>
                    {isActive && (
                      <motion.div layoutId="activeInd" className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>
            
            <div className="mt-6 p-4 bg-slate-800/50 rounded-2xl border border-white/5">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Version</p>
              <p className="text-xs text-orange-500 font-mono">v2.4.0-stable</p>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-h-screen px-4 py-8 lg:p-12 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto"
            >
              {/* Header Section */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${currentSectionData.color} shadow-lg`}>
                    <currentSectionData.icon className="text-white" size={28} />
                  </div>
                  <span className="text-sm font-bold text-orange-500 uppercase tracking-widest">Core Module</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
                  {currentSectionData.title}
                </h1>
                <div className="h-1.5 w-24 bg-gradient-to-r from-orange-500 to-transparent rounded-full" />
              </div>

              {/* Dynamic Content Rendering */}
              <div className="space-y-8">
                
                {activeSection === 'introduction' && (
                  <div className="space-y-6">
                    <p className="text-xl text-slate-400 leading-relaxed font-medium">
                      DSA-MENTOR is an elite-tier learning ecosystem architected to bridge the gap between academic theory and <span className="text-white font-bold underline decoration-orange-500">Technical Mastery.</span>
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        { title: 'Learn', desc: 'Deep-dive into DSA and SQL fundamentals.', icon: Book },
                        { title: 'Practice', desc: 'Solve real-world company interview problems.', icon: Code },
                        { title: 'Compete', desc: 'Join global contests and rank higher.', icon: Trophy },
                        { title: 'Succeed', desc: 'Get certified and ace your interviews.', icon: Award },
                      ].map((card, i) => (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          key={i} className="bg-slate-800/40 border border-white/5 p-6 rounded-3xl hover:border-orange-500/30 transition-all group"
                        >
                          <card.icon className="text-orange-500 mb-4 group-hover:scale-110 transition-transform" size={24} />
                          <h3 className="text-white font-bold mb-1">{card.title}</h3>
                          <p className="text-sm text-slate-500">{card.desc}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === 'tech-stack' && (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { l: 'Frontend', v: 'React.js / Tailwind', c: 'text-blue-400' },
                      { l: 'Backend', v: 'Node.js / Express', c: 'text-emerald-400' },
                      { l: 'Database', v: 'MongoDB Atlas', c: 'text-green-500' },
                      { l: 'Security', v: 'JWT / Bcrypt', c: 'text-rose-400' },
                      { l: 'AI Engine', v: 'Gemini / OpenAI', c: 'text-purple-400' },
                      { l: 'State', v: 'Redux Toolkit', c: 'text-indigo-400' },
                    ].map((tech, i) => (
                      <div key={i} className="bg-white/5 border border-white/5 p-5 rounded-2xl flex flex-col items-center text-center">
                        <span className="text-[10px] font-black uppercase text-slate-500 mb-2">{tech.l}</span>
                        <span className={`text-lg font-bold ${tech.c}`}>{tech.v}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Standard Card for generic sections */}
                {activeSection !== 'introduction' && activeSection !== 'tech-stack' && (
                  <div className="bg-slate-800/30 border border-white/5 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-[0.03]">
                      <currentSectionData.icon size={200} />
                    </div>
                    <div className="relative z-10 space-y-6">
                      <p className="text-lg text-slate-300">Detailed overview of the <span className="text-orange-500 font-bold">{currentSectionData.title}</span> system and its functional components.</p>
                      
                      {/* Placeholder for specific section items - You can map your section details here */}
                      <div className="grid gap-4">
                        {[1, 2, 3].map((item) => (
                          <div key={item} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center shrink-0 font-bold text-xs">{item}</div>
                            <p className="text-sm text-slate-400 italic">Component documentation for this sub-module will be detailed in the upcoming platform audit.</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Footer CTA */}
              <div className="mt-20 p-8 rounded-3xl bg-gradient-to-r from-orange-600 to-orange-400 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-orange-500/20">
                <div>
                  <h3 className="text-2xl font-black text-white">Ready to Master Code?</h3>
                  <p className="text-orange-100 font-medium">Start your journey today on DSA-MENTOR.</p>
                </div>
                <button className="bg-white text-orange-600 px-8 py-3 rounded-xl font-black hover:scale-105 transition-transform shadow-lg">
                  GO TO DASHBOARD
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #f97316; }
      `}} />
    </div>
  );
}