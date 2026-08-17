# yourgarden

Un blog personnel privé par défaut. Pas de likes, pas d'algorithme, pas d'audience à impressionner.

## Setup

```bash
npm install
npm run dev
```

Ouvre http://localhost:3000.

Requis : Node ≥ 20.

## Architecture

```
src/
├── app/                       Routes Next 15 (App Router)
│   ├── layout.tsx             Fonts + providers globaux
│   ├── page.tsx               Landing (AuthPage) ou redirect vers /{username}
│   ├── providers.tsx          AuthProvider + QueryClientProvider (client)
│   ├── globals.css            Design tokens + resets
│   └── (blog)/[username]/
│       ├── layout.tsx         BlogHeader + MusicToggle
│       ├── page.tsx           Le blog : grille de publications + DailyNoteCard en aside
│       └── p/[postId]/        Éditeur ou lecture d'une publication
│
├── components/ui/             Primitives partagées (Button, Card, Input, Avatar, Tag, Spacer)
│
├── features/
│   ├── auth/                  Session + AuthPage
│   ├── blog/                  Header, AddButton, useIsOwner
│   ├── daily-note/            Carnet du jour (bloc texte du jour, écrasé à chaque frappe)
│   ├── posts/                 Publications : PostEditor (TipTap), PostCard, PostGrid, hooks, repository
│   └── ambient/               MusicToggle décoratif
│
└── lib/                       storage.ts (localStorage safe SSR), dates.ts
```

Conventions :
- Feature-based en haut (`features/`), atomic pour les primitives (`components/ui/`).
- Chaque composant vit dans son dossier avec son CSS Module et ses utils colocalisés.
- Arrow functions partout (`const MyComp = () =>`).
- Barrel `index.ts` par feature.
- Mobile-first : styles par défaut mobile, media queries `@media (min-width: 640px)` pour élargir.
- TypeScript strict, unions strictes pour les enum-like, aucun `any`.

## Décisions produit encodées dans ce scaffold

Toutes discutées en amont (voir MIGRATION.md pour la trace détaillée).

- **Privé par défaut.** Un post créé est `visibility: 'private'`. Un visiteur ne le voit pas. "Publier" bascule en `public`.
- **Modèle fusionné.** Une seule page `/{username}`, deux états selon `useIsOwner`. Pas de dashboard séparé.
- **URL path-based.** `tonblog.com/{username}` pour le MVP. Migration vers `{username}.tonblog.com` planifiée avec middleware + wildcard DNS (voir MIGRATION.md).
- **Username modifiable + redirect auto + réserve 90 jours** — à implémenter côté BDD quand Supabase arrivera.
- **Éditeur TipTap.** Le contenu d'un post est un `JSONContent` structuré en blocs, jamais du HTML brut. Léger, propre, extensible.
- **Autosave debounced 1500 ms.** Aucun bouton "Enregistrer".
- **"Il y a un an aujourd'hui"** — card douce sur la home si un post existe à la même date l'année précédente. Rétention sans mécanique toxique.

## Ce qui n'est PAS implémenté (volontairement)

- Backend réel (auth + BDD). Tout est mocké en localStorage. Prochain jalon : Supabase.
- Upload d'images. La toolbar demande une URL avec `prompt()`.
- Recherche full-text.
- Notifications, likes, followers — jamais.

## Prochaine étape recommandée

1. `npm install && npm run dev`, vérifier que ça tourne.
2. S'inscrire (n'importe quel email/password), ajouter un post, le rendre public, se déconnecter, revisiter `/{username}` en tant que "visiteur" (autre session).
3. Décider avec l'équipe (toi + moi) le schéma BDD Supabase à partir des types dans `features/posts/types.ts`.
