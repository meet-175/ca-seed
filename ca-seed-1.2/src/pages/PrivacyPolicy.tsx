import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Helmet><title>Privacy Policy - CA Seed</title></Helmet>
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12 markdown-body">
          <h1>Privacy Policy</h1>
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2>1. Introduction</h2>
          <p>Welcome to CA Seed. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.</p>
          
          <h2>2. Information We Collect</h2>
          <p>We may collect information about you in a variety of ways. The information we may collect on the Site includes derivative data such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.</p>
          
          <h2>3. Google AdSense & Cookies</h2>
          <p>We use third-party advertising companies, including Google, to serve ads when you visit our website. These companies may use information (not including your name, address, email address, or telephone number) about your visits to this and other websites in order to provide advertisements about goods and services of interest to you.</p>
          <ul>
            <li>Google, as a third-party vendor, uses cookies to serve ads on our site.</li>
            <li>Google's use of the advertising cookie enables it and its partners to serve ads to our users based on their visit to our site and/or other sites on the Internet.</li>
            <li>Users may opt out of personalized advertising by visiting <a href="https://myadcenter.google.com/" target="_blank" rel="noreferrer">Google Ads Settings</a>.</li>
          </ul>
          
          <h2>4. Use of Your Information</h2>
          <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to serve targeted advertising and monitor website usage analytics.</p>
          
          <h2>5. Contact Us</h2>
          <p>If you have questions or comments about this Privacy Policy, please contact us via our Contact Us page.</p>
        </div>
      </main>
    </div>
  );
}
