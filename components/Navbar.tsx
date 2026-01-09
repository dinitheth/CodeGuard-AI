import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-indigo-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              CodeGuard AI
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};