# Migration Vite → Next.js et notes de dev

Ce document trace **quoi a bougé pourquoi** entre le scaffold Vite initial et cette version
Next.js, plus les décisions produit qu'on a prises ensemble et qui sont maintenant encodées
dans le code.

## Migration de fond

| Avant (Vite)                                    | Après (Next 15 App Router)                                    |
| ----------------------------------------------- | ------------------------------------------------------------- |
| `src/App.tsx` + `react-router-dom`              | `src/app/` (routing par fichiers)                             |
| `src/main.tsx`                                  | `src/app/layout.tsx` (Server Component)                       |
| AuthProvider dans main.tsx                      | `src/app/providers.tsx` (`'use client'`)                      |
| Fonts Google chargées dans index.html           | `next/font/google` (Caprasimo + Figtree, self-hosted)         |
| Styles inline partout                           | CSS Modules colocalisés à chaque composant                    |
| `contentEditable` + `document.execCommand`      | TipTap (JSON blocs, exposition de l'editor via onReady)       |
| `features/editor/` + `features/journal/`        | `features/posts/` (nouveau) + `features/daily-note/` (renommé) |
| `useState(() => localStorage.getItem(...))`     | `useState(default)` + lecture dans `useEffect` (SSR safe)     |
| `HomePage` séparée                              | `/{username}/portfolio` — modèle fusionné                     |

## Renommages importants

- Feature `journal/` → `daily-note/`. Motif : le mot "Journal" est maintenant utilisé pour un
  onglet du blog (contenant les posts kind='journal'). Garder l'ancien nom aurait été source
  de confusion permanente entre "la note du jour" (petit textarea éphémère) et "un post de
  journal" (publication à part entière avec titre, contenu riche, visibilité).
- Feature `editor/` → dossier `features/posts/components/PostEditor/`. Motif : l'éditeur n'est
  qu'un composant parmi d'autres de la feature `posts` (à côté de PostCard, PostGrid, etc.).
- Type `User` : ajout du champ `username`. Motif : c'est la clé de l'URL `/{username}`.
  Pour le MVP mock, on le dérive de l'email (partie avant `@`) — voir `useAuth.tsx`.

## Décisions produit encodées

### Privé par défaut

- Champ `visibility: 'private' | 'public'` dans le type `Post`, valeur par défaut `'private'`
  dans `postsRepository.create`.
- Filtre appliqué dans les pages `/{username}/portfolio` et `/{username}/journal` :
  `posts.filter(p => p.visibility === 'public')` quand le visiteur n'est pas le propriétaire.
- Garde-fou aussi sur `/{username}/p/[postId]` : si le post est privé et l'utilisateur pas
  owner, on affiche "Publication introuvable" (indistinguable d'un vrai 404, pour ne pas
  révéler l'existence).

### Modèle fusionné

- Une seule URL `/{username}` par blog.
- Hook `useIsOwner(username)` fournit l'unique flag qui pilote tout : bouton "Ajouter" visible
  ou pas, badges de visibilité, mode édition/lecture de l'éditeur, DailyNoteCard visible ou pas.
- Le PostEditor reste EXACTEMENT le même composant en mode édition et en mode lecture, avec
  `editable` piloté par le prop. Zéro divergence de rendu possible.

### URL path-based, migration vers subdomain prévue

- MVP actuel : `tonblog.com/{username}`, géré par la route dynamique `[username]`.
- Migration prévue : `{username}.tonblog.com` via un middleware Next.js qui réécrit l'URL
  vers `/{username}` en interne + wildcard DNS + certificat SSL wildcard.
- Redirection 301 des anciens paths vers les nouveaux sous-domaines à mettre en place le
  jour de la migration pour ne casser aucun lien partagé.

### Username modifiable + redirect auto + réserve 90 jours

- Pas encore implémenté (nécessite un backend). Décidé.
- Modèle BDD prévu :
  - `users(id, username, email, ...)` — index unique case-insensitive sur `username`.
  - `username_history(old_username, user_id, changed_at, reserved_until)` — index unique sur
    `old_username`.
- Résolution : middleware vérifie `users` puis `username_history`, 301 si trouvé dans
  l'historique et non expiré, 404 sinon.

### Éditeur JSON structuré (TipTap), pas de HTML

- `Post.content` est un `JSONContent` (format TipTap / ProseMirror).
- Le HTML n'est produit qu'à l'affichage, jamais stocké. Ça évite les problèmes classiques
  de nettoyage / XSS / paste depuis Word / etc.
- Deux utils dérivent des champs annexes à chaque save (`computeExcerpt`, `findCoverImage`)
  pour peupler `excerpt` et `coverMediaPath` — sert aux cards de la home sans avoir à parser
  le doc à chaque render.

### Autosave debounced 1500 ms

- `usePost.scheduleSave()` remplace le timer précédent à chaque appel — même pattern que le
  debounce des inputs de recherche (300 ms) mais avec une fenêtre plus longue adaptée à l'écriture.
- Le nettoyage du timer est fait dans un useEffect cleanup pour ne pas fuiter à l'unmount.

### "Il y a un an aujourd'hui"

- Composant `OneYearAgoCard` : cherche dans les posts fournis le premier créé il y a ≥ 350 jours
  ET le même jour de l'année (mois + jour) qu'aujourd'hui.
- Si trouvé : petite card verte discrète en haut de l'onglet Portfolio.
- Si rien : `return null`, aucune trace. L'utilisateur n'a jamais un espace vide dédié à ça.

## Points d'attention SSR

Le rendu serveur de Next crée deux pièges qu'on a réglés une fois pour toutes :

1. **Hydratation localStorage.** Interdit d'appeler `localStorage.getItem` dans un `useState`
   initializer — il tourne côté serveur où `window` n'existe pas. Solution : `lib/storage.ts`
   no-op côté serveur, et tous les hooks (`useAuth`, `useDailyNote`, `useAmbientMusic`) font
   la lecture dans un `useEffect`. Léger flash "état vide" au premier paint, corrigible plus
   tard avec un skeleton si besoin.

2. **TipTap SSR.** L'éditeur doit avoir `immediatelyRender: false` dans `useEditor()`. Sans ça,
   TipTap essaie de rendre côté serveur et casse l'hydratation. Documenté dans PostEditor.

## Ce qui reste à faire dans l'ordre

1. Vérifier que `npm install && npm run dev` tourne sans erreur.
2. Tester le flow complet : inscription → onglet Portfolio → ajouter un post → écrire, insérer
   une image (URL), publier → se déconnecter → visiter la même URL, vérifier que le post public
   apparaît et le privé non.
3. Design de l'écran d'inscription : demander explicitement le username plutôt que de le dériver.
4. Upload d'images natif (aujourd'hui `prompt()` pour l'URL).
5. Câbler Supabase :
   - Créer un projet Supabase, récupérer les clés.
   - Schéma BDD à partir des types (users, posts, username_history, media).
   - Remplacer `localStoragePostsRepository` par une impl Supabase (interface `PostsRepository`
     déjà en place, donc changement minimal).
   - Remplacer les corps de `authenticate` et `logout` dans `useAuth` par les calls Supabase.
