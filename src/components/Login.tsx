import React, { useState } from 'react';
import { GraduationCap, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { authService, User, AuthResult } from '../services/authService';
import { counselorAuthService, Counselor } from '../services/counselorAuthService';

interface LoginProps {
  onLogin: (user: User) => void;
  onCounselorLogin: (counselor: Counselor) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onCounselorLogin }) => {
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
        if (result.user.role === 'pool_management' || result.user.role === 'essay') {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full mx-auto">
        {/* Combined Login Card */}
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-blue-100 animate-fade-in">
          {/* Logo and Header Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <img 
                src="/white_logo.png" 
                alt="EduCare Logo" 
                className="w-12 h-12 object-contain opacity-90"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">EduCare</h1>
            <p className="text-base sm:text-lg text-[#04adee] font-semibold">University Guidance</p>
            <p className="text-sm sm:text-base text-gray-600 mt-2 mb-6">Empowering your academic journey</p>
          </div>

          {/* General Error Message */}
          {generalError && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{generalError}</p>
            </div>
          )}
          {/* Login Form Section */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#04adee] focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
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

              <div className="relative">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-[#04adee] focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                      passwordError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordError && (
                  <p className="mt-1 text-sm text-red-600">{passwordError}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#04adee] text-white py-3 px-4 rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-[#04adee] focus:ring-offset-2 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in to EduCare'
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-6 text-xs sm:text-sm text-gray-500">
          © 2025 EduCare. Enhancing education through efficiency.
        </div>
      </div>
    </div>
  );
};

export default Login;