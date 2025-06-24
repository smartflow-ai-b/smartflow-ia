
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Briefcase, MessageSquare, Settings } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-electric-blue-50 to-smart-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="glass-card mb-6">
          <CardHeader className="space-y-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="self-start p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="text-center">
              <CardTitle className="text-2xl bg-gradient-to-r from-electric-blue-600 to-smart-purple-600 bg-clip-text text-transparent">
                Area Cliente
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Benvenuto nella tua area personale, {user?.email}
              </p>
            </div>
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-electric-blue-500" />
                I Miei Progetti
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Visualizza e gestisci tutti i tuoi progetti attivi
              </p>
              <Button 
                onClick={() => navigate('/my-projects')}
                className="w-full bg-gradient-to-r from-electric-blue-500 to-smart-purple-500 hover:from-electric-blue-600 hover:to-smart-purple-600"
              >
                Vedi Progetti
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-smart-purple-500" />
                Chat Supporto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Hai domande? Il nostro team è qui per aiutarti
              </p>
              <Button 
                onClick={() => navigate('/chat')}
                variant="outline"
                className="w-full border-smart-purple-500 text-smart-purple-600 hover:bg-smart-purple-50"
              >
                Apri Chat
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-green-500" />
                Profilo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Gestisci le informazioni del tuo account
              </p>
              <Button 
                onClick={() => navigate('/profile')}
                variant="outline"
                className="w-full"
              >
                Modifica Profilo
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-500" />
                Impostazioni
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Configura le tue preferenze
              </p>
              <Button 
                onClick={() => navigate('/settings')}
                variant="outline"
                className="w-full"
              >
                Apri Impostazioni
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
