
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { ArrowLeft, User, Briefcase, MessageSquare, Settings, Plus, Clock, CheckCircle } from 'lucide-react';

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [projectStats, setProjectStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0
  });

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchProfile();
    fetchUserProjects();
  }, [user, authLoading, navigate]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchUserProjects = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        return;
      }

      const projects = data || [];
      setRecentProjects(projects.slice(0, 3));
      
      // Calculate stats
      setProjectStats({
        total: projects.length,
        pending: projects.filter(p => p.status === 'pending').length,
        inProgress: projects.filter(p => p.status === 'in_progress').length,
        completed: projects.filter(p => p.status === 'completed').length
      });
    } catch (error) {
      console.error('Error in fetchUserProjects:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completato';
      case 'in_progress': return 'In Corso';
      case 'pending': return 'In Attesa';
      default: return 'Sconosciuto';
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-electric-blue-50 to-smart-purple-50">
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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-electric-blue-50 to-smart-purple-50">
      <Header />
      <div className="p-2 sm:p-4 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-3 sm:space-y-6">
          {/* Header */}
          <Card className="glass-card">
            <CardHeader className="p-3 sm:p-6">
              <div className="text-center space-y-2 sm:space-y-3">
                <CardTitle className="text-lg sm:text-2xl bg-gradient-to-r from-electric-blue-600 to-smart-purple-600 bg-clip-text text-transparent">
                  Area Cliente
                </CardTitle>
                <p className="text-xs sm:text-base text-gray-600">
                  Benvenuto, {profile?.first_name || user?.email?.split('@')[0]}
                </p>
                {profile && (
                  <div className="p-2 sm:p-4 bg-white/50 rounded-lg text-left">
                    <h3 className="font-semibold text-gray-800 mb-2 text-xs sm:text-base">I tuoi dati:</h3>
                    <div className="space-y-1 text-xs sm:text-sm text-gray-600">
                      <p>Nome: {profile.first_name} {profile.last_name}</p>
                      <p className="break-all">Email: {profile.email}</p>
                      <p>Registrato il: {new Date(profile.created_at).toLocaleDateString('it-IT')}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>
          </Card>

          {/* Quick Actions - stack su mobile, grid su desktop */}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-2 sm:gap-4">
            <Button
              onClick={() => navigate('/create-project')}
              className="h-12 sm:h-16 bg-gradient-to-r from-electric-blue-500 to-smart-purple-500 hover:from-electric-blue-600 hover:to-smart-purple-600 text-white text-xs sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Nuovo Progetto
            </Button>
            <Button
              onClick={() => navigate('/my-projects')}
              variant="outline"
              className="h-12 sm:h-16 border-electric-blue-500 text-electric-blue-600 hover:bg-electric-blue-50 text-xs sm:text-base"
            >
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              I Miei Progetti
            </Button>
            <Button
              onClick={() => navigate('/chat')}
              variant="outline"
              className="h-12 sm:h-16 border-smart-purple-500 text-smart-purple-600 hover:bg-smart-purple-50 text-xs sm:text-base"
            >
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Chat Supporto
            </Button>
            <Button
              onClick={() => navigate('/profile')}
              variant="outline"
              className="h-12 sm:h-16 text-xs sm:text-base"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Il Mio Profilo
            </Button>
          </div>

          {/* Project Statistics - 2x2 grid su mobile, 4x1 su desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            <Card className="glass-card">
              <CardContent className="p-2 sm:p-4 text-center">
                <div className="text-lg sm:text-2xl font-bold text-gray-800">{projectStats.total}</div>
                <div className="text-xs sm:text-sm text-gray-600">Progetti Totali</div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-2 sm:p-4 text-center">
                <div className="text-lg sm:text-2xl font-bold text-yellow-600">{projectStats.pending}</div>
                <div className="text-xs sm:text-sm text-gray-600">In Attesa</div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-2 sm:p-4 text-center">
                <div className="text-lg sm:text-2xl font-bold text-blue-600">{projectStats.inProgress}</div>
                <div className="text-xs sm:text-sm text-gray-600">In Corso</div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-2 sm:p-4 text-center">
                <div className="text-lg sm:text-2xl font-bold text-green-600">{projectStats.completed}</div>
                <div className="text-xs sm:text-sm text-gray-600">Completati</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - stack su mobile, affiancato su desktop */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-6">
            {/* Recent Projects */}
            <Card className="glass-card">
              <CardHeader className="p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-electric-blue-500" />
                    Progetti Recenti
                  </CardTitle>
                  <Button
                    onClick={() => navigate('/my-projects')}
                    variant="ghost"
                    size="sm"
                    className="text-xs sm:text-sm"
                  >
                    Vedi Tutti
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                {recentProjects.length > 0 ? (
                  <div className="space-y-2 sm:space-y-3">
                    {recentProjects.map((project) => (
                      <div key={project.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 sm:p-3 bg-white/50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-800 text-xs sm:text-base truncate">{project.title}</h4>
                          <p className="text-xs sm:text-sm text-gray-600 capitalize">{project.project_type}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-0 sm:ml-2 mt-2 sm:mt-0">
                          {getStatusIcon(project.status)}
                          <span className="text-xs sm:text-sm whitespace-nowrap">{getStatusText(project.status)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 sm:py-6">
                    <Briefcase className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-3" />
                    <p className="text-gray-600 mb-2 sm:mb-4 text-xs sm:text-base">Nessun progetto ancora</p>
                    <Button
                      onClick={() => navigate('/create-project')}
                      size="sm"
                      className="bg-gradient-to-r from-electric-blue-500 to-smart-purple-500 hover:from-electric-blue-600 hover:to-smart-purple-600 text-xs sm:text-sm"
                    >
                      Crea il Primo Progetto
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Tools */}
            <Card className="glass-card">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-smart-purple-500" />
                  Strumenti Rapidi
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 sm:p-3 bg-white/50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 text-xs sm:text-base">Chat Supporto</h4>
                      <p className="text-xs sm:text-sm text-gray-600">Hai domande? Contattaci</p>
                    </div>
                    <Button
                      onClick={() => navigate('/chat')}
                      size="sm"
                      variant="outline"
                      className="ml-0 sm:ml-2 mt-2 sm:mt-0"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 sm:p-3 bg-white/50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 text-xs sm:text-base">Profilo</h4>
                      <p className="text-xs sm:text-sm text-gray-600">Gestisci le tue informazioni</p>
                    </div>
                    <Button
                      onClick={() => navigate('/profile')}
                      size="sm"
                      variant="outline"
                      className="ml-0 sm:ml-2 mt-2 sm:mt-0"
                    >
                      <User className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 sm:p-3 bg-white/50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 text-xs sm:text-base">I Miei Progetti</h4>
                      <p className="text-xs sm:text-sm text-gray-600">Visualizza tutti i progetti</p>
                    </div>
                    <Button
                      onClick={() => navigate('/my-projects')}
                      size="sm"
                      variant="outline"
                      className="ml-0 sm:ml-2 mt-2 sm:mt-0"
                    >
                      <Briefcase className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
