/* ============================================================
   🆘 SupportLinks — أزرار الدعم جوه السايد بار (نفس شكل باقي العناصر)
   حطه جوه <aside className="sidebar"> تحت اللينكات وقبل "تسجيل الخروج".
   لما يظهر في الصفحة، الأزرار الدايرية العايمة بتختفي لوحدها.
   ============================================================ */
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';
import { useAIChat } from '../context/AIChatContext';

function SupportLinks() {
  const { openSupport } = useUI();
  const { user } = useAuth();
  const { setIsOpen: setAIOpen } = useAIChat();

  const items = [
    ...(user ? [{ id: 'ai', icon: '🤖', text: 'مساعد ذكي', run: () => setAIOpen(true) }] : []),
    { id: 'general', icon: '💬', text: 'الغرفة العامة', run: () => openSupport('general') },
    { id: 'owner', icon: '👩‍🏫', text: 'مس. شيرهان', run: () => openSupport('owner') },
    { id: 'support', icon: '🛠️', text: 'الدعم الفني', run: () => openSupport('support') },
  ];

  return (
    <div className="support-links">
      <div className="side-title">المساعدة والدعم</div>
      {items.map((it) => (
        <a
          key={it.id}
          href="#"
          onClick={(e) => {
            e.preventDefault();
            it.run();
          }}
        >
          <span className="side-ico">{it.icon}</span>
          <span>{it.text}</span>
        </a>
      ))}
    </div>
  );
}

export default SupportLinks;