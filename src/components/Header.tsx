
import React, { useState } from 'react';
import { Button } from './ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { LogIn, LogOut, Settings, User, Home, Menu, X } from 'lucide-react';
import NotificationCenter from './NotificationCenter';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

const Header = () => {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAuthAction = async () => {
    if (user) {
      await signOut();
      navigate('/');
    } else {
      navigate('/auth');
    }
    setMobileMenuOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div 
            className="flex items-center space-x-2 cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-electric-blue-500 to-smart-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SF</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-electric-blue-600 to-smart-purple-600 bg-clip-text text-transparent">
              SmartFlow
            </h1>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Home
            </Button>
            <Button variant="ghost" onClick={() => navigate('/services')}>
              Servizi
            </Button>
            <Button variant="ghost" onClick={() => navigate('/contact')}>
              Contatti
            </Button>
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user && <NotificationCenter />}
            
            {user ? (
              <div className="flex items-center space-x-3">
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/admin')}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/dashboard')}
                >
                  <User className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={handleAuthAction}
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Esci
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleAuthAction}
                className="bg-gradient-to-r from-electric-blue-500 to-smart-purple-500 hover:from-electric-blue-600 hover:to-smart-purple-600 text-white"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Accedi
              </Button>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center space-x-2">
            {user && <NotificationCenter />}
            
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-6">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleNavigation('/')}
                    className="justify-start"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleNavigation('/services')}
                    className="justify-start"
                  >
                    Servizi
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleNavigation('/contact')}
                    className="justify-start"
                  >
                    Contatti
                  </Button>

                  {user ? (
                    <>
                      <hr className="my-4" />
                      <Button
                        variant="ghost"
                        onClick={() => handleNavigation('/dashboard')}
                        className="justify-start"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Dashboard
                      </Button>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          onClick={() => handleNavigation('/admin')}
                          className="justify-start"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Admin
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        onClick={handleAuthAction}
                        className="justify-start text-red-600"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Esci
                      </Button>
                    </>
                  ) : (
                    <>
                      <hr className="my-4" />
                      <Button
                        onClick={handleAuthAction}
                        className="bg-gradient-to-r from-electric-blue-500 to-smart-purple-500 hover:from-electric-blue-600 hover:to-smart-purple-600 text-white justify-start"
                      >
                        <LogIn className="w-4 h-4 mr-2" />
                        Accedi
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
