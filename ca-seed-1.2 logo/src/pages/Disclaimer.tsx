import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';

export default function Disclaimer() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Helmet><title>Disclaimer - CA Seed</title></Helmet>
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12 markdown-body">
          <h1>Disclaimer</h1>
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2>1. Non-Affiliation Declaration</h2>
          <p><strong>CA Seed is an independent educational platform.</strong> We are NOT officially affiliated, associated, authorized, endorsed by, or in any way officially connected with the Institute of Chartered Accountants of India (ICAI), or any of its subsidiaries or its affiliates. The official ICAI website can be found at <a href="https://www.icai.org/" target="_blank" rel="noreferrer">www.icai.org</a>.</p>
          
          <h2>2. Educational Purposes Only</h2>
          <p>The information and study materials provided on CA Seed are for general educational and informational purposes only. All content is provided in good faith, however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the Site.</p>
          
          <h2>3. No Professional Advice</h2>
          <p>The content on CA Seed cannot and does not contain professional financial, legal, or accounting advice. The educational information is provided for general informational and educational purposes only and is not a substitute for professional advice.</p>
          
          <h2>4. External Links Disclaimer</h2>
          <p>The Site may contain links to other websites or content belonging to or originating from third parties. Such external links are not investigated, monitored, or checked for accuracy, adequacy, validity, reliability, availability or completeness by us.</p>
        </div>
      </main>
    </div>
  );
}
