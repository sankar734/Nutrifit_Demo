import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User as UserIcon,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Timer,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DeviceViewSwitcher from '../../components/customer/DeviceViewSwitcher';
import { useDeviceMode } from '../../context/DeviceModeContext';

const Login = () => {
  const { user, login, verifyEmailOtp, sendRegisterOtp, completeRegister, resendLoginOtp } = useAuth();
  const { isMobileView, isSimulatorMode } = useDeviceMode();
  const navigate = useNavigate();

  const redirectByRole = (loggedInUser) => {
    if (!loggedInUser) return;
    if (loggedInUser.role === 'admin' || loggedInUser.role === 'superadmin') navigate('/admin');
    else if (loggedInUser.role === 'chef') navigate('/chef');
    else if (loggedInUser.role === 'delivery') navigate('/delivery');
    else navigate('/home');
  };

  useEffect(() => {
    if (user) {
      redirectByRole(user);
    }
  }, [user]);

  // Auth Mode: 'signin' | 'signup'
  const [authMode, setAuthMode] = useState('signin');

  // Step within current mode: 1 = Form Input, 2 = Email OTP Verification
  const [step, setStep] = useState(1);

  // Common Feedback
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Sign In Form States (Clean, no prefill)
  const [identifier, setIdentifier] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Sign Up Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP Verification States (Real-Time Email OTP only)
  const [activeEmail, setActiveEmail] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);

  // Refs for 6 OTP digit boxes
  const otpInputRefs = useRef([]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Reset states when switching mode (Sign In <-> Sign Up)
  const switchMode = (mode) => {
    setAuthMode(mode);
    setStep(1);
    setError('');
    setSuccessMsg('');
    setOtpDigits(['', '', '', '', '', '']);
  };

  // ----------------------------------------------------
  // SIGN IN: STEP 1 (Submit Identifier & Password)
  // ----------------------------------------------------
  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!identifier.trim() || !signInPassword) {
      setError('Please enter your username/email and password.');
      return;
    }

    setLoading(true);
    try {
      const responseData = await login(identifier.trim(), signInPassword);

      if (responseData?.requireOtp) {
        setActiveEmail(responseData.email);
        setMaskedEmail(responseData.maskedEmail || responseData.email);
        setStep(2);
        setResendTimer(60);
        setOtpDigits(['', '', '', '', '', '']);
        setSuccessMsg(`Credentials verified! Real-time OTP sent to ${responseData.email}. Please check your inbox.`);

        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 150);
      } else if (responseData?.role) {
        redirectByRole(responseData);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // SIGN UP: STEP 1 (Submit Registration Details)
  // ----------------------------------------------------
  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!signUpPassword || signUpPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (signUpPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-check your confirm password.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        password: signUpPassword,
      };

      await sendRegisterOtp(payload);

      setActiveEmail(email.trim().toLowerCase());
      setMaskedEmail(email.trim().toLowerCase());
      setStep(2);
      setResendTimer(60);
      setOtpDigits(['', '', '', '', '', '']);
      setSuccessMsg(`Real-time verification OTP sent to ${email.trim()}. Please check your email inbox.`);

      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // OTP INPUT HANDLING (Real-Time User Entry)
  // ----------------------------------------------------
  const handleOtpDigitChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste of 6-digit code
      const pastedDigits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newDigits = [...otpDigits];
      pastedDigits.forEach((digit, i) => {
        if (i < 6) newDigits[i] = digit;
      });
      setOtpDigits(newDigits);
      const nextIndex = Math.min(pastedDigits.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
      return;
    }

    const digit = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // ----------------------------------------------------
  // STEP 2: VERIFY REAL-TIME OTP
  // ----------------------------------------------------
  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    const fullCode = otpDigits.join('');
    if (fullCode.length !== 6) {
      setError('Please enter all 6 digits of the verification code received on your email.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      let loggedUser;
      if (authMode === 'signin') {
        loggedUser = await verifyEmailOtp(activeEmail, fullCode);
      } else {
        loggedUser = await completeRegister({ email: activeEmail, otp: fullCode });
      }
      redirectByRole(loggedUser);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP code. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // RESEND REAL-TIME OTP
  // ----------------------------------------------------
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setError('');
    setLoading(true);
    try {
      if (authMode === 'signin') {
        await resendLoginOtp(activeEmail);
      } else {
        const payload = {
          name: name.trim(),
          phone: phone.trim(),
          email: activeEmail,
          password: signUpPassword,
        };
        await sendRegisterOtp(payload);
      }
      setResendTimer(60);
      setSuccessMsg(`A new 6-digit real-time verification code has been dispatched to ${activeEmail}.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50/40 to-white flex flex-col justify-center ${isSimulatorMode ? 'mobile-simulator-wrapper p-4' : 'p-4 sm:p-8 md:p-12'}`}>
      
      {/* Container Card */}
      <div className={`w-full bg-white rounded-3xl shadow-2xl border border-purple-100/80 overflow-hidden ${isSimulatorMode ? 'max-w-[440px]' : isMobileView ? 'max-w-md mx-auto' : 'max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12'}`}>
        
        {/* Left Side: Brand Showcase (Desktop Web View) */}
        {!isMobileView && (
          <div className="lg:col-span-5 bg-gradient-to-br from-purple-700 via-indigo-700 to-purple-900 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -top-16 -left-16 w-56 h-56 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

            <div>
              <Link to="/" className="flex items-center gap-3 mb-8 group">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-3xl shadow-lg border border-white/20 group-hover:scale-105 transition">
                  🥑
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-white">NutriChef</h2>
                  <p className="text-[11px] font-medium text-purple-200 uppercase tracking-wider">Homemade & Healthy</p>
                </div>
              </Link>

              <div className="space-y-4 my-8">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-purple-200 text-xs font-semibold">
                  <Sparkles size={13} className="text-yellow-300" />
                  Unified & Real-Time Verified
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                  {authMode === 'signin' 
                    ? 'Welcome back to verified clean home eating.'
                    : 'Craft healthy lifestyle habits with certified local chefs.'}
                </h3>
                <p className="text-sm text-purple-100/80 leading-relaxed">
                  Enjoy macro-balanced, hygienic home-cooked meals tailored for weight management, diabetes, and overall wellness.
                </p>
              </div>
            </div>

            {/* Highlights */}
            <div className="space-y-3 pt-6 border-t border-white/15">
              <div className="flex items-center gap-3 text-xs text-purple-100">
                <CheckCircle2 size={16} className="text-emerald-300 shrink-0" />
                <span>Real-Time Email OTP Verification sent directly to your inbox</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-purple-100">
                <CheckCircle2 size={16} className="text-emerald-300 shrink-0" />
                <span>One unified secure login for all users</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-purple-100">
                <CheckCircle2 size={16} className="text-emerald-300 shrink-0" />
                <span>Hygiene audited kitchens & macro-nutrient breakdown</span>
              </div>
            </div>
          </div>
        )}

        {/* Right Side: Unified Form */}
        <div className={`${!isMobileView ? 'lg:col-span-7' : ''} p-6 sm:p-10 flex flex-col justify-center`}>
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-xl shadow-md text-white">
                🥑
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  {step === 2
                    ? 'Verify Your Email'
                    : authMode === 'signin'
                    ? 'Sign In to NutriChef'
                    : 'Create New Account'}
                </h1>
                <p className="text-xs text-slate-500">
                  {step === 2
                    ? 'Enter the 6-digit real-time code sent to your email inbox'
                    : authMode === 'signin'
                    ? 'Enter username & password with real-time email verification'
                    : 'Register with name, email verification, phone & password'}
                </p>
              </div>
            </div>

            <DeviceViewSwitcher inline={true} />
          </div>

          {/* Mode Switcher Tabs (Sign In vs Create Account) - Visible on Step 1 */}
          {step === 1 && (
            <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6 shadow-inner">
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  authMode === 'signin'
                    ? 'bg-white text-purple-700 shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Sign In (Login)</span>
              </button>
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  authMode === 'signup'
                    ? 'bg-white text-purple-700 shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Create Account (Register)</span>
              </button>
            </div>
          )}

          {/* Feedback Messages */}
          {error && (
            <div className="p-3 mb-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2 animate-fade-in">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 mb-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-start gap-2 animate-fade-in">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* 1. SIGN IN FLOW */}
          {/* ======================================================== */}
          {authMode === 'signin' && step === 1 && (
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              {/* Identifier Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Username, Email or Mobile
                </label>
                <div className="relative">
                  <UserIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Enter your registered email or phone"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showSignInPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    required
                    className="w-full pl-11 pr-11 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 bg-slate-50/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showSignInPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Security Hint */}
              <div className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-100 flex items-center gap-2 text-[11px] text-purple-800">
                <ShieldCheck size={15} className="text-purple-600 shrink-0" />
                <span>Next step sends a real-time verification OTP directly to your email inbox.</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !identifier || !signInPassword}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white font-bold text-sm shadow-lg shadow-purple-500/25 hover:shadow-xl transition transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Verifying Credentials & Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Email Verification</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ======================================================== */}
          {/* 2. SIGN UP FLOW (All Fields in Unified Form) */}
          {/* ======================================================== */}
          {authMode === 'signup' && step === 1 && (
            <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Priya Ramesh"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Mobile Phone Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number (10 Digits)</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="9876543210"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address <span className="text-purple-600 font-normal">(real-time OTP will be sent)</span>
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    placeholder="your.email@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showSignUpPassword ? 'text' : 'password'}
                      placeholder="Min 6 characters"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 bg-slate-50/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showSignUpPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className={`w-full pl-10 pr-10 py-2.5 rounded-2xl border text-sm focus:outline-none focus:ring-2 bg-slate-50/50 ${
                        confirmPassword && confirmPassword !== signUpPassword
                          ? 'border-red-300 focus:ring-red-400 focus:border-red-400'
                          : confirmPassword && confirmPassword === signUpPassword
                          ? 'border-emerald-400 focus:ring-emerald-400 focus:border-emerald-400'
                          : 'border-slate-200 focus:ring-purple-500/40 focus:border-purple-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== signUpPassword && (
                    <span className="text-[10px] text-red-500 font-semibold mt-0.5 block">
                      Passwords do not match
                    </span>
                  )}
                  {confirmPassword && confirmPassword === signUpPassword && (
                    <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block flex items-center gap-1">
                      <CheckCircle2 size={11} /> Passwords match
                    </span>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !name || !phone || !email || !signUpPassword || signUpPassword !== confirmPassword}
                className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white font-bold text-sm shadow-lg shadow-purple-500/25 hover:shadow-xl transition transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Sending Real-Time Verification Code...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Email & Create Account</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ======================================================== */}
          {/* 3. STEP 2: 6-DIGIT REAL-TIME EMAIL OTP VERIFICATION SCREEN */}
          {/* ======================================================== */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtpSubmit} className="space-y-5 animate-fade-in">
              {/* Target Email Banner */}
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80 text-center">
                <p className="text-xs text-slate-600 mb-1">
                  A real-time 6-digit verification code has been dispatched to:
                </p>
                <p className="text-sm font-black text-purple-950 font-mono tracking-wide">
                  {maskedEmail || activeEmail}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Please open your email inbox and enter the code below.
                </p>
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(''); setSuccessMsg(''); }}
                  className="inline-flex items-center gap-1 text-[11px] text-purple-600 font-semibold hover:underline mt-2"
                >
                  <ArrowLeft size={12} />
                  <span>{authMode === 'signin' ? 'Change credentials' : 'Edit registration details'}</span>
                </button>
              </div>

              {/* 6 Digit Inputs (Typed by user directly from real email) */}
              <div>
                <label className="block text-center text-xs font-bold text-slate-700 mb-3">
                  Enter 6-Digit Email Code
                </label>
                <div className="flex justify-center gap-2 sm:gap-3">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-11 h-13 sm:w-13 sm:h-14 text-center text-xl font-black rounded-2xl border-2 border-slate-200 focus:border-purple-600 focus:ring-4 focus:ring-purple-500/20 outline-none bg-slate-50 transition"
                    />
                  ))}
                </div>
              </div>

              {/* Timer & Resend */}
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span className="flex items-center gap-1">
                  <Timer size={14} className="text-purple-600" />
                  Code expires in 5 mins
                </span>

                {resendTimer > 0 ? (
                  <span className="font-medium text-slate-600">
                    Resend in <span className="text-purple-700 font-bold">{resendTimer}s</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="font-bold text-purple-700 hover:text-purple-900 hover:underline disabled:opacity-50"
                  >
                    Resend Code to Email
                  </button>
                )}
              </div>

              {/* Verify & Proceed Button */}
              <button
                type="submit"
                disabled={loading || otpDigits.join('').length !== 6}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white font-bold text-sm shadow-lg shadow-purple-500/25 hover:shadow-xl transition transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>
                      {authMode === 'signin'
                        ? 'Verify OTP & Sign In'
                        : 'Verify OTP & Complete Registration'}
                    </span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer note */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            {authMode === 'signin' ? (
              <p className="text-xs text-slate-500">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="font-bold text-purple-700 hover:underline"
                >
                  Create Account
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="font-bold text-purple-700 hover:underline"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
      <DeviceViewSwitcher />
    </div>
  );
};

export default Login;
