
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Crown, Menu, X } from 'lucide-react';

const Header = () => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogoClick = () => {
    if (isAdmin) {
      navigate('/admin');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className={`flex items-center text-xl sm:text-2xl font-bold bg-gradient-to-r from-electric-blue-600 to-smart-purple-600 bg-clip-text text-transparent ${isAdmin ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
            onClick={handleLogoClick}
          >
            SmartFlow
            {isAdmin && <Crown className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2 text-yellow-500" />}
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-6 xl:space-x-8">
            <a href="#features" className="text-gray-700 hover:text-electric-blue-600 transition-colors text-sm xl:text-base">Features</a>
            <a href="#process" className="text-gray-700 hover:text-electric-blue-600 transition-colors text-sm xl:text-base">Processo</a>
            <a href="#contact" className="text-gray-700 hover:text-electric-blue-600 transition-colors text-sm xl:text-base">Contatti</a>
          </nav>
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            {user ? (
              <div className="flex items-center space-x-2 lg:space-x-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span className="hidden lg:inline">Ciao!</span>
                </div>
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-red-600 p-2"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => navigate('/auth')}
                variant="outline"
                size="sm"
                className="border-electric-blue-500 text-electric-blue-600 hover:bg-electric-blue-50 text-sm"
              >
                Accedi
              </Button>
            )}
            <Button 
              onClick={() => navigate('/create-project')}
              size="sm"
              className="bg-gradient-to-r from-electric-blue-500 to-smart-purple-500 hover:from-electric-blue-600 hover:to-smart-purple-600 text-white text-sm px-3 lg:px-4"
            >
              <span className="hidden sm:inline">Crea Progetto</span>
              <span className="sm:hidden">Crea</span>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 md:hidden">
            {user && (
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-red-600 p-2"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            )}
            <Button
              onClick={toggleMobileMenu}
              variant="ghost"
              size="sm"
              className="p-2"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-sm">
            <div className="px-2 pt-4 pb-6 space-y-4">
              {/* Mobile Navigation Links */}
              <nav className="space-y-3">
                <a 
                  href="#features" 
                  className="block px-3 py-2 text-gray-700 hover:text-electric-blue-600 transition-colors rounded-md hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a 
                  href="#process" 
                  className="block px-3 py-2 text-gray-700 hover:text-electric-blue-600 transition-colors rounded-md hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Processo
                </a>
                <a 
                  href="#contact" 
                  className="block px-3 py-2 text-gray-700 hover:text-electric-blue-600 transition-colors rounded-md hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contatti
                </a>
              </nav>

              {/* Mobile User Section */}
              {user && (
                <div className="px-3 py-2 border-t border-gray-200">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                    <User className="w-4 h-4" />
                    <span>Ciao!</span>
                  </div>
                </div>
              )}

              {/* Mobile Action Buttons */}
              <div className="space-y-3 px-3">
                {!user && (
                  <Button 
                    onClick={() => {
                      navigate('/auth');
                      setIsMobileMenuOpen(false);
                    }}
                    variant="outline"
                    className="w-full border-electric-blue-500 text-electric-blue-600 hover:bg-electric-blue-50"
                  >
                    Accedi
                  </Button>
                )}
                <Button 
                  onClick={() => {
                    navigate('/create-project');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-electric-blue-500 to-smart-purple-500 hover:from-electric-blue-600 hover:to-smart-purple-600 text-white"
                >
                  Crea Progetto
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
