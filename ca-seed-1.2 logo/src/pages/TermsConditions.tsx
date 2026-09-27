import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';

export default function TermsConditions() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Helmet><title>Terms & Conditions - CA Seed</title></Helmet>
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12 markdown-body">
          <h1>Terms and Conditions</h1>
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2>1. Agreement to Terms</h2>
          <p>By viewing or using CA Seed, you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you may not access the website.</p>
          
          <h2>2. Intellectual Property Rights</h2>
          <p>Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") are owned or controlled by us. Reproduction or copying of our content is strictly prohibited.</p>
          
          <h2>3. User Representations</h2>
          <p>By using the Site, you represent and warrant that you will not use the Site for any illegal or unauthorized purpose and your use of the Site will not violate any applicable law or regulation.</p>
          
          <h2>4. Educational Purpose</h2>
          <p>The content provided on CA Seed is for educational and informational purposes only. We strive to provide accurate study materials but make no warranties about the completeness or accuracy of the information.</p>
          
          <h2>5. Modifications and Interruptions</h2>
          <p>We reserve the right to change, modify, or remove the contents of the Site at any time or for any reason at our sole discretion without notice. We will not be liable to you or any third party for any modification, suspension, or discontinuance of the Site.</p>
        </div>
      </main>
    </div>
  );
}
