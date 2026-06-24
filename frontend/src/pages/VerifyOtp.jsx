import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import Alert from '../components/Alert';
import Loader from '../components/Loader';

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve email and purpose from router state, default to empty
  const stateEmail = location.state?.email || '';
  const purpose = location.state?.purpose || 'email_verification'; // 'email_verification' or 'login_otp'

  const [email, setEmail] = useState(stateEmail);
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [alert, setAlert] = useState({ message: '', type: '' });
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes = 300 seconds
  const [timerActive, setTimerActive] = useState(true);

  // References to input nodes to manage auto-focus shifting
  const inputsRef = useRef([]);

  // Timer Countdown Effect
  useEffect(() => {
    if (timeLeft <= 0) {
      setTimerActive(false);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Formatter for countdown (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Manage individual digit changes and focus shifting
  const handleChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(val)) return; // Only numeric characters

    const newOtp = [...otp];
    // Take only last character typed to prevent overflow
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);

    // Auto-focus next input box if filled
    if (val && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  // Handle Backspace deletion and focus back-shifting
  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Clear previous input and focus it
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputsRef.current[index - 1].focus();
      } else {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  // Intercept Paste events to auto-populate the 6 fields
  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text');
    if (paste.length === 6 && /^\d+$/.test(paste)) {
      setOtp(paste.split(''));
      inputsRef.current[5].focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setAlert({ message: 'Please enter the complete 6-digit OTP code.', type: 'error' });
      return;
    }

    setLoading(true);
    setAlert({ message: '', type: '' });

    try {
      let response;
      if (purpose === 'email_verification') {
        response = await authAPI.verifyEmail(email, otpCode);
      } else {
        response = await authAPI.verifyLoginOtp(email, otpCode);
      }

      setAlert({ message: response.data.message, type: 'success' });
      
      // Store token and redirect to dashboard
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      setTimeout(() => {
        // Trigger dashboard navigation and page reload to sync global auth states
        navigate('/');
        window.location.reload();
      }, 1200);
    } catch (error) {
      const errMsg = error.response?.data?.error || 'Verification failed. Please verify the code.';
      setAlert({ message: errMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setAlert({ message: '', type: '' });

    try {
      let response;
      if (purpose === 'email_verification') {
        response = await authAPI.resendVerifyOtp(email);
      } else {
        // For login OTP, triggers the standard login OTP flow
        response = await authAPI.login(email, ''); // Backend login controller is called again or we can re-request
        // Since login OTP is generated upon valid password credentials, they can trigger it by sending a resend.
        // Let's call the signup resend or general resend.
        // Actually, we can use the same resend endpoints or build email resend.
        // To be secure, for login OTP, we can prompt them to login again or call a resend if available.
        // Our backend authRoutes only exposes resend-verify-otp for email_verification.
        // If login OTP expired, we tell them to re-initiate login, which is safer.
        // Let's implement this:
        if (purpose === 'email_verification') {
          response = await authAPI.resendVerifyOtp(email);
          setAlert({ message: response.data.message, type: 'success' });
        } else {
          setAlert({ message: 'Login OTP cannot be resent directly. Please go back and sign in again.', type: 'error' });
          setResending(false);
          return;
        }
      }

      // Reset timer countdown
      setTimeLeft(300);
      setTimerActive(true);
      setOtp(new Array(6).fill(''));
      inputsRef.current[0].focus();
    } catch (error) {
      const errMsg = error.response?.data?.error || 'Failed to resend verification code.';
      setAlert({ message: errMsg, type: 'error' });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="card-auth">
      <Loader active={loading || resending} />
      
      <h2 className="card-title">Security Verification</h2>
      <p className="card-subtitle">
        {purpose === 'email_verification' 
          ? `We sent a 6-digit confirmation code to sign up your account at ${email}.`
          : `Please authenticate your login request using the code sent to ${email}.`
        }
      </p>

      <Alert message={alert.message} type={alert.type} />

      {!stateEmail && (
        <div className="form-group">
          <label className="form-label" htmlFor="email-input">Confirm Email Address</label>
          <input
            id="email-input"
            className="form-input"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!!stateEmail}
          />
        </div>
      )}

      <form onSubmit={handleVerify}>
        <div className="form-group text-center">
          <label className="form-label">Enter Verification Code</label>
          
          <div className="otp-container" onPaste={handlePaste}>
            {otp.map((data, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                type="text"
                maxLength="1"
                className="otp-box"
                value={data}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                disabled={timeLeft <= 0}
              />
            ))}
          </div>
        </div>

        <div className="text-center mb-4" style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          {timeLeft > 0 ? (
            <span>Code expires in: <span className="countdown">{formatTime(timeLeft)}</span></span>
          ) : (
            <span style={{ color: 'var(--error)', fontWeight: '600' }}>Verification code has expired.</span>
          )}
        </div>

        <button 
          className="btn-submit" 
          type="submit" 
          disabled={loading || timeLeft <= 0 || !email}
        >
          Verify & Authenticate
        </button>
      </form>

      <div className="text-center mt-6" style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
        {purpose === 'email_verification' ? (
          <button 
            onClick={handleResend} 
            className="link-auth" 
            style={{ background: 'none', border: 'none', font: 'inherit', cursor: 'pointer' }}
            disabled={resending || timeLeft > 240} // Prevent spamming within 1 minute of send
          >
            {resending ? 'Sending...' : 'Resend Verification Code'}
          </button>
        ) : (
          <Link to="/login" className="link-auth">
            Back to Sign In
          </Link>
        )}
      </div>
    </div>
  );
}
