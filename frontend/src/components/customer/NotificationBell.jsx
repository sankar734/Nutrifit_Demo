import { useEffect, useState, useRef } from 'react';
import { Bell, Check } from 'lucide-react';
import { notificationApi } from '../../services/api';
import { getSocket } from '../../services/socket';
import { useAuth } from '../../context/AuthContext';

const NotificationBell = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  const load = () => {
    notificationApi
      .list()
      .then(({ data }) => {
        setItems(data.data.notifications);
        setUnread(data.data.notifications.filter((n) => !n.isRead).length);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (!user) return;
    load();
    const socket = getSocket();
    socket.emit('join_user', user._id || user.id);
    const onNotify = (n) => {
      setItems((prev) => [n, ...prev].slice(0, 30));
      setUnread((c) => c + 1);
    };
    socket.on('notification', onNotify);
    return () => socket.off('notification', onNotify);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id, user?.id]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = async () => {
    await notificationApi.markAllRead();
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnread(0);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-700 flex items-center justify-center transition border border-slate-200/80 shadow-2xs group"
        aria-label="Notifications"
      >
        <Bell size={18} className="group-hover:scale-105 transition" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-md animate-pulse">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 max-h-[30rem] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-200/80 z-50">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-xs z-10">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-900">Notifications</span>
              {unread > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-black">
                  {unread} new
                </span>
              )}
            </div>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-purple-600 hover:text-purple-800 font-extrabold flex items-center gap-1 transition"
              >
                <Check size={13} />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-100">
            {items.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <span className="text-3xl block">🔔</span>
                <p className="text-xs font-bold text-slate-700">No notifications yet</p>
                <p className="text-[11px] text-slate-400">Order updates will appear here in real-time.</p>
              </div>
            ) : (
              items.map((n) => (
                <div
                  key={n._id}
                  className={`p-4 transition hover:bg-slate-50 flex items-start gap-3 ${
                    !n.isRead ? 'bg-purple-50/50' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm mt-0.5 ${
                    n.title?.includes('Received') || n.title?.includes('Done')
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    {n.title?.includes('Received') || n.title?.includes('Done') ? '🎉' : '🍱'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-900 leading-snug">{n.title}</p>
                    <p className="text-[11px] text-slate-600 font-medium mt-1 leading-relaxed">{n.body}</p>
                    <span className="text-[10px] text-slate-400 font-medium block mt-1.5">
                      {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                    </span>
                  </div>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-purple-600 shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
