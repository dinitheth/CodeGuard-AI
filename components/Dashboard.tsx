import React, { useMemo, useState, useEffect } from 'react';
import { ScanResult, Issue, Severity } from '../types';
import { IssueCard } from './IssueCard';
import { Filter, GitPullRequest, X, Loader2, Copy, Check, FileText, Sparkles, FileDiff, ArrowRight, AlertOctagon } from 'lucide-react';
import { generatePRDetails } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface DashboardProps {
  result: ScanResult;
}

const LOADING_STEPS = [
  "Analyzing codebase context...",
  "Synthesizing security fixes...",
  "Drafting professional summary...",
  "Formatting technical details...",
  "Polishing markdown output..."
];

const SEVERITY_TEXT_COLORS = {
  [Severity.CRITICAL]: 'text-red-500',
  [Severity.HIGH]: 'text-orange-500',
  [Severity.MEDIUM]: 'text-yellow-500',
  [Severity.LOW]: 'text-blue-500',
};

export const Dashboard: React.FC<DashboardProps> = ({ result }) => {
  const [fixedIssues, setFixedIssues] = useState<Set<string>>(new Set());
  const [filterSeverity, setFilterSeverity] = useState<Severity | 'ALL'>('ALL');
  
  // PR Modal State
  const [showPRModal, setShowPRModal] = useState(false);
  const [isGeneratingPR, setIsGeneratingPR] = useState(false);
  const [prData, setPrData] = useState<{ title: string; description: string } | null>(null);
  const [prIssues, setPrIssues] = useState<Issue[]>([]);
  const [copied, setCopied] = useState(false);
  
  // Animation State
  const [loadingStep, setLoadingStep] = useState(0);

  const stats = useMemo(() => {
    return {
      [Severity.CRITICAL]: result.issues.filter(i => i.severity === Severity.CRITICAL).length,
      [Severity.HIGH]: result.issues.filter(i => i.severity === Severity.HIGH).length,
      [Severity.MEDIUM]: result.issues.filter(i => i.severity === Severity.MEDIUM).length,
      [Severity.LOW]: result.issues.filter(i => i.severity === Severity.LOW).length,
    };
  }, [result.issues]);

  const filteredIssues = result.issues.filter(
    issue => filterSeverity === 'ALL' || issue.severity === filterSeverity
  );

  // Cycle loading messages
  useEffect(() => {
    if (isGeneratingPR) {
      setLoadingStep(0);
      const interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % LOADING_STEPS.length);
      }, 1200);
      return () => clearInterval(interval);
    }
  }, [isGeneratingPR]);

  const handleApplyFix = (id: string) => {
    // Optimistic UI update
    const next = new Set(fixedIssues);
    next.add(id);
    setFixedIssues(next);
  };

  const handleCreatePR = async () => {
    setPrData(null); // Clear previous data
    setIsGeneratingPR(true);
    setShowPRModal(true);

    // Identify which issues to include in the PR
    // If specific fixes were applied, only include those. Otherwise, assume a "fix all" PR.
    const issuesToFix = fixedIssues.size > 0 
        ? result.issues.filter(i => fixedIssues.has(i.id))
        : result.issues;

    setPrIssues(issuesToFix);

    try {
      const data = await generatePRDetails(issuesToFix);
      setPrData(data);
    } catch (error) {
      console.error("Failed to generate PR details:", error);
    } finally {
      setIsGeneratingPR(false);
    }
  };

  const handleCopy = () => {
    if (!prData) return;
    const text = `# ${prData.title}\n\n${prData.description}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-700">
      
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Object.entries(stats).map(([sev, count]) => (
          <div key={sev} className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <p className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">{sev}</p>
            <p className={`text-3xl font-bold ${SEVERITY_TEXT_COLORS[sev as Severity] || 'text-white'}`}>{count}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-400" />
            <select 
              className="bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value as Severity | 'ALL')}
            >
              <option value="ALL">All Severities</option>
              <option value={Severity.CRITICAL}>Critical Only</option>
              <option value={Severity.HIGH}>High Only</option>
            </select>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleCreatePR}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20"
          >
            <GitPullRequest className="w-4 h-4" />
            Create PR
          </button>
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-4">
        {filteredIssues.map((issue) => (
          <IssueCard 
            key={issue.id} 
            issue={issue} 
            onApplyFix={handleApplyFix}
            isFixed={fixedIssues.has(issue.id)}
            fileContent={result.scannedFileContent}
          />
        ))}
        {filteredIssues.length === 0 && (
          <div className="text-center py-20 bg-slate-900/50 border border-slate-800 rounded-xl border-dashed">
            <p className="text-slate-500">No issues found matching your filters.</p>
          </div>
        )}
      </div>

      {/* PR Modal */}
      {showPRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl relative overflow-hidden">
                {/* Modal Header */}
                <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
                             <GitPullRequest className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Generate Pull Request</h3>
                            <p className="text-xs text-slate-400">AI-generated title and description</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowPRModal(false)}
                        className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {isGeneratingPR ? (
                        <div className="flex flex-col items-center justify-center h-72 gap-8">
                             {/* Animated Icon */}
                             <div className="relative w-20 h-20">
                                <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                                <div className="absolute inset-2 border-4 border-cyan-500/30 rounded-full border-b-transparent animate-spin-reverse"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
                                </div>
                             </div>

                             <div className="w-full max-w-sm text-center space-y-4">
                                 {/* Status Text */}
                                 <div className="h-6">
                                     <p key={loadingStep} className="text-slate-300 font-medium animate-in slide-in-from-bottom-2 fade-in duration-300">
                                        {LOADING_STEPS[loadingStep]}
                                     </p>
                                 </div>
                                 
                                 {/* Progress Bar */}
                                 <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 transition-all duration-700 ease-out"
                                        style={{ width: `${((loadingStep + 1) / LOADING_STEPS.length) * 100}%` }}
                                    />
                                 </div>
                                 <p className="text-xs text-slate-500">Powered by Gemini 3 Pro</p>
                             </div>
                        </div>
                    ) : prData ? (
                        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                            {/* Title & Description Section */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">PR Title</label>
                                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-medium">
                                        {prData.title}
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                                        <span>Description</span>
                                        <span className="flex items-center gap-1 text-[10px] bg-slate-800 px-2 py-0.5 rounded text-indigo-300">
                                            <FileText className="w-3 h-3" /> Markdown Preview
                                        </span>
                                    </label>
                                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 text-sm prose prose-invert prose-sm max-w-none">
                                        <ReactMarkdown>{prData.description}</ReactMarkdown>
                                    </div>
                                </div>
                            </div>

                            {/* Diff View Section */}
                            <div className="border-t border-slate-800 pt-6">
                                <h4 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
                                    <FileDiff className="w-4 h-4 text-indigo-400" />
                                    Proposed Changes ({prIssues.length})
                                </h4>
                                <div className="space-y-4">
                                    {prIssues.map((issue, idx) => (
                                        <div key={idx} className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
                                            <div className="bg-slate-900/50 px-3 py-2 border-b border-slate-800 flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-mono text-slate-300 font-medium">{issue.file}</span>
                                                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                                        <ArrowRight className="w-3 h-3" /> {issue.title}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">Line {issue.line}</span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 text-xs font-mono divide-y md:divide-y-0 md:divide-x divide-slate-800">
                                                 <div className="p-3 bg-red-950/10 overflow-x-auto custom-scrollbar group">
                                                     <div className="text-red-500/50 mb-1 select-none font-sans font-bold text-[10px] uppercase group-hover:text-red-400 transition-colors">Original</div>
                                                     <code className="text-red-200/70 whitespace-pre block">{issue.originalCode}</code>
                                                 </div>
                                                 <div className="p-3 bg-green-950/10 overflow-x-auto custom-scrollbar group">
                                                     <div className="text-green-500/50 mb-1 select-none font-sans font-bold text-[10px] uppercase group-hover:text-green-400 transition-colors">Suggested Fix</div>
                                                     <code className="text-green-200/70 whitespace-pre block">{issue.suggestedFix}</code>
                                                 </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-2">
                            <Sparkles className="w-8 h-8 text-slate-600 mb-2" />
                            <p>Failed to generate PR data.</p>
                            <button 
                                onClick={handleCreatePR}
                                className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                            >
                                Try Again
                            </button>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3">
                    <button 
                         onClick={() => setShowPRModal(false)}
                         className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    {!isGeneratingPR && prData && (
                        <button 
                            onClick={handleCopy}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copied ? 'Copied' : 'Copy Content'}
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};