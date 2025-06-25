
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
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
      <div className="min-h-screen bg-gradient-to-br from-electric-blue-50 to-smart-purple-50 flex items-center justify-center">
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
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
                Benvenuto nella tua area personale, {profile?.first_name || user?.email?.split('@')[0]}
              </p>
              {profile && (
                <div className="mt-4 p-4 bg-white/50 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">I tuoi dati:</h3>
                  <p className="text-sm text-gray-600">Nome: {profile.first_name} {profile.last_name}</p>
                  <p className="text-sm text-gray-600">Email: {profile.email}</p>
                  <p className="text-sm text-gray-600">Registrato il: {new Date(profile.created_at).toLocaleDateString('it-IT')}</p>
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Button
            onClick={() => navigate('/create-project')}
            className="h-16 bg-gradient-to-r from-electric-blue-500 to-smart-purple-500 hover:from-electric-blue-600 hover:to-smart-purple-600 text-white"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nuovo Progetto
          </Button>
          <Button
            onClick={() => navigate('/my-projects')}
            variant="outline"
            className="h-16 border-electric-blue-500 text-electric-blue-600 hover:bg-electric-blue-50"
          >
            <Briefcase className="w-5 h-5 mr-2" />
            I Miei Progetti
          </Button>
          <Button
            onClick={() => navigate('/chat')}
            variant="outline"
            className="h-16 border-smart-purple-500 text-smart-purple-600 hover:bg-smart-purple-50"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Chat Supporto
          </Button>
          <Button
            onClick={() => navigate('/profile')}
            variant="outline"
            className="h-16"
          >
            <User className="w-5 h-5 mr-2" />
            Il Mio Profilo
          </Button>
        </div>

        {/* Project Statistics */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-800">{projectStats.total}</div>
              <div className="text-sm text-gray-600">Progetti Totali</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{projectStats.pending}</div>
              <div className="text-sm text-gray-600">In Attesa</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{projectStats.inProgress}</div>
              <div className="text-sm text-gray-600">In Corso</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{projectStats.completed}</div>
              <div className="text-sm text-gray-600">Completati</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Projects */}
          <Card className="glass-card">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-electric-blue-500" />
                  Progetti Recenti
                </CardTitle>
                <Button
                  onClick={() => navigate('/my-projects')}
                  variant="ghost"
                  size="sm"
                >
                  Vedi Tutti
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentProjects.length > 0 ? (
                <div className="space-y-3">
                  {recentProjects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{project.title}</h4>
                        <p className="text-sm text-gray-600 capitalize">{project.project_type}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(project.status)}
                        <span className="text-sm">{getStatusText(project.status)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">Nessun progetto ancora</p>
                  <Button
                    onClick={() => navigate('/create-project')}
                    size="sm"
                    className="bg-gradient-to-r from-electric-blue-500 to-smart-purple-500 hover:from-electric-blue-600 hover:to-smart-purple-600"
                  >
                    Crea il Primo Progetto
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Tools */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-smart-purple-500" />
                Strumenti Rapidi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-800">Chat Supporto</h4>
                    <p className="text-sm text-gray-600">Hai domande? Contattaci</p>
                  </div>
                  <Button
                    onClick={() => navigate('/chat')}
                    size="sm"
                    variant="outline"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-800">Profilo</h4>
                    <p className="text-sm text-gray-600">Gestisci le tue informazioni</p>
                  </div>
                  <Button
                    onClick={() => navigate('/profile')}
                    size="sm"
                    variant="outline"
                  >
                    <User className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-800">I Miei Progetti</h4>
                    <p className="text-sm text-gray-600">Visualizza tutti i progetti</p>
                  </div>
                  <Button
                    onClick={() => navigate('/my-projects')}
                    size="sm"
                    variant="outline"
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
  );
};

export default Dashboard;
