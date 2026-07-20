# coconut.nc

Site vitrine de l'agence digitale **coconut.nc** (Nouméa, Nouvelle-Calédonie).

- Front : `index.html` (HTML/CSS/JS vanilla, un seul fichier)
- Back : `api/contact.js` — fonction serverless Vercel qui envoie les demandes du
  formulaire de contact par email via [Resend](https://resend.com).
- Hébergement : Vercel (projet `coconut.nc`)

## Formulaire de contact

Le formulaire poste en JSON vers `/api/contact`. La fonction valide les champs,
filtre les bots (champ honeypot `company`) et envoie un email à **contact@coconut.nc**
(le `reply-to` est l'adresse du visiteur, donc tu peux répondre directement).

### Mise en service (à faire une fois)

1. **Créer un compte Resend** → https://resend.com
2. **Vérifier le domaine `coconut.nc`** dans Resend (Domains → Add Domain).
   Resend fournit des enregistrements **DNS** (SPF, DKIM, éventuellement DMARC)
   à ajouter chez le registrar / la zone DNS du domaine. Sans domaine vérifié,
   l'envoi depuis `formulaire@coconut.nc` échouera.
   - Tant que le domaine n'est pas vérifié, tu peux tester en remplaçant
     l'expéditeur par `onboarding@resend.dev` dans `api/contact.js` (`FROM`).
3. **Créer une clé API** dans Resend (API Keys → Create).
4. **Ajouter la clé dans Vercel** : Project Settings → Environment Variables →
   nom `RESEND_API_KEY`, valeur = la clé. Applique-la à Production (et Preview).
5. **Redéployer** le projet pour que la variable et la dépendance `resend`
   soient prises en compte.

### Développement local (optionnel)

```bash
npm install
npx vercel dev        # sert le site + les fonctions /api en local
```

Crée un fichier `.env.local` (non commité) avec `RESEND_API_KEY=...` pour tester
l'envoi en local.

### Adresses / expéditeur

Ces valeurs sont en haut de `api/contact.js` :

- `TO`   → `contact@coconut.nc` (destinataire des demandes)
- `FROM` → `formulaire@coconut.nc` (doit être sur le domaine vérifié Resend)
