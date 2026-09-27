import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import { Mail, MapPin } from 'lucide-react';

export default function ContactUs() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Helmet><title>Contact Us - CA Seed</title></Helmet>
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h1>
            <p className="text-gray-600">Have a question or feedback? We'd love to hear from you.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Get in Touch</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Email Us</h4>
                    <p className="text-gray-600 text-sm mt-1">For general inquiries, support, or feedback regarding our study materials.</p>
                    <a href="mailto:support@caseed.com" className="text-blue-600 font-medium text-sm mt-2 inline-block hover:underline">support@caseed.com</a>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Location</h4>
                    <p className="text-gray-600 text-sm mt-1">We operate online to serve CA students across India.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Send a Message</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" placeholder="Your Name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" placeholder="you@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea rows={4} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none" placeholder="How can we help you?"></textarea>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  Send Message
                </button>
                <p className="text-xs text-gray-500 text-center mt-3">Note: This form is for demonstration purposes. Please use the email provided above.</p>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
