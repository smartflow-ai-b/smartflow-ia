
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useProjectTracking } from '@/hooks/useProjectTracking';
import { useAuth } from '@/hooks/useAuth';
import { 
  Clock, 
  FileText, 
  Link, 
  Eye, 
  Calendar,
  MessageSquare,
  Plus,
  Download,
  ExternalLink
} from 'lucide-react';

interface ProjectTrackerProps {
  project: {
    id: string;
    title: string;
    status: string;
    completion_percentage: number | null;
    preview_url: string | null;
    live_url: string | null;
    created_at: string;
  };
}

const ProjectTracker: React.FC<ProjectTrackerProps> = ({ project }) => {
  const { updates, files, addUpdate, isAddingUpdate } = useProjectTracking(project.id);
  const { isAdmin } = useAuth();
  const [newUpdateTitle, setNewUpdateTitle] = useState('');
  const [newUpdateMessage, setNewUpdateMessage] = useState('');

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

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'status_change': return <Clock className="w-4 h-4" />;
      case 'file_upload': return <FileText className="w-4 h-4" />;
      case 'milestone': return <Calendar className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const handleAddUpdate = () => {
    if (!newUpdateTitle.trim()) return;

    addUpdate({
      title: newUpdateTitle,
      message: newUpdateMessage,
      updateType: 'message'
    });

    setNewUpdateTitle('');
    setNewUpdateMessage('');
  };

  return (
    <div className="space-y-6">
      {/* Project Status */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{project.title}</CardTitle>
            <Badge className={getStatusColor(project.status)}>
              {getStatusText(project.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Progress */}
            <div>
              <h3 className="font-semibold mb-2">Progresso Completamento</h3>
              <div className="space-y-2">
                <Progress value={project.completion_percentage || 0} className="w-full" />
                <p className="text-sm text-gray-600">
                  {project.completion_percentage || 0}% completato
                </p>
              </div>
            </div>

            {/* Links */}
            <div className="space-y-3">
              <h3 className="font-semibold mb-2">Collegamenti</h3>
              <div className="space-y-2">
                {project.preview_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => window.open(project.preview_url!, '_blank')}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Anteprima Progetto
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </Button>
                )}
                {project.live_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => window.open(project.live_url!, '_blank')}
                  >
                    <Link className="w-4 h-4 mr-2" />
                    Sito Live
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </Button>
                )}
                {!project.preview_url && !project.live_url && (
                  <p className="text-sm text-gray-500">Nessun collegamento disponibile</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Updates */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Aggiornamenti Progetto</CardTitle>
              {isAdmin && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Aggiungi
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nuovo Aggiornamento</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Titolo</label>
                        <Input
                          value={newUpdateTitle}
                          onChange={(e) => setNewUpdateTitle(e.target.value)}
                          placeholder="Titolo dell'aggiornamento"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Messaggio</label>
                        <Textarea
                          value={newUpdateMessage}
                          onChange={(e) => setNewUpdateMessage(e.target.value)}
                          placeholder="Descrizione dell'aggiornamento"
                          rows={3}
                        />
                      </div>
                      <Button
                        onClick={handleAddUpdate}
                        disabled={isAddingUpdate || !newUpdateTitle.trim()}
                        className="w-full"
                      >
                        Aggiungi Aggiornamento
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {updates.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">
                    Nessun aggiornamento disponibile
                  </p>
                ) : (
                  updates.map((update) => (
                    <Card key={update.id} className="border">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          {getUpdateIcon(update.update_type)}
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{update.title}</h4>
                            {update.message && (
                              <p className="text-xs text-gray-600 mt-1">
                                {update.message}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(update.created_at).toLocaleString('it-IT')}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Project Files */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>File del Progetto</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {files.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">
                    Nessun file disponibile
                  </p>
                ) : (
                  files.map((file) => (
                    <Card key={file.id} className="border">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <div>
                              <h4 className="font-medium text-sm">{file.file_name}</h4>
                              <p className="text-xs text-gray-500">
                                {file.file_size && `${(file.file_size / 1024).toFixed(1)} KB`} • 
                                {new Date(file.uploaded_at).toLocaleDateString('it-IT')}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(file.file_url, '_blank')}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectTracker;
