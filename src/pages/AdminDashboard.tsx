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
      <div className="max-w-5xl mx-auto p-4 space-y-4">
        {/* Tabs */}
        <div className="flex gap-2 mb-2">
          <Button variant={activeTab === 'projects' ? 'default' : 'outline'} onClick={() => setActiveTab('projects')}>Progetti</Button>
          <Button variant={activeTab === 'users' ? 'default' : 'outline'} onClick={() => setActiveTab('users')}>Utenti</Button>
          <Button variant="outline" onClick={() => navigate('/admin/chat')}>Vai alla Chat</Button>
        </div>

        {/* Statistiche */}
        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card><CardContent className="p-4"><div className="text-center"><div className="text-2xl font-bold">{projects.length}</div><div className="text-gray-500 text-sm">Progetti totali</div></div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="text-center"><div className="text-2xl font-bold">{projects.filter(p => p.status === 'pending').length}</div><div className="text-gray-500 text-sm">In attesa</div></div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="text-center"><div className="text-2xl font-bold">{projects.filter(p => p.status === 'in_progress').length}</div><div className="text-gray-500 text-sm">In corso</div></div></CardContent></Card>
          </div>
        )}

        {/* Tab Progetti */}
        {activeTab === 'projects' && (
          <Card>
            <CardHeader><CardTitle>Gestione Progetti</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
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
                        <td className="py-2 px-2 max-w-xs truncate">{project.title}</td>
                        <td className="py-2 px-2">{project.user_profile?.first_name} {project.user_profile?.last_name}</td>
                        <td className="py-2 px-2 capitalize">{project.status === 'pending' ? 'In attesa' : project.status === 'in_progress' ? 'In corso' : project.status === 'completed' ? 'Completato' : project.status}</td>
                        <td className="py-2 px-2">
                          {project.status === 'pending' && (
                            <>
                              <Button size="sm" onClick={() => updateProjectStatus(project.id, 'in_progress')}>Accetta</Button>{' '}
                              <Button size="sm" variant="destructive" onClick={() => updateProjectStatus(project.id, 'rejected')}>Rifiuta</Button>
                            </>
                          )}
                          {project.status === 'in_progress' && (
                            <Button size="sm" onClick={() => updateProjectStatus(project.id, 'completed')}>Completa</Button>
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
            <CardContent><UserManagementInterface /></CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
