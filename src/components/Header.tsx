
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Crown } from 'lucide-react';

const Header = () => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    if (isAdmin) {
      navigate('/admin');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div 
            className={`text-2xl font-bold bg-gradient-to-r from-electric-blue-600 to-smart-purple-600 bg-clip-text text-transparent ${isAdmin ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
            onClick={handleLogoClick}
          >
            SmartFlow
            {isAdmin && <Crown className="inline-block w-5 h-5 ml-2 text-yellow-500" />}
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-700 hover:text-electric-blue-600 transition-colors">Features</a>
            <a href="#process" className="text-gray-700 hover:text-electric-blue-600 transition-colors">Processo</a>
            <a href="#contact" className="text-gray-700 hover:text-electric-blue-600 transition-colors">Contatti</a>
          </nav>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>Ciao!</span>
                </div>
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => navigate('/auth')}
                variant="outline"
                className="border-electric-blue-500 text-electric-blue-600 hover:bg-electric-blue-50"
              >
                Accedi
              </Button>
            )}
            <Button 
              onClick={() => navigate('/create-project')}
              className="bg-gradient-to-r from-electric-blue-500 to-smart-purple-500 hover:from-electric-blue-600 hover:to-smart-purple-600 text-white"
            >
              Crea Progetto
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
