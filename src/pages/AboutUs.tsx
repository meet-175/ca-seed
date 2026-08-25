import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import { BookOpen, Target, Users } from 'lucide-react';

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Helmet><title>About Us - CA Seed</title></Helmet>
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">About CA Seed</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Empowering CA students with high-quality, accessible study materials and exam resources.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-6 bg-blue-50 rounded-xl">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Our Mission</h3>
              <p className="text-sm text-gray-600">To simplify the CA journey by providing structured, easy-to-understand study resources for Foundation, Intermediate, and Final students.</p>
            </div>
            <div className="text-center p-6 bg-emerald-50 rounded-xl">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Quality Content</h3>
              <p className="text-sm text-gray-600">We meticulously organize notes, question banks, and MCQs to ensure students have the most relevant material at their fingertips.</p>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-xl">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Student First</h3>
              <p className="text-sm text-gray-600">Built by CA enthusiasts for CA students. We understand the struggle and aim to make preparation as smooth as possible.</p>
            </div>
          </div>
          
          <div className="markdown-body">
            <h2>Our Story</h2>
            <p>Preparing for Chartered Accountancy exams is notoriously challenging. With vast syllabuses and complex topics, students often spend more time organizing their materials than actually studying them. CA Seed was born out of a desire to solve this exact problem.</p>
            <p>Our platform consolidates everything a CA student needs—from concise study notes to comprehensive question banks and real-time news updates—into one clean, distraction-free environment.</p>
            <p>Whether you are taking your first steps in CA Foundation, or preparing for the rigorous CA Final, CA Seed is here to support your academic journey.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
