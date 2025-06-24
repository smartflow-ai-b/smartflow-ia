
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, User, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || ''
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setProfile({
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          email: data.email || user?.email || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profile.firstName,
          last_name: profile.lastName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: "Profilo aggiornato",
        description: "Le tue informazioni sono state salvate con successo"
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il profilo",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-electric-blue-50 to-smart-purple-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="glass-card mb-6">
          <CardHeader className="space-y-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="self-start p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="text-center">
              <CardTitle className="text-2xl bg-gradient-to-r from-electric-blue-600 to-smart-purple-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
                <User className="w-6 h-6 text-electric-blue-500" />
                Il Mio Profilo
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Gestisci le informazioni del tuo account
              </p>
            </div>
          </CardHeader>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nome</Label>
                  <Input
                    id="firstName"
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    placeholder="Il tuo nome"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Cognome</Label>
                  <Input
                    id="lastName"
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    placeholder="Il tuo cognome"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-sm text-gray-500">
                  L'email non può essere modificata da qui
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-electric-blue-500 to-smart-purple-500 hover:from-electric-blue-600 hover:to-smart-purple-600"
                disabled={loading}
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Salvataggio...' : 'Salva Modifiche'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
