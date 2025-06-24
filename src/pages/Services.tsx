
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArrowRight, Globe, Smartphone, ShoppingCart, Bot } from 'lucide-react';

const Services = () => {
  const navigate = useNavigate();

  const services = [
    {
      icon: Globe,
      title: 'Siti Web',
      description: 'Siti web moderni, responsive e ottimizzati per i motori di ricerca',
      features: ['Design responsive', 'SEO ottimizzato', 'Performance elevate', 'CMS integrato'],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Smartphone,
      title: 'App Web',
      description: 'Applicazioni web progressive (PWA) con esperienza mobile ottimale',
      features: ['Funziona offline', 'Installabile', 'Notifiche push', 'Sincronizzazione dati'],
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: ShoppingCart,
      title: 'E-commerce',
      description: 'Piattaforme e-commerce complete per vendere online',
      features: ['Gestione inventario', 'Pagamenti sicuri', 'Analytics integrato', 'Multi-device'],
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Bot,
      title: 'Consulenza AI',
      description: 'Integrazione di intelligenza artificiale nei tuoi processi business',
      features: ['Automazione processi', 'Chatbot intelligenti', 'Analisi predittiva', 'ML personalizzato'],
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="bg-gradient-to-br from-electric-blue-50 to-smart-purple-50">
        {/* Hero Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-electric-blue-600 to-smart-purple-600 bg-clip-text text-transparent mb-6">
              I Nostri Servizi
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Trasformiamo le tue idee digitali in soluzioni concrete con l'aiuto dell'intelligenza artificiale
            </p>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {services.map((service, index) => {
                const IconComponent = service.icon;
                return (
                  <Card key={index} className="glass-card hover:shadow-xl transition-shadow duration-300">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${service.color} flex items-center justify-center mb-4`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-2xl text-gray-800">
                        {service.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-6">
                        {service.description}
                      </p>
                      <ul className="space-y-2 mb-6">
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center text-sm text-gray-600">
                            <div className="w-2 h-2 bg-electric-blue-500 rounded-full mr-3"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button
                        onClick={() => navigate('/create-project')}
                        className="w-full bg-gradient-to-r from-electric-blue-500 to-smart-purple-500 hover:from-electric-blue-600 hover:to-smart-purple-600"
                      >
                        Richiedi Preventivo
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <Card className="glass-card max-w-4xl mx-auto">
              <CardContent className="p-12">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Pronto a iniziare il tuo progetto?
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  Contattaci per una consulenza gratuita e scopri come possiamo aiutarti
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => navigate('/create-project')}
                    size="lg"
                    className="bg-gradient-to-r from-electric-blue-500 to-smart-purple-500 hover:from-electric-blue-600 hover:to-smart-purple-600"
                  >
                    Crea Progetto
                  </Button>
                  <Button
                    onClick={() => navigate('/contact')}
                    variant="outline"
                    size="lg"
                  >
                    Contattaci
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Services;
