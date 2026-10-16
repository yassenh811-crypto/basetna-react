/* ============================================================
   🛟 SupportModal — الشات (الغرفة العامة / الميس / الدعم)
   ============================================================ */
import { useState, useEffect, useRef } from 'react';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useActingAs } from '../context/ActingAsContext';

const ROLE_EMOJI = { superadmin: '👑', owner: '👩‍🏫', support: '🛠️' };
const ROLE_LABEL = { superadmin: 'مدير', owner: 'الميس', support: 'دعم فني', student: 'طالب' };

const TITLES = {
  general: { title: '💬 الغرفة العامة', sub: 'كل الطلاب والميس والدعم' },
  owner: { title: '👩‍🏫 مس. شيرهان علي', sub: 'تواصل مع الميس' },
  support: { title: '🛠️ الدعم الفني', sub: 'الدعم الفني للمنصة' },
};

function SupportModal() {
  const { showSupport, setShowSupport, supportType } = useUI();
  const { user } = useAuth();
  const { messages, loading, sendMessage, openRoom } = useChat();
  const { isOwnerAccount, actingAs, actingInfo, openPicker } = useActingAs();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    if (showSupport && user) openRoom(supportType);
  }, [showSupport, supportType, user, openRoom]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showSupport]);

  useEffect(() => {
    if (!showSupport) return;
    const onKey = (e) => e.key === 'Escape' && setShowSupport(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showSupport, setShowSupport]);

  if (!showSupport) return null;

  const info = TITLES[supportType] || TITLES.support;

  async function handleSend() {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      await sendMessage(input, supportType, actingAs);
      setInput('');
    } catch (err) {
      alert('❌ حصلت مشكلة في الإرسال');
      console.error(err);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="overlay open" onClick={() => setShowSupport(false)}>
      <div className="support-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button className="close" type="button" onClick={() => setShowSupport(false)} aria-label="إغلاق">✕</button>

        <div className="support-head">
          <h3>{info.title}</h3>
          <p>{info.sub}</p>
        </div>

        {isOwnerAccount && actingInfo && (
          <div className="private-chat-banner">
            {actingInfo.icon} بترد بصفة: <b>{actingInfo.label}</b>
            <button type="button" onClick={openPicker}>تغيير</button>
          </div>
        )}

        <div className="support-messages">
          {!user ? (
            <div className="empty-state">سجّل دخولك الأول عشان تقدر تستخدم الشات</div>
          ) : loading ? (
            <div className="skeleton-list" style={{ padding: 0 }}><span /><span /><span /></div>
          ) : messages.length === 0 ? (
            <div className="empty-state">لسه مفيش رسائل 👋 ابدأ الكلام</div>
          ) : (
            messages.map((m) => {
              const isMine = m.sender_id === user.id;
              const staff = !!ROLE_EMOJI[m.sender_role];
              const time = new Date(m.created_at).toLocaleString('ar-EG', { hour: '2-digit', minute: '2-digit' });
              return (
                <div key={m.id} className={`msg${isMine ? ' mine' : ''}${staff && !isMine ? ' admin-msg' : ''}`}>
                  {!isMine && <div className="msg-avatar">{ROLE_EMOJI[m.sender_role] || '🎓'}</div>}
                  <div className="msg-bubble">
                    {!isMine && (
                      <div className="msg-name">
                        {m.sender_name}
                        <span className="role-tag">{ROLE_LABEL[m.sender_role] || m.sender_role}</span>
                      </div>
                    )}
                    <div className="msg-text" dir="auto">{m.content}</div>
                    <div className="msg-time">{time}</div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={endRef} />
        </div>

        <div className="support-input-row">
          <input
            type="text"
            placeholder={user ? 'اكتب رسالتك...' : 'سجّل دخولك الأول'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!user || sending}
            autoFocus
          />
          <button type="button" className="btn btn-teal btn-sm" onClick={handleSend} disabled={!user || sending || !input.trim()}>
            {sending ? '...' : 'إرسال'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SupportModal;