
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, FolderOpen } from 'lucide-react';
import ProjectTracker from '@/components/ProjectTracker';

interface Project {
  id: string;
  title: string;
  description: string;
  project_type: string;
  status: string;
  completion_percentage: number | null;
  preview_url: string | null;
  live_url: string | null;
  created_at: string;
}

const MyProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchProjects();
  }, [user, authLoading, navigate]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      const { data: projectsData, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        toast({
          title: "Errore",
          description: "Impossibile caricare i progetti",
          variant: "destructive"
        });
        return;
      }

      setProjects(projectsData || []);
      
      // Auto-select first project if none selected
      if (projectsData && projectsData.length > 0 && !selectedProject) {
        setSelectedProject(projectsData[0]);
      }
    } catch (error) {
      console.error('Error in fetchProjects:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore imprevisto",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'In Attesa';
      case 'in_progress': return 'In Corso';
      case 'completed': return 'Completato';
      case 'rejected': return 'Rifiutato';
      default: return status;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue-500 mx-auto mb-4"></div>
          <p>Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-electric-blue-50 to-smart-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Card className="glass-card mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="p-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <CardTitle className="text-2xl bg-gradient-to-r from-electric-blue-600 to-smart-purple-600 bg-clip-text text-transparent">
                I Miei Progetti
              </CardTitle>
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Projects List */}
          <Card className="glass-card lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">I Tuoi Progetti</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-electric-blue-500 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Caricamento...</p>
                </div>
              ) : projects.length === 0 ? (
                <div className="p-4 text-center">
                  <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-4">Nessun progetto trovato</p>
                  <Button
                    onClick={() => navigate('/create-project')}
                    size="sm"
                    className="bg-gradient-to-r from-electric-blue-500 to-smart-purple-500"
                  >
                    Crea il tuo primo progetto
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 p-4">
                  {projects.map((project) => (
                    <Card
                      key={project.id}
                      className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                        selectedProject?.id === project.id ? 'ring-2 ring-electric-blue-500' : ''
                      }`}
                      onClick={() => setSelectedProject(project)}
                    >
                      <CardContent className="p-3">
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm line-clamp-2">
                            {project.title}
                          </h4>
                          <Badge className={getStatusColor(project.status)}>
                            {getStatusText(project.status)}
                          </Badge>
                          <p className="text-xs text-gray-500">
                            {new Date(project.created_at).toLocaleDateString('it-IT')}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Project Details */}
          <div className="lg:col-span-3">
            {selectedProject ? (
              <ProjectTracker project={selectedProject} />
            ) : (
              <Card className="glass-card">
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Seleziona un Progetto</h3>
                    <p className="text-gray-600">
                      Scegli un progetto dalla lista per visualizzare i dettagli
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProjects;
