
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import { ArrowLeft, Users, FolderOpen, MessageSquare, Crown, Settings, UserCheck } from 'lucide-react';
import AdminChatInterface from '@/components/AdminChatInterface';
import UserManagementInterface from '@/components/UserManagementInterface';

interface Project {
  id: string;
  title: string;
  description: string;
  project_type: string;
  budget_range: string;
  timeline: string;
  status: string;
  created_at: string;
  user_profile?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
}

const AdminDashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    console.log('AdminDashboard useEffect - Auth state:', { 
      user: user?.email, 
      isAdmin, 
      authLoading 
    });
    
    // Wait for auth to finish loading
    if (authLoading) {
      console.log('Auth still loading, waiting...');
      return;
    }
    
    // Check if user is logged in
    if (!user) {
      console.log('No user found, redirecting to auth');
      navigate('/auth');
      return;
    }
    
    // Check if user is admin
    if (!isAdmin) {
      console.log('User is not admin, redirecting to home');
      navigate('/');
      return;
    }
    
    // User is authenticated and admin, fetch projects
    console.log('User is admin, fetching projects');
    fetchProjects();
  }, [user, isAdmin, authLoading, navigate]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      console.log('Fetching projects...');
      
      // First get all projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
        toast({
          title: "Errore",
          description: "Impossibile caricare i progetti",
          variant: "destructive"
        });
        return;
      }

      console.log('Projects fetched:', projectsData?.length || 0);

      // Then get user profiles for each project
      const projectsWithProfiles = await Promise.all(
        (projectsData || []).map(async (project) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('first_name, last_name, email')
            .eq('id', project.user_id)
            .single();

          return {
            ...project,
            user_profile: profileData
          };
        })
      );

      setProjects(projectsWithProfiles);
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

  const updateProjectStatus = async (projectId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', projectId);

      if (error) {
        toast({
          title: "Errore",
          description: "Impossibile aggiornare lo stato",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Aggiornato",
          description: "Stato del progetto aggiornato con successo"
        });
        fetchProjects();
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore imprevisto",
        variant: "destructive"
      });
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

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue-500 mx-auto mb-4"></div>
            <p>Caricamento...</p>
          </div>
        </div>
      </div>
    );
  }

  // Don't render anything if user is not authenticated or not admin (useEffect will handle redirect)
  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-electric-blue-50 to-smart-purple-50">
      <Header />
      <div className="p-3 sm:p-4 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          {/* Header */}
          <Card className="glass-card">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
                  <CardTitle className="text-lg sm:text-2xl bg-gradient-to-r from-electric-blue-600 to-smart-purple-600 bg-clip-text text-transparent">
                    Dashboard Amministratore
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Admin Tools Navigation - Responsive Grid */}
          <Card className="glass-card">
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                <Button
                  onClick={() => setActiveTab('overview')}
                  variant={activeTab === 'overview' ? 'default' : 'outline'}
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 h-10 sm:h-auto"
                >
                  <FolderOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Panoramica</span>
                  <span className="sm:hidden">Overview</span>
                </Button>
                <Button
                  onClick={() => setActiveTab('projects')}
                  variant={activeTab === 'projects' ? 'default' : 'outline'}
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 h-10 sm:h-auto"
                >
                  <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Gestione Progetti</span>
                  <span className="sm:hidden">Progetti</span>
                </Button>
                <Button
                  onClick={() => setActiveTab('chat')}
                  variant={activeTab === 'chat' ? 'default' : 'outline'}
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 h-10 sm:h-auto"
                >
                  <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Gestione Chat</span>
                  <span className="sm:hidden">Chat</span>
                </Button>
                <Button
                  onClick={() => setActiveTab('users')}
                  variant={activeTab === 'users' ? 'default' : 'outline'}
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 h-10 sm:h-auto"
                >
                  <UserCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Gestione Utenti</span>
                  <span className="sm:hidden">Utenti</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Chat Management */}
          {activeTab === 'chat' && (
            <Card className="glass-card">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg">Gestione Chat</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <AdminChatInterface />
              </CardContent>
            </Card>
          )}

          {/* Users Management */}
          {activeTab === 'users' && (
            <Card className="glass-card">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg">Gestione Utenti</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <UserManagementInterface />
              </CardContent>
            </Card>
          )}

          {/* Overview Stats */}
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <Card className="glass-card">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <FolderOpen className="w-6 h-6 sm:w-8 sm:h-8 text-electric-blue-500 shrink-0" />
                      <div>
                        <p className="text-xl sm:text-2xl font-bold">{projects.length}</p>
                        <p className="text-sm sm:text-base text-gray-600">Progetti Totali</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <Users className="w-6 h-6 sm:w-8 sm:h-8 text-smart-purple-500 shrink-0" />
                      <div>
                        <p className="text-xl sm:text-2xl font-bold">{projects.filter(p => p.status === 'pending').length}</p>
                        <p className="text-sm sm:text-base text-gray-600">In Attesa</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 shrink-0" />
                      <div>
                        <p className="text-xl sm:text-2xl font-bold">{projects.filter(p => p.status === 'in_progress').length}</p>
                        <p className="text-sm sm:text-base text-gray-600">In Corso</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Projects Overview */}
              <Card className="glass-card">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base sm:text-lg">Progetti Recenti</CardTitle>
                    <Button
                      onClick={() => setActiveTab('projects')}
                      variant="outline"
                      size="sm"
                      className="text-xs sm:text-sm"
                    >
                      Vedi Tutti
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="space-y-3 sm:space-y-4">
                    {projects.slice(0, 5).map((project) => (
                      <Card key={project.id} className="border">
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm sm:text-base truncate">{project.title}</h4>
                              <p className="text-xs sm:text-sm text-gray-600 truncate">
                                {project.user_profile?.first_name} {project.user_profile?.last_name}
                              </p>
                            </div>
                            <Badge className={`${getStatusColor(project.status)} shrink-0`}>
                              {getStatusText(project.status)}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Projects Management */}
          {activeTab === 'projects' && (
            <Card className="glass-card">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg">Gestione Progetti</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="space-y-3 sm:space-y-4">
                  {projects.map((project) => (
                    <Card key={project.id} className="border">
                      <CardContent className="p-4 sm:p-6">
                        <div className="space-y-3 sm:space-y-4">
                          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-3">
                            <div className="flex-1 space-y-2">
                              <h3 className="font-semibold text-base sm:text-lg">{project.title}</h3>
                              <p className="text-sm sm:text-base text-gray-600 line-clamp-2">{project.description}</p>
                              <div className="flex flex-wrap gap-1 sm:gap-2">
                                <Badge variant="outline" className="text-xs">{project.project_type}</Badge>
                                {project.budget_range && <Badge variant="outline" className="text-xs">{project.budget_range}</Badge>}
                                {project.timeline && <Badge variant="outline" className="text-xs">{project.timeline}</Badge>}
                              </div>
                              <div className="space-y-1 text-xs sm:text-sm text-gray-500">
                                <p className="break-all">
                                  Cliente: {project.user_profile?.first_name || 'N/A'} {project.user_profile?.last_name || ''} ({project.user_profile?.email || 'Email non disponibile'})
                                </p>
                                <p>
                                  Creato: {new Date(project.created_at).toLocaleDateString('it-IT')}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-start lg:items-end gap-2">
                              <Badge className={getStatusColor(project.status)}>
                                {getStatusText(project.status)}
                              </Badge>
                              <div className="flex flex-wrap gap-2">
                                {project.status === 'pending' && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => updateProjectStatus(project.id, 'in_progress')}
                                      className="bg-blue-500 hover:bg-blue-600 text-xs sm:text-sm"
                                    >
                                      Accetta
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => updateProjectStatus(project.id, 'rejected')}
                                      className="text-xs sm:text-sm"
                                    >
                                      Rifiuta
                                    </Button>
                                  </>
                                )}
                                {project.status === 'in_progress' && (
                                  <Button
                                    size="sm"
                                    onClick={() => updateProjectStatus(project.id, 'completed')}
                                    className="bg-green-500 hover:bg-green-600 text-xs sm:text-sm"
                                  >
                                    Completa
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {projects.length === 0 && !loading && (
                    <p className="text-center text-gray-500 py-8 text-sm sm:text-base">Nessun progetto trovato</p>
                  )}
                  {loading && (
                    <p className="text-center text-gray-500 py-8 text-sm sm:text-base">Caricamento progetti...</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
