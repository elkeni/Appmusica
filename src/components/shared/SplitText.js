import React from 'react';

// Minimal SplitText placeholder used by App while full component is absent.
// Renders the provided `text` prop with a simple span. Keep lightweight
// so it doesn't affect layout while we audit the repo.
export default function SplitText({ text, className, style }) {
  if (!text) return null;
  return (
    <div className={className} style={style}>
      <span>{text}</span>
    </div>
  );
}
