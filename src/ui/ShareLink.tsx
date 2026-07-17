import { useState } from 'react';

/**
 * Copy-the-current-scenario-as-a-link button. The App keeps the URL in sync with
 * the scenario state, so the live `location.href` already encodes the year,
 * baseline, toggles, and edits; this just copies it to the clipboard.
 */
export function ShareLink() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be blocked (permissions, insecure context). Leave the
      // label unchanged; the URL bar still holds the shareable link.
      setCopied(false);
    }
  };

  return (
    <div className="share">
      <button type="button" className="share-btn" onClick={copy}>
        {copied ? 'Link copied' : 'Copy share link'}
      </button>
      <p className="share-note">
        Copies this scenario (year, baseline, toggles, and edits) as a link.
      </p>
    </div>
  );
}
