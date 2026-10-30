/* ============================================================
   👥 AdminStudents — إدارة الطلاب
   ------------------------------------------------------------
   - الحسابات الجديدة بتتعمل من الموقع (اشتراك بالتحويل)
   - إضافة وحذف طالب: للمدير الأعلى بس
   - الميس: تشوف الطلاب وتعدّل بياناتهم وتفعّل الاشتراك
            وتقفل/تفتح الحساب وتشوف صور التحويل
   ============================================================ */
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import AdminFormModal from './AdminFormModal';
import SubscriptionForm from './SubscriptionForm';
import StudentReceipts from './StudentReceipts';
import { AdminToolbar, StateRow, RowActions } from './AdminUI';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://wgostqkywpybmzgbyzeo.supabase.co';
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_zx0zeWR2bpbmyO90oN-4ow_FxZCSPl8';

const EMPTY = {
  full_name: '',
  email: '',
  password: '',
  phone: '',
  grade_level_id: '',
  role: 'student',
};

const todayStr = () => new Date().toISOString().slice(0, 10);

function AdminStudents() {
  const { profile: me } = useAuth();
  const isSuper = me?.role === 'superadmin';

  const [students, setStudents] = useState([]);
  const [levels, setLevels] = useState([]);
  const [subs, setSubs] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [subscriptionStudent, setSubscriptionStudent] = useState(null);
  const [receiptsStudent, setReceiptsStudent] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY);

  async function loadData() {
    setLoading(true);
    const [sRes, lRes, subRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('role', 'student').order('created_at', { ascending: false }),
      supabase.from('grade_levels').select('*').order('sort_order'),
      supabase.from('subscriptions').select('student_id,status,end_date'),
    ]);

    const map = {};
    (subRes.data || []).forEach((s) => {
      if (s.status !== 'active') return;
      const end = s.end_date || '9999-12-31';
      if (!map[s.student_id] || end > map[s.student_id]) map[s.student_id] = end;
    });

    setStudents(sRes.data || []);
    setLevels(lRes.data || []);
    setSubs(map);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function subState(id) {
    const end = subs[id];
    if (!end) return { cls: 'none', text: 'غير مشترك' };
    if (end >= todayStr()) return { cls: 'active', text: end === '9999-12-31' ? 'فعّال' : `فعّال لحد ${end}` };
    return { cls: 'expired', text: `انتهى ${end}` };
  }

  function openAddModal() {
    setEditing(null);
    setForm(EMPTY);
    setMsg({ text: '', type: '' });
    setModalOpen(true);
  }

  function openEditModal(student) {
    setEditing(student);
    setForm({
      full_name: student.full_name || '',
      email: '',
      password: '',
      phone: student.phone || '',
      grade_level_id: student.grade_level_id || '',
      role: student.role || 'student',
    });
    setMsg({ text: '', type: '' });
    setModalOpen(true);
  }

  const fail = (text) => {
    setMsg({ text: '❌ ' + text, type: 'error' });
    setSaving(false);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMsg({ text: '', type: '' });

    if (!editing) {
      if (!isSuper) return fail('إضافة الطلاب للمدير الأعلى بس');
      if (!form.full_name.trim()) return fail('اكتب اسم الطالب');
      if (!form.email.trim()) return fail('اكتب الإيميل');
      if (!form.password || form.password.length < 6) return fail('كلمة المرور 6+ حروف');

      const tempClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false, autoRefreshToken: false, storageKey: 'temp-signup-' + Date.now() },
      });

      const { data: authData, error: authError } = await tempClient.auth.signUp({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      if (authError) return fail(authError.message);

      const userId = authData.user?.id;
      if (!userId) return fail('محتاج تأكيد الإيميل');

      const { error: profileError } = await supabase.from('profiles').upsert(
        {
          id: userId,
          full_name: form.full_name.trim(),
          phone: form.phone.trim() || null,
          grade_level_id: form.grade_level_id || null,
          role: 'student',
        },
        { onConflict: 'id' }
      );
      if (profileError) return fail(profileError.message);

      setSaving(false);
      setModalOpen(false);
      await loadData();
      return;
    }

    const payload = {
      full_name: form.full_name.trim(),
      phone: form.phone.trim() || null,
      grade_level_id: form.grade_level_id || null,
    };
    if (isSuper) payload.role = form.role || 'student'; /* الدور للمدير الأعلى بس */

    const { error } = await supabase.from('profiles').update(payload).eq('id', editing.id);
    if (error) return fail(error.message);

    setSaving(false);
    setModalOpen(false);
    await loadData();
  }

  async function handleDelete(student) {
    if (!confirm(`متأكد إنك عايز تحذف "${student.full_name}"؟ الحذف نهائي.`)) return;
    await supabase.from('subscriptions').delete().eq('student_id', student.id);
    await supabase.from('messages').delete().eq('sender_id', student.id);
    await supabase.from('course_ratings').delete().eq('student_id', student.id);
    await supabase.from('lesson_progress').delete().eq('student_id', student.id);
    const { error } = await supabase.from('profiles').delete().eq('id', student.id);
    if (error) {
      alert('❌ ' + error.message);
      return;
    }
    await loadData();
  }

  async function toggleBlocked(student) {
    const next = !student.is_blocked;
    const ok = confirm(
      next
        ? `قفل حساب "${student.full_name}"؟ مش هيقدر يشوف الكورسات لحد ما تفتحه تاني.`
        : `فتح حساب "${student.full_name}"؟`
    );
    if (!ok) return;
    const { error } = await supabase.rpc('set_account_blocked', { p_user: student.id, p_blocked: next });
    if (error) {
      alert(
        /set_account_blocked|function|schema cache/i.test(error.message || '')
          ? '❌ لازم تشغّل ملف payments.sql في Supabase مرة واحدة الأول'
          : '❌ ' + error.message
      );
      return;
    }
    setStudents((list) => list.map((s) => (s.id === student.id ? { ...s, is_blocked: next } : s)));
  }

  const levelName = (id) => levels.find((l) => String(l.id) === String(id))?.name_ar || '—';

  const q = search.toLowerCase();
  const filtered = students.filter(
    (s) =>
      (s.full_name || '').toLowerCase().includes(q) ||
      (s.phone || '').includes(search) ||
      levelName(s.grade_level_id).toLowerCase().includes(q)
  );

  return (
    <>
      <AdminToolbar
        title="الطلاب والاشتراكات"
        count={students.length}
        search={search}
        onSearch={setSearch}
        placeholder="ابحث بالاسم أو الهاتف..."
        addLabel="إضافة طالب"
        onAdd={isSuper ? openAddModal : undefined}
      />

      <div className="table-wrap stack">
        <table>
          <thead>
            <tr>
              <th>الاسم</th>
              <th>الهاتف</th>
              <th>المرحلة</th>
              <th>الاشتراك</th>
              <th>الحساب</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            <StateRow colSpan={6} loading={loading} />
            <StateRow colSpan={6} empty={!loading && filtered.length === 0} text={search ? 'مفيش نتايج' : 'لسه مفيش طلاب'} />
            {!loading &&
              filtered.map((s) => {
                const st = subState(s.id);
                return (
                  <tr key={s.id} className={s.is_blocked ? 'row-blocked' : ''}>
                    <td data-label="الاسم">
                      <div className="cell-course">
                        <span className="avatar-dot">{(s.full_name || '?').trim().charAt(0)}</span>
                        <b>{s.full_name}</b>
                      </div>
                    </td>
                    <td data-label="الهاتف" dir="ltr" className="num-cell">{s.phone || '—'}</td>
                    <td data-label="المرحلة"><span className="level-chip">{levelName(s.grade_level_id)}</span></td>
                    <td data-label="الاشتراك"><span className={`badge ${st.cls}`}>{st.text}</span></td>
                    <td data-label="الحساب">
                      <span className={`badge ${s.is_blocked ? 'expired' : 'active'}`}>{s.is_blocked ? '🔒 مقفول' : 'مفتوح'}</span>
                    </td>
                    <td data-label="إجراءات">
                      <RowActions>
                        <button className="icon-btn primary" onClick={() => setSubscriptionStudent(s)}>💳 الاشتراك</button>
                        <button className="icon-btn" onClick={() => setReceiptsStudent(s)} title="صور التحويل" aria-label="صور التحويل">🧾 <span className="only-mobile">التحويلات</span></button>
                        <button
                          className={`icon-btn${s.is_blocked ? '' : ' danger'}`}
                          onClick={() => toggleBlocked(s)}
                          title={s.is_blocked ? 'فتح الحساب' : 'قفل الحساب'}
                        >
                          {s.is_blocked ? '🔓 فتح' : '🔒 قفل'}
                        </button>
                        <button className="icon-btn" onClick={() => openEditModal(s)} aria-label="تعديل">✏️ <span className="only-mobile">تعديل</span></button>
                        {isSuper && (
                          <button className="icon-btn danger" onClick={() => handleDelete(s)} aria-label="حذف">🗑️</button>
                        )}
                      </RowActions>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <AdminFormModal
        open={modalOpen}
        title={editing ? 'تعديل بيانات طالب' : 'إضافة طالب جديد'}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        loading={saving}
      >
        <div className="field">
          <label>الاسم الكامل</label>
          <input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
        </div>
        {!editing && (
          <>
            <div className="field">
              <label>الإيميل</label>
              <input type="email" dir="ltr" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="field">
              <label>كلمة المرور</label>
              <input type="text" dir="ltr" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={6} required />
              <small className="hint">ظاهرة عشان تقدر تبعتها للطالب (6 حروف على الأقل).</small>
            </div>
          </>
        )}
        <div className="field">
          <label>رقم الهاتف</label>
          <input type="tel" dir="ltr" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div className="field">
          <label>المرحلة</label>
          <select value={form.grade_level_id} onChange={(e) => setForm({ ...form, grade_level_id: e.target.value })}>
            <option value="">— اختار مرحلة —</option>
            {levels.map((lv) => (
              <option key={lv.id} value={lv.id}>{lv.name_ar}</option>
            ))}
          </select>
        </div>
        {editing && isSuper && (
          <div className="field">
            <label>الدور</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="student">🎓 طالب</option>
              <option value="support">🛠️ دعم فني</option>
              <option value="owner">👩‍🏫 ميس</option>
              <option value="superadmin">👑 مدير أعلى</option>
            </select>
          </div>
        )}
        {msg.text && <div className={`form-msg ${msg.type}`}>{msg.text}</div>}
      </AdminFormModal>

      {subscriptionStudent && (
        <SubscriptionForm
          student={subscriptionStudent}
          onClose={() => {
            setSubscriptionStudent(null);
            loadData();
          }}
        />
      )}

      {receiptsStudent && <StudentReceipts student={receiptsStudent} onClose={() => setReceiptsStudent(null)} />}
    </>
  );
}

export default AdminStudents;