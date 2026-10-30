/* ============================================================
   🧭 Navbar — الهيدر الجديد (شريط علوي + لوجو + روابط + أزرار)
   ============================================================ */
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useT } from '../i18n/useT';

function Navbar() {
  const { user, profile, setShowAuthModal, signOut } = useAuth();
  const { lang, toggleLanguage, theme, toggleTheme } = useUI();
  const { t } = useT();

  const name = lang === 'en' ? 'Basetna English' : 'بسّطنا الإنجليزي';
  const links = [
    ['#top', lang === 'en' ? 'Home' : 'الرئيسية'],
    ['#levels', t('levelsTitle')],
    ['#how', t('howTitle')],
    ['#packages', t('packagesTitle')],
  ];

  return (
    <>
      <div className="topline">{t('packagesSub')}</div>

      <header className="topbar">
        <div className="row">
          <a className="brand" href="#top" aria-label={name}>
            <span className="mark">EN</span>
            <span className="brand-text">
              <b>{name}</b>
              <small>LEARN. PRACTICE. SPEAK.</small>
            </span>
          </a>

          <nav className="nav" aria-label={lang === 'en' ? 'Main navigation' : 'التنقل الرئيسي'}>
            {links.map(([href, label]) => (
              <a key={href} href={href}>{label}</a>
            ))}
          </nav>

          <div className="topbar-actions">
            <button type="button" className="lang-switch" onClick={toggleTheme} title="تغيير المظهر" aria-label="تغيير المظهر">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            <button type="button" className="lang-switch" onClick={toggleLanguage}>
              {lang === 'ar' ? 'English' : 'العربية'}
            </button>

            {user ? (
              <>
                <span className="nav-user">👋 {profile?.full_name || ''}</span>
                <button type="button" className="btn btn-gold btn-sm" onClick={signOut}>
                  {lang === 'en' ? 'Sign out' : 'تسجيل الخروج'}
                </button>
              </>
            ) : (
              <button type="button" className="btn btn-gold btn-sm" onClick={() => setShowAuthModal(true)}>
                {t('login')}
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

export default Navbar;