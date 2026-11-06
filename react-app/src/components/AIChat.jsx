/* ============================================================
   🤖 AIChat — واجهة المساعد الذكي
   ============================================================ */
import { useState, useRef, useEffect } from 'react';
import { useAIChat } from '../context/AIChatContext';

function AIChat() {
  const { history, isOpen, setIsOpen, busy, sendMessage, clearChat, config } = useAIChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // التمرير لآخر رسالة
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isOpen]);

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || busy) return;
    const text = input.trim();
    setInput('');
    try {
      await sendMessage(text);
    } catch (err) {
      // الخطأ بيظهر في الـ history عن طريق الـ context
    }
  }

  function handleQuickPrompt(prompt) {
    if (busy) return;
    sendMessage(prompt).catch(() => {});
  }

  if (!isOpen) return null;

  return (
    <div className="bai-overlay open" onClick={() => setIsOpen(false)}>
      <div className="bai-panel" onClick={e => e.stopPropagation()}>
        
        {/* الهيدر */}
        <div className="bai-head">
          <div className="bai-ava">🤖</div>
          <div>
            <h3 className="bai-title">{config.assistantName}</h3>
            <p>جاهز للمساعدة</p>
          </div>
          <div className="bai-tools">
            <button onClick={clearChat} title="مسح المحادثة">🗑️</button>
            <button onClick={() => setIsOpen(false)} title="إغلاق">✕</button>
          </div>
        </div>

        {/* الرسائل */}
        <div className="bai-body">
          {history.length === 0 && (
            <div className="bai-msg bot" style={{ whiteSpace: 'pre-wrap' }}>
              {config.greeting}
            </div>
          )}
          
          {history.map((msg, i) => (
            <div key={i} className={`bai-msg ${msg.role === 'user' ? 'me' : 'bot'} ${msg.isError ? 'error' : ''}`}>
              {msg.content}
            </div>
          ))}
          
          {busy && (
            <div className="bai-typing">
              <span /><span /><span />
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* الاقتراحات السريعة */}
        {history.length === 0 && (
          <div className="bai-quick">
            {config.quickPrompts.map((p, i) => (
              <button key={i} onClick={() => handleQuickPrompt(p)}>{p}</button>
            ))}
          </div>
        )}

        {/* الإدخال */}
        <form className="bai-foot" onSubmit={handleSend}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="اكتب سؤالك هنا..."
            rows={1}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
          />
          <button type="submit" className="bai-send" disabled={busy || !input.trim()}>
            {busy ? '...' : '⬆️'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AIChat;