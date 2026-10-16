/* ============================================================
   🎓 StudentDashboard — لوحة تحكم الطالب
   (بيستخدم CourseCard الجديد + صور الكورسات)
   ============================================================ */
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useT } from '../i18n/useT';
import CoursePlayer from '../components/CoursePlayer';
import CourseCard from '../components/CourseCard';

function StudentDashboard() {
  const { profile, signOut } = useAuth();
  const { toggleLanguage } = useUI();
  const { t } = useT();
  const [courses, setCourses] = useState([]);
  const [lessonCounts, setLessonCounts] = useState({});
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [playerCourse, setPlayerCourse] = useState(null);

  useEffect(() => {
    async function load() {
      if (!profile) return;
      setLoading(true);

      const { data: subs } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('student_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(1);

      setSubscription(subs?.[0] || null);

      if (profile.grade_level_id) {
        const { data: coursesData } = await supabase
          .from('courses')
          .select('*')
          .eq('grade_level_id', profile.grade_level_id)
          .order('sort_order');
        const list = coursesData || [];
        setCourses(list);

        /* عدد الفيديوهات في كل كورس */
        if (list.length > 0) {
          const { data: lessonRows } = await supabase
            .from('lessons')
            .select('course_id')
            .in('course_id', list.map((c) => c.id));
          const counts = {};
          (lessonRows || []).forEach((l) => {
            counts[l.course_id] = (counts[l.course_id] || 0) + 1;
          });
          setLessonCounts(counts);
        }
      }

      setLoading(false);
    }
    load();
  }, [profile]);

  const filteredCourses = courses.filter((c) =>
    `${c.title_ar || ''} ${c.title_en || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const endDate = subscription?.end_date ? new Date(subscription.end_date + 'T23:59:59') : null;
  const isActive = !!subscription && subscription.status === 'active' && !!endDate && endDate >= new Date();
  const daysLeft = endDate ? Math.max(0, Math.ceil((endDate - new Date()) / 86400000)) : 0;

  return (
    <div className="dash-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="mark">EN</span> {t('brand')}
        </div>
        <a href="#" className="active" onClick={(e) => e.preventDefault()}>
          📚 {t('myCourses')}
        </a>
        <div className="side-tools">
          <button type="button" onClick={toggleLanguage}>🌐 {t('langBtn')}</button>
        </div>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            signOut();
          }}
          className="logout"
        >
          🚪 {t('logout')}
        </a>
      </aside>

      <main className="dash-main">
        <div className="dash-head">
          <div>
            <h1>🎓 {t('welcome', { name: profile?.full_name || '' })}</h1>
            <p className="dash-sub">{t('welcomeSub')}</p>
          </div>
          <span className={`badge ${isActive ? 'active' : 'expired'}`}>
            {isActive ? t('badgeActive', { days: daysLeft }) : t('badgeNone')}
          </span>
        </div>

        {!isActive && (
          <div className="card notice-card danger">
            <p>⚠️ {t('noActiveSub')}</p>
          </div>
        )}

        {isActive && daysLeft <= 7 && (
          <div className="card notice-card warn">
            <p>⏳ {t('endingSoon', { days: daysLeft })}</p>
          </div>
        )}

        {isActive && (
          <div className="kpi-row kpi-auto">
            <div className="card kpi kpi-courses">
              <span className="kpi-ico">📚</span>
              <div className="num">{courses.length}</div>
              <div className="label">{t('kpiCourses')}</div>
            </div>
            <div className="card kpi kpi-students">
              <span className="kpi-ico">🎬</span>
              <div className="num">{Object.values(lessonCounts).reduce((a, b) => a + b, 0)}</div>
              <div className="label">{t('kpiVideos')}</div>
            </div>
            <div className="card kpi kpi-active">
              <span className="kpi-ico">⏳</span>
              <div className="num">{daysLeft}</div>
              <div className="label">{t('kpiDays')}</div>
            </div>
          </div>
        )}

        {isActive && !profile?.grade_level_id && (
          <div className="empty-state">{t('needGrade')}</div>
        )}

        {isActive && profile?.grade_level_id && (
          <>
            <div className="search-box student-search">
              <input
                type="text"
                placeholder={t('searchCourses')}
                aria-label={t('searchCourses')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="grid grid-3">
                {[1, 2, 3].map((n) => (
                  <div className="card skeleton-card" key={n}>
                    <div className="sk-thumb" />
                    <div className="sk-line" />
                    <div className="sk-line short" />
                  </div>
                ))}
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="empty-state">
                {search ? t('noResults') : t('noCourses')}
              </div>
            ) : (
              <div className="grid grid-3">
                {filteredCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    lessonsCount={lessonCounts[course.id]}
                    onOpen={setPlayerCourse}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {playerCourse && (
        <CoursePlayer course={playerCourse} onClose={() => setPlayerCourse(null)} />
      )}
    </div>
  );
}

export default StudentDashboard;