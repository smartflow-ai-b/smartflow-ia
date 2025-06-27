
import React from 'react';
import { Button } from './ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { LogIn, LogOut, Settings, User, Home } from 'lucide-react';
import NotificationCenter from './NotificationCenter';

const Header = () => {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleAuthAction = async () => {
    if (user) {
      await signOut();
      navigate('/');
    } else {
      navigate('/auth');
    }
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

          <div className="flex items-center space-x-4">
            {user && <NotificationCenter />}
            
            {user ? (
              <div className="flex items-center space-x-3">
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/admin')}
                    className="hidden sm:flex"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/dashboard')}
                  className="hidden sm:flex"
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
                  <span className="hidden sm:inline">Esci</span>
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
        </div>
      </div>
    </header>
  );
};

export default Header;
