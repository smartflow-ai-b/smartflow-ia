import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useUserManagement } from '@/hooks/useUserManagement';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const NOTIF_TYPES = [
	{ value: 'info', label: 'Info', color: 'bg-blue-100 text-blue-800' },
	{ value: 'warning', label: 'Avviso', color: 'bg-yellow-100 text-yellow-800' },
	{ value: 'alert', label: 'Allerta', color: 'bg-red-100 text-red-800' },
];

const AdminSendNotificationModal = ({ open, onOpenChange }) => {
		const [step, setStep] = useState(1);
		const [notifType, setNotifType] = useState('info');
		const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
		const [search, setSearch] = useState('');
		const [title, setTitle] = useState('');
		const [body, setBody] = useState('');
		const [sending, setSending] = useState(false);
		const [success, setSuccess] = useState(false);
		const { users, isLoading } = useUserManagement();
		const { user } = useAuth();
		const [selectAll, setSelectAll] = useState(false);

		const filteredUsers = users.filter(u =>
			(u.first_name + ' ' + u.last_name + ' ' + u.email).toLowerCase().includes(search.toLowerCase())
		);

		const handleToggleUser = (id: string) => {
			setSelectedUsers(prev => prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]);
		};

		const handleSelectAll = () => {
			if (selectAll) {
				setSelectedUsers([]);
				setSelectAll(false);
			} else {
				setSelectedUsers(filteredUsers.map(u => u.id));
				setSelectAll(true);
			}
		};

		const handleSend = async () => {
			setSending(true);
			await supabase.from('system_notifications').insert(
				selectedUsers.map(user_id => ({
					user_id,
					admin_id: user.id,
					title,
					message: body,
					type: notifType
				}))
			);
			setSending(false);
			setSuccess(true);
			setTimeout(() => {
				setSuccess(false);
				onOpenChange(false);
				setStep(1);
				setNotifType('info');
				setSelectedUsers([]);
				setTitle('');
				setBody('');
				setSearch('');
				setSelectAll(false);
			}, 1200);
		};

		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="max-w-lg">
					<DialogHeader>
						<DialogTitle>Invia Notifica</DialogTitle>
					</DialogHeader>
					{step === 1 && (
						<div className="space-y-4">
							<div>
								<div className="mb-2 font-medium">Tipo di notifica</div>
								<div className="flex gap-2">
									{NOTIF_TYPES.map(t => (
										<Button key={t.value} variant={notifType === t.value ? 'default' : 'outline'} onClick={() => setNotifType(t.value)}>
											<span className={t.color + ' rounded px-2 py-1 text-xs'}>{t.label}</span>
										</Button>
									))}
								</div>
							</div>
							<div className="flex justify-end">
								<Button onClick={() => setStep(2)} disabled={!notifType}>Avanti</Button>
							</div>
						</div>
					)}
					{step === 2 && (
						<div className="space-y-4">
							<div>
								<div className="mb-2 font-medium flex items-center justify-between">
									<span>Seleziona destinatari</span>
									<label className="flex items-center gap-2 cursor-pointer">
										<input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
										<span className="text-xs">Tutti</span>
									</label>
								</div>
								<Input placeholder="Cerca utente..." value={search} onChange={e => setSearch(e.target.value)} />
								<div className="max-h-48 overflow-y-auto mt-2 space-y-1">
									{isLoading ? (
										<div>Caricamento utenti...</div>
									) : filteredUsers.length === 0 ? (
										<div>Nessun utente trovato</div>
									) : filteredUsers.map(u => (
										<label key={u.id} className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-gray-50">
											<input type="checkbox" checked={selectedUsers.includes(u.id)} onChange={() => handleToggleUser(u.id)} />
											<span>{u.first_name} {u.last_name} <span className="text-xs text-gray-500">({u.email})</span></span>
										</label>
									))}
								</div>
							</div>
							<div className="flex justify-between">
								<Button variant="outline" onClick={() => setStep(1)}>Indietro</Button>
								<Button onClick={() => setStep(3)} disabled={selectedUsers.length === 0}>Avanti</Button>
							</div>
						</div>
					)}
					{step === 3 && (
						<div className="space-y-4">
							<div>
								<div className="mb-2 font-medium">Titolo</div>
								<Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Titolo della notifica..." />
							</div>
							<div>
								<div className="mb-2 font-medium">Corpo</div>
								<Textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Scrivi il messaggio..." rows={4} />
							</div>
							<div className="flex justify-between">
								<Button variant="outline" onClick={() => setStep(2)}>Indietro</Button>
								<Button onClick={handleSend} disabled={!title.trim() || !body.trim() || sending}>
									{sending ? 'Invio...' : 'Invia'}
								</Button>
							</div>
							{success && <div className="text-green-600 text-center font-medium">Notifica inviata!</div>}
						</div>
					)}
				</DialogContent>
			</Dialog>
		);
};

export default AdminSendNotificationModal;
