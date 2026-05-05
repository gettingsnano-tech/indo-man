import { useEffect, useState, useRef } from 'react';
import api from '../../api/axios';
import { Card, Input, Button, Spinner, Badge } from '../../components/ui';
import { Send, MessageSquare, Clock } from 'lucide-react';
import clsx from 'clsx';

export default function Support() {
    const [tickets, setTickets] = useState([]);
    const [activeTicket, setActiveTicket] = useState(null);
    const [message, setMessage] = useState('');
    const [subject, setSubject] = useState('');
    const [initialMsg, setInitialMsg] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const scrollRef = useRef(null);

    const fetchTickets = async () => {
        try {
            const res = await api.get('/support/tickets');
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
        const interval = setInterval(fetchTickets, 5000); // Poll for new messages
        return () => clearInterval(interval);
    }, [activeTicket?.id]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [activeTicket?.messages]);

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            const res = await api.post('/support/tickets', { subject, message: initialMsg });
            setSubject('');
            setInitialMsg('');
            setTickets([res.data, ...tickets]);
            setActiveTicket(res.data);
        } catch (err) {
            alert('Failed to create ticket');
        } finally {
            setSending(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;
        setSending(true);
        try {
            const res = await api.post(`/support/tickets/${activeTicket.id}/messages`, { message });
            setMessage('');
            fetchTickets();
        } catch (err) {
            alert('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    if (loading && tickets.length === 0) return <div className="flex h-full items-center justify-center"><Spinner /></div>;

    return (
        <div className="max-w-6xl mx-auto h-[calc(100vh-160px)] flex gap-6">
            {/* Sidebar: Tickets List */}
            <div className="w-80 flex flex-col gap-4">
                <Card className="p-4 flex flex-col h-full bg-[#111118]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold flex items-center gap-2">
                            <MessageSquare size={18} className="text-brand-500" />
                            My Tickets
                        </h3>
                        <Badge>{tickets.length}</Badge>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                        {tickets.map(t => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTicket(t)}
                                className={clsx(
                                    "w-full text-left p-3 rounded-lg border transition-all duration-200",
                                    activeTicket?.id === t.id 
                                        ? "bg-brand-500/10 border-brand-500/50" 
                                        : "bg-[#0A0A0F] border-[#1E1E2A] hover:border-gray-700"
                                )}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <p className="text-sm font-medium truncate flex-1">{t.subject}</p>
                                    <div className={clsx(
                                        "w-2 h-2 rounded-full mt-1.5 ml-2",
                                        t.status === 'open' ? 'bg-green-500' : 'bg-gray-500'
                                    )}></div>
                                </div>
                                <div className="flex items-center justify-between text-[10px] text-gray-500">
                                    <span className="flex items-center gap-1"><Clock size={10} /> {new Date(t.updated_at).toLocaleDateString()}</span>
                                    <span className="uppercase">{t.status}</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    <Button 
                        variant="secondary" 
                        className="mt-4 w-full"
                        onClick={() => setActiveTicket(null)}
                    >
                        New Support Ticket
                    </Button>
                </Card>
            </div>

            {/* Main: Chat Area */}
            <Card className="flex-1 flex flex-col bg-[#111118] overflow-hidden">
                {activeTicket ? (
                    <>
                        <div className="p-4 border-b border-[#1E1E2A] flex justify-between items-center bg-[#0D0D14]">
                            <div>
                                <h3 className="font-bold text-lg">{activeTicket.subject}</h3>
                                <p className="text-xs text-gray-500">Ticket ID: {activeTicket.id.split('-')[0]}</p>
                            </div>
                            <Badge variant={activeTicket.status === 'open' ? 'success' : 'default'}>
                                {activeTicket.status.toUpperCase()}
                            </Badge>
                        </div>
                        
                        <div 
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
                        >
                            {activeTicket.messages?.map(m => (
                                <div 
                                    key={m.id}
                                    className={clsx(
                                        "flex flex-col max-w-[80%]",
                                        m.is_admin ? "self-start" : "self-end items-end"
                                    )}
                                >
                                    <div className={clsx(
                                        "px-4 py-3 rounded-2xl text-sm",
                                        m.is_admin 
                                            ? "bg-[#1E1E2A] text-gray-100 rounded-tl-none" 
                                            : "bg-[#2563EB] text-white rounded-tr-none"
                                    )}>
                                        {m.message}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1 px-1">
                                        <span className="text-[10px] text-gray-500 font-medium">
                                            {m.is_admin ? 'Support Agent' : 'You'}
                                        </span>
                                        <span className="text-[10px] text-gray-400">
                                            {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleSendMessage} className="p-4 bg-[#0D0D14] border-t border-[#1E1E2A]">
                            <div className="flex gap-2">
                                <Input 
                                    placeholder="Type your message..." 
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
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
                        <div className="w-20 h-20 rounded-full bg-[#1E1E2A] flex items-center justify-center">
                            <MessageSquare size={40} className="text-brand-500" />
                        </div>
                        <div className="max-w-md">
                            <h3 className="text-xl font-bold mb-2">How can we help you?</h3>
                            <p className="text-gray-400 text-sm mb-8">
                                Describe your issue below and our support team will get back to you as soon as possible.
                            </p>
                            <form onSubmit={handleCreateTicket} className="space-y-4 text-left">
                                <Input 
                                    label="Subject" 
                                    placeholder="e.g. Withdrawal issue, KYC help" 
                                    value={subject}
                                    onChange={e => setSubject(e.target.value)}
                                    required
                                />
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-300">Detailed Message</label>
                                    <textarea 
                                        className="w-full h-32 bg-[#0A0A0F] border border-[#1E1E2A] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors"
                                        placeholder="Please provide as much detail as possible..."
                                        value={initialMsg}
                                        onChange={e => setInitialMsg(e.target.value)}
                                        required
                                    ></textarea>
                                </div>
                                <Button type="submit" className="w-full" disabled={sending}>
                                    {sending ? 'Creating Ticket...' : 'Open Support Ticket'}
                                </Button>
                            </form>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
