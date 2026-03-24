import React from 'react';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-xl font-bold text-gray-800 mb-3 border-l-4 border-blue-600 pl-3">
      {title}
    </h2>
    <div className="text-gray-600 leading-relaxed space-y-2">{children}</div>
  </div>
);

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-8 md:p-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-full mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-500 text-sm">Combat Warrior Taekwon-Do</p>
          <p className="text-gray-400 text-xs mt-1">Last updated: March 2026</p>
        </div>

        <p className="text-gray-600 mb-8 leading-relaxed">
          At Combat Warrior Taekwon-Do, we are committed to protecting your personal information
          and your right to privacy. This policy explains what information we collect, how we use
          it, and what rights you have in relation to it.
        </p>

        <Section title="1. Information We Collect">
          <p>We collect information you provide directly to us, including:</p>
          <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
            <li>Full name and contact details (email address, phone number)</li>
            <li>Date of birth and gender</li>
            <li>Belt grade and training history</li>
            <li>Attendance and fee payment records</li>
            <li>Certificate and achievement data</li>
            <li>Profile photos (if uploaded)</li>
          </ul>
        </Section>

        <Section title="2. How We Use Your Information">
          <p>We use the information we collect to:</p>
          <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
            <li>Manage student registrations and profiles</li>
            <li>Track attendance and belt grading progress</li>
            <li>Process fee payments and issue receipts</li>
            <li>Issue and verify certificates</li>
            <li>Send important notifications about classes and events</li>
            <li>Improve our services and app experience</li>
          </ul>
        </Section>

        <Section title="3. Data Sharing">
          <p>
            We do not sell, trade, or rent your personal information to third parties. We may
            share data only in the following limited circumstances:
          </p>
          <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
            <li>With your explicit consent</li>
            <li>To comply with legal obligations or court orders</li>
            <li>With trusted service providers who assist in operating our platform, under strict confidentiality agreements</li>
          </ul>
        </Section>

        <Section title="4. Data Security">
          <p>
            We implement appropriate technical and organisational measures to protect your personal
            data against unauthorised access, alteration, disclosure, or destruction. Access to
            student data is restricted to authorised administrators only.
          </p>
        </Section>

        <Section title="5. Data Retention">
          <p>
            We retain your personal data for as long as you are an active student or as required
            by applicable law. You may request deletion of your account and associated data at any
            time by contacting us.
          </p>
        </Section>

        <Section title="6. Your Rights">
          <p>You have the right to:</p>
          <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Withdraw consent at any time</li>
            <li>Lodge a complaint with a relevant data protection authority</li>
          </ul>
        </Section>

        <Section title="7. Cookies">
          <p>
            Our web platform may use cookies to enhance your browsing experience and maintain
            session state. You can control cookie settings through your browser preferences.
          </p>
        </Section>

        <Section title="8. Children's Privacy">
          <p>
            We collect information about minors only with the consent of a parent or guardian.
            Parents may contact us at any time to review, update, or delete their child's
            information.
          </p>
        </Section>

        <Section title="9. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any
            significant changes by posting the new policy on this page with an updated date.
            Continued use of our services after changes constitutes acceptance of the updated
            policy.
          </p>
        </Section>

        <Section title="10. Contact Us">
          <p>If you have any questions or concerns about this Privacy Policy, please contact us:</p>
          <div className="mt-3 bg-gray-50 rounded-xl p-4 space-y-1 text-sm">
            <p className="font-semibold text-gray-800">Combat Warrior Taekwon-Do</p>
            <p>📧 Email: <a href="mailto:info@combatwarrior.com" className="text-blue-600 hover:underline">info@combatwarrior.com</a></p>
            <p>🌐 Website: <a href="/" className="text-blue-600 hover:underline">combatwarrior.com</a></p>
          </div>
        </Section>

        {/* Footer note */}
        <div className="mt-10 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Combat Warrior Taekwon-Do. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
