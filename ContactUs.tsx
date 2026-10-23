import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import { Mail, MapPin, CheckCircle, Send, Clock } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function ContactUs() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please fill in all fields before sending.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await addDoc(collection(db, 'contact_messages'), {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        message: message.trim(),
        createdAt: Date.now(),
      });
      setSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
    } catch (err: any) {
      console.error('Error saving contact message:', err);
      // Even if Firestore write is blocked, allow mailto fallback
      window.location.href = `mailto:chartered.seed.support@gmail.com?subject=${encodeURIComponent(`Inquiry from ${name}`)}&body=${encodeURIComponent(message)}`;
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <Helmet>
        <title>Contact Us - Chartered Seeds</title>
        <meta name="description" content="Get in touch with the Chartered Seeds editorial and academic team for inquiries, corrections, or study material suggestions." />
      </Helmet>
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-24">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Contact Us</h1>
            <p className="text-gray-600 max-w-xl mx-auto text-sm md:text-base">
              Have a question about our CA study notes, question banks, or found an issue? Our academic support team is here to assist you.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-10 md:gap-12">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Get in Touch</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-purple-50 text-purple-700 rounded-xl flex items-center justify-center shrink-0 border border-purple-100">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm md:text-base">Official Support Email</h4>
                    <p className="text-gray-500 text-xs md:text-sm mt-1">For student queries, editorial feedback, or content corrections:</p>
                    <div className="mt-2">
                      <a 
                        href="mailto:chartered.seed.support@gmail.com" 
                        className="text-purple-700 font-semibold text-sm hover:underline inline-flex items-center gap-1.5"
                      >
                        chartered.seed.support@gmail.com
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 border border-emerald-100">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm md:text-base">Response Time</h4>
                    <p className="text-gray-500 text-xs md:text-sm mt-1">
                      We typically review and respond to inquiries within 24 to 48 business hours.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 border border-blue-100">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm md:text-base">Operational Scope</h4>
                    <p className="text-gray-500 text-xs md:text-sm mt-1">
                      Digital educational initiative serving CA Foundation and CA Intermediate students across India.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg mb-2">Send an Online Inquiry</h3>
              <p className="text-xs text-gray-500 mb-6">
                Submit your message directly and our administrative team will reach back via your provided email address.
              </p>

              {submitted ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-emerald-900 text-base mb-1">Message Received!</h4>
                  <p className="text-xs text-emerald-700 leading-relaxed mb-4">
                    Thank you for reaching out. Your inquiry has been submitted to the Chartered Seeds team.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="text-xs font-semibold text-emerald-800 underline hover:text-emerald-900"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  {error && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
                      {error}
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm transition-colors" 
                      placeholder="e.g. Rahul Sharma" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Your Email</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm transition-colors" 
                      placeholder="name@example.com" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Message</label>
                    <textarea 
                      rows={4} 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm transition-colors resize-none" 
                      placeholder="Write your query, suggestion, or question details..." 
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submitting ? 'Sending Message...' : 'Submit Message'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
