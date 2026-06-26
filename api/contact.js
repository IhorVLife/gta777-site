const ALLOWED_ORIGINS = [
  'https://www.trojanfleet.sk',
  'https://trojanfleet.sk',
  'https://gta777-site.vercel.app',
];

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const origin = req.headers.origin || '';
  const isAllowed = ALLOWED_ORIGINS.some(o => origin === o) ||
    origin.endsWith('.vercel.app');
  if (!isAllowed) return res.status(403).json({ ok: false, error: 'Forbidden' });

  res.setHeader('Access-Control-Allow-Origin', origin);

  const { name, phone, msg } = req.body || {};

  if (!name || !phone) {
    return res.status(400).json({ ok: false, error: 'Name and phone are required' });
  }
  if (String(name).length > 100 || String(phone).length > 30 || String(msg || '').length > 1000) {
    return res.status(400).json({ ok: false, error: 'Input too long' });
  }

  const safeName  = escapeHtml(name);
  const safePhone = escapeHtml(phone);
  const safeMsg   = msg ? escapeHtml(msg) : '';

  const text = `📋 <b>Заявка с сайта Trojan Fleet</b>\n\n👤 <b>Имя:</b> ${safeName}\n📱 <b>Телефон:</b> ${safePhone}${safeMsg ? '\n💬 <b>Сообщение:</b> ' + safeMsg : ''}`;

  try {
    const r = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text, parse_mode: 'HTML' }),
      }
    );
    if (!r.ok) return res.status(500).json({ ok: false });
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false });
  }
}
