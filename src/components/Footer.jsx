/* ============================================================
   🦶 Footer — لوجو + روابط + حقوق
   ============================================================ */
import { useUI } from '../context/UIContext';
import { useT } from '../i18n/useT';

function Footer() {
  const { lang, openSupport } = useUI();
  const { t } = useT();
  const name = lang === 'en' ? 'Basetna English' : 'بسّطنا الإنجليزي';

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-row">
          <div className="brand">
            <span className="mark">EN</span>
            <span className="brand-text">
              <b>{name}</b>
              <small>{lang === 'en' ? 'WITH MS. SHEREHAN ALI' : 'بإشراف مس. شيرهان علي'}</small>
            </span>
          </div>

          <div className="footer-links">
            <a href="#levels">{t('levelsTitle')}</a>
            <a href="#how">{t('howTitle')}</a>
            <a href="#packages">{t('packagesTitle')}</a>
            <button type="button" onClick={() => openSupport('support')}>
              {lang === 'en' ? 'Support' : 'الدعم الفني'}
            </button>
          </div>
        </div>

        <div className="copyright">
          <span>
            {lang === 'en'
              ? 'Learn English step by step with Ms. Sherehan Ali.'
              : 'اتعلّم الإنجليزي خطوة بخطوة مع مس. شيرهان علي.'}
          </span>
          <span>© {new Date().getFullYear()} {name}</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;