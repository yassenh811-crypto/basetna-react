/* ============================================================
   🎓 GenerateQuizButton — توليد امتحان من درس بـ AI
   ------------------------------------------------------------
   - بيبعت الدرس للسيرفر (Vercel)
   - السيرفر بيكلم Gemini ويعمل امتحان
   - بتحفظ الامتحان في Supabase
   ============================================================ */
import { useState } from 'react';
import { supabase } from '../../services/supabase';

const API_URL =
  import.meta.env.VITE_AI_API_URL || 'https://basetna-english.vercel.app';

function GenerateQuizButton({ lesson, onGenerated }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');

  /* ============================================================
     توليد الامتحان
     ============================================================ */
  async function handleGenerate() {
    if (loading) return;

    if (!confirm(`عايز AI يعمل امتحان لدرس "${lesson.title_ar}"؟`)) return;

    setLoading(true);
    setMsg('⏳ جاري التوليد...');
    setMsgType('ok');

    try {
      /* 1. جيب التوكن */
      let token = '';
      try {
        const { data } = await supabase.auth.getSession();
        token = data?.session?.access_token || '';
      } catch (e) {}

      if (!token) {
        throw new Error('سجّل دخولك الأول');
      }

      /* 2. ابعت للسيرفر */
      const res = await fetch(`${API_URL}/api/generate-quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({
          lessonTitle: lesson.title_ar,
          lessonDescription: lesson.description_ar,
          lessonDuration: lesson.duration_min,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'فشل توليد الامتحان');
      }

      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error('الرد مش فيه questions');
      }

      /* 3. احفظ في Supabase */
      const { error } = await supabase.from('lesson_quizzes').upsert(
        {
          lesson_id: lesson.id,
          title_ar: data.title_ar || `امتحان: ${lesson.title_ar}`,
          questions: data.questions,
        },
        { onConflict: 'lesson_id' }
      );

      if (error) throw error;

      setMsg('✅ تم إنشاء الامتحان');
      setMsgType('ok');

      if (onGenerated) onGenerated();

      /* اخفي الرسالة بعد 3 ثواني */
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      console.error('❌', err);
      setMsg('❌ ' + (err.message || 'فشل التوليد'));
      setMsgType('error');
      setTimeout(() => setMsg(''), 5000);
    } finally {
      setLoading(false);
    }
  }

  /* ============================================================
     Render
     ============================================================ */
  return (
    <div style={{ display: 'inline-block', position: 'relative' }}>
      <button
        className="icon-btn"
        style={{
          background: loading ? 'var(--paper-2)' : 'var(--purple)',
          color: '#fff',
        }}
        onClick={handleGenerate}
        disabled={loading}
        title="توليد امتحان بالذكاء الاصطناعي"
      >
        {loading ? '⏳' : '🎓 AI'}
      </button>

      {msg && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            insetInlineStart: 0,
            marginTop: 4,
            padding: '4px 8px',
            fontSize: 11,
            fontWeight: 700,
            borderRadius: 6,
            whiteSpace: 'nowrap',
            zIndex: 10,
            background: msgType === 'error' ? '#FBE7E2' : '#E4F2EC',
            color: msgType === 'error' ? 'var(--danger)' : 'var(--teal-dark)',
          }}
        >
          {msg}
        </div>
      )}
    </div>
  );
}

export default GenerateQuizButton;