import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, LogIn, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { checkAdminExists, createAdminUser } from '../../lib/db';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSchool } from '../../context/SchoolContext';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme } = useTheme();
  const { settings } = useSchool();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFirstAdmin, setIsFirstAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    checkFirstAdmin();
  }, []);

  const checkFirstAdmin = async () => {
    try {
      const hasAdmin = await checkAdminExists();
      setIsFirstAdmin(!hasAdmin);
    } catch (error) {
      console.error('Error checking admin status:', error);
      toast.error('Error checking admin status');
    } finally {
      setCheckingAdmin(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      navigate('/admin');
      toast.success('Welcome back!');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Login failed', {
        description: error?.message || 'An error occurred during login.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await createAdminUser(userCredential.user.uid, {
        email,
        name,
        role: 'admin'
      });
      navigate('/admin');
      toast.success('Admin account created successfully!');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error('Registration failed', {
        description: error?.message || 'An error occurred during registration.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <header className={`bg-${theme.primaryColor}-600 dark:bg-gray-800 text-white py-4 px-6 shadow-lg`}>
        <div className="max-w-7xl mx-auto flex items-center">
          {settings.logo ? (
            <img 
              src={settings.logo} 
              alt={settings.name} 
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <GraduationCap className="h-8 w-8" />
          )}
          <span className="ml-2 text-xl font-bold">{settings.name}</span>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            {isFirstAdmin ? (
              <>
                <UserPlus className={`mx-auto h-12 w-12 text-${theme.primaryColor}-600 dark:text-${theme.primaryColor}-400`} />
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                  Create Admin Account
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Set up the first administrator account
                </p>
              </>
            ) : (
              <>
                <LogIn className={`mx-auto h-12 w-12 text-${theme.primaryColor}-600 dark:text-${theme.primaryColor}-400`} />
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                  Admin Login
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Sign in to access the admin dashboard
                </p>
              </>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-xl rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={isFirstAdmin ? handleRegister : handleLogin}>
              {isFirstAdmin && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {isFirstAdmin && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-${theme.primaryColor}-600 hover:bg-${theme.primaryColor}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${theme.primaryColor}-500 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : isFirstAdmin ? (
                  'Create Account'
                ) : (
                  'Sign in'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}