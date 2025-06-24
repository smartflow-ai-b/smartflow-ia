
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Plus, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  title: string;
  description: string;
  project_type: string;
  status: string;
  created_at: string;
  budget_range: string;
  timeline: string;
}

const MyProjects = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile caricare i progetti",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completato';
      case 'in_progress':
        return 'In Corso';
      case 'pending':
        return 'In Attesa';
      default:
        return 'Sconosciuto';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-electric-blue-50 to-smart-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue-500 mx-auto mb-4"></div>
          <p>Caricamento progetti...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-electric-blue-50 to-smart-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        <Card className="glass-card mb-6">
          <CardHeader className="space-y-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="self-start p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl bg-gradient-to-r from-electric-blue-600 to-smart-purple-600 bg-clip-text text-transparent">
                  I Miei Progetti
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  Tutti i tuoi progetti in un unico posto
                </p>
              </div>
              <Button
                onClick={() => navigate('/create-project')}
                className="bg-gradient-to-r from-electric-blue-500 to-smart-purple-500 hover:from-electric-blue-600 hover:to-smart-purple-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuovo Progetto
              </Button>
            </div>
          </CardHeader>
        </Card>

        {projects.length === 0 ? (
          <Card className="glass-card text-center py-12">
            <CardContent>
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Nessun progetto ancora</h3>
                <p className="text-gray-600 mb-6">
                  Inizia creando il tuo primo progetto con SmartFlow
                </p>
                <Button
                  onClick={() => navigate('/create-project')}
                  className="bg-gradient-to-r from-electric-blue-500 to-smart-purple-500 hover:from-electric-blue-600 hover:to-smart-purple-600"
                >
                  Crea il Tuo Primo Progetto
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="glass-card hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg text-gray-800 line-clamp-1">
                      {project.title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(project.status)}
                      <Badge variant="secondary" className="text-xs">
                        {getStatusLabel(project.status)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {project.description || 'Nessuna descrizione'}
                  </p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex justify-between">
                      <span>Tipo:</span>
                      <span className="capitalize">{project.project_type}</span>
                    </div>
                    {project.budget_range && (
                      <div className="flex justify-between">
                        <span>Budget:</span>
                        <span>{project.budget_range}</span>
                      </div>
                    )}
                    {project.timeline && (
                      <div className="flex justify-between">
                        <span>Timeline:</span>
                        <span className="capitalize">{project.timeline}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Creato:</span>
                      <span>{new Date(project.created_at).toLocaleDateString('it-IT')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProjects;
