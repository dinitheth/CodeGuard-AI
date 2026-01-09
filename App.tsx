import React, { useState } from 'react';
import { HashRouter } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ScanProgress } from './components/ScanProgress';
import { Dashboard } from './components/Dashboard';
import { ChatBot } from './components/ChatBot';
import { analyzeCodeWithGemini } from './services/geminiService';
import { ScanResult, Issue } from './types';
import { Github, ArrowRight, X } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'scanning' | 'results'>('home');
  const [repoUrl, setRepoUrl] = useState('');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Hold the active promise so we can pass it to the progress component
  const [scanTask, setScanTask] = useState<Promise<{ issues: Issue[], scannedFileContent: string }> | null>(null);

  const validateUrl = (url: string) => {
    const regex = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;
    return regex.test(url);
  };

  const handleStartScan = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const trimmedUrl = repoUrl.trim();
    if (!trimmedUrl) {
      setError("Please enter a repository URL");
      return;
    }

    if (!validateUrl(trimmedUrl)) {
      setError("Invalid GitHub URL. Format: https://github.com/username/repository");
      return;
    }

    // Start the scan immediately
    const task = analyzeCodeWithGemini(trimmedUrl);
    setScanTask(task);
    setView('scanning');
  };

  const handleClearInput = () => {
    setRepoUrl('');
    setError(null);
    setScanTask(null);
  };

  const handleScanSuccess = (data: { issues: Issue[], scannedFileContent: string }) => {
    setScanResult({
      repoUrl,
      timestamp: new Date().toISOString(),
      filesScanned: 1, // In this demo we analyze the first relevant file found
      durationMs: 0, // Could calculate real duration here
      issues: data.issues,
      status: 'completed',
      scannedFileContent: data.scannedFileContent
    });
    
    setView('results');
    setScanTask(null); // Cleanup
  };

  const handleScanError = (err: any) => {
    console.error("Scan error:", err);
      
    // User-friendly error mapping
    let userMessage = "The scan could not be completed.";
    
    if (err.message?.includes("API Key")) {
        userMessage = "System Error: API Key is missing or invalid.";
    } else if (err.message?.includes("Could not find") || err.message?.includes("fetch")) {
        userMessage = "Unable to access repository. Please check the URL, ensure it is public, and try again.";
    } else {
        userMessage = `Scan failed: ${err.message || "Unknown error"}. Please check the URL and retry.`;
    }
    
    setError(userMessage);
    setView('home');
    setScanTask(null);
  };

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
        <Navbar />

        <main className="relative pb-20">
          {/* Background Gradients */}
          <div className="absolute top-0 left-0 w-full h-96 bg-indigo-900/20 blur-3xl -z-10 opacity-50 pointer-events-none" />
          <div className="absolute top-20 right-0 w-96 h-96 bg-cyan-900/20 blur-3xl -z-10 opacity-30 pointer-events-none" />

          {view === 'home' && (
            <div className="max-w-4xl mx-auto px-4 py-16 sm:py-20 sm:px-6 lg:px-8 flex flex-col items-center text-center animate-in zoom-in-95 duration-700">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/30 border border-indigo-500/30 text-indigo-300 text-xs font-medium mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Now powered by Gemini 3 Flash & Pro
              </div>
              
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6">
                Secure your code <br className="hidden sm:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                  in seconds.
                </span>
              </h1>
              
              <p className="text-base sm:text-lg text-slate-400 mb-8 sm:mb-10 max-w-xl mx-auto">
                Instant AI security scanning and automated bug fixes for your GitHub repos.
              </p>

              <form onSubmit={handleStartScan} className="w-full max-w-xl relative group mb-4 sm:mb-2">
                <div className={`absolute -inset-1 bg-gradient-to-r ${error ? 'from-red-500/50 to-orange-500/50' : 'from-indigo-500 to-cyan-500'} rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200`}></div>
                <div className={`relative flex items-center bg-slate-900 rounded-lg p-2 border ${error ? 'border-red-500/50' : 'border-slate-800'} transition-all duration-300`}>
                  <Github className={`w-6 h-6 ml-2 sm:ml-3 transition-colors flex-shrink-0 ${error ? 'text-red-400' : 'text-slate-500'}`} />
                  <input
                    type="text"
                    value={repoUrl}
                    onChange={(e) => {
                      setRepoUrl(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="https://github.com/username/repository"
                    className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-slate-500 h-10 px-3 sm:px-4 w-full outline-none text-sm sm:text-base min-w-0"
                  />
                  
                  {repoUrl && (
                    <button
                      type="button"
                      onClick={handleClearInput}
                      className="p-2 text-slate-500 hover:text-white transition-colors mr-1 flex-shrink-0"
                      title="Clear"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}

                  <button 
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 sm:px-6 py-2 rounded-md font-medium transition-colors flex items-center gap-2 flex-shrink-0 text-sm sm:text-base"
                  >
                    Scan <ArrowRight className="w-4 h-4 hidden sm:block" />
                  </button>
                </div>
                
                {/* Validation Feedback */}
                <div className="absolute top-full left-0 mt-3 w-full px-1 text-left">
                  {error ? (
                    <p className="text-red-400 text-xs font-medium flex items-center gap-2 animate-in slide-in-from-top-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                      {error}
                    </p>
                  ) : (
                    <p className="text-slate-500 text-xs pl-1 hidden sm:block">
                      Example: <span className="text-slate-400 font-mono">https://github.com/facebook/react</span>
                    </p>
                  )}
                </div>
              </form>
              
              <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 text-left w-full max-w-3xl">
                {[
                  { title: 'Smart Detection', desc: 'Combines static analysis with Gemini 3 Flash speed.' },
                  { title: 'Deep Reasoning', desc: 'Gemini 3 Pro thinks deeply about complex issues.' },
                  { title: 'Auto-Fix', desc: 'Generate and apply patches automatically.' }
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
                    <h3 className="font-semibold text-white mb-1 text-sm sm:text-base">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === 'scanning' && scanTask && (
            <ScanProgress 
              scanTask={scanTask} 
              onScanComplete={handleScanSuccess} 
              onScanError={handleScanError} 
            />
          )}

          {view === 'results' && scanResult && (
            <Dashboard result={scanResult} />
          )}
        </main>
        
        <ChatBot />
      </div>
    </HashRouter>
  );
};

export default App;