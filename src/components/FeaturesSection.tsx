
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Settings, ArrowUp, Home } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: Home,
      title: "Siti Web Moderni",
      description: "Creiamo siti web responsive, veloci e ottimizzati per SEO che convertono visitatori in clienti.",
      color: "from-electric-blue-500 to-electric-blue-600"
    },
    {
      icon: Settings,
      title: "App Su Misura",
      description: "Sviluppiamo applicazioni web personalizzate che automatizzano i tuoi processi aziendali.",
      color: "from-smart-purple-500 to-smart-purple-600"
    },
    {
      icon: MessageSquare,
      title: "Assistenza AI",
      description: "Il nostro assistente AI ti guida in ogni fase, dall'idea iniziale al prodotto finale.",
      color: "from-electric-blue-400 to-smart-purple-500"
    },
    {
      icon: ArrowUp,
      title: "Crescita Garantita",
      description: "I nostri progetti sono progettati per scalare e crescere insieme al tuo business.",
      color: "from-smart-purple-400 to-electric-blue-500"
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-poppins font-bold mb-6">
            Perché scegliere 
            <span className="gradient-text"> SmartFlow</span>?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Combiniamo esperienza tecnica, intelligenza artificiale e attenzione ai dettagli 
            per creare soluzioni digitali che fanno la differenza
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-2xl transition-all duration-300 border-0 glass-card hover:scale-105"
            >
              <CardContent className="p-8 text-center">
                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-poppins font-semibold mb-4 text-gray-800">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
