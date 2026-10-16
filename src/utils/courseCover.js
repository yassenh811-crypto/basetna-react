/* ============================================================
   📚 courseCover — دالة تجيب صورة غلاف الكورس
   ============================================================ */

export function getCourseCover(course) {
  if (!course) return '';

  // 1) لو الكورس عنده صورة مباشرة
  if (course.cover_url) return course.cover_url;
  if (course.cover) return course.cover;
  if (course.image) return course.image;

  // 2) لو عنده فيديو → استخرج الصورة المصغرة
  const type = course.content_type || course.video_type;
  const url = course.content_url || course.video_url;

  if (url) {
    // يوتيوب
    const ytMatch = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/
    );
    if (ytMatch) {
      return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
    }

    // جوجل درايف
    const driveMatch =
      url.match(/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)/) ||
      url.match(/drive\.google\.com\/(?:open|uc)\?(?:[^#]*&)?id=([A-Za-z0-9_-]+)/);
    if (driveMatch) {
      return `https://drive.google.com/thumbnail?id=${driveMatch[1]}&sz=w800`;
    }

    // vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://vumbnail.com/${vimeoMatch[1]}.jpg`;
    }
  }

  // 3) صورة افتراضية
  return '';
}

export default getCourseCover;