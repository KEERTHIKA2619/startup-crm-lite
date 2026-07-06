import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, HelpCircle } from 'lucide-react';

/**
 * NotFound Component
 * Displays a premium 404 Error page when an unrecognized URL route is requested.
 * Contains redirection pathways back to the primary dashboard.
 */
const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6 py-12 animate-in fade-in zoom-in-95 duration-300">
      
      {/* Decorative Icon */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-2xl w-24 h-24 mx-auto"></div>
        <div className="relative w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-2xl mx-auto group">
          <Compass className="w-10 h-10 text-indigo-400 animate-[spin_8s_linear_infinite] group-hover:text-indigo-300" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-slate-850 border border-slate-800 flex items-center justify-center text-slate-500">
          <HelpCircle className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Main Error Headers */}
      <span className="text-xs font-extrabold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full">
        Error Code 404
      </span>
      <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-4 tracking-tight">Resource Not Found</h2>
      
      <p className="text-slate-400 text-sm mt-3 max-w-md mx-auto leading-relaxed">
        The page you are trying to access might have been renamed, removed, or is temporarily unavailable. Double check the address bar or return home.
      </p>

      {/* Navigation Return Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto">
        <Link 
          to="/"
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30 active:scale-95 transition-all text-sm"
        >
          <Home className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
        <a 
          href="mailto:support@crmlite.io"
          className="flex items-center justify-center gap-2 border border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-slate-200 px-5 py-3 rounded-xl text-sm font-semibold transition-all"
        >
          <span>Contact Administrator</span>
        </a>
      </div>

    </div>
  );
};

export default NotFound;
