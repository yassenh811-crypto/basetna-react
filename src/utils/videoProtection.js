/* ============================================================
   🛡️ videoProtection — حماية الفيديوهات
   ------------------------------------------------------------
   - منع Right Click
   - منع Copy / Cut / Select
   - منع Ctrl+S / Ctrl+U / F12 / Ctrl+Shift+I
   - منع Drag
   - منع PrintScreen
   - إيقاف الفيديو لو التاب خرج من الشاشة
   ============================================================ */

export function enableVideoProtection(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return () => {};

  /* 1. منع Right Click */
  const onContextMenu = (e) => {
    e.preventDefault();
    return false;
  };

  /* 2. منع Copy / Cut */
  const onCopy = (e) => e.preventDefault();
  const onCut = (e) => e.preventDefault();

  /* 3. منع Ctrl+S / Ctrl+U / F12 / Ctrl+Shift+I / Ctrl+P */
  const onKeyDown = (e) => {
    if (e.ctrlKey && ['s', 'u', 'S', 'U'].includes(e.key)) {
      e.preventDefault();
      return false;
    }
    if (e.key === 'F12') {
      e.preventDefault();
      return false;
    }
    if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'i', 'j', 'c'].includes(e.key)) {
      e.preventDefault();
      return false;
    }
    if (e.ctrlKey && ['p', 'P'].includes(e.key)) {
      e.preventDefault();
      return false;
    }
  };

  /* 4. منع Drag */
  const onDragStart = (e) => e.preventDefault();

  /* 5. منع تحديد النص */
  const onSelectStart = (e) => e.preventDefault();

  container.addEventListener('contextmenu', onContextMenu);
  container.addEventListener('copy', onCopy);
  container.addEventListener('cut', onCut);
  container.addEventListener('keydown', onKeyDown);
  container.addEventListener('dragstart', onDragStart);
  container.addEventListener('selectstart', onSelectStart);

  /* 6. منع PrintScreen */
  const onKeyUp = (e) => {
    if (e.key === 'PrintScreen') {
      if (navigator.clipboard) {
        navigator.clipboard.writeText('').catch(() => {});
      }
    }
  };
  document.addEventListener('keyup', onKeyUp);

  /* 7. إيقاف الفيديو لما التاب يخرج من الشاشة */
  const onVisibilityChange = () => {
    if (document.hidden) {
      const videos = document.querySelectorAll('video');
      videos.forEach((v) => {
        if (v.pause && !v.paused) {
          try { v.pause(); } catch (e) {}
        }
      });
    }
  };
  document.addEventListener('visibilitychange', onVisibilityChange);

  /* Cleanup */
  return () => {
    container.removeEventListener('contextmenu', onContextMenu);
    container.removeEventListener('copy', onCopy);
    container.removeEventListener('cut', onCut);
    container.removeEventListener('keydown', onKeyDown);
    container.removeEventListener('dragstart', onDragStart);
    container.removeEventListener('selectstart', onSelectStart);
    document.removeEventListener('keyup', onKeyUp);
    document.removeEventListener('visibilitychange', onVisibilityChange);
  };
}

/* ============================================================
   🎬 HTML5 Video Protection
   ============================================================ */
export function protectVideoElement(videoElement) {
  if (!videoElement) return;

  videoElement.setAttribute(
    'controlsList',
    'nodownload noremoteplayback noplaybackrate'
  );
  videoElement.setAttribute('disablePictureInPicture', 'true');
  videoElement.setAttribute('oncontextmenu', 'return false;');

  videoElement.addEventListener('contextmenu', (e) => e.preventDefault());
  videoElement.addEventListener('dragstart', (e) => e.preventDefault());
}