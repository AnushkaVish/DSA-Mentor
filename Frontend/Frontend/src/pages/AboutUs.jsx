import {
  FileCode,
  Trophy,
  Users,
  ShieldCheck,
  Rocket,
  Github,
  Linkedin,
} from 'lucide-react';



const TeamMember = ({ name, role, bio, image, github, linkedin }) => (
  <div className="bg-white dark:bg-[#1a2332] rounded-xl p-6 shadow text-center">
    <img src={image} alt={name} className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-[#f97316]" />
    <h3 className="text-xl font-bold text-[#1e293b] dark:text-[#e2e8f0]">{name}</h3>
    <p className="text-[#f97316] font-semibold mb-2">{role}</p>
    <p className="text-[#475569] dark:text-[#94a3b8] mb-4">{bio}</p>
    <div className="flex justify-center gap-4">
      <a href={github} target="_blank" className="text-slate-500 hover:text-[#f97316]">
        <Github size={22} />
      </a>
      <a href={linkedin} target="_blank" className="text-slate-500 hover:text-[#f97316]">
        <Linkedin size={22} />
      </a>
    </div>
  </div>
);

const AboutUs = () => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-5xl font-extrabold text-[#1e293b] dark:text-[#e2e8f0]">Welcome to DSA-MENTOR</h1>
        <p className="mt-4 text-lg text-[#475569] dark:text-[#94a3b8] max-w-2xl mx-auto">
          A platform built for coders, by coders. We help you grow through structured challenges, smart tools, and a vibrant community.
        </p>
      </section>

      {/* Mission & Values */}
      <section className="grid md:grid-cols-2 gap-8 mb-20">
        <div className="bg-[#f8fafc] dark:bg-[#232b3b] p-6 rounded-lg border border-[#e2e8f0] dark:border-[#334155]">
          <h2 className="text-2xl font-bold mb-3 flex items-center">
            <Rocket size={24} className="text-[#f97316] mr-2" />
            Our Mission
          </h2>
          <p className="text-[#475569] dark:text-[#94a3b8]">
            To empower developers with a focused, distraction-free environment for mastering problem-solving and building real-world skills.
          </p>
        </div>
        <div className="bg-[#f8fafc] dark:bg-[#232b3b] p-6 rounded-lg border border-[#e2e8f0] dark:border-[#334155]">
          <h2 className="text-2xl font-bold mb-3 flex items-center">
            <ShieldCheck size={24} className="text-[#f97316] mr-2" />
            Our Values
          </h2>
          <ul className="list-disc pl-5 text-[#475569] dark:text-[#94a3b8] space-y-2">
            <li>Clarity over complexity</li>
            <li>Learning through doing</li>
            <li>Community-driven growth</li>
            <li>Security and transparency</li>
          </ul>
        </div>
      </section>

      {/* Features */}
      <section className="mb-20">
        <h2 className="text-4xl font-bold text-center mb-10">Platform Highlights</h2>
        <div className="flex overflow-x-auto gap-6 pb-4">
          {[
            { icon: <FileCode size={24} className="text-[#f97316]" />, title: 'Practice DSA', desc: 'Solve curated problems with hints and editor support.' },
            { icon: <Trophy size={24} className="text-[#f97316]" />, title: 'Leaderboard', desc: 'Compete with peers and climb the ranks.' },
            { icon: <Users size={24} className="text-[#f97316]" />, title: 'Community', desc: 'Discuss, share, and grow together.' },
          ].map((f) => (
            <div key={f.title} className="min-w-[250px] bg-[#f8fafc] dark:bg-[#1a2332] p-6 rounded-lg border border-[#e2e8f0] dark:border-[#334155]">
              <div className="mb-3">{f.icon}</div>
              <h3 className="text-lg font-bold mb-2 text-[#1e293b] dark:text-[#e2e8f0]">{f.title}</h3>
              <p className="text-[#475569] dark:text-[#94a3b8]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="mb-20 text-center">
        <h2 className="text-4xl font-bold mb-6">Tech We Love</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            'React', 'TailwindCSS', 'Node.js', 'Express', 'MongoDB', 'Redis', 'JWT', 'Judge0 API'
          ].map((tech) => (
            <span key={tech} className="bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full text-sm font-medium border border-slate-200 dark:border-slate-600">
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="mb-10">
  <h2 className="text-4xl font-bold text-center mb-10">Meet the Team</h2>

  <div className="flex flex-wrap justify-center gap-6">
    
    <div className="w-40">
      <TeamMember
        name="Titiksha Sahu"
        role="Full Stack Developer"
        image="https://tse4.mm.bing.net/th/id/OIP.KPRI_sr0VrfBx-9C-3xDGgHaHa?rs=1&pid=ImgDetMain&o=7&rm=3"
      />
    </div>

    <div className="w-40">
      <TeamMember
        name="Jyoti Yadav"
        role="Full Stack Developer"
        image="https://tse4.mm.bing.net/th/id/OIP.KPRI_sr0VrfBx-9C-3xDGgHaHa?rs=1&pid=ImgDetMain&o=7&rm=3"
      />
    </div>

    <div className="w-40">
      <TeamMember
        name="Anushka Vishwakarma"
        role="Full Stack Developer"
        image="https://tse4.mm.bing.net/th/id/OIP.KPRI_sr0VrfBx-9C-3xDGgHaHa?rs=1&pid=ImgDetMain&o=7&rm=3"
      />
    </div>

    <div className="w-40">
      <TeamMember
        name="Deepa Soni"
        role="Full Stack Developer"
        image="https://tse4.mm.bing.net/th/id/OIP.KPRI_sr0VrfBx-9C-3xDGgHaHa?rs=1&pid=ImgDetMain&o=7&rm=3"
      />
    </div>

    <div className="w-40">
      <TeamMember
        name="Sony Yadav"
        role="Full Stack Developer"
        image="https://tse4.mm.bing.net/th/id/OIP.KPRI_sr0VrfBx-9C-3xDGgHaHa?rs=1&pid=ImgDetMain&o=7&rm=3"
      />
    </div>

  </div>
</section>
    </div>
  );
};

export default AboutUs;