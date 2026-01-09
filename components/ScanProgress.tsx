import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, Circle } from 'lucide-react';
import { Issue } from '../types';

interface Step {
  id: string;
  label: string;
  description: string;
}

const STEPS: Step[] = [
  { id: 'clone', label: 'Cloning Repository', description: 'Fetching files from GitHub...' },
  { id: 'static', label: 'Running Static Analysis', description: 'Checking syntax and known patterns...' },
  { id: 'ai', label: 'Gemini AI Deep Scan', description: 'Analyzing code for vulnerabilities...' },
  { id: 'report', label: 'Generating Report', description: 'Compiling findings and fixes...' },
];

interface ScanProgressProps {
  scanTask: Promise<{ issues: Issue[], scannedFileContent: string }>;
  onScanComplete: (data: { issues: Issue[], scannedFileContent: string }) => void;
  onScanError: (error: any) => void;
}

export const ScanProgress: React.FC<ScanProgressProps> = ({ scanTask, onScanComplete, onScanError }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [scanData, setScanData] = useState<{ issues: Issue[], scannedFileContent: string } | null>(null);
  const [error, setError] = useState<any>(null);

  // Monitor the actual task
  useEffect(() => {
    scanTask
      .then(data => setScanData(data))
      .catch(err => setError(err));
  }, [scanTask]);

  // Handle errors immediately
  useEffect(() => {
    if (error) {
        onScanError(error);
    }
  }, [error, onScanError]);

  // Manage Progress Steps
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (currentStep === 0) {
      // Step 1: Cloning (Fake delay)
      timer = setTimeout(() => setCurrentStep(1), 1200);
    } 
    else if (currentStep === 1) {
      // Step 2: Static Analysis (Fake delay)
      timer = setTimeout(() => setCurrentStep(2), 1500);
    } 
    else if (currentStep === 2) {
      // Step 3: AI Scan (Wait for Real Data)
      if (scanData) {
        // If data is ready, verify logic briefly then move to next
        timer = setTimeout(() => setCurrentStep(3), 800);
      }
      // If scanData is not yet available, we simply stay on this step.
      // The UI will show the spinner for "Gemini AI Deep Scan".
    } 
    else if (currentStep === 3) {
      // Step 4: Report Generation (Visual Progress Bar)
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            // Finished!
            if (scanData) {
                setTimeout(() => onScanComplete(scanData), 500);
            }
            return 100;
          }
          return prev + 5; // Fast progress since data is already here
        });
      }, 30);
      return () => clearInterval(interval);
    }

    return () => clearTimeout(timer);
  }, [currentStep, scanData, onScanComplete]);

  return (
    <div className="w-full max-w-md mx-auto mt-10 md:mt-20 px-6 py-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl transition-all duration-300">
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
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium transition-colors flex justify-between ${
                    status === 'waiting' ? 'text-slate-600' : 'text-slate-200'
                  }`}>
                    <span className="truncate pr-2">{step.label}</span>
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
              <div className={`ml-10 mt-1 text-xs font-mono transition-all duration-300 truncate ${
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