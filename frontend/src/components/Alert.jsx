import React from 'react';

/**
 * Premium Status Notification Alert
 * Supports 'success' and 'error' types with inline SVG icons
 */
export default function Alert({ message, type }) {
  if (!message) return null;

  return (
    <div className={`alert alert-${type === 'error' ? 'error' : 'success'}`} role="alert">
      {type === 'error' ? (
        // Alert/Error Warning icon
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      ) : (
        // Check circle/success icon
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      )}
      <span style={{ fontWeight: '500' }}>{message}</span>
    </div>
  );
}
