
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface AuthLoadingScreenProps {
  loadingStep: string;
  error?: string | null;
}

const AuthLoadingScreen: React.FC<AuthLoadingScreenProps> = ({ loadingStep, error }) => {
  const getProgressValue = (step: string) => {
    const steps = [
      'Inizializzazione...',
      'Controllo sessione Supabase...',
      'Recupero dati di autenticazione locali...',
      'Verifica privilegi amministratore...',
      'Salvataggio stato autenticazione...',
      'Autenticazione completata'
    ];
    
    const currentIndex = steps.findIndex(s => step.includes(s.replace('...', '')));
    return currentIndex >= 0 ? ((currentIndex + 1) / steps.length) * 100 : 20;
  };

  const getStepIcon = (step: string) => {
    if (error) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    
    if (step.includes('completata') || step.includes('confermati') || step.includes('salvato')) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    
    return <Loader2 className="w-5 h-5 text-electric-blue-500 animate-spin" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-electric-blue-50 to-smart-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-card">
        <CardContent className="flex flex-col items-center justify-center p-8 space-y-6">
          {/* Logo */}
          <div className="w-16 h-16 bg-gradient-to-r from-electric-blue-500 to-smart-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">SF</span>
          </div>
          
          {/* Title */}
          <h2 className="text-2xl font-bold bg-gradient-to-r from-electric-blue-600 to-smart-purple-600 bg-clip-text text-transparent text-center">
            SmartFlow
          </h2>
          
          {/* Progress Bar */}
          <div className="w-full space-y-2">
            <Progress 
              value={getProgressValue(loadingStep)} 
              className="w-full h-2"
            />
            <p className="text-xs text-gray-500 text-center">
              {Math.round(getProgressValue(loadingStep))}% completato
            </p>
          </div>
          
          {/* Current Step */}
          <div className="flex items-center space-x-3 w-full">
            {getStepIcon(loadingStep)}
            <div className="flex-1">
              <p className={`text-sm font-medium ${error ? 'text-red-600' : 'text-gray-700'}`}>
                {error || loadingStep}
              </p>
            </div>
          </div>
          
          {/* Additional Info */}
          {!error && (
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              Sistema di autenticazione sicuro in caricamento.<br/>
              I tuoi dati vengono verificati e sincronizzati.
            </p>
          )}
          
          {/* Error Actions */}
          {error && (
            <div className="w-full space-y-3">
              <button 
                onClick={() => window.location.reload()} 
                className="w-full bg-gradient-to-r from-electric-blue-500 to-smart-purple-500 text-white px-4 py-2 rounded-lg hover:from-electric-blue-600 hover:to-smart-purple-600 transition-all"
              >
                Ricarica Pagina
              </button>
              <button 
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }} 
                className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all text-sm"
              >
                Reset Completo
              </button>
            </div>
          )}
          
          {/* Debug Info */}
          <details className="w-full">
            <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
              Informazioni tecniche
            </summary>
            <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
              <p>Step: {loadingStep}</p>
              <p>Timestamp: {new Date().toLocaleTimeString()}</p>
              {error && <p className="text-red-600">Errore: {error}</p>}
            </div>
          </details>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthLoadingScreen;
