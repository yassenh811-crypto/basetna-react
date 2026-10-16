/* ============================================================
   ⚙️ AdminSettings — إعدادات الموقع
   ============================================================ */
import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';

const COUNTRIES = [
  { dial: '20', ar: 'مصر' },
  { dial: '966', ar: 'السعودية' },
  { dial: '971', ar: 'الإمارات' },
  { dial: '965', ar: 'الكويت' },
  { dial: '974', ar: 'قطر' },
  { dial: '973', ar: 'البحرين' },
  { dial: '968', ar: 'عُمان' },
  { dial: '962', ar: 'الأردن' },
  { dial: '961', ar: 'لبنان' },
  { dial: '963', ar: 'سوريا' },
  { dial: '964', ar: 'العراق' },
];

function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const [ownerName, setOwnerName] = useState('');
  const [countryDial, setCountryDial] = useState('20');
  const [whatsapp, setWhatsapp] = useState('');

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from('settings').select('*').eq('id', 1).maybeSingle();

      if (error) {
        console.error('❌', error);
        setLoading(false);
        return;
      }

      if (data) {
        setOwnerName(data.owner_name || '');
        const full = data.whatsapp_number || '';
        const matched = COUNTRIES.slice()
          .sort((a, b) => b.dial.length - a.dial.length)
          .find((c) => full.startsWith(c.dial));
        if (matched) {
          setCountryDial(matched.dial);
          setWhatsapp(full.slice(matched.dial.length));
        } else {
          setWhatsapp(full);
        }
      }
      setLoading(false);
    }
    load();
  }, []);

  function fullPhone() {
    const local = whatsapp.replace(/\D/g, '').replace(/^0+/, '');
    if (!local) return '';
    return countryDial + local;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMsg({ text: '', type: '' });

    const payload = {
      owner_name: ownerName.trim() || 'ms. sherehan ali',
      whatsapp_number: fullPhone() || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('settings').update(payload).eq('id', 1);
    setSaving(false);

    if (error) {
      setMsg({ text: '❌ ' + error.message, type: 'error' });
      return;
    }

    setMsg({ text: '✅ تم الحفظ بنجاح', type: 'ok' });
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  }

  if (loading) {
    return (
      <div className="skeleton-list" style={{ maxWidth: 560 }}><span /><span /><span /></div>
    );
  }

  const phone = fullPhone();

  return (
    <>
      <div className="dash-head">
        <h1>⚙️ الإعدادات</h1>
      </div>

      <div className="settings-grid">
        <div className="card settings-card">
          <h3>بيانات الموقع</h3>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>اسم الأونر</label>
              <input type="text" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="ms. sherehan ali" />
            </div>

            <div className="field">
              <label>رقم واتساب</label>
              <div className="phone-row">
                <select value={countryDial} onChange={(e) => setCountryDial(e.target.value)}>
                  {COUNTRIES.map((c) => (
                    <option key={c.dial} value={c.dial}>+{c.dial} — {c.ar}</option>
                  ))}
                </select>
                <input type="tel" dir="ltr" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="10XXXXXXXX" inputMode="numeric" />
              </div>
              <small className="hint">
                الرقم الكامل: <b dir="ltr">+{phone || '—'}</b>
                {phone && (
                  <>
                    {' · '}
                    <a href={`https://wa.me/${phone}`} target="_blank" rel="noopener noreferrer" className="link-chip">جرّب الرقم ↗</a>
                  </>
                )}
              </small>
            </div>

            <button className="btn btn-teal btn-block" type="submit" disabled={saving}>
              {saving ? 'جاري الحفظ...' : '💾 حفظ'}
            </button>

            {msg.text && <div className={`form-msg ${msg.type}`}>{msg.text}</div>}
          </form>
        </div>

        <div className="card settings-card info">
          <h3>ℹ️ بتظهر فين؟</h3>
          <ul>
            <li><b>اسم الأونر:</b> في الفوتر وصفحات الموقع.</li>
            <li><b>رقم واتساب:</b> في زرار الواتساب العائم وفي روابط الاشتراك.</li>
          </ul>
        </div>
      </div>
    </>
  );
}

export default AdminSettings;