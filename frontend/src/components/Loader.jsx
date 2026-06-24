import React from 'react';

/**
 * Premium Loading Spinner Overlay
 * Renders a glassmorphism overlay with a rotating spinner
 */
export default function Loader({ active }) {
  if (!active) return null;

  return (
    <div style={styles.overlay}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div style={styles.container}>
        <div style={styles.spinner}></div>
        <p style={styles.text}>Processing Secure Request...</p>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(9, 13, 22, 0.65)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '16px',
    zIndex: 99,
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '14px',
  },
  spinner: {
    width: '44px',
    height: '44px',
    border: '3px solid rgba(255, 255, 255, 0.05)',
    borderTop: '3.5px solid #6366f1',
    borderRadius: '50%',
    animation: 'spin 0.8s cubic-bezier(0.5, 0.1, 0.4, 0.9) infinite',
  },
  text: {
    color: '#94a3b8',
    fontSize: '13px',
    fontWeight: '600',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  }
};
