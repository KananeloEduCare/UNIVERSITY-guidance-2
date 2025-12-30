import React, { useState } from 'react';
import { GraduationCap, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { authService, User, AuthResult } from '../../services/authService';
import { counselorAuthService, Counselor } from '../../services/counselorAuthService';

interface MobileLoginProps {
  onLogin: (user: User) => void;
  onCounselorLogin?: (counselor: Counselor) => void;
}

const MobileLogin: React.FC<MobileLoginProps> = ({ onLogin, onCounselorLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setEmailError('');
    setPasswordError('');
    setGeneralError('');

    setIsLoading(true);

    try {
      const result: AuthResult = await authService.authenticateUser({ email, password });

      if (result.success && result.user) {
        console.log('Login successful:', result.user);

        // Check if the user is a counselor based on their role
        if ((result.user.role === 'pool_management' || result.user.role === 'essay') && onCounselorLogin) {
          console.log('Routing to counselor dashboard');
          const counselor: Counselor = {
            id: result.user.username,
            email: result.user.username,
            name: result.user.name,
            role: result.user.role as 'pool_management' | 'essay'
          };
          onCounselorLogin(counselor);
        } else {
          console.log('Routing to student dashboard');
          onLogin(result.user);
        }
      } else {
        switch (result.error) {
          case 'USER_NOT_FOUND':
            setEmailError(result.message || 'Email not found');
            break;
          case 'WRONG_PASSWORD':
            setPasswordError(result.message || 'Incorrect password');
            break;
          case 'NETWORK_ERROR':
          default:
            setGeneralError(result.message || 'Login failed. Please try again.');
            break;
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setGeneralError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDummyCredentials = () => {
    setEmail('kananelobutielliot@gmail.com');
    setPassword('12345');
    // Clear errors when using demo
    setEmailError('');
    setPasswordError('');
    setGeneralError('');
  };

  return (
    <div className="min-h-screen bg-[#04adee] flex flex-col">
      {/* Header Section */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-8">
        <div className="mb-6">
          <img 
            src="/blue logo.png" 
            alt="EduCare Logo" 
            className="w-20 h-20 object-contain opacity-90"
          />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-2">EduCare</h1>
        <p className="text-white text-lg font-medium mb-2">University Guidance</p>
        <p className="text-white text-center text-sm opacity-90">Your academic journey starts here</p>
      </div>

      {/* Login Form Section */}
      <div className="bg-white rounded-t-3xl px-6 py-8 shadow-2xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Sign in to continue your journey</p>
        </div>

        {/* General Error Message */}
        {generalError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm">{generalError}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:ring-2 focus:ring-[#04adee] focus:border-transparent text-base ${
                  emailError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
                required
              />
            </div>
            {emailError && (
              <p className="mt-1 text-sm text-red-600">{emailError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-12 pr-12 py-4 border rounded-xl focus:ring-2 focus:ring-[#04adee] focus:border-transparent text-base ${
                  passwordError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 text-gray-400"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {passwordError && (
              <p className="mt-1 text-sm text-red-600">{passwordError}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#04adee] text-white py-4 rounded-xl font-semibold text-base disabled:opacity-50 shadow-lg"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </button>

          <button
            type="button"
            onClick={fillDummyCredentials}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium text-sm"
          >
            Use Demo Account
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">Demo: kananelobutielliot@gmail.com / 12345</p>
        </div>
      </div>
    </div>
  );
};

export default MobileLogin;