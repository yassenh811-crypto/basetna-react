/* ============================================================
   💬 ChatContext — إدارة الرسائل
   ============================================================ */
import { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from './AuthContext';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentRoom, setCurrentRoom] = useState('general');
  const [privateWith, setPrivateWith] = useState(null);
  const requestId = useRef(0);

  const loadMessages = useCallback(async (room, privateUserId = null) => {
    if (!user) {
      setMessages([]);
      return;
    }
    /* كل طلب له رقم؛ لو المستخدم غيّر الغرفة قبل ما الرد يرجع، نتجاهل الرد القديم
       (قبل كده كان الطلب الجديد بيتلغي وتفضل رسائل الغرفة القديمة ظاهرة) */
    const myRequest = ++requestId.current;
    setLoading(true);

    try {
      let query = supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (room === 'private' && privateUserId) {
        query = query
          .eq('recipient_role', 'private')
          .or(
            `and(sender_id.eq.${user.id},private_with.eq.${privateUserId}),` +
            `and(sender_id.eq.${privateUserId},private_with.eq.${user.id})`
          );
      } else {
        query = query.eq('recipient_role', room);
      }

      const { data, error } = await query;
      if (error) throw error;
      if (myRequest !== requestId.current) return;
      /* بنجيب آخر 200 رسالة (الأحدث) وبعدين نرتبهم من الأقدم للأحدث */
      setMessages((data || []).reverse());
    } catch (err) {
      if (myRequest !== requestId.current) return;
      console.error('❌ خطأ في جلب الرسائل:', err);
      setMessages([]);
    } finally {
      if (myRequest === requestId.current) setLoading(false);
    }
  }, [user]);

  const sendMessage = useCallback(async (content, room, privateUserId = null) => {
    if (!user || !profile) return;
    const trimmed = (content || '').trim();
    if (!trimmed) return;

    const payload = {
      sender_id: user.id,
      sender_name: profile.full_name || 'مستخدم',
      sender_role: profile.role || 'student',
      recipient_role: room,
      content: trimmed,
    };
    if (room === 'private' && privateUserId) payload.private_with = privateUserId;

    const { error } = await supabase.from('messages').insert(payload);
    if (error) throw error;
  }, [user, profile]);

  const openRoom = useCallback((room, privateUserId = null) => {
    setCurrentRoom(room);
    setPrivateWith(privateUserId);
  }, []);

  useEffect(() => {
    if (user) loadMessages(currentRoom, privateWith);
    else setMessages([]);
  }, [user, currentRoom, privateWith, loadMessages]);

  /* ---------- Realtime ---------- */
  useEffect(() => {
    if (!user) return;

    const belongsHere = (m) => {
      if (m.recipient_role !== currentRoom) return false;
      if (currentRoom !== 'private') return true;
      /* الخاص: لازم الرسالة تكون بينّا وبين الشخص المفتوح بس
         (قبل كده أي رسالة خاصة لأي حد كانت بتظهر) */
      return (
        (m.sender_id === user.id && m.private_with === privateWith) ||
        (m.sender_id === privateWith && m.private_with === user.id)
      );
    };

    const channel = supabase
      .channel(`messages-${currentRoom}-${privateWith || 'all'}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const m = payload.new;
        if (!belongsHere(m)) return;
        setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, currentRoom, privateWith]);

  const value = useMemo(
    () => ({ messages, loading, currentRoom, privateWith, sendMessage, openRoom }),
    [messages, loading, currentRoom, privateWith, sendMessage, openRoom]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used inside ChatProvider');
  return ctx;
}