import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import { AlertTriangle, CheckCircle, Code, Eye, SplitSquareHorizontal, FileText } from 'lucide-react';

interface ContentError {
  line: number;
  message: string;
  type: 'html' | 'latex';
  suggestion?: string;
}

const getLatexSuggestion = (message: string, math: string) => {
  let suggestion = "Check your LaTeX syntax for typos or unsupported commands.";
  if (math.match(/(?<!\\)%/)) {
    return "You have an unescaped '%' symbol. In LaTeX, '%' starts a comment and hides the rest of the equation, causing errors. Replace '%' with '\\%'.";
  }
  if (message.includes("misplaced &") || message.includes("align")) {
    return "The '&' character is used for alignment. Make sure your math is wrapped inside an environment like \\begin{aligned} ... \\end{aligned}. If you meant a literal '&', use \\&.";
  }
  return suggestion;
};

export default function ContentTester() {
  const [input, setInput] = useState('');
  const [htmlErrors, setHtmlErrors] = useState<ContentError[]>([]);
  const [latexErrors, setLatexErrors] = useState<ContentError[]>([]);
  
  const errors = [...htmlErrors, ...latexErrors].sort((a, b) => a.line - b.line);
  
  const [view, setView] = useState<'split' | 'code' | 'preview'>('split');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumberRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (textareaRef.current && lineNumberRef.current) {
      lineNumberRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const scrollToLine = (line: number) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    
    // Calculate character index to set cursor
    const linesArr = input.split('\n');
    let charIndex = 0;
    for (let i = 0; i < line - 1; i++) {
      if (i < linesArr.length) {
        charIndex += linesArr[i].length + 1;
      }
    }
    
    const lineLength = linesArr[line - 1] ? linesArr[line - 1].length : 0;
    
    textarea.focus();
    textarea.setSelectionRange(charIndex, charIndex + lineLength);

    // Calculate scroll position to center the line
    const computedStyle = window.getComputedStyle(textarea);
    let lineHeight = parseFloat(computedStyle.lineHeight);
    
    // Fallback if line-height is 'normal'
    if (isNaN(lineHeight)) {
      const fontSize = parseFloat(computedStyle.fontSize) || 14;
      lineHeight = fontSize * 1.5; // Approximation based on typical sans-serif
    }
    
    if (!isNaN(lineHeight)) {
      const containerHeight = textarea.clientHeight;
      const scrollPosition = (line - 1) * lineHeight - (containerHeight / 2) + (lineHeight / 2);
      
      textarea.scrollTo({
        top: Math.max(0, scrollPosition),
        behavior: 'smooth'
      });
    }
  };

  const lineCount = Math.max(1, input.split('\n').length);
  const lines = Array.from({ length: lineCount }, (_, i) => i + 1);

  // Validate HTML
  useEffect(() => {
    const timeout = setTimeout(() => {
      const newErrors: ContentError[] = [];

      // Validate HTML Structure (Basic Tag Matching)
      const tagRegex = /<\/?([a-zA-Z0-9]+)[^>]*>/g;
      const stack: { tagName: string; line: number }[] = [];
      const selfClosing = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr', '!doctype'];

      let match;
      while ((match = tagRegex.exec(input)) !== null) {
        const tagContent = match[0];
        const tagName = match[1].toLowerCase();
        const isClosing = tagContent.startsWith('</');
        const isSelfClosing = tagContent.endsWith('/>') || selfClosing.includes(tagName);

        const line = input.substring(0, match.index).split('\n').length;

        if (isSelfClosing && !isClosing) continue;

        if (isClosing) {
          if (stack.length === 0) {
            newErrors.push({ 
              line, 
              message: `Unexpected closing tag </${tagName}> without an opening tag.`, 
              type: 'html',
              suggestion: `Remove </${tagName}> or ensure there is a matching <${tagName}> before it.`
            });
          } else {
            const lastTag = stack.pop()!;
            if (lastTag.tagName !== tagName) {
              newErrors.push({ 
                line, 
                message: `Mismatched closing tag. Expected </${lastTag.tagName}> but found </${tagName}>.`, 
                type: 'html',
                suggestion: `Check the nesting of your tags. You probably forgot to close <${lastTag.tagName}> first.`
              });
              // Push the unmatched tag back to prevent cascading false errors for the rest of the document
              stack.push(lastTag); 
            }
          }
        } else {
          stack.push({ tagName, line });
        }
      }

      // Any remaining tags in the stack are unclosed
      stack.forEach(tag => {
        newErrors.push({ 
          line: tag.line, 
          message: `Unclosed tag <${tag.tagName}>. Missing a closing </${tag.tagName}>.`, 
          type: 'html',
          suggestion: `Add </${tag.tagName}> to properly close the tag opened on line ${tag.line}.`
        });
      });

      setHtmlErrors(newErrors);
    }, 600); // 600ms debounce

    return () => clearTimeout(timeout);
  }, [input]);

  // Listen for MathJax rendering errors from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'mathjax-done') {
        const mjErrors = event.data.errors || [];
        const newLatexErrors: ContentError[] = [];
        
        mjErrors.forEach((err: any) => {
          const mathStr = err.math || '';
          let index = input.indexOf(mathStr);
          let line = 1;
          
          if (index !== -1) {
            line = input.substring(0, index).split('\n').length;
          } else if (err.context) {
            const ctxIndex = input.indexOf(err.context);
            if (ctxIndex !== -1) {
              line = input.substring(0, ctxIndex).split('\n').length;
            }
          }

          newLatexErrors.push({
            line,
            message: `MathJax Error: ${err.message}`,
            type: 'latex',
            suggestion: getLatexSuggestion(err.message, mathStr)
          });
        });
        
        setLatexErrors(newLatexErrors);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [input]);

  const injectedHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <script>
        window.MathJax = {
          tex: {
            inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
            displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']]
          },
          startup: {
            pageReady: () => {
              return MathJax.startup.defaultPageReady().then(() => {
                const errors = [];
                try {
                  const mathItems = MathJax.startup.document.math;
                  if (mathItems) {
                    for (const item of mathItems) {
                      const root = item.typesetRoot;
                      const errorNode = root ? root.querySelector('mjx-merror') : null;
                      if (errorNode || (root && root.textContent.includes('Math input error'))) {
                        let contextText = '';
                        if (root && root.previousSibling) {
                          contextText = root.previousSibling.textContent || '';
                        } else if (root && root.parentElement && root.parentElement.previousSibling) {
                          contextText = root.parentElement.previousSibling.textContent || '';
                        }
                        errors.push({
                          math: item.math,
                          message: errorNode ? errorNode.textContent : 'Math input error',
                          context: contextText.trim().substring(contextText.trim().length - 50)
                        });
                      }
                    }
                  }
                } catch(e) {
                  console.error(e);
                }
                window.parent.postMessage({ type: 'mathjax-done', errors }, '*');
              });
            }
          }
        };
      </script>
      <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
    </head>
    <body>
      ${input}
    </body>
    </html>
  `;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Helmet>
        <title>Content Tester - CA Seed</title>
      </Helmet>
      <Header />

      <main className="flex-1 flex flex-col max-w-[1600px] w-full mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Code className="w-6 h-6 text-purple-600" />
              HTML & LaTeX Tester
            </h1>
            <p className="text-sm text-gray-500 mt-1">Paste your content here to validate tags and equations before publishing.</p>
          </div>

          <div className="flex bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
            <button 
              onClick={() => setView('code')}
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${view === 'code' ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Code className="w-4 h-4" /> Code Only
            </button>
            <button 
              onClick={() => setView('split')}
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${view === 'split' ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <SplitSquareHorizontal className="w-4 h-4" /> Split View
            </button>
            <button 
              onClick={() => setView('preview')}
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${view === 'preview' ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Eye className="w-4 h-4" /> Preview Only
            </button>
          </div>
        </div>

        {/* Validation Status Bar */}
        <div className="mb-4 flex-shrink-0">
          {input.trim() === '' ? (
            <div className="bg-gray-100 border border-gray-200 text-gray-600 px-4 py-3 rounded-lg flex items-center gap-3 text-sm">
              <FileText className="w-5 h-5 text-gray-400" />
              Awaiting input...
            </div>
          ) : errors.length === 0 ? (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-medium">
              <CheckCircle className="w-5 h-5 text-green-600" />
              All checks passed! Valid HTML and LaTeX.
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-red-200 bg-red-100/50 flex items-center justify-between gap-3 text-sm font-bold text-red-800">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Found {errors.length} Error{errors.length > 1 ? 's' : ''}
                </div>
                <button 
                  onClick={() => scrollToLine(errors[0].line)}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-semibold shadow-sm transition-colors active:scale-95"
                >
                  Go to First Error
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto p-4 space-y-3">
                {errors.map((err, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => scrollToLine(err.line)}
                    className="text-sm text-red-700 flex items-start gap-2 bg-white/50 p-2.5 rounded-md border border-red-100 cursor-pointer hover:bg-red-50 hover:border-red-300 transition-all group"
                  >
                    <span className="font-mono bg-red-100 group-hover:bg-red-200 px-1.5 py-0.5 rounded text-xs mt-0.5 shrink-0 transition-colors text-red-800">Line {err.line}</span>
                    <div className="flex flex-col gap-1.5">
                      <span><strong>{err.type.toUpperCase()}:</strong> {err.message}</span>
                      {err.suggestion && (
                        <div className="text-emerald-700 bg-emerald-50 px-2 py-1.5 rounded text-xs font-medium border border-emerald-100 flex items-start gap-1.5">
                          <span className="text-emerald-600 shrink-0">💡 Tip:</span> 
                          <span>{err.suggestion}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Editor and Preview Area */}
        <div className={`flex-1 grid gap-6 min-h-[600px] ${view === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Editor */}
          <div className={`flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${view === 'preview' ? 'hidden' : 'flex'}`}>
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
              Source Code
            </div>
            <div className="flex-1 flex overflow-hidden relative bg-white">
              <div 
                ref={lineNumberRef}
                className="w-12 flex-shrink-0 bg-gray-50 text-right pr-3 py-4 text-gray-400 font-mono text-sm leading-relaxed overflow-hidden select-none border-r border-gray-200"
              >
                {lines.map(line => (
                  <div key={line}>{line}</div>
                ))}
              </div>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onScroll={handleScroll}
                placeholder="Paste your HTML or LaTeX content here..."
                className="flex-1 w-full p-4 font-mono text-sm leading-relaxed resize-none focus:outline-none focus:ring-0 overflow-auto whitespace-pre"
                wrap="off"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Preview */}
          <div className={`flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${view === 'code' ? 'hidden' : 'flex'}`}>
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
              Live Preview
            </div>
            <div className="flex-1 bg-white relative p-4">
              {input ? (
                <iframe
                  ref={iframeRef}
                  srcDoc={injectedHtml}
                  className="w-full h-full border-0 absolute inset-0"
                  sandbox="allow-scripts allow-same-origin"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                  Preview will appear here
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
