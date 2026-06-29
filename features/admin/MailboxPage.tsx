
import React, { useState, useEffect, useCallback } from 'react';
import { Mail, Star, Send, Trash, Inbox, Plus, X, RefreshCw, Loader2, ChevronLeft } from 'lucide-react';
import { Button } from '../../components/Button';
import { ConfirmModal } from '../../components/ConfirmModal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { ApiService } from '../../services/api';
import { MailboxMessage } from '../../types';
import clsx from 'clsx';

type Folder = 'inbox' | 'sent' | 'starred';

export const MailboxPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [folder, setFolder] = useState<Folder>('inbox');
  const [messages, setMessages] = useState<MailboxMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<MailboxMessage | null>(null);
  const [composing, setComposing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MailboxMessage | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Compose form
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  const loadMessages = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await ApiService.fetchMessages(user.id);
      setMessages(data);
    } catch {
      showToast('error', 'Gagal memuat pesan');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  const visibleMessages = messages.filter(m => {
    if (folder === 'inbox') return m.to === user?.id;
    if (folder === 'sent') return m.from === user?.id;
    if (folder === 'starred') return m.isStarred;
    return false;
  });

  const unreadCount = messages.filter(m => m.to === user?.id && !m.isRead).length;

  const openMessage = async (msg: MailboxMessage) => {
    setSelected(msg);
    setComposing(false);
    if (!msg.isRead && msg.to === user?.id) {
      await ApiService.markMessageRead(msg.id).catch(() => {});
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isRead: true } : m));
    }
  };

  const handleStar = async (e: React.MouseEvent, msg: MailboxMessage) => {
    e.stopPropagation();
    try {
      const res = await ApiService.toggleStarMessage(msg.id);
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isStarred: res.starred } : m));
    } catch {
      showToast('error', 'Gagal mengubah bintang');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await ApiService.deleteMessage(deleteTarget.id);
      setMessages(prev => prev.filter(m => m.id !== deleteTarget.id));
      if (selected?.id === deleteTarget.id) setSelected(null);
      showToast('success', 'Pesan dihapus');
    } catch {
      showToast('error', 'Gagal menghapus pesan');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleSend = async () => {
    if (!to.trim() || !subject.trim() || !body.trim()) {
      showToast('warning', 'Lengkapi semua kolom pesan terlebih dahulu.');
      return;
    }
    setSending(true);
    try {
      await ApiService.sendMessage({
        from: user!.id,
        fromName: user!.name,
        to: to.trim(),
        subject: subject.trim(),
        body: body.trim()
      });
      showToast('success', 'Pesan berhasil dikirim!');
      setComposing(false);
      setTo(''); setSubject(''); setBody('');
      loadMessages();
    } catch {
      showToast('error', 'Gagal mengirim pesan');
    } finally {
      setSending(false);
    }
  };

  const navItems: { key: Folder; label: string; icon: React.ElementType }[] = [
    { key: 'inbox', label: 'Kotak Masuk', icon: Inbox },
    { key: 'starred', label: 'Berbintang', icon: Star },
    { key: 'sent', label: 'Terkirim', icon: Send },
  ];

  const formatDate = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    return isToday
      ? d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="h-[calc(100vh-140px)] bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex animate-in fade-in slide-in-from-right-4 duration-500">

      {/* Sidebar */}
      <div className="w-56 bg-gray-50 border-r border-gray-200 p-4 flex flex-col flex-shrink-0">
        <Button onClick={() => { setComposing(true); setSelected(null); }} className="w-full mb-5">
          <Plus className="w-4 h-4 mr-2" /> Tulis Pesan
        </Button>

        <nav className="space-y-1 flex-1">
          {navItems.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setFolder(key); setSelected(null); setComposing(false); }}
              className={clsx(
                'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                folder === key
                  ? 'bg-white text-brand-600 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <span className="flex items-center gap-2.5"><Icon className="w-4 h-4" />{label}</span>
              {key === 'inbox' && unreadCount > 0 && (
                <span className="text-xs bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded-full font-bold">{unreadCount}</span>
              )}
            </button>
          ))}
        </nav>

        <button onClick={loadMessages} disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors mt-2">
          <RefreshCw className={clsx("w-3.5 h-3.5", loading && "animate-spin")} />
          Perbarui
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Compose Panel */}
        {composing && (
          <div className="flex-1 flex flex-col p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-800 text-lg">Pesan Baru</h3>
              <button onClick={() => setComposing(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4 flex-1">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Kepada (User ID)</label>
                <input
                  value={to} onChange={e => setTo(e.target.value)}
                  placeholder="ID pengguna penerima..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Subjek</label>
                <input
                  value={subject} onChange={e => setSubject(e.target.value)}
                  placeholder="Subjek pesan..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Pesan</label>
                <textarea
                  value={body} onChange={e => setBody(e.target.value)}
                  placeholder="Tulis pesan Anda di sini..."
                  rows={10}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4 justify-end">
              <Button variant="outline" onClick={() => setComposing(false)}>Batal</Button>
              <Button onClick={handleSend} isLoading={sending}>
                <Send className="w-4 h-4 mr-2" /> Kirim
              </Button>
            </div>
          </div>
        )}

        {/* Message Detail */}
        {selected && !composing && (
          <div className="flex-1 flex flex-col p-6 overflow-y-auto">
            <button onClick={() => setSelected(null)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4 self-start">
              <ChevronLeft className="w-4 h-4" /> Kembali
            </button>
            <div className="bg-white rounded-xl border border-gray-200 p-6 flex-1">
              <div className="flex items-start justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
                <div>
                  <h2 className="font-bold text-gray-900 text-xl">{selected.subject}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Dari: <span className="font-medium text-gray-700">{selected.fromName}</span>
                    <span className="mx-2">•</span>
                    {new Date(selected.timestamp).toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={e => handleStar(e, selected)}
                    className={clsx("p-2 rounded-lg transition-colors", selected.isStarred ? "text-yellow-500 bg-yellow-50" : "text-gray-400 hover:text-yellow-500 hover:bg-yellow-50")}>
                    <Star className="w-4 h-4" fill={selected.isStarred ? "currentColor" : "none"} />
                  </button>
                  <button onClick={() => setDeleteTarget(selected)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{selected.body}</p>
            </div>
          </div>
        )}

        {/* Message List */}
        {!selected && !composing && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
              <h3 className="font-bold text-gray-800">
                {navItems.find(n => n.key === folder)?.label}
                {folder === 'inbox' && unreadCount > 0 && (
                  <span className="ml-2 text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">{unreadCount} baru</span>
                )}
              </h3>
              {loading && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {loading && messages.length === 0 && (
                <div className="p-8 text-center text-gray-400">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  Memuat pesan...
                </div>
              )}
              {!loading && visibleMessages.length === 0 && (
                <div className="p-12 text-center text-gray-400">
                  <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">Tidak ada pesan</p>
                  <p className="text-sm mt-1">Kotak {navItems.find(n => n.key === folder)?.label.toLowerCase()} kosong.</p>
                </div>
              )}
              {visibleMessages.map(msg => (
                <div
                  key={msg.id}
                  onClick={() => openMessage(msg)}
                  className={clsx(
                    "flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors",
                    !msg.isRead && msg.to === user?.id && "bg-blue-50/40"
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center font-bold text-brand-600 flex-shrink-0">
                    {(msg.fromName || msg.from).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className={clsx("text-sm truncate", !msg.isRead && msg.to === user?.id ? "font-bold text-gray-900" : "font-medium text-gray-700")}>
                        {folder === 'sent' ? `Ke: ${msg.to}` : msg.fromName}
                      </span>
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{formatDate(msg.timestamp)}</span>
                    </div>
                    <p className={clsx("text-sm truncate", !msg.isRead && msg.to === user?.id ? "font-semibold text-gray-800" : "text-gray-600")}>
                      {msg.subject}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{msg.body}</p>
                  </div>
                  <button
                    onClick={e => handleStar(e, msg)}
                    className={clsx("flex-shrink-0 p-1 transition-colors", msg.isStarred ? "text-yellow-500" : "text-gray-300 hover:text-yellow-400")}
                  >
                    <Star className="w-4 h-4" fill={msg.isStarred ? "currentColor" : "none"} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={deleting}
        title="Hapus Pesan"
        message={`Hapus pesan "${deleteTarget?.subject}"? Tindakan ini permanen.`}
        confirmLabel="Hapus"
        confirmVariant="danger"
      />
    </div>
  );
};
