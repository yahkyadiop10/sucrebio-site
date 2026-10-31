// Enregistre dans Neon les envois des formulaires du site (contact et demande de distribution).
// Variable d'environnement Vercel : DATABASE_URL (rôle Neon « site_web », droit INSERT uniquement).
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

const txt = (v, max) => {
  if (typeof v !== 'string') return null;
  const s = v.trim().slice(0, max);
  return s || null;
};
const SUJETS = ['commande', 'distributeur', 'produit', 'partenariat'];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false });
  }
  // N'accepter que les envois venant du site lui-même.
  const origin = req.headers.origin;
  if (origin && new URL(origin).host !== req.headers.host) return res.status(403).json({ ok: false });

  const b = typeof req.body === 'object' && req.body ? req.body : {};
  if (b._hp) return res.status(200).json({ ok: true }); // champ piège rempli : robot, on ignore

  const langue = b.langue === 'en' ? 'en' : 'fr';
  const nom = txt(b.name, 120), telephone = txt(b.phone, 40), email = txt(b.email, 200), message = txt(b.message, 5000);
  if (!nom || nom.length < 2 || !telephone || telephone.length < 6) return res.status(400).json({ ok: false });

  try {
    if (b.formulaire === 'contact') {
      const sujet = SUJETS.includes(b.subject) ? b.subject : 'autre';
      if (!message || message.length < 10) return res.status(400).json({ ok: false });
      await sql`INSERT INTO messages_contact (nom, telephone, email, sujet, message, langue)
                VALUES (${nom}, ${telephone}, ${email}, ${sujet}, ${message}, ${langue})`;
    } else if (b.formulaire === 'distributeur') {
      const commerce = txt(b.business, 160), type = txt(b.type, 60), ville = txt(b.city, 120);
      if (!commerce || !type || !ville) return res.status(400).json({ ok: false });
      await sql`INSERT INTO demandes_distributeur (nom, commerce, type, ville, telephone, email, message, langue)
                VALUES (${nom}, ${commerce}, ${type}, ${ville}, ${telephone}, ${email}, ${message}, ${langue})`;
    } else {
      return res.status(400).json({ ok: false });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Enregistrement Neon impossible :', err.message);
    return res.status(500).json({ ok: false });
  }
}
