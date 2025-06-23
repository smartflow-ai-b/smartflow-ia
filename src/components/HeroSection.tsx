
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowDown, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center gradient-bg overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-electric-blue-200/30 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-32 right-20 w-48 h-48 bg-smart-purple-200/30 rounded-full blur-xl animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-electric-blue-300/20 rounded-full blur-lg animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Main headline */}
          <h1 className="text-5xl md:text-7xl font-poppins font-bold mb-6 animate-fade-in">
            Trasforma le tue
            <span className="block gradient-text">idee digitali</span> 
            in realtà
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto animate-fade-in" style={{animationDelay: '0.2s'}}>
            SmartFlow combina intelligenza artificiale e sviluppo su misura per creare 
            <strong className="text-electric-blue-600"> siti web e app </strong> 
            che superano le tue aspettative
          </p>

          {/* Value propositions */}
          <div className="flex flex-wrap justify-center gap-4 mb-12 animate-fade-in" style={{animationDelay: '0.4s'}}>
            <div className="glass-card px-6 py-3 rounded-full">
              <span className="text-gray-700 font-medium">✨ Guidato dall'AI</span>
            </div>
            <div className="glass-card px-6 py-3 rounded-full">
              <span className="text-gray-700 font-medium">🚀 Sviluppo rapido</span>
            </div>
            <div className="glass-card px-6 py-3 rounded-full">
              <span className="text-gray-700 font-medium">🎯 100% personalizzato</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fade-in" style={{animationDelay: '0.6s'}}>
            <Button 
              size="lg"
              onClick={() => navigate('/create-project')}
              className="bg-gradient-to-r from-electric-blue-500 to-smart-purple-500 hover:from-electric-blue-600 hover:to-smart-purple-600 text-white font-semibold px-8 py-4 rounded-xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 text-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Crea il tuo progetto ora
            </Button>
            
            <Button 
              variant="outline"
              size="lg"
              onClick={() => navigate('/examples')}
              className="border-2 border-electric-blue-200 text-electric-blue-600 hover:bg-electric-blue-50 font-semibold px-8 py-4 rounded-xl transition-all text-lg"
            >
              Vedi esempi di lavori
            </Button>
          </div>

          {/* Scroll indicator */}
          <div className="animate-fade-in" style={{animationDelay: '0.8s'}}>
            <ArrowDown className="w-6 h-6 mx-auto text-gray-400 animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
