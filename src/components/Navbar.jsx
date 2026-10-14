/* ============================================================
   🧭 Navbar — شريط التنقل
   ------------------------------------------------------------
   - بيظهر اللوجو (logo.png)
   - بيظهر اسم المنصة
   - بيظهر أزرار: تغيير اللغة، تسجيل الدخول، Dark Mode
   ============================================================ */
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

function Navbar() {
  const { user, profile, setShowAuthModal, signOut } = useAuth();
  const { lang, toggleLanguage, theme, toggleTheme } = useUI();

  return (
    <div className="topbar">
      <div className="row">
        
        {/* ============================================================
            اللوجو + اسم المنصة
            ============================================================ */}
        <div className="brand">
          <img
            src="/logo.png"
            alt="بسّطنا الإنجليزي"
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              objectFit: 'cover',
              marginInlineEnd: 10,
              boxShadow: '0 4px 12px rgba(199,154,61,.4)',
            }}
          />
          بسّطنا الإنجليزي
        </div>

        {/* ============================================================
            الأزرار
            ============================================================ */}
        <div className="topbar-actions">
          
          {/* Dark Mode */}
          <button
            className="lang-switch"
            onClick={toggleTheme}
            title="تغيير المظهر"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {/* تغيير اللغة */}
          <button
            className="lang-switch"
            onClick={toggleLanguage}
          >
            {lang === 'ar' ? 'English' : 'العربية'}
          </button>

          {/* تسجيل دخول / خروج */}
          {user ? (
            <>
              <span style={{ color: '#fff', fontWeight: 700 }}>
                👋 {profile?.full_name || 'مرحباً'}
              </span>
              <button
                className="btn btn-gold btn-sm"
                onClick={signOut}
              >
                تسجيل الخروج
              </button>
            </>
          ) : (
            <button
              className="btn btn-gold btn-sm"
              onClick={() => setShowAuthModal(true)}
            >
              تسجيل الدخول
            </button>
          )}

        </div>
      </div>
    </div>
  );
}

export default Navbar;