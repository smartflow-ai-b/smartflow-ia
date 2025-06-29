
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const AuthLoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-electric-blue-50 to-smart-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-card">
        <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
          <div className="w-12 h-12 bg-gradient-to-r from-electric-blue-500 to-smart-purple-500 rounded-lg flex items-center justify-center animate-pulse">
            <span className="text-white font-bold text-lg">SF</span>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-electric-blue-600 to-smart-purple-600 bg-clip-text text-transparent">
            SmartFlow
          </h2>
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-electric-blue-500"></div>
            <p className="text-gray-600">Caricamento sicuro in corso...</p>
          </div>
          <p className="text-sm text-gray-500 text-center">
            Stiamo verificando le tue credenziali e preparando l'ambiente sicuro
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthLoadingScreen;
