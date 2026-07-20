import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Adresse qui reçoit les demandes du formulaire
const TO = 'contact@coconut.nc';
// Expéditeur : doit être sur un domaine vérifié dans Resend (voir README.md)
const FROM = 'Formulaire coconut.nc <formulaire@coconut.nc>';

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Méthode non autorisée.' });
  }

  try {
    const { name, email, phone, type, message, company } = req.body || {};

    // Honeypot : si ce champ caché est rempli, c'est un bot.
    // On renvoie un succès factice pour ne pas l'alerter.
    if (company) {
      return res.status(200).json({ ok: true });
    }

    // Validation des champs obligatoires
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Merci de remplir les champs obligatoires.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Adresse email invalide.' });
    }

    const subject = `Nouvelle demande — ${type || 'Contact'} — ${name}`;

    const text =
      `Nouvelle demande depuis coconut.nc\n\n` +
      `Nom     : ${name}\n` +
      `Email   : ${email}\n` +
      `Tél     : ${phone || '—'}\n` +
      `Type    : ${type || '—'}\n\n` +
      `Message :\n${message}\n`;

    const html = `
      <div style="font-family:system-ui,Arial,sans-serif;max-width:560px;margin:auto;color:#1a1a1a">
        <h2 style="color:#0A5C55;margin:0 0 16px">Nouvelle demande depuis coconut.nc</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:6px 0;color:#777;width:90px">Nom</td><td style="padding:6px 0"><strong>${escapeHtml(name)}</strong></td></tr>
          <tr><td style="padding:6px 0;color:#777">Email</td><td style="padding:6px 0"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
          <tr><td style="padding:6px 0;color:#777">Téléphone</td><td style="padding:6px 0">${escapeHtml(phone || '—')}</td></tr>
          <tr><td style="padding:6px 0;color:#777">Type</td><td style="padding:6px 0">${escapeHtml(type || '—')}</td></tr>
        </table>
        <div style="margin-top:16px;padding:16px;background:#f5f7f6;border-radius:8px;white-space:pre-wrap">${escapeHtml(message)}</div>
      </div>`;

    const { error } = await resend.emails.send({
      from: FROM,
      to: [TO],
      replyTo: email,
      subject,
      text,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(502).json({ error: "Échec de l'envoi. Réessayez plus tard." });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
}
