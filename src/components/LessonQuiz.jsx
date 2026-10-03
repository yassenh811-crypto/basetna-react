/* ============================================================
   🎓 LessonQuiz — امتحان قصير على درس
   ------------------------------------------------------------
   - بيجيب الامتحان من جدول lesson_quizzes
   - بيعرض الأسئلة والاختيارات
   - بيحسب النتيجة
   - بيحفظ المحاولة + بيضيف نقاط
   ============================================================ */
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

function LessonQuiz({ lesson, onClose }) {
  const { user } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  /* ============================================================
     جلب الامتحان من Supabase
     ============================================================ */
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const { data, error: err } = await supabase
          .from('lesson_quizzes')
          .select('*')
          .eq('lesson_id', lesson.id)
          .maybeSingle();

        if (err) throw err;
        setQuiz(data);
      } catch (err) {
        console.error('❌', err);
        setError(err.message || 'حصلت مشكلة في التحميل');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [lesson.id]);

  /* ============================================================
     تسليم الامتحان
     ============================================================ */
  async function handleSubmit() {
    /* تحقق إن كل الأسئلة اتحلت */
    const unanswered = quiz.questions.filter((_, i) => answers[i] === undefined);
    if (unanswered.length > 0) {
      if (!confirm(`فيه ${unanswered.length} سؤال مش متجاوب. عايز تسلّم؟`)) return;
    }

    /* احسب النتيجة */
    let correct = 0;
    quiz.questions.forEach((q, i) => {
      if (answers[i] === q.correct) correct++;
    });

    setScore(correct);
    setSubmitted(true);

    /* احفظ المحاولة + ضيف نقاط */
    if (user) {
      setSaving(true);
      try {
        await supabase.from('quiz_attempts').insert({
          quiz_id: quiz.id,
          student_id: user.id,
          score: correct,
          total: quiz.questions.length,
        });

        /* ضيف نقاط للطالب */
        await supabase.rpc('add_points', {
          student_uuid: user.id,
          amount: correct * 10,
        });
      } catch (err) {
        console.error('❌', err);
      } finally {
        setSaving(false);
      }
    }
  }

  /* ============================================================
     إعادة المحاولة
     ============================================================ */
  function handleRetry() {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
  }

  /* ============================================================
     تحميل
     ============================================================ */
  if (loading) {
    return (
      <div className="overlay open" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="empty-state">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  /* ============================================================
     مفيش امتحان
     ============================================================ */
  if (!quiz) {
    return (
      <div className="overlay open" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <button className="close" onClick={onClose}>✕</button>
          <h3>🎓 امتحان الدرس</h3>
          <div className="empty-state" style={{ padding: 30 }}>
            <div style={{ fontSize: 48, marginBottom: 10 }}>📚</div>
            لسه مفيش امتحان للدرس ده.
            <br />
            <small style={{ color: 'var(--ink-soft)' }}>
              اتصل بالمدرس عشان يعمله امتحان بـ AI.
            </small>
          </div>
        </div>
      </div>
    );
  }

  /* ============================================================
     النسبة المئوية
     ============================================================ */
  const percentage = Math.round((score / quiz.questions.length) * 100);

  /* ============================================================
     Render
     ============================================================ */
  return (
    <div className="overlay open" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 700, maxHeight: '90vh', overflowY: 'auto' }}
      >
        <button className="close" onClick={onClose}>✕</button>

        <h3>{quiz.title_ar}</h3>
        <p className="sub">📝 {quiz.questions.length} أسئلة</p>

        {/* ============================================================
            النتيجة (لو تم التسليم)
            ============================================================ */}
        {submitted && (
          <div
            style={{
              padding: 20,
              background: percentage >= 50 ? '#E4F2EC' : '#FBE7E2',
              borderRadius: 12,
              marginBottom: 20,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 8 }}>
              {percentage >= 80 ? '🏆' : percentage >= 50 ? '👍' : '💪'}
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--navy-deep)' }}>
              {score} / {quiz.questions.length}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>
              {percentage}%
            </div>
            <div style={{ marginTop: 8, color: 'var(--ink-soft)' }}>
              {percentage >= 80 ? 'ممتاز! 🎉' :
               percentage >= 50 ? 'جيد! 💛' :
               'محتاج مراجعة 📚'}
            </div>
            {saving && (
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--ink-soft)' }}>
                جاري الحفظ...
              </div>
            )}
            {user && percentage >= 50 && (
              <div style={{ marginTop: 8, fontSize: 13, color: 'var(--teal)' }}>
                🎉 كسبت {score * 10} نقطة!
              </div>
            )}
          </div>
        )}

        {/* ============================================================
            الأسئلة
            ============================================================ */}
        {quiz.questions.map((q, i) => (
          <div
            key={i}
            style={{
              marginBottom: 20,
              padding: 16,
              background: 'var(--paper)',
              borderRadius: 12,
              border: '1.5px solid var(--line)',
            }}
          >
            <div
              style={{
                fontWeight: 800,
                marginBottom: 12,
                color: 'var(--navy-deep)',
                fontSize: 15,
              }}
            >
              {i + 1}. {q.question}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {q.options.map((opt, idx) => {
                const isSelected = answers[i] === idx;
                const isCorrect = idx === q.correct;

                let bg = 'var(--paper-2)';
                let border = 'var(--line)';
                let color = 'var(--ink)';

                if (submitted) {
                  if (isCorrect) {
                    bg = '#E4F2EC';
                    border = 'var(--teal)';
                    color = 'var(--teal-dark)';
                  } else if (isSelected) {
                    bg = '#FBE7E2';
                    border = 'var(--danger)';
                    color = 'var(--danger)';
                  }
                } else if (isSelected) {
                  bg = '#FFF9E8';
                  border = 'var(--gold)';
                  color = 'var(--navy-deep)';
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => !submitted && setAnswers({ ...answers, [i]: idx })}
                    style={{
                      padding: '12px 16px',
                      background: bg,
                      border: `1.5px solid ${border}`,
                      borderRadius: 10,
                      textAlign: 'start',
                      fontSize: 14,
                      fontFamily: 'inherit',
                      cursor: submitted ? 'default' : 'pointer',
                      fontWeight: isSelected || (submitted && isCorrect) ? 700 : 500,
                      color,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {submitted && isCorrect && '✅ '}
                    {submitted && isSelected && !isCorrect && '❌ '}
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* ============================================================
            الأزرار
            ============================================================ */}
        {!submitted ? (
          <button
            className="btn btn-teal btn-block"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? 'جاري الحفظ...' : '✅ تسليم الامتحان'}
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-gold btn-block" onClick={handleRetry}>
              🔄 إعادة المحاولة
            </button>
          </div>
        )}

        {error && (
          <div className="form-msg error" style={{ display: 'block', marginTop: 12 }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default LessonQuiz;