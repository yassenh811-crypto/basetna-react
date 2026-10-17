/* ============================================================
   🎬 DemoVideo — فيديو تجريبي في أول الموقع
   بيظهر كارت بصورة وزرار تشغيل، ولما حد يدوس عليه الفيديو بيفتح.
   الرابط والغلاف بيتحطوا من الأدمن (الإعدادات).
   ============================================================ */
import { useEffect, useState } from 'react';
import { getCourseCover } from '../utils/courseCover';
import { getEmbed } from '../utils/video';

const TEXT = {
  ar: {
    title: 'جرّب قبل ما تشترك',
    sub: 'شوف فيديو تجريبي من شرح مس. شيرهان',
    play: 'شغّل الفيديو التجريبي',
    free: 'مجاناً',
    close: 'إغلاق',
    bad: 'رابط الفيديو غلط',
  },
  en: {
    title: 'Try it before you subscribe',
    sub: 'Watch a free sample lesson',
    play: 'Play the demo video',
    free: 'Free',
    close: 'Close',
    bad: 'The video link is invalid',
  },
};

function DemoVideo({ demo, lang = 'ar' }) {
  const L = TEXT[lang === 'en' ? 'en' : 'ar'];
  const [open, setOpen] = useState(false);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  if (!demo?.url) return null;

  const embed = getEmbed(demo.type, demo.url);
  const cover = getCourseCover({ thumbnail_url: demo.cover, content_type: demo.type, content_url: demo.url }, 'w1280');
  const showImg = cover && !broken;

  return (
    <section className="block demo-section" id="demo">
      <div className="container">
        <div className="section-head">
          <h2>{L.title}</h2>
          <p>{L.sub}</p>
        </div>

        <button type="button" className="demo-card" onClick={() => setOpen(true)} aria-label={L.play}>
          {showImg ? (
            <img src={cover} alt="" loading="lazy" onError={() => setBroken(true)} />
          ) : (
            <span className="demo-fallback">🎬</span>
          )}
          <span className="demo-play">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
          </span>
          <span className="demo-badge">{L.free}</span>
          {demo.title && <span className="demo-title">{demo.title}</span>}
        </button>
      </div>

      {open && (
        <div className="overlay open demo-overlay" onClick={() => setOpen(false)}>
          <div className="demo-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="demo-close" onClick={() => setOpen(false)} aria-label={L.close}>✕</button>
            <div className="demo-frame">
              {!embed ? (
                <div className="video-error"><span>⚠️</span><p>{L.bad}</p></div>
              ) : embed.kind === 'video' ? (
                <video src={embed.src} controls autoPlay playsInline controlsList="nodownload" />
              ) : (
                <iframe
                  title={demo.title || L.title}
                  src={embed.src}
                  allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
            {demo.title && <div className="demo-caption">{demo.title}</div>}
          </div>
        </div>
      )}
    </section>
  );
}

export default DemoVideo;