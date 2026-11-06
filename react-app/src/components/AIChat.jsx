/* ============================================================
   🤖 AIChat — المساعد الذكي
   ============================================================ */
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function AIChat({ open, onClose }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // رسالة ترحيبية
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        { role: 'bot', text: 'أهلاً بيك! أنا مساعد بسّطنا الإنجليزي. إزاي أقدر أساعدك النهاردة؟ 👋' }
      ]);
    }
  }, [open]);

  // التمرير لآخر رسالة
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      // 🚀 بنبعت الطلب لـ /api/ai (المسار ده موجود في نفس مشروع Vercel بتاعك)
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMsg })
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'فشل الاتصال بالمساعد');

      setMessages(prev => [...prev, { role: 'bot', text: data.reply || 'معلش، مقدرتش أفهم قصدك.' }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'bot', text: '⚠️ المساعد مش متظبط على السيرفر.' }]);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="bai-overlay open" onClick={onClose}>
      <div className="bai-panel" onClick={e => e.stopPropagation()}>
        <div className="bai-head">
          <div className="bai-ava">🤖</div>
          <div>
            <h3 className="bai-title">مساعد بسّطنا</h3>
            <p>جاهز للمساعدة</p>
          </div>
          <div className="bai-tools">
            <button onClick={() => setMessages([])} title="مسح المحادثة">🗑️</button>
            <button onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="bai-body">
          {messages.map((msg, i) => (
            <div key={i} className={`bai-msg ${msg.role === 'user' ? 'me' : 'bot'}`}>
              {msg.text}
            </div>
          ))}
          {loading && (
            <div className="bai-typing">
              <span /><span /><span />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="bai-foot" onSubmit={sendMessage}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="اكتب سؤالك هنا..."
            rows={1}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(e);
              }
            }}
          />
          <button type="submit" className="bai-send" disabled={loading || !input.trim()}>
            {loading ? '...' : '⬆️'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AIChat;