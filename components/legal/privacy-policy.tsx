import React from 'react';

export function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <div className="prose dark:prose-invert">
        <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
        
        <p className="mb-6">
          Welcome to Contentpulse's Privacy Policy. This policy outlines how we collect, use, 
          and protect the information you provide while using our service.
        </p>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
          <p>We collect the following types of information:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Account Information:
              <ul className="list-circle pl-6">
                <li>Name</li>
                <li>Email address</li>
                <li>Payment information</li>
              </ul>
            </li>
            <li>Social Media Integration Data:
              <ul className="list-circle pl-6">
                <li>Connected social media account information</li>
                <li>Access tokens and permissions</li>
                <li>Post scheduling preferences</li>
                <li>Content and media you choose to post</li>
              </ul>
            </li>
            <li>Usage Data:
              <ul className="list-circle pl-6">
                <li>Log files and analytics</li>
                <li>Device and connection information</li>
                <li>Cookies and similar technologies</li>
              </ul>
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">2. Purpose of Data Collection and Legal Basis</h2>
          <p>We collect and process your data for the following purposes:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>To provide our social media management services (Legal basis: Contractual necessity)</li>
            <li>To process and schedule your social media posts (Legal basis: Contractual necessity)</li>
            <li>To communicate with you about your account and services (Legal basis: Legitimate interests)</li>
            <li>To improve our services and user experience (Legal basis: Legitimate interests)</li>
            <li>To comply with legal obligations (Legal basis: Legal obligation)</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">3. Social Media Integration and Posts</h2>
          <p>When you use our service to post on social media:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>We store your post content temporarily for scheduling purposes</li>
            <li>We access your social media accounts only with your explicit permission</li>
            <li>We maintain access tokens securely to enable posting on your behalf</li>
            <li>We do not modify or delete your existing social media content without your consent</li>
            <li>We comply with each platform's terms of service and data policies</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">4. Data Sharing and International Transfers</h2>
          <p>We share your data only as necessary to provide our services:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>With connected social media platforms to enable posting</li>
            <li>With payment processors for subscription management</li>
            <li>With service providers who assist in operating our service</li>
          </ul>
          <p>All third-party transfers include appropriate safeguards for your data.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
          <p>You have the following rights regarding your personal data:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Right to access and receive a copy of your data</li>
            <li>Right to rectification of inaccurate data</li>
            <li>Right to erasure (right to be forgotten)</li>
            <li>Right to restrict processing</li>
            <li>Right to data portability</li>
            <li>Right to object to processing</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">6. Data Security</h2>
          <p>We implement appropriate security measures to protect your data, including:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Encryption of sensitive data</li>
            <li>Secure storage of social media tokens</li>
            <li>Regular security assessments</li>
            <li>Access controls and authentication</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">7. Children's Privacy</h2>
          <p>Our services are not intended for users under the age of 13. We do not knowingly collect data from children under 13.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">8. Updates to the Privacy Policy</h2>
          <p>We may update this Privacy Policy from time to time. Users will be notified of any significant changes via email.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">9. Contact Information</h2>
          <p>If you have questions about this Privacy Policy, please contact us at:</p>
          <p>Email: hello@coove.studio</p>
        </section>
      </div>
    </div>
  );
}