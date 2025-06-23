
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Sparkles } from 'lucide-react';

const CreateProject = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectType, setProjectType] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [timeline, setTimeline] = useState('');
  const [requirements, setRequirements] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('projects')
        .insert([
          {
            user_id: user.id,
            title,
            description,
            project_type: projectType,
            budget_range: budgetRange,
            timeline,
            requirements,
            status: 'pending'
          }
        ]);

      if (error) {
        toast({
          title: "Errore",
          description: "Impossibile creare il progetto. Riprova.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Progetto creato!",
          description: "Il tuo progetto è stato inviato con successo. Ti contatteremo presto!"
        });
        navigate('/');
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore imprevisto",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Caricamento...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-electric-blue-50 to-smart-purple-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="glass-card">
          <CardHeader className="space-y-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="self-start p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="text-center">
              <CardTitle className="text-2xl bg-gradient-to-r from-electric-blue-600 to-smart-purple-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
                <Sparkles className="w-6 h-6 text-electric-blue-500" />
                Crea il Tuo Progetto
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Raccontaci la tua idea e ti aiuteremo a realizzarla
              </p>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Titolo del Progetto *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Es. Sito web per la mia azienda"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrizione</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descrivi brevemente il tuo progetto..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectType">Tipo di Progetto *</Label>
                <Select value={projectType} onValueChange={setProjectType} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona il tipo di progetto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Sito Web</SelectItem>
                    <SelectItem value="ecommerce">E-commerce</SelectItem>
                    <SelectItem value="webapp">App Web</SelectItem>
                    <SelectItem value="landing">Landing Page</SelectItem>
                    <SelectItem value="blog">Blog</SelectItem>
                    <SelectItem value="portfolio">Portfolio</SelectItem>
                    <SelectItem value="other">Altro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget Previsto</Label>
                  <Select value={budgetRange} onValueChange={setBudgetRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona budget" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="500-1000">€500 - €1.000</SelectItem>
                      <SelectItem value="1000-2500">€1.000 - €2.500</SelectItem>
                      <SelectItem value="2500-5000">€2.500 - €5.000</SelectItem>
                      <SelectItem value="5000+">€5.000+</SelectItem>
                      <SelectItem value="da-definire">Da definire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeline">Tempistiche</Label>
                  <Select value={timeline} onValueChange={setTimeline}>
                    <SelectTrigger>
                      <SelectValue placeholder="Quando serve?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgente">Urgente (1-2 settimane)</SelectItem>
                      <SelectItem value="normale">Normale (1 mese)</SelectItem>
                      <SelectItem value="flessibile">Flessibile (2-3 mesi)</SelectItem>
                      <SelectItem value="non-urgente">Non urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Requisiti Specifici</Label>
                <Textarea
                  id="requirements"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="Funzionalità specifiche, integrazioni, design particolare..."
                  rows={4}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-electric-blue-500 to-smart-purple-500 hover:from-electric-blue-600 hover:to-smart-purple-600 text-lg py-6"
                disabled={loading}
              >
                {loading ? 'Invio in corso...' : 'Invia Progetto 🚀'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateProject;
