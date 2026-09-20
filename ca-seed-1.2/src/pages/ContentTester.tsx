import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import { Code, Eye, FileText } from 'lucide-react';

export default function ContentTester() {
  const [input, setInput] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const getInjectedHtml = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
          <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
          <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js" onload="renderMathInElement(document.body, {
            delimiters: [
              {left: '$$', right: '$$', display: true},
              {left: '$', right: '$', display: false},
              {left: '\\\\(', right: '\\\\)', display: false},
              {left: '\\\\[', right: '\\\\]', display: true}
            ]
          });"></script>
          <style>
            body { 
              font-family: system-ui, -apple-system, sans-serif; 
              padding: 1rem; 
              line-height: 1.6;
              color: #374151;
            }
            img { max-width: 100%; height: auto; }
          </style>
        </head>
        <body>
          ${input}
        </body>
      </html>
    `;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Helmet>
        <title>Content Tester - CA Seed</title>
      </Helmet>
      <Header />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 flex flex-col">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Code className="w-8 h-8 text-purple-600" />
            HTML & LaTeX Tester
          </h1>
          <p className="text-gray-500 mt-2">Test and preview your custom HTML with embedded LaTeX math before uploading it.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-[600px]">
          <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="font-semibold text-gray-700">Editor</span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 w-full p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
              placeholder="Enter your HTML code with $math$ or $$math$$ here..."
            />
          </div>

          <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
              <Eye className="w-4 h-4 text-gray-500" />
              <span className="font-semibold text-gray-700">Live Preview</span>
            </div>
            <div className="flex-1 p-4 overflow-auto">
              <iframe
                ref={iframeRef}
                srcDoc={getInjectedHtml()}
                className="w-full h-full border-0 min-h-[500px]"
                title="Preview"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
