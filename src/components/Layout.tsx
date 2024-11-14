import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { GraduationCap, LayoutDashboard, LogOut, Settings, UserCircle, Menu, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useSchool } from '../context/SchoolContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { settings } = useSchool();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAdmin = location.pathname.startsWith('/admin');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: UserCircle, label: 'Profile', path: '/admin/profile' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900`}>
      <nav className={`bg-${theme.primaryColor}-600 dark:bg-gray-800 text-white sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              {settings.logo ? (
                <img 
                  src={settings.logo} 
                  alt={settings.name} 
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <GraduationCap className="h-8 w-8" />
              )}
              <span className="text-xl font-bold hidden sm:block">{settings.name}</span>
            </div>
            
            {/* Desktop Navigation */}
            {isAdmin && (
              <>
                <div className="hidden md:flex items-center space-x-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-opacity-80"
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Link>
                  ))}
                  <button 
                    onClick={handleLogout}
                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-opacity-80"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>

                {/* Mobile menu button */}
                <div className="md:hidden">
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="inline-flex items-center justify-center p-2 rounded-md hover:bg-opacity-80 focus:outline-none"
                  >
                    {isMobileMenuOpen ? (
                      <X className="h-6 w-6" />
                    ) : (
                      <Menu className="h-6 w-6" />
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isAdmin && (
          <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-${theme.primaryColor}-700 dark:border-gray-700">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-opacity-80"
                  onClick={closeMobileMenu}
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  {item.label}
                </Link>
              ))}
              <button 
                onClick={() => {
                  handleLogout();
                  closeMobileMenu();
                }}
                className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium hover:bg-opacity-80"
              >
                <LogOut className="h-4 w-4 mr-3" />
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content with Mobile Padding */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="w-full overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}