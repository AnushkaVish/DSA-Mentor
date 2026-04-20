const CODE_BRACKET_ICON_PATH = "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4";
const CHART_BAR_ICON_PATH = "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z";
const TAG_ICON_PATH = "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z";
const TROPHY_ICON_PATH = "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z";

function FeatureCard({ iconPath, title, description, gradient }) {
  return (
    <div className="group flex flex-col gap-3 p-5 rounded-xl border border-gray-800 hover:border-gray-600 transition-all duration-300 hover:-translate-y-1">
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="white" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
        </svg>
      </div>
      <div>
        <h3 className="text-white font-semibold text-sm leading-snug">{title}</h3>
        <p className="mt-1 text-gray-400 text-xs leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export default function FeaturesSection() {
  return (
    <section id="features" className="py-12 px-4 rounded-xl border-2 border-gray-800 mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Master Coding Interviews with{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-cyan-400">
              DSA Mentor
            </span>
          </h2>
          <p className="mt-3 max-w-xl mx-auto text-base text-gray-400">
            Everything you need to prepare for technical interviews at top tech companies
          </p>
        </div>

        {/* Single 4-col grid — no background on cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            iconPath={CODE_BRACKET_ICON_PATH}
            title="1500+ Coding Problems"
            description="Comprehensive collection covering all difficulty levels and interview topics."
            gradient="from-purple-500 to-pink-500"
          />
          <FeatureCard
            iconPath={CHART_BAR_ICON_PATH}
            title="Progress Tracking"
            description="Monitor improvement with detailed statistics and performance analytics."
            gradient="from-green-400 to-cyan-400"
          />
          <FeatureCard
            iconPath={TAG_ICON_PATH}
            title="Company-wise Questions"
            description="Practice problems frequently asked by Google, Amazon, and Meta."
            gradient="from-orange-400 to-red-500"
          />
          <FeatureCard
            iconPath={TROPHY_ICON_PATH}
            title="Weekly Contests"
            description="Compete in timed coding contests against other developers."
            gradient="from-yellow-400 to-orange-500"
          />
          <FeatureCard
            iconPath="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            title="Mock Interviews"
            description="Simulate real interview scenarios with timed practice sessions."
            gradient="from-blue-400 to-indigo-500"
          />
          <FeatureCard
            iconPath="M13 10V3L4 14h7v7l9-11h-7z"
            title="Fast Execution"
            description="Run code against test cases with our powerful online compiler."
            gradient="from-cyan-400 to-blue-500"
          />
          <FeatureCard
            iconPath="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            title="Community Solutions"
            description="Learn from other developers' approaches and optimized solutions."
            gradient="from-pink-400 to-rose-500"
          />
          <FeatureCard
            iconPath="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            title="Premium Content"
            description="Access exclusive problems and detailed solution explanations."
            gradient="from-emerald-400 to-teal-500"
          />
        </div>

      </div>
    </section>
  );
}