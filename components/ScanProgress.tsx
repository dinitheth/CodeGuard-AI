import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, Circle } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  description: string;
}

const STEPS: Step[] = [
  { id: 'clone', label: 'Cloning Repository', description: 'Fetching files from GitHub...' },
  { id: 'static', label: 'Running Static Analysis (ESLint/Bandit)', description: 'Checking syntax and known patterns...' },
  { id: 'ai', label: 'Gemini AI Deep Scan', description: 'Analyzing code for vulnerabilities...' },
  { id: 'report', label: 'Generating Report', description: 'Compiling findings and fixes...' },
];

export const ScanProgress: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentStep < STEPS.length) {
      const currentStepId = STEPS[currentStep].id;

      if (currentStepId === 'report') {
        // Percentage based loading for report generation
        const interval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 100) {
              clearInterval(interval);
              setTimeout(() => setCurrentStep((c) => c + 1), 600);
              return 100;
            }
            // Increment by a variable amount for organic feel
            return Math.min(prev + Math.random() * 4 + 1, 100);
          });
        }, 100);
        return () => clearInterval(interval);
      } else {
        // Standard time-based delay for other steps
        const timeout = setTimeout(() => {
          setCurrentStep((prev) => prev + 1);
        }, 1500); 
        return () => clearTimeout(timeout);
      }
    } else {
      setTimeout(onComplete, 500);
    }
  }, [currentStep, onComplete]);

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
      <h3 className="text-xl font-bold text-white mb-6 text-center">Scanning Repository...</h3>
      <div className="space-y-6">
        {STEPS.map((step, index) => {
          let status: 'waiting' | 'active' | 'completed' = 'waiting';
          if (index < currentStep) status = 'completed';
          else if (index === currentStep) status = 'active';

          return (
            <div key={step.id} className="flex flex-col">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  {status === 'completed' && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                  {status === 'active' && <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />}
                  {status === 'waiting' && <Circle className="w-6 h-6 text-slate-700" />}
                </div>
                <div className="flex-1">
                  <div className={`text-sm font-medium transition-colors flex justify-between ${
                    status === 'waiting' ? 'text-slate-600' : 'text-slate-200'
                  }`}>
                    <span>{step.label}</span>
                    {status === 'active' && step.id === 'report' && (
                      <span className="text-indigo-400 font-mono text-xs">{Math.floor(progress)}%</span>
                    )}
                  </div>
                  
                  {/* Progress Bar for Report Step */}
                  {status === 'active' && step.id === 'report' && (
                    <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div 
                        className="bg-indigo-500 h-1.5 rounded-full transition-all duration-200" 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className={`ml-10 mt-1 text-xs font-mono transition-all duration-300 ${
                status === 'active' ? 'text-indigo-400 animate-pulse' : 
                status === 'completed' ? 'text-slate-500' : 
                'text-slate-700'
              }`}>
                {step.description}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};