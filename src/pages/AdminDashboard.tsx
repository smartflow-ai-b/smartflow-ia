import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import AdminChatInterface from '@/components/AdminChatInterface';
import UserManagementInterface from '@/components/UserManagementInterface';

interface Project {
  id: string;
  title: string;
  description: string;
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
  const [activeTab, setActiveTab] = useState<'projects' | 'users' | 'chat'>('projects');
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (authLoading) return;
    if (!user) return navigate('/auth');
    if (!isAdmin) return navigate('/');
    fetchProjects();
  }, [user, isAdmin, authLoading, navigate]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      if (projectsError) {
        toast({ title: 'Errore', description: 'Impossibile caricare i progetti', variant: 'destructive' });
        return;
      }
      const projectsWithProfiles = await Promise.all(
        (projectsData || []).map(async (project) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('first_name, last_name, email')
            .eq('id', project.user_id)
            .single();
          return { ...project, user_profile: profileData };
        })
      );
      setProjects(projectsWithProfiles);
    } catch {
      toast({ title: 'Errore', description: 'Si è verificato un errore', variant: 'destructive' });
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
        toast({ title: 'Errore', description: 'Impossibile aggiornare lo stato', variant: 'destructive' });
      } else {
        fetchProjects();
      }
    } catch {}
  };

  if (authLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-[50vh]">
          Caricamento...
        </div>
      </div>
    );
  }
  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-5xl mx-auto p-2 sm:p-4 space-y-3 sm:space-y-4">
        {/* Tabs - stack su mobile, row su desktop */}
        <div className="flex flex-col sm:flex-row gap-2 mb-2">
          <Button className="w-full sm:w-auto" variant={activeTab === 'projects' ? 'default' : 'outline'} onClick={() => setActiveTab('projects')}>Progetti</Button>
          <Button className="w-full sm:w-auto" variant={activeTab === 'users' ? 'default' : 'outline'} onClick={() => setActiveTab('users')}>Utenti</Button>
          <Button className="w-full sm:w-auto" variant="outline" onClick={() => navigate('/admin/chat')}>Vai alla Chat</Button>
        </div>

        {/* Statistiche - stack su mobile, row su desktop */}
        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
            <Card><CardContent className="p-3 sm:p-4"><div className="text-center"><div className="text-xl sm:text-2xl font-bold">{projects.length}</div><div className="text-gray-500 text-xs sm:text-sm">Progetti totali</div></div></CardContent></Card>
            <Card><CardContent className="p-3 sm:p-4"><div className="text-center"><div className="text-xl sm:text-2xl font-bold">{projects.filter(p => p.status === 'pending').length}</div><div className="text-gray-500 text-xs sm:text-sm">In attesa</div></div></CardContent></Card>
            <Card><CardContent className="p-3 sm:p-4"><div className="text-center"><div className="text-xl sm:text-2xl font-bold">{projects.filter(p => p.status === 'in_progress').length}</div><div className="text-gray-500 text-xs sm:text-sm">In corso</div></div></CardContent></Card>
          </div>
        )}

        {/* Tab Progetti - tabella scrollabile su mobile */}
        {activeTab === 'projects' && (
          <Card>
            <CardHeader><CardTitle>Gestione Progetti</CardTitle></CardHeader>
            <CardContent>
              {/* Mobile: Card view */}
              <div className="block sm:hidden space-y-3">
                {projects.length === 0 && !loading && (
                  <div className="text-center text-gray-500 py-8">Nessun progetto trovato</div>
                )}
                {loading && (
                  <div className="text-center text-gray-500 py-8">Caricamento progetti...</div>
                )}
                {projects.map((project) => (
                  <div key={project.id} className="rounded-lg border border-gray-200 bg-white shadow-sm p-4 flex flex-col gap-2">
                    <div className="font-semibold text-base text-gray-800 truncate">{project.title}</div>
                    <div className="text-xs text-gray-500">Cliente: {project.user_profile?.first_name} {project.user_profile?.last_name}</div>
                    <div className="text-xs text-gray-500">Stato: <span className="capitalize font-medium">{project.status === 'pending' ? 'In attesa' : project.status === 'in_progress' ? 'In corso' : project.status === 'completed' ? 'Completato' : project.status}</span></div>
                    <div className="flex gap-2 mt-2">
                      {project.status === 'pending' && (
                        <>
                          <Button size="sm" className="flex-1" onClick={() => updateProjectStatus(project.id, 'in_progress')}>Accetta</Button>
                          <Button size="sm" className="flex-1" variant="destructive" onClick={() => updateProjectStatus(project.id, 'rejected')}>Rifiuta</Button>
                        </>
                      )}
                      {project.status === 'in_progress' && (
                        <Button size="sm" className="flex-1" onClick={() => updateProjectStatus(project.id, 'completed')}>Completa</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {/* Desktop: Table view */}
              <div className="hidden sm:block overflow-x-auto rounded-md border border-gray-100 mt-2">
                <table className="min-w-[500px] w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 px-2 text-left">Titolo</th>
                      <th className="py-2 px-2 text-left">Cliente</th>
                      <th className="py-2 px-2 text-left">Stato</th>
                      <th className="py-2 px-2 text-left">Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project) => (
                      <tr key={project.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2 max-w-[120px] sm:max-w-xs truncate">{project.title}</td>
                        <td className="py-2 px-2">{project.user_profile?.first_name} {project.user_profile?.last_name}</td>
                        <td className="py-2 px-2 capitalize">{project.status === 'pending' ? 'In attesa' : project.status === 'in_progress' ? 'In corso' : project.status === 'completed' ? 'Completato' : project.status}</td>
                        <td className="py-2 px-2 flex flex-col gap-1 sm:flex-row sm:gap-2">
                          {project.status === 'pending' && (
                            <>
                              <Button size="sm" className="w-full sm:w-auto" onClick={() => updateProjectStatus(project.id, 'in_progress')}>Accetta</Button>
                              <Button size="sm" className="w-full sm:w-auto" variant="destructive" onClick={() => updateProjectStatus(project.id, 'rejected')}>Rifiuta</Button>
                            </>
                          )}
                          {project.status === 'in_progress' && (
                            <Button size="sm" className="w-full sm:w-auto" onClick={() => updateProjectStatus(project.id, 'completed')}>Completa</Button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {projects.length === 0 && !loading && (
                      <tr><td colSpan={4} className="text-center text-gray-500 py-8">Nessun progetto trovato</td></tr>
                    )}
                    {loading && (
                      <tr><td colSpan={4} className="text-center text-gray-500 py-8">Caricamento progetti...</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab Utenti */}
        {activeTab === 'users' && (
          <Card>
            <CardHeader><CardTitle>Gestione Utenti</CardTitle></CardHeader>
            <CardContent>
              {/* Mobile: Card view */}
              <div className="block sm:hidden">
                <UserManagementInterface mobile />
              </div>
              {/* Desktop: Table or classic view */}
              <div className="hidden sm:block">
                <UserManagementInterface />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
