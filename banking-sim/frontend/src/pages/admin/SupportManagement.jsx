import { useEffect, useState, useRef } from 'react';
import api from '../../api/axios';
import { Card, Input, Button, Spinner, Badge } from '../../components/ui';
import { Send, MessageSquare, Clock, User, CheckCircle, ChevronLeft } from 'lucide-react';
import clsx from 'clsx';

export default function SupportManagement() {
    const [tickets, setTickets] = useState([]);
    const [activeTicket, setActiveTicket] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const scrollRef = useRef(null);

    const fetchTickets = async () => {
        try {
            const res = await api.get('/support/admin/tickets');
            setTickets(res.data);
            if (activeTicket) {
                const updated = res.data.find(t => t.id === activeTicket.id);
                if (updated) setActiveTicket(updated);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
        const interval = setInterval(fetchTickets, 5000);
        return () => clearInterval(interval);
    }, [activeTicket?.id]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [activeTicket?.messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;
        setSending(true);
        try {
            await api.post(`/support/tickets/${activeTicket.id}/messages`, { message });
            setMessage('');
            fetchTickets();
        } catch (err) {
            alert('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const toggleStatus = async () => {
        const newStatus = activeTicket.status === 'open' ? 'closed' : 'open';
        try {
            await api.patch(`/support/admin/tickets/${activeTicket.id}/status`, { status: newStatus });
            fetchTickets();
        } catch (err) {
            alert('Status update failed');
        }
    };

    if (loading && tickets.length === 0) return <div className="flex h-full items-center justify-center"><Spinner /></div>;

    return (
        <div className="max-w-7xl mx-auto h-[calc(100vh-160px)] flex flex-col lg:flex-row gap-4 lg:gap-6">
            {/* Ticket List */}
            <div className={clsx(
                "w-full lg:w-96 flex flex-col gap-4 h-full",
                activeTicket && "hidden lg:flex"
            )}>
                <Card className="p-4 flex flex-col h-full bg-[#111118]">
                    <div className="mb-4">
                        <h3 className="text-xl font-bold">Support Management</h3>
                        <p className="text-xs text-gray-500 mt-1">Manage user inquiries and chat</p>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                        {tickets.map(t => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTicket(t)}
                                className={clsx(
                                    "w-full text-left p-4 rounded-xl border transition-all duration-200",
                                    activeTicket?.id === t.id 
                                        ? "bg-brand-500/10 border-brand-500/50" 
                                        : "bg-[#0A0A0F] border-[#1E1E2A] hover:bg-[#111118]"
                                )}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant={t.status === 'open' ? 'success' : 'default'} className="text-[9px]">
                                        {t.status.toUpperCase()}
                                    </Badge>
                                    <span className="text-[10px] text-gray-500">{new Date(t.updated_at).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm font-bold text-white mb-1 truncate">{t.subject}</p>
                                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                    <User size={10} />
                                    <span>{t.user?.name}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Chat View */}
            <Card className={clsx(
                "flex-1 flex flex-col bg-[#111118] overflow-hidden h-full",
                !activeTicket && "hidden lg:flex"
            )}>
                {activeTicket ? (
                    <>
                        <div className="p-4 lg:p-6 border-b border-[#1E1E2A] flex justify-between items-center bg-[#0D0D14]">
                            <div className="flex items-center gap-2 lg:gap-4">
                                <button 
                                    onClick={() => setActiveTicket(null)}
                                    className="lg:hidden p-2 -ml-2 text-gray-400 hover:text-white"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <div className="hidden sm:flex w-10 h-10 rounded-full bg-[#2563EB]/20 items-center justify-center text-[#2563EB] font-bold shrink-0">
                                    {activeTicket.user?.name[0]}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg leading-tight">{activeTicket.subject}</h3>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>User: {activeTicket.user?.name}</span>
                                        <span>•</span>
                                        <span>{activeTicket.user?.email}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 lg:gap-3">
                                <Button 
                                    variant={activeTicket.status === 'open' ? 'danger' : 'success'} 
                                    size="sm"
                                    onClick={toggleStatus}
                                    className="flex items-center gap-2 px-2 sm:px-3"
                                >
                                    <CheckCircle size={16} />
                                    <span className="hidden sm:inline">{activeTicket.status === 'open' ? 'Close' : 'Re-open'}</span>
                                </Button>
                            </div>
                        </div>
                        
                        <div 
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-6 space-y-6"
                        >
                            {activeTicket.messages?.map(m => (
                                <div 
                                    key={m.id}
                                    className={clsx(
                                        "flex flex-col max-w-[70%]",
                                        m.is_admin ? "self-end items-end" : "self-start"
                                    )}
                                >
                                    <div className={clsx(
                                        "px-4 py-3 rounded-2xl text-sm",
                                        m.is_admin 
                                            ? "bg-[#2563EB] text-white rounded-tr-none" 
                                            : "bg-[#1E1E2A] text-gray-100 rounded-tl-none"
                                    )}>
                                        {m.message}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1 px-1">
                                        <span className="text-[10px] text-gray-500 font-medium">
                                            {m.is_admin ? 'You (Admin)' : activeTicket.user?.name}
                                        </span>
                                        <span className="text-[10px] text-gray-400">
                                            {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleSendMessage} className="p-6 bg-[#0D0D14] border-t border-[#1E1E2A]">
                            <div className="flex gap-3">
                                <Input 
                                    placeholder="Reply to user..." 
                                    className="flex-1 bg-[#0A0A0F]" 
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    disabled={activeTicket.status === 'closed'}
                                />
                                <Button 
                                    type="submit" 
                                    disabled={sending || activeTicket.status === 'closed' || !message.trim()}
                                >
                                    <Send size={18} />
                                </Button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-50">
                        <MessageSquare size={64} className="mb-4 text-gray-700" />
                        <h3 className="text-xl font-bold">Select a ticket to view conversation</h3>
                        <p className="text-sm text-gray-500">All user inquiries will appear on the left sidebar</p>
                    </div>
                )}
            </Card>
        </div>
    );
}
