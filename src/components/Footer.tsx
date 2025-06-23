
import React from 'react';
import { MessageSquare, Home, User, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  const footerLinks = {
    'Servizi': [
      { name: 'Siti Web', path: '/services/websites' },
      { name: 'App Web', path: '/services/apps' },
      { name: 'E-commerce', path: '/services/ecommerce' },
      { name: 'Consulenza AI', path: '/services/ai-consulting' }
    ],
    'Risorse': [
      { name: 'Blog', path: '/blog' },
      { name: 'Esempi', path: '/examples' },
      { name: 'Documentazione', path: '/docs' },
      { name: 'FAQ', path: '/faq' }
    ],
    'Azienda': [
      { name: 'Chi siamo', path: '/about' },
      { name: 'Contatti', path: '/contact' },
      { name: 'Privacy', path: '/privacy' },
      { name: 'Termini', path: '/terms' }
    ]
  };

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-electric-blue-500 to-smart-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SF</span>
              </div>
              <span className="text-xl font-poppins font-semibold">SmartFlow</span>
            </div>
            <p className="text-gray-400 mb-6">
              Trasformiamo le tue idee digitali in realtà con l'aiuto dell'intelligenza artificiale.
            </p>
            <div className="flex space-x-4">
              <button 
                onClick={() => navigate('/')}
                className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Home className="w-5 h-5" />
              </button>
              <button 
                onClick={() => navigate('/dashboard')}
                className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <User className="w-5 h-5" />
              </button>
              <button 
                onClick={() => navigate('/chat')}
                className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
              </button>
              <button 
                onClick={() => navigate('/contact')}
                className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-lg mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <button
                      onClick={() => navigate(link.path)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 SmartFlow. Tutti i diritti riservati.
          </p>
          <p className="text-gray-400 text-sm mt-4 md:mt-0">
            Fatto con ❤️ e intelligenza artificiale
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
