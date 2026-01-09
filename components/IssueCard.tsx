import React, { useState, useRef, useEffect } from 'react';
import { Issue, Severity } from '../types';
import { AlertTriangle, Bug, Code, Zap, ChevronDown, ChevronUp, Check, FileCode2, ExternalLink, Info, ScanSearch } from 'lucide-react';

interface IssueCardProps {
  issue: Issue;
  onApplyFix: (id: string) => void;
  isFixed: boolean;
  fileContent?: string;
}

const SeverityBadge: React.FC<{ severity: Severity }> = ({ severity }) => {
  const colors = {
    [Severity.CRITICAL]: 'bg-red-500/10 text-red-400 border-red-500/20',
    [Severity.HIGH]: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    [Severity.MEDIUM]: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    [Severity.LOW]: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${colors[severity]}`}>
      {severity}
    </span>
  );
};

const TypeIcon: React.FC<{ type: string }> = ({ type }) => {
  switch (type) {
    case 'Security': return <AlertTriangle className="w-4 h-4 text-red-400" />;
    case 'Performance': return <Zap className="w-4 h-4 text-yellow-400" />;
    case 'Code Smell': return <Code className="w-4 h-4 text-blue-400" />;
    default: return <Bug className="w-4 h-4 text-orange-400" />;
  }
};

export const IssueCard: React.FC<IssueCardProps> = ({ issue, onApplyFix, isFixed, fileContent }) => {
  const [expanded, setExpanded] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [highlighted, setHighlighted] = useState(false);

  const lineRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll logic when expanded
  useEffect(() => {
    if (expanded && fileContent && lineRef.current && containerRef.current) {
        // Small delay to ensure render
        setTimeout(() => {
            if (lineRef.current && containerRef.current) {
                const container = containerRef.current;
                const line = lineRef.current;
                
                const scrollPosition = line.offsetTop - (container.clientHeight / 2) + (line.clientHeight / 2);
                
                container.scrollTo({
                    top: Math.max(0, scrollPosition),
                    behavior: 'smooth'
                });
                setHighlighted(true);
                setTimeout(() => setHighlighted(false), 2000);
            }
        }, 300);
    }
  }, [expanded, fileContent]);

  const handleFileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lineRef.current && containerRef.current) {
        const container = containerRef.current;
        const line = lineRef.current;
        
        const scrollPosition = line.offsetTop - (container.clientHeight / 2) + (line.clientHeight / 2);
        
        container.scrollTo({
            top: Math.max(0, scrollPosition),
            behavior: 'smooth'
        });

        setHighlighted(true);
        setTimeout(() => setHighlighted(false), 2000);
    }
  };

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isFixed) {
        setShowConfirm(true);
    }
  };

  const confirmFix = (e: React.MouseEvent) => {
    e.stopPropagation();
    onApplyFix(issue.id);
    setShowConfirm(false);
  };

  const cancelFix = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirm(false);
  };

  return (
    <div className={`relative border rounded-lg transition-all duration-300 ${isFixed ? 'bg-green-900/10 border-green-500/30' : 'bg-slate-900 border-slate-800 hover:border-indigo-500/50'}`}>
      <div 
        className="p-4 cursor-pointer flex items-start gap-4"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="mt-1 flex-shrink-0">
          <TypeIcon type={issue.type} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4">
             <div className="flex items-center gap-3 min-w-0">
                <h3 className={`text-sm font-semibold truncate ${isFixed ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                {issue.title}
                </h3>
                <div className="flex-shrink-0">
                    <SeverityBadge severity={issue.severity} />
                </div>
            </div>
            {isFixed && <span className="text-green-400 text-xs font-bold flex items-center gap-1 flex-shrink-0"><Check className="w-3 h-3"/> Fixed</span>}
          </div>
          <p className="text-xs text-slate-500 mt-1 truncate">
            {issue.description.substring(0, 120)}...
          </p>
        </div>
        <button className="text-slate-500 hover:text-white self-center flex-shrink-0">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-slate-800 p-4 bg-slate-950/50 animate-in slide-in-from-top-2">
          
          {/* Prominent Clickable Location Header */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800/50">
             <div className="flex items-center gap-2 min-w-0 flex-1 mr-4">
                <FileCode2 className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                <span className="text-slate-200 font-mono text-sm truncate" title={issue.file}>{issue.file}</span>
             </div>
             
             <button 
               onClick={handleFileClick}
               className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-md transition-all group hover:bg-indigo-900/20 hover:border-indigo-500/50"
               title="Scroll to code"
             >
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wide group-hover:text-slate-400">Line</span>
                <span className="text-sm font-bold text-indigo-400 group-hover:text-indigo-300 min-w-[1.5rem] text-center">{issue.line}</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 ml-1 hidden sm:block" />
             </button>
          </div>

          {/* Code Viewer Section */}
          {fileContent ? (
               <div className="mb-6 border border-slate-800 rounded-lg overflow-hidden bg-slate-950 shadow-inner">
                  <div className="bg-slate-900/50 px-3 py-1.5 border-b border-slate-800 flex justify-between items-center">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">File Content Viewer</span>
                  </div>
                  <div 
                      ref={containerRef}
                      className="max-h-60 overflow-y-auto custom-scrollbar font-mono text-xs relative"
                  >
                      {fileContent.split('\n').map((contentLine, i) => {
                          const lineNum = i + 1;
                          const isTarget = lineNum === issue.line;
                          return (
                              <div 
                                  key={i} 
                                  ref={isTarget ? lineRef : null}
                                  className={`flex transition-colors duration-700 ${
                                      isTarget 
                                        ? (highlighted ? 'bg-indigo-500/40 ring-1 ring-inset ring-indigo-500/50' : 'bg-indigo-500/10') 
                                        : 'hover:bg-slate-900/50'
                                  }`}
                              >
                                  <span className={`w-10 flex-shrink-0 text-right pr-3 py-0.5 select-none border-r border-slate-800/50 bg-slate-900/30 ${isTarget ? 'text-indigo-400 font-bold' : 'text-slate-600'}`}>
                                      {lineNum}
                                  </span>
                                  <span className={`pl-3 py-0.5 whitespace-pre flex-1 ${isTarget ? 'text-indigo-100' : 'text-slate-400'}`}>
                                      {contentLine}
                                  </span>
                              </div>
                          );
                      })}
                  </div>
               </div>
          ) : (
            <div className="mb-6 p-4 text-center border border-slate-800 rounded-lg bg-slate-900/50 text-slate-500 text-xs">
              File content not available for display.
            </div>
          )}

          {/* Analysis & Explanation Section */}
          <div className="mb-6 grid grid-cols-1 gap-4">
            
            <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <ScanSearch className="w-3 h-3" /> Analysis
                </span>
                <div className="text-sm text-slate-400 bg-slate-900/50 p-3 rounded border border-slate-800/50">
                    Detected a <strong className="text-indigo-400 font-medium">{issue.severity}</strong> severity issue classified as <strong className="text-indigo-400 font-medium">{issue.type}</strong>. 
                    This issue impacts the security or stability of the codebase.
                </div>
            </div>

            <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Info className="w-3 h-3" /> Explanation
                </span>
                <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/30 p-3 rounded border border-slate-800/50">
                    {issue.description}
                </p>
            </div>
            
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Original Code Snippet</span>
              </div>
              <pre className="bg-red-950/10 border border-red-900/30 rounded p-3 text-xs text-red-200 font-mono overflow-x-auto custom-scrollbar">
                <code>{issue.originalCode}</code>
              </pre>
            </div>
            <div>
              <span className="text-xs font-semibold text-green-400 mb-2 block uppercase tracking-wider">Suggested Fix</span>
              <pre className="bg-green-950/10 border border-green-900/30 rounded p-3 text-xs text-green-200 font-mono overflow-x-auto custom-scrollbar">
                <code>{issue.suggestedFix}</code>
              </pre>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleApplyClick}
              disabled={isFixed}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                isFixed 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
              }`}
            >
              {isFixed ? 'Patch Applied' : 'Apply AI Fix'}
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Overlay */}
      {showConfirm && (
        <div 
            className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-[2px] rounded-lg flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl shadow-2xl max-w-sm w-full text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
             
             <h4 className="text-lg font-bold text-white mb-2">Apply Fix?</h4>
             <p className="text-sm text-slate-400 mb-6">
                Are you sure you want to apply this AI-generated fix to <span className="font-mono text-indigo-300">{issue.file}</span>?
             </p>

             <div className="flex gap-3 justify-center">
               <button
                 onClick={cancelFix}
                 className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
               >
                 Cancel
               </button>
               <button
                 onClick={confirmFix}
                 className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 transition-colors flex items-center gap-2"
               >
                 <Check className="w-4 h-4" />
                 Confirm
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};