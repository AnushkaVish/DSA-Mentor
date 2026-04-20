import React from 'react';
import { ShieldCheck, Lock, EyeOff, UserCheck } from 'lucide-react';

const SectionCard = ({ icon, title, children }) => (
  <div className="bg-[#f8fafc] dark:bg-[#1a2332] p-6 rounded-lg border border-[#e2e8f0] dark:border-[#334155]">
    <div className="flex items-center mb-3">
      {icon}
      <h3 className="text-xl font-bold ml-3 text-[#1e293b] dark:text-[#e2e8f0]">{title}</h3>
    </div>
    <p className="text-[#475569] dark:text-[#94a3b8] leading-relaxed">{children}</p>
  </div>
);

const PrivacyPolicyPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <header className="text-center mb-16">
        <h1 className="text-5xl font-extrabold text-[#1e293b] dark:text-[#e2e8f0]">Privacy & Policy</h1>
        <p className="mt-4 text-lg text-[#475569] dark:text-[#94a3b8] max-w-3xl mx-auto">
          Your privacy matters. We’re committed to protecting your data and being transparent about how we use it.
        </p>
      </header>

      {/* Policy Sections */}
      <section className="grid md:grid-cols-2 gap-8 mb-20">
        <SectionCard
          icon={<ShieldCheck size={24} className="text-[#f97316]" />}
          title="Data Collection"
        >
          We collect minimal personal data required to create your account and enhance your experience. This includes your name, email, and coding activity.
        </SectionCard>

        <SectionCard
          icon={<EyeOff size={24} className="text-[#f97316]" />}
          title="Cookies & Tracking"
        >
          We use cookies to remember your preferences and improve performance. You can manage cookie settings in your browser at any time.
        </SectionCard>

        <SectionCard
          icon={<Lock size={24} className="text-[#f97316]" />}
          title="Security Measures"
        >
          Your data is protected using modern encryption, secure authentication (JWT & OAuth), and regular audits to prevent unauthorized access.
        </SectionCard>

        <SectionCard
          icon={<UserCheck size={24} className="text-[#f97316]" />}
          title="Your Rights"
        >
          You can request access, correction, or deletion of your personal data. We respect your choices and comply with applicable privacy laws.
        </SectionCard>
      </section>

      {/* Footer Note */}
      <div className="text-center text-sm text-[#475569] dark:text-[#94a3b8]">
        Last updated: September 8, 2025<br />
        For questions or concerns, contact us at <span className="text-[#f97316]">anushkavishwakarma98980@gmail.com</span>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;