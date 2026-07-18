// src/pages/NotFound.jsx
// This page is rendered when no route matches the current URL.
// It provides a user-friendly message and a link back to the Dashboard.


import { Link } from 'react-router-dom'; // Link component for client-side navigation
import { Frown, Home } from 'lucide-react'; // Icon components

export default function NotFound() {
  return (
    // Full-height centered layout using the app's design system variables
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-6 text-center">

      {/* Animated icon container */}
      <div className="w-20 h-20 rounded-full bg-danger/10 border border-danger/20 flex items-center justify-center mb-6 animate-pulse">
        <Frown className="w-9 h-9 text-danger" />
      </div>

      {/* HTTP status code — large, prominent display */}
      <h1 className="font-display font-black text-8xl text-text-main tracking-tighter mb-2">
        404
      </h1>

      {/* Short headline */}
      <h2 className="font-display font-semibold text-2xl text-text-main mb-3">
        Page Not Found
      </h2>

      {/* Descriptive subtext using muted color token */}
      <p className="text-sm text-text-muted max-w-sm leading-relaxed mb-8">
        The page you're looking for doesn't exist or may have been moved.
        Double-check the URL or navigate back to the Dashboard.
      </p>

      {/* Call-to-action link styled as a primary button */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-semibold shadow-sm shadow-primary/25 transition-all hover:scale-[1.02]"
      >
        <Home className="w-4 h-4" />
        Back to Dashboard
      </Link>
    </div>
  );
}
