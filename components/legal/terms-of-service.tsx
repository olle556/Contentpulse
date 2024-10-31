import React from 'react';

export function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <div className="prose dark:prose-invert">
        <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
        
        <p className="mb-6">
          Welcome to AIPostCrawler! These Terms of Service outline the rules and regulations 
          for the use of our social media management service. By using our service, you agree 
          to these terms and conditions.
        </p>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">1. Description of Service</h2>
          <p>AIPostCrawler provides social media management and content scheduling services, including:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Social media account integration and management</li>
            <li>Content scheduling and automated posting</li>
            <li>Analytics and performance tracking</li>
            <li>Multi-platform content management</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">2. User Responsibilities</h2>
          <p>When using our service, you agree to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Provide accurate and complete information when creating an account</li>
            <li>Maintain the security of your account credentials</li>
            <li>Comply with all social media platforms' terms of service</li>
            <li>Not use the service for any illegal or unauthorized purpose</li>
            <li>Not violate any intellectual property rights</li>
            <li>Take responsibility for all content posted through our service</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">3. Social Media Integration</h2>
          <p>By connecting your social media accounts, you:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Authorize us to access and post content on your behalf</li>
            <li>Confirm you have the right to grant such access</li>
            <li>Understand that we are not responsible for the policies or actions of social media platforms</li>
            <li>Agree to maintain compliance with each platform's terms of service</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">4. Content Guidelines</h2>
          <p>You agree not to schedule or post content that:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Violates any applicable laws or regulations</li>
            <li>Infringes on intellectual property rights</li>
            <li>Contains malicious code or harmful content</li>
            <li>Promotes hate speech or discrimination</li>
            <li>Violates the terms of any connected social media platform</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">5. Data Collection and Privacy</h2>
          <p>We collect and store user data as outlined in our Privacy Policy. This includes:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Account information and credentials</li>
            <li>Social media integration data</li>
            <li>Content and scheduling preferences</li>
            <li>Usage analytics and performance data</li>
          </ul>
          <p>For complete details on data handling, please refer to our <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">6. Service Modifications</h2>
          <p>We reserve the right to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Modify or discontinue any part of our service</li>
            <li>Update pricing and feature availability</li>
            <li>Change integration capabilities with social media platforms</li>
            <li>Implement new requirements or restrictions</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
          <p>To the fullest extent permitted by law, AIPostCrawler shall not be liable for:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Any indirect, incidental, or consequential damages</li>
            <li>Loss of data, profits, or business opportunities</li>
            <li>Issues arising from social media platform changes or restrictions</li>
            <li>Content posting failures or delays</li>
            <li>Unauthorized access to your social media accounts</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">8. Governing Law</h2>
          <p>These Terms are governed by and construed in accordance with the laws of Sweden.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">9. Updates to Terms</h2>
          <p>We may update these Terms from time to time. Users will be notified of significant changes via email. 
          Continued use of the service after such changes constitutes acceptance of the new Terms.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">10. Contact Information</h2>
          <p>For questions about these Terms of Service, please contact us at:</p>
          <p>Email: olleevertsson@gmail.com</p>
        </section>
      </div>
    </div>
  );
}