
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Crown, Menu, X, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Header = () => {
  const { user, isAdmin, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogoClick = () => {
    if (isAdmin) {
      navigate('/admin');
    }
  };

  const handleSignOut = async () => {
    console.log('Attempting to sign out...');
    try {
      const { error } = await signOut();
      if (error) {
        console.error('Sign out error:', error);
        toast({
          title: "Errore",
          description: "Impossibile effettuare il logout. Riprova.",
          variant: "destructive"
        });
      } else {
        console.log('Sign out successful');
        toast({
          title: "Logout effettuato",
          description: "Sei stato disconnesso con successo.",
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Unexpected sign out error:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore imprevisto durante il logout.",
        variant: "destructive"
      });
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Mostra un indicatore di caricamento se l'auth è ancora in loading
  if (loading) {
    return (
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center text-xl sm:text-2xl font-bold bg-gradient-to-r from-electric-blue-600 to-smart-purple-600 bg-clip-text text-transparent">
              SmartFlow
            </div>
            <div className="hidden lg:flex space-x-6 xl:space-x-8">
              <a href="#features" className="text-gray-700 hover:text-electric-blue-600 transition-colors text-sm xl:text-base">Features</a>
              <a href="#process" className="text-gray-700 hover:text-electric-blue-600 transition-colors text-sm xl:text-base">Processo</a>
              <a href="#contact" className="text-gray-700 hover:text-electric-blue-600 transition-colors text-sm xl:text-base">Contatti</a>
            </div>
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-electric-blue-500"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

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
                
                {/* Personal Area Buttons - Desktop */}
                <Button
                  onClick={() => navigate('/dashboard')}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-electric-blue-600 p-2"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden xl:inline ml-2">Area Cliente</span>
                </Button>
                
                {isAdmin && (
                  <Button
                    onClick={() => navigate('/admin')}
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-smart-purple-600 p-2"
                  >
                    <Crown className="w-4 h-4" />
                    <span className="hidden xl:inline ml-2">Admin</span>
                  </Button>
                )}
                
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

          {/* Mobile Menu Button - Only on mobile */}
          <div className="flex items-center space-x-3 md:hidden">
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

        {/* Mobile Menu - Only visible on mobile */}
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

              {/* Mobile User Section with Personal Areas */}
              {user && (
                <div className="px-3 py-2 border-t border-gray-200">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                    <User className="w-4 h-4" />
                    <span>Ciao!</span>
                  </div>
                  
                  {/* Personal Area Buttons - Mobile */}
                  <div className="space-y-2 mb-4">
                    <Button 
                      onClick={() => {
                        navigate('/dashboard');
                        setIsMobileMenuOpen(false);
                      }}
                      variant="outline"
                      className="w-full justify-start border-electric-blue-500 text-electric-blue-600 hover:bg-electric-blue-50"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Area Cliente
                    </Button>
                    
                    {isAdmin && (
                      <Button 
                        onClick={() => {
                          navigate('/admin');
                          setIsMobileMenuOpen(false);
                        }}
                        variant="outline"
                        className="w-full justify-start border-smart-purple-500 text-smart-purple-600 hover:bg-smart-purple-50"
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Area Amministratore
                      </Button>
                    )}
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
