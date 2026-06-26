export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { name, phone, msg } = req.body || {};
  const text = `📋 <b>Заявка с сайта Trojan Fleet</b>\n\n👤 <b>Имя:</b> ${name || '—'}\n📱 <b>Телефон:</b> ${phone || '—'}${msg ? '\n💬 <b>Сообщение:</b> ' + msg : ''}`;

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
