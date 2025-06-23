
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const ProcessSection = () => {
  const steps = [
    {
      number: "01",
      title: "Scegli la tipologia",
      description: "Seleziona se vuoi un sito web, un'app o entrambi. Il nostro sistema ti guiderà verso la soluzione migliore.",
      color: "bg-electric-blue-500"
    },
    {
      number: "02", 
      title: "Descrivi la tua visione",
      description: "Racconta la tua idea attraverso il nostro form guidato. L'AI ti aiuterà a definire obiettivi e funzionalità.",
      color: "bg-smart-purple-500"
    },
    {
      number: "03",
      title: "Piano di lavoro personalizzato", 
      description: "Ricevi un piano dettagliato con tempistiche, preview e aggiornamenti in tempo reale sul progresso.",
      color: "bg-electric-blue-600"
    },
    {
      number: "04",
      title: "Sviluppo e lancio",
      description: "Il tuo progetto prende vita! Monitora i progressi, fornisci feedback e celebra il risultato finale.",
      color: "bg-smart-purple-600"
    }
  ];

  return (
    <section className="py-24 gradient-bg">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-poppins font-bold mb-6">
            Come funziona
            <span className="gradient-text"> SmartFlow</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Un processo semplice e trasparente che ti accompagna dall'idea al prodotto finale
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative mb-12 last:mb-0">
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute left-8 top-20 w-0.5 h-24 bg-gradient-to-b from-gray-300 to-transparent"></div>
              )}
              
              <Card className="glass-card hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    {/* Step number */}
                    <div className={`flex-shrink-0 w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                      {step.number}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-2xl font-poppins font-semibold mb-3 text-gray-800">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 text-lg leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
