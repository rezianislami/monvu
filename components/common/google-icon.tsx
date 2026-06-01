// Google "G" mark. lucide-react dropped brand glyphs, so we inline the official
// four-color logo rather than pull in a brand-icon dependency for a single mark.
export function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.82-.07-1.6-.21-2.36H12v4.47h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.73z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.94-2.91l-3.88-3a7.2 7.2 0 0 1-10.74-3.77H1.31v3.09A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.32 14.32a7.2 7.2 0 0 1 0-4.63V6.6H1.31a12 12 0 0 0 0 10.8l4.01-3.08z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44A11.97 11.97 0 0 0 12 0 12 12 0 0 0 1.31 6.6l4.01 3.09A7.2 7.2 0 0 1 12 4.75z"
      />
    </svg>
  );
}
