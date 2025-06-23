
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Home, User, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Dashboard', path: '/dashboard', icon: User },
    { name: 'Chat', path: '/chat', icon: MessageSquare },
    { name: 'Contatti', path: '/contact', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center space-x-2 cursor-pointer" 
          onClick={() => navigate('/')}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-electric-blue-500 to-smart-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">SF</span>
          </div>
          <span className="text-xl font-poppins font-semibold gradient-text">SmartFlow</span>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'text-electric-blue-600 bg-electric-blue-50'
                  : 'text-gray-600 hover:text-electric-blue-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="font-medium">{item.name}</span>
            </button>
          ))}
        </nav>

        {/* CTA Button */}
        <Button 
          onClick={() => navigate('/create-project')}
          className="bg-gradient-to-r from-electric-blue-500 to-smart-purple-500 hover:from-electric-blue-600 hover:to-smart-purple-600 text-white font-medium px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          Crea Progetto
        </Button>
      </div>
    </header>
  );
};

export default Header;
